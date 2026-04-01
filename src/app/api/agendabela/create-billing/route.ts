import { NextResponse } from "next/server";

// AbacatePay v2 — Checkout API
// Uses pre-registered products instead of inline product definitions.
// Card validation product: R$1,00 (prod_wDeX06wJqPmqMk0zjzJ6j5NZ)
// Actual subscription is managed by the backend after trial period.

const ABACATE_PAY_V2_URL = "https://api.abacatepay.com/v2";

const RETURN_URL =
  process.env.BILLING_RETURN_URL ||
  "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento?payment=success";

// Product ID for card validation (R$1,00). Override via env var if needed.
const CARD_VALIDATION_PRODUCT_ID =
  process.env.ABACATE_PAY_CARD_VALIDATION_PRODUCT_ID ||
  "prod_wDeX06wJqPmqMk0zjzJ6j5NZ";

export async function POST(req: Request) {
  try {
    const { email, name, phone } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
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
    if (name) customerPayload.name = name;
    if (phone) customerPayload.cellphone = phone;

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
      const customerData = await customerRes.json();
      customerId = customerData.data?.id;
    } else {
      // Customer creation failed — log but continue without customerId
      // The checkout will still work, just without pre-filled customer data
      const customerError = await customerRes.json().catch(() => ({}));
      console.warn("[Billing] Customer creation failed:", customerError);
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
      return NextResponse.json(
        { error: "Erro ao criar link de pagamento. Tente novamente." },
        { status: checkoutRes.status }
      );
    }

    const checkoutData = await checkoutRes.json();
    const url = checkoutData.data?.url;

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
