import { renderToStaticMarkup } from "react-dom/server";
import { APP_STORE_URL, GOOGLE_PLAY_BASE_URL } from "@/config/app-stores";
import {
  LANDING_LOJAS,
  OFERTA_AGENDA_BELA,
  type LandingLojasConfig,
  type OfertaConfig,
} from "@/config/landing-lojas";
import OfertaPage from "../../oferta/page";
import { buildOfertaFaq } from "../faq-oferta";
import { buildLojasMarkup } from "../markup";

/**
 * Oferta Agenda Bela (/agendabela/oferta): o que a visitante e os robôs leem
 * no HTML do servidor. Comportamento (CTA fixo, animação, medição) está em
 * landing-lojas.test.ts; metadata, sitemap e redirect em
 * src/app/__tests__/seo-landings-de-loja.test.ts.
 */
const OFERTA = LANDING_LOJAS.oferta;

function markup(config: LandingLojasConfig, oferta = config.oferta): string {
  return buildLojasMarkup({
    slug: config.slug,
    tema: config.tema,
    temaExpiraEm: config.temaExpiraEm,
    refSimulador: config.refSimulador,
    oferta,
    assets: {
      logo: "/logo.png",
      qr: `/qr-${config.slug}.svg`,
      santanderX: "/santander-x.png",
      foundersClub: "/founders-club.png",
    },
    ano: 2026,
  });
}

function dom(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** Texto comparável: &nbsp; vira espaço comum e espaços seguidos viram um. */
const texto = (el: Element | null | undefined) =>
  (el?.textContent ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

const htmlDaPagina = renderToStaticMarkup(<OfertaPage />);
const html = markup(OFERTA);
const doc = dom(html);

describe("Oferta Agenda Bela: valores vêm da config", () => {
  it("mostra de R$ 59,90 por R$ 29,95 nos 3 primeiros meses e a economia de R$ 89,85", () => {
    expect(texto(doc.querySelector(".ofr"))).toBe(
      "Oferta Agenda Bela−50% em vez deR$ 59,90R$ 29,95 por mês nos 3 primeiros meses. Depois, R$ 59,90 por mês.",
    );
    expect(texto(doc.querySelector(".of-was"))).toBe("Em vez de R$ 59,90 por mês");
    expect(texto(doc.getElementById("oferta-titulo"))).toBe(
      "R$ 29,95por mês nos 3 primeiros meses.",
    );
    expect(texto(doc.querySelector(".of-eco"))).toBe(
      "Você economiza R$ 89,85 se ficar os 3 meses.",
    );
    expect(
      [...doc.querySelectorAll(".tl-i")].map((li) =>
        [texto(li.querySelector(".t")), texto(li.querySelector(".v"))].join(" | "),
      ),
    ).toEqual([
      "Teste de 7 dias | sem cartão",
      "Nos 3 primeiros meses: | R$ 29,95 por mês",
      "Do 4º mês em diante: | R$ 59,90 por mês",
    ]);
  });

  it("trocar o valor na config troca a página inteira: nada fica escrito à mão", () => {
    const outra: OfertaConfig = {
      precoCheioCentavos: 6490,
      precoPromoCentavos: 3190,
      meses: 4,
      percentual: 51,
    };
    const htmlOutra = markup(OFERTA, outra);
    // Nenhum valor da oferta atual sobra (R$ 20,00 e R$ 59,90 dos mocks não contam:
    // o preço cheio também some).
    expect(htmlOutra).not.toMatch(/29,95|89,85|59,90|50%|3 primeiros|3 meses|4º mês/);
    expect(htmlOutra).toContain("R$&nbsp;31,90");
    expect(htmlOutra).toContain("R$&nbsp;64,90");
    // (64,90 − 31,90) × 4
    expect(texto(dom(htmlOutra).querySelector(".of-eco"))).toBe(
      "Você economiza R$ 132,00 se ficar os 4 meses.",
    );
    expect(htmlOutra).toContain("Do 5º mês em diante");
    expect(htmlOutra).toContain("&minus;51%");
  });

  it("todo valor em reais tem espaço que não quebra entre R$ e o número", () => {
    const visivel = html.replace(/aria-label="[^"]*"/g, "");
    expect(visivel).not.toMatch(/R\$ \d/);
    expect(visivel.match(/R\$&nbsp;29,95/g)?.length).toBeGreaterThanOrEqual(8);
  });

  it("leitor de tela ouve a oferta inteira no cartão do topo", () => {
    expect(doc.querySelector(".ofr")?.getAttribute("aria-label")).toBe(
      "Oferta Agenda Bela: em vez de R$ 59,90 por mês, R$ 29,95 por mês nos 3 primeiros meses. Depois, volta a R$ 59,90 por mês. Ver os detalhes.",
    );
    expect(doc.getElementById("faixa")?.getAttribute("aria-label")).toBe(
      "Oferta Agenda Bela: 50% nos 3 primeiros meses. Ver a oferta.",
    );
  });
});

describe("Oferta Agenda Bela: o que a página não pode dizer", () => {
  it.each([
    ["grátis", /gr[áa]tis|gratuit/i],
    ["preço do Google Play", /59,99/],
    ["Black Friday", /black\s*friday/i],
    ["boas-vindas", /boas[- ]vindas/i],
    [
      "data de encerramento",
      // dia/mês (o CNPJ do rodapé tem barra, mas não é data)
      /(?<!\d)\d{1,2}\/\d{1,2}(?!\d)|até (o )?dia|\b(janeiro|fevereiro|dezembro|novembro)\b|últimos dias|só até|termina em/i,
    ],
    ["modal de cadastro ou AbacatePay", /abacate|modal|signup|cadastro-web|<form|<input/i],
    ["um preço só", /um preço só/i],
  ])("%s", (_nome, proibido) => {
    expect(html).not.toMatch(proibido);
    expect(htmlDaPagina).not.toMatch(proibido);
  });

  it("não tem validade gravada: a página não se desliga sozinha numa data", () => {
    expect(doc.getElementById("lp")?.getAttribute("data-tema")).toBe("padrao");
    expect(doc.getElementById("lp")?.hasAttribute("data-tema-fim")).toBe(false);
    expect(OFERTA).not.toHaveProperty("temaExpiraEm");
  });

  it("não leva nada do protótipo: barra, botão vinho, QR provisório", () => {
    expect(html).not.toMatch(/prot[óo]tipo|proto-|data-btnv|class="btn"|qr-lp2/i);
    expect(html).not.toContain("<!--");
    expect(html).not.toContain("tl-fill");
  });
});

describe("Oferta Agenda Bela: estrutura da página", () => {
  it("seções na ordem do protótipo", () => {
    const ordem = [...doc.querySelectorAll("#lp > *")]
      .filter((el) => el.tagName !== "SCRIPT")
      .map((el) => el.id || el.className);
    expect(ordem).toEqual([
      "faixa",
      "topo",
      "preco",
      "sec how",
      "diferenciais",
      "price-sec",
      "sec rev",
      "trust",
      "faq",
      "final-sec",
      "rodape",
      "cta-fixo",
    ]);
  });

  it("hero: subtítulo, cartão, chamada, botão da loja, apoio e público, nessa ordem", () => {
    expect(
      [...doc.querySelectorAll(".hero-txt > *")].map((el) => el.id || el.className),
    ).toEqual([
      "hdr",
      "slot-eyebrow",
      "", // h1
      "sub",
      "ofr",
      "cta-t",
      "cta-hero",
      "micro",
      "audience",
    ]);
    expect(texto(doc.querySelector("h1"))).toBe("Pode atender tranquila.");
    expect(texto(doc.querySelector(".sub"))).toBe(
      "Eu lembro suas clientes do horário e te conto quem confirmou.",
    );
    expect(texto(doc.querySelector(".cta-t"))).toBe(
      "Baixe o app e teste 7 dias, sem cartão",
    );
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("faixa, cartão e link das perguntas levam a âncoras que existem", () => {
    expect(doc.getElementById("faixa")?.getAttribute("href")).toBe("#preco");
    expect(doc.querySelector(".ofr")?.getAttribute("href")).toBe("#preco");
    expect(doc.querySelector(".of-link")?.getAttribute("href")).toBe("#faq");
    expect(doc.getElementById("preco")?.tagName).toBe("SECTION");
    expect(doc.getElementById("faq")?.tagName).toBe("SECTION");
    expect(doc.querySelectorAll("#preco, #faq, #faixa, #oferta-card")).toHaveLength(4);
  });

  it('caixa "Quem pode" diz quem tem direito, sem data', () => {
    const caixa = doc.querySelector(".of-cond");
    expect(texto(caixa?.querySelector(".mono"))).toBe("Quem pode");
    expect(texto(caixa)).toContain(
      "Vale para quem assina o Agenda Bela pela primeira vez, pelo app. A oferta vale enquanto aparecer na tela da loja na hora de assinar.",
    );
    expect(texto(caixa)).toContain(
      "o valor volta para R$ 59,90 por mês e a cobrança continua todo mês, até você cancelar.",
    );
  });

  it("apoio do botão muda com o aparelho; sem JavaScript vale o texto neutro", () => {
    const apoio = (dev: string) =>
      texto(doc.querySelector(`#micro [data-dev="${dev}"] .micro`));
    expect(apoio("ios")).toBe(
      "7 dias de teste, sem cartão. Se gostar e assinar, a App Store cobra na hora os R$ 29,95 (já com o desconto) e, depois dos 3 meses, R$ 59,90 por mês.",
    );
    expect(apoio("android")).toBe(
      "Teste 7 dias sem cartão. Ao assinar, a loja cobra R$ 29,95 por mês nos 3 primeiros meses; depois, R$ 59,90 por mês.",
    );
    expect(apoio("desktop")).toBe(apoio("nojs"));
    expect(apoio("nojs")).toBe(
      "Teste 7 dias sem cartão. Ao assinar pelo app, os 3 primeiros meses saem por R$ 29,95 por mês; depois, R$ 59,90 por mês.",
    );
    // Nenhum bloco de aparelho depende de JS para deixar de estar "hidden".
    expect(doc.querySelectorAll("[data-dev][hidden]")).toHaveLength(0);
  });

  it("CTA fixo do celular: selo da loja e a linha do teste, sem preço", () => {
    const fixo = doc.getElementById("cta-fixo");
    expect(fixo?.hasAttribute("hidden")).toBe(true);
    expect([...(fixo?.querySelectorAll("small") ?? [])].map(texto)).toEqual([
      "Teste 7 dias, sem cartão",
      "Teste 7 dias, sem cartão",
    ]);
  });

  it("todo botão de loja leva à App Store ou ao Google Play, e a nenhum outro lugar", () => {
    const lojas = [...doc.querySelectorAll<HTMLAnchorElement>("a[data-store]")];
    expect(lojas.length).toBeGreaterThan(15);
    for (const a of lojas) {
      expect(a.getAttribute("href")).toBe(
        a.dataset.store === "app_store" ? APP_STORE_URL : GOOGLE_PLAY_BASE_URL,
      );
    }
    for (const dev of ["ios", "android"]) {
      const esperado = dev === "ios" ? "app_store" : "google_play";
      const doAparelho = [
        ...doc.querySelectorAll<HTMLAnchorElement>(
          `.cta [data-dev="${dev}"] a, #cta-fixo [data-dev="${dev}"] a`,
        ),
      ];
      expect(doAparelho).toHaveLength(4);
      for (const a of doAparelho) expect(a.dataset.store).toBe(esperado);
    }
    // Computador: os dois selos e o QR da própria rota, nas três seções.
    expect(
      [...doc.querySelectorAll('.cta [data-dev="desktop"] .dt-qr img')].map((img) =>
        img.getAttribute("src"),
      ),
    ).toEqual(["/qr-oferta.svg", "/qr-oferta.svg", "/qr-oferta.svg"]);
  });
});

describe("Oferta Agenda Bela: perguntas", () => {
  const faq = buildOfertaFaq(OFERTA_AGENDA_BELA);
  const itens = [...doc.querySelectorAll(".faq details")];

  it("10 perguntas, na ordem do protótipo", () => {
    expect(itens.map((d) => texto(d.querySelector("summary")))).toEqual([
      "O que é o Agenda Bela?",
      "Como funciona o desconto de 50%?",
      "Quem pode usar o desconto?",
      "O desconto vale junto com o teste de 7 dias?",
      "Preciso de cartão para começar?",
      "E depois dos 3 meses, quanto custa?",
      "E se eu cancelar antes dos 3 meses?",
      "Funciona no iPhone e no Android?",
      "As mensagens para minhas clientes saem do meu WhatsApp?",
      "Minha cliente precisa baixar algo?",
    ]);
    expect(faq.map((item) => item.pergunta)).toEqual(
      itens.map((d) => texto(d.querySelector("summary"))),
    );
  });

  it("a resposta sobre o teste muda com o aparelho", () => {
    const resposta = (dev: string) =>
      texto(itens[3].querySelector(`[data-dev="${dev}"]`));
    expect(resposta("ios")).toBe(
      "Sim. Primeiro você testa 7 dias, sem cartão e sem pagar nada. Quando decidir assinar, a App Store cobra na hora R$ 29,95, já com o desconto, e esse preço vale por 3 meses.",
    );
    expect(resposta("android")).toBe(
      "Sim. Os 7 dias sem cartão continuam, e, ao assinar, os 3 primeiros meses saem pela metade.",
    );
    expect(resposta("desktop")).toBe(
      "Os 7 dias sem cartão continuam. Ao assinar pelo app, o desconto vale nos 3 primeiros meses.",
    );
    expect(resposta("nojs")).toBe(resposta("desktop"));
  });

  it("quem não vê o desconto tem para onde ir: WhatsApp do suporte, em aba nova", () => {
    const link = itens[2].querySelector("a");
    expect(link?.getAttribute("href")).toBe(
      "https://wa.me/5519936180533?text=Oi!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20desconto%20do%20Agenda%20Bela",
    );
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(texto(link)).toBe("Chame a gente no WhatsApp (abre em nova aba)");
  });
});

describe("Oferta Agenda Bela: SEO da página de campanha", () => {
  it("sem JSON-LD (página fora do índice não leva dado estruturado)", () => {
    expect(htmlDaPagina).not.toContain("application/ld+json");
    expect(htmlDaPagina).not.toMatch(/schema\.org|priceValidUntil/);
  });

  it("a demonstração não vira trecho de resultado (data-nosnippet)", () => {
    expect(
      doc.getElementById("hero-aparelho")?.hasAttribute("data-nosnippet"),
    ).toBe(true);
  });
});

describe("as outras landings de loja não mudam com a oferta", () => {
  it.each([LANDING_LOJAS.appParaSalaoDeBeleza, LANDING_LOJAS.blackFriday])(
    "$slug: nenhum bloco, classe ou texto da oferta",
    (config) => {
      const outra = markup(config);
      expect(outra).not.toMatch(
        /data-oferta|class="ofr|of-card|class="tl|cta-t|id="faixa"|id="faq"|29,95|89,85|metade|desconto|Oferta Agenda Bela|Seu celular/,
      );
      expect(outra).toContain("7 dias grátis");
      expect(outra).toContain("Celular da Paula");
    },
  );
});
