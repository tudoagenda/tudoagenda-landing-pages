"use client";

import { useEffect } from "react";
import {
  getLandingAttribution,
  pushAgendaBelaExperimenteEvent,
} from "@/lib/analytics/dataLayer";
import { initExperimente } from "./_prototipo/simulador";

/**
 * Liga o comportamento do simulador ao HTML renderizado no servidor.
 * Sem UI própria: o markup vem de EXPERIMENTE_MARKUP (page.tsx).
 */
export function ExperimenteRuntime() {
  useEffect(
    () =>
      initExperimente({
        track: pushAgendaBelaExperimenteEvent,
        attribution: getLandingAttribution(),
      }),
    [],
  );
  return null;
}
