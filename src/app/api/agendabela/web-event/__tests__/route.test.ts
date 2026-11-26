/**
 * @jest-environment node
 */

import { LANDING_LOJAS } from "@/config/landing-lojas";
import * as route from "../route";

const { POST } = route;
const ENV = { ...process.env };
const EVENT_ID = "3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d";
const URL_ROTA = "https://tudoagenda.com.br/api/agendabela/web-event";

const valido = {
  event_id: EVENT_ID,
  store: "app_store",
  cta_location: "hero",
  device_os: "ios",
  in_app_browser: "instagram",
  landing_slug: "oferta",
  event_source_url: "https://tudoagenda.com.br/agendabela/oferta?utm_source=meta",
};

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request(URL_ROTA, {
    method: "POST",
    // O sendBeacon manda texto puro.
    headers: { "Content-Type": "text/plain;charset=UTF-8", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function mockFetch(status = 202) {
  return jest.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status }));
}

function sent(f: jest.SpyInstance) {
  const [url, init] = f.mock.calls[0] as [string, RequestInit];
  return {
    url,
    init,
    body: JSON.parse(init.body as string),
    headers: init.headers as Record<string, string>,
  };
}

function setNodeEnv(value: string) {
  (process.env as Record<string, string>).NODE_ENV = value;
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  process.env = { ...ENV, BACKEND_API_URL: "https://api.test/api" };
  delete process.env.LANDING_INTERNAL_KEY;
  delete process.env.LANDING_CF_ORIGIN_SECRET;
});
afterAll(() => {
  process.env = ENV;
});

describe("POST /api/agendabela/web-event", () => {
  it("só POST é exportado (o Next responde 405 aos outros métodos)", () => {
    expect(Object.keys(route)).toEqual(["POST"]);
  });

  it("204 e repassa no contrato do backend, com cookies, IP e User-Agent", async () => {
    const f = mockFetch(202);
    const res = await POST(
      req(valido, {
        cookie: "outro=1; _fbp=fb.1.1700000000000.1234567890; _fbc=fb.1.1700000000001.AbCdEf",
        "user-agent": "Mozilla/5.0 (iPhone) Instagram",
        "x-real-ip": "203.0.113.7",
        origin: "https://tudoagenda.com.br",
      }),
    );
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(f).toHaveBeenCalledTimes(1);
    const { url, init, body, headers } = sent(f);
    expect(url).toBe("https://api.test/api/tracking/web-events");
    expect(init.method).toBe("POST");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["User-Agent"]).toBe("Mozilla/5.0 (iPhone) Instagram");
    expect(body).toEqual({
      event_name: "StoreClick",
      event_id: EVENT_ID,
      event_source_url: "https://tudoagenda.com.br/agendabela/oferta?utm_source=meta",
      custom_data: {
        store: "app_store",
        landing_slug: "oferta",
        cta_location: "hero",
        device_os: "ios",
        in_app_browser: "instagram",
      },
      user: {
        fbp: "fb.1.1700000000000.1234567890",
        fbc: "fb.1.1700000000001.AbCdEf",
        client_ip: "203.0.113.7",
        user_agent: "Mozilla/5.0 (iPhone) Instagram",
      },
    });
  });

  it("mesmos cabeçalhos das outras rotas: com a chave e IP confiável, X-Landing-Key e X-Client-IP", async () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    const f = mockFetch();
    await POST(req(valido, { "x-real-ip": "203.0.113.7" }));
    const { headers } = sent(f);
    expect(headers["X-Landing-Key"]).toBe("segredo");
    expect(headers["X-Client-IP"]).toBe("203.0.113.7");
  });

  it("sem cookie _fbc, monta o fbc com o fbclid da sessão", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1790000000000);
    const f = mockFetch();
    const res = await POST(req({ ...valido, fbclid: "IwAR0_abc-123" }));
    expect(res.status).toBe(204);
    expect(sent(f).body.user).toEqual({ fbc: "fb.1.1790000000000.IwAR0_abc-123" });
  });

  it("com cookie _fbc, o cookie vence o fbclid", async () => {
    const f = mockFetch();
    await POST(req({ ...valido, fbclid: "outroClique" }, { cookie: "_fbc=fb.1.1700000000001.AbCdEf" }));
    expect(sent(f).body.user.fbc).toBe("fb.1.1700000000001.AbCdEf");
  });

  it("cookie ou fbclid fora do formato são ignorados, sem derrubar o clique", async () => {
    const f = mockFetch();
    const res = await POST(
      req({ ...valido, fbclid: "com espaço<script>" }, { cookie: "_fbp=qualquer-coisa; _fbc=%E0%A4%A" }),
    );
    expect(res.status).toBe(204);
    expect(sent(f).body.user).toEqual({});
  });

  it("cookie com data fora do formato que o backend aceita fica de fora; o clique segue", async () => {
    const f = mockFetch();
    await POST(req(valido, { cookie: "_fbp=fb.1.1.1; _fbc=fb.1.123.abc" }));
    expect(sent(f).body.user).toEqual({});
  });

  it("User-Agent: caractere de controle vira espaço e o tamanho é limitado", async () => {
    const f = mockFetch();
    await POST(req(valido, { "user-agent": `Mozilla/5.0\t(iPhone) ${"x".repeat(600)}` }));
    const ua = sent(f).body.user.user_agent as string;
    expect(ua.startsWith("Mozilla/5.0 (iPhone) ")).toBe(true);
    expect(ua).toHaveLength(512);
  });

  it("aceita o landing_slug de toda landing de loja da config e dos helpers do dataLayer", async () => {
    const f = mockFetch();
    const slugs = [
      ...Object.values(LANDING_LOJAS).map((c) => c.slug),
      "automatize-seu-atendimento",
      "experimente",
      "reativacao",
    ];
    for (const landing_slug of slugs) {
      expect((await POST(req({ ...valido, landing_slug }))).status).toBe(204);
    }
    expect(f).toHaveBeenCalledTimes(slugs.length);
  });

  it("Origin null (navegador que esconde a origem) não derruba o clique", async () => {
    const f = mockFetch();
    expect((await POST(req(valido, { origin: "null" }))).status).toBe(204);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("sem cookies, IP nem User-Agent: user vazio", async () => {
    const f = mockFetch();
    await POST(req(valido));
    expect(sent(f).body.user).toEqual({});
  });

  it("atrás do CloudFront sem o segredo de origem: IP é a penúltima entrada do X-Forwarded-For, e a chave não vai", async () => {
    process.env.LANDING_INTERNAL_KEY = "segredo";
    const f = mockFetch();
    await POST(
      req(valido, {
        "x-amz-cf-id": "abc",
        "x-forwarded-for": "6.6.6.6, 203.0.113.7, 130.176.1.1",
        "x-real-ip": "130.176.1.1",
      }),
    );
    const { body, headers } = sent(f);
    expect(body.user.client_ip).toBe("203.0.113.7");
    expect(headers["X-Landing-Key"]).toBeUndefined();
    expect(headers["X-Client-IP"]).toBeUndefined();
  });

  it("atrás do CloudFront com X-Forwarded-For estranho: sem IP", async () => {
    const f = mockFetch();
    await POST(req(valido, { "x-amz-cf-id": "abc", "x-forwarded-for": "não-é-ip, 130.176.1.1" }));
    expect(sent(f).body.user.client_ip).toBeUndefined();
    await POST(req(valido, { "x-amz-cf-id": "abc", "x-forwarded-for": "130.176.1.1" }));
    expect(JSON.parse((f.mock.calls[1][1] as RequestInit).body as string).user.client_ip).toBeUndefined();
  });

  it("o IP nunca é logado", async () => {
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockFetch(500);
    await POST(req(valido, { "x-real-ip": "203.0.113.7" }));
    const logs = [...info.mock.calls, ...warn.mock.calls].flat().join(" ");
    expect(logs).not.toContain("203.0.113.7");
    expect(warn).toHaveBeenCalledWith(
      JSON.stringify({ msg: "landing_web_event_falhou", status: 500 }),
    );
  });

  it.each([404, 500, 429, 400])("204 com o backend respondendo %s", async (status) => {
    const f = mockFetch(status);
    const res = await POST(req(valido));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("204 com o backend fora do ar ou lento", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new DOMException("timeout", "TimeoutError"));
    const res = await POST(req(valido));
    expect(res.status).toBe(204);
  });

  it("event_source_url: só a origem da visita segue na query", async () => {
    const f = mockFetch();
    await POST(
      req({
        ...valido,
        landing_slug: "reativacao",
        event_source_url:
          "https://tudoagenda.com.br/agendabela/reativar?token=abc&utm_campaign=bf&fbclid=X1#topo",
      }),
    );
    expect(sent(f).body.event_source_url).toBe(
      "https://tudoagenda.com.br/agendabela/reativar?utm_campaign=bf&fbclid=X1",
    );
  });

  describe("recusa sem chamar o backend", () => {
    const casos: [string, unknown][] = [
      ["JSON quebrado", "{não é json"],
      ["lista em vez de objeto", [valido]],
      ["event_id que não é UUID v4", { ...valido, event_id: "123" }],
      ["UUID v1", { ...valido, event_id: "3f2b8c1e-9a4d-1e7b-8c21-5d6f7a8b9c0d" }],
      ["store fora da lista", { ...valido, store: "amazon" }],
      ["device_os fora da lista", { ...valido, device_os: "windows" }],
      ["in_app_browser fora da lista", { ...valido, in_app_browser: "tiktok" }],
      ["in_app_browser ausente", { ...valido, in_app_browser: undefined }],
      ["landing_slug desconhecido", { ...valido, landing_slug: "outra" }],
      ["cta_location com caractere estranho", { ...valido, cta_location: "hero<script>" }],
      ["cta_location longo", { ...valido, cta_location: "a".repeat(65) }],
      ["URL de outro site", { ...valido, event_source_url: "https://evil.com/agendabela/oferta" }],
      ["domínio parecido", { ...valido, event_source_url: "https://tudoagenda.com.br.evil.com/agendabela/x" }],
      ["subdomínio do Railway", { ...valido, event_source_url: "https://x.up.railway.app/agendabela/oferta" }],
      ["http em produção", { ...valido, event_source_url: "http://tudoagenda.com.br/agendabela/oferta" }],
      ["fora de /agendabela/", { ...valido, event_source_url: "https://tudoagenda.com.br/outra" }],
      ["URL com usuário", { ...valido, event_source_url: "https://a@tudoagenda.com.br/agendabela/oferta" }],
      ["URL gigante", { ...valido, event_source_url: `https://tudoagenda.com.br/agendabela/oferta?ref=${"a".repeat(2000)}` }],
      ["URL ausente", { ...valido, event_source_url: undefined }],
    ];
    it.each(casos)("400: %s", async (_nome, body) => {
      const f = mockFetch();
      const res = await POST(req(body));
      expect(res.status).toBe(400);
      expect(f).not.toHaveBeenCalled();
    });

    it("413: corpo acima do limite", async () => {
      const f = mockFetch();
      const res = await POST(req({ ...valido, lixo: "a".repeat(5000) }));
      expect(res.status).toBe(413);
      expect(f).not.toHaveBeenCalled();
    });

    it("403: pedido vindo de outro site", async () => {
      const f = mockFetch();
      for (const origin of ["https://evil.com", "http://tudoagenda.com.br", "https://tudoagenda.com.br:8443", "lixo"]) {
        expect((await POST(req(valido, { origin }))).status).toBe(403);
      }
      expect(f).not.toHaveBeenCalled();
    });
  });

  describe("ambiente", () => {
    const local = { ...valido, event_source_url: "http://localhost:3000/agendabela/oferta" };

    it("localhost nunca chega ao backend de produção (sem BACKEND_API_URL): 204 sem repasse", async () => {
      delete process.env.BACKEND_API_URL;
      const f = mockFetch();
      const res = await POST(req(local, { origin: "http://localhost:3000" }));
      expect(res.status).toBe(204);
      expect(f).not.toHaveBeenCalled();
    });

    it("localhost com BACKEND_API_URL apontando para produção: também não repassa", async () => {
      process.env.BACKEND_API_URL = "https://api.agendabela.tudoagenda.com.br/api";
      const f = mockFetch();
      expect((await POST(req(local))).status).toBe(204);
      expect(f).not.toHaveBeenCalled();
    });

    it("localhost com backend de teste: repassa", async () => {
      const f = mockFetch();
      expect((await POST(req(local))).status).toBe(204);
      expect(sent(f).url).toBe("https://api.test/api/tracking/web-events");
    });

    it("em produção, URL e Origin de localhost são recusados", async () => {
      setNodeEnv("production");
      const f = mockFetch();
      expect((await POST(req(local))).status).toBe(400);
      expect((await POST(req(valido, { origin: "http://localhost:3000" }))).status).toBe(403);
      expect(f).not.toHaveBeenCalled();
    });

    it("em produção, sem BACKEND_API_URL, a página de produção repassa ao backend padrão", async () => {
      setNodeEnv("production");
      delete process.env.BACKEND_API_URL;
      const f = mockFetch();
      expect((await POST(req(valido, { origin: "https://www.tudoagenda.com.br" }))).status).toBe(204);
      expect(sent(f).url).toBe("https://api.agendabela.tudoagenda.com.br/api/tracking/web-events");
    });
  });
});
