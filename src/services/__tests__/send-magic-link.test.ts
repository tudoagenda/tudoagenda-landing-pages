/**
 * @jest-environment node
 */

import { userService } from "../user";

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("userService.sendMagicLink", () => {
  it("happy path returns { sent: true }", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ sent: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await userService.sendMagicLink("11999999999", "test@example.com");
    expect(result).toEqual({ sent: true });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/agendabela/send-magic-link",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "11999999999", email: "test@example.com" }),
      })
    );
  });

  it("HTTP error throws", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Failed to send magic link" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(
      userService.sendMagicLink("11999999999", "test@example.com")
    ).rejects.toThrow("Failed to send magic link");
  });

  it("non-JSON response throws", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("not json", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    );

    await expect(
      userService.sendMagicLink("11999999999", "test@example.com")
    ).rejects.toThrow("HTTP error! status: 500");
  });
});
