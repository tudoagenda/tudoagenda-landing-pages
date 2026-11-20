import sitemap from "../sitemap";
import { metadata as appParaSalaoMetadata } from "../agendabela/app-para-salao-de-beleza/page";
import { metadata as blackFridayMetadata } from "../agendabela/black-friday/page";
import nextConfig, {
  BLACK_FRIDAY_REDIRECT_ATIVO,
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
});

describe("robots, canonical e title de cada rota", () => {
  it("app-para-salao-de-beleza é indexável, com canonical própria e title sem sufixo", () => {
    expect(appParaSalaoMetadata.robots).toBeUndefined();
    expect(appParaSalaoMetadata.alternates?.canonical).toBe(
      `${SITE}/agendabela/app-para-salao-de-beleza`,
    );
    expect(appParaSalaoMetadata.title).toEqual({
      absolute: "App para salão de beleza: agenda e lembretes | Agenda Bela",
    });
  });

  it("black-friday é noindex, com canonical própria", () => {
    expect(blackFridayMetadata.robots).toEqual({ index: false });
    expect(blackFridayMetadata.alternates?.canonical).toBe(
      `${SITE}/agendabela/black-friday`,
    );
  });

  it("a Black Friday não promete desconto nem junta o nome com os 7 dias grátis", () => {
    const texto = `${JSON.stringify(blackFridayMetadata.title)} ${blackFridayMetadata.description}`;
    expect(texto).not.toMatch(/o preço é um só|7 dias|grátis|desconto|oferta|promo/i);
    expect(texto).toContain("R$ 59,90");
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
