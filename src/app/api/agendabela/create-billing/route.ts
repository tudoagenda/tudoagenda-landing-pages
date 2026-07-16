import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBackendApiUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    "https://api.agendabela.tudoagenda.com.br/api"
  );
}

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizePhone(value: unknown): string {
  return sanitizeString(value).replace(/\D/g, "").slice(0, 15);
}

function sanitizeTaxId(value: unknown): string {
  return sanitizeString(value).replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = sanitizeString(body.email).toLowerCase();
    const password = sanitizeString(body.password);
    const name = sanitizeString(body.name);
    const salonName = sanitizeString(body.salonName);
    const phone = sanitizePhone(body.phone);
    const taxId = sanitizeTaxId(body.taxId);

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    if (
      !password ||
      password.length < 8 ||
      !name ||
      !salonName ||
      phone.length < 10 ||
      (taxId.length !== 11 && taxId.length !== 14)
    ) {
      return NextResponse.json(
        { error: "Dados de cadastro incompletos." },
        { status: 400 },
      );
    }

    const internalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.INTERNAL_API_KEY) {
      internalHeaders["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
    }

    const response = await fetch(`${getBackendApiUrl()}/subscriptions/signup-trial`, {
      method: "POST",
      headers: internalHeaders,
      body: JSON.stringify({
        email,
        password,
        name,
        salonName,
        phone,
        taxId,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[Billing] Backend pending signup checkout error:",
        response.status,
        errorBody,
      );
      return NextResponse.json(
        {
          error:
            response.status === 409
              ? "Este email já possui uma conta. Faça login ou use o fluxo de reativação."
              : "Erro ao criar checkout. Tente novamente.",
        },
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
      pendingSignupId: result?.pendingSignupId,
    });
  } catch (error) {
    console.error("[Billing] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento" },
      { status: 500 },
    );
  }
}
