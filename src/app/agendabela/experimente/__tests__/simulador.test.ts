import fs from "fs";
import path from "path";
import { EXPERIMENTE_MARKUP } from "../_prototipo/markup";
import { initExperimente } from "../_prototipo/simulador";
import {
  pushAgendaBelaExperimenteEvent,
  type ExperimenteEvent,
} from "@/lib/analytics/dataLayer";

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

describe("Experimente o Agenda Bela: medição por passo", () => {
  let events: ExperimenteEvent[];
  let cleanup: () => void;

  /** Segue o destaque clicável da Bela como a usuária: alerta, folha, destaque, botão do coach. */
  const nextAction = () =>
    [
      "#sim .ios-alert-bg .hint[data-a]",
      "#sim .backdrop .hint[data-a]",
      "#sim .hint[data-a]",
      "#sim .coach .act .btn",
    ]
      .map((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel)).at(-1))
      .find(Boolean);

  const play = (maxSteps = 40) => {
    for (let i = 0; i < maxSteps; i++) {
      if (document.querySelector("#doneOv .done-card")) return true;
      const el = nextAction();
      if (!el) return false;
      el.click();
      jest.advanceTimersByTime(1500);
    }
    return false;
  };
  const of = (name: string) => events.filter((e) => e.event === name);

  beforeEach(() => {
    jest.useFakeTimers();
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }); // desktop: os dois celulares visíveis
    Element.prototype.scrollIntoView = jest.fn();
    history.replaceState(null, "", "/agendabela/experimente");
    document.body.className = "";
    document.body.innerHTML = `<div class="ab-exp">${EXPERIMENTE_MARKUP}</div>`;
    events = [];
    cleanup = initExperimente({ track: (e) => events.push(e) });
    jest.advanceTimersByTime(10);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it.each([
    ["j1", 1, 5],
    ["j2", 2, 5],
    ["j3", 3, 3],
    ["j4", 4, 5],
    ["j5", 5, 3],
  ])("%s completa gera os journey_step 1..N em ordem e nenhum journey_exit", (j, n, total) => {
    document.querySelector<HTMLElement>(`#sim [data-open="${j}"]`)?.click();
    expect(play()).toBe(true);
    const steps = of("journey_step");
    expect(steps.map((e) => (e as { step: number }).step)).toEqual(
      Array.from({ length: total }, (_, i) => i + 1),
    );
    for (const e of steps) {
      expect(e).toEqual(
        expect.objectContaining({ journey_number: n, step_total: total, step_name: expect.stringMatching(/^[a-z_]+$/) }),
      );
      expect((e as { duration_ms: number }).duration_ms).toBeGreaterThanOrEqual(0);
    }
    expect(events.some((e) => "journey" in e)).toBe(false);
    // depois de concluir, abrir outra jornada não conta como desistência
    document.querySelector<HTMLElement>("#doneOv .next-link")?.click();
    expect(of("journey_exit")).toHaveLength(0);
  });

  it("J2: só a Escova é tocável no link da cliente; os outros serviços não mudam nada", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j2"]')?.click();
    for (let i = 0; i < 20 && !document.querySelector('#sim [data-a="bk-svc"]'); i++) {
      nextAction()?.click();
      jest.advanceTimersByTime(1500);
    }
    const cards = Array.from(document.querySelectorAll<HTMLElement>("#sim .bk-card[data-v]"));
    expect(cards.map((c) => [c.dataset.v, c.getAttribute("aria-disabled")])).toEqual([
      ["s1", null],
      ["s2", "true"],
      ["s3", "true"],
    ]);
    const escova = cards[0];
    expect(escova.classList.contains("hint")).toBe(true);
    expect(escova.textContent).toContain("Sinal de R$ 20,00");
    const before = document.getElementById("clientScreen")?.innerHTML;
    const n = events.length;
    for (const c of cards.slice(1)) {
      expect(c.getAttribute("tabindex")).toBe("-1");
      c.click();
    }
    expect(document.getElementById("clientScreen")?.innerHTML).toBe(before);
    expect(events).toHaveLength(n);
    // o toque mostra o aviso padrão do teste, sem texto novo
    expect(document.getElementById("toast")?.textContent).toContain("Neste teste, esse toque não faz nada.");
  });

  it("J2 completa sempre passa por cliente_paga_sinal, sem passo pulado", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j2"]')?.click();
    expect(play()).toBe(true);
    const steps = of("journey_step") as Array<Record<string, unknown>>;
    expect(steps.map((e) => e.step_name)).toEqual([
      "ligar_sinal",
      "mandar_link",
      "cliente_escolhe_horario",
      "cliente_paga_sinal",
      "receber_aviso_e_dinheiro",
    ]);
    expect(steps.some((e) => e.skipped)).toBe(false);
  });

  it("nenhum evento usa o parâmetro journey (padrão é journey_number)", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j1"]')?.click();
    nextAction()?.click();
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(events.length).toBeGreaterThan(3);
    expect(events.some((e) => "journey" in e)).toBe(false);
  });

  it("sair no passo 2 gera 1 journey_exit com last_step=2", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j1"]')?.click();
    nextAction()?.click(); // conclui o passo 1 (abrir a agenda)
    expect(of("journey_step")).toHaveLength(1);
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(of("journey_exit")).toEqual([
      {
        event: "journey_exit",
        journey_number: 1,
        last_step: 2,
        last_step_name: "escolher_servicos",
        step_total: 5,
        exit_reason: "sair",
      },
    ]);
  });

  it("trocar de jornada no meio gera journey_exit da anterior", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j4"]')?.click();
    document.querySelector<HTMLElement>('#sim [data-a="menu"]')?.click();
    document.querySelector<HTMLElement>('#sim [data-open="j5"]')?.click();
    expect(of("journey_exit")).toEqual([
      {
        event: "journey_exit",
        journey_number: 4,
        last_step: 1,
        last_step_name: "marcar_veio",
        step_total: 5,
        exit_reason: "menu",
      },
    ]);
    expect(of("journey_start").map((e) => (e as { journey_number: number }).journey_number)).toEqual([4, 5]);
  });

  it("CTA da página para outra jornada no meio gera journey_exit trocar_jornada", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j1"]')?.click();
    nextAction()?.click();
    document.querySelector<HTMLElement>('[data-local="beneficios"][data-open="j5"]')?.click();
    expect(of("journey_exit")).toEqual([
      expect.objectContaining({ journey_number: 1, last_step: 2, exit_reason: "trocar_jornada" }),
    ]);
  });

  it("passo pulado sai marcado como skipped, sem tempo", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j3"]')?.click();
    jest.advanceTimersByTime(3000);
    document.querySelector<HTMLElement>('#sim [data-a="j3-bell"]')?.click(); // abre as novidades antes de divulgar
    const steps = of("journey_step") as Array<Record<string, unknown>>;
    expect(steps.map((e) => [e.step, e.skipped ?? false])).toEqual([
      [1, true],
      [2, false],
    ]);
    expect(steps[0].duration_ms).toBe(0);
    expect(steps[1].duration_ms).toBeGreaterThanOrEqual(3000);
  });

  it("voltar a um passo anterior e sair reporta o passo em que ela estava", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j1"]')?.click();
    nextAction()?.click(); // passo 1 concluído, abre o formulário
    document.querySelector<HTMLElement>('#sim [data-a="form-cancel"]')?.click(); // volta para a agenda
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(of("journey_exit")).toEqual([
      expect.objectContaining({ last_step: 1, last_step_name: "abrir_agenda" }),
    ]);
  });

  it("re-render não repete journey_step e o tempo do passo é medido", () => {
    document.querySelector<HTMLElement>('#sim [data-open="j1"]')?.click();
    jest.advanceTimersByTime(4000);
    nextAction()?.click();
    document.querySelector<HTMLElement>('#sim [data-a="tab"][data-v="client"]')?.click();
    expect(of("journey_step")).toHaveLength(1);
    expect((of("journey_step")[0] as { duration_ms: number }).duration_ms).toBeGreaterThanOrEqual(4000);
  });
});

describe("Experimente o Agenda Bela: medição por passo no celular", () => {
  let events: ExperimenteEvent[];
  let cleanup: () => void;
  const of = (name: string) => events.filter((e) => e.event === name);

  beforeEach(() => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    Element.prototype.scrollIntoView = jest.fn();
    document.body.className = "";
    document.body.innerHTML = `<div class="ab-exp">${EXPERIMENTE_MARKUP}</div>`;
    events = [];
  });
  afterEach(() => cleanup());

  it("link direto marca entry nos passos e Sair (voltar do histórico) gera 1 journey_exit", async () => {
    history.replaceState(null, "", "/agendabela/experimente#sinal-pix");
    const backSpy = jest.spyOn(history, "back").mockImplementation(() => {
      // como o navegador: volta para a entrada da página (sem hash) e dispara popstate
      history.replaceState(null, "", "/agendabela/experimente");
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    });
    cleanup = initExperimente({ track: (e) => events.push(e) });
    await new Promise((r) => setTimeout(r, 5));
    document.querySelector<HTMLElement>('#sim [data-a="j2-dep"]')?.click();
    document.querySelector<HTMLElement>('#sim [data-a="j2-depval"]')?.click();
    document.querySelector<HTMLElement>('#sim [data-a="j2-save-svc"]')?.click();
    expect(of("journey_step")).toEqual([
      expect.objectContaining({ journey_number: 2, step: 1, step_name: "ligar_sinal", entry: "deep_link" }),
    ]);
    document.querySelector<HTMLElement>('#sim [data-a="exit"]')?.click();
    expect(of("journey_exit")).toEqual([
      expect.objectContaining({ journey_number: 2, last_step: 2, exit_reason: "sair", entry: "deep_link" }),
    ]);
    backSpy.mockRestore();
  });

  it("fechar a página no meio da jornada gera journey_exit pagina_fechada uma vez", () => {
    history.replaceState(null, "", "/agendabela/experimente");
    cleanup = initExperimente({ track: (e) => events.push(e) });
    (document.getElementById("heroCta") as HTMLButtonElement).click();
    window.dispatchEvent(new Event("pagehide"));
    cleanup();
    cleanup = () => {};
    expect(of("journey_exit")).toEqual([
      expect.objectContaining({ journey_number: 1, last_step: 1, exit_reason: "pagina_fechada" }),
    ]);
  });
});

describe("Experimente o Agenda Bela: chaves estáveis no GTM e troca por fragmento", () => {
  let events: ExperimenteEvent[];
  let cleanup: () => void;
  const of = (name: string) => events.filter((e) => e.event === name) as Array<Record<string, unknown>>;
  const nextAction = () =>
    ["#sim .ios-alert-bg .hint[data-a]", "#sim .backdrop .hint[data-a]", "#sim .hint[data-a]", "#sim .coach .act .btn"]
      .map((sel) => Array.from(document.querySelectorAll<HTMLElement>(sel)).at(-1))
      .find(Boolean);

  beforeEach(() => {
    jest.useFakeTimers();
    Element.prototype.scrollIntoView = jest.fn();
    document.body.className = "";
    document.body.innerHTML = `<div class="ab-exp">${EXPERIMENTE_MARKUP}</div>`;
    events = [];
  });
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it("depois de uma jornada por link direto, a próxima manda entry presente e undefined", () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    history.replaceState(null, "", "/agendabela/experimente#sinal-pix");
    cleanup = initExperimente({ track: (e) => events.push(e) });
    jest.advanceTimersByTime(10);
    for (let i = 0; i < 40 && !document.querySelector("#doneOv .done-card"); i++) {
      nextAction()?.click();
      jest.advanceTimersByTime(1500);
    }
    document.querySelector<HTMLElement>("#doneOv .next-link")?.click(); // Ver a próxima (J3)
    const [first, second] = of("journey_start");
    expect(first.entry).toBe("deep_link");
    expect(second.journey_number).toBe(3);
    expect("entry" in second).toBe(true);
    expect(second.entry).toBeUndefined();
    // os passos também mandam sempre as chaves opcionais
    for (const e of of("journey_step")) {
      expect("skipped" in e && "entry" in e).toBe(true);
    }
  });

  it("celular: trocar o fragmento para #caixa com o simulador aberto abre a J5, sem exit 'voltar'", () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    history.replaceState(null, "", "/agendabela/experimente");
    cleanup = initExperimente({ track: (e) => events.push(e) });
    (document.getElementById("heroCta") as HTMLButtonElement).click(); // J1 aberta em tela cheia
    // navegação por fragmento: o navegador cria a entrada e dispara popstate antes do hashchange
    history.pushState(null, "", "/agendabela/experimente#caixa");
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    expect(document.body.classList.contains("sim-open")).toBe(true);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(document.body.classList.contains("sim-open")).toBe(true);
    expect(location.hash).toBe("#caixa");
    expect(of("journey_exit")).toEqual([
      expect.objectContaining({ journey_number: 1, exit_reason: "trocar_jornada" }),
    ]);
    expect(of("journey_start").map((e) => [e.journey_number, e.entry])).toEqual([
      [1, undefined],
      [5, "deep_link"],
    ]);
    expect(document.querySelector("#coach .jt")?.textContent).toContain("Fecha o caixa");
  });
});

describe("pushAgendaBelaExperimenteEvent: modelo do GTM sem valor velho", () => {
  it("cada push zera os parâmetros do Experimente e a atribuição antes de aplicar os do evento", () => {
    window.dataLayer = [];
    history.replaceState(null, "", "/agendabela/experimente?utm_source=a&utm_campaign=x");
    pushAgendaBelaExperimenteEvent({ event: "journey_start", journey_number: 2, entry: "deep_link" });
    history.replaceState(null, "", "/agendabela/experimente?utm_source=b");
    pushAgendaBelaExperimenteEvent({ event: "cta_click", cta_location: "hero" });
    const second = window.dataLayer[1];
    for (const k of ["entry", "journey_number", "exit_reason", "skipped", "utm_campaign"]) {
      expect(k in second).toBe(true);
      expect(second[k]).toBeUndefined();
    }
    expect(second).toEqual(
      expect.objectContaining({ event: "cta_click", cta_location: "hero", utm_source: "b", landing_slug: "experimente" }),
    );
  });
});
