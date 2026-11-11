import type { SignupStep } from "@/lib/analytics/dataLayer";

/**
 * Contexto do cadastro sem cartão guardado no sessionStorage da aba.
 *
 * O sessionStorage sobrevive à ida e volta do checkout AbacatePay na mesma
 * aba, e é o que permite mostrar "Aprovado"/"Desistiu" na volta. Nunca guarda
 * senha nem CPF.
 */
export interface SignupContext {
  profileId: string;
  email: string;
  firstName: string;
  accessLinkSent: boolean;
  /** true entre o redirect para o checkout e a volta para a landing. */
  checkoutPending?: boolean;
}

export const SIGNUP_CONTEXT_KEY = "agendabela_signup_web";

export function readSignupContext(): SignupContext | null {
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SignupContext>;
    if (typeof parsed.profileId !== "string" || typeof parsed.email !== "string") {
      return null;
    }
    return {
      profileId: parsed.profileId,
      email: parsed.email,
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      accessLinkSent: parsed.accessLinkSent === true,
      checkoutPending: parsed.checkoutPending === true,
    };
  } catch {
    return null;
  }
}

export function writeSignupContext(ctx: SignupContext): void {
  try {
    window.sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    // Storage bloqueado: o fluxo segue; só a volta do checkout perde o contexto.
  }
}

export type CheckoutReturn = {
  step: Extract<SignupStep, "aprovado" | "desistiu" | "sem_cartao">;
  result: "concluido" | "desistiu";
};

/**
 * Lê (e consome) a volta do checkout ao carregar a landing:
 *  - `?checkout=concluido` → Aprovado (backend com `origin: "landing"`, env
 *    LANDING_CHECKOUT_RETURN=1). `?payment=success` (cadastro antigo com
 *    cartão obrigatório, devolvido pelo agendabela-web) conta igual;
 *  - `?checkout=voltou` → Desistiu;
 *  - sem parâmetro, mas com checkout aberto nesta aba → Desistiu. É a volta
 *    pelo agendabela-web, que não diz se concluiu. Desistiu é a tela segura:
 *    tentar o cartão de novo responde "já cadastrado" (409) e cai em Aprovado.
 *
 * Sem o contexto desta aba (o backend reaproveita um checkout pendente com as
 * URLs de volta de quando foi criado; ela pode concluir por outro caminho):
 * concluído → "Pronto, agora é no app" genérica; voltou → landing normal.
 *
 * Remove o parâmetro da URL e a marca de checkout aberto.
 */
export function consumeCheckoutReturn(): CheckoutReturn | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const checkout = url.searchParams.get("checkout");
  const payment = url.searchParams.get("payment");

  if (checkout !== null || payment !== null) {
    url.searchParams.delete("checkout");
    url.searchParams.delete("payment");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }

  const ctx = readSignupContext();
  if (ctx?.checkoutPending) writeSignupContext({ ...ctx, checkoutPending: false });

  if (checkout === "concluido" || payment === "success") {
    return { step: ctx ? "aprovado" : "sem_cartao", result: "concluido" };
  }
  if (checkout === "voltou") {
    return ctx ? { step: "desistiu", result: "desistiu" } : null;
  }
  if (ctx?.checkoutPending) return { step: "desistiu", result: "desistiu" };
  return null;
}

export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Celular (11 dígitos) ou fixo (10), igual ao maskPhone da lista de espera. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** CPF (11 dígitos) ou CNPJ (14) enquanto digita. */
export function formatTaxId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** Fim do teste de 7 dias contado de hoje, em dd/mm (mesma janela do backend). */
export function formatTrialEndDate(now: Date = new Date()): string {
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  const day = String(end.getDate()).padStart(2, "0");
  const month = String(end.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}
