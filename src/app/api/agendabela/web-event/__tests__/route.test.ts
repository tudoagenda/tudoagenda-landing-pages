/**
 * @jest-environment node
 */

import { LANDING_LOJAS } from "@/config/landing-lojas";
import { loadAwsRanges, parseAwsRanges } from "@/lib/server/client-ip";
import { webEventRateLimiter } from "@/lib/server/rate-limit";
import * as route from "../route";

jest.mock("@/lib/server/client-ip", () => ({
  ...jest.requireActual("@/lib/server/client-ip"),
  loadAwsRanges: jest.fn(),
}));

const { POST } = route;
const IP = "203.0.113.7";
/** Faixas "da AWS" do teste: 130.176.0.0/16 faz o papel do CloudFront. */
const FAIXAS_AWS = parseAwsRanges({
  prefixes: [{ ip_prefix: "130.176.0.0/16" }, { ip_prefix: "3.80.0.0/12" }],
  ipv6_prefixes: [{ ipv6_prefix: "2600:9000::/28" }],
});
const ENV = { ...process.env };
const EVENT_ID = "3f2b8c1e-9a4d-4e7b-8c21-5d6f7a8b9c0d";
const UA = "Mozilla/5.0 (teste)";
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

/** Pedido com User-Agent e IP (X-Real-IP), o mínimo para ser repassado. `semIp` tira o IP. */
function req(body: unknown, headers: Record<string, string> = {}, semIp = false) {
  return new Request(URL_ROTA, {
    method: "POST",
    // O sendBeacon manda texto puro.
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "user-agent": UA,
      ...(semIp ? {} : { "x-real-ip": IP }),
      ...headers,
    },
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
  webEventRateLimiter.reset();
  (loadAwsRanges as jest.Mock).mockReset().mockResolvedValue(FAIXAS_AWS);
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
    expect(sent(f).body.user).toEqual({
      fbc: "fb.1.1790000000000.IwAR0_abc-123",
      client_ip: IP,
      user_agent: UA,
    });
  });

  it("o fbc leva a hora em que o fbclid foi visto na sessão, não a do clique", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1790000000000);
    const f = mockFetch();
    await POST(req({ ...valido, fbclid: "IwAR0abc", fbclid_seen_at: 1789999400000 }));
    expect(sent(f).body.user.fbc).toBe("fb.1.1789999400000.IwAR0abc");
  });

  it.each([
    ["no futuro", 1790003600000],
    ["velha demais", 1700000000000],
    ["texto", "1789999400000"],
    ["quebrada", 1789999400000.5],
  ])("hora do fbclid %s: usa a hora do clique", async (_nome, fbclid_seen_at) => {
    jest.spyOn(Date, "now").mockReturnValue(1790000000000);
    const f = mockFetch();
    const res = await POST(req({ ...valido, fbclid: "IwAR0abc", fbclid_seen_at }));
    expect(res.status).toBe(204);
    expect(sent(f).body.user.fbc).toBe("fb.1.1790000000000.IwAR0abc");
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
    expect(sent(f).body.user).toEqual({ client_ip: IP, user_agent: UA });
  });

  it("cookie com data fora do formato que o backend aceita fica de fora; o clique segue", async () => {
    const f = mockFetch();
    await POST(req(valido, { cookie: "_fbp=fb.1.1.1; _fbc=fb.1.123.abc" }));
    expect(sent(f).body.user).toEqual({ client_ip: IP, user_agent: UA });
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

  describe("mínimo de user_data que a Meta aceita", () => {
    const FBP = "_fbp=fb.1.1700000000000.1234567890";

    it("só User-Agent (sem IP, fbp nem fbc): 204 sem repassar", async () => {
      const f = mockFetch();
      const res = await POST(req(valido, {}, true));
      expect(res.status).toBe(204);
      expect(f).not.toHaveBeenCalled();
    });

    it.each([
      ["IP", { "x-real-ip": IP }, {}, { client_ip: IP }],
      ["fbp", { cookie: FBP }, {}, { fbp: "fb.1.1700000000000.1234567890" }],
      ["fbc do cookie", { cookie: "_fbc=fb.1.1700000000001.AbCdEf" }, {}, { fbc: "fb.1.1700000000001.AbCdEf" }],
      ["fbc montado do fbclid", {}, { fbclid: "IwAR0abc" }, { fbc: expect.stringMatching(/^fb\.1\.\d{13}\.IwAR0abc$/) }],
    ])("User-Agent + %s: repassa", async (_nome, headers, extra, esperado) => {
      const f = mockFetch();
      const res = await POST(req({ ...valido, ...extra }, headers as Record<string, string>, true));
      expect(res.status).toBe(204);
      expect(f).toHaveBeenCalledTimes(1);
      expect(sent(f).body.user).toEqual({ ...esperado, user_agent: UA });
    });

    it('User-Agent "Amazon CloudFront" (o CloudFront não repassou o da visitante) conta como sem User-Agent', async () => {
      const f = mockFetch();
      const res = await POST(req(valido, { "user-agent": "Amazon CloudFront", cookie: FBP }));
      expect(res.status).toBe(204);
      expect(f).not.toHaveBeenCalled();
    });
  });

  it.each([["ausente", ""], ["só espaço e controle", " \t "]])(
    "User-Agent %s: 204 sem repassar (a Meta recusaria o evento)",
    async (_nome, ua) => {
      const f = mockFetch();
      const res = await POST(req(valido, { "user-agent": ua }));
      expect(res.status).toBe(204);
      expect(f).not.toHaveBeenCalled();
    },
  );

  describe("IP atrás do CloudFront sem a borda do Railway (produção de hoje)", () => {
    const cf = (h: Record<string, string>) => ({ "x-amz-cf-id": "abc", cookie: "_fbp=fb.1.1700000000000.1", ...h });
    const ipEnviado = async (h: Record<string, string>) => {
      const f = mockFetch();
      f.mockClear();
      await POST(req(valido, cf(h), true));
      expect(f).toHaveBeenCalledTimes(1);
      return sent(f).body.user.client_ip as string | undefined;
    };

    it("CloudFront-Viewer-Address vence (IPv4 e IPv6, sem a porta)", async () => {
      expect(await ipEnviado({ "cloudfront-viewer-address": "198.51.100.10:46532", "x-forwarded-for": "6.6.6.6" })).toBe(
        "198.51.100.10",
      );
      expect(await ipEnviado({ "cloudfront-viewer-address": "2804:14c:1::abcd:46532" })).toBe("2804:14c:1::abcd");
    });

    it("CloudFront-Viewer-Address privado ou quebrado é ignorado", async () => {
      expect(await ipEnviado({ "cloudfront-viewer-address": "10.0.0.5:1234" })).toBeUndefined();
      expect(await ipEnviado({ "cloudfront-viewer-address": "lixo" })).toBeUndefined();
    });

    it("X-Forwarded-For sem X-Real-IP: a última entrada é a visitante (o CloudFront acrescenta ao fim)", async () => {
      expect(await ipEnviado({ "x-forwarded-for": "198.51.100.10" })).toBe("198.51.100.10");
      // A da esquerda veio do navegador (forjável) e nunca é lida.
      expect(await ipEnviado({ "x-forwarded-for": "6.6.6.6, 198.51.100.10" })).toBe("198.51.100.10");
    });

    it("saltos de infraestrutura à direita (nó do CloudFront, IP da AWS, IP privado) são pulados", async () => {
      expect(await ipEnviado({ "x-forwarded-for": "198.51.100.10, 130.176.1.1" })).toBe("198.51.100.10");
      expect(await ipEnviado({ "x-forwarded-for": "6.6.6.6, 198.51.100.10, 130.176.1.1, 10.0.3.4" })).toBe(
        "198.51.100.10",
      );
      expect(await ipEnviado({ "x-forwarded-for": "198.51.100.10, 2600:9000::1" })).toBe("198.51.100.10");
    });

    it("só infraestrutura no X-Forwarded-For: sem IP (nunca o IP de um proxy)", async () => {
      expect(await ipEnviado({ "x-forwarded-for": "130.176.1.1" })).toBeUndefined();
      expect(await ipEnviado({ "x-forwarded-for": "3.85.1.1, 10.0.0.1" })).toBeUndefined();
    });

    it("entrada que não é IP antes de achar a visitante: sem IP", async () => {
      expect(await ipEnviado({ "x-forwarded-for": "198.51.100.10, lixo, 130.176.1.1" })).toBeUndefined();
    });

    it("sem a lista de faixas da AWS, o X-Forwarded-For não é usado", async () => {
      (loadAwsRanges as jest.Mock).mockResolvedValue(null);
      expect(await ipEnviado({ "x-forwarded-for": "198.51.100.10" })).toBeUndefined();
    });

    it("cadeia do Railway (última = X-Real-IP): penúltima, mesmo sem a lista de faixas", async () => {
      (loadAwsRanges as jest.Mock).mockResolvedValue(null);
      expect(
        await ipEnviado({ "x-forwarded-for": "6.6.6.6, 198.51.100.10, 130.176.1.1", "x-real-ip": "130.176.1.1" }),
      ).toBe("198.51.100.10");
    });
  });

  it.each([
    "10.1.2.3",
    "172.16.0.9",
    "172.31.255.1",
    "192.168.1.10",
    "127.0.0.1",
    "169.254.10.10",
    "100.64.0.1",
    "::1",
    "fe80::1",
    "fd12:3456::1",
    "::ffff:10.0.0.1",
  ])("IP privado ou reservado (%s) nunca vai como client_ip", async (ip) => {
    const f = mockFetch();
    const cookie = "_fbp=fb.1.1700000000000.1";
    // Direto, no CloudFront-Viewer-Address e no X-Forwarded-For.
    await POST(req(valido, { "x-real-ip": ip, cookie }));
    await POST(req(valido, { "x-amz-cf-id": "abc", "cloudfront-viewer-address": `${ip}:443`, cookie }, true));
    await POST(req(valido, { "x-amz-cf-id": "abc", "x-forwarded-for": ip, cookie }, true));
    expect(f).toHaveBeenCalledTimes(3);
    for (const call of f.mock.calls) {
      expect(JSON.parse((call[1] as RequestInit).body as string).user.client_ip).toBeUndefined();
    }
  });

  it("IP público (v4 e v6) vai como client_ip", async () => {
    const f = mockFetch();
    await POST(req(valido, { "x-real-ip": "172.32.0.1" }));
    await POST(req(valido, { "x-real-ip": "2804:14c:1::abcd" }));
    expect(f.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string).user.client_ip)).toEqual([
      "172.32.0.1",
      "2804:14c:1::abcd",
    ]);
  });

  describe("limite por IP (20 por minuto)", () => {
    const de = (ip: string) => ({ "x-real-ip": ip });

    it("o 21º clique do mesmo IP no minuto responde 204 sem repassar; outro IP segue", async () => {
      jest.spyOn(Date, "now").mockReturnValue(1790000000000);
      const f = mockFetch();
      for (let i = 0; i < 25; i += 1) {
        expect((await POST(req(valido, de("203.0.113.7")))).status).toBe(204);
      }
      expect(f).toHaveBeenCalledTimes(20);
      expect((await POST(req(valido, de("203.0.113.8")))).status).toBe(204);
      expect(f).toHaveBeenCalledTimes(21);
    });

    it("passado o minuto, o IP volta a ser repassado", async () => {
      const now = jest.spyOn(Date, "now").mockReturnValue(1790000000000);
      const f = mockFetch();
      for (let i = 0; i < 21; i += 1) await POST(req(valido, de("203.0.113.7")));
      expect(f).toHaveBeenCalledTimes(20);
      now.mockReturnValue(1790000060001);
      await POST(req(valido, de("203.0.113.7")));
      expect(f).toHaveBeenCalledTimes(21);
    });

    it("pedidos sem IP confiável dividem uma chave só", async () => {
      const f = mockFetch();
      for (let i = 0; i < 22; i += 1) await POST(req(valido));
      expect(f).toHaveBeenCalledTimes(20);
    });

    it("pedido inválido não gasta o limite", async () => {
      const f = mockFetch();
      for (let i = 0; i < 30; i += 1) await POST(req({ ...valido, store: "x" }, de("203.0.113.7")));
      await POST(req(valido, de("203.0.113.7")));
      expect(f).toHaveBeenCalledTimes(1);
    });
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

    it("413: corpo em pedaços, sem Content-Length, para de ser lido ao passar do limite", async () => {
      const f = mockFetch();
      let enviados = 0;
      const pedaco = new TextEncoder().encode("a".repeat(1024));
      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          enviados += 1;
          if (enviados > 1000) controller.close();
          else controller.enqueue(pedaco);
        },
      });
      const pedido = new Request(URL_ROTA, {
        method: "POST",
        headers: { "user-agent": UA },
        body: stream,
        duplex: "half",
      } as RequestInit);
      expect(pedido.headers.get("content-length")).toBeNull();
      const res = await POST(pedido);
      expect(res.status).toBe(413);
      // Leu pouco mais que os 4 KB do teto, não o megabyte inteiro.
      expect(enviados).toBeLessThan(10);
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

  describe("diagnóstico (só sim/não e contagens)", () => {
    const CAMPOS = [
      "xff_len",
      "xff_publicos",
      "has_real_ip",
      "last_eq_real_ip",
      "has_cf_viewer_address",
      "via_cloudfront",
      "has_ip",
      "ip_fonte",
      "has_ua",
      "ua_cloudfront",
      "has_cookie_header",
      "has_fbp",
      "has_fbc",
    ];
    const SEGREDOS = ["198.51.100.10", "6.6.6.6", "130.176.1.1", "fb.1.1700000000000.555", "Mozilla", UA];
    const pedido = (extra: Record<string, unknown> = {}) =>
      req(
        { ...valido, ...extra },
        {
          "x-amz-cf-id": "abc",
          "x-forwarded-for": "6.6.6.6, 198.51.100.10, 130.176.1.1",
          cookie: "_fbp=fb.1.1700000000000.555",
        },
        true,
      );

    it("diag: true devolve o que o servidor viu e NÃO repassa nem gasta o limite", async () => {
      const f = mockFetch();
      const res = await POST(pedido({ diag: true }));
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe("no-store");
      const texto = await res.text();
      expect(JSON.parse(texto)).toEqual({
        xff_len: 3,
        xff_publicos: 3,
        has_real_ip: false,
        last_eq_real_ip: false,
        has_cf_viewer_address: false,
        via_cloudfront: true,
        has_ip: true,
        ip_fonte: "xff_rightmost",
        has_ua: true,
        ua_cloudfront: false,
        has_cookie_header: true,
        has_fbp: true,
        has_fbc: false,
        repassaria: true,
        motivo: null,
      });
      for (const s of SEGREDOS) expect(texto).not.toContain(s);
      expect(f).not.toHaveBeenCalled();
      expect(webEventRateLimiter.size()).toBe(0);
    });

    it("diag: true sem o mínimo diz o motivo", async () => {
      const res = await POST(req({ ...valido, diag: true }, {}, true));
      expect(await res.json()).toEqual(
        expect.objectContaining({ has_ip: false, ip_fonte: "none", repassaria: false, motivo: "sem_user_data" }),
      );
    });

    it("diag que não é true é ignorado (evento normal)", async () => {
      const f = mockFetch();
      expect((await POST(pedido({ diag: "true" }))).status).toBe(204);
      expect(f).toHaveBeenCalledTimes(1);
    });

    it("uma linha de log por evento válido, repassado ou não, sem IP, cookie nem User-Agent", async () => {
      const info = jest.spyOn(console, "info").mockImplementation(() => {});
      mockFetch();
      await POST(pedido());
      await POST(req(valido, {}, true));
      const linhas = info.mock.calls
        .map((c) => String(c[0]))
        .filter((l) => l.includes('"landing_web_event"'));
      expect(linhas).toHaveLength(2);
      const [ok, descartado] = linhas.map((l) => JSON.parse(l));
      expect(Object.keys(ok).sort()).toEqual(["msg", ...CAMPOS, "repassado", "motivo"].sort());
      expect(ok).toEqual(expect.objectContaining({ repassado: true, motivo: null, ip_fonte: "xff_rightmost" }));
      expect(descartado).toEqual(expect.objectContaining({ repassado: false, motivo: "sem_user_data" }));
      for (const s of SEGREDOS) expect(linhas.join(" ")).not.toContain(s);
    });

    it("o log diz quando o limite por IP segurou o evento", async () => {
      const info = jest.spyOn(console, "info").mockImplementation(() => {});
      mockFetch();
      for (let i = 0; i < 21; i += 1) await POST(req(valido));
      const ultimo = JSON.parse(
        info.mock.calls.map((c) => String(c[0])).filter((l) => l.includes('"landing_web_event"')).pop()!,
      );
      expect(ultimo).toEqual(expect.objectContaining({ repassado: false, motivo: "limite_por_ip" }));
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
      // Em produção o diagnóstico de IP também usa o fetch (faixas do CloudFront).
      expect(f.mock.calls.map((c) => String(c[0]))).toContain(
        "https://api.agendabela.tudoagenda.com.br/api/tracking/web-events",
      );
    });
  });
});
