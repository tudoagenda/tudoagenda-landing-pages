/**
 * @jest-environment node
 */

import { POST } from "../route";

const ENV = { ...process.env };
const PID = "11111111-2222-3333-4444-555555555555";

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/agendabela/start-trial", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function mockFetch(status: number, body: unknown) {
  return jest
    .spyOn(global, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  process.env = { ...ENV, BACKEND_API_URL: "https://api.test/api" };
  delete process.env.LANDING_CHECKOUT_RETURN;
  delete process.env.LANDING_INTERNAL_KEY;
});
afterAll(() => {
  process.env = ENV;
});

describe("POST /api/agendabela/start-trial", () => {
  it("200: manda o CPF só com dígitos e devolve a URL do checkout", async () => {
    const f = mockFetch(200, { subscriptionId: "s1", checkoutUrl: "https://pay.abacatepay.com/c" });
    const res = await POST(req({ profileId: PID, taxId: "111.444.777-35" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ checkoutUrl: "https://pay.abacatepay.com/c" });
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://api.test/api/subscriptions/${PID}/start-trial`);
    expect(JSON.parse(init.body as string)).toEqual({ taxId: "11144477735" });
  });

  it("com LANDING_CHECKOUT_RETURN=1 manda origin: landing", async () => {
    process.env.LANDING_CHECKOUT_RETURN = "1";
    const f = mockFetch(200, { checkoutUrl: "https://pay.abacatepay.com/c" });
    await POST(req({ profileId: PID, taxId: "11144477735" }));
    expect(JSON.parse((f.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      taxId: "11144477735",
      origin: "landing",
    });
  });

  it("com a env da chave, manda X-Landing-Key e o último IP do X-Forwarded-For quando não há X-Real-IP", async () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    const f = mockFetch(200, { checkoutUrl: "https://pay.abacatepay.com/c" });
    await POST(
      req({ profileId: PID, taxId: "11144477735" }, { "x-forwarded-for": "6.6.6.6, 198.51.100.9" }),
    );
    const headers = (f.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["X-Landing-Key"]).toBe("segredo");
    expect(headers["X-Client-IP"]).toBe("198.51.100.9");
  });

  it("com a chave mas sem IP válido, não manda a chave sozinha", async () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    const f = mockFetch(200, { checkoutUrl: "https://pay.abacatepay.com/c" });
    await POST(req({ profileId: PID, taxId: "11144477735" }, { "x-real-ip": "não-é-ip" }));
    const headers = (f.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["X-Landing-Key"]).toBeUndefined();
    expect(headers["X-Client-IP"]).toBeUndefined();
  });

  it.each([
    [{ profileId: "../../admin", taxId: "11144477735" }],
    [{ profileId: PID, taxId: "123" }],
    [{ taxId: "11144477735" }],
  ])("entrada inválida → 400 sem chamar o backend (%#)", async (body) => {
    const f = jest.spyOn(global, "fetch");
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it("409 → ALREADY_SUBSCRIBED em PT-BR", async () => {
    mockFetch(409, { message: "Trial already active for this profile" });
    const res = await POST(req({ profileId: PID, taxId: "11144477735" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      code: "ALREADY_SUBSCRIBED",
      error: "Seu cartão já está cadastrado.",
    });
  });

  it.each([
    [404, 404, "Não encontrei sua conta"],
    [400, 400, "Confira o CPF"],
    [503, 502, "Não consegui abrir o pagamento"],
    [500, 502, "Não consegui abrir o pagamento"],
  ])("backend %i → %i em PT-BR", async (backend, expected, text) => {
    mockFetch(backend, { message: "Failed to create trial checkout: english" });
    const res = await POST(req({ profileId: PID, taxId: "11144477735" }));
    expect(res.status).toBe(expected);
    const body = await res.json();
    expect(body.error).toContain(text);
    expect(body.error).not.toContain("english");
  });

  it("200 sem checkoutUrl https → 502", async () => {
    mockFetch(200, { checkoutUrl: "javascript:alert(1)" });
    const res = await POST(req({ profileId: PID, taxId: "11144477735" }));
    expect(res.status).toBe(502);
  });
});
