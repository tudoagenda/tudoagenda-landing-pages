"use client";

import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";

/**
 * Botão único do topo da landing (desenho "Landing", Opção B): o e-mail é
 * pedido uma vez só, dentro do cadastro. Quem abre o cadastro é o Hero, que
 * guarda um único SignupModal para os dois botões (desktop e card do celular).
 */
export const SignupCtaButton = ({
  ctaPosition,
  onStart,
}: {
  ctaPosition: "hero" | "sticky_mobile";
  onStart: () => void;
}) => (
  // <button> simples (não o <Button>): o cva/tailwind-merge do componente
  // entrariam no primeiro carregamento da landing só por este botão.
  <button
    type="button"
    onClick={() => {
      pushAgendaBelaMainEvent({
        event: "lp_cta_clicked",
        cta_position: ctaPosition,
        cta_intent: "primary",
      });
      onStart();
    }}
    // Vinho do desenho (#90496A = brand-vinho): branco sobre ele passa no contraste AA.
    className="inline-flex w-full md:w-auto md:self-start h-12 items-center justify-center rounded-[14px] bg-brand-vinho hover:bg-[#783B58] px-8 font-inter text-[17px] font-bold text-white whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo"
  >
    Começar meus 7 dias grátis
  </button>
);
