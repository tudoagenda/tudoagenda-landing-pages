"use client";

import type { ReactNode } from "react";
import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";

export type SimulatorCtaLocation =
  | "automatize_hero_link"
  | "automatize_secao_simulador"
  | "automatize_avaliacoes";

export const EXPERIMENTE_PATH = "/agendabela/experimente";

/**
 * Link da landing para o simulador (/agendabela/experimente), na mesma aba.
 * A origem vai em `?ref=`, nunca em utm_*: UTM em link interno sobrescreveria
 * a atribuição da sessão (agendabela_landing_attribution).
 * <a> comum (não next/link): o Experimente tem CSS, fontes e runtime próprios
 * e mede o lp_view na carga da página.
 */
export function SimulatorLink({
  refId,
  hash,
  ctaLocation,
  className,
  children,
}: {
  refId: string;
  hash?: string;
  ctaLocation: SimulatorCtaLocation;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`${EXPERIMENTE_PATH}?ref=${refId}${hash ? `#${hash}` : ""}`}
      className={className}
      onClick={() =>
        pushAgendaBelaMainEvent({ event: "cta_click", cta_location: ctaLocation })
      }
    >
      {children}
    </a>
  );
}
