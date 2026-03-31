import { NextResponse } from "next/server";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

export async function POST(req: Request) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email) {
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

    await fetch(`${BACKEND_API}/auth/magic-link`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, email }),
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
