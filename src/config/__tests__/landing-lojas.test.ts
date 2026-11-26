import {
  BLACK_FRIDAY_THEME_ENDS_AT,
  LANDING_LOJAS,
  OFERTA_AGENDA_BELA,
  OFERTA_PROVA_DE_USO,
  avisosEnviadosEmTexto,
  buildAppStoreCampaign,
  buildPlayReferrerAttribution,
  economiaDaOfertaCentavos,
  formatarCentavos,
} from "../landing-lojas";

describe("valores da Oferta Agenda Bela (único lugar)", () => {
  it("preço cheio R$ 59,90, promocional R$ 29,95 (provisório), por 3 meses, com o cupom BELA50", () => {
    expect(OFERTA_AGENDA_BELA).toEqual({
      precoCheioCentavos: 5990,
      precoPromoCentavos: 2995,
      meses: 3,
      percentual: 50,
      cupom: "BELA50",
    });
    // O código como a assinante digita no app: maiúsculas e números, sem espaço.
    expect(OFERTA_AGENDA_BELA.cupom).toMatch(/^[A-Z0-9]{4,12}$/);
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

  it("o preço promocional bate com o percentual anunciado", () => {
    const { precoCheioCentavos, precoPromoCentavos, percentual } =
      OFERTA_AGENDA_BELA;
    expect(Math.round((1 - precoPromoCentavos / precoCheioCentavos) * 100)).toBe(
      percentual,
    );
  });

  it("número de uso: arredonda para baixo e tem data de medição", () => {
    expect(OFERTA_PROVA_DE_USO).toEqual({
      avisosEnviados: 2147,
      medidoEm: "2026-11-24",
    });
    // A frase só faz sentido em milhares: abaixo de mil ou acima de um milhão, reescrever.
    expect(OFERTA_PROVA_DE_USO.avisosEnviados).toBeGreaterThanOrEqual(1000);
    expect(OFERTA_PROVA_DE_USO.avisosEnviados).toBeLessThan(1_000_000);
    expect(avisosEnviadosEmTexto(2147)).toBe("Mais de 2 mil avisos");
    expect(avisosEnviadosEmTexto(2999)).toBe("Mais de 2 mil avisos");
    expect(avisosEnviadosEmTexto(3000)).toBe("Mais de 3 mil avisos");
  });

  it("campanha da App Store (ct): UTM da sessão, slug sem origem, nada em clique pago sem UTM", () => {
    expect(buildAppStoreCampaign({}, "oferta")).toBe("oferta");
    expect(buildAppStoreCampaign({ utm_campaign: "lp4_nov26" }, "oferta")).toBe(
      "lp4_nov26",
    );
    expect(buildAppStoreCampaign({ fbclid: "abc" }, "oferta")).toBeUndefined();
    // UTM sem campanha não é clique sem origem: leva o slug, como rótulo da página.
    expect(
      buildAppStoreCampaign({ utm_source: "instagram", utm_medium: "bio" }, "oferta"),
    ).toBe("oferta");
    // Campanha que vira só "_" depois da limpeza não serve de rótulo.
    expect(buildAppStoreCampaign({ utm_campaign: "✨✨" }, "oferta")).toBe("oferta");
    expect(
      buildAppStoreCampaign({ utm_campaign: "a".repeat(60) }, "oferta"),
    ).toHaveLength(40);
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
