import fs from "fs";
import path from "path";
import sitemap from "../sitemap";
import { metadata as appParaSalaoMetadata } from "../agendabela/app-para-salao-de-beleza/page";
import { metadata as blackFridayMetadata } from "../agendabela/black-friday/page";
import { metadata as ofertaMetadata } from "../agendabela/oferta/page";
import nextConfig, {
  BLACK_FRIDAY_REDIRECT_ATIVO,
  OFERTA_REDIRECT_ATIVO,
  buildRedirects,
} from "../../../next.config";

const SITE = "https://tudoagenda.com.br";

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("inclui a landing de loja indexável", () => {
    expect(urls).toContain(`${SITE}/agendabela/app-para-salao-de-beleza`);
  });

  it("deixa a Black Friday de fora", () => {
    expect(urls.join("\n")).not.toContain("black-friday");
  });

  it("deixa a Oferta Agenda Bela de fora", () => {
    expect(urls.join("\n")).not.toContain("oferta");
  });
});

describe.each([
  ["app-para-salao-de-beleza", appParaSalaoMetadata],
  ["black-friday", blackFridayMetadata],
  ["oferta", ofertaMetadata],
] as const)("metadata de /agendabela/%s", (slug, metadata) => {
  const title = (metadata.title as { absolute: string }).absolute;
  const description = metadata.description as string;
  const og = metadata.openGraph as Record<string, unknown> & {
    images: { url: string; width: number; height: number; alt: string }[];
  };
  const twitter = metadata.twitter as Record<string, unknown>;

  it("title até 60 caracteres e description entre 110 e 160 (na oferta, 70 e 180), com a marca", () => {
    // 60 e 160 são os cortes do resultado de busca. A oferta é noindex (não
    // aparece na busca) e os textos dela levam o cupom: title com 64 e
    // description com 173 caracteres. Ali o que conta é a prévia do link.
    const oferta = slug === "oferta";
    expect(title.length).toBeLessThanOrEqual(oferta ? 70 : 60);
    expect(description.length).toBeGreaterThanOrEqual(110);
    expect(description.length).toBeLessThanOrEqual(oferta ? 180 : 160);
    for (const text of [title, description]) {
      expect(text).toContain("Agenda Bela");
      expect(text).not.toMatch(/Agendabela|59,99/);
    }
  });

  it("canonical própria, igual à URL do Open Graph", () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE}/agendabela/${slug}`);
    expect(og.url).toBe(metadata.alternates?.canonical);
  });

  it("Open Graph e Twitter repetem title e description, com imagem 1200 × 630 que existe", () => {
    expect(og).toEqual(
      expect.objectContaining({
        type: "website",
        locale: "pt_BR",
        siteName: "Agenda Bela",
        title,
        description,
      }),
    );
    expect(twitter).toEqual(
      expect.objectContaining({
        card: "summary_large_image",
        title,
        description,
      }),
    );
    const [image] = og.images;
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.alt.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(process.cwd(), "public", image.url))).toBe(
      true,
    );
  });

  it("ícone da aba é o do app, e o arquivo existe", () => {
    const icons = metadata.icons as { icon: { url: string }[] };
    expect(icons.icon[0].url).toBe("/images/experimente/agenda-bela-icone.png");
    expect(
      fs.existsSync(path.join(process.cwd(), "public", icons.icon[0].url)),
    ).toBe(true);
  });
});

describe("indexação de cada rota", () => {
  it("app-para-salao-de-beleza é indexável e tem o title fechado", () => {
    expect(appParaSalaoMetadata.robots).toBeUndefined();
    expect(appParaSalaoMetadata.title).toEqual({
      absolute: "App para salão de beleza: agenda e lembretes | Agenda Bela",
    });
  });

  it("black-friday é noindex", () => {
    expect(blackFridayMetadata.robots).toEqual({ index: false });
  });

  it("a Black Friday não promete desconto nem junta o nome com os 7 dias grátis", () => {
    const texto = `${JSON.stringify(blackFridayMetadata.title)} ${blackFridayMetadata.description}`;
    expect(texto).not.toMatch(
      /o preço é um só|preço de sempre|59,99|7 dias|grátis|desconto|oferta|promo|% ?off/i,
    );
    expect(texto).toContain("R$ 59,90");
  });
});

describe("Oferta Agenda Bela: página de campanha", () => {
  const texto = `${JSON.stringify(ofertaMetadata.title)} ${ofertaMetadata.description}`;

  it("é noindex, com o nome fechado no title", () => {
    expect(ofertaMetadata.robots).toEqual({ index: false });
    expect(ofertaMetadata.title).toEqual({
      absolute: "Oferta Agenda Bela: 50% nos 3 primeiros meses com o cupom BELA50",
    });
  });

  it("title e description não levam valor em reais, data nem promessa fora da oferta", () => {
    expect(texto).not.toMatch(
      /R\$|grátis|59,99|black friday|boas-vindas|até (o dia )?\d|janeiro|dezembro|\d{1,2}\/\d{1,2}/i,
    );
    expect(texto).toContain("7 dias, sem cartão");
  });

  it("redirect de encerramento está pronto, mas não ativo", async () => {
    expect(OFERTA_REDIRECT_ATIVO).toBe(false);
    const redirects = await nextConfig.redirects!();
    expect(redirects.map((r) => r.source)).not.toContain("/agendabela/oferta");
  });

  it("quando ligado, é temporário (307), leva para a landing de loja padrão e não liga o da Black Friday", () => {
    const redirects = buildRedirects(false, true);
    expect(redirects).toContainEqual({
      source: "/agendabela/oferta",
      destination: "/agendabela/app-para-salao-de-beleza",
      permanent: false,
      basePath: false,
    });
    expect(redirects.map((r) => r.source)).toEqual([
      "/agendabela",
      "/agendabela/oferta",
    ]);
    // E o da Black Friday sozinho não liga o da oferta.
    expect(buildRedirects(true).map((r) => r.source)).toEqual([
      "/agendabela",
      "/agendabela/black-friday",
    ]);
  });
});

describe("redirect da Black Friday (passo de 01/12)", () => {
  it("está pronto, mas não ativo", async () => {
    expect(BLACK_FRIDAY_REDIRECT_ATIVO).toBe(false);
    const redirects = await nextConfig.redirects!();
    expect(redirects.map((r) => r.source)).toEqual(["/agendabela"]);
  });

  it("quando ligado, é temporário (307) e leva para a landing de loja padrão", () => {
    expect(buildRedirects(true)).toContainEqual({
      source: "/agendabela/black-friday",
      destination: "/agendabela/app-para-salao-de-beleza",
      permanent: false,
      basePath: false,
    });
  });
});
