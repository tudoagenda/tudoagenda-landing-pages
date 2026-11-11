/**
 * Regras do cadastro sem cartão usadas no navegador (checklist e validação)
 * e no servidor da landing (rotas /api/agendabela/*). Uma cópia só: se a
 * política mudar, o checklist e a rota mudam juntos.
 *
 * A senha segue a política do Cognito que o backend valida
 * (`IsCognitoPassword`): 8+ caracteres, maiúscula, minúscula, número e
 * símbolo (qualquer caractere não alfanumérico).
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES: {
  label: string;
  problem: string;
  test: (pw: string) => boolean;
}[] = [
  { label: "8+ caracteres", problem: "A senha precisa ter pelo menos 8 caracteres.", test: (pw) => pw.length >= 8 },
  { label: "maiúscula", problem: "A senha precisa de uma letra maiúscula.", test: (pw) => /[A-Z]/.test(pw) },
  { label: "minúscula", problem: "A senha precisa de uma letra minúscula.", test: (pw) => /[a-z]/.test(pw) },
  { label: "número", problem: "A senha precisa de um número.", test: (pw) => /[0-9]/.test(pw) },
  { label: "símbolo", problem: "A senha precisa de um símbolo (!@#$...).", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/** Primeira regra que a senha não cumpre, ou null. */
export function passwordProblem(pw: string): string | null {
  return PASSWORD_RULES.find((r) => !r.test(pw))?.problem ?? null;
}
