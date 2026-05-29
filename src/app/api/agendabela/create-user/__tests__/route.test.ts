/**
 * @jest-environment node
 */

import { POST } from "../route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/agendabela/create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/create-user", () => {
  test("should reject direct account creation before card setup", async () => {
    const response = await POST(makeRequest({ email: "test@test.com" }));
    expect(response.status).toBe(410);
  });
});
