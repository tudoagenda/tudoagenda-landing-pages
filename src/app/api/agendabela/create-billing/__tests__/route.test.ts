/**
 * @jest-environment node
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
  return new Request("http://localhost/api/agendabela/create-billing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agendabela/create-billing", () => {
  const validBody = {
    email: "test@example.com",
    password: "Test1234!",
    name: "Test User",
    salonName: "Test Salon",
    phone: "11999999999",
    taxId: "12345678901",
  };

  test("delegates card-first pending signup checkout creation to backend", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          checkoutUrl: "https://pay.abacatepay.com/checkout/test",
          pendingSignupId: "pending_123",
        }),
        { status: 200 },
      ),
    );

    const response = await POST(makeRequest(validBody));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/subscriptions/signup-trial",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": "test-internal-key",
        },
        body: JSON.stringify(validBody),
      },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://pay.abacatepay.com/checkout/test",
      pendingSignupId: "pending_123",
    });
  });

  test("requires complete signup data", async () => {
    const response = await POST(makeRequest({ email: "test@example.com" }));
    expect(response.status).toBe(400);
  });

  test("rejects invalid CPF/CNPJ length", async () => {
    const response = await POST(
      makeRequest({ ...validBody, taxId: "123" }),
    );
    expect(response.status).toBe(400);
  });

  test("returns 502 when backend fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Backend error", { status: 500 }),
    );

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
  });
});
