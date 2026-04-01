import { NextResponse } from "next/server";

// R$1,00 (100 centavos) é validação do cartão, estornado automaticamente.
// Cobrança recorrente de R$59,90 é gerenciada pelo backend após trial.
const DEFAULT_AMOUNT_CENTS = 100;

const RETURN_URL =
  process.env.BILLING_RETURN_URL ||
  "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento?payment=success";

export async function POST(req: Request) {
  try {
    const { email, name, phone, taxId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      );
    }

    if (!taxId) {
      return NextResponse.json(
        { error: "CPF é obrigatório" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ABACATE_PAY_API;
    if (!apiKey) {
      console.error("ABACATE_PAY_API env var not set");
      return NextResponse.json(
        { error: "Configuração de pagamento indisponível" },
        { status: 500 }
      );
    }

    const amountCents =
      Number(process.env.PLAN_AMOUNT_CENTS) || DEFAULT_AMOUNT_CENTS;

    const response = await fetch(
      "https://api.abacatepay.com/v1/billing/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          frequency: "ONE_TIME",
          methods: ["CARD"],
          products: [
            {
              externalId: "PRO-PLAN",
              name: "Agenda Bela Pro",
              quantity: 1,
              price: amountCents,
            },
          ],
          returnUrl: RETURN_URL,
          completionUrl: RETURN_URL,
          customer: {
            name,
            email,
            cellphone: phone,
            taxId,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AbacatePay error:", errorData);

      // Forward specific AbacatePay validation errors
      const abacateError = errorData?.error;
      if (typeof abacateError === "string" && abacateError.includes("taxId")) {
        return NextResponse.json(
          { error: "CPF inválido. Verifique e tente novamente." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Erro ao criar link de pagamento. Tente novamente." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const url = data.data?.url || data.url;

    if (!url) {
      console.error("AbacatePay response missing URL:", data);
      return NextResponse.json(
        { error: "Resposta inválida do serviço de pagamento." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Billing error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar pagamento" },
      { status: 500 }
    );
  }
}
