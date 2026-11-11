import { NextResponse } from "next/server";
import {
  BACKEND_TIMEOUT_MS,
  EMAIL_REGEX,
  buildLandingHeaders,
  getBackendApiUrl,
  readJson,
  str,
} from "@/lib/server/landing-backend";

/**
 * BFF do "Reenviar link" / "Esqueci a senha" (D3): repassa ao backend
 * `POST /subscriptions/signup-web/access-link`. O backend manda o link de
 * acesso para o WhatsApp e o e-mail GRAVADOS na conta e responde sempre
 * 200 { ok: true }, sem dizer se o e-mail tem conta. Aqui também.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  const email = str(body?.email).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Confira o e-mail." }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(
      `${getBackendApiUrl()}/subscriptions/signup-web/access-link`,
      {
        method: "POST",
        headers: buildLandingHeaders(req),
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
      },
    );
  } catch (error) {
    console.error("[access-link] backend inacessível:", error instanceof Error ? error.name : "erro");
    return NextResponse.json(
      { error: "Não deu para mandar o link agora. Tente de novo em instantes." },
      { status: 502 },
    );
  }

  if (response.status === 429) {
    return NextResponse.json(
      { error: "Você já pediu o link várias vezes. Espere alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  if (!response.ok) {
    console.error("[access-link] backend falhou:", response.status);
    return NextResponse.json(
      { error: "Não deu para mandar o link agora. Tente de novo em instantes." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
