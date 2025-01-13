/**
 * @jest-environment node
 */

import { setupServer } from "msw/node";
import { userService } from "../user";
import { successHandler, errorHandler } from "../../mocks/handlers";

// Setup MSW server
const server = setupServer();

describe("userService", () => {
  it("should create a user and return a response", async () => {
    server.use(successHandler);
    server.listen();

    const email = "test@example.com";
    const response = await userService.createUser(email);

    expect(response).toEqual({ message: "User created", user: email });

    server.resetHandlers();
    server.close();
  });

  it("should return an error if the user creation fails", async () => {
    server.use(errorHandler);
    server.listen();

    const email = "test@example.com";

    await expect(userService.createUser(email)).rejects.toThrow(
      "HTTP error occurred! status: 500"
    );

    server.resetHandlers();
    server.close();
  });
});
