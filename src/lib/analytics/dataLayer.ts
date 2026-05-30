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
 * Push genérico — só usar em componentes que sabem o contexto deles.
 * Componentes da landing principal devem usar pushAgendaBelaMainEvent.
 */
export function pushLandingEvent(
  eventData: LandingEvent,
  context: LandingContext,
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ...context, ...eventData });
}
