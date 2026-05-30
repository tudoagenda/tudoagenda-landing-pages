/**
 * @jest-environment node
 *
 * Testes do BFF de lookup de reativação.
 * Cobre: validação de input, repasse ao backend, normalização de erros.
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
  return new Request("http://localhost/api/agendabela/reactivation/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agendabela/reactivation/lookup", () => {
  test("rejects empty identifier", async () => {
    const response = await POST(makeRequest({ identifier: "" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects missing identifier", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("rejects identifier that is neither email nor phone", async () => {
    const response = await POST(makeRequest({ identifier: "abc" }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("accepts valid email and forwards lowercase to backend", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: "LEGACY_INACTIVE",
          salonName: "Salão da Loide",
          maskedEmail: "l***@hotmail.com",
          maskedPhone: "(11) 9****-3421",
          lookupToken: "tok_abc123",
        }),
        { status: 200 },
      ),
    );

    const response = await POST(makeRequest({ identifier: "Loide@hotmail.com" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/subscriptions/reactivation/lookup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ identifier: "loide@hotmail.com" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("LEGACY_INACTIVE");
    expect(body.salonName).toBe("Salão da Loide");
  });

  test("accepts valid phone number (digits only) and strips formatting", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ status: "LEGACY_INACTIVE", lookupToken: "tok_xyz" }),
        { status: 200 },
      ),
    );

    const response = await POST(makeRequest({ identifier: "(11) 99999-1234" }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ identifier: "11999991234" }),
      }),
    );
    expect(response.status).toBe(200);
  });

  test("includes X-Internal-Key header when env var is set", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ALREADY_ACTIVE" }), { status: 200 }),
    );

    await POST(makeRequest({ identifier: "test@example.com" }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Internal-Key": "test-internal-key",
        }),
      }),
    );
  });

  test("proxies backend 4xx with passthrough status", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Profile not found", code: "NOT_FOUND" }),
        { status: 404 },
      ),
    );

    const response = await POST(makeRequest({ identifier: "unknown@test.com" }));
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("returns 502 when backend returns 5xx", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Internal server error", { status: 500 }),
    );

    const response = await POST(makeRequest({ identifier: "test@example.com" }));
    expect(response.status).toBe(502);
  });

  test("returns 500 on unexpected exception", async () => {
    jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const response = await POST(makeRequest({ identifier: "test@example.com" }));
    expect(response.status).toBe(500);
  });

  test("handles ALREADY_ACTIVE status transparently", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ALREADY_ACTIVE" }), { status: 200 }),
    );

    const response = await POST(makeRequest({ identifier: "ativa@example.com" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ALREADY_ACTIVE");
  });

  test("handles NEW_SIGNUP_REQUIRED status transparently", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "NEW_SIGNUP_REQUIRED" }), { status: 200 }),
    );

    const response = await POST(makeRequest({ identifier: "nova@example.com" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("NEW_SIGNUP_REQUIRED");
  });
});
