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
