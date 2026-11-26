import {
  pushAgendaBelaExperimenteEvent,
  pushAgendaBelaListaEsperaEvent,
  pushAgendaBelaLojasEvent,
  pushAgendaBelaMainEvent,
  pushAgendaBelaReativacaoEvent,
} from "../dataLayer";
import { WEB_EVENT_ENDPOINT, newEventId } from "../storeClickBeacon";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

let sendBeacon: jest.Mock;

function beaconBodies(): Record<string, unknown>[] {
  return sendBeacon.mock.calls.map(([, body]) => JSON.parse(body as string));
}

beforeEach(() => {
  window.dataLayer = [];
  window.sessionStorage.clear();
  history.replaceState(null, "", "/agendabela/oferta");
  sendBeacon = jest.fn(() => true);
  Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
});

afterEach(() => {
  // @ts-expect-error o jsdom não tem sendBeacon; devolve o navigator como estava
  delete navigator.sendBeacon;
  jest.restoreAllMocks();
});

describe("store_click: event_id e envio ao servidor", () => {
  it("landing de loja: um clique = um push com UUID v4 = um beacon com o mesmo id", () => {
    history.replaceState(
      null,
      "",
      "/agendabela/oferta?utm_source=meta&fbclid=AbC-123_x&token=segredo#preco",
    );
    pushAgendaBelaLojasEvent("oferta", {
      event: "store_click",
      store: "google_play",
      cta_location: "hero",
      device_os: "android",
      in_app_browser: "instagram",
    });

    expect(window.dataLayer).toHaveLength(1);
    const push = window.dataLayer![0];
    expect(push.event_id).toMatch(UUID_V4);
    // Parâmetros de sempre continuam iguais.
    expect(push).toEqual(
      expect.objectContaining({
        event: "store_click",
        store: "google_play",
        cta_location: "hero",
        device_os: "android",
        in_app_browser: "instagram",
        landing_slug: "oferta",
        landing_type: "campaign",
        product: "agendabela",
      }),
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe(WEB_EVENT_ENDPOINT);
    expect(beaconBodies()[0]).toEqual({
      event_id: push.event_id,
      store: "google_play",
      cta_location: "hero",
      device_os: "android",
      in_app_browser: "instagram",
      landing_slug: "oferta",
      fbclid: "AbC-123_x",
      // Só a origem da visita segue na URL: token e # ficam de fora.
      event_source_url: "http://localhost/agendabela/oferta?utm_source=meta&fbclid=AbC-123_x",
    });
  });

  it("cada clique tem um id novo", () => {
    for (let i = 0; i < 3; i += 1) {
      pushAgendaBelaLojasEvent("black-friday", {
        event: "store_click",
        store: "app_store",
        cta_location: "final",
        device_os: "ios",
        in_app_browser: "none",
      });
    }
    const ids = window.dataLayer!.map((e) => e.event_id);
    expect(new Set(ids).size).toBe(3);
    expect(beaconBodies().map((b) => b.event_id)).toEqual(ids);
  });

  it("página que não manda in_app_browser: o envio detecta pelo User-Agent, e o push fica como era", () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue("Mozilla/5.0 (iPhone) AppleWebKit Mobile Instagram 330.0");
    pushAgendaBelaMainEvent({
      event: "store_click",
      store: "app_store",
      cta_location: "rodape_selo",
      device_os: "ios",
    });
    expect(beaconBodies()[0].in_app_browser).toBe("instagram");
    expect("in_app_browser" in window.dataLayer![0]).toBe(false);
  });

  it("fora do Instagram/Facebook, in_app_browser vai none (Experimente, principal, reativação)", () => {
    history.replaceState(null, "", "/agendabela/experimente");
    pushAgendaBelaExperimenteEvent({
      event: "store_click",
      store: "app_store",
      cta_location: "final_selo",
      device_os: "desktop",
    });
    pushAgendaBelaMainEvent({
      event: "store_click",
      store: "google_play",
      cta_location: "rodape_selo",
      device_os: "android",
    });
    pushAgendaBelaReativacaoEvent({
      event: "store_click",
      store: "app_store",
      cta_location: "sucesso",
      device_os: "ios",
    });

    const bodies = beaconBodies();
    expect(bodies.map((b) => b.landing_slug)).toEqual([
      "experimente",
      "automatize-seu-atendimento",
      "reativacao",
    ]);
    expect(bodies.every((b) => b.in_app_browser === "none")).toBe(true);
    expect(bodies.every((b) => !("fbclid" in b))).toBe(true);
    // O push do dataLayer não ganha in_app_browser onde ele não existia.
    expect(window.dataLayer!.every((e) => !("in_app_browser" in e))).toBe(true);
    window.dataLayer!.forEach((e, i) => expect(e.event_id).toBe(bodies[i].event_id));
  });

  it("fbclid persistido na sessão segue no beacon mesmo sem estar mais na URL", () => {
    history.replaceState(null, "", "/agendabela/oferta?fbclid=IwAR0persistido");
    pushAgendaBelaLojasEvent("oferta", { event: "cta_click", cta_location: "simulador_hero" });
    history.replaceState(null, "", "/agendabela/oferta");
    pushAgendaBelaLojasEvent("oferta", {
      event: "store_click",
      store: "app_store",
      cta_location: "preco",
      device_os: "ios",
      in_app_browser: "facebook",
    });
    expect(beaconBodies()).toHaveLength(1);
    expect(beaconBodies()[0].fbclid).toBe("IwAR0persistido");
  });

  it("o evento seguinte não herda o event_id (com e sem lista de reset) e não manda beacon", () => {
    pushAgendaBelaLojasEvent("oferta", {
      event: "store_click",
      store: "app_store",
      cta_location: "hero",
      device_os: "ios",
      in_app_browser: "none",
    });
    pushAgendaBelaLojasEvent("oferta", { event: "cta_click", cta_location: "simulador_hero" });
    pushAgendaBelaLojasEvent("oferta", {
      event: "lp_view",
      device_os: "ios",
      ref: undefined,
      in_app_browser: "none",
    });
    pushAgendaBelaMainEvent({ event: "cta_click", cta_location: "automatize_avaliacoes" });
    pushAgendaBelaExperimenteEvent({ event: "cta_click", cta_location: "hero" });
    pushAgendaBelaReativacaoEvent({ event: "checkout_opened", flow: "reactivation", source: "x" });
    pushAgendaBelaListaEsperaEvent({ event: "lp_form_submitted", form_name: "lista" });

    const [clique, ...outros] = window.dataLayer!;
    expect(clique.event_id).toMatch(UUID_V4);
    for (const e of outros) {
      expect("event_id" in e).toBe(true);
      expect(e.event_id).toBeUndefined();
    }
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });
});

describe("envio: nunca atrapalha o clique", () => {
  const clique = () =>
    pushAgendaBelaLojasEvent("oferta", {
      event: "store_click",
      store: "app_store",
      cta_location: "hero",
      device_os: "ios",
      in_app_browser: "none",
    });

  it("sendBeacon recusou: cai no fetch com keepalive, uma vez, com o mesmo id", () => {
    sendBeacon.mockReturnValue(false);
    const fetchMock = jest.fn(() => Promise.reject(new Error("rede")));
    (global as unknown as { fetch: unknown }).fetch = fetchMock;
    try {
      expect(clique).not.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe(WEB_EVENT_ENDPOINT);
      expect(init.method).toBe("POST");
      expect(init.keepalive).toBe(true);
      expect(JSON.parse(init.body as string).event_id).toBe(window.dataLayer![0].event_id);
    } finally {
      delete (global as unknown as { fetch?: unknown }).fetch;
    }
  });

  it("sendBeacon lançou erro: o push já saiu e nada estoura", () => {
    sendBeacon.mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(clique).not.toThrow();
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0].event_id).toMatch(UUID_V4);
  });

  it("sem sendBeacon e sem fetch: só o push", () => {
    // @ts-expect-error simula navegador sem sendBeacon
    delete navigator.sendBeacon;
    expect(clique).not.toThrow();
    expect(window.dataLayer).toHaveLength(1);
  });
});

describe("newEventId", () => {
  it("gera UUID v4 também sem crypto.randomUUID", () => {
    const original = globalThis.crypto.randomUUID;
    // @ts-expect-error simula contexto sem randomUUID (http fora de localhost)
    globalThis.crypto.randomUUID = undefined;
    try {
      const a = newEventId();
      const b = newEventId();
      expect(a).toMatch(UUID_V4);
      expect(b).toMatch(UUID_V4);
      expect(a).not.toBe(b);
    } finally {
      globalThis.crypto.randomUUID = original;
    }
  });
});
