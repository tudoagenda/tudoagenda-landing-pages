import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Cognito config
const region = process.env.AWS_REGION || "us-east-1";
const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID || process.env.AWS_USER_POOL_ID || "";
const clientId = process.env.AWS_COGNITO_USER_POOL_CLIENT_ID || process.env.AWS_USER_POOL_CLIENT_ID || "";
const clientSecret = process.env.AWS_COGNITO_USER_POOL_CLIENT_SECRET || process.env.AWS_USER_POOL_CLIENT_SECRET || "";

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

function generateSecretHash(username: string): string | undefined {
  if (!clientSecret) return undefined;
  return createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

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

    // 1. Create Cognito account
    const signUpInput = {
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "custom:role", Value: "admin" },
      ],
      ...(generateSecretHash(email) ? { SecretHash: generateSecretHash(email) } : {}),
    };

    await cognitoClient.send(new SignUpCommand(signUpInput));

    // Auto-confirm user for immediate login
    await cognitoClient.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: userPoolId,
        Username: email,
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
