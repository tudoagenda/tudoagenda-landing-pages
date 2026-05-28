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
  test("delegates trial checkout creation to backend start-trial endpoint", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          checkoutUrl: "https://pay.abacatepay.com/checkout/test",
          subscriptionId: "sub_123",
        }),
        { status: 200 },
      ),
    );

    const response = await POST(makeRequest({ profileId: "profile-123" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/subscriptions/profile-123/start-trial",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": "test-internal-key",
        },
      },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://pay.abacatepay.com/checkout/test",
      id: "sub_123",
    });
  });

  test("requires profileId", async () => {
    const response = await POST(makeRequest({ email: "test@example.com" }));
    expect(response.status).toBe(400);
  });

  test("returns 502 when backend fails", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Backend error", { status: 500 }),
    );

    const response = await POST(makeRequest({ profileId: "profile-123" }));
    expect(response.status).toBe(502);
  });
});
