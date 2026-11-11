import { NextResponse } from "next/server";
import {
  BACKEND_TIMEOUT_MS,
  buildLandingHeaders,
  getBackendApiUrl,
  readJson,
  str,
} from "@/lib/server/landing-backend";

/**
 * BFF do caminho do cartão (D4) sobre a conta que o cadastro sem cartão já
 * criou: repassa ao backend `POST /subscriptions/:profileId/start-trial`
 * com o CPF/CNPJ (só pedido aqui) e devolve a URL do checkout AbacatePay.
 *
 * Volta do checkout: com `LANDING_CHECKOUT_RETURN=1`, manda
 * `origin: "landing"` e o backend devolve a cliente para a landing com
 * `?checkout=concluido` ou `?checkout=voltou`. Sem a env, o campo não vai
 * (backend sem suporte responderia 400 por campo desconhecido) e a volta
 * passa pelo agendabela-web, que a manda para a landing sem parâmetro.
 *
 * Respostas para o navegador (mensagens sempre em PT-BR):
 *  - 200 { checkoutUrl }
 *  - 409 { code: "ALREADY_SUBSCRIBED", error } — o cartão já entrou (trial)
 *  - 409 { code: "ALREADY_ACTIVE", error } — assinatura paga ou de loja
 *  - 400 CPF/CNPJ inválido · 404 conta não encontrada · 502 resto
 */

const PROFILE_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENERIC_ERROR =
  "Não consegui abrir o pagamento agora. Tente de novo em instantes ou comece sem cartão.";

const CARD_CODES = new Set(["TRIAL_ALREADY_ACTIVE", "CARD_ALREADY_REGISTERED"]);
const ACTIVE_CODES = new Set(["SUBSCRIPTION_ALREADY_ACTIVE", "STORE_MANAGED"]);

/**
 * 409 do start-trial: prefere o `code` do backend; sem ele (ou com um code
 * desconhecido), cai no texto da mensagem. Qualquer outro 409 é "desconhecido"
 * e nunca vira Aprovado (falha para o lado seguro).
 */
function classifyConflict(
  body: Record<string, unknown> | null,
): "card" | "active" | "unknown" {
  const code = typeof body?.code === "string" ? body.code : "";
  if (CARD_CODES.has(code)) return "card";
  if (ACTIVE_CODES.has(code)) return "active";
  const message = typeof body?.message === "string" ? body.message : "";
  if (/Trial already active|cartão já foi cadastrado/i.test(message)) return "card";
  if (/Subscription already active|managed by/i.test(message)) return "active";
  return "unknown";
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const profileId = str(body?.profileId);
  const taxId = str(body?.taxId).replace(/\D/g, "");

  if (!PROFILE_ID_REGEX.test(profileId)) {
    return NextResponse.json(
      { error: "Não encontrei sua conta. Recarregue a página e tente de novo." },
      { status: 400 },
    );
  }
  if (taxId.length !== 11 && taxId.length !== 14) {
    return NextResponse.json({ error: "Confira o CPF ou CNPJ." }, { status: 400 });
  }

  const payload: Record<string, string> = { taxId };
  if (process.env.LANDING_CHECKOUT_RETURN === "1") payload.origin = "landing";

  let response: Response;
  try {
    response = await fetch(
      `${getBackendApiUrl()}/subscriptions/${encodeURIComponent(profileId)}/start-trial`,
      {
        method: "POST",
        headers: buildLandingHeaders(req, "start-trial"),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
      },
    );
  } catch (error) {
    console.error("[start-trial] backend inacessível:", error instanceof Error ? error.name : "erro");
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  const result = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (response.status === 409) {
    const kind = classifyConflict(result);
    if (kind === "card") {
      return NextResponse.json(
        { code: "ALREADY_SUBSCRIBED", error: "Seu cartão já está cadastrado." },
        { status: 409 },
      );
    }
    if (kind === "active") {
      return NextResponse.json(
        {
          code: "ALREADY_ACTIVE",
          error:
            "Você já tem uma assinatura ativa. É só entrar no app com seu e-mail e senha.",
        },
        { status: 409 },
      );
    }
    console.error("[start-trial] 409 sem code nem mensagem conhecidos");
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  if (response.status === 404) {
    return NextResponse.json(
      { error: "Não encontrei sua conta. Recarregue a página e tente de novo." },
      { status: 404 },
    );
  }
  if (response.status === 400) {
    // CPF já validado aqui; 400 lá é CPF que o backend recusou (ou campo).
    console.error("[start-trial] backend recusou (400)");
    return NextResponse.json({ error: "Confira o CPF ou CNPJ." }, { status: 400 });
  }

  const checkoutUrl = result?.checkoutUrl;
  if (!response.ok || typeof checkoutUrl !== "string" || !/^https:\/\//.test(checkoutUrl)) {
    console.error("[start-trial] backend falhou:", response.status);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl });
}
