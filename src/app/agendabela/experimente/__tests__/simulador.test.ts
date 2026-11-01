import fs from "fs";
import path from "path";
import { EXPERIMENTE_MARKUP } from "../_prototipo/markup";
import { initExperimente } from "../_prototipo/simulador";
import type { ExperimenteEvent } from "@/lib/analytics/dataLayer";

const source = fs.readFileSync(
  path.join(__dirname, "../_prototipo/simulador.js"),
  "utf8",
);

describe("Experimente o Agenda Bela: garantias", () => {
  it("o simulador não faz nenhuma chamada de rede", () => {
    for (const api of [
      "fetch(",
      "XMLHttpRequest",
      "sendBeacon",
      "WebSocket",
      "EventSource",
      "import(",
      "localStorage",
    ]) {
      expect(source).not.toContain(api);
    }
  });

  it("a página não tem formulário nem campo de digitação (zero PII)", () => {
    expect(EXPERIMENTE_MARKUP).not.toMatch(/<(form|input|textarea|select)\b/i);
    expect(source).not.toMatch(/<(form|input|textarea|select)\b/i);
  });

  it("não emite eventos de conversão da Meta", () => {
    expect(source).not.toMatch(/['"](Lead|CompleteRegistration)['"]|fbq\(/);
  });
});

describe("Experimente o Agenda Bela: medição", () => {
  let events: ExperimenteEvent[];
  let cleanup: () => void;

  beforeEach(() => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    Element.prototype.scrollIntoView = jest.fn();
    document.body.innerHTML = `<div class="ab-exp">${EXPERIMENTE_MARKUP}</div>`;
    events = [];
    cleanup = initExperimente({ track: (e) => events.push(e) });
  });

  afterEach(() => cleanup());

  it("dispara lp_view ao montar", () => {
    expect(events).toEqual([expect.objectContaining({ event: "lp_view" })]);
  });

  it("CTA do hero abre a Jornada 1 com cta_click, simulator_start e journey_start", () => {
    (document.getElementById("heroCta") as HTMLButtonElement).click();
    expect(events.slice(1)).toEqual([
      { event: "cta_click", cta_location: "hero" },
      { event: "simulator_start", journey_number: 1 },
      { event: "journey_start", journey_number: 1 },
    ]);
    expect(document.body.classList.contains("sim-open")).toBe(true);
  });

  it("clique em loja dispara store_click com loja e local", () => {
    const badge = document.querySelector<HTMLAnchorElement>(
      '[data-stores] [data-store="badge-android"]',
    );
    badge?.addEventListener("click", (e) => e.preventDefault());
    badge?.click();
    expect(events.at(-1)).toEqual({
      event: "store_click",
      store: "google_play",
      cta_location: "final_selo",
      device_os: "desktop",
    });
  });

  it("no desktop, link de baixar que só rola até os selos não conta como store_click", () => {
    document.querySelector<HTMLAnchorElement>('[data-store="preco"]')?.click();
    expect(events.at(-1)).toEqual({
      event: "cta_click",
      cta_location: "preco_ver_lojas",
    });
  });

  it("repassa a atribuição para o referrer da Google Play", () => {
    cleanup();
    cleanup = initExperimente({
      track: () => {},
      attribution: { utm_source: "meta", utm_campaign: "exp v1" },
    });
    const href = document
      .querySelector('[data-store="badge-android"]')
      ?.getAttribute("href");
    expect(href).toContain(
      "&referrer=" + encodeURIComponent("utm_source=meta&utm_campaign=exp+v1"),
    );
  });

  it("cleanup remove os listeners (sem evento duplicado ao remontar)", () => {
    cleanup();
    cleanup = initExperimente({ track: (e) => events.push(e) });
    events = [];
    (document.getElementById("heroCta") as HTMLButtonElement).click();
    expect(events.filter((e) => e.event === "cta_click")).toHaveLength(1);
  });
});

describe("Experimente o Agenda Bela: simulador e links diretos", () => {
  let events: ExperimenteEvent[];
  let cleanup: (() => void) | null;
  let pushSpy: jest.SpyInstance;

  const mount = () => {
    cleanup = initExperimente({ track: (e) => events.push(e) });
  };
  const flush = () => new Promise((r) => setTimeout(r, 5));
  const starts = () => events.filter((e) => e.event === "journey_start");

  beforeEach(() => {
    // celular (< 900px): o simulador abre em tela cheia e empilha histórico
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    Element.prototype.scrollIntoView = jest.fn();
    history.replaceState(null, "", "/agendabela/experimente?utm_source=suporte");
    document.body.className = "";
    document.body.innerHTML = `<div class="ab-exp">${EXPERIMENTE_MARKUP}</div>`;
    events = [];
    cleanup = null;
    pushSpy = jest.spyOn(history, "pushState");
  });

  afterEach(() => {
    cleanup?.();
    pushSpy.mockRestore();
  });

  it("card do menu dentro do simulador mede 1 journey_start e não empilha histórico extra", async () => {
    mount();
    (document.getElementById("heroCta") as HTMLButtonElement).click();
    document.querySelector<HTMLElement>('#sim [data-a="menu"]')?.click();
    pushSpy.mockClear();
    events = [];
    document.querySelector<HTMLElement>('#sim [data-open="j2"]')?.click();
    expect(starts()).toEqual([{ event: "journey_start", journey_number: 2 }]);
    expect(events.filter((e) => e.event === "simulator_start")).toHaveLength(0);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("simulator_start conta 1 vez por visita", () => {
    mount();
    const hero = document.getElementById("heroCta") as HTMLButtonElement;
    hero.click();
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    document.body.classList.remove("sim-open");
    hero.click();
    expect(events.filter((e) => e.event === "simulator_start")).toHaveLength(1);
    expect(starts()).toHaveLength(2);
  });

  it.each([
    ["marcar-cliente", 1],
    ["sinal-pix", 2],
    ["bela", 3],
    ["clientes", 4],
    ["caixa", 5],
  ])("#%s abre a jornada %i com entry deep_link", async (hash, n) => {
    history.replaceState(null, "", `/agendabela/experimente?utm_source=suporte#${hash}`);
    mount();
    await flush();
    expect(starts()).toEqual([
      { event: "journey_start", journey_number: n, entry: "deep_link" },
    ]);
    expect(document.body.classList.contains("sim-open")).toBe(true);
    // a entrada da página fica sem hash e o simulador ganha a sua, com as UTMs intactas
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(location.search).toBe("?utm_source=suporte");
    expect(location.hash).toBe(`#${hash}`);
  });

  it("hash desconhecido não faz nada", async () => {
    for (const hash of ["loja", "xyz", "%3Cimg%20src%3Dx%3E", "constructor"]) {
      history.replaceState(null, "", `/agendabela/experimente#${hash}`);
      mount();
      await flush();
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      expect(starts()).toHaveLength(0);
      expect(document.body.classList.contains("sim-open")).toBe(false);
      cleanup?.();
      cleanup = null;
    }
  });

  it("link direto aceita maiúsculas e parâmetros depois do hash", async () => {
    history.replaceState(null, "", "/agendabela/experimente#Sinal-Pix&utm_content=x");
    mount();
    await flush();
    expect(starts()).toEqual([
      { event: "journey_start", journey_number: 2, entry: "deep_link" },
    ]);
  });

  it("celular: link direto → card do menu → sair mantém o voltar funcionando", async () => {
    const backSpy = jest.spyOn(history, "back").mockImplementation(() => {});
    history.replaceState(null, "", "/agendabela/experimente#sinal-pix");
    mount();
    await flush();
    document.querySelector<HTMLElement>('#sim [data-a="menu"]')?.click();
    document.querySelector<HTMLElement>('#sim [data-open="j3"]')?.click();
    // a URL deixa de apontar para a J2, mas a entrada continua sendo a do simulador
    expect(location.hash).toBe("#experimente");
    expect((history.state as { sim?: number }).sim).toBe(1);
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(backSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  it("desktop: link direto abre inline e sair limpa o hash sem recarregar", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    history.replaceState(null, "", "/agendabela/experimente?utm_source=suporte#caixa");
    mount();
    await flush();
    expect(starts()).toEqual([
      { event: "journey_start", journey_number: 5, entry: "deep_link" },
    ]);
    expect(pushSpy).not.toHaveBeenCalled();
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(location.hash).toBe("");
    expect(location.search).toBe("?utm_source=suporte");
  });

  it("hashchange repetido para a jornada aberta não duplica eventos", async () => {
    history.replaceState(null, "", "/agendabela/experimente#sinal-pix");
    mount();
    await flush();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(starts()).toHaveLength(1);
    expect(events.filter((e) => e.event === "simulator_start")).toHaveLength(1);
    expect(pushSpy).toHaveBeenCalledTimes(1);
  });
});
