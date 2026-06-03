/**
 * Helper centralizado pra push de eventos no dataLayer do GTM.
 *
 * Schema padrão (todos os eventos de landing carregam product/landing_type/landing_slug
 * pra distinguir entre produtos da Tudo Agenda e tipos de landing).
 *
 * Convenções:
 * - Naming por intenção, não por visual (resiste a redesign).
 * - Type-safe: TS bloqueia evento desconhecido ou parâmetro faltando.
 *
 * Doc: produtos/agenda-bela/medicao.md no companion-os.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type CtaIntent = "primary" | "secondary";

type LandingEvent =
  | {
      event: "lp_cta_clicked";
      cta_position: string;
      cta_intent: CtaIntent;
    }
  | {
      event: "lp_form_submitted";
      form_name: string;
    }
  | {
      event: "lp_signup_completed";
    }
  | {
      event: "paywall_viewed";
      flow: "reactivation" | "manage";
      alert_kind?: string;
      landing_slug: string;
    }
  | {
      event: "checkout_opened";
      flow: "reactivation" | "new_signup";
      source: string;
    };

type LandingContext = {
  product: string;
  landing_type: "main" | "campaign";
  landing_slug: string;
};

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
type AttributionContext = Partial<Record<AttributionKey, string>>;

const ATTRIBUTION_STORAGE_KEY = "agendabela_landing_attribution";

/**
 * Faz push de um evento da landing principal do Agenda Bela.
 * Componentes da landing principal usam `pushAgendaBelaMainEvent`.
 * Outras landings/produtos no futuro: criar wrapper análogo.
 */
export function pushAgendaBelaMainEvent(eventData: LandingEvent): void {
  pushLandingEvent(eventData, {
    product: "agendabela",
    landing_type: "main",
    landing_slug: "automatize-seu-atendimento",
  });
}

/**
 * Faz push de um evento da LP de reativação do Agenda Bela.
 * Contexto: campaign, slug = reativacao.
 */
export function pushAgendaBelaReativacaoEvent(eventData: LandingEvent): void {
  pushLandingEvent(eventData, {
    product: "agendabela",
    landing_type: "campaign",
    landing_slug: "reativacao",
  });
}

/**
 * Faz push de um evento da LP de lista de espera (pré-lançamento) do Agenda Bela.
 * Contexto: campaign, slug = lista-de-espera.
 */
export function pushAgendaBelaListaEsperaEvent(eventData: LandingEvent): void {
  pushLandingEvent(eventData, {
    product: "agendabela",
    landing_type: "campaign",
    landing_slug: "lista-de-espera",
  });
}

/**
 * Push genérico — só usar em componentes que sabem o contexto deles.
 * Componentes da landing principal devem usar pushAgendaBelaMainEvent.
 */
export function pushLandingEvent(
  eventData: LandingEvent,
  context: LandingContext,
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ...context,
    ...getAttributionContext(),
    ...eventData,
  });
}

function getAttributionContext(): AttributionContext {
  const currentAttribution = readAttributionFromUrl();

  if (Object.keys(currentAttribution).length > 0) {
    persistAttribution(currentAttribution);
    return currentAttribution;
  }

  return readPersistedAttribution();
}

function readAttributionFromUrl(): AttributionContext {
  const params = new URLSearchParams(window.location.search);

  return ATTRIBUTION_KEYS.reduce<AttributionContext>((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});
}

function persistAttribution(attribution: AttributionContext): void {
  try {
    window.sessionStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(attribution),
    );
  } catch {
    // Storage can be unavailable in restricted browsers; analytics should keep working.
  }
}

function readPersistedAttribution(): AttributionContext {
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as AttributionContext;
    return ATTRIBUTION_KEYS.reduce<AttributionContext>((acc, key) => {
      const value = parsed[key];
      if (typeof value === "string" && value) acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}
