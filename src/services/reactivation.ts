/**
 * Client tipado para os endpoints de reativação (backend #86).
 *
 * Endpoints:
 *   POST /subscriptions/reactivation/lookup
 *   POST /subscriptions/reactivation/start
 *
 * O switch entre real e mock é controlado por NEXT_PUBLIC_USE_REACTIVATION_MOCK.
 * Em produção a landing aponta para /api/agendabela/reactivation/lookup e
 * /api/agendabela/reactivation/start (Next.js BFF que repassa ao backend).
 */

// ---------------------------------------------------------------------------
// Tipos do contrato de backend #86
// ---------------------------------------------------------------------------

export type ReactivationLookupStatus =
  | "LEGACY_PROFILE_FOUND"  // Profile existente, inativo, sem gateway — fluxo desta LP
  | "ALREADY_ACTIVE"        // Profile ACTIVE/TRIALING moderno — orientar login
  | "NEW_SIGNUP_REQUIRED";  // Nenhum profile encontrado — encaminhar para cadastro novo

export interface ReactivationLookupResponse {
  status: ReactivationLookupStatus;
  /** Presente quando status = LEGACY_PROFILE_FOUND */
  salonName?: string;
  /** Email mascarado: j***@example.com */
  maskedEmail?: string;
  /** WhatsApp mascarado: (11) 9****-1234 */
  maskedPhone?: string;
  /** JWT HS256, TTL 15min, payload `{ profileId, purpose: 'reactivation' }`. Presente em LEGACY_PROFILE_FOUND. */
  reactivationToken?: string;
}

export interface ReactivationStartPayload {
  reactivationToken: string;
  password: string;
}

export interface ReactivationStartResponse {
  checkoutUrl: string;
}

// ---------------------------------------------------------------------------
// Erros tipados
// ---------------------------------------------------------------------------

export class ReactivationApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ReactivationApiError";
  }
}

// ---------------------------------------------------------------------------
// Mock (desenvolvimento local sem backend)
// ---------------------------------------------------------------------------

async function mockLookup(
  identifier: string,
): Promise<ReactivationLookupResponse> {
  await new Promise((r) => setTimeout(r, 800));

  if (identifier.includes("ativo")) {
    return { status: "ALREADY_ACTIVE" };
  }
  if (identifier.includes("novo")) {
    return { status: "NEW_SIGNUP_REQUIRED" };
  }
  // Padrão: base legado inativa
  return {
    status: "LEGACY_PROFILE_FOUND",
    salonName: "Salão da Loide",
    maskedEmail: "l***@hotmail.com",
    maskedPhone: "(11) 9****-3421",
    reactivationToken: "mock-token-abc123",
  };
}

async function mockStart(): Promise<ReactivationStartResponse> {
  await new Promise((r) => setTimeout(r, 1000));
  return { checkoutUrl: "https://pay.abacatepay.com/mock-checkout" };
}

// ---------------------------------------------------------------------------
// Implementação real (via BFF Next.js → backend)
// ---------------------------------------------------------------------------

async function realLookup(
  identifier: string,
): Promise<ReactivationLookupResponse> {
  const res = await fetch("/api/agendabela/reactivation/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifier.trim().toLowerCase() }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ReactivationApiError(
      body?.error ?? "Erro ao buscar conta. Tente novamente.",
      res.status,
      body?.code,
    );
  }

  return res.json();
}

async function realStart(
  payload: ReactivationStartPayload,
): Promise<ReactivationStartResponse> {
  const res = await fetch("/api/agendabela/reactivation/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ReactivationApiError(
      body?.error ?? "Erro ao iniciar reativação. Tente novamente.",
      res.status,
      body?.code,
    );
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Facade exportada — troca entre mock e real via env
// ---------------------------------------------------------------------------

function isMockEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_REACTIVATION_MOCK === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export const reactivationService = {
  lookup: (identifier: string): Promise<ReactivationLookupResponse> =>
    isMockEnabled() ? mockLookup(identifier) : realLookup(identifier),

  start: (payload: ReactivationStartPayload): Promise<ReactivationStartResponse> =>
    isMockEnabled() ? mockStart() : realStart(payload),
};
