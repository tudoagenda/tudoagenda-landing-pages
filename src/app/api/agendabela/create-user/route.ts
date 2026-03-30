import { NextResponse } from "next/server";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const { email, password, name, salonName, phone } = await req.json();

    if (!email || !password || !name || !salonName || !phone) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Server-side validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const cognitoUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!cognitoUrl) {
      console.error("BACKEND_API_URL env var not set");
      return NextResponse.json(
        { error: "Configuração do servidor indisponível" },
        { status: 500 }
      );
    }

    // 1. Create Cognito account with user-defined password
    const cognitoResponse = await fetch(
      `${cognitoUrl}/create-user-and-send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!cognitoResponse.ok) {
      const cognitoError = await cognitoResponse.json().catch(() => ({}));
      console.error("Cognito error:", cognitoError);
      return NextResponse.json(
        { error: cognitoError.message || "Erro ao criar conta" },
        { status: cognitoResponse.status }
      );
    }

    const internalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add internal API key for server-to-server auth
    // TODO: backend should enforce auth guard on these endpoints (see PR #42)
    if (process.env.INTERNAL_API_KEY) {
      internalHeaders["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
    }

    // 2. Create profile on backend (linked via billingEmail)
    let profileId: string | undefined;
    try {
      const profileResponse = await fetch(`${BACKEND_API}/profile`, {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({
          name: salonName,
          phone,
          billingEmail: email,
          specialty: "Salão de Beleza",
          type: "salon",
          numberOfAppointments: 0,
        }),
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        profileId = profileData.id || profileData._id;
      } else {
        console.error("Profile creation failed:", await profileResponse.text());
      }
    } catch (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // 3. Send magic link via WhatsApp
    try {
      await fetch(`${BACKEND_API}/auth/magic-link`, {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ phone, email }),
      });
    } catch (magicLinkError) {
      console.error("Magic link error:", magicLinkError);
    }

    return NextResponse.json({ success: true, profileId });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Falha ao criar usuário" },
      { status: 500 }
    );
  }
}
