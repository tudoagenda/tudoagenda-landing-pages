import { NextResponse } from "next/server";

// AbacatePay v2 — Checkout API
// Uses pre-registered products instead of inline product definitions.
// Card validation product: R$1,00 — configurable via env var.
// Actual subscription is managed by the backend after trial period.

const ABACATE_PAY_V2_URL = "https://api.abacatepay.com/v2";

const RETURN_URL =
  process.env.BILLING_RETURN_URL ||
  "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento?payment=success";

// Product ID for card validation (R$1,00).
const CARD_VALIDATION_PRODUCT_ID =
  process.env.ABACATE_PAY_CARD_VALIDATION_PRODUCT_ID ||
  "prod_wDeX06wJqPmqMk0zjzJ6j5NZ";

// --- Input validation helpers ---

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 15);
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const rawName = typeof body.name === "string" ? sanitizeName(body.name) : "";
    const rawPhone = typeof body.phone === "string" ? sanitizePhone(body.phone) : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ABACATE_PAY_API;
    if (!apiKey) {
      console.error("[Billing] ABACATE_PAY_API env var not set");
      return NextResponse.json(
        { error: "Configuração de pagamento indisponível" },
        { status: 500 }
      );
    }

    // 1. Create or find customer (only email is required in v2)
    const customerPayload: Record<string, string> = { email };
    if (rawName) customerPayload.name = rawName;
    if (rawPhone.length >= 10) customerPayload.cellphone = rawPhone;

    const customerRes = await fetch(`${ABACATE_PAY_V2_URL}/customers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(customerPayload),
    });

    let customerId: string | undefined;

    if (customerRes.ok) {
      const customerData = await customerRes.json().catch(() => null);
      customerId = customerData?.data?.id;
    } else {
      // Customer creation failed — log but continue without customerId.
      // v2 checkouts work without customerId; customer data just won't be pre-filled.
      const customerError = await customerRes.json().catch(() => ({}));
      console.warn("[Billing] Customer creation failed (non-blocking):", customerError);
    }

    // 2. Create checkout with card validation product
    const checkoutPayload: Record<string, unknown> = {
      items: [{ id: CARD_VALIDATION_PRODUCT_ID, quantity: 1 }],
      methods: ["CARD"],
      returnUrl: RETURN_URL,
      completionUrl: RETURN_URL,
    };

    if (customerId) {
      checkoutPayload.customerId = customerId;
    }

    const checkoutRes = await fetch(`${ABACATE_PAY_V2_URL}/checkouts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!checkoutRes.ok) {
      const errorData = await checkoutRes.json().catch(() => ({}));
      console.error("[Billing] AbacatePay checkout error:", errorData);
      // Don't forward upstream status codes — always return 502 for third-party failures
      return NextResponse.json(
        { error: "Erro ao criar link de pagamento. Tente novamente." },
        { status: 502 }
      );
    }

    const checkoutData = await checkoutRes.json().catch(() => null);
    const url = checkoutData?.data?.url;

    if (!url) {
      console.error("[Billing] AbacatePay response missing URL:", checkoutData);
      return NextResponse.json(
        { error: "Resposta inválida do serviço de pagamento." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[Billing] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento" },
      { status: 500 }
    );
  }
}
