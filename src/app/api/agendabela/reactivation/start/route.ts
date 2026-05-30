import { NextResponse } from "next/server";

function getBackendApiUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    "https://api.agendabela.tudoagenda.com.br/api"
  );
}

function buildInternalHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.INTERNAL_API_KEY) {
    headers["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
  }
  return headers;
}

/**
 * BFF: repassa POST /subscriptions/reactivation/start ao backend.
 * Recebe reactivationToken + password (contrato canônico do backend #86,
 * documentado em `src/subscriptions/dto/reactivation-start.dto.ts`).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reactivationToken: string =
      typeof body?.reactivationToken === "string"
        ? body.reactivationToken.trim()
        : "";
    const password: string =
      typeof body?.password === "string" ? body.password : "";

    if (!reactivationToken) {
      return NextResponse.json(
        { error: "Token de reativação ausente. Recomece o fluxo." },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 8 caracteres." },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${getBackendApiUrl()}/subscriptions/reactivation/start`,
      {
        method: "POST",
        headers: buildInternalHeaders(),
        body: JSON.stringify({ reactivationToken, password }),
      },
    );

    const responseBody = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      console.error(
        "[Reactivation/start] Backend error:",
        backendRes.status,
        responseBody,
      );

      // 410 = token expirado
      if (backendRes.status === 410) {
        return NextResponse.json(
          {
            error:
              "Sessão expirada. Por favor, reinicie o processo de reativação.",
            code: "TOKEN_EXPIRED",
          },
          { status: 410 },
        );
      }

      return NextResponse.json(
        {
          error:
            responseBody?.message ??
            "Erro ao iniciar reativação. Tente novamente.",
          code: responseBody?.code,
        },
        { status: backendRes.status >= 500 ? 502 : backendRes.status },
      );
    }

    const checkoutUrl = responseBody?.checkoutUrl;

    if (!checkoutUrl) {
      console.error(
        "[Reactivation/start] Backend missing checkoutUrl:",
        responseBody,
      );
      return NextResponse.json(
        { error: "Resposta inválida do serviço de pagamento." },
        { status: 502 },
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[Reactivation/start] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
