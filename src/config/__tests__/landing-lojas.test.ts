import {
  BLACK_FRIDAY_THEME_ENDS_AT,
  LANDING_LOJAS,
  buildPlayReferrerAttribution,
} from "../landing-lojas";

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
