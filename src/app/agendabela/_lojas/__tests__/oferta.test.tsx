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
import OfertaPage, { metadata as ofertaMetadata } from "../../oferta/page";
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
      "Com o cupom, você economiza R$ 89,85 se ficar os 3 meses.",
    );
    expect(
      [...doc.querySelectorAll(".tl-i")].map((li) =>
        [texto(li.querySelector(".t")), texto(li.querySelector(".v"))].join(" | "),
      ),
    ).toEqual([
      "Teste de 7 dias | sem cartão",
      "Nos 3 primeiros meses: | R$ 29,95 por mês com o cupom BELA50",
      "Do 4º mês em diante: | R$ 59,90 por mês",
    ]);
  });

  it("trocar o valor na config troca a página inteira: nada fica escrito à mão", () => {
    const outra: OfertaConfig = {
      precoCheioCentavos: 6490,
      precoPromoCentavos: 3190,
      meses: 5,
      percentual: 51,
      cupom: "OUTRA10",
    };
    const htmlOutra = markup(OFERTA, outra);
    // Nenhum valor da oferta atual sobra (R$ 20,00 e R$ 59,90 dos mocks não contam:
    // o preço cheio também some).
    expect(htmlOutra).not.toMatch(
      /29,95|89,85|59,90|50%|3 primeiros|3 meses|3º mês|4º mês|metade|BELA50/,
    );
    // O código do cupom também: faixa, topo, bloco de preço, perguntas e WhatsApp.
    expect(htmlOutra.match(/OUTRA10/g)?.length).toBeGreaterThanOrEqual(20);
    expect(htmlOutra).toContain('aria-label="Copiar o cupom OUTRA10"');
    expect(htmlOutra).toContain("cupom%20OUTRA10%20do%20Agenda%20Bela");
    expect(htmlOutra).toContain("R$&nbsp;31,90");
    expect(htmlOutra).toContain("R$&nbsp;64,90");
    // (64,90 − 31,90) × 5
    expect(texto(dom(htmlOutra).querySelector(".of-eco"))).toBe(
      "Com o cupom, você economiza R$ 165,00 se ficar os 5 meses.",
    );
    expect(htmlOutra).toContain("Do 6º mês em diante");
    expect(htmlOutra).toContain("Depois do 5º mês, R$&nbsp;64,90 por mês.");
    expect(htmlOutra).toContain("&minus;51%");
    expect(htmlOutra).toContain("7 dias grátis · OUTRA10 dá 51% off");
    expect(htmlOutra).toContain("(51% de desconto)");
    expect(htmlOutra).toContain("digite OUTRA10 para ter 51% nos 5 primeiros meses.");
  });

  it("o código do cupom só é escrito na config: nenhum arquivo da página o repete", () => {
    const raiz = path.join(__dirname, "../../../../..");
    for (const arquivo of [
      "src/app/agendabela/_lojas/markup.ts",
      "src/app/agendabela/_lojas/faq-oferta.ts",
      "src/app/agendabela/_lojas/faq.ts",
      "src/app/agendabela/_lojas/runtime.js",
      "src/app/agendabela/_lojas/oferta.css",
      "src/app/agendabela/_lojas/lojas.css",
      "src/app/agendabela/_lojas/landing-lojas.tsx",
      "src/app/agendabela/oferta/page.tsx",
    ]) {
      const fonte = fs.readFileSync(path.join(raiz, arquivo), "utf8");
      expect(`${arquivo}: ${fonte.includes(OFERTA_AGENDA_BELA.cupom)}`).toBe(
        `${arquivo}: false`,
      );
    }
    expect(OFERTA_AGENDA_BELA.cupom).toBe("BELA50");
  });

  it("todo valor em reais tem espaço que não quebra entre R$ e o número", () => {
    const visivel = html.replace(/aria-label="[^"]*"/g, "");
    expect(visivel).not.toMatch(/R\$ \d/);
    expect(visivel.match(/R\$&nbsp;29,95/g)?.length).toBeGreaterThanOrEqual(8);
  });

  it("leitor de tela ouve a oferta inteira no cartão do topo", () => {
    expect(doc.querySelector(".ofr")?.getAttribute("aria-label")).toBe(
      "Oferta Agenda Bela: com o cupom BELA50, em vez de R$ 59,90 por mês, R$ 29,95 por mês nos 3 primeiros meses. Depois, volta a R$ 59,90 por mês. Ver os detalhes.",
    );
    expect(doc.getElementById("faixa")?.getAttribute("aria-label")).toBe(
      "Oferta Agenda Bela: use o cupom BELA50 e tenha 50% de desconto nos 3 primeiros meses. Ver a oferta.",
    );
    expect(texto(doc.getElementById("faixa"))).toBe(
      "Cupom BELA50 · 50% de desconto",
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

  it("o desconto não é automático: nada diz que ele aparece sozinho na loja", () => {
    // Frases da página de antes do cupom (nota 16 da campanha, lista de afirmações falsas).
    for (const lugar of [html, htmlDaPagina]) {
      expect(lugar).not.toMatch(
        /aparece na tela da loja|enquanto aparecer|mostra o desconto|desconto não aparecer|saiu do ar|uma vez por pessoa|cobra na hora|perguntas sobre o desconto|Quem pode/i,
      );
    }
    // Toda vez que a página fala em desconto, o cupom está no mesmo parágrafo ou rótulo.
    const comDesconto = [...doc.querySelectorAll("p, summary, a[aria-label], small")]
      .map((el) => `${el.getAttribute("aria-label") ?? ""} ${texto(el)}`)
      .filter((t) => /desconto|% off/i.test(t));
    expect(comDesconto.length).toBeGreaterThanOrEqual(5);
    for (const t of comDesconto) expect(t).toMatch(/cupom|BELA50/);
  });

  it("a prévia do link também: title e description (página, Open Graph e Twitter) citam o cupom", () => {
    const og = ofertaMetadata.openGraph as { title?: unknown; description?: unknown };
    const tw = ofertaMetadata.twitter as { title?: unknown; description?: unknown };
    const titulos = [ofertaMetadata.title, og.title, tw.title].map((t) =>
      typeof t === "string" ? t : (t as { absolute: string }).absolute,
    );
    const descricoes = [ofertaMetadata.description, og.description, tw.description];
    for (const titulo of titulos) {
      expect(titulo).toBe(
        "Oferta Agenda Bela: 50% nos 3 primeiros meses com o cupom BELA50",
      );
    }
    for (const descricao of descricoes) {
      expect(descricao).toBe(
        "Oferta Agenda Bela: use o cupom BELA50 e tenha 50% de desconto nos 3 primeiros meses, na primeira assinatura pelo app. Baixe no iPhone ou Android e teste 7 dias, sem cartão.",
      );
    }
    // E no HTML que a rota entrega não sobra frase de desconto automático.
    expect(JSON.stringify(ofertaMetadata)).not.toMatch(
      /para quem assina pela primeira vez|aparece na tela da loja/i,
    );
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
      "cupom cupom-hero",
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

  it('caixa "Como usar" diz para quem o cupom vale e quanto custa sem ele, sem data', () => {
    const caixa = doc.querySelector(".of-cond");
    expect(texto(caixa?.querySelector(".mono"))).toBe("Como usar");
    const paragrafos = [...(caixa?.querySelectorAll("p:not([data-dev])") ?? [])].map(texto);
    expect(paragrafos).toEqual([
      "O cupom vale só para a primeira assinatura do Agenda Bela, feita pelo app. Sem o cupom, o valor é R$ 59,90 por mês. Passados os 3 meses, o valor volta para R$ 59,90 por mês e a cobrança continua todo mês, até você cancelar.",
      "Você cancela quando quiser, nos ajustes da App Store ou do Google Play.",
    ]);
    expect(texto(doc.querySelector(".of-link"))).toBe(
      "Ver as perguntas sobre o cupom ↓",
    );
  });

  it("cupom copiável no topo e no bloco de preço: o código é o botão, fora de qualquer link", () => {
    const caixas = [...doc.querySelectorAll("[data-cupom]")];
    expect(caixas.map((c) => c.getAttribute("data-cupom"))).toEqual(["hero", "preco"]);
    for (const caixa of caixas) {
      const botao = caixa.querySelector("button.cupom-btn");
      expect(botao?.getAttribute("type")).toBe("button");
      expect(botao?.getAttribute("aria-label")).toBe("Copiar o cupom BELA50");
      expect(texto(botao?.querySelector(".cupom-cod"))).toBe("BELA50");
      // Botão dentro de link não é HTML válido (o cartão de preço do topo é um link).
      expect(caixa.closest("a")).toBeNull();
      expect(caixa.querySelector("a")).toBeNull();
      // Região viva vazia até a cópia; os avisos vêm do HTML.
      const status = caixa.querySelector(".cupom-status");
      expect(status?.getAttribute("aria-live")).toBe("polite");
      expect(status?.textContent).toBe("");
      expect(caixa.getAttribute("data-copiado")).toBe("Cupom copiado!");
      expect(texto(botao?.querySelector(".cupom-msg"))).toBe("");
      // Versão em texto (sem JavaScript, ou depois de a cópia falhar): o
      // código, e o aviso de falha escondido até o runtime mostrar.
      const emTexto = caixa.querySelector(".cupom-nojs");
      expect(texto(emTexto?.querySelector(".cupom-cod"))).toBe("BELA50");
      const falha = emTexto?.querySelector(".cupom-falha");
      expect(falha?.hasAttribute("hidden")).toBe(true);
      expect(texto(falha?.querySelector(".so-toque"))).toBe(
        "Segure o código para copiar",
      );
      expect(texto(falha?.querySelector(".so-mouse"))).toBe(
        "Código selecionado: copie",
      );
      falha?.remove();
      expect(texto(emTexto)).not.toMatch(/copi/i);
    }
    const [hero, preco] = caixas;
    // Duas redações do aviso; o CSS mostra uma (toque no celular, clique com mouse).
    const aviso = (caixa: Element, qual: string) =>
      texto(caixa.querySelector(`.cupom-btn .cupom-aviso .${qual}`));
    expect(aviso(hero, "so-toque")).toBe("toque para copiar");
    expect(aviso(hero, "so-mouse")).toBe("clique para copiar");
    expect(aviso(preco, "so-toque")).toBe("Toque para copiar");
    expect(aviso(preco, "so-mouse")).toBe("Clique para copiar");
    expect(texto(hero.querySelector(".cupom-btn"))).toBe(
      "Cupom BELA50·toque para copiarclique para copiar",
    );
    expect(texto(hero.querySelector(".cupom-nojs"))).toBe("Cupom BELA50");
    expect(hero.previousElementSibling?.className).toBe("ofr");
    expect(doc.querySelector(".ofr .cupom, .ofr button")).toBeNull();
    expect(texto(preco.querySelector(".mono"))).toBe("Seu cupom");
    expect(texto(preco.querySelector(".cupom-btn"))).toBe(
      "BELA50Toque para copiarClique para copiar",
    );
    expect(texto(preco.querySelector(".cupom-leg"))).toBe(
      "Anote e digite em “Tenho um cupom”, na tela de assinatura do app.",
    );
    // Logo abaixo do preço, antes da linha do tempo.
    expect(preco.previousElementSibling?.id).toBe("oferta-titulo");
    expect(preco.nextElementSibling?.className).toBe("tl");
  });

  it("sem o runtime o aviso de copiar não aparece: o CSS só mostra o botão depois de ligado", () => {
    const css = fs.readFileSync(path.join(__dirname, "../oferta.css"), "utf8");
    expect(css).toContain(
      "#lp[data-oferta] .cupom:not([data-cupom-on]) .cupom-btn{display:none!important}",
    );
    expect(css).toContain(
      "#lp[data-oferta] .cupom[data-cupom-on] .cupom-nojs{display:none!important}",
    );
    // "toque" é o padrão; "clique" só com mouse (hover e ponteiro fino), por CSS.
    const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "");
    expect(semComentario).toContain(
      "#lp[data-oferta].cupom.so-mouse{display:none}@media(hover:hover)and(pointer:fine){#lp[data-oferta].cupom.so-toque{display:none}#lp[data-oferta].cupom.so-mouse{display:inline}}",
    );
    // Topo: pílula sem fundo (o botão da loja é o único bloco branco); copiado, rosa.
    expect(css).toContain("#lp[data-oferta] .cupom-hero .cupom-pill{background:transparent}");
    expect(css).toContain(
      "#lp[data-oferta] .cupom.is-copiado .cupom-pill{border-style:solid;background:#FFF1F5}",
    );
    // Do servidor nenhuma caixa sai ligada: quem liga é o runtime.
    expect(doc.querySelectorAll("[data-cupom-on]")).toHaveLength(0);
    // O código continua selecionável de uma vez, e o alvo de toque tem 44 px.
    expect(css).toMatch(/\.cupom-cod\{[^}]*user-select:all\}/);
    expect(css).toMatch(/\.cupom-pill\{[^}]*min-height:44px/);
  });

  it("textos de preço fora do bloco da oferta também citam o cupom", () => {
    expect(texto(doc.querySelector(".price-sec .price p"))).toBe(
      "Teste 7 dias, sem cartão, e decida. Cancele quando quiser. O desconto vem com o cupom BELA50, que você digita na hora de assinar. Os valores e as regras estão no começo desta página.",
    );
    expect(texto(doc.querySelector(".price-sec ol li:nth-child(3) span"))).toBe(
      "Depois dos 7 dias, sua agenda continua lá para você consultar. Para seguir marcando, é só assinar pelo app. Na tela de assinatura, toque em “Tenho um cupom” e digite BELA50 para ter 50% nos 3 primeiros meses.",
    );
    expect(texto(doc.querySelector(".final p"))).toBe(
      "Teste 7 dias, sem cartão. Com o cupom BELA50, os 3 primeiros meses custam R$ 29,95 por mês; depois, R$ 59,90 por mês.",
    );
  });

  it("linha de condição do botão: uma só, igual em todo aparelho", () => {
    const linha = (dev: string) =>
      texto(doc.querySelector(`#micro [data-dev="${dev}"] .micro`));
    for (const dev of ["ios", "android", "desktop", "nojs"]) {
      expect(linha(dev)).toBe(
        "7 dias sem cartão. Na hora de assinar, use o cupom BELA50. Depois do 3º mês, R$ 59,90 por mês. Cancele quando quiser.",
      );
    }
    // No celular é só a linha; no computador e sem JS, mais o link do simulador.
    expect(doc.querySelectorAll('#micro [data-dev="ios"] p')).toHaveLength(1);
    expect(doc.querySelectorAll('#micro [data-dev="desktop"] a[data-sim]')).toHaveLength(1);
    // Nenhum bloco de aparelho depende de JS para deixar de estar "hidden".
    expect(doc.querySelectorAll("[data-dev][hidden]")).toHaveLength(0);
  });

  it("onde digitar o cupom e como cada loja cobra ficam no bloco de preço, por aparelho", () => {
    const caixa = doc.querySelector(".of-cond");
    expect(texto(caixa?.querySelector('[data-dev="ios"]'))).toBe(
      "No iPhone, ao tocar em “Tenho um cupom”, abre uma tela da Apple para você digitar BELA50. A cobrança é mensal: R$ 29,95 todo mês nos 3 primeiros meses.",
    );
    expect(texto(caixa?.querySelector('[data-dev="android"]'))).toBe(
      "No Android, você digita BELA50 num campo do próprio app. A cobrança é mensal: R$ 29,95 todo mês nos 3 primeiros meses.",
    );
  });

  it("CTA fixo do celular: selo da loja e a linha de apoio, com o cupom e o percentual da config", () => {
    const fixo = doc.getElementById("cta-fixo");
    expect(fixo?.hasAttribute("hidden")).toBe(true);
    expect([...(fixo?.querySelectorAll("small") ?? [])].map(texto)).toEqual([
      "7 dias grátis · BELA50 dá 50% off",
      "7 dias grátis · BELA50 dá 50% off",
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

  it("12 perguntas, na ordem da nota do cupom", () => {
    expect(itens.map((d) => texto(d.querySelector("summary")))).toEqual([
      "O que é o Agenda Bela?",
      "Como funciona o cupom BELA50?",
      "Onde eu coloco o cupom?",
      "O cupom vale para quem já assinou?",
      "O cupom vale junto com o teste de 7 dias?",
      "E se eu não usar o cupom?",
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

  it("respostas sem aparelho: o que é, como funciona, sem cupom e se cancelar", () => {
    const resposta = (i: number) => texto(itens[i].querySelector("p"));
    expect(resposta(0)).toMatch(
      /Você testa 7 dias sem cartão e depois assina pelo app\. O cupom BELA50 e os valores estão na pergunta “Como funciona o cupom BELA50\?”\.$/,
    );
    expect(resposta(1)).toBe(
      "Na hora de assinar, toque em “Tenho um cupom” e digite BELA50. Nos 3 primeiros meses da assinatura, você paga R$ 29,95 por mês em vez de R$ 59,90. Do 4º mês em diante, a assinatura continua por R$ 59,90 por mês, até você cancelar. A cobrança é feita pela loja (App Store ou Google Play).",
    );
    expect(resposta(3)).toBe(
      "Não. O cupom vale só para a primeira assinatura do Agenda Bela. Se você já assinou antes, o preço é o normal, R$ 59,90 por mês. Dúvida? Chame a gente no WhatsApp (abre em nova aba).",
    );
    expect(resposta(5)).toBe(
      "Sem o cupom, a assinatura custa R$ 59,90 por mês. Digite o BELA50 antes de confirmar a assinatura.",
    );
    expect(resposta(8)).toBe(
      "Você deixa de ser cobrada na renovação seguinte. Se voltar depois, o preço é o normal, porque o cupom vale só para a primeira assinatura.",
    );
  });

  it("onde colocar o cupom muda com o aparelho: tela da Apple no iPhone, campo do app no Android", () => {
    const resposta = (dev: string) =>
      texto(itens[2].querySelector(`[data-dev="${dev}"]`));
    expect(resposta("ios")).toBe(
      "Na tela de assinatura do app, toque em “Tenho um cupom”. Vai abrir uma tela da Apple: digite BELA50 e confirme. Esse link aparece também quando você está montando sua conta, no começo.",
    );
    expect(resposta("android")).toBe(
      "Na tela de assinatura do app, toque em “Tenho um cupom”. Vai abrir um campo no próprio app: digite BELA50 e confirme. Esse link aparece também quando você está montando sua conta, no começo.",
    );
    expect(resposta("desktop")).toBe(
      "No app, na tela de assinatura, toque em “Tenho um cupom” e digite BELA50 antes de confirmar.",
    );
    expect(resposta("nojs")).toBe(resposta("desktop"));
  });

  it("a resposta sobre o teste muda com o aparelho", () => {
    const resposta = (dev: string) =>
      texto(itens[4].querySelector(`[data-dev="${dev}"]`));
    expect(resposta("ios")).toBe(
      "Sim. O cupom dá 7 dias para testar, sem pagar nada. Depois, a App Store cobra R$ 29,95 por mês nos 3 primeiros meses, uma cobrança por mês, não tudo de uma vez. Do 4º mês em diante, R$ 59,90 por mês.",
    );
    expect(resposta("android")).toBe(
      "Sim. Com o cupom, você testa 7 dias e depois paga R$ 29,95 por mês nos 3 primeiros meses (50% de desconto). Do 4º mês em diante, R$ 59,90 por mês.",
    );
    expect(resposta("desktop")).toBe(
      "Sim. Os 7 dias sem cartão continuam. Ao assinar pelo app, use o cupom BELA50 para ter o desconto nos 3 primeiros meses.",
    );
    expect(resposta("nojs")).toBe(resposta("desktop"));
  });

  it("quem já assinou tem para onde ir: WhatsApp do suporte, em aba nova, já falando do cupom", () => {
    const link = itens[3].querySelector("a");
    expect(link?.getAttribute("href")).toBe(
      "https://wa.me/5519936180533?text=Oi!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20cupom%20BELA50%20do%20Agenda%20Bela",
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
