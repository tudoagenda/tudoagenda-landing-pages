import { NextResponse } from "next/server";

function getBackendApiUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    "https://api.agendabela.tudoagenda.com.br/api"
  );
}

function sanitizeProfileId(profileId: unknown): string {
  return typeof profileId === "string" ? profileId.trim() : "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profileId = sanitizeProfileId(body.profileId);

    if (!profileId) {
      return NextResponse.json(
        { error: "Perfil é obrigatório para iniciar o trial." },
        { status: 400 },
      );
    }

    const internalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.INTERNAL_API_KEY) {
      internalHeaders["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
    }

    const response = await fetch(
      `${getBackendApiUrl()}/subscriptions/${encodeURIComponent(profileId)}/start-trial`,
      {
        method: "POST",
        headers: internalHeaders,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[Billing] Backend trial checkout error:",
        response.status,
        errorBody,
      );
      return NextResponse.json(
        { error: "Erro ao criar checkout. Tente novamente." },
        { status: response.status === 409 ? 409 : 502 },
      );
    }

    const result = await response.json().catch(() => null);
    const url = result?.checkoutUrl;

    if (!url) {
      console.error("[Billing] Backend response missing checkoutUrl:", result);
      return NextResponse.json(
        { error: "Resposta inválida do serviço de pagamento." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url,
      id: result?.subscriptionId,
    });
  } catch (error) {
    console.error("[Billing] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento" },
      { status: 500 },
    );
  }
}
