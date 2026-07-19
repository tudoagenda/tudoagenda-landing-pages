import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SignupModal } from "../signup-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AmplitudeProvider } from "@/contexts/AmplitudeProvider";
import React from "react";

// ---------------------------------------------------------------------------
// Item 3 do plano de checkout abandonado (ADR 0009): a LP de cadastro novo
// (`/agendabela/automatize-seu-atendimento`) precisa avisar quando o email
// digitado já tem um checkout card-first pendente — reaproveitando o mesmo
// lookup de `/agendabela/reativar` (PR #69), sem tocar em backend.
//
// Regra de ouro: greenfield signup (email nunca visto) não pode ganhar
// nenhuma fricção ou atraso perceptível — é o principal endpoint de
// aquisição paga da empresa. Todo caminho de erro do lookup é fail-open.
// ---------------------------------------------------------------------------

const mockLookupReactivation = jest.fn();
let mockCheckingReentry = false;

const mockCreateBilling = jest.fn();

jest.mock("@/hooks/use-create-user", () => ({
  useCreateUser: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useCreateBilling: () => ({
    mutate: mockCreateBilling,
    isPending: false,
  }),
  useSendMagicLink: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-reactivation", () => ({
  useReactivationLookup: () => ({
    mutate: mockLookupReactivation,
    isPending: mockCheckingReentry,
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
          initialEmail=""
          initialStep={1}
          {...props}
        />
      </AmplitudeProvider>
    </QueryClientProvider>,
  );
}

/** Preenche o step 1 inteiro com dados válidos (passa em validateStep1). */
function fillStep1Form(email: string) {
  fireEvent.change(screen.getByPlaceholderText("Seu nome completo"), {
    target: { value: "Julie Andrade" },
  });
  fireEvent.change(screen.getByPlaceholderText("Nome do salão"), {
    target: { value: "Salão da Julie" },
  });
  fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), {
    target: { value: "11999999999" },
  });
  fireEvent.change(screen.getByPlaceholderText("CPF ou CNPJ"), {
    target: { value: "11144477735" },
  });
  fireEvent.change(screen.getByPlaceholderText("Seu e-mail"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Crie uma senha"), {
    target: { value: "Senha123!" },
  });
  fireEvent.change(screen.getByPlaceholderText("Confirme sua senha"), {
    target: { value: "Senha123!" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

function clickContinue() {
  fireEvent.click(screen.getByRole("button", { name: /^Continuar$/ }));
}

describe("SignupModal step 1 — reentrada de checkout pendente (item 3, ADR 0009)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckingReentry = false;
    sessionStorage.clear();

    // jsdom não navega de verdade ao atribuir window.location.href com uma
    // URL completa — substituímos por objeto mutável, mesmo padrão usado em
    // reactivation-flow.test.tsx.
    // @ts-expect-error - delete proposital pra permitir reatribuição
    delete window.location;
    window.location = { ...originalLocation, href: originalLocation.href } as Location;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it("email novo (NEW_SIGNUP_REQUIRED) avança pro step 2 normalmente", async () => {
    mockLookupReactivation.mockImplementation((_email, { onSuccess }) => {
      onSuccess({ status: "NEW_SIGNUP_REQUIRED" });
    });

    renderModal();
    fillStep1Form("nova@example.com");
    clickContinue();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Cadastre seu cartão/i })).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/Que bom te ver de novo/i),
    ).not.toBeInTheDocument();
  });

  it("PENDING_CHECKOUT_FOUND mantém no step 1 e mostra o banner de reentrada", async () => {
    mockLookupReactivation.mockImplementation((_email, { onSuccess }) => {
      onSuccess({
        status: "PENDING_CHECKOUT_FOUND",
        salonName: "Salão da Julie",
        checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
      });
    });

    renderModal();
    fillStep1Form("julie@example.com");
    clickContinue();

    await waitFor(() => {
      expect(screen.getByText(/Que bom te ver de novo, Salão da Julie!/i)).toBeInTheDocument();
    });
    // Continua no step 1 — não foi pro "Cadastre seu cartão"
    expect(screen.queryByRole("heading", { name: /Cadastre seu cartão/i })).not.toBeInTheDocument();
  });

  it("lookup falha/rejeita (erro de rede) avança pro step 2 mesmo assim — fail-open", async () => {
    mockLookupReactivation.mockImplementation((_email, { onError }) => {
      onError(new Error("Network error"));
    });

    renderModal();
    fillStep1Form("qualquer@example.com");
    clickContinue();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Cadastre seu cartão/i })).toBeInTheDocument();
    });
  });

  it("clique em 'Continuar meu cadastro' navega pro checkoutUrl sem chamar createBilling", async () => {
    mockLookupReactivation.mockImplementation((_email, { onSuccess }) => {
      onSuccess({
        status: "PENDING_CHECKOUT_FOUND",
        salonName: "Salão da Julie",
        checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
      });
    });

    renderModal();
    fillStep1Form("julie@example.com");
    clickContinue();

    const continueCheckoutBtn = await screen.findByRole("button", {
      name: /Continuar meu cadastro/i,
    });
    fireEvent.click(continueCheckoutBtn);

    await waitFor(() => {
      expect(window.location.href).toBe("https://pay.abacatepay.com/checkout-abc");
    });
    expect(mockCreateBilling).not.toHaveBeenCalled();
  });

  it("'Não é você?' esconde o banner e evita o loop — próximo Continuar não relança o lookup", async () => {
    mockLookupReactivation.mockImplementation((_email, { onSuccess }) => {
      onSuccess({
        status: "PENDING_CHECKOUT_FOUND",
        salonName: "Salão da Julie",
        checkoutUrl: "https://pay.abacatepay.com/checkout-abc",
      });
    });

    renderModal();
    fillStep1Form("julie@example.com");
    clickContinue();

    const dismissBtn = await screen.findByRole("button", {
      name: /Não é você\? Preencher cadastro novo mesmo assim/i,
    });
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/Que bom te ver de novo/i),
    ).not.toBeInTheDocument();
    expect(mockLookupReactivation).toHaveBeenCalledTimes(1);

    // Segundo clique em "Continuar" não deve rodar o lookup de novo —
    // senão ela cairia no mesmo banner em loop.
    clickContinue();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Cadastre seu cartão/i })).toBeInTheDocument();
    });
    expect(mockLookupReactivation).toHaveBeenCalledTimes(1);
  });
});
