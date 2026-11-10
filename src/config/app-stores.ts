/**
 * Fonte única dos links e selos das lojas do app Agenda Bela.
 * Usada pelo <AppStoreBadges> (landings) e pelo simulador do Experimente.
 */

/** Sem `?l=`: a App Store abre no idioma do aparelho da usuária. */
export const APP_STORE_URL =
  "https://apps.apple.com/br/app/agenda-bela/id6782112738";

export const GOOGLE_PLAY_BASE_URL =
  "https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela.salao&hl=pt_BR&gl=BR";

/**
 * Link da Google Play com a atribuição da sessão (UTMs, gclid, fbclid) no
 * parâmetro `referrer`, lido pelo Install Referrer do app.
 */
export function googlePlayUrl(
  attribution: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  Object.entries(attribution).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const referrer = params.toString();
  return referrer
    ? `${GOOGLE_PLAY_BASE_URL}&referrer=${encodeURIComponent(referrer)}`
    : GOOGLE_PLAY_BASE_URL;
}

/**
 * Selos oficiais, versionados em /public (nunca redesenhar à mão).
 * O da Apple é o "Baixar na App Store" em PT-BR do Apple Marketing Tools.
 * O PNG da Google tem respiro em cima e embaixo: 52px de altura dão o mesmo
 * tamanho visual dos 40px do selo da Apple (compensado com margem negativa).
 */
export const STORE_BADGES = {
  appStore: {
    src: "/images/badges/badge-app-store-pt-br.svg",
    alt: "Baixar na App Store",
    width: 120,
    height: 40,
  },
  googlePlay: {
    src: "/images/badges/badge-google-play-pt-br.png",
    alt: "Disponível no Google Play",
    width: 134,
    height: 52,
  },
} as const;
