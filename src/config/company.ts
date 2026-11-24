export const COMPANY_LEGAL_NAME = "CODEVERSE SERVIÇOS DE TECNOLOGIA LTDA";
export const COMPANY_CNPJ = "59.161.274/0001-05";
export const COMPANY_LEGAL_IDENTIFICATION = `${COMPANY_LEGAL_NAME} · CNPJ ${COMPANY_CNPJ}`;

/** Link do WhatsApp do suporte com a mensagem inicial já escrita. */
export function supportWhatsappUrl(mensagem: string): string {
  return `https://wa.me/5519936180533?text=${encodeURIComponent(mensagem)}`;
}

export const SUPPORT_WHATSAPP_URL = supportWhatsappUrl(
  "Oi! Preciso de ajuda com o Agenda Bela",
);
