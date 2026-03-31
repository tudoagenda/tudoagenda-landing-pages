import { NextResponse } from "next/server";

const BACKEND_API =
  process.env.BACKEND_API_URL ||
  "https://api.agendabela.tudoagenda.com.br/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,11}$/;

// In-memory rate limiter: max 3 calls per email per 5 minutes
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export const rateLimitMap = new Map<string, number[]>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(email) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(email, recent);

  if (recent.length >= RATE_LIMIT_MAX) return true;

  recent.push(now);
  rateLimitMap.set(email, recent);
  return false;
}

export async function POST(req: Request) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email || !EMAIL_REGEX.test(email) || !PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: "Phone and email are required" },
        { status: 400 }
      );
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
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
