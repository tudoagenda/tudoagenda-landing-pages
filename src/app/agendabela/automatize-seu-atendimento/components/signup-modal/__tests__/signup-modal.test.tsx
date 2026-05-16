import { fireEvent, render, screen } from "@testing-library/react";
import { SignupModal } from "../signup-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";
import React from "react";

const mockSendMagicLink = jest.fn();
let mockIsPending = false;

jest.mock("@/hooks/use-create-user", () => ({
  useCreateUser: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useCreateBilling: () => ({
    mutate: jest.fn(),
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

describe("SignupModal step 3 — server-authoritative magic link", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    sessionStorage.clear();
  });

  it("does NOT auto-send magic link on mount — the AbacatePay webhook is now the sole trigger", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");

    renderModal();

    expect(mockSendMagicLink).not.toHaveBeenCalled();
  });

  it("shows the 'aguarde 1 min no WhatsApp' copy when phone is present", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");

    renderModal();

    expect(
      screen.getByText(/Pagamento confirmado/i),
    ).toBeInTheDocument();
    // Texto quebrado por <strong>1 minuto</strong> — limita o matcher ao
    // <p> que contém a frase, evitando os ancestrais.
    const paragraphs = screen.getAllByText((_, node) => {
      if (!node) return false;
      if (node.tagName !== "P") return false;
      const text = node.textContent ?? "";
      return text.includes("receber no") && text.includes("WhatsApp");
    });
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("shows fallback CTA to download app when phone is missing", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");

    renderModal();

    expect(
      screen.getByText(/Baixe o app abaixo e faça login com seu email/i),
    ).toBeInTheDocument();
  });

  it("renders 'Reenviar link' button when phone is present and triggers sendMagicLink on tap", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");
    sessionStorage.setItem("agendabela_signup_phone", "11999999999");

    renderModal();

    const resendBtn = screen.getByRole("button", {
      name: /Reenviar link/i,
    });
    fireEvent.click(resendBtn);

    expect(mockSendMagicLink).toHaveBeenCalledTimes(1);
    expect(mockSendMagicLink).toHaveBeenCalledWith(
      { phone: "11999999999", email: "test@test.com" },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it("does NOT render the 'Reenviar' button when phone is missing", () => {
    sessionStorage.setItem("agendabela_signup_email", "test@test.com");

    renderModal();

    expect(
      screen.queryByRole("button", { name: /Reenviar link/i }),
    ).not.toBeInTheDocument();
  });
});
