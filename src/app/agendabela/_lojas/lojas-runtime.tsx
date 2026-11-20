"use client";

import { useEffect } from "react";
import type { LandingLojasSlug } from "@/config/landing-lojas";
import {
  getLandingAttribution,
  pushAgendaBelaLojasEvent,
} from "@/lib/analytics/dataLayer";
import { initLandingLojas } from "./runtime";

/**
 * Liga animações, links das lojas e medição ao HTML renderizado no servidor.
 * Sem UI própria. Todo evento sai com o landing_slug desta rota.
 */
export function LojasRuntime({ slug }: { slug: LandingLojasSlug }) {
  useEffect(
    () =>
      initLandingLojas({
        slug,
        track: (event) => pushAgendaBelaLojasEvent(slug, event),
        attribution: getLandingAttribution(),
      }),
    [slug],
  );
  return null;
}
