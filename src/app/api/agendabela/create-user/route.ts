import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Cognito config
const region = process.env.AWS_REGION || "us-east-1";
const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID || process.env.AWS_USER_POOL_ID || "";

const cognitoClient = new CognitoIdentityProviderClient({
  region,
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export async function POST(req: Request) {
  try {
    const { email, password, name, salonName, phone } = await req.json();

    if (!email || !password || !name || !salonName || !phone) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

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

    // 1. Create Cognito account (SUPPRESS to avoid sending useless verification email)
    await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: email,
        MessageAction: "SUPPRESS",
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
          { Name: "name", Value: name },
          { Name: "custom:role", Value: "admin" },
        ],
      })
    );

    // Set permanent password (AdminCreateUser creates with temp password)
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: email,
        Password: password,
        Permanent: true,
      })
    );

    // 2. Create profile on backend
    const internalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.INTERNAL_API_KEY) {
      internalHeaders["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
    }

    let profileId: string | undefined;
    try {
      const profileResponse = await fetch(`${BACKEND_API}/profile`, {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({
          name: salonName,
          phone: phone.replace(/\D/g, ''),
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

    // 3. Send magic link via WhatsApp (non-blocking)
    const cleanPhone = phone.replace(/\D/g, '');
    try {
      const magicRes = await fetch(`${BACKEND_API}/auth/magic-link`, {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ phone: cleanPhone, email }),
      });
      if (!magicRes.ok) {
        console.warn("Magic link dispatch failed:", magicRes.status);
      }
    } catch (magicError) {
      console.warn("Magic link dispatch error:", magicError);
    }

    return NextResponse.json({ success: true, profileId });
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // Handle Cognito specific errors
    const err = error as { name?: string; __type?: string; message?: string };
    const code = err?.name || err?.__type || "";
    if (code === "UsernameExistsException") {
      return NextResponse.json(
        { error: "Este email já está cadastrado. Tente fazer login." },
        { status: 409 }
      );
    }
    if (code === "InvalidPasswordException") {
      return NextResponse.json(
        { error: "Senha não atende aos requisitos de segurança." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao criar usuário. Tente novamente." },
      { status: 500 }
    );
  }
}
