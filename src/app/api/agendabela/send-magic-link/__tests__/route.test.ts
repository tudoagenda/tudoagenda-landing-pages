/**
 * @jest-environment node
 */

import { POST } from "../route";

beforeEach(() => {
  jest.restoreAllMocks();
});

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/agendabela/send-magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = { phone: "11999999999", email: "test@test.com" };

describe("POST /api/agendabela/send-magic-link", () => {
  test("happy path returns { sent: true }", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ sent: true });
  });

  test("missing phone returns 400", async () => {
    const response = await POST(makeRequest({ email: "test@test.com" }));
    expect(response.status).toBe(400);
  });

  test("missing email returns 400", async () => {
    const response = await POST(makeRequest({ phone: "11999999999" }));
    expect(response.status).toBe(400);
  });

  test("invalid format returns 400", async () => {
    const response = await POST(makeRequest({ phone: "123", email: "notanemail" }));
    expect(response.status).toBe(400);
  });

  test("backend error returns 502", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Backend error", { status: 500 })
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
  });

  test("rate limiting returns 429 after 3 calls", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const rateLimitBody = { phone: "11999999999", email: "ratelimit@test.com" };

    // First 3 should succeed
    for (let i = 0; i < 3; i++) {
      const response = await POST(makeRequest(rateLimitBody));
      expect(response.status).toBe(200);
    }

    // 4th should be rate limited
    const response = await POST(makeRequest(rateLimitBody));
    expect(response.status).toBe(429);
  });
});
