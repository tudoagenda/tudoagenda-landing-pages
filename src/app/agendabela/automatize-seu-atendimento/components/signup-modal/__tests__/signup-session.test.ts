import {
  SIGNUP_CONTEXT_KEY,
  consumeCheckoutReturn,
  formatPhone,
  readSignupContext,
} from "../signup-session";

const CTX = {
  profileId: "11111111-2222-3333-4444-555555555555",
  email: "carla@exemplo.com",
  firstName: "Carla",
  accessLinkSent: true,
};

function go(search: string) {
  history.replaceState(null, "", `/agendabela/automatize-seu-atendimento${search}`);
}

beforeEach(() => {
  sessionStorage.clear();
  go("");
});

describe("consumeCheckoutReturn", () => {
  it("sem parâmetro e sem checkout aberto: nada", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(CTX));
    expect(consumeCheckoutReturn()).toBeNull();
  });

  it("?checkout=concluido com contexto → Aprovado, limpa a URL e mantém utm", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify({ ...CTX, checkoutPending: true }));
    go("?utm_source=meta&checkout=concluido");
    expect(consumeCheckoutReturn()).toEqual({ step: "aprovado", result: "concluido" });
    expect(window.location.search).toBe("?utm_source=meta");
    expect(readSignupContext()?.checkoutPending).toBe(false);
  });

  it("?checkout=concluido SEM contexto → Pronto, agora é no app (genérica)", () => {
    go("?checkout=concluido");
    expect(consumeCheckoutReturn()).toEqual({ step: "sem_cartao", result: "concluido" });
    expect(window.location.search).toBe("");
  });

  it("?checkout=voltou com contexto → Desistiu", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify({ ...CTX, checkoutPending: true }));
    go("?checkout=voltou");
    expect(consumeCheckoutReturn()).toEqual({ step: "desistiu", result: "desistiu" });
  });

  it("?checkout=voltou SEM contexto → landing normal, sem erro", () => {
    go("?checkout=voltou");
    expect(consumeCheckoutReturn()).toBeNull();
    expect(window.location.search).toBe("");
  });

  it("volta sem parâmetro com checkout aberto (via agendabela-web) → Desistiu, uma vez só", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify({ ...CTX, checkoutPending: true }));
    expect(consumeCheckoutReturn()).toEqual({ step: "desistiu", result: "desistiu" });
    expect(consumeCheckoutReturn()).toBeNull();
  });

  it("?payment=success (cadastro antigo) conta como concluído", () => {
    go("?payment=success");
    expect(consumeCheckoutReturn()).toEqual({ step: "sem_cartao", result: "concluido" });
  });

  it("contexto corrompido é ignorado", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, "{nao-e-json");
    expect(readSignupContext()).toBeNull();
    expect(consumeCheckoutReturn()).toBeNull();
  });
});

describe("formatPhone", () => {
  it("celular com 11 dígitos e fixo com 10", () => {
    expect(formatPhone("11900000000")).toBe("(11) 90000-0000");
    expect(formatPhone("1132345678")).toBe("(11) 3234-5678");
  });
});
