import type { ExperimenteEvent } from "@/lib/analytics/dataLayer";

/** Monta o simulador sobre o HTML já renderizado. Devolve o cleanup. */
export function initExperimente(opts: {
  track: (event: ExperimenteEvent) => void;
  /** UTMs/gclid/fbclid da sessão, repassados ao referrer da Google Play. */
  attribution?: Record<string, string>;
}): () => void;
