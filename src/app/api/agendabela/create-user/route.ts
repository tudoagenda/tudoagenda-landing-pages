import { NextResponse } from "next/server";

const BACKEND_API = "https://api.agendabela.tudoagenda.com.br/api";

export async function POST(req: Request) {
  try {
    const { email, password, name, salonName, phone } = await req.json();

    if (!email || !password || !name || !salonName || !phone) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // 1. Create Cognito account with user-defined password
    const cognitoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/create-user-and-send`,
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

    // 2. Create profile on backend
    let profileId: string | undefined;
    try {
      const profileResponse = await fetch(`${BACKEND_API}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: salonName,
          phone,
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
        headers: { "Content-Type": "application/json" },
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
