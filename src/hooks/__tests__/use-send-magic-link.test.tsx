import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSendMagicLink } from "../use-create-user";
import React from "react";

// Mock the service
jest.mock("@/services/user", () => ({
  userService: {
    sendMagicLink: jest.fn().mockResolvedValue({ sent: true }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useSendMagicLink", () => {
  it("mutation wiring works", async () => {
    const { result } = renderHook(() => useSendMagicLink(), { wrapper });

    act(() => {
      result.current.mutate({ phone: "11999999999", email: "test@test.com" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ sent: true });
  });
});
