import type { NextConfig } from "next";

/**
 * Passo de 01/12/2026, depois do fim do tema Black Friday
 * (BLACK_FRIDAY_THEME_ENDS_AT em src/config/landing-lojas.ts): trocar para
 * `true`, fazer o deploy e invalidar `/agendabela/black-friday*` no CloudFront
 * (o HTML fica até 1 ano em cache e a query string faz parte da chave).
 * Redirect temporário (307) porque a rota volta no ano que vem; a query
 * string (UTMs, fbclid) é preservada.
 */
export const BLACK_FRIDAY_REDIRECT_ATIVO = false;

export function buildRedirects(blackFridayRedirectAtivo: boolean) {
  return [
    {
      source: "/agendabela",
      destination: "/agendabela/automatize-seu-atendimento",
      permanent: true,
      basePath: false as const,
    },
    ...(blackFridayRedirectAtivo
      ? [
          {
            source: "/agendabela/black-friday",
            destination: "/agendabela/app-para-salao-de-beleza",
            permanent: false,
            basePath: false as const,
          },
        ]
      : []),
  ];
}

const nextConfig: NextConfig = {
  async redirects() {
    return buildRedirects(BLACK_FRIDAY_REDIRECT_ATIVO);
  },
};

export default nextConfig;
