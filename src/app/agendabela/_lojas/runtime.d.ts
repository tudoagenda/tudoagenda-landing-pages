import type { LandingLojasSlug } from "@/config/landing-lojas";
import type { LojasEvent } from "@/lib/analytics/dataLayer";

/** Liga o comportamento da landing de loja ao HTML já renderizado. Devolve o cleanup. */
export function initLandingLojas(opts: {
  /** landing_slug da rota: vira o utm_campaign padrão no referrer da Google Play. */
  slug: LandingLojasSlug;
  track: (event: LojasEvent) => void;
  /** UTMs/gclid/fbclid da sessão, repassados ao referrer da Google Play. */
  attribution?: Record<string, string | undefined>;
}): () => void;
