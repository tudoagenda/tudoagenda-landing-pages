import fs from "fs";
import path from "path";
import {
  APP_STORE_URL,
  GOOGLE_PLAY_BASE_URL,
  appStoreUrl,
} from "@/config/app-stores";
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
const OFERTA = LANDING_LOJAS.oferta;
const PAGINAS: LandingLojasConfig[] = [LP2, LP3, OFERTA];
const SLUG_DA_LP1 = "automatize-seu-atendimento";
const CTA_LOCATIONS = [
  "hero",
  "preco",
  "final",
  "sticky_mobile",
  "rodape_selo",
  "hero_selo",
  "preco_selo",
  "final_selo",
  "simulador_hero",
  "simulador_avaliacoes",
  "rodape_conheca_agenda_bela",
  "rodape_tudo_agenda",
  "cupom_copiar_hero",
  "cupom_copiar_preco",
];

const css = fs.readFileSync(path.join(__dirname, "../lojas.css"), "utf8");

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

  it("não cita o preço do Google Play: o preço cheio da página é R$ 59,90", () => {
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
    expect(links[0].getAttribute("href")).toBe(
      config.oferta ? appStoreUrl(config.slug) : APP_STORE_URL,
    );
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
      const links = linksDoAparelho(
        "a[data-store], a[data-sim], a[data-nav]",
      );
      expect(links.length).toBeGreaterThan(5);
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

  it("no computador os selos dizem a seção: hero_selo, preco_selo, final_selo", () => {
    mount(config, { ua: UA.desktop });
    linksDoAparelho(".cta a[data-store]").forEach((a) => a.click());
    linksDoAparelho(".foot-badges a[data-store]").forEach((a) => a.click());
    expect(
      eventos()
        .filter((e) => e.event === "store_click")
        .map((e) => `${e.store}@${e.cta_location}`),
    ).toEqual([
      "app_store@hero_selo",
      "google_play@hero_selo",
      "app_store@preco_selo",
      "google_play@preco_selo",
      "app_store@final_selo",
      "google_play@final_selo",
      "app_store@rodape_selo",
      "google_play@rodape_selo",
    ]);
  });

  it("todo selo de loja está dentro de um lugar conhecido (data-loc)", () => {
    document.body.innerHTML = markup(config);
    const lugares = new Set(
      [...lp().querySelectorAll("a[data-store]")].map((a) =>
        a.closest("[data-loc]")?.getAttribute("data-loc"),
      ),
    );
    expect([...lugares].sort()).toEqual(
      [
        "hero",
        "preco",
        "final",
        "sticky_mobile",
        "rodape_selo",
        "hero_selo",
        "preco_selo",
        "final_selo",
      ].sort(),
    );
  });

  it("se a animação quebrar, a medição continua: store_click sai com o slug certo", () => {
    setNavigator(UA.android);
    setMotion(false);
    history.replaceState(null, "", config.path);
    window.dataLayer = [];
    document.body.innerHTML = markup(config);
    runScriptAntesDaPintura();
    // HTML alterado por fora (extensão, tradutor): somem peças que a animação espera.
    document.getElementById("hero-legenda")?.remove();
    document.getElementById("dif-tabs")?.remove();
    expect(() => {
      cleanup = initLandingLojas({
        slug: config.slug,
        track: (event) => pushAgendaBelaLojasEvent(config.slug, event),
      });
    }).not.toThrow();
    // A animação não subiu (controles seguem escondidos)...
    expect(document.getElementById("mais-chips")?.hasAttribute("hidden")).toBe(
      true,
    );
    expect(lp().hasAttribute("data-pre")).toBe(false);
    // ...mas a página mediu a visita e mede os cliques.
    linksDoAparelho("#cta-hero a[data-store]")[0].click();
    linksDoAparelho(".final a[data-store]")[0].click();
    lp().querySelector<HTMLAnchorElement>("a[data-sim]")?.click();
    expect(
      eventos().map(
        (e) => `${e.event}:${e.cta_location ?? ""}@${e.landing_slug}`,
      ),
    ).toEqual([
      `lp_view:@${config.slug}`,
      `store_click:hero@${config.slug}`,
      `store_click:final@${config.slug}`,
      `cta_click:simulador_hero@${config.slug}`,
    ]);
    // O link da Play segue com a origem, mesmo sem animação.
    expect(linksDoAparelho("#cta-hero a[data-store]")[0].href).toContain(
      "&referrer=",
    );
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

  it("HTML alterado por fora: o runtime não quebra a página e o cleanup tira os listeners", () => {
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
    cleanup?.();
    cleanup = undefined;
    track.mockClear();
    linksDoAparelho("a[data-store]").forEach((a) => a.click());
    expect(track).not.toHaveBeenCalled();
  });
});

describe("Oferta Agenda Bela: comportamento", () => {
  /** jsdom não tem IntersectionObserver: este guarda o callback para o teste disparar. */
  function mockIntersectionObserver() {
    const observers: { cb: IntersectionObserverCallback; alvo?: Element }[] = [];
    const original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      private registro: { cb: IntersectionObserverCallback; alvo?: Element };
      constructor(cb: IntersectionObserverCallback) {
        this.registro = { cb };
        observers.push(this.registro);
      }
      observe(alvo: Element) {
        this.registro.alvo = alvo;
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    return {
      entrar(alvo: Element) {
        for (const o of observers.filter((x) => x.alvo === alvo)) {
          o.cb(
            [{ isIntersecting: true, target: alvo } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }
      },
      restaurar() {
        if (original) window.IntersectionObserver = original;
        else delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
      },
    };
  }

  /** Posição na tela de cada bloco, para o CTA fixo (jsdom não faz layout). */
  function posicionar(posicoes: Record<string, { top: number; bottom: number }>) {
    const rect = (top: number, bottom: number) =>
      ({ top, bottom, height: bottom - top }) as DOMRect;
    lp()
      .querySelectorAll<HTMLElement>(".cta")
      .forEach((cta) => {
        const p = posicoes[cta.getAttribute("data-loc") ?? ""];
        cta.getBoundingClientRect = () => rect(p.top, p.bottom);
      });
    const rodape = document.getElementById("rodape") as HTMLElement;
    rodape.getBoundingClientRect = () =>
      rect(posicoes.rodape.top, posicoes.rodape.bottom);
  }

  /** Roda o updateSticky do runtime (o scroll passa por requestAnimationFrame). */
  function rolar() {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
    window.dispatchEvent(new Event("scroll"));
  }

  const fixo = () => document.getElementById("cta-fixo") as HTMLElement;

  /** iPhone com tela de celular (max-width:767px), que é onde o CTA fixo existe. */
  function montarNoCelular(config: LandingLojasConfig) {
    setNavigator(UA.iphone);
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width:767px"),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    Object.defineProperty(window, "innerHeight", {
      value: 640,
      configurable: true,
    });
    history.replaceState(null, "", config.path);
    window.dataLayer = [];
    document.body.innerHTML = markup(config);
    runScriptAntesDaPintura();
    cleanup = initLandingLojas({ slug: config.slug, track: jest.fn() });
  }

  it("CTA fixo: some enquanto qualquer botão de loja da página está na tela", () => {
    montarNoCelular(OFERTA);

    // Topo da página: o botão do hero está na tela.
    posicionar({
      hero: { top: 500, bottom: 576 },
      preco: { top: 5000, bottom: 5076 },
      final: { top: 8000, bottom: 8076 },
      rodape: { top: 8300, bottom: 8900 },
    });
    rolar();
    expect(fixo().hidden).toBe(true);

    // Tela baixa: o botão do topo ainda não apareceu (está abaixo da dobra) e
    // nenhum outro está à vista. O fixo espera o do topo aparecer primeiro.
    posicionar({
      hero: { top: 700, bottom: 776 },
      preco: { top: 5200, bottom: 5276 },
      final: { top: 8200, bottom: 8276 },
      rodape: { top: 8500, bottom: 9100 },
    });
    rolar();
    expect(fixo().hidden).toBe(true);

    // Rolou: nenhum botão da página à vista, rodapé longe.
    posicionar({
      hero: { top: -900, bottom: -824 },
      preco: { top: 3000, bottom: 3076 },
      final: { top: 6000, bottom: 6076 },
      rodape: { top: 6300, bottom: 6900 },
    });
    rolar();
    expect(fixo().hidden).toBe(false);

    // Botão da seção "Quanto custa" na tela: o fixo some (não ficam dois iguais).
    posicionar({
      hero: { top: -3900, bottom: -3824 },
      preco: { top: 300, bottom: 376 },
      final: { top: 3000, bottom: 3076 },
      rodape: { top: 3300, bottom: 3900 },
    });
    rolar();
    expect(fixo().hidden).toBe(true);

    // Botão do final na tela.
    posicionar({
      hero: { top: -6900, bottom: -6824 },
      preco: { top: -2700, bottom: -2624 },
      final: { top: 200, bottom: 276 },
      rodape: { top: 700, bottom: 1300 },
    });
    rolar();
    expect(fixo().hidden).toBe(true);

    // Rodapé na tela.
    posicionar({
      hero: { top: -7900, bottom: -7824 },
      preco: { top: -3700, bottom: -3624 },
      final: { top: -800, bottom: -724 },
      rodape: { top: 100, bottom: 700 },
    });
    rolar();
    expect(fixo().hidden).toBe(true);
  });

  it("CTA fixo das outras landings de loja segue a regra de antes (só o botão do hero)", () => {
    montarNoCelular(LP2);
    // Botão da seção de preço na tela: na landing padrão o fixo continua.
    posicionar({
      hero: { top: -3900, bottom: -3824 },
      preco: { top: 300, bottom: 376 },
      final: { top: 3000, bottom: 3076 },
      rodape: { top: 3300, bottom: 3900 },
    });
    rolar();
    expect(fixo().hidden).toBe(false);
  });

  it("no computador o CTA fixo nunca aparece", () => {
    mount(OFERTA, { ua: UA.desktop });
    rolar();
    expect(fixo().hidden).toBe(true);
  });

  it("bloco de preço: arma a animação e solta quando o cartão entra na tela", () => {
    const io = mockIntersectionObserver();
    try {
      mount(OFERTA);
      const cartao = document.getElementById("oferta-card") as HTMLElement;
      expect(cartao.classList.contains("arm")).toBe(true);
      expect(cartao.classList.contains("on")).toBe(false);
      io.entrar(cartao);
      expect(cartao.classList.contains("on")).toBe(true);
      // Saiu da página: volta ao estado final do CSS.
      cleanup?.();
      cleanup = undefined;
      expect(cartao.className).toBe("of-card");
    } finally {
      io.restaurar();
    }
  });

  it("movimento reduzido: o bloco de preço já chega no estado final, sem armar", () => {
    const io = mockIntersectionObserver();
    try {
      mount(OFERTA, { reduce: true });
      expect(document.getElementById("oferta-card")?.className).toBe("of-card");
      expect(document.getElementById("hero-passo")?.textContent).toBe(
        "Passo 5 de 6",
      );
      expect(lp().querySelectorAll(".play")).toHaveLength(0);
    } finally {
      io.restaurar();
    }
  });

  it("sem IntersectionObserver nada é armado (preço e linha do tempo completos)", () => {
    mount(OFERTA);
    expect(document.getElementById("oferta-card")?.className).toBe("of-card");
  });

  it("o CSS da oferta só anima com movimento liberado e nunca esconde o preço", () => {
    const cssOferta = fs
      .readFileSync(path.join(__dirname, "../oferta.css"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    const [parado, movimento] = cssOferta.split(
      "@media (prefers-reduced-motion:no-preference){",
    );
    // Animação, transição e estado armado só existem com movimento liberado.
    expect(parado).not.toMatch(/animation:|transition:|\.arm\b|\[data-pre\]/);
    expect(movimento).toContain(".of-card.arm");
    // Preço, legenda, linha do tempo e condição nunca ficam transparentes
    // (só o selo de -50% entra com opacidade).
    expect(movimento.match(/opacity/g)).toHaveLength(2);
    expect(movimento).toMatch(/@keyframes lj-of-stkIn\{from\{opacity:0;/);
    // Toda regra vale só com data-oferta: as outras landings de loja não mudam.
    expect(
      cssOferta.match(/#lp(?!\[data-oferta\]|\[data-pre\]\[data-oferta\])/g),
    ).toBeNull();
    expect(css).not.toContain("data-oferta");
  });

  it("App Store: o link leva a campanha (ct) da sessão, ou o slug quando a visita chega sem origem", () => {
    const hrefs = () => [
      ...new Set(
        [...lp().querySelectorAll<HTMLAnchorElement>('a[data-store="app_store"]')].map(
          (a) => a.getAttribute("href"),
        ),
      ),
    ];
    mount(OFERTA, { ua: UA.iphone });
    expect(hrefs()).toEqual([`${APP_STORE_URL}?ct=oferta`]);
    cleanup?.();

    mount(OFERTA, {
      ua: UA.iphone,
      url: `${OFERTA.path}?utm_source=ig&utm_campaign=agendabela oferta/nov26 com nome bem comprido demais`,
    });
    // Só letras, números, _ . - e no máximo 40 caracteres (limite da Apple).
    expect(hrefs()).toEqual([
      `${APP_STORE_URL}?ct=agendabela_oferta_nov26_com_nome_bem_com`,
    ]);
    cleanup?.();

    // Clique pago que chegou sem UTM: sem ct, para não virar "tráfego do site".
    cleanup = undefined;
    setNavigator(UA.iphone);
    setMotion(false);
    document.body.innerHTML = markup(OFERTA);
    cleanup = initLandingLojas({
      slug: OFERTA.slug,
      track: jest.fn(),
      attribution: { fbclid: "abc" },
    });
    expect(hrefs()).toEqual([APP_STORE_URL]);
    // Antes do runtime (ou sem JavaScript) o link sai puro: o servidor não
    // sabe a origem e não rotula a visita.
    document.body.innerHTML = markup(OFERTA);
    expect(hrefs()).toEqual([APP_STORE_URL]);
  });

  it("App Store nas outras landings de loja: link puro, sem ct, com ou sem UTM", () => {
    mount(LP2, { ua: UA.iphone, url: `${LP2.path}?utm_campaign=teste` });
    for (const a of lp().querySelectorAll<HTMLAnchorElement>(
      'a[data-store="app_store"]',
    )) {
      expect(a.getAttribute("href")).toBe(APP_STORE_URL);
    }
  });

  it("legendas da demonstração: as do runtime são as do HTML, e falam com a leitora", () => {
    mount(OFERTA);
    const lista = [...lp().querySelectorAll("#hero-stage ol.sr li")].map(
      (li) => li.textContent,
    );
    expect(lista).toHaveLength(6);
    lista.forEach((frase, i) => {
      document.getElementById(`hero-passo-${i + 1}`)?.click();
      expect(document.getElementById("hero-legenda")?.textContent).toBe(frase);
      expect(
        document.getElementById(`hero-passo-${i + 1}`)?.getAttribute("aria-label"),
      ).toBe(`Passo ${i + 1} de 6: ${frase}`);
    });
    expect(lista.join(" ")).not.toMatch(/a Paula/);
    document.getElementById("hero-passo-6")?.click();
    expect(document.getElementById("hero-quem")?.textContent).toBe("Seu celular");
    document.getElementById("hero-passo-1")?.click();
    expect(document.getElementById("hero-quem")?.textContent).toBe(
      "Celular da Camila",
    );
  });

  it("as outras landings de loja seguem com as legendas e o chip de antes", () => {
    mount(LP2);
    document.getElementById("hero-passo-4")?.click();
    expect(document.getElementById("hero-legenda")?.textContent).toBe(
      "A Paula é avisada no celular, com o sinal já no saldo. Ela segue atendendo.",
    );
    expect(document.getElementById("hero-quem")?.textContent).toBe(
      "Celular da Paula",
    );
    expect(lp().hasAttribute("data-oferta")).toBe(false);
  });

  it("medição: mesmos eventos e lugares das outras landings, com o slug oferta", () => {
    mount(OFERTA, { ua: UA.android, url: `${OFERTA.path}?ref=qr_desktop` });
    linksDoAparelho("a[data-store], a[data-sim], a[data-nav]").forEach((a) =>
      a.click(),
    );
    // Os links novos da oferta (faixa, cartão, perguntas, WhatsApp) não criam evento.
    lp()
      .querySelectorAll<HTMLAnchorElement>("#faixa, .ofr, .of-link, .faq a")
      .forEach((a) => a.click());
    expect(new Set(eventos().map((e) => e.landing_slug))).toEqual(
      new Set(["oferta"]),
    );
    expect(new Set(eventos().map((e) => e.event))).toEqual(
      new Set(["lp_view", "store_click", "cta_click"]),
    );
    expect(eventos()[0].ref).toBe("qr_desktop");
    expect(
      new Set(
        eventos()
          .filter((e) => e.event !== "lp_view")
          .map((e) => e.cta_location),
      ),
    ).toEqual(
      new Set([
        "hero",
        "preco",
        "final",
        "sticky_mobile",
        "rodape_selo",
        "simulador_avaliacoes",
        "rodape_tudo_agenda",
      ]),
    );
  });
});

describe("Oferta Agenda Bela: cupom copiável", () => {
  const caixa = (lugar: string) =>
    lp().querySelector(`[data-cupom="${lugar}"]`) as HTMLElement;
  const botao = (lugar: string) =>
    caixa(lugar).querySelector(".cupom-btn") as HTMLButtonElement;
  /** O "Cupom copiado!" que aparece no lugar do aviso de copiar. */
  const msg = (lugar: string) =>
    caixa(lugar).querySelector(".cupom-msg")?.textContent;
  const status = (lugar: string) =>
    caixa(lugar).querySelector(".cupom-status")?.textContent;
  const falha = (lugar: string) =>
    caixa(lugar).querySelector(".cupom-nojs .cupom-falha") as HTMLElement;
  const ligado = (lugar: string) => caixa(lugar).hasAttribute("data-cupom-on");

  function mockClipboard(writeText: jest.Mock | undefined) {
    Object.defineProperty(window.navigator, "clipboard", {
      value: writeText ? { writeText } : undefined,
      configurable: true,
    });
  }
  /** jsdom não tem execCommand: cada teste diz se o campo temporário copia. */
  function mockExecCommand(copia: boolean | Error) {
    const exec = jest.fn(() => {
      if (copia instanceof Error) throw copia;
      return copia;
    });
    (document as unknown as { execCommand: unknown }).execCommand = exec;
    return exec;
  }
  /** Aparelho com mouse: a mesma media query do CSS (.so-mouse). */
  function comMouse() {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("pointer:fine"),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  }
  /** A cópia é uma promessa: deixa as continuações rodarem. */
  const promessas = async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  };
  /** Idem, e a região viva é preenchida (50 ms depois de esvaziada). */
  const assentar = async () => {
    await promessas();
    jest.advanceTimersByTime(50);
  };
  const cliquesMedidos = () =>
    eventos()
      .filter((e) => e.event !== "lp_view")
      .map((e) => `${e.event}:${e.cta_location}@${e.landing_slug}`);

  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    mockClipboard(undefined);
    delete (document as unknown as { execCommand?: unknown }).execCommand;
    window.getSelection()?.removeAllRanges();
  });

  it.each(["hero", "preco"])(
    "%s: o toque copia o código da config, avisa por 2,5 s e volta",
    async (lugar) => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      mockClipboard(writeText);
      mount(OFERTA, { ua: UA.android });
      expect(msg(lugar)).toBe("");

      botao(lugar).click();
      await assentar();
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(OFERTA.oferta.cupom);
      expect(msg(lugar)).toBe("Cupom copiado!");
      expect(status(lugar)).toBe("Cupom copiado!");
      expect(caixa(lugar).classList.contains("is-copiado")).toBe(true);
      // O rótulo do botão não muda: quem avisa o leitor de tela é a região viva.
      expect(botao(lugar).getAttribute("aria-label")).toBe("Copiar o cupom BELA50");

      jest.advanceTimersByTime(2400);
      expect(msg(lugar)).toBe("Cupom copiado!");
      jest.advanceTimersByTime(100);
      expect(msg(lugar)).toBe("");
      expect(status(lugar)).toBe("");
      expect(caixa(lugar).className).toBe(`cupom cupom-${lugar}`);
      expect(ligado(lugar)).toBe(true);
    },
  );

  it("medição: cada toque sai como cta_click, com o lugar do cupom e o slug da oferta", async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    mount(OFERTA, { ua: UA.iphone });
    botao("hero").click();
    botao("preco").click();
    await assentar();
    expect(cliquesMedidos()).toEqual([
      "cta_click:cupom_copiar_hero@oferta",
      "cta_click:cupom_copiar_preco@oferta",
    ]);
  });

  it("medição: toque repetido com o aviso na tela conta um só; depois que o aviso sai, conta de novo", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    mount(OFERTA, { ua: UA.iphone });
    // Duplo toque, antes mesmo de a cópia terminar.
    botao("hero").click();
    botao("hero").click();
    await assentar();
    // E mais um com o "Cupom copiado!" na tela.
    botao("hero").click();
    await assentar();
    expect(writeText).toHaveBeenCalledTimes(3);
    expect(cliquesMedidos()).toEqual(["cta_click:cupom_copiar_hero@oferta"]);
    // O aviso some 2,5 s depois do último toque: aí um toque novo conta.
    jest.advanceTimersByTime(2500);
    expect(msg("hero")).toBe("");
    botao("hero").click();
    await assentar();
    expect(cliquesMedidos()).toEqual([
      "cta_click:cupom_copiar_hero@oferta",
      "cta_click:cupom_copiar_hero@oferta",
    ]);
  });

  it("clipboard rejeita: copia pelo campo temporário e avisa do mesmo jeito", async () => {
    const writeText = jest.fn().mockRejectedValue(new Error("NotAllowedError"));
    mockClipboard(writeText);
    const exec = mockExecCommand(true);
    mount(OFERTA, { ua: UA.iphone });
    botao("preco").click();
    await assentar();
    expect(writeText).toHaveBeenCalledWith("BELA50");
    expect(exec).toHaveBeenCalledWith("copy");
    expect(msg("preco")).toBe("Cupom copiado!");
    expect(ligado("preco")).toBe(true);
    // O campo temporário não fica na página.
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("sem Clipboard API (http, navegador interno antigo): vai direto ao campo temporário", async () => {
    mockClipboard(undefined);
    const exec = mockExecCommand(true);
    mount(OFERTA, { ua: UA.androidInstagram });
    botao("hero").click();
    await assentar();
    expect(exec).toHaveBeenCalledWith("copy");
    expect(msg("hero")).toBe("Cupom copiado!");
  });

  it.each([
    ["execCommand devolve false", false as boolean | Error],
    ["execCommand lança", new Error("bloqueado")],
  ])(
    "nada copia (%s): sai o botão, volta o código em texto, selecionado, com o aviso de segurar",
    async (_caso, resultado) => {
      mockClipboard(jest.fn().mockRejectedValue(new Error("NotAllowedError")));
      mockExecCommand(resultado);
      mount(OFERTA, { ua: UA.iphone });
      expect(falha("preco").hidden).toBe(true);
      botao("preco").click();
      await assentar();
      // Sem data-cupom-on o CSS esconde o botão e mostra a versão em texto.
      expect(ligado("preco")).toBe(false);
      expect(caixa("preco").className).toBe("cupom cupom-preco is-falha");
      expect(falha("preco").hidden).toBe(false);
      expect(msg("preco")).toBe("");
      // Selecionado o código da versão em texto (não o de dentro do botão).
      const selecao = window.getSelection() as Selection;
      expect(selecao.toString()).toBe("BELA50");
      expect(
        caixa("preco").querySelector(".cupom-nojs")?.contains(selecao.anchorNode),
      ).toBe(true);
      // Aparelho de toque: a região viva lê a redação de toque.
      expect(status("preco")).toBe("Segure o código para copiar");
      // Não volta sozinho ao botão.
      jest.advanceTimersByTime(60_000);
      expect(ligado("preco")).toBe(false);
      expect(falha("preco").hidden).toBe(false);
      expect(status("preco")).toBe("Segure o código para copiar");
      // A outra caixa segue como botão.
      expect(ligado("hero")).toBe(true);
      expect(falha("hero").hidden).toBe(true);
      // O toque que falhou foi medido, uma vez.
      expect(cliquesMedidos()).toEqual(["cta_click:cupom_copiar_preco@oferta"]);
    },
  );

  it("nada copia, com mouse: a região viva lê \"Código selecionado: copie\"", async () => {
    mockClipboard(undefined);
    mockExecCommand(false);
    mount(OFERTA, { ua: UA.desktop });
    comMouse();
    botao("hero").click();
    await assentar();
    expect(ligado("hero")).toBe(false);
    expect(falha("hero").hidden).toBe(false);
    expect(status("hero")).toBe("Código selecionado: copie");
    expect(window.getSelection()?.toString()).toBe("BELA50");
  });

  it("o cleanup desliga a cópia e desfaz os avisos, mesmo com cópia em andamento ou falha", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    mount(OFERTA, { ua: UA.iphone });
    botao("hero").click();
    await assentar();
    expect(msg("hero")).toBe("Cupom copiado!");
    botao("preco").click(); // ainda não assentou
    cleanup?.();
    cleanup = undefined;
    await assentar();
    expect(msg("hero")).toBe("");
    expect(msg("preco")).toBe("");
    expect(status("hero")).toBe("");
    // O aviso da cópia que estava em andamento não aparece depois do cleanup.
    jest.advanceTimersByTime(3000);
    expect(msg("preco")).toBe("");
    expect(caixa("preco").className).toBe("cupom cupom-preco");
    const eventosAntes = eventos().length;
    botao("hero").click();
    await assentar();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(eventos()).toHaveLength(eventosAntes);

    // Depois de uma falha, o cleanup devolve o HTML do servidor.
    mockClipboard(undefined);
    mockExecCommand(false);
    mount(OFERTA, { ua: UA.iphone });
    botao("hero").click();
    await assentar();
    expect(falha("hero").hidden).toBe(false);
    cleanup?.();
    cleanup = undefined;
    expect(falha("hero").hidden).toBe(true);
    expect(caixa("hero").className).toBe("cupom cupom-hero");
    expect(lp().querySelectorAll("[data-cupom-on]")).toHaveLength(0);
  });

  it("o botão só aparece ligado: o runtime marca data-cupom-on e o cleanup tira", () => {
    document.body.innerHTML = markup(OFERTA);
    expect(lp().querySelectorAll("[data-cupom-on]")).toHaveLength(0);
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    mount(OFERTA, { ua: UA.iphone });
    expect(lp().querySelectorAll("[data-cupom][data-cupom-on]")).toHaveLength(2);
    cleanup?.();
    cleanup = undefined;
    expect(lp().querySelectorAll("[data-cupom-on]")).toHaveLength(0);
  });

  it("segundo toque seguido: a região viva esvazia e volta a anunciar", async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    mount(OFERTA, { ua: UA.iphone });
    botao("hero").click();
    await assentar();
    expect(status("hero")).toBe("Cupom copiado!");
    botao("hero").click();
    await promessas();
    expect(status("hero")).toBe("");
    jest.advanceTimersByTime(50);
    expect(status("hero")).toBe("Cupom copiado!");
    // O prazo conta do último toque.
    jest.advanceTimersByTime(2400);
    expect(msg("hero")).toBe("Cupom copiado!");
  });

  it("medição quebrada não impede a cópia", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    setNavigator(UA.iphone);
    setMotion(false);
    document.body.innerHTML = markup(OFERTA);
    let quebrar = false;
    cleanup = initLandingLojas({
      slug: OFERTA.slug,
      track: () => {
        if (quebrar) throw new Error("dataLayer congelado");
      },
    });
    quebrar = true;
    botao("preco").click();
    await assentar();
    expect(writeText).toHaveBeenCalledWith("BELA50");
    expect(msg("preco")).toBe("Cupom copiado!");
  });

  it("campo temporário: o foco volta para o botão do cupom", async () => {
    mockClipboard(undefined);
    (document as unknown as { execCommand: unknown }).execCommand = jest.fn(() => {
      // Como no navegador: o campo selecionado está com o foco na hora da cópia.
      (document.querySelector("textarea") as HTMLTextAreaElement).focus();
      return true;
    });
    mount(OFERTA, { ua: UA.iphone });
    botao("preco").focus();
    botao("preco").click();
    await assentar();
    expect(document.activeElement).toBe(botao("preco"));
  });

  it("as outras landings de loja não têm cupom", () => {
    mount(LP2, { ua: UA.iphone });
    expect(lp().querySelector("[data-cupom], .cupom-btn")).toBeNull();
    expect(lp().innerHTML).not.toMatch(/cupom/i);
  });
});

describe("Oferta Agenda Bela: rodapé", () => {
  it("liga para a home, mas não para a landing principal (cadastro pela web, outro preço)", () => {
    mount(OFERTA, { ua: UA.iphone });
    expect(
      lp().querySelector<HTMLAnchorElement>(".foot-brand a")?.getAttribute("href"),
    ).toBe("/");
    expect(lp().innerHTML).not.toContain("automatize-seu-atendimento");
    expect(
      [...lp().querySelectorAll(".foot nav a")].map((a) => a.getAttribute("href")),
    ).toEqual([
      "/termos",
      "/privacidade",
      "mailto:contato@tudoagenda.com.br",
      "https://wa.me/5519936180533?text=Oi!%20Preciso%20de%20ajuda%20com%20o%20Agenda%20Bela",
    ]);
  });
});

describe.each([LP2, LP3])("landing de loja $slug: rodapé", (config) => {
  it("liga para a home e para a landing principal, com ?ref= da página", () => {
    mount(config, { ua: UA.iphone });
    const home = lp().querySelector<HTMLAnchorElement>(".foot-brand a");
    expect(home?.getAttribute("href")).toBe("/");
    expect(home?.textContent).toBe("por Tudo Agenda");
    const principal = lp().querySelector<HTMLAnchorElement>(
      '.foot nav a[data-nav="rodape_conheca_agenda_bela"]',
    );
    expect(principal?.getAttribute("href")).toBe(
      `/agendabela/automatize-seu-atendimento?ref=${config.slug}_rodape`,
    );
  });

  it("os dois links saem como cta_click com o landing_slug da página", () => {
    mount(config, { ua: UA.iphone });
    lp()
      .querySelectorAll<HTMLAnchorElement>("a[data-nav]")
      .forEach((a) => a.click());
    expect(
      eventos()
        .filter((e) => e.event === "cta_click")
        .map((e) => `${e.cta_location}@${e.landing_slug}`),
    ).toEqual([
      `rodape_tudo_agenda@${config.slug}`,
      `rodape_conheca_agenda_bela@${config.slug}`,
    ]);
  });
});
