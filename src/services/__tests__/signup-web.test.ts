/**
 * @jest-environment node
 */

import { SignupWebError, signupWebService } from "../signup-web";

beforeEach(() => jest.restoreAllMocks());

describe("signupWebService", () => {
  it("rede caiu: SignupWebError status 0 com mensagem em PT-BR, nunca a do fetch", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const err = await signupWebService
      .signup({ name: "a", salonName: "b", phone: "11900000000", email: "a@b.co", password: "Senha123!" })
      .catch((e) => e);
    expect(err).toBeInstanceOf(SignupWebError);
    expect(err.status).toBe(0);
    expect(err.message).toContain("Sem conexão");
    expect(err.message).not.toContain("Failed to fetch");
  });

  it("erro com corpo usa error e code da rota", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "EMAIL_ALREADY_REGISTERED", error: "Esse e-mail já tem conta." }), { status: 409 }),
    );
    const err = await signupWebService.requestAccessLink("a@b.co").catch((e) => e);
    expect(err).toEqual(
      expect.objectContaining({ status: 409, code: "EMAIL_ALREADY_REGISTERED", message: "Esse e-mail já tem conta." }),
    );
  });

  it("erro sem corpo legível cai no fallback localizado", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(new Response("<html>502</html>", { status: 502 }));
    const err = await signupWebService.startTrial("p", "11144477735").catch((e) => e);
    expect(err.status).toBe(502);
    expect(err.message).toContain("Não consegui abrir o pagamento");
  });

  it("sucesso devolve o JSON", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ checkoutUrl: "https://x" }), { status: 200 }),
    );
    await expect(signupWebService.startTrial("p", "1")).resolves.toEqual({ checkoutUrl: "https://x" });
  });
});
