import { isIP } from "net";
import {
  cloudFrontViewerIp,
  ipInCidrs,
  isPublicIp,
  loadAwsRanges,
  resolveClientIp,
} from "./client-ip";

/**
 * IP da visitante para a API de Conversões da Meta (rota web-event). É só um
 * sinal de correspondência: não decide limite no backend nem acesso. Por isso
 * aceita leituras que `resolveClientIp` recusa sem o segredo de origem; quem
 * forja cabeçalho só piora o casamento do próprio clique.
 *
 * Medido em 26/11/2026: a landing de produção NÃO passa pela borda do Railway.
 * Os pedidos de tudoagenda.com.br não aparecem no log HTTP do serviço do
 * Railway, a resposta não traz os cabeçalhos dele, e o backend recebe as
 * chamadas da landing de um IP da AWS (us-east-1). Então não existe
 * `X-Real-IP` e a regra "penúltima entrada do X-Forwarded-For" nunca valia.
 *
 * Ordem (a primeira que der um IP público vence):
 *  1. `resolveClientIp` (segredo de origem conferido, ou pedido sem CloudFront).
 *  2. `CloudFront-Viewer-Address`: o CloudFront grava o IP e a porta de quem
 *     conectou nele. Só chega se a política de pedido à origem incluir o
 *     cabeçalho (ver README de _lojas).
 *  3. Cadeia do Railway: penúltima do X-Forwarded-For quando a última é o
 *     `X-Real-IP` (`cloudFrontViewerIp`).
 *  4. X-Forwarded-For, da direita para a esquerda, pulando o que é
 *     infraestrutura (IP privado/reservado e faixas publicadas da AWS, onde
 *     ficam os nós do CloudFront e os saltos internos): o CloudFront
 *     acrescenta o IP de quem conectou ao fim, então a primeira entrada que
 *     sobra é a visitante. Entradas mais à esquerda vêm do navegador e nunca
 *     são lidas. Sem a lista de faixas da AWS, esta regra não roda.
 *
 * Nunca devolve IP privado, reservado nem (pela regra 4) de proxy da AWS.
 */

export type VisitorIpSource =
  | "resolved"
  | "cf_viewer_address"
  | "cf_penultimate"
  | "xff_rightmost"
  | "none";

export type VisitorIp = { ip: string | null; source: VisitorIpSource };

type Cidrs = NonNullable<Awaited<ReturnType<typeof loadAwsRanges>>>;

/** `198.51.100.10:46532` ou `2001:db8::1:46532` → só o IP. */
export function parseViewerAddress(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const cut = v.lastIndexOf(":");
  if (cut <= 0) return null;
  const ip = v.slice(0, cut).replace(/^\[|\]$/g, "");
  return isPublicIp(ip) ? ip : null;
}

export function splitForwardedFor(headers: Headers): string[] {
  return (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Regra 4: primeira entrada, da direita, que não é infraestrutura. Entrada
 * que não é IP = cabeçalho fora do formato: para sem devolver nada.
 */
export function rightmostVisitorIp(xff: string[], awsCidrs: Cidrs): string | null {
  for (let i = xff.length - 1; i >= 0; i -= 1) {
    const entry = xff[i];
    if (isIP(entry) === 0) return null;
    if (!isPublicIp(entry) || ipInCidrs(entry, awsCidrs)) continue;
    return entry;
  }
  return null;
}

export async function resolveVisitorIp(
  headers: Headers,
  loadRanges: () => Promise<Cidrs | null> = loadAwsRanges,
): Promise<VisitorIp> {
  const resolved = resolveClientIp(headers);
  if (resolved.ip && isPublicIp(resolved.ip)) return { ip: resolved.ip, source: "resolved" };

  const viewer = parseViewerAddress(headers.get("cloudfront-viewer-address"));
  if (viewer) return { ip: viewer, source: "cf_viewer_address" };

  const penultimate = resolved.viaCloudFront ? cloudFrontViewerIp(headers) : null;
  if (penultimate && isPublicIp(penultimate)) return { ip: penultimate, source: "cf_penultimate" };

  const xff = splitForwardedFor(headers);
  if (xff.length) {
    const aws = await loadRanges();
    const ip = aws ? rightmostVisitorIp(xff, aws) : null;
    if (ip) return { ip, source: "xff_rightmost" };
  }
  return { ip: null, source: "none" };
}
