import { createHash, timingSafeEqual } from "crypto";
import { isIP } from "net";

/**
 * IP da cliente que chegou na landing, para o `X-Client-IP` do backend.
 *
 * Caminho em produção: navegador → CloudFront (tudoagenda.com.br) → edge do
 * Railway → Next. Em staging / domínio do Railway direto: navegador → edge do
 * Railway → Next.
 *
 * - CloudFront: "If a viewer sends a request to CloudFront and includes an
 *   X-Forwarded-For request header, CloudFront gets the IP address of the
 *   viewer from the TCP connection, appends it to the end of the
 *   X-Forwarded-For header" (sem o cabeçalho, cria um só com esse IP).
 *   https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html
 * - Railway: grava `X-Real-IP` "for identifying client's remote IP", que atrás
 *   do CloudFront é o nó do CloudFront. O tratamento do X-Forwarded-For não
 *   está documentado; o edge acrescenta o IP de quem conectou ao fim.
 *   https://docs.railway.com/networking/public-networking/specs-and-limits
 *
 * O domínio `*.up.railway.app` também está aberto: qualquer um pode imitar os
 * cabeçalhos do CloudFront (`via`, `x-amz-cf-id`) e montar o X-Forwarded-For.
 * Por isso o caminho do CloudFront só vale com o cabeçalho secreto de origem
 * que o CloudFront acrescenta (`X-Origin-Verify` = env
 * `LANDING_CF_ORIGIN_SECRET`, comparação em tempo constante). Com ele: o IP
 * da cliente é a PENÚLTIMA entrada do X-Forwarded-For — a última é o nó do
 * CloudFront que o Railway acrescentou, e tem que ser igual ao `X-Real-IP`.
 *
 * - Segredo confere → `cf_penultimate` (ou `none` se o formato não conferir).
 * - Parece CloudFront sem o segredo (env ausente, cabeçalho errado ou
 *   forjado) → `none`: sem chave/IP, limite global no backend (o de hoje).
 * - Sem sinal de CloudFront (staging, Railway direto) → `X-Real-IP`, senão a
 *   última entrada do X-Forwarded-For.
 * Entradas mais à esquerda vêm do navegador e podem ser forjadas: nunca usar.
 */

export const CF_ORIGIN_SECRET_HEADER = "x-origin-verify";

export type ClientIpSource = "cf_penultimate" | "real_ip" | "xff_last" | "none";

export interface ClientIpResult {
  ip: string | null;
  source: ClientIpSource;
  /** Último salto (quem conectou no Railway); só para o diagnóstico. */
  lastHop: string | null;
  viaCloudFront: boolean;
  /** O cabeçalho secreto de origem conferiu. */
  cfVerified: boolean;
}

function sameSecret(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function validIp(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && isIP(v) !== 0 ? v : null;
}

export function resolveClientIp(
  headers: Headers,
  cfOriginSecret: string | null | undefined = process.env.LANDING_CF_ORIGIN_SECRET,
): ClientIpResult {
  const expected = cfOriginSecret?.trim();
  const given = headers.get(CF_ORIGIN_SECRET_HEADER)?.trim();
  const cfVerified = !!expected && !!given && sameSecret(given, expected);
  const viaCloudFront =
    cfVerified ||
    headers.has("x-amz-cf-id") ||
    /cloudfront/i.test(headers.get("via") ?? "");
  const realIp = validIp(headers.get("x-real-ip"));
  const xff = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const last = xff.length ? xff[xff.length - 1] : null;
  const lastHop = realIp ?? validIp(last);
  const base = { lastHop, viaCloudFront, cfVerified };

  if (viaCloudFront) {
    if (!cfVerified) return { ip: null, source: "none", ...base };
    const penultimate = xff.length >= 2 ? validIp(xff[xff.length - 2]) : null;
    if (realIp !== null && last === realIp && penultimate) {
      return { ip: penultimate, source: "cf_penultimate", ...base };
    }
    return { ip: null, source: "none", ...base };
  }

  if (realIp) return { ip: realIp, source: "real_ip", ...base };
  const lastValid = validIp(last);
  if (lastValid) return { ip: lastValid, source: "xff_last", ...base };
  return { ip: null, source: "none", ...base };
}

// ---------------------------------------------------------------------------
// Diagnóstico (sem gravar IP): o último salto está nas faixas do CloudFront?
// Faixas publicadas em https://ip-ranges.amazonaws.com/ip-ranges.json,
// "service": "CLOUDFRONT" (LocationsOfEdgeServers.html).
// ---------------------------------------------------------------------------

type Cidr = { version: 4 | 6; base: bigint; bits: number };

function ipToBigInt(ip: string): { version: 4 | 6; value: bigint } | null {
  const v = isIP(ip);
  if (v === 4) {
    const value = ip
      .split(".")
      .reduce((acc, part) => (acc << BigInt(8)) + BigInt(Number(part)), BigInt(0));
    return { version: 4, value };
  }
  if (v === 6) {
    let addr = ip.toLowerCase();
    // IPv4 embutido no fim (ex.: ::ffff:1.2.3.4)
    const v4 = addr.match(/(\d+\.\d+\.\d+\.\d+)$/);
    if (v4) {
      const n = ipToBigInt(v4[1])!.value;
      addr = addr.replace(v4[1], `${(n >> BigInt(16)).toString(16)}:${(n & BigInt(0xffff)).toString(16)}`);
    }
    const [head, tail] = addr.split("::");
    const h = head ? head.split(":") : [];
    const t = tail !== undefined && tail ? tail.split(":") : [];
    const groups =
      tail !== undefined ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t] : h;
    if (groups.length !== 8) return null;
    const value = groups.reduce((acc, g) => (acc << BigInt(16)) + BigInt(parseInt(g, 16)), BigInt(0));
    return { version: 6, value };
  }
  return null;
}

function parseCidr(cidr: string): Cidr | null {
  const [ip, bitsRaw] = cidr.split("/");
  const parsed = ipToBigInt(ip);
  const bits = Number(bitsRaw);
  if (!parsed || !Number.isInteger(bits)) return null;
  return { version: parsed.version, base: parsed.value, bits };
}

export function ipInCidrs(ip: string, cidrs: Cidr[]): boolean {
  const parsed = ipToBigInt(ip);
  if (!parsed) return false;
  const width = parsed.version === 4 ? 32 : 128;
  return cidrs.some((c) => {
    if (c.version !== parsed.version) return false;
    const shift = BigInt(width - c.bits);
    return parsed.value >> shift === c.base >> shift;
  });
}

export function parseCloudFrontRanges(json: unknown): Cidr[] {
  const data = json as {
    prefixes?: { ip_prefix?: string; service?: string }[];
    ipv6_prefixes?: { ipv6_prefix?: string; service?: string }[];
  };
  const out: Cidr[] = [];
  for (const p of data?.prefixes ?? []) {
    if (p.service === "CLOUDFRONT" && p.ip_prefix) {
      const c = parseCidr(p.ip_prefix);
      if (c) out.push(c);
    }
  }
  for (const p of data?.ipv6_prefixes ?? []) {
    if (p.service === "CLOUDFRONT" && p.ipv6_prefix) {
      const c = parseCidr(p.ipv6_prefix);
      if (c) out.push(c);
    }
  }
  return out;
}

const RANGES_TTL_MS = 6 * 60 * 60 * 1000;
let rangesCache: { at: number; cidrs: Cidr[] } | null = null;
let rangesLoading: Promise<Cidr[] | null> | null = null;

async function loadCloudFrontRanges(): Promise<Cidr[] | null> {
  if (rangesCache && Date.now() - rangesCache.at < RANGES_TTL_MS) return rangesCache.cidrs;
  if (!rangesLoading) {
    rangesLoading = fetch("https://ip-ranges.amazonaws.com/ip-ranges.json", {
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const cidrs = json ? parseCloudFrontRanges(json) : [];
        if (cidrs.length) rangesCache = { at: Date.now(), cidrs };
        return cidrs.length ? cidrs : null;
      })
      .catch(() => null)
      .finally(() => {
        rangesLoading = null;
      });
  }
  return rangesLoading;
}

/**
 * Loga a fonte usada e se o último salto é do CloudFront — nunca o IP.
 * Só em produção (a consulta das faixas sai para a internet).
 */
export function logClientIpDiagnostics(result: ClientIpResult, route: string): void {
  const base = {
    msg: "landing_client_ip",
    route,
    source: result.source,
    via_cloudfront: result.viaCloudFront,
    cf_verified: result.cfVerified,
  };
  if (process.env.NODE_ENV !== "production" || !result.lastHop) {
    console.info(JSON.stringify({ ...base, last_hop_in_cloudfront_ranges: null }));
    return;
  }
  const hop = result.lastHop;
  void loadCloudFrontRanges().then((cidrs) => {
    console.info(
      JSON.stringify({
        ...base,
        last_hop_in_cloudfront_ranges: cidrs ? ipInCidrs(hop, cidrs) : null,
      }),
    );
  });
}
