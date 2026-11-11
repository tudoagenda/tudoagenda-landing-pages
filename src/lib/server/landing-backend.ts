import { isIP } from "net";

/**
 * Chamadas do SERVIDOR da landing ao backend do Agenda Bela nas rotas do
 * cadastro sem cartão (Opção B): signup-web, access-link e start-trial.
 *
 * Contrato com o backend (`ForwardedIpThrottlerGuard`,
 * agendabela-backend-services/src/common/forwarded-ip-throttler.guard.ts):
 *  - `X-Landing-Key`: env `LANDING_INTERNAL_KEY` (segredo só do servidor;
 *    nunca NEXT_PUBLIC). Sem a env, a chamada vai sem os dois cabeçalhos e o
 *    backend limita como antes (todo mundo atrás do mesmo IP).
 *  - `X-Client-IP`: o IP da cliente que a plataforma da landing (Railway) viu.
 *    Só vai junto com a chave: a chave sem o IP faria o limite voltar a ser
 *    global, e o IP sem a chave é ignorado pelo backend.
 */

export function getBackendApiUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    "https://api.agendabela.tudoagenda.com.br/api"
  ).replace(/\/$/, "");
}

/**
 * IP da cliente que chegou na landing.
 *
 * O edge do Railway grava `X-Real-IP` com o IP remoto da conexão (documentado
 * em docs.railway.com/networking/public-networking/specs-and-limits). É o
 * primeiro lugar a olhar. O `X-Forwarded-For` não está documentado lá: se for
 * usado, vale só a ÚLTIMA entrada (a que o proxy acrescenta). As da esquerda
 * vêm do navegador e podem ser forjadas: nunca repassar o cabeçalho cru.
 *
 * Devolve `null` quando nada é um IP válido (nesse caso o cabeçalho não vai).
 */
export function getClientIp(req: Request): string | null {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp) !== 0) return realIp;

  const last = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .pop();
  if (last && isIP(last) !== 0) return last;

  return null;
}

export function buildLandingHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = process.env.LANDING_INTERNAL_KEY?.trim();
  const clientIp = getClientIp(req);
  if (key && clientIp) {
    headers["X-Landing-Key"] = key;
    headers["X-Client-IP"] = clientIp;
  }
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent.slice(0, 512);
  return headers;
}

/** Lê o corpo JSON do pedido sem estourar: corpo inválido vira `null`. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export { EMAIL_REGEX, passwordProblem } from "@/lib/signup-rules";

/** Tempo máximo esperando o backend antes de responder erro à cliente. */
export const BACKEND_TIMEOUT_MS = 20_000;

/**
 * Criar a conta não é idempotente: se o tempo estourar com a conta já criada,
 * tentar de novo dá "Esse e-mail já tem conta". Folga maior que a das outras
 * rotas (Cognito + envio do link no WhatsApp dentro da mesma chamada).
 */
export const SIGNUP_TIMEOUT_MS = 60_000;
