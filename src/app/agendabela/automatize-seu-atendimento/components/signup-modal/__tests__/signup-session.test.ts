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

  it("?checkout=concluido com contexto marca o cartão na aba", () => {
    sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify({ ...CTX, checkoutPending: true }));
    go("?checkout=concluido");
    consumeCheckoutReturn();
    const ctx = readSignupContext()!;
    expect(ctx.cardDone).toBe(true);
    expect(typeof ctx.cardRegisteredAt).toBe("number");
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
  it.each([
    ["11900000000", "(11) 90000-0000"],
    ["1132345678", "(11) 3234-5678"],
    ["+55 (91) 98765-4321", "(91) 98765-4321"],
    ["55 91 98765 4321", "(91) 98765-4321"],
    ["+55 11 3234-5678", "(11) 3234-5678"],
    ["0 15 91 98765-4321", "(91) 98765-4321"],
    ["091 98765-4321", "(91) 98765-4321"],
    ["(55) 99876-5432", "(55) 99876-5432"],
    ["91-98765 4321", "(91) 98765-4321"],
  ])("%s → %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });

  it("digitar +55 tecla a tecla termina em DDD + número", () => {
    let v = "";
    for (const ch of "+5591987654321") v = formatPhone(v + ch);
    expect(v).toBe("(91) 98765-4321");
  });
});
