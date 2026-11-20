import fs from "fs";
import path from "path";
import { APP_STORE_URL, GOOGLE_PLAY_BASE_URL } from "@/config/app-stores";
import {
  LANDING_LOJAS,
  type LandingLojasConfig,
} from "@/config/landing-lojas";
import {
  LOJAS_RESET_KEYS,
  pushAgendaBelaLojasEvent,
} from "@/lib/analytics/dataLayer";
import { detectDeviceOs } from "@/lib/device";
import { SCRIPT_ANTES_DA_PINTURA, buildLojasMarkup } from "../markup";
import { initLandingLojas } from "../runtime";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidInstagram:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 335.0.0.39.93 Android",
  desktop:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

const LP2 = LANDING_LOJAS.appParaSalaoDeBeleza;
const LP3 = LANDING_LOJAS.blackFriday;
const PAGINAS: LandingLojasConfig[] = [LP2, LP3];
const SLUG_DA_LP1 = "automatize-seu-atendimento";
const CTA_LOCATIONS = [
  "hero",
  "preco",
  "final",
  "sticky_mobile",
  "rodape_selo",
  "desktop_selo",
  "simulador_hero",
  "simulador_avaliacoes",
];

const css = fs.readFileSync(path.join(__dirname, "../lojas.css"), "utf8");

function markup(config: LandingLojasConfig): string {
  return buildLojasMarkup({
    tema: config.tema,
    temaExpiraEm: config.temaExpiraEm,
    refSimulador: config.refSimulador,
    assets: {
      logo: "/logo.png",
      qr: `/qr-${config.slug}.svg`,
      santanderX: "/santander-x.png",
      foundersClub: "/founders-club.png",
    },
    ano: 2026,
  });
}

function setNavigator(userAgent: string, platform = "", maxTouchPoints = 0) {
  for (const [key, value] of Object.entries({
    userAgent,
    platform,
    maxTouchPoints,
  })) {
    Object.defineProperty(window.navigator, key, {
      value,
      configurable: true,
    });
  }
}

function setMotion(reduce: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

const lp = () => document.getElementById("lp") as HTMLElement;

/** Roda o script em linha do HTML do servidor, como o navegador faz antes da pintura. */
function runScriptAntesDaPintura() {
  const code = SCRIPT_ANTES_DA_PINTURA.replace(/^<script>|<\/script>$/g, "");
  new Function(code)();
}

let cleanup: (() => void) | undefined;

/** Monta a página como no navegador: HTML do servidor, script em linha e runtime. */
function mount(
  config: LandingLojasConfig,
  {
    ua = UA.iphone,
    url = config.path,
    reduce = false,
  }: { ua?: string; url?: string; reduce?: boolean } = {},
) {
  setNavigator(ua);
  setMotion(reduce);
  history.replaceState(null, "", url);
  window.dataLayer = [];
  document.body.innerHTML = markup(config);
  runScriptAntesDaPintura();
  cleanup = initLandingLojas({
    slug: config.slug,
    track: (event) => pushAgendaBelaLojasEvent(config.slug, event),
    attribution: Object.fromEntries(
      [...new URLSearchParams(window.location.search)].filter(([key]) =>
        key.startsWith("utm_"),
      ),
    ),
  });
}

/** Links que a visitante daquele aparelho enxerga (o CSS esconde os outros blocos data-dev). */
function linksDoAparelho(selector: string): HTMLAnchorElement[] {
  const os = lp().getAttribute("data-os") ?? "nojs";
  return [...lp().querySelectorAll<HTMLAnchorElement>(selector)].filter(
    (a) => {
      const bloco = a.closest("[data-dev]");
      return !bloco || bloco.getAttribute("data-dev") === os;
    },
  );
}

const eventos = () => window.dataLayer as Record<string, unknown>[];

beforeEach(() => {
  window.sessionStorage.clear();
  // jsdom não navega: o clique num link só dispara os listeners.
  document.addEventListener("click", preventNavigation, true);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.removeEventListener("click", preventNavigation, true);
  jest.restoreAllMocks();
});

function preventNavigation(event: Event) {
  if ((event.target as Element).closest("a")) event.preventDefault();
}

describe.each(PAGINAS)("landing de loja $slug: HTML do servidor", (config) => {
  const html = markup(config);

  it("não leva nada do protótipo para produção", () => {
    expect(html).not.toMatch(/prot[óo]tipo|QR de exemplo|\(exemplo\)"|proto-/i);
    expect(html).not.toContain("<!--");
    expect(html).not.toMatch(/class="btn"|data-btnv/);
    expect(html).not.toMatch(/src="assets\//);
  });

  it("sem JavaScript mostra os dois selos, com link válido para cada loja", () => {
    document.body.innerHTML = html;
    expect(lp().hasAttribute("data-os")).toBe(false);
    // Sem data-os, o CSS só deixa o bloco "nojs" visível.
    expect(css).toContain(
      '#lp:not([data-os]) [data-dev]:not([data-dev="nojs"])',
    );
    for (const cta of lp().querySelectorAll(".cta")) {
      const hrefs = [
        ...cta.querySelectorAll<HTMLAnchorElement>('[data-dev="nojs"] a'),
      ].map((a) => a.getAttribute("href"));
      expect(hrefs).toEqual([APP_STORE_URL, GOOGLE_PLAY_BASE_URL]);
    }
    // Nenhum bloco de aparelho depende de JS para deixar de estar "hidden".
    expect(lp().querySelectorAll("[data-dev][hidden]")).toHaveLength(0);
  });

  it("toda imagem tem alt e nenhum texto está em inglês nos rótulos de acessibilidade", () => {
    document.body.innerHTML = html;
    for (const img of lp().querySelectorAll("img")) {
      expect(img.hasAttribute("alt")).toBe(true);
    }
    for (const el of lp().querySelectorAll("[aria-label]")) {
      expect(el.getAttribute("aria-label")).not.toMatch(
        /\b(pause|play|next|previous|close|open|tab|step)\b/i,
      );
    }
  });

  it("não cita o preço do Google Play: o único preço da página é R$ 59,90", () => {
    expect(html).not.toContain("59,99");
    expect(html).not.toMatch(/no Google Play, (o valor|R\$)/i);
    expect(html).toContain("R$&nbsp;59,90 por mês");
  });

  it("links internos usam ?ref= e nunca utm_", () => {
    document.body.innerHTML = html;
    const sim = [...lp().querySelectorAll<HTMLAnchorElement>("a[data-sim]")];
    expect(sim.length).toBeGreaterThan(0);
    for (const a of sim) {
      expect(a.getAttribute("href")).toMatch(
        new RegExp(
          `^/agendabela/experimente\\?ref=${config.refSimulador}_(hero|avaliacoes)$`,
        ),
      );
    }
    expect(html).not.toContain("utm_");
  });
});

describe("detecção de aparelho antes da pintura", () => {
  it.each([
    ["iPhone", UA.iphone, "iPhone", 5, "ios"],
    ["iPad com Safari", UA.desktop, "MacIntel", 5, "ios"],
    ["Android", UA.android, "Linux armv81", 5, "android"],
    ["Android no Instagram", UA.androidInstagram, "Linux armv81", 5, "android"],
    ["computador", UA.desktop, "MacIntel", 0, "desktop"],
  ])(
    "%s: o script em linha grava o mesmo aparelho que detectDeviceOs",
    (_nome, ua, platform, touch, esperado) => {
      setNavigator(ua, platform, touch);
      document.body.innerHTML = markup(LP2);
      runScriptAntesDaPintura();
      expect(lp().getAttribute("data-os")).toBe(esperado);
      expect(detectDeviceOs()).toBe(esperado);
    },
  );

  it("o CSS mostra só o bloco do aparelho detectado", () => {
    for (const os of ["ios", "android", "desktop"]) {
      expect(css).toContain(
        `#lp[data-os="${os}"] [data-dev]:not([data-dev="${os}"])`,
      );
    }
  });
});

describe.each(PAGINAS)("landing de loja $slug: CTA por aparelho", (config) => {
  it("iPhone: um selo só, da App Store, em cartão, na mesma aba", () => {
    mount(config, { ua: UA.iphone });
    const links = linksDoAparelho("#cta-hero a[data-store]");
    expect(links).toHaveLength(1);
    expect(links[0].dataset.store).toBe("app_store");
    expect(links[0].className).toBe("storecard");
    expect(links[0].getAttribute("href")).toBe(APP_STORE_URL);
    expect(links[0].hasAttribute("target")).toBe(false);
  });

  it("Android: um selo só, do Google Play, com a origem no referrer, na mesma aba", () => {
    mount(config, { ua: UA.android });
    const links = linksDoAparelho("#cta-hero a[data-store]");
    expect(links).toHaveLength(1);
    expect(links[0].dataset.store).toBe("google_play");
    expect(links[0].className).toBe("storecard");
    expect(links[0].getAttribute("href")).toContain(
      `${GOOGLE_PLAY_BASE_URL}&referrer=`,
    );
    expect(links[0].hasAttribute("target")).toBe(false);
  });

  it("computador: os dois selos e o QR da própria rota, lojas em aba nova", () => {
    mount(config, { ua: UA.desktop });
    const links = linksDoAparelho("#cta-hero a[data-store]");
    expect(links.map((a) => a.dataset.store)).toEqual([
      "app_store",
      "google_play",
    ]);
    for (const a of links) expect(a.getAttribute("target")).toBe("_blank");
    const qr = lp().querySelector<HTMLImageElement>(
      '#cta-hero [data-dev="desktop"] .dt-qr img',
    );
    expect(qr?.getAttribute("src")).toBe(`/qr-${config.slug}.svg`);
    // No computador o rodapé também abre em aba nova, com aviso para leitor de tela.
    for (const a of lp().querySelectorAll<HTMLAnchorElement>(
      ".foot-badges a",
    )) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.querySelectorAll(".sr")).toHaveLength(1);
    }
  });

  it("no celular nenhum link de loja visível abre em aba nova", () => {
    mount(config, { ua: UA.android });
    for (const a of linksDoAparelho("a[data-store]")) {
      expect(a.hasAttribute("target")).toBe(false);
    }
  });
});

describe.each(PAGINAS)("landing de loja $slug: medição", (config) => {
  it.each([
    ["iPhone", UA.iphone, "ios"],
    ["Android", UA.android, "android"],
    ["computador", UA.desktop, "desktop"],
  ])(
    "%s: todo evento sai com o landing_slug desta rota, nunca o da landing principal",
    (_nome, ua, os) => {
      mount(config, { ua });
      const links = linksDoAparelho("a[data-store], a[data-sim]");
      expect(links.length).toBeGreaterThan(3);
      links.forEach((a) => a.click());

      expect(eventos()).toHaveLength(links.length + 1); // + lp_view
      for (const evento of eventos()) {
        expect(evento.landing_slug).toBe(config.slug);
        expect(evento.landing_slug).not.toBe(SLUG_DA_LP1);
        expect(evento.landing_type).toBe("campaign");
        expect(evento.product).toBe("agendabela");
      }
      const cliques = eventos().filter((e) => e.event !== "lp_view");
      for (const evento of cliques) {
        expect(CTA_LOCATIONS).toContain(evento.cta_location);
      }
      for (const evento of cliques.filter((e) => e.event === "store_click")) {
        expect(evento.device_os).toBe(os);
        expect(evento.in_app_browser).toBe("none");
      }
    },
  );

  it("lp_view leva aparelho, ref e navegador interno", () => {
    mount(config, {
      ua: UA.androidInstagram,
      url: `${config.path}?ref=qr_desktop`,
    });
    expect(eventos()).toEqual([
      expect.objectContaining({
        event: "lp_view",
        landing_slug: config.slug,
        landing_type: "campaign",
        device_os: "android",
        ref: "qr_desktop",
        in_app_browser: "instagram",
      }),
    ]);
  });

  it("store_click diz a loja e o lugar do botão", () => {
    mount(config, { ua: UA.iphone });
    const clicar = (selector: string) =>
      linksDoAparelho(selector).forEach((a) => a.click());
    clicar("#cta-hero a[data-store]");
    clicar(".price a[data-store]");
    clicar(".final a[data-store]");
    clicar("#cta-fixo a[data-store]");
    clicar('.foot-badges a[data-store="google_play"]');
    expect(
      eventos()
        .filter((e) => e.event === "store_click")
        .map((e) => `${e.store}@${e.cta_location}`),
    ).toEqual([
      "app_store@hero",
      "app_store@preco",
      "app_store@final",
      "app_store@sticky_mobile",
      "google_play@rodape_selo",
    ]);
  });

  it("no computador os selos saem como desktop_selo", () => {
    mount(config, { ua: UA.desktop });
    linksDoAparelho("#cta-hero a[data-store]").forEach((a) => a.click());
    expect(
      eventos()
        .filter((e) => e.event === "store_click")
        .map((e) => `${e.store}@${e.cta_location}`),
    ).toEqual(["app_store@desktop_selo", "google_play@desktop_selo"]);
  });

  it("link do simulador sai como cta_click, sem herdar a loja do clique anterior", () => {
    mount(config, { ua: UA.desktop });
    linksDoAparelho("#cta-hero a[data-store]")[0].click();
    linksDoAparelho("a[data-sim]").forEach((a) => a.click());
    const cliques = eventos().filter((e) => e.event === "cta_click");
    expect(cliques.map((e) => e.cta_location)).toEqual([
      "simulador_hero",
      "simulador_avaliacoes",
    ]);
    for (const evento of cliques) {
      for (const key of ["store", "device_os", "in_app_browser", "ref"]) {
        expect(key in evento).toBe(true);
        expect(evento[key]).toBeUndefined();
      }
    }
    // Parâmetro novo de LojasEvent tem que entrar na lista de reset.
    expect([...LOJAS_RESET_KEYS].sort()).toEqual(
      ["cta_location", "device_os", "in_app_browser", "ref", "store"].sort(),
    );
  });

  it("referrer da Play: UTMs da sessão quando existem", () => {
    mount(config, {
      ua: UA.android,
      url: `${config.path}?utm_source=ig&utm_medium=paid_social&utm_campaign=agendabela_lps_nov26`,
    });
    const href = linksDoAparelho("#cta-hero a[data-store]")[0].href;
    const referrer = new URLSearchParams(
      new URL(href).searchParams.get("referrer") ?? "",
    );
    expect(Object.fromEntries(referrer)).toEqual({
      utm_source: "ig",
      utm_medium: "paid_social",
      utm_campaign: "agendabela_lps_nov26",
    });
  });

  it("referrer da Play: padrão com o slug da página quando a visita chega sem UTM", () => {
    mount(config, { ua: UA.android });
    for (const a of lp().querySelectorAll<HTMLAnchorElement>(
      'a[data-store="google_play"]',
    )) {
      const referrer = new URLSearchParams(
        new URL(a.href).searchParams.get("referrer") ?? "",
      );
      expect(Object.fromEntries(referrer)).toEqual({
        utm_source: "tudoagenda_site",
        utm_medium: "landing",
        utm_campaign: config.slug,
      });
    }
    // O padrão vale só para o link da Play: os eventos não ganham UTM inventada.
    expect(eventos()[0].utm_source).toBeUndefined();
  });

  it("depois do cleanup nenhum clique é medido", () => {
    mount(config, { ua: UA.iphone });
    cleanup?.();
    cleanup = undefined;
    linksDoAparelho("a[data-store]").forEach((a) => a.click());
    expect(eventos().filter((e) => e.event === "store_click")).toHaveLength(0);
  });
});

describe("validade do tema Black Friday", () => {
  const fim = LP3.temaExpiraEm;
  const SO_TEMA = [".ribbon", ".bf-halo", ".bf-big", "#slot-bloco"];

  it("a página padrão não tem nenhum elemento nem palavra do tema", () => {
    const html = markup(LP2);
    expect(html).not.toMatch(/black friday|so-tema|txt-tema|data-tema-fim="/i);
    expect(html).toContain('data-tema="padrao"');
  });

  it("a Black Friday é só visual: nenhuma palavra de promoção", () => {
    document.body.innerHTML = markup(LP3);
    expect(lp().textContent).not.toMatch(
      /desconto|promo[çc][ãa]o|oferta|% ?off|imperd[íi]vel|só hoje|últimas/i,
    );
    expect(
      document.getElementById("bloco-titulo")?.textContent?.replace(/\s/g, " "),
    ).toBe("Apenas R$ 59,90 por mês.");
    expect(lp().textContent).not.toContain("O preço de sempre");
  });

  it("antes da data: tema ligado, com faixa, título, bloco de preço e halo", () => {
    jest.spyOn(Date, "now").mockReturnValue(fim - 1);
    mount(LP3);
    expect(lp().getAttribute("data-tema")).toBe("bf");
    expect(lp().getAttribute("data-tema-fim")).toBe(String(fim));
    for (const selector of SO_TEMA) {
      expect(lp().querySelector(selector)?.classList).toContain("so-tema");
    }
    expect(lp().classList).toContain("bf-live");
  });

  it("depois da data: o script em linha desliga o tema antes da pintura", () => {
    jest.spyOn(Date, "now").mockReturnValue(fim);
    document.body.innerHTML = markup(LP3);
    runScriptAntesDaPintura();
    expect(lp().getAttribute("data-tema")).toBe("padrao");
  });

  it("depois da data: o runtime também desliga (chegada por navegação interna) e não anima o tema", () => {
    jest.spyOn(Date, "now").mockReturnValue(fim + 1000);
    setNavigator(UA.iphone);
    setMotion(false);
    window.dataLayer = [];
    document.body.innerHTML = markup(LP3);
    cleanup = initLandingLojas({ slug: LP3.slug, track: jest.fn() });
    expect(lp().getAttribute("data-tema")).toBe("padrao");
    expect(lp().classList).not.toContain("bf-live");
    expect(lp().querySelector(".bf-big")?.classList).not.toContain("bf-pre");
  });

  it("fora do tema, o CSS esconde os elementos e textos da Black Friday e mostra os da página padrão", () => {
    expect(css).toContain('#lp:not([data-tema="bf"]) .so-tema');
    expect(css).toContain('#lp:not([data-tema="bf"]) .txt-tema');
    expect(css).toContain('#lp[data-tema="bf"] .txt-padrao');
    document.body.innerHTML = markup(LP3);
    const textos = (cls: string) =>
      [...lp().querySelectorAll(`.${cls}`)].map((el) => el.textContent);
    expect(textos("txt-padrao")).toEqual([
      "O que a Bela faz por você",
      "Baixe o app e deixe a Bela cuidar da sua agenda.",
      "7 dias grátis, sem cartão para começar. Depois, R$ 59,90 por mês.",
    ]);
    expect(textos("txt-tema")).toHaveLength(3);
  });

  it("depois da data os eventos continuam com o slug da rota black-friday", () => {
    jest.spyOn(Date, "now").mockReturnValue(fim + 1000);
    mount(LP3);
    expect(eventos()[0]).toEqual(
      expect.objectContaining({ event: "lp_view", landing_slug: "black-friday" }),
    );
  });
});

describe("acessibilidade e movimento", () => {
  it("abas: papéis ARIA ligados aos painéis e navegação por teclado", () => {
    mount(LP2, { ua: UA.desktop });
    const tabs = [...lp().querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs).toHaveLength(4);
    expect(lp().querySelector('[role="tablist"]')?.hasAttribute("hidden")).toBe(
      false,
    );
    for (const tab of tabs) {
      const painel = document.getElementById(
        tab.getAttribute("aria-controls") ?? "",
      );
      expect(painel?.getAttribute("role")).toBe("tabpanel");
      expect(painel?.getAttribute("aria-labelledby")).toBe(tab.id);
    }
    const selecionada = () =>
      tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const painelVisivel = () =>
      [...lp().querySelectorAll('[role="tabpanel"]')].findIndex(
        (p) => !p.hasAttribute("hidden"),
      );
    const tecla = (key: string) =>
      tabs[selecionada()].dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );

    expect(selecionada()).toBe(0);
    tecla("ArrowRight");
    expect(selecionada()).toBe(1);
    expect(painelVisivel()).toBe(1);
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1, -1]);
    tecla("End");
    expect(selecionada()).toBe(3);
    tecla("ArrowRight");
    expect(selecionada()).toBe(0);
    tecla("ArrowLeft");
    expect(selecionada()).toBe(3);
    tecla("Home");
    expect(selecionada()).toBe(0);
    tabs[2].click();
    expect(painelVisivel()).toBe(2);
  });

  it("demonstração do hero: pausa com rótulo em português e escolha de passo", () => {
    mount(LP2);
    const pausar = document.getElementById("hero-pausar") as HTMLButtonElement;
    expect(document.getElementById("hero-ctl")?.hasAttribute("hidden")).toBe(
      false,
    );
    expect(document.getElementById("hero-passo")?.textContent).toBe(
      "Passo 1 de 6",
    );
    pausar.click();
    expect(pausar.getAttribute("aria-pressed")).toBe("true");
    expect(pausar.getAttribute("aria-label")).toBe("Continuar a demonstração");
    expect(pausar.textContent).toBe("Continuar");
    expect(
      document.getElementById("hero-stage")?.classList.contains("paused"),
    ).toBe(true);
    document.getElementById("hero-passo-4")?.click();
    expect(document.getElementById("hero-passo")?.textContent).toBe(
      "Passo 4 de 6",
    );
    expect(pausar.getAttribute("aria-pressed")).toBe("false");
  });

  it("chips do E tem mais trocam o texto e o estado", () => {
    mount(LP2);
    const chips = [...lp().querySelectorAll<HTMLButtonElement>(".chip")];
    chips[2].click();
    expect(chips.map((c) => c.getAttribute("aria-expanded"))).toEqual([
      "false",
      "false",
      "true",
      "false",
    ]);
    expect(document.getElementById("mais-folha")?.textContent).toBe(
      chips[2].dataset.t,
    );
  });

  it("movimento reduzido: nada anima e os controles de animação somem", () => {
    mount(LP3, { reduce: true });
    expect(document.getElementById("hero-pausar")?.hasAttribute("hidden")).toBe(
      true,
    );
    expect(document.getElementById("hero-passo")?.textContent).toBe(
      "Passo 5 de 6",
    );
    expect(lp().querySelectorAll(".play")).toHaveLength(0);
    for (const replay of lp().querySelectorAll(".replay")) {
      expect(replay.hasAttribute("hidden")).toBe(true);
    }
    expect(lp().classList).not.toContain("bf-live");
    expect(document.getElementById("faixa-pausar")?.hasAttribute("hidden")).toBe(
      true,
    );
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
  });

  it("faixa da Black Friday: o botão pausa a faixa e os efeitos em laço", () => {
    jest.spyOn(Date, "now").mockReturnValue(LP3.temaExpiraEm - 1);
    mount(LP3);
    const botao = document.getElementById("faixa-pausar") as HTMLButtonElement;
    expect(botao.hasAttribute("hidden")).toBe(false);
    expect(lp().classList).toContain("bf-live");
    botao.click();
    expect(lp().classList).not.toContain("bf-live");
    expect(botao.getAttribute("aria-label")).toBe(
      "Continuar o movimento da faixa e dos efeitos",
    );
    botao.click();
    expect(lp().classList).toContain("bf-live");
  });
});

describe("estado antes do runtime (sem salto de layout)", () => {
  it("o script em linha marca data-pre e o runtime tira ao assumir", () => {
    setNavigator(UA.iphone);
    setMotion(false);
    window.dataLayer = [];
    document.body.innerHTML = markup(LP3);
    runScriptAntesDaPintura();
    expect(lp().hasAttribute("data-pre")).toBe(true);
    // Com data-pre o CSS já mostra as abas e um painel só, como o runtime fará.
    expect(css).toContain("#lp[data-pre] #dif-panels>.panel:not(:first-child)");
    expect(css).toContain("#lp[data-pre] #dif-tabs{display:grid!important}");
    cleanup = initLandingLojas({ slug: LP3.slug, track: jest.fn() });
    expect(lp().hasAttribute("data-pre")).toBe(false);
  });

  it("se o runtime não chegar, o script devolve a página completa em 8 s", () => {
    jest.useFakeTimers();
    document.body.innerHTML = markup(LP2);
    runScriptAntesDaPintura();
    jest.advanceTimersByTime(8000);
    expect(lp().hasAttribute("data-pre")).toBe(false);
    jest.useRealTimers();
  });

  it("HTML alterado por fora: o runtime não quebra a página nem deixa listener", () => {
    setNavigator(UA.iphone);
    setMotion(false);
    document.body.innerHTML = markup(LP2);
    runScriptAntesDaPintura();
    document.getElementById("hero-legenda")?.remove();
    const track = jest.fn();
    expect(() => {
      cleanup = initLandingLojas({ slug: LP2.slug, track });
    }).not.toThrow();
    expect(lp().hasAttribute("data-pre")).toBe(false);
    track.mockClear();
    linksDoAparelho("a[data-store]").forEach((a) => a.click());
    expect(track).not.toHaveBeenCalled();
  });
});
