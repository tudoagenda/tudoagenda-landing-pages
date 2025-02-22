/**
 * @jest-environment node
 */

import { NextResponse } from "next/server";
import * as appHandler from "../route";
import { testApiHandler } from "next-test-api-route-handler";

describe("POST /api/create-user", () => {
  test.concurrent("should return a 200 status", async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({ email: "test@test.com" }),
        });

        expect(response.status).toBe(200);
      },
    });
  });

  test.concurrent("should return a 400 status", async () => {
    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({ email: "" }),
        });

        expect(response.status).toBe(400);
      },
    });
  });

  test.concurrent("should return a 500 status", async () => {
    await testApiHandler({
      appHandler: {
        dynamic: "force-dynamic",
        async POST() {
          return NextResponse.json({ error: "What is this?" }, { status: 500 });
        },
      },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(500);
      },
    });
  });
});
