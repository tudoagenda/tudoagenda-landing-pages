/**
 * Client das rotas do cadastro sem cartão (Opção B). Tudo passa pelo
 * servidor da landing (src/app/api/agendabela/*), que fala com o backend.
 * As mensagens de erro já chegam em PT-BR das rotas; sem corpo legível, cai
 * no fallback localizado (nunca a mensagem crua do fetch).
 */

export interface SignupWebParams {
  name: string;
  salonName: string;
  phone: string;
  email: string;
  password: string;
}

export interface SignupWebResult {
  profileId: string;
  email: string;
  accessLinkSent: boolean;
}

export class SignupWebError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SignupWebError";
  }
}

const NETWORK_ERROR =
  "Sem conexão com a internet agora. Confira sua rede e tente de novo.";

async function post<T>(url: string, body: unknown, fallback: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SignupWebError(NETWORK_ERROR, 0);
  }
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    const message = typeof data?.error === "string" && data.error ? data.error : fallback;
    const code = typeof data?.code === "string" ? data.code : undefined;
    throw new SignupWebError(message, res.status, code);
  }
  return data as T;
}

export const signupWebService = {
  signup: (params: SignupWebParams) =>
    post<SignupWebResult>(
      "/api/agendabela/signup-web",
      params,
      "Não consegui criar sua conta agora. Tente de novo em instantes.",
    ),

  requestAccessLink: (email: string) =>
    post<{ ok: true }>(
      "/api/agendabela/signup-web/access-link",
      { email },
      "Não deu para mandar o link agora. Tente de novo em instantes.",
    ),

  startTrial: (profileId: string, taxId: string) =>
    post<{ checkoutUrl: string }>(
      "/api/agendabela/start-trial",
      { profileId, taxId },
      "Não consegui abrir o pagamento agora. Tente de novo em instantes.",
    ),
};
