import { renderToStaticMarkup } from "react-dom/server";
import AppParaSalaoDeBelezaPage, {
  metadata as appParaSalaoMetadata,
} from "../../app-para-salao-de-beleza/page";
import BlackFridayPage from "../../black-friday/page";
import { LOJAS_FAQ } from "../faq";
import { AGENDA_BELA_SOFTWARE_ID } from "../structured-data";

/**
 * SEO e GEO: o que buscadores e assistentes leem é o HTML do servidor, sem
 * JavaScript. Estes testes olham essa string, sem montar o runtime.
 */
const CANONICAL_LP2 =
  "https://tudoagenda.com.br/agendabela/app-para-salao-de-beleza";

const htmlLp2 = renderToStaticMarkup(<AppParaSalaoDeBelezaPage />);
const htmlLp3 = renderToStaticMarkup(<BlackFridayPage />);

const ROTAS = [
  ["app-para-salao-de-beleza", htmlLp2],
  ["black-friday", htmlLp3],
] as const;

function dom(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** Texto visível comparável: &nbsp; vira espaço comum. */
const texto = (el: Element | null | undefined) =>
  (el?.textContent ?? "").replace(/ /g, " ");

function jsonLd(html: string): string[] {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => match[1]);
}

describe.each(ROTAS)("HTML do servidor de /agendabela/%s", (_slug, html) => {
  const doc = dom(html);

  it("tem um H1 só, e nenhum título de seção com Black Friday", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    for (const heading of doc.querySelectorAll("h1, h3, h4")) {
      expect(heading.textContent).not.toMatch(/black friday/i);
    }
    // "Baixe no seu celular" é parágrafo: não pula nível nem repete título.
    expect(doc.querySelectorAll(".dt h3")).toHaveLength(0);
    expect(doc.querySelectorAll(".dt p.dt-tit")).toHaveLength(3);
  });

  it("traz as 6 perguntas e respostas, na ordem do array único", () => {
    expect(LOJAS_FAQ).toHaveLength(6);
    const itens = [...doc.querySelectorAll(".faq details")];
    expect(itens.map((d) => texto(d.querySelector("summary")))).toEqual(
      LOJAS_FAQ.map((item) => item.pergunta),
    );
    expect(itens.map((d) => texto(d.querySelector("p")))).toEqual(
      LOJAS_FAQ.map((item) => item.resposta),
    );
    expect(LOJAS_FAQ[0].pergunta).toBe("O que é o Agenda Bela?");
    // Preço sem quebra de linha no HTML.
    expect(html).toContain("depois, R$&nbsp;59,90 por mês.");
  });

  it("diz em texto visível o que é o produto, com o termo da busca", () => {
    expect(texto(doc.querySelector(".faq"))).toContain(
      "app de agenda para salão de beleza",
    );
  });

  it("os 4 painéis de diferenciais estão no HTML, abertos, com título e texto", () => {
    for (const n of [1, 2, 3, 4]) {
      const painel = doc.getElementById(`dif-painel-${n}`);
      expect(painel).not.toBeNull();
      expect(painel?.hasAttribute("hidden")).toBe(false);
      expect(painel?.querySelectorAll("h3")).toHaveLength(1);
      expect(
        painel?.querySelectorAll(".ptx p").length,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("a demonstração não vira trecho de resultado (data-nosnippet)", () => {
    expect(
      doc.getElementById("hero-aparelho")?.hasAttribute("data-nosnippet"),
    ).toBe(true);
    const mocks = [...doc.querySelectorAll(".mock-row")];
    expect(mocks).toHaveLength(4);
    for (const mock of mocks) {
      expect(mock.hasAttribute("data-nosnippet")).toBe(true);
    }
    for (const faixa of doc.querySelectorAll(".rb-clip")) {
      expect(faixa.hasAttribute("data-nosnippet")).toBe(true);
    }
  });

  it("não cita o preço do Google Play", () => {
    expect(html).not.toContain("59,99");
    expect(html).not.toMatch(/Google Play, R\$/);
  });

  it("o rodapé liga para a home e para a landing principal", () => {
    expect(doc.querySelector('.foot a[href="/"]')).not.toBeNull();
    expect(
      doc.querySelector(
        '.foot a[href^="/agendabela/automatize-seu-atendimento?ref="]',
      ),
    ).not.toBeNull();
  });
});

describe("JSON-LD da landing indexável (app-para-salao-de-beleza)", () => {
  const scripts = jsonLd(htmlLp2);
  const graph: Record<string, unknown>[] = JSON.parse(scripts[0])["@graph"];
  const node = (type: string) =>
    graph.find((item) => item["@type"] === type) as Record<string, never>;

  it("é um script só, parseável e sem '<' cru", () => {
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).not.toContain("<");
    expect(() => JSON.parse(scripts[0])).not.toThrow();
    expect(JSON.parse(scripts[0])["@context"]).toBe("https://schema.org");
  });

  it("tem os seis nós, e toda referência por @id existe no grafo", () => {
    expect(graph.map((item) => item["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "BreadcrumbList",
      "SoftwareApplication",
      "FAQPage",
    ]);
    const ids = new Set(graph.map((item) => item["@id"]));
    const referencias: string[] = [];
    JSON.stringify(graph, (_key, value) => {
      if (
        value &&
        typeof value === "object" &&
        Object.keys(value).length === 1 &&
        typeof value["@id"] === "string"
      ) {
        referencias.push(value["@id"]);
      }
      return value;
    });
    expect(referencias.length).toBeGreaterThan(5);
    for (const id of referencias) expect(ids).toContain(id);
  });

  it("o app é o mesmo nó da landing principal, com preço e sem nota", () => {
    const app = node("SoftwareApplication");
    expect(app["@id"]).toBe(AGENDA_BELA_SOFTWARE_ID);
    expect(AGENDA_BELA_SOFTWARE_ID).toBe(
      "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento#software",
    );
    expect(app.name).toBe("Agenda Bela");
    expect(app.offers).toEqual(
      expect.objectContaining({
        "@type": "Offer",
        price: "59.90",
        priceCurrency: "BRL",
        url: CANONICAL_LP2,
      }),
    );
    // A página não mostra nota: marcar seria dado que a leitora não vê.
    expect(app).not.toHaveProperty("aggregateRating");
    expect(app).not.toHaveProperty("review");
    expect(app.sameAs).toEqual([
      "https://apps.apple.com/br/app/agenda-bela/id6782112738",
      "https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela.salao",
    ]);
  });

  it("as perguntas do FAQPage são as do texto visível, palavra por palavra", () => {
    const visivel = [...dom(htmlLp2).querySelectorAll(".faq details")].map(
      (d) => ({
        name: texto(d.querySelector("summary")),
        text: texto(d.querySelector("p")),
      }),
    );
    const marcado = (
      node("FAQPage").mainEntity as {
        "@type": string;
        name: string;
        acceptedAnswer: { "@type": string; text: string };
      }[]
    ).map((q) => {
      expect(q["@type"]).toBe("Question");
      expect(q.acceptedAnswer["@type"]).toBe("Answer");
      return { name: q.name, text: q.acceptedAnswer.text };
    });
    expect(marcado).toHaveLength(6);
    expect(marcado).toEqual(visivel);
  });

  it("página, breadcrumb e oferta apontam para a canonical; title e description são os do metadata", () => {
    const pagina = node("WebPage");
    expect(pagina.url).toBe(CANONICAL_LP2);
    expect(pagina.url).toBe(appParaSalaoMetadata.alternates?.canonical);
    expect({ absolute: pagina.name }).toEqual(appParaSalaoMetadata.title);
    expect(pagina.description).toBe(appParaSalaoMetadata.description);
    const migalhas = node("BreadcrumbList").itemListElement as {
      position: number;
      item: string;
    }[];
    expect(migalhas.map((m) => m.position)).toEqual([1, 2]);
    expect(migalhas[1].item).toBe(CANONICAL_LP2);
  });

  it("nenhum valor fala de Black Friday, desconto ou do preço da Play", () => {
    expect(scripts[0]).not.toMatch(/59,99|desconto|black friday/i);
  });
});

describe("Black Friday: fora do índice, sem dado estruturado", () => {
  it("não tem JSON-LD", () => {
    expect(jsonLd(htmlLp3)).toHaveLength(0);
    expect(htmlLp3).not.toContain("application/ld+json");
  });

  it("não tem palavra de promoção no texto visível (\"apenas\" é permitido)", () => {
    expect(texto(dom(htmlLp3).getElementById("lp"))).not.toMatch(
      /desconto|oferta|promo|% ?off|o preço é um só|preço de sempre/i,
    );
  });
});
