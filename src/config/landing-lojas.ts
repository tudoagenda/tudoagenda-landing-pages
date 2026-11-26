/**
 * Landings de loja do Agenda Bela: a visitante vai direto para a loja do
 * aparelho, sem cadastro na web. A Black Friday é a mesma página com o tema
 * por cima; a Oferta Agenda Bela é a mesma página com os blocos da oferta
 * (src/app/agendabela/_lojas).
 */

/**
 * Fim do tema Black Friday: 30/11/2026 às 23:59 em São Paulo (UTC-3, sem
 * horário de verão), ou seja, o primeiro instante de 01/12. A partir dele a
 * faixa, o título gigante, o bloco de preço, o halo e as cores somem no
 * cliente e /agendabela/black-friday se comporta como a página padrão.
 * Único lugar em que a data aparece. O passo seguinte é ligar o redirect em
 * next.config.ts (BLACK_FRIDAY_REDIRECT_ATIVO).
 */
export const BLACK_FRIDAY_THEME_ENDS_AT = "2026-12-01T00:00:00-03:00";

/**
 * Oferta Agenda Bela (/agendabela/oferta): desconto nos primeiros meses para
 * quem assina pela primeira vez, pelo app, com o cupom (`cupom`). O desconto
 * não é automático: a assinante digita o cupom em "Tenho um cupom", na tela
 * de assinatura do app (decisão de 26/11/2026). O cupom é configurado nas
 * lojas (App Store e Google Play) e no RevenueCat; a página só anuncia.
 *
 * ÚNICO lugar dos valores. Todo preço, prazo e economia da página saem daqui
 * (markup.ts, faq-oferta.ts e a metadata da rota); nenhum é escrito à mão.
 * Para trocar o valor, mude só `precoPromoCentavos`: a economia é calculada
 * (economiaDaOfertaCentavos) e o teste de config confere que o preço continua
 * batendo com o percentual anunciado.
 *
 * `precoPromoCentavos` é PROVISÓRIO (R$ 29,95 = metade de R$ 59,90): falta o
 * valor exato cadastrado nas lojas.
 */
export const OFERTA_AGENDA_BELA = {
  /** Preço normal da assinatura, por mês. */
  precoCheioCentavos: 5990,
  /** Preço por mês durante a oferta. */
  precoPromoCentavos: 2995,
  /** Quantos meses o preço promocional vale. */
  meses: 3,
  /** Percentual anunciado ("50% nos 3 primeiros meses"). */
  percentual: 50,
  /** Código do cupom, como a assinante digita no app. Único lugar em que ele é escrito. */
  cupom: "BELA50",
} as const satisfies OfertaConfig;

/**
 * Número de uso mostrado na página da oferta ("Mais de 2 mil avisos enviados
 * às clientes pelo WhatsApp"). Fonte: banco de produção, consulta de
 * 24/11/2026: 2.147 avisos (confirmações e lembretes às clientes finais)
 * desde julho/2026, era do app. A página arredonda para baixo, em milhares.
 * Ao atualizar, troque o número e a data juntos.
 */
export const OFERTA_PROVA_DE_USO = {
  avisosEnviados: 2147,
  medidoEm: "2026-11-24",
} as const;

/** 2147 vira "Mais de 2 mil avisos" (arredonda para baixo: nunca promete mais do que foi medido). */
export function avisosEnviadosEmTexto(avisos: number): string {
  return `Mais de ${Math.floor(avisos / 1000)} mil avisos`;
}

/**
 * Campanha (`ct`) do link da App Store na página da oferta, no mesmo molde do
 * `referrer` do Google Play: a utm_campaign da sessão quando existe; o slug
 * da página quando a visita chega sem origem nenhuma ou com UTM sem campanha;
 * nada quando é clique pago sem UTM nenhuma (só gclid/fbclid), para não
 * rotular como tráfego do site. A Apple aceita até 40 caracteres; campanha
 * que não sobra nenhuma letra ou número depois da limpeza cai no slug.
 */
export function buildAppStoreCampaign(
  attribution: Record<string, string | undefined> = {},
  slug: LandingLojasSlug,
): string | undefined {
  const campanha = (attribution.utm_campaign ?? "")
    .replace(/[^A-Za-z0-9_.-]/g, "_")
    .slice(0, 40);
  if (/[A-Za-z0-9]/.test(campanha)) return campanha;
  const temUtm = Object.entries(attribution).some(
    ([chave, valor]) => chave.startsWith("utm_") && Boolean(valor),
  );
  const temOrigem = Object.values(attribution).some(Boolean);
  return temOrigem && !temUtm ? undefined : slug;
}

export type OfertaConfig = {
  precoCheioCentavos: number;
  precoPromoCentavos: number;
  meses: number;
  percentual: number;
  cupom: string;
};

/** Quanto a assinante deixa de pagar se ficar todos os meses da oferta. */
export function economiaDaOfertaCentavos(oferta: OfertaConfig): number {
  return (oferta.precoCheioCentavos - oferta.precoPromoCentavos) * oferta.meses;
}

/** 2995 vira "29,95" (sem o "R$": cada lugar decide o espaço que usa). */
export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export type LandingLojasSlug =
  | "app-para-salao-de-beleza"
  | "black-friday"
  | "oferta";

export type LandingLojasConfig = {
  /** Último trecho da rota; é o landing_slug de todo evento da página. */
  slug: LandingLojasSlug;
  path: string;
  tema: "padrao" | "bf";
  /** Epoch (ms) do fim do tema. Só existe quando o tema tem validade. */
  temaExpiraEm?: number;
  /** Prefixo do ?ref= nos links para o simulador (ex.: ref=app_hero). */
  refSimulador: string;
  /** Liga os blocos e textos da oferta. Independente do tema visual. */
  oferta?: OfertaConfig;
};

export const LANDING_LOJAS = {
  appParaSalaoDeBeleza: {
    slug: "app-para-salao-de-beleza",
    path: "/agendabela/app-para-salao-de-beleza",
    tema: "padrao",
    refSimulador: "app",
  },
  blackFriday: {
    slug: "black-friday",
    path: "/agendabela/black-friday",
    tema: "bf",
    temaExpiraEm: Date.parse(BLACK_FRIDAY_THEME_ENDS_AT),
    refSimulador: "bf",
  },
  oferta: {
    slug: "oferta",
    path: "/agendabela/oferta",
    tema: "padrao",
    refSimulador: "oferta",
    oferta: OFERTA_AGENDA_BELA,
  },
} as const satisfies Record<string, LandingLojasConfig>;

/**
 * Origem que vai no `referrer` do link da Google Play. Visita com origem
 * (UTM, gclid ou fbclid): a atribuição da sessão, como nas outras páginas.
 * Visita sem origem nenhuma (orgânica, QR): um padrão que identifica a página
 * no Play Console. Clique pago que chegou sem UTM não recebe o padrão, para
 * não aparecer como tráfego do site. Vale só para o link da Play; os eventos
 * do GA4 seguem com a atribuição real da sessão.
 */
export function buildPlayReferrerAttribution(
  attribution: Record<string, string | undefined> = {},
  slug: LandingLojasSlug,
): Record<string, string | undefined> {
  if (Object.values(attribution).some(Boolean)) return attribution;
  return {
    utm_source: "tudoagenda_site",
    utm_medium: "landing",
    utm_campaign: slug,
  };
}
