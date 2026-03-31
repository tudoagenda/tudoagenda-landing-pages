import { userService } from "../user";

describe("userService", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const createUserParams = {
    email: "test@example.com",
    password: "Test1234!",
    name: "Test User",
    salonName: "Test Salon",
    phone: "11999999999",
  };

  it("should create a user and return a response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, profileId: "profile-123" }),
    }) as unknown as typeof fetch;

    const response = await userService.createUser(createUserParams);
    expect(response).toEqual({ success: true, profileId: "profile-123" });
  });

  it("should return an error if the user creation fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "User creation failed" }),
    }) as unknown as typeof fetch;

    await expect(userService.createUser(createUserParams)).rejects.toThrow(
      "User creation failed"
    );
  });

  it("should send a magic link successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sent: true }),
    }) as unknown as typeof fetch;

    const response = await userService.sendMagicLink("11999999999", "test@example.com");
    expect(response).toEqual({ sent: true });
  });

  it("should throw when magic link fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Failed to send magic link" }),
    }) as unknown as typeof fetch;

    await expect(
      userService.sendMagicLink("11999999999", "test@example.com")
    ).rejects.toThrow("Failed to send magic link");
  });
});
