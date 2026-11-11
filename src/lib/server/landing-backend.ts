import { logClientIpDiagnostics, resolveClientIp } from "./client-ip";

/**
 * Chamadas do SERVIDOR da landing ao backend do Agenda Bela nas rotas do
 * cadastro sem cartão (Opção B): signup-web, access-link e start-trial.
 *
 * Contrato com o backend (`ForwardedIpThrottlerGuard`,
 * agendabela-backend-services/src/common/forwarded-ip-throttler.guard.ts):
 *  - `X-Landing-Key`: env `LANDING_INTERNAL_KEY` (segredo só do servidor;
 *    nunca NEXT_PUBLIC). Sem a env, a chamada vai sem os dois cabeçalhos e o
 *    backend limita como antes (todo mundo atrás do mesmo IP).
 *  - `X-Client-IP`: o IP da cliente (CloudFront → Railway; ver client-ip.ts).
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
 * Cabeçalhos para o backend. A chave só vai com um IP de cliente determinado
 * com segurança (ver `resolveClientIp`); nunca a chave sem o IP.
 */
export function buildLandingHeaders(req: Request, route: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = process.env.LANDING_INTERNAL_KEY?.trim();
  const client = resolveClientIp(req.headers);
  logClientIpDiagnostics(client, route);
  if (key && client.ip) {
    headers["X-Landing-Key"] = key;
    headers["X-Client-IP"] = client.ip;
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
 * Criar a conta não é idempotente (Cognito + envio do link na mesma chamada).
 * Folga maior que a das outras rotas, mas abaixo dos 30 s em que o CloudFront
 * corta a resposta da origem por padrão ("For response timeout, the default
 * is 30 seconds", DownloadDistValuesOrigin.html). Se estourar com a conta
 * criada, o modal trata o 409 da tentativa seguinte como "conta criada".
 */
export const SIGNUP_TIMEOUT_MS = 25_000;
