/**
 * @jest-environment node
 *
 * Testes do BFF de start de reativação.
 * Cobre: validação de lookupToken e password, repasse ao backend,
 * tratamento de token expirado (410), checkout indisponível.
 */

import { POST } from "../route";

const originalEnv = process.env;

beforeEach(() => {
  jest.restoreAllMocks();
  process.env = {
    ...originalEnv,
    BACKEND_API_URL: "https://api.example.test/api",
    INTERNAL_API_KEY: "test-internal-key",
  };
});

afterAll(() => {
  process.env = originalEnv;
});

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/agendabela/reactivation/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agendabela/reactivation/start", () => {
  const validBody = {
    lookupToken: "tok_valid_abc123",
    newPassword: "MinhaSenh4!",
  };

  test("rejects missing lookupToken", async () => {
    const response = await POST(makeRequest({ newPassword: "MinhaSenh4!" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects empty lookupToken", async () => {
    const response = await POST(makeRequest({ lookupToken: "", newPassword: "MinhaSenh4!" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects short password (< 8 chars)", async () => {
    const response = await POST(makeRequest({ lookupToken: "tok_abc", newPassword: "abc" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("forwards valid payload to backend and returns checkoutUrl", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ checkoutUrl: "https://pay.abacatepay.com/checkout/mock123" }),
        { status: 200 },
      ),
    );

    const response = await POST(makeRequest(validBody));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/subscriptions/reactivation/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(validBody),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Internal-Key": "test-internal-key",
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.checkoutUrl).toBe("https://pay.abacatepay.com/checkout/mock123");
  });

  test("returns 410 with TOKEN_EXPIRED code when backend returns 410", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Token expired" }),
        { status: 410 },
      ),
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(410);
    const body = await response.json();
    expect(body.code).toBe("TOKEN_EXPIRED");
    expect(body.error).toBeTruthy();
  });

  test("returns 502 when backend is missing checkoutUrl in 200 response", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("returns 502 when backend returns 5xx", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Gateway error", { status: 503 }),
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
  });

  test("returns 500 on unexpected exception", async () => {
    jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Connection refused"));

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(500);
  });

  test("proxies backend 4xx errors (non-410) with original status", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Invalid token", code: "INVALID_TOKEN" }),
        { status: 422 },
      ),
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });
});
