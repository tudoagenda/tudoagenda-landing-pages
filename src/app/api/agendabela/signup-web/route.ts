import { NextResponse } from "next/server";
import {
  SIGNUP_TIMEOUT_MS,
  EMAIL_REGEX,
  buildLandingHeaders,
  getBackendApiUrl,
  passwordProblem,
  readJson,
  str,
} from "@/lib/server/landing-backend";

/**
 * BFF do cadastro SEM cartão (Opção B): repassa ao backend
 * `POST /subscriptions/signup-web`. A conta nasce igual à do app (Profile
 * INACTIVE + login no Cognito) e o backend manda o link de acesso por
 * WhatsApp e e-mail.
 *
 * Os mesmos 5 campos do app (nome, salão, WhatsApp, e-mail, senha), sem CPF:
 * o backend recusa campo a mais (400), então nada além disso é repassado.
 *
 * Respostas para o navegador (mensagens sempre em PT-BR):
 *  - 201 { profileId, email, accessLinkSent }
 *  - 409 { code: "EMAIL_ALREADY_REGISTERED", error }
 *  - 400 dado inválido · 429 muitas tentativas · 502 backend fora
 */

const GENERIC_ERROR =
  "Não consegui criar sua conta agora. Tente de novo em instantes.";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Confira os dados e tente de novo." }, { status: 400 });
  }

  const name = str(body.name);
  const salonName = str(body.salonName);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone).replace(/\D/g, "");
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !salonName) {
    return NextResponse.json({ error: "Preencha seu nome e o nome do salão." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Confira o e-mail." }, { status: 400 });
  }
  if (phone.length < 10 || phone.length > 13) {
    return NextResponse.json({ error: "Confira o WhatsApp com DDD." }, { status: 400 });
  }
  const pwProblem = passwordProblem(password);
  if (pwProblem) {
    return NextResponse.json({ error: pwProblem }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${getBackendApiUrl()}/subscriptions/signup-web`, {
      method: "POST",
      headers: buildLandingHeaders(req),
      body: JSON.stringify({ name, salonName, email, phone, password }),
      signal: AbortSignal.timeout(SIGNUP_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[signup-web] backend inacessível:", error instanceof Error ? error.name : "erro");
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  const result = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (response.status === 409) {
    // Só o code do backend decide a tela "Esse e-mail já tem conta".
    if (result?.code === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { code: "EMAIL_ALREADY_REGISTERED", error: "Esse e-mail já tem conta." },
        { status: 409 },
      );
    }
    console.error("[signup-web] 409 sem code conhecido");
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  if (response.status === 429) {
    return NextResponse.json(
      { error: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  if (response.status === 400) {
    // A validação daqui espelha a do backend; 400 lá é dado que escapou dela.
    console.error("[signup-web] backend recusou o cadastro (400)");
    return NextResponse.json(
      { error: "Confira os dados e tente de novo." },
      { status: 400 },
    );
  }

  if (!response.ok || typeof result?.profileId !== "string") {
    console.error("[signup-web] backend falhou:", response.status);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  return NextResponse.json(
    {
      profileId: result.profileId,
      email: typeof result.email === "string" ? result.email : email,
      accessLinkSent: result.accessLinkSent === true,
    },
    { status: 201 },
  );
}
