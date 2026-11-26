/**
 * Perguntas rápidas das landings de loja. Fonte única: gera os <details> da
 * página (markup.ts) e o FAQPage do JSON-LD (structured-data.ts), para o dado
 * estruturado nunca divergir do texto visível. Texto puro, sem HTML.
 *
 * O id é o faq_id do evento faq_open: fixo, ASCII e independente do texto. Mudar
 * a redação da pergunta não muda o id; trocar o id quebra a série no GA4.
 */
import type { LojasFaqId } from "@/lib/analytics/dataLayer";

export type LojasFaqItem = { id: LojasFaqId; pergunta: string; resposta: string };

export const LOJAS_FAQ: readonly LojasFaqItem[] = [
  {
    id: "o_que_e",
    pergunta: "O que é o Agenda Bela?",
    resposta:
      "O Agenda Bela é um app de agenda para salão de beleza, para iPhone e Android. Feito para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais, ele confirma e lembra suas clientes no WhatsApp, recebe o sinal no Pix pelo seu link e mostra o caixa do dia. Você testa 7 dias sem cartão; depois, R$ 59,90 por mês.",
  },
  {
    id: "precisa_cartao",
    pergunta: "Preciso de cartão para começar?",
    resposta:
      "Não. Você usa 7 dias sem cartão. Eles começam quando você configura sua agenda no app.",
  },
  {
    id: "quanto_custa_depois",
    pergunta: "Quanto custa depois?",
    resposta:
      "R$ 59,90 por mês. Cancele quando quiser.",
  },
  {
    id: "iphone_android",
    pergunta: "Funciona no iPhone e no Android?",
    resposta:
      "Sim, nos dois. Procure por “Agenda Bela” nas lojas.",
  },
  {
    id: "whatsapp_numero",
    pergunta: "As mensagens para minhas clientes saem do meu WhatsApp?",
    resposta:
      "Saem do número do Agenda Bela, não do seu.",
  },
  {
    id: "cliente_baixar",
    pergunta: "Minha cliente precisa baixar algo?",
    resposta:
      "Não. Ela marca pelo seu link e recebe a confirmação e o lembrete no WhatsApp.",
  },
];
