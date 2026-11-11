/**
 * Regras do cadastro sem cartão usadas no navegador (checklist e validação)
 * e no servidor da landing (rotas /api/agendabela/*). Uma cópia só: se a
 * política mudar, o checklist e a rota mudam juntos.
 *
 * A senha segue a política do Cognito que o backend valida
 * (`IsCognitoPassword`): 8+ caracteres, maiúscula, minúscula, número e
 * símbolo (qualquer caractere não alfanumérico).
 */

/** TLD com 2+ letras, como o `@IsEmail` do backend (`a@b.c` não passa). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/**
 * Só DDD + número (10 ou 11 dígitos), do jeito que a cliente colar:
 * "+55 (91) 98765-4321", "55 91 98765 4321", "0 15 91 98765-4321" (zero +
 * operadora) ou "091 98765-4321". Sem isso, o DDI virava DDD e o link de
 * acesso ia para o número de outra pessoa.
 */
export function phoneDigitsBR(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
    // 0 + operadora (2 dígitos) + DDD + número
    if (digits.length === 12 || digits.length === 13) digits = digits.slice(2);
  } else if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 11);
}

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
