import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ReactivationFlow } from "../reactivation-flow";
import { reactivationService } from "@/services/reactivation";

jest.mock("@/services/reactivation", () => ({
  reactivationService: {
    lookup: jest.fn(),
    start: jest.fn(),
  },
}));

const mockLookup = reactivationService.lookup as jest.Mock;
const mockStart = reactivationService.start as jest.Mock;

function renderFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReactivationFlow />
    </QueryClientProvider>,
  );
}

function submitLookup(identifier: string) {
  fireEvent.change(screen.getByLabelText(/Email ou WhatsApp/i), {
    target: { value: identifier },
  });
  fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
}

describe("ReactivationFlow — PENDING_CHECKOUT_FOUND (checkout card-first abandonado)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    // jsdom não implementa navegação real; substituímos location por um
    // objeto mutável pra podermos ler o href atribuído pelo componente.
    // Mantemos o href original válido (em vez de vazio) porque o
    // next/image resolve a URL da logo usando window.location como base.
    // @ts-expect-error - delete proposital pra permitir reatribuição
    delete window.location;
    window.location = {
      ...originalLocation,
      href: originalLocation.href,
    } as Location;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it("mostra o step de confirmação (sem campos de senha) quando o lookup retorna PENDING_CHECKOUT_FOUND", async () => {
    mockLookup.mockResolvedValue({
      status: "PENDING_CHECKOUT_FOUND",
      salonName: "Salão da Julie",
      maskedEmail: "j***@gmail.com",
      maskedPhone: "(11) 9****-8821",
      checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
    });

    renderFlow();
    submitLookup("julie@example.com");

    await waitFor(() =>
      expect(screen.getByText("Salão da Julie")).toBeInTheDocument(),
    );

    expect(screen.getByText(/j\*\*\*@gmail\.com/)).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 9\*\*\*\*-8821/)).toBeInTheDocument();
    expect(screen.getByText(/Nada foi cobrado/i)).toBeInTheDocument();

    // Diferença chave em relação ao fluxo legado: não pede senha nova.
    expect(
      screen.queryByPlaceholderText(/Nova senha/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Confirme a senha/i),
    ).not.toBeInTheDocument();
  });

  it("ao confirmar, navega direto pro checkoutUrl da resposta do lookup, sem chamar /reactivation/start", async () => {
    mockLookup.mockResolvedValue({
      status: "PENDING_CHECKOUT_FOUND",
      salonName: "Salão da Julie",
      checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
    });

    renderFlow();
    submitLookup("julie@example.com");

    const confirmButton = await screen.findByRole("button", {
      name: /Confirmar cartão com 30 dias grátis/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(window.location.href).toBe(
        "https://pay.abacatepay.com/checkout-abc",
      ),
    );
    expect(mockStart).not.toHaveBeenCalled();
  });

  it("'Não é você? Voltar' reseta pro step de lookup", async () => {
    mockLookup.mockResolvedValue({
      status: "PENDING_CHECKOUT_FOUND",
      checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
    });

    renderFlow();
    submitLookup("julie@example.com");

    const backLink = await screen.findByText(/Não é você\? Voltar/i);
    fireEvent.click(backLink);

    expect(
      screen.getByRole("heading", { name: /O Agenda Bela agora virou app\./i }),
    ).toBeInTheDocument();
  });
});

describe("ReactivationFlow — regressão dos fluxos já existentes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("LEGACY_PROFILE_FOUND continua indo pro step confirm com campos de senha", async () => {
    mockLookup.mockResolvedValue({
      status: "LEGACY_PROFILE_FOUND",
      salonName: "Salão da Loide",
      maskedEmail: "l***@hotmail.com",
      maskedPhone: "(11) 9****-3421",
      reactivationToken: "mock-token-abc123",
    });

    renderFlow();
    submitLookup("loide@example.com");

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Nova senha/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByPlaceholderText(/Confirme a senha/i),
    ).toBeInTheDocument();
  });

  it("ALREADY_ACTIVE continua mostrando a mensagem de conta já ativa", async () => {
    mockLookup.mockResolvedValue({ status: "ALREADY_ACTIVE" });

    renderFlow();
    submitLookup("ativa@example.com");

    await waitFor(() =>
      expect(
        screen.getByText(/Sua conta já está ativa\./i),
      ).toBeInTheDocument(),
    );
  });

  it("NEW_SIGNUP_REQUIRED continua mostrando o CTA de cadastro novo", async () => {
    mockLookup.mockResolvedValue({ status: "NEW_SIGNUP_REQUIRED" });

    renderFlow();
    submitLookup("desconhecida@example.com");

    await waitFor(() =>
      expect(
        screen.getByText(/Não encontramos sua conta\./i),
      ).toBeInTheDocument(),
    );
  });
});
