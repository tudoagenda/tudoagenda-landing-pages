import { isIP } from "net";
import { resolveClientIp } from "@/lib/server/client-ip";
import { buildLandingHeaders, getBackendApiUrl } from "@/lib/server/landing-backend";
import { SOURCE_URL_PARAMS } from "@/lib/analytics/storeClickBeacon";
import { LANDING_LOJAS } from "@/config/landing-lojas";

/**
 * Clique na loja pelo servidor (API de Conversões da Meta).
 *
 * O navegador manda um beacon a cada `store_click` (storeClickBeacon.ts), com
 * o mesmo `event_id` que foi ao dataLayer. Esta rota confere o corpo, junta o
 * que só o servidor enxerga (cookies `_fbp`/`_fbc`, IP e User-Agent da
 * visitante) e repassa ao backend: `POST /tracking/web-events`.
 *
 * Respostas:
 *  - 204 sempre que o corpo é válido, mesmo com o backend fora, lento ou
 *    respondendo erro (nada do backend vaza para o navegador).
 *  - 400 corpo inválido · 403 pedido de outra origem · 413 corpo grande.
 *  - Outros métodos: 405 (o Next responde; só POST é exportado).
 *
 * Sem dado pessoal: nada de e-mail, telefone ou nome, e o IP nunca é logado.
 */

const MAX_BODY_CHARS = 4096;
const MAX_URL_CHARS = 2000;
/** O beacon não espera a resposta; o teto só evita pedido pendurado no servidor. */
const BACKEND_TIMEOUT_MS = 5_000;

const PROD_HOSTS = ["tudoagenda.com.br", "www.tudoagenda.com.br"];
const PROD_ORIGINS = PROD_HOSTS.map((h) => `https://${h}`);
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];
const PROD_BACKEND_HOST = "api.agendabela.tudoagenda.com.br";

const STORES = ["app_store", "google_play"] as const;
const DEVICES = ["ios", "android", "desktop"] as const;
const IN_APP = ["instagram", "facebook", "none"] as const;
/**
 * landing_slug de toda página do Agenda Bela que tem link de loja: as
 * landings de loja (da config) e os slugs fixos dos helpers de dataLayer.ts.
 * Página nova com link de loja entra aqui, senão o clique dela é recusado.
 */
const LANDING_SLUGS: readonly string[] = [
  ...Object.values(LANDING_LOJAS).map((c) => c.slug),
  "automatize-seu-atendimento",
  "experimente",
  "reativacao",
];

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CTA_LOCATION = /^[a-z0-9_]{1,64}$/;
const FBCLID = /^[A-Za-z0-9_-]{1,500}$/;
/**
 * Cookies `_fbp` / `_fbc`: `fb.<índice>.<epoch ms>.<valor>`. Mesmo formato
 * que o backend exige; cookie fora dele é só deixado de fora (se fosse
 * repassado, o backend recusaria o clique inteiro).
 */
const FB_COOKIE = /^fb\.[0-9]\.[0-9]{10,13}\.[A-Za-z0-9_.-]{1,500}$/;
const FBP_MAX = 200;

type ValidEvent = {
  event_id: string;
  store: (typeof STORES)[number];
  cta_location: string;
  device_os: (typeof DEVICES)[number];
  in_app_browser: (typeof IN_APP)[number];
  landing_slug: string;
  event_source_url: string;
  fbclid: string | null;
  local: boolean;
};

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/**
 * Página do Agenda Bela em tudoagenda.com.br (fora de produção, também
 * localhost). Devolve a URL só com os parâmetros de origem da visita.
 */
function parseSourceUrl(value: unknown): { href: string; local: boolean } | null {
  if (typeof value !== "string" || value.length > MAX_URL_CHARS) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  if (!url.pathname.startsWith("/agendabela/")) return null;
  // Só a origem da visita segue na query; o resto (e o #) é descartado.
  const kept = new URLSearchParams();
  for (const key of SOURCE_URL_PARAMS) {
    const v = url.searchParams.get(key);
    if (v) kept.set(key, v);
  }
  url.search = kept.toString();
  url.hash = "";
  if (url.protocol === "https:" && !url.port && PROD_HOSTS.includes(url.hostname)) {
    return { href: url.href, local: false };
  }
  if (
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    LOCAL_HOSTS.includes(url.hostname)
  ) {
    return { href: url.href, local: true };
  }
  return null;
}

function validate(body: unknown): ValidEvent | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const source = parseSourceUrl(b.event_source_url);
  if (!source) return null;
  if (typeof b.event_id !== "string" || !UUID_V4.test(b.event_id)) return null;
  if (!oneOf(STORES, b.store)) return null;
  if (!oneOf(DEVICES, b.device_os)) return null;
  if (!oneOf(IN_APP, b.in_app_browser)) return null;
  if (typeof b.landing_slug !== "string" || !LANDING_SLUGS.includes(b.landing_slug)) return null;
  if (typeof b.cta_location !== "string" || !CTA_LOCATION.test(b.cta_location)) return null;
  // fbclid fora do formato não derruba o clique: só fica sem fbc.
  const fbclid = typeof b.fbclid === "string" && FBCLID.test(b.fbclid) ? b.fbclid : null;
  return {
    event_id: b.event_id.toLowerCase(),
    store: b.store,
    cta_location: b.cta_location,
    device_os: b.device_os,
    in_app_browser: b.in_app_browser,
    landing_slug: b.landing_slug,
    event_source_url: source.href,
    fbclid,
    local: source.local,
  };
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) {
      const raw = part.slice(eq + 1).trim();
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

/**
 * IP da visitante para a Meta casar o clique com a pessoa.
 *
 * Primeiro o mesmo `resolveClientIp` das outras rotas. Em produção ele devolve
 * "sem IP" de propósito enquanto o segredo de origem do CloudFront não está
 * configurado (lá o IP decide limite de tentativas e não pode ser forjado).
 * Aqui o IP é só um sinal de correspondência: quem forja o cabeçalho piora o
 * casamento do próprio clique e nada mais. Então, atrás do CloudFront, vale a
 * penúltima entrada do X-Forwarded-For mesmo sem o segredo: é a que o
 * CloudFront acrescentou (a última é o nó do CloudFront, posto pelo Railway;
 * as mais à esquerda vêm do navegador). Ver client-ip.ts.
 */
function visitorIp(headers: Headers): string | null {
  const resolved = resolveClientIp(headers);
  if (resolved.ip) return resolved.ip;
  if (!resolved.viaCloudFront) return null;
  const xff = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const candidate = xff.length >= 2 ? xff[xff.length - 2] : null;
  return candidate && isIP(candidate) !== 0 ? candidate : null;
}

/**
 * Com cabeçalho Origin, ele tem que ser de uma página nossa. Sem o cabeçalho
 * ou com "null" (navegador que esconde a origem), o pedido segue: o filtro é
 * contra página de outro site, não uma autenticação.
 */
function foreignOrigin(req: Request): boolean {
  const origin = req.headers.get("origin")?.trim();
  if (!origin || origin === "null") return false;
  if (PROD_ORIGINS.includes(origin)) return false;
  if (process.env.NODE_ENV === "production") return true;
  try {
    const url = new URL(origin);
    return !(url.protocol === "http:" && LOCAL_HOSTS.includes(url.hostname));
  } catch {
    return true;
  }
}

/** Página aberta em localhost nunca manda clique para o backend de produção. */
function localAgainstProduction(event: ValidEvent): boolean {
  return event.local && getBackendApiUrl().includes(PROD_BACKEND_HOST);
}

const noContent = () => new Response(null, { status: 204 });
const refuse = (status: number) => new Response(null, { status });

export async function POST(req: Request) {
  if (foreignOrigin(req)) return refuse(403);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_CHARS) return refuse(413);

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return refuse(400);
  }
  if (raw.length > MAX_BODY_CHARS) return refuse(413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return refuse(400);
  }
  const event = validate(parsed);
  if (!event) return refuse(400);

  if (localAgainstProduction(event)) return noContent();

  const cookieFbp = readCookie(req, "_fbp");
  const cookieFbc = readCookie(req, "_fbc");
  const fbp =
    cookieFbp && cookieFbp.length <= FBP_MAX && FB_COOKIE.test(cookieFbp) ? cookieFbp : null;
  const fbc =
    cookieFbc && FB_COOKIE.test(cookieFbc)
      ? cookieFbc
      : event.fbclid
        ? `fb.1.${Date.now()}.${event.fbclid}`
        : null;
  const clientIp = visitorIp(req.headers);
  // Sem caractere de controle (o backend recusa) e no tamanho que ele aceita.
  const userAgent =
    (req.headers.get("user-agent") ?? "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .trim()
      .slice(0, 512) || null;

  const payload = {
    event_name: "StoreClick",
    event_id: event.event_id,
    event_source_url: event.event_source_url,
    custom_data: {
      store: event.store,
      landing_slug: event.landing_slug,
      cta_location: event.cta_location,
      device_os: event.device_os,
      in_app_browser: event.in_app_browser,
    },
    user: {
      ...(fbp ? { fbp } : {}),
      ...(fbc ? { fbc } : {}),
      ...(clientIp ? { client_ip: clientIp } : {}),
      ...(userAgent ? { user_agent: userAgent } : {}),
    },
  };

  try {
    const response = await fetch(`${getBackendApiUrl()}/tracking/web-events`, {
      method: "POST",
      headers: buildLandingHeaders(req, "web-event"),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(JSON.stringify({ msg: "landing_web_event_falhou", status: response.status }));
    }
  } catch (error) {
    console.warn(
      JSON.stringify({
        msg: "landing_web_event_falhou",
        erro: error instanceof Error ? error.name : "erro",
      }),
    );
  }
  return noContent();
}
