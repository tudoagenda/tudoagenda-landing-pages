/**
 * Engajamento das landings de loja: section_view (preço e perguntas) e
 * faq_open. Os nomes dos parâmetros (section, faq_id, device_os,
 * in_app_browser) são os que os gatilhos e as variáveis do GTM leem.
 */
import {
  LANDING_LOJAS,
  OFERTA_AGENDA_BELA,
  type LandingLojasConfig,
} from "@/config/landing-lojas";
import {
  LOJAS_RESET_KEYS,
  pushAgendaBelaLojasEvent,
} from "@/lib/analytics/dataLayer";
import { LOJAS_FAQ } from "../faq";
import { buildOfertaFaq } from "../faq-oferta";
import { SCRIPT_ANTES_DA_PINTURA, buildLojasMarkup } from "../markup";
import { initLandingLojas } from "../runtime";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  androidInstagram:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 335.0.0.39.93 Android",
};

const LP2 = LANDING_LOJAS.appParaSalaoDeBeleza;
const LP3 = LANDING_LOJAS.blackFriday;
const OFERTA = LANDING_LOJAS.oferta;
const PAGINAS: LandingLojasConfig[] = [LP2, LP3, OFERTA];

/** Título que conta como "viu o preço" em cada landing (data-sec="preco"). */
const MARCADORES_DE_PRECO: Record<string, string[]> = {
  [LP2.slug]: ["preco-titulo"],
  [LP3.slug]: ["bloco-titulo", "preco-titulo"],
  [OFERTA.slug]: ["oferta-titulo"],
};

function markup(config: LandingLojasConfig): string {
  return buildLojasMarkup({
    slug: config.slug,
    tema: config.tema,
    temaExpiraEm: config.temaExpiraEm,
    refSimulador: config.refSimulador,
    oferta: config.oferta,
    assets: {
      logo: "/logo.png",
      qr: `/qr-${config.slug}.svg`,
      santanderX: "/santander-x.png",
      foundersClub: "/founders-club.png",
    },
    ano: 2026,
  });
}

function setNavigator(userAgent: string) {
  for (const [key, value] of Object.entries({
    userAgent,
    platform: "",
    maxTouchPoints: 0,
  })) {
    Object.defineProperty(window.navigator, key, {
      value,
      configurable: true,
    });
  }
}

type Observador = {
  cb: IntersectionObserverCallback;
  opcoes?: IntersectionObserverInit;
  alvos: Set<Element>;
  desligado: boolean;
};

/** jsdom não tem IntersectionObserver: este guarda alvos e opções para o teste disparar. */
function mockIntersectionObserver() {
  const observadores: Observador[] = [];
  const original = window.IntersectionObserver;
  window.IntersectionObserver = class {
    private registro: Observador;
    constructor(cb: IntersectionObserverCallback, opcoes?: IntersectionObserverInit) {
      this.registro = { cb, opcoes, alvos: new Set(), desligado: false };
      observadores.push(this.registro);
    }
    observe(alvo: Element) {
      this.registro.alvos.add(alvo);
    }
    unobserve(alvo: Element) {
      this.registro.alvos.delete(alvo);
    }
    disconnect() {
      this.registro.alvos.clear();
      this.registro.desligado = true;
    }
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
  const deSecao = () =>
    observadores.filter((o) =>
      [...o.alvos].some((alvo) => alvo.hasAttribute("data-sec")),
    );
  return {
    /** Observadores que ainda olham algum marcador de seção. */
    deSecao,
    todos: observadores,
    /** O navegador avisa que `fracao` do alvo está dentro da área observada. */
    cruzar(alvo: Element, fracao: number) {
      for (const o of observadores.filter((x) => x.alvos.has(alvo))) {
        o.cb(
          [
            {
              isIntersecting: fracao > 0,
              intersectionRatio: fracao,
              target: alvo,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      }
    },
    restaurar() {
      if (original) window.IntersectionObserver = original;
      else
        delete (window as { IntersectionObserver?: unknown })
          .IntersectionObserver;
    },
  };
}

let cleanup: (() => void) | undefined;
let io: ReturnType<typeof mockIntersectionObserver> | undefined;

function mount(
  config: LandingLojasConfig,
  { ua = UA.iphone, comIO = true }: { ua?: string; comIO?: boolean } = {},
) {
  setNavigator(ua);
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  history.replaceState(null, "", config.path);
  window.dataLayer = [];
  document.body.innerHTML = markup(config);
  new Function(SCRIPT_ANTES_DA_PINTURA.replace(/^<script>|<\/script>$/g, ""))();
  if (comIO) io = mockIntersectionObserver();
  cleanup = initLandingLojas({
    slug: config.slug,
    track: (event) => pushAgendaBelaLojasEvent(config.slug, event),
  });
}

const lp = () => document.getElementById("lp") as HTMLElement;
const el = (id: string) => document.getElementById(id) as HTMLElement;
const eventos = (nome: string) =>
  (window.dataLayer as Record<string, unknown>[]).filter(
    (e) => e.event === nome,
  );
const perguntas = () =>
  [...lp().querySelectorAll<HTMLDetailsElement>("details[data-faq]")];

/** Abre ou fecha a pergunta como o navegador: muda o estado e avisa com toggle. */
function alternar(d: HTMLDetailsElement, aberta: boolean) {
  d.open = aberta;
  d.dispatchEvent(new Event("toggle"));
}

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  io?.restaurar();
  io = undefined;
  jest.restoreAllMocks();
});

describe("ids das perguntas (faq_id)", () => {
  const ofertaFaq = buildOfertaFaq(OFERTA_AGENDA_BELA);

  it.each([
    ["landing padrão", LOJAS_FAQ.map((item) => item.id)],
    ["oferta", ofertaFaq.map((item) => item.id)],
  ])("%s: ASCII, sem repetição", (_nome, ids) => {
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(_[a-z0-9]+)*$/);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("os ids publicados não mudam (trocar um quebra a série no GA4)", () => {
    expect(LOJAS_FAQ.map((item) => item.id)).toEqual([
      "o_que_e",
      "precisa_cartao",
      "quanto_custa_depois",
      "iphone_android",
      "whatsapp_numero",
      "cliente_baixar",
    ]);
    expect(ofertaFaq.map((item) => item.id)).toEqual([
      "o_que_e",
      "cupom_como_funciona",
      "cupom_onde_colocar",
      "cupom_ja_assinou",
      "cupom_com_teste",
      "sem_cupom",
      "precisa_cartao",
      "depois_da_oferta",
      "cancelar_antes",
      "iphone_android",
      "whatsapp_numero",
      "cliente_baixar",
    ]);
  });

  it("pergunta que existe nas duas páginas usa o mesmo id", () => {
    const padrao = new Map(LOJAS_FAQ.map((item) => [item.pergunta, item.id]));
    for (const item of ofertaFaq) {
      const idPadrao = padrao.get(item.pergunta);
      if (idPadrao) expect(item.id).toBe(idPadrao);
    }
  });
});

describe.each(PAGINAS)("landing de loja $slug: section_view", (config) => {
  it("o HTML marca o título do preço e o das perguntas", () => {
    document.body.innerHTML = markup(config);
    const ids = (secao: string) =>
      [...lp().querySelectorAll(`[data-sec="${secao}"]`)].map((x) => x.id);
    expect(ids("preco")).toEqual(MARCADORES_DE_PRECO[config.slug]);
    expect(ids("faq")).toEqual(["faq-titulo"]);
    // Todo marcador de preço mostra de fato um valor.
    for (const id of MARCADORES_DE_PRECO[config.slug]) {
      expect(el(id).textContent).toMatch(/R\$\s?\d+,\d{2}/);
    }
  });

  it("um observador só, com limiar e sem contar a faixa de baixo da tela", () => {
    mount(config);
    const observadores = io!.deSecao();
    expect(observadores).toHaveLength(1);
    expect(observadores[0].opcoes).toEqual({
      threshold: 0.75,
      rootMargin: "0px 0px -15% 0px",
    });
    expect([...observadores[0].alvos].map((x) => x.id).sort()).toEqual(
      [...MARCADORES_DE_PRECO[config.slug], "faq-titulo"].sort(),
    );
  });

  it("não dispara ao carregar nem quando a seção só encosta na borda", () => {
    mount(config);
    const preco = el(MARCADORES_DE_PRECO[config.slug][0]);
    io!.cruzar(preco, 0);
    io!.cruzar(preco, 0.1);
    io!.cruzar(preco, 0.74);
    io!.cruzar(el("faq-titulo"), 0.3);
    expect(eventos("section_view")).toHaveLength(0);
  });

  it("dispara uma vez por seção, com aparelho e navegador interno", () => {
    mount(config, { ua: UA.androidInstagram });
    const preco = el(MARCADORES_DE_PRECO[config.slug][0]);
    io!.cruzar(preco, 0.75);
    io!.cruzar(el("faq-titulo"), 1);
    expect(
      eventos("section_view").map((e) => ({
        section: e.section,
        device_os: e.device_os,
        in_app_browser: e.in_app_browser,
        landing_slug: e.landing_slug,
        landing_type: e.landing_type,
        product: e.product,
      })),
    ).toEqual(
      ["preco", "faq"].map((section) => ({
        section,
        device_os: "android",
        in_app_browser: "instagram",
        landing_slug: config.slug,
        landing_type: "campaign",
        product: "agendabela",
      })),
    );
    // Vista a seção, o navegador não é mais consultado sobre ela.
    expect(io!.deSecao()).toHaveLength(0);
  });

  it("sair e voltar à seção não repete o evento", () => {
    mount(config);
    const faq = el("faq-titulo");
    io!.cruzar(faq, 1);
    // Mesmo que o navegador avisasse de novo (observador próprio do teste).
    const observador = io!.todos.find((o) => o.opcoes?.threshold === 0.75)!;
    for (const fracao of [0, 1, 0, 0.9]) {
      observador.cb(
        [
          {
            isIntersecting: fracao > 0,
            intersectionRatio: fracao,
            target: faq,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    }
    expect(eventos("section_view").map((e) => e.section)).toEqual(["faq"]);
  });

  it("sai depois do lp_view e não herda parâmetro de outro evento", () => {
    mount(config);
    lp().querySelector<HTMLAnchorElement>("a[data-nav]")?.addEventListener(
      "click",
      (ev) => ev.preventDefault(),
    );
    lp().querySelector<HTMLAnchorElement>("a[data-nav]")?.click();
    io!.cruzar(el("faq-titulo"), 1);
    expect((window.dataLayer as Record<string, unknown>[])[0].event).toBe(
      "lp_view",
    );
    const [evento] = eventos("section_view");
    for (const key of ["cta_location", "store", "ref", "faq_id"]) {
      expect(key in evento).toBe(true);
      expect(evento[key]).toBeUndefined();
    }
    // E o evento seguinte não herda a seção.
    alternar(perguntas()[0], true);
    const [abriu] = eventos("faq_open");
    expect("section" in abriu).toBe(true);
    expect(abriu.section).toBeUndefined();
  });

  it("sem IntersectionObserver não dispara, e o resto da medição segue", () => {
    mount(config, { comIO: false });
    expect("IntersectionObserver" in window).toBe(false);
    expect(eventos("section_view")).toHaveLength(0);
    expect(eventos("lp_view")).toHaveLength(1);
    alternar(perguntas()[0], true);
    expect(eventos("faq_open")).toHaveLength(1);
  });

  it("depois do cleanup nada é medido", () => {
    mount(config);
    const observador = io!.deSecao()[0];
    cleanup?.();
    cleanup = undefined;
    expect(observador.desligado).toBe(true);
    alternar(perguntas()[0], true);
    expect(eventos("section_view")).toHaveLength(0);
    expect(eventos("faq_open")).toHaveLength(0);
  });
});

it("Black Friday: o preço conta uma vez só, no primeiro dos dois blocos que aparecer", () => {
  mount(LP3);
  io!.cruzar(el("bloco-titulo"), 1);
  // O "Quanto custa" deixou de ser observado: é a mesma seção.
  expect(
    [...io!.deSecao()[0].alvos].map((x) => x.id),
  ).toEqual(["faq-titulo"]);
  expect(eventos("section_view").map((e) => e.section)).toEqual(["preco"]);
});

it("oferta: o \"Quanto custa\" não mostra valor e não conta como preço visto", () => {
  mount(OFERTA);
  expect(el("preco-titulo").hasAttribute("data-sec")).toBe(false);
  expect(el("preco-titulo").textContent).not.toMatch(/R\$/);
});

describe.each(PAGINAS)("landing de loja $slug: faq_open", (config) => {
  it("toda pergunta da página tem o id do dado, na mesma ordem", () => {
    document.body.innerHTML = markup(config);
    const esperado = config.oferta
      ? buildOfertaFaq(config.oferta).map((item) => item.id)
      : LOJAS_FAQ.map((item) => item.id);
    expect(lp().querySelectorAll(".faq-list details")).toHaveLength(
      esperado.length,
    );
    expect(perguntas().map((d) => d.getAttribute("data-faq"))).toEqual(
      esperado,
    );
  });

  it("abrir dispara com faq_id, aparelho e navegador interno", () => {
    mount(config, { ua: UA.androidInstagram });
    const pergunta = perguntas()[1];
    alternar(pergunta, true);
    const abriu = eventos("faq_open");
    expect(abriu).toHaveLength(1);
    expect(abriu[0]).toMatchObject({
      event: "faq_open",
      faq_id: pergunta.getAttribute("data-faq"),
      device_os: "android",
      in_app_browser: "instagram",
      landing_slug: config.slug,
      landing_type: "campaign",
      product: "agendabela",
    });
    for (const key of ["cta_location", "store", "ref", "section"]) {
      expect(key in abriu[0]).toBe(true);
      expect(abriu[0][key]).toBeUndefined();
    }
  });

  it("fechar não dispara, e reabrir a mesma pergunta não repete", () => {
    mount(config);
    const [primeira, segunda] = perguntas();
    alternar(primeira, true);
    alternar(primeira, false);
    alternar(primeira, true);
    alternar(segunda, true);
    alternar(segunda, false);
    expect(eventos("faq_open").map((e) => e.faq_id)).toEqual([
      primeira.getAttribute("data-faq"),
      segunda.getAttribute("data-faq"),
    ]);
  });

  it("toggle de pergunta fechada (sem abrir) não dispara", () => {
    mount(config);
    perguntas()[0].dispatchEvent(new Event("toggle"));
    expect(eventos("faq_open")).toHaveLength(0);
  });

  it("nenhum texto da pergunta ou da resposta vai no evento", () => {
    mount(config);
    perguntas().forEach((d) => alternar(d, true));
    const abriu = eventos("faq_open");
    expect(abriu).toHaveLength(perguntas().length);
    for (const evento of abriu) {
      expect(Object.keys(evento).sort()).toEqual(
        [
          "event",
          "product",
          "landing_type",
          "landing_slug",
          ...LOJAS_RESET_KEYS,
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term",
          "gclid",
          "fbclid",
        ].sort(),
      );
      expect(String(evento.faq_id)).toMatch(/^[a-z0-9_]+$/);
    }
  });
});

it("se o engajamento quebrar, os links das lojas continuam medidos", () => {
  setNavigator(UA.iphone);
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  history.replaceState(null, "", LP2.path);
  window.dataLayer = [];
  document.body.innerHTML = markup(LP2);
  const original = window.IntersectionObserver;
  window.IntersectionObserver = class {
    constructor(_cb: unknown, opcoes?: IntersectionObserverInit) {
      // Só o observador das seções falha (ex.: rootMargin recusado).
      if (opcoes?.rootMargin === "0px 0px -15% 0px") {
        throw new Error("rootMargin inválido");
      }
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  try {
    expect(() => {
      cleanup = initLandingLojas({
        slug: LP2.slug,
        track: (event) => pushAgendaBelaLojasEvent(LP2.slug, event),
      });
    }).not.toThrow();
    const loja = lp().querySelector<HTMLAnchorElement>(
      '#cta-hero [data-dev="ios"] a[data-store]',
    )!;
    loja.addEventListener("click", (ev) => ev.preventDefault());
    loja.click();
    expect(eventos("lp_view")).toHaveLength(1);
    expect(eventos("store_click")).toHaveLength(1);
    // O que já estava ligado do engajamento foi desfeito junto.
    alternar(perguntas()[0], true);
    expect(eventos("faq_open")).toHaveLength(0);
  } finally {
    if (original) window.IntersectionObserver = original;
    else
      delete (window as { IntersectionObserver?: unknown })
        .IntersectionObserver;
  }
});
