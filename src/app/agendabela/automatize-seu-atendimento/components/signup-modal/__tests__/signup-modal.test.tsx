import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { SignupModal, type SignupStep } from "../signup-modal";
import { SIGNUP_CONTEXT_KEY } from "../signup-session";
import { SignupWebError } from "@/services/signup-web";

const mockSignup = jest.fn();
const mockAccessLink = jest.fn();
const mockStartTrial = jest.fn();

jest.mock("@/services/signup-web", () => {
  const actual = jest.requireActual("@/services/signup-web");
  return {
    ...actual,
    signupWebService: {
      signup: (...a: unknown[]) => mockSignup(...a),
      requestAccessLink: (...a: unknown[]) => mockAccessLink(...a),
      startTrial: (...a: unknown[]) => mockStartTrial(...a),
    },
  };
});

const CTX = {
  profileId: "11111111-2222-3333-4444-555555555555",
  email: "carla@exemplo.com",
  firstName: "Carla",
  accessLinkSent: true,
};

function setUA(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true });
}

function renderAt(step: SignupStep = "cadastro", onOpenChange = jest.fn()) {
  return render(<SignupModal open onOpenChange={onOpenChange} initialStep={step} />);
}

function events() {
  return (window.dataLayer ?? []).map((e) => e.event);
}

function fillCadastro({ password = "Senha123!" } = {}) {
  fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "Carla Souza" } });
  fireEvent.change(screen.getByLabelText("Nome do salão ou espaço"), {
    target: { value: "Studio da Carla" },
  });
  fireEvent.change(screen.getByLabelText("WhatsApp com DDD"), {
    target: { value: "11900000000" },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "Carla@Exemplo.com " } });
  fireEvent.change(screen.getByLabelText("Crie uma senha"), { target: { value: password } });
}

beforeEach(() => {
  jest.clearAllMocks();
  window.dataLayer = [];
  sessionStorage.clear();
  setUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
});

describe("Cadastro (Passo 1 de 2)", () => {
  it("mostra os 5 campos do app, sem CPF, e os termos como texto", () => {
    renderAt();
    expect(screen.getByText("Passo 1 de 2")).toBeInTheDocument();
    for (const label of [
      "Seu nome",
      "Nome do salão ou espaço",
      "WhatsApp com DDD",
      "E-mail",
      "Crie uma senha",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.queryByLabelText(/CPF/)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText(/Ao criar sua conta, você aceita os/)).toBeInTheDocument();
    expect(events()).toContain("signup_step_viewed");
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_step_viewed", signup_step: "cadastro" }),
    );
  });

  it("checklist da senha acende item por item", () => {
    renderAt();
    fireEvent.change(screen.getByLabelText("Crie uma senha"), { target: { value: "abc" } });
    expect(screen.getByText("minúscula").closest("li")).toHaveClass("text-[#3D8B68]");
    expect(screen.getByText("maiúscula").closest("li")).toHaveClass("text-ink-muted");
  });

  it("não chama o backend com campo inválido e mostra erro em PT-BR", () => {
    renderAt();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(mockSignup).not.toHaveBeenCalled();
    expect(screen.getByText("Informe o WhatsApp com DDD.")).toBeInTheDocument();
    expect(screen.getByText("Confira o e-mail.")).toBeInTheDocument();
  });

  it("senha fraca não passa", () => {
    renderAt();
    fillCadastro({ password: "senha123" });
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(mockSignup).not.toHaveBeenCalled();
    expect(screen.getByText(/A senha precisa cumprir todos os itens/)).toBeInTheDocument();
  });

  it("conta criada: grava o contexto sem senha, dispara lp_form_submitted + lp_signup_completed e vai para a Escolha", async () => {
    mockSignup.mockResolvedValue({ ...CTX });
    renderAt();
    fillCadastro();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(await screen.findByText("Como você quer começar seus 7 dias?")).toBeInTheDocument();
    expect(mockSignup).toHaveBeenCalledWith({
      name: "Carla Souza",
      salonName: "Studio da Carla",
      phone: "11900000000",
      email: "carla@exemplo.com",
      password: "Senha123!",
    });
    expect(screen.getByText(/Conta criada, Carla\./)).toBeInTheDocument();
    const stored = sessionStorage.getItem(SIGNUP_CONTEXT_KEY)!;
    expect(JSON.parse(stored)).toEqual(expect.objectContaining({ profileId: CTX.profileId }));
    expect(stored).not.toContain("Senha123!");
    expect(events()).toEqual(
      expect.arrayContaining(["lp_form_submitted", "lp_signup_completed"]),
    );
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "lp_form_submitted", form_name: "signup_web" }),
    );
    // Nada de PII nos eventos.
    expect(JSON.stringify(window.dataLayer)).not.toContain("carla@exemplo.com");
  });

  it("409 EMAIL_ALREADY_REGISTERED vai para Já tem conta", async () => {
    mockSignup.mockRejectedValue(
      new SignupWebError("Esse e-mail já tem conta.", 409, "EMAIL_ALREADY_REGISTERED"),
    );
    renderAt();
    fillCadastro();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(await screen.findByText("Esse e-mail já tem conta.")).toBeInTheDocument();
    expect(events()).toContain("signup_email_exists");
    expect(sessionStorage.getItem(SIGNUP_CONTEXT_KEY)).toBeNull();
  });

  it("erro do servidor fica na tela, em PT-BR, e mede signup_failed", async () => {
    mockSignup.mockRejectedValue(
      new SignupWebError("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429),
    );
    renderAt();
    fillCadastro();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas tentativas seguidas");
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_failed", failure_reason: "rate_limited", signup_step: "cadastro" }),
    );
  });

  it("erro inesperado (não SignupWebError) mostra fallback localizado, nunca a mensagem crua", async () => {
    mockSignup.mockRejectedValue(new TypeError("Failed to fetch"));
    renderAt();
    fillCadastro();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não consegui criar sua conta agora");
    expect(alert).not.toHaveTextContent("Failed to fetch");
  });

  it("voltar fecha o cadastro", () => {
    const onOpenChange = jest.fn();
    renderAt("cadastro", onOpenChange);
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Já tem conta", () => {
  async function reach() {
    mockSignup.mockRejectedValue(
      new SignupWebError("Esse e-mail já tem conta.", 409, "EMAIL_ALREADY_REGISTERED"),
    );
    renderAt();
    fillCadastro();
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    await screen.findByText("Esse e-mail já tem conta.");
  }

  it("Esqueci a senha pede o link de acesso e mostra o texto combinado", async () => {
    mockAccessLink.mockResolvedValue({ ok: true });
    await reach();
    fireEvent.click(screen.getByRole("button", { name: "Esqueci a senha" }));
    expect(
      await screen.findByText("Se esse e-mail tiver conta, mandei o link no seu WhatsApp e no e-mail."),
    ).toBeInTheDocument();
    expect(mockAccessLink).toHaveBeenCalledWith("carla@exemplo.com");
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "access_link_requested", signup_step: "ja_tem_conta" }),
    );
  });

  it("falha no link mostra erro em PT-BR", async () => {
    mockAccessLink.mockRejectedValue(new SignupWebError("Você já pediu o link várias vezes.", 429));
    await reach();
    fireEvent.click(screen.getByRole("button", { name: "Esqueci a senha" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Você já pediu o link várias vezes.");
  });

  it("Usar outro e-mail volta ao cadastro com o resto preenchido", async () => {
    await reach();
    fireEvent.click(screen.getByRole("button", { name: "Usar outro e-mail" }));
    expect(screen.getByLabelText("Seu nome")).toHaveValue("Carla Souza");
    expect(screen.getByLabelText("E-mail")).toHaveFocus();
  });

  it("Entrar no app leva à loja do aparelho e mede store_click", async () => {
    setUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    await reach();
    const link = screen.getByRole("link", { name: "Entrar no app" });
    expect(link).toHaveAttribute("href", expect.stringContaining("apps.apple.com"));
    fireEvent.click(link);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "store_click", cta_location: "ja_tem_conta_entrar_app", store: "app_store" }),
    );
  });

  it("no computador, Entrar no app vira orientação", async () => {
    await reach();
    expect(screen.queryByRole("link", { name: "Entrar no app" })).not.toBeInTheDocument();
    expect(screen.getByText(/Abra o app Agenda Bela no seu celular/)).toBeInTheDocument();
  });
});

describe("Escolha", () => {
  beforeEach(() => sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX)));

  it("cartão em destaque e sem cartão como 2ª opção", () => {
    renderAt("escolha");
    const buttons = screen.getAllByRole("button").filter((b) => /cartão/.test(b.textContent ?? ""));
    expect(buttons[0]).toHaveTextContent("SEM PREOCUPAÇÃO DEPOIS");
    expect(buttons[0]).toHaveTextContent("Já cadastrar o cartão");
    expect(buttons[1]).toHaveTextContent("Testar 7 dias sem cartão");
  });

  it("escolher sem cartão mede e mostra Pronto, agora é no app", () => {
    renderAt("escolha");
    fireEvent.click(screen.getByRole("button", { name: /Testar 7 dias sem cartão/ }));
    expect(screen.getByText("Pronto, Carla! Agora é no app.")).toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_path_chosen", signup_path: "sem_cartao", signup_step: "escolha" }),
    );
  });

  it("escolher cartão mede e mostra Cadastre seu cartão", () => {
    renderAt("escolha");
    fireEvent.click(screen.getByRole("button", { name: /Já cadastrar o cartão/ }));
    expect(screen.getByText("Cadastre seu cartão")).toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_path_chosen", signup_path: "cartao" }),
    );
  });

  it("fechar chama onOpenChange(false)", () => {
    const onOpenChange = jest.fn();
    renderAt("escolha", onOpenChange);
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Sem cartão (agora é no app)", () => {
  beforeEach(() => sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX)));

  it("mostra a regra dos 7 dias, os selos, o e-mail dela e reenvia o link", async () => {
    setUA("Mozilla/5.0 (Linux; Android 14)");
    mockAccessLink.mockResolvedValue({ ok: true });
    renderAt("sem_cartao");
    expect(screen.getByText(/começam quando você configurar sua agenda no app/)).toBeInTheDocument();
    expect(screen.getByText("E-mail: carla@exemplo.com")).toBeInTheDocument();
    const badge = await screen.findByAltText("Disponível no Google Play");
    fireEvent.click(badge);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "store_click", cta_location: "cadastro_sem_cartao_selo" }),
    );
    const open = screen.getByRole("link", { name: "Já baixei, abrir o app" });
    expect(open).toHaveAttribute("href", expect.stringContaining("play.google.com"));

    fireEvent.click(screen.getByRole("button", { name: "Não chegou? Reenviar link" }));
    expect(await screen.findByText(/Mandei o link de novo/)).toBeInTheDocument();
    expect(mockAccessLink).toHaveBeenCalledWith("carla@exemplo.com");
  });

  it("genérica (sem contexto): sem regra dos 7 dias e sem e-mail", () => {
    sessionStorage.clear();
    renderAt("sem_cartao");
    expect(screen.getByText("Pronto! Agora é no app.")).toBeInTheDocument();
    expect(screen.queryByText(/começam quando você configurar/)).not.toBeInTheDocument();
    expect(screen.getByText("Ou entre com seu e-mail e senha")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reenviar link/ })).not.toBeInTheDocument();
  });
});

describe("Cartão", () => {
  beforeEach(() => sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX)));

  it("pede CPF só aqui e valida antes de chamar", () => {
    renderAt("cartao");
    expect(screen.getByLabelText("CPF ou CNPJ")).toBeInTheDocument();
    expect(screen.getByText("Pedido só aqui, para o pagamento.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar cartão e começar" }));
    expect(mockStartTrial).not.toHaveBeenCalled();
    expect(screen.getByText("Confira o CPF ou CNPJ.")).toBeInTheDocument();
  });

  it("abre o checkout: marca a aba, mede checkout_opened e redireciona", async () => {
    mockStartTrial.mockResolvedValue({ checkoutUrl: "https://pay.abacatepay.com/x" });
    const original = window.location;
    // @ts-expect-error jsdom: troca location para capturar o redirect
    delete window.location;
    // @ts-expect-error objeto simples basta
    window.location = { href: "http://localhost/" };

    renderAt("cartao");
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "111.444.777-35" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar cartão e começar" }));

    await waitFor(() => expect(window.location.href).toBe("https://pay.abacatepay.com/x"));
    expect(mockStartTrial).toHaveBeenCalledWith(CTX.profileId, "11144477735");
    expect(JSON.parse(sessionStorage.getItem(SIGNUP_CONTEXT_KEY)!).checkoutPending).toBe(true);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "checkout_opened", flow: "new_signup", source: "lp_signup_web" }),
    );
    expect(JSON.stringify(window.dataLayer)).not.toContain("11144477735");
    // @ts-expect-error restaura
    window.location = original;
  });

  it("409 (cartão já entrou) mostra Aprovado", async () => {
    mockStartTrial.mockRejectedValue(
      new SignupWebError("Seu cartão já está cadastrado.", 409, "ALREADY_SUBSCRIBED"),
    );
    renderAt("cartao");
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "11144477735" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar cartão e começar" }));
    expect(
      await screen.findByText("Cartão cadastrado! Seus 7 dias grátis começaram"),
    ).toBeInTheDocument();
    // Cartão de antes: não promete data contada de hoje.
    expect(screen.getByText(/A data da primeira cobrança, de R\$ 59,90, está no seu perfil/)).toBeInTheDocument();
    expect(screen.queryByText(/Nada foi cobrado hoje/)).not.toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "checkout_returned", checkout_result: "ja_cadastrado" }),
    );
  });

  it("409 de assinatura ativa (paga ou loja) fica no Cartão com aviso, sem Aprovado", async () => {
    mockStartTrial.mockRejectedValue(
      new SignupWebError("Você já tem uma assinatura ativa. É só entrar no app com seu e-mail e senha.", 409, "ALREADY_ACTIVE"),
    );
    renderAt("cartao");
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "11144477735" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar cartão e começar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("assinatura ativa");
    expect(screen.queryByText(/Cartão cadastrado!/)).not.toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_failed", failure_reason: "already_active" }),
    );
  });

  it("falha do checkout mostra erro e deixa seguir sem cartão", async () => {
    mockStartTrial.mockRejectedValue(new SignupWebError("Não consegui abrir o pagamento agora.", 502));
    renderAt("cartao");
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "11144477735" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar cartão e começar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não consegui abrir o pagamento agora.");
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_failed", signup_step: "cartao", failure_reason: "server" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Prefiro testar sem cartão" }));
    expect(screen.getByText("Pronto, Carla! Agora é no app.")).toBeInTheDocument();
  });
});

describe("Aprovado", () => {
  it("mostra a data da cobrança, os selos e reenvia o link", async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 6, 12));
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX));
    mockAccessLink.mockResolvedValue({ ok: true });
    renderAt("aprovado");
    expect(screen.getByText(/será em 13\/11/)).toBeInTheDocument();
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByAltText("Baixar na App Store")).toBeInTheDocument();
    jest.useRealTimers();
    fireEvent.click(screen.getByRole("button", { name: "Não recebeu? Reenviar link" }));
    await waitFor(() => expect(mockAccessLink).toHaveBeenCalledWith("carla@exemplo.com"));
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "access_link_requested", signup_step: "aprovado" }),
    );
  });
});

describe("Desistiu", () => {
  it("oferece sem cartão e tentar de novo", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX));
    renderAt("desistiu");
    expect(screen.getByText("Tudo bem, sua conta continua criada.")).toBeInTheDocument();
    expect(screen.getByText("Nada foi cobrado.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar cadastrar o cartão de novo" }));
    expect(screen.getByText("Cadastre seu cartão")).toBeInTheDocument();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "signup_path_chosen", signup_path: "cartao", signup_step: "desistiu" }),
    );
  });

  it("sem contexto, não oferece tentar o cartão de novo", () => {
    renderAt("desistiu");
    expect(
      screen.queryByRole("button", { name: "Tentar cadastrar o cartão de novo" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Testar 7 dias sem cartão" }));
    expect(screen.getByText("Pronto! Agora é no app.")).toBeInTheDocument();
  });
});
