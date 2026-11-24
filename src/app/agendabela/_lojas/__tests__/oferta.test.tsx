import fs from "fs";
import path from "path";
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
      "em vez deR$ 59,90−50% R$ 29,95por mês nos 3 primeiros meses",
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
      meses: 5,
      percentual: 51,
    };
    const htmlOutra = markup(OFERTA, outra);
    // Nenhum valor da oferta atual sobra (R$ 20,00 e R$ 59,90 dos mocks não contam:
    // o preço cheio também some).
    expect(htmlOutra).not.toMatch(
      /29,95|89,85|59,90|50%|3 primeiros|3 meses|3º mês|4º mês|metade/,
    );
    expect(htmlOutra).toContain("R$&nbsp;31,90");
    expect(htmlOutra).toContain("R$&nbsp;64,90");
    // (64,90 − 31,90) × 5
    expect(texto(dom(htmlOutra).querySelector(".of-eco"))).toBe(
      "Você economiza R$ 165,00 se ficar os 5 meses.",
    );
    expect(htmlOutra).toContain("Do 6º mês em diante");
    expect(htmlOutra).toContain("Depois do 5º mês, R$&nbsp;64,90 por mês.");
    expect(htmlOutra).toContain("&minus;51%");
    expect(htmlOutra).toContain("7 dias grátis · depois 51% off");
    // "metade do preço" só existe com 50%; com outro percentual vira o número.
    expect(htmlOutra).toContain("(51% de desconto)");
    expect(html).toContain("(metade do preço)");
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
      "Oferta Agenda Bela: 50% de desconto nos 3 primeiros meses. Ver a oferta.",
    );
    expect(texto(doc.getElementById("faixa"))).toBe(
      "Oferta Agenda Bela · 50% de desconto",
    );
  });
});

describe("Oferta Agenda Bela: o que a página não pode dizer", () => {
  it.each([
    ["secretária (atrai candidata a emprego)", /secret[áa]ria/i],
    ["nota ou número de avaliações das lojas", /nota \d|\d[,.]\d (na|no) |\d+ avalia[çc][õo]es|estrelas|★/i],
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

  it('"grátis" só na barra fixa do celular (frase do Carlos); no resto, "sem cartão"', () => {
    const semBarraFixa = dom(html);
    semBarraFixa.getElementById("cta-fixo")?.remove();
    expect(semBarraFixa.body.innerHTML).not.toMatch(/gr[áa]tis|gratuit/i);
    expect(html.match(/grátis/g)).toHaveLength(2);
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

  it("hero: marca, o que é o produto, a dor, o preço, o botão da loja e a condição, nessa ordem", () => {
    expect(
      [...doc.querySelectorAll(".hero-txt > *")].map((el) => el.id || el.className),
    ).toEqual([
      "hdr",
      "slot-eyebrow",
      "", // h1
      "sub",
      "dor",
      "ofr",
      "cta-hero",
      "micro",
      "audience",
      "prova",
    ]);
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(texto(doc.querySelector("h1"))).toBe(
      "O app que lembra suas clientes e cobra o sinal no Pix",
    );
    expect(texto(doc.querySelector(".sub"))).toBe("Pode atender tranquila.");
    expect(texto(doc.querySelector(".dor"))).toBe(
      "Cliente que falta é horário vazio. Eu lembro cada uma e te conto quem confirmou.",
    );
    expect(texto(doc.getElementById("slot-eyebrow"))).toBe(
      "Feito para salão de beleza",
    );
  });

  it("a marca aparece escrita ao lado do ícone, sem o leitor de tela repetir o nome", () => {
    const marca = doc.querySelector(".hdr");
    expect(texto(marca)).toBe("Agenda Belapor Tudo Agenda");
    expect(marca?.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("o ícone do app é ampliado: o desenho ocupa menos da metade do PNG", () => {
    const css = fs.readFileSync(path.join(__dirname, "../oferta.css"), "utf8");
    expect(css).toMatch(
      /#lp\[data-oferta\] \.hdr img\{[^}]*transform:scale\(1\.7\);transform-origin:center\}/,
    );
  });

  it("prova perto do botão: número de uso da config e uma avaliação curta", () => {
    const prova = doc.querySelector(".prova");
    expect(texto(prova?.querySelector(".prova-num"))).toBe(
      "Mais de 2 mil avisos enviados às clientes pelo WhatsApp",
    );
    expect(texto(prova?.querySelector("blockquote"))).toBe(
      "“Sou manicure e estava procurando uma forma mais prática de organizar meus horários…”",
    );
    expect(texto(prova?.querySelector("figcaption"))).toBe(
      "Cintia, avaliação na App Store, set/2026",
    );
    // A palavra é "avisos": o número soma confirmações e lembretes.
    expect(texto(prova)).not.toMatch(/lembretes/);
  });

  it("avaliações: os dois trechos marcam o corte no início e no fim", () => {
    const trechos = [...doc.querySelectorAll(".rev blockquote")].map(texto);
    expect(trechos).toHaveLength(2);
    for (const trecho of trechos) expect(trecho).toMatch(/^….*…$/);
  });

  it("apoio: Santander X com o contexto escrito, cada logo com o seu rótulo", () => {
    expect(
      [...doc.querySelectorAll(".trust .apoio")].map(
        (el) => `${texto(el.querySelector(".mono"))} ${el.querySelector("img")?.getAttribute("alt")}`,
      ),
    ).toEqual(["Selecionado pelo Santander X", "Apoiado por Founders Club"]);
  });

  it("pontes: a demonstração tem título e o bloco de preço tem chamada", () => {
    expect(texto(doc.querySelector("#hero-stage .demo-tit"))).toBe(
      "Veja como é, em 6 passos",
    );
    expect(texto(doc.querySelector("#preco .of-ponte"))).toBe(
      "Gostou? Veja quanto custa.",
    );
    // No celular a demonstração vem antes do bloco de preço grande.
    const stage = doc.getElementById("hero-stage") as Element;
    const preco = doc.getElementById("preco") as Element;
    expect(
      stage.compareDocumentPosition(preco) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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

  it("linha de condição do botão: uma só, igual em todo aparelho", () => {
    const linha = (dev: string) =>
      texto(doc.querySelector(`#micro [data-dev="${dev}"] .micro`));
    for (const dev of ["ios", "android", "desktop", "nojs"]) {
      expect(linha(dev)).toBe(
        "7 dias sem cartão. Depois do 3º mês, R$ 59,90 por mês. Cancele quando quiser.",
      );
    }
    // No celular é só a linha; no computador e sem JS, mais o link do simulador.
    expect(doc.querySelectorAll('#micro [data-dev="ios"] p')).toHaveLength(1);
    expect(doc.querySelectorAll('#micro [data-dev="desktop"] a[data-sim]')).toHaveLength(1);
    // Nenhum bloco de aparelho depende de JS para deixar de estar "hidden".
    expect(doc.querySelectorAll("[data-dev][hidden]")).toHaveLength(0);
  });

  it("como cada loja cobra fica no bloco de preço: mensal, por aparelho", () => {
    const caixa = doc.querySelector(".of-cond");
    expect(texto(caixa?.querySelector('[data-dev="ios"]'))).toBe(
      "Na App Store, a cobrança é mensal: R$ 29,95 todo mês nos 3 primeiros meses.",
    );
    expect(texto(caixa?.querySelector('[data-dev="android"]'))).toBe(
      "No Google Play, a cobrança também é mensal: R$ 29,95 todo mês nos 3 primeiros meses.",
    );
  });

  it("CTA fixo do celular: selo da loja e a linha do Carlos, com o percentual da config", () => {
    const fixo = doc.getElementById("cta-fixo");
    expect(fixo?.hasAttribute("hidden")).toBe(true);
    expect([...(fixo?.querySelectorAll("small") ?? [])].map(texto)).toEqual([
      "7 dias grátis · depois 50% off",
      "7 dias grátis · depois 50% off",
    ]);
  });

  it("todo botão de loja leva à App Store ou ao Google Play, e a nenhum outro lugar", () => {
    const lojas = [...doc.querySelectorAll<HTMLAnchorElement>("a[data-store]")];
    expect(lojas.length).toBeGreaterThan(15);
    for (const a of lojas) {
      // Do servidor os links saem puros; campanha (ct, referrer) é do runtime.
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
      "Sim. Primeiro você testa 7 dias, sem cartão e sem pagar nada. Quando decidir assinar, a App Store cobra na hora o primeiro mês: R$ 29,95. É R$ 29,95 por mês durante 3 meses, uma cobrança por mês, não tudo de uma vez. Do 4º mês em diante, R$ 59,90 por mês.",
    );
    expect(resposta("android")).toBe(
      "Sim. Os 7 dias sem cartão continuam. Ao assinar, você paga R$ 29,95 por mês nos 3 primeiros meses (metade do preço) e, depois, R$ 59,90 por mês.",
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

describe("rota da oferta: QR e CSS certos", () => {
  /* No Jest toda imagem e todo CSS importado viram o mesmo objeto de mentira,
     então o que dá para conferir é o código: qual arquivo cada rota importa. */
  const fonte = (arquivo: string) =>
    fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8");

  it("cada rota usa o QR do próprio slug (o arquivo de cada um é lido em qr.test.ts)", () => {
    const src = fonte("landing-lojas.tsx");
    const arquivoDe = Object.fromEntries(
      [...src.matchAll(/import (\w+) from "\.\/assets\/(qr-[\w-]+)\.svg";/g)].map(
        ([, variavel, arquivo]) => [variavel, arquivo],
      ),
    );
    const mapa = src.match(/const QR_BY_SLUG = \{([\s\S]*?)\} as const;/)?.[1] ?? "";
    const porSlug = Object.fromEntries(
      [...mapa.matchAll(/"?([\w-]+)"?: (\w+),/g)].map(([, slug, variavel]) => [
        slug,
        arquivoDe[variavel],
      ]),
    );
    expect(porSlug).toEqual(
      Object.fromEntries(
        Object.values(LANDING_LOJAS).map((config) => [
          config.slug,
          `qr-${config.slug}`,
        ]),
      ),
    );
    // E a página usa o mapa pelo slug da config, não um QR fixo.
    expect(src).toContain("qr: QR_BY_SLUG[config.slug].src");
  });

  it("só a rota da oferta importa oferta.css", () => {
    expect(fonte("../oferta/page.tsx")).toMatch(
      /^import "\.\.\/_lojas\/oferta\.css";$/m,
    );
    for (const outra of [
      "../app-para-salao-de-beleza/page.tsx",
      "../black-friday/page.tsx",
      "landing-lojas.tsx",
    ]) {
      expect(fonte(outra)).not.toContain("oferta.css");
    }
  });

  it("foco de teclado no celular: a rolagem reserva o espaço do botão fixo, só na oferta", () => {
    const css = fonte("oferta.css");
    expect(css).toContain(
      "html:has(#lp[data-oferta]){scroll-padding-bottom:116px}",
    );
    // Uma reserva só: scroll-margin somaria com o scroll-padding.
    expect(css).not.toContain("scroll-margin");
    expect(fonte("lojas.css")).not.toMatch(/scroll-(padding|margin)/);
  });
});

describe("as outras landings de loja não mudam com a oferta", () => {
  /* O HTML inteiro de cada uma, como estava em main antes da oferta (aa8a467).
     Qualquer mudança aqui é mudança de texto ou de estrutura em página que
     não é a da oferta: só atualize o snapshot se for de propósito. */
  it.each([LANDING_LOJAS.appParaSalaoDeBeleza, LANDING_LOJAS.blackFriday])(
    "$slug: HTML do servidor idêntico ao de antes",
    (config) => {
      const outra = markup(config);
      expect(outra).toMatchSnapshot();
      expect(outra).not.toMatch(/data-oferta|Oferta Agenda Bela/);
    },
  );
});
