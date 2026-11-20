/**
 * Landings de loja do Agenda Bela: a visitante vai direto para a loja do
 * aparelho, sem cadastro na web. A Black Friday é a mesma página com o tema
 * por cima (src/app/agendabela/_lojas).
 */

/**
 * Preço da assinatura no Google Play, mostrado ao lado do R$ 59,90.
 * Fonte única: muda aqui quando o console da Play for ajustado.
 */
export const GOOGLE_PLAY_PRICE = "R$ 59,99";

/**
 * Fim do tema Black Friday: 30/11/2026 às 23:59 em São Paulo (UTC-3, sem
 * horário de verão), ou seja, o primeiro instante de 01/12. A partir dele a
 * faixa, o título gigante, o bloco de preço, o halo e as cores somem no
 * cliente e /agendabela/black-friday se comporta como a página padrão.
 * Único lugar em que a data aparece. O passo seguinte é ligar o redirect em
 * next.config.ts (BLACK_FRIDAY_REDIRECT_ATIVO).
 */
export const BLACK_FRIDAY_THEME_ENDS_AT = "2026-12-01T00:00:00-03:00";

export type LandingLojasSlug = "app-para-salao-de-beleza" | "black-friday";

export type LandingLojasConfig = {
  /** Último trecho da rota; é o landing_slug de todo evento da página. */
  slug: LandingLojasSlug;
  path: string;
  tema: "padrao" | "bf";
  /** Epoch (ms) do fim do tema. Só existe quando o tema tem validade. */
  temaExpiraEm?: number;
  /** Prefixo do ?ref= nos links para o simulador (ex.: ref=app_hero). */
  refSimulador: string;
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
