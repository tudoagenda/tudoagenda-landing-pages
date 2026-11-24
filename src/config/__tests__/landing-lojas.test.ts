import {
  BLACK_FRIDAY_THEME_ENDS_AT,
  LANDING_LOJAS,
  OFERTA_AGENDA_BELA,
  buildPlayReferrerAttribution,
  economiaDaOfertaCentavos,
  formatarCentavos,
} from "../landing-lojas";

describe("valores da Oferta Agenda Bela (único lugar)", () => {
  it("preço cheio R$ 59,90, promocional R$ 29,95 (provisório), por 3 meses", () => {
    expect(OFERTA_AGENDA_BELA).toEqual({
      precoCheioCentavos: 5990,
      precoPromoCentavos: 2995,
      meses: 3,
      percentual: 50,
    });
    expect(LANDING_LOJAS.oferta.oferta).toBe(OFERTA_AGENDA_BELA);
  });

  it("a economia é calculada: R$ 89,85 em 3 meses", () => {
    expect(economiaDaOfertaCentavos(OFERTA_AGENDA_BELA)).toBe(8985);
    expect(formatarCentavos(economiaDaOfertaCentavos(OFERTA_AGENDA_BELA))).toBe(
      "89,85",
    );
    // Trocar o preço promocional muda a economia junto.
    expect(
      economiaDaOfertaCentavos({ ...OFERTA_AGENDA_BELA, precoPromoCentavos: 2990 }),
    ).toBe(9000);
  });

  it("o preço promocional bate com o percentual anunciado, e o texto diz metade", () => {
    const { precoCheioCentavos, precoPromoCentavos, percentual } =
      OFERTA_AGENDA_BELA;
    expect(Math.round((1 - precoPromoCentavos / precoCheioCentavos) * 100)).toBe(
      percentual,
    );
    // A página escreve "metade do preço": se o percentual mudar, o texto muda junto.
    expect(percentual).toBe(50);
  });

  it("formata centavos com vírgula e duas casas", () => {
    expect(formatarCentavos(5990)).toBe("59,90");
    expect(formatarCentavos(2995)).toBe("29,95");
    expect(formatarCentavos(3000)).toBe("30,00");
  });
});

describe("validade do tema Black Friday", () => {
  const fim = Date.parse(BLACK_FRIDAY_THEME_ENDS_AT);

  it("termina no fim de 30/11/2026 no horário de São Paulo", () => {
    const emSaoPaulo = (ms: number) =>
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short",
      }).format(ms);
    expect(emSaoPaulo(fim - 60_000)).toBe("30/11/2026, 23:59");
    expect(emSaoPaulo(fim)).toBe("01/12/2026, 00:00");
    expect(LANDING_LOJAS.blackFriday.temaExpiraEm).toBe(fim);
  });
});

describe("origem no referrer da Google Play", () => {
  it("visita com UTM leva a atribuição da sessão, sem padrão por cima", () => {
    const sessao = {
      utm_source: "ig",
      utm_medium: "paid_social",
      utm_campaign: "agendabela_lps_nov26_lp2",
      fbclid: "abc",
    };
    expect(
      buildPlayReferrerAttribution(sessao, "app-para-salao-de-beleza"),
    ).toEqual(sessao);
  });

  it("visita sem UTM leva o padrão com o slug da página", () => {
    expect(buildPlayReferrerAttribution({}, "black-friday")).toEqual({
      utm_source: "tudoagenda_site",
      utm_medium: "landing",
      utm_campaign: "black-friday",
    });
  });

  it("clique pago sem UTM (só fbclid) não é rotulado como tráfego do site", () => {
    expect(
      buildPlayReferrerAttribution({ fbclid: "abc" }, "app-para-salao-de-beleza"),
    ).toEqual({ fbclid: "abc" });
  });
});
