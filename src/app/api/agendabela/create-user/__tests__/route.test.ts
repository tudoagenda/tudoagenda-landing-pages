/**
 * @jest-environment node
 */

import { POST } from "../route";

// Mock the AWS Cognito SDK so the route doesn't hit real AWS
jest.mock("@aws-sdk/client-cognito-identity-provider", () => {
  const send = jest.fn().mockResolvedValue({});
  return {
    CognitoIdentityProviderClient: jest.fn(() => ({ send })),
    SignUpCommand: jest.fn(),
    AdminConfirmSignUpCommand: jest.fn(),
  };
});

// Mock the profile creation fetch call
const originalFetch = global.fetch;
beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: "profile-123" }),
    text: () => Promise.resolve(""),
  }) as unknown as typeof fetch;
});
afterAll(() => {
  global.fetch = originalFetch;
});

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/agendabela/create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: "test@test.com",
  password: "Test1234!",
  name: "Test User",
  salonName: "Test Salon",
  phone: "11999999999",
};

describe("POST /api/create-user", () => {
  test("should return a 200 status", async () => {
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(200);
  });

  test("should return a 400 status when fields are missing", async () => {
    const response = await POST(makeRequest({ email: "" }));
    expect(response.status).toBe(400);
  });

  test("should return a 400 status for invalid email", async () => {
    const response = await POST(makeRequest({ ...validBody, email: "not-an-email" }));
    expect(response.status).toBe(400);
  });

  test("should return a 400 status for short password", async () => {
    const response = await POST(makeRequest({ ...validBody, password: "Ab1!" }));
    expect(response.status).toBe(400);
  });
});
