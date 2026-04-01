import { render, screen, waitFor } from "@testing-library/react";
import { SignupModal } from "../signup-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";
import React from "react";

// Mock sendMagicLink to track calls
const mockSendMagicLink = jest.fn();
let mockIsPending = false;

jest.mock("@/hooks/use-create-user", () => ({
  useCreateUser: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useCreateBilling: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutate: jest.fn((data: { email: string; name: string }, opts?: unknown) => {}),
    isPending: false,
  }),
  useSendMagicLink: () => ({
    mutate: mockSendMagicLink,
    isPending: mockIsPending,
  }),
}));

jest.mock("@/contexts/AmplitudeProvider", () => ({
  AmplitudeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAmplitude: () => ({ track: jest.fn() }),
}));

const queryClient = new QueryClient();

function renderModal(props: Partial<React.ComponentProps<typeof SignupModal>> = {}) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AmplitudeProvider>
        <SignupModal
          open={true}
          onOpenChange={jest.fn()}
          initialEmail="test@test.com"
          initialStep={3}
          {...props}
        />
      </AmplitudeProvider>
    </QueryClientProvider>
  );
}

describe("SignupModal step 3 flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    sessionStorage.clear();
  });

  it("sends magic link on mount when storedPhone exists", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");

    renderModal();

    expect(mockSendMagicLink).toHaveBeenCalledTimes(1);
    expect(mockSendMagicLink).toHaveBeenCalledWith(
      { phone: "11999999999", email: "test@test.com" },
      expect.objectContaining({ onError: expect.any(Function) })
    );
    // Verify dedup flag was set
    expect(sessionStorage.getItem("agendabela_magic_link_sent")).toBe("1");
  });

  it("does not send duplicate magic link on re-render", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");
    sessionStorage.setItem("agendabela_magic_link_sent", "1");

    renderModal();

    expect(mockSendMagicLink).not.toHaveBeenCalled();
  });

  it("shows error state on failure", async () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");

    // Capture the onError callback and call it
    mockSendMagicLink.mockImplementation((_data: unknown, opts: { onError: () => void }) => {
      opts.onError();
    });

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText(/Não conseguimos enviar o link/i)
      ).toBeInTheDocument();
    });
  });

  it("shows fallback message when no storedPhone", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    // No phone stored

    renderModal();

    expect(mockSendMagicLink).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Conta criada! Baixe o app e faça login:/i)
    ).toBeInTheDocument();
    // Should NOT show WhatsApp claim
    expect(
      screen.queryByText(/Enviamos um link pro seu WhatsApp/i)
    ).not.toBeInTheDocument();
  });
});
