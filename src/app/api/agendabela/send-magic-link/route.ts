import { NextResponse } from "next/server";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,11}$/;

export async function POST(req: Request) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email || !EMAIL_REGEX.test(email) || !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: "Phone and email are required" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.INTERNAL_API_KEY) {
      headers["X-Internal-Key"] = process.env.INTERNAL_API_KEY;
    }

    const response = await fetch(`${BACKEND_API}/auth/magic-link`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, email }),
    });

    if (!response.ok) {
      console.error("Backend magic link failed:", response.status);
      return NextResponse.json(
        { error: "Failed to send magic link" },
        { status: 502 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
