/**
 * @jest-environment node
 */

import { POST } from "../route";
import { POST as ACCESS_LINK } from "../access-link/route";

const ENV = { ...process.env };

function req(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  name: " Carla Souza ",
  salonName: "Studio da Carla",
  phone: "(11) 90000-0000",
  email: "Carla@Exemplo.com",
  password: "Senha123!",
};

function mockFetch(status: number, body: unknown) {
  return jest
    .spyOn(global, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  process.env = { ...ENV, BACKEND_API_URL: "https://api.test/api" };
  delete process.env.LANDING_INTERNAL_KEY;
});
afterAll(() => {
  process.env = ENV;
});

describe("POST /api/agendabela/signup-web", () => {
  it("201: repassa só os 5 campos normalizados, sem taxId", async () => {
    const f = mockFetch(201, { profileId: "p1", email: "carla@exemplo.com", accessLinkSent: true });
    const res = await POST(req("/api/agendabela/signup-web", { ...valid, taxId: "11144477735" }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ profileId: "p1", email: "carla@exemplo.com", accessLinkSent: true });
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/api/subscriptions/signup-web");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Carla Souza",
      salonName: "Studio da Carla",
      email: "carla@exemplo.com",
      phone: "11900000000",
      password: "Senha123!",
    });
  });

  it("sem LANDING_INTERNAL_KEY: chama sem X-Landing-Key nem X-Client-IP", async () => {
    const f = mockFetch(201, { profileId: "p1", email: "e", accessLinkSent: false });
    await POST(req("/api/agendabela/signup-web", valid, { "x-real-ip": "203.0.113.7" }));
    const headers = (f.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["X-Landing-Key"]).toBeUndefined();
    expect(headers["X-Client-IP"]).toBeUndefined();
  });

  it("com a env: manda a chave e o IP visto pelo Railway (X-Real-IP)", async () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    const f = mockFetch(201, { profileId: "p1", email: "e", accessLinkSent: true });
    await POST(
      req("/api/agendabela/signup-web", valid, {
        "x-real-ip": "203.0.113.7",
        "x-forwarded-for": "1.2.3.4, 198.51.100.9",
      }),
    );
    const headers = (f.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["X-Landing-Key"]).toBe("segredo");
    expect(headers["X-Client-IP"]).toBe("203.0.113.7");
  });

  it("409 EMAIL_ALREADY_REGISTERED vira code + mensagem em PT-BR", async () => {
    mockFetch(409, { code: "EMAIL_ALREADY_REGISTERED", message: "Email already registered" });
    const res = await POST(req("/api/agendabela/signup-web", valid));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      code: "EMAIL_ALREADY_REGISTERED",
      error: "Esse e-mail já tem conta.",
    });
  });

  it("409 sem code conhecido não vira Já tem conta", async () => {
    mockFetch(409, { message: "Conflict" });
    const res = await POST(req("/api/agendabela/signup-web", valid));
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBeUndefined();
  });

  it.each([
    [400, 400, "Confira os dados"],
    [429, 429, "Muitas tentativas"],
    [500, 502, "Não consegui criar sua conta"],
  ])("backend %i → %i em PT-BR", async (backend, expected, text) => {
    mockFetch(backend, { message: "internal english message" });
    const res = await POST(req("/api/agendabela/signup-web", valid));
    expect(res.status).toBe(expected);
    const body = await res.json();
    expect(body.error).toContain(text);
    expect(body.error).not.toContain("english");
  });

  it("backend fora do ar → 502", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    const res = await POST(req("/api/agendabela/signup-web", valid));
    expect(res.status).toBe(502);
  });

  it.each([
    [{ ...valid, name: "" }, "nome"],
    [{ ...valid, email: "x@" }, "e-mail"],
    [{ ...valid, phone: "119" }, "WhatsApp"],
    [{ ...valid, password: "senha123" }, "maiúscula"],
  ])("valida a entrada antes do backend (%#)", async (body, text) => {
    const f = jest.spyOn(global, "fetch");
    const res = await POST(req("/api/agendabela/signup-web", body));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain(text);
    expect(f).not.toHaveBeenCalled();
  });

  it("corpo que não é JSON → 400", async () => {
    const res = await POST(req("/api/agendabela/signup-web", "nao-json"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/agendabela/signup-web/access-link", () => {
  it("sempre { ok: true } quando o backend responde 200", async () => {
    const f = mockFetch(200, { ok: true });
    const res = await ACCESS_LINK(req("/x", { email: " Carla@Exemplo.com " }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/api/subscriptions/signup-web/access-link");
    expect(JSON.parse(init.body as string)).toEqual({ email: "carla@exemplo.com" });
  });

  it("e-mail inválido → 400 sem chamar o backend", async () => {
    const f = jest.spyOn(global, "fetch");
    const res = await ACCESS_LINK(req("/x", { email: "nada" }));
    expect(res.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it("429 → mensagem em PT-BR", async () => {
    mockFetch(429, {});
    const res = await ACCESS_LINK(req("/x", { email: "a@b.co" }));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toContain("Espere alguns minutos");
  });

  it("falha do backend → 502 em PT-BR", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    const res = await ACCESS_LINK(req("/x", { email: "a@b.co" }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("Não deu para mandar o link");
  });
});
