import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// WhatsApp: aceita com ou sem código de país, apenas dígitos
const PHONE_DIGITS_MIN = 10;

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
 * BFF: repassa POST /subscriptions/reactivation/lookup ao backend.
 * Valida o identificador (email ou telefone) antes de chamar o backend.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw: string =
      typeof body?.identifier === "string" ? body.identifier.trim() : "";

    if (!raw) {
      return NextResponse.json(
        { error: "Email ou WhatsApp é obrigatório." },
        { status: 400 },
      );
    }

    const isEmail = EMAIL_REGEX.test(raw);
    const phoneDigits = raw.replace(/\D/g, "");
    const isPhone = !isEmail && phoneDigits.length >= PHONE_DIGITS_MIN;

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: "Informe um email ou número de WhatsApp válido." },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${getBackendApiUrl()}/subscriptions/reactivation/lookup`,
      {
        method: "POST",
        headers: buildInternalHeaders(),
        body: JSON.stringify({
          identifier: isEmail ? raw.toLowerCase() : phoneDigits,
        }),
      },
    );

    const responseBody = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      console.error(
        "[Reactivation/lookup] Backend error:",
        backendRes.status,
        responseBody,
      );
      return NextResponse.json(
        {
          error:
            responseBody?.message ??
            "Erro ao buscar conta. Tente novamente.",
          code: responseBody?.code,
        },
        { status: backendRes.status >= 500 ? 502 : backendRes.status },
      );
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("[Reactivation/lookup] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
