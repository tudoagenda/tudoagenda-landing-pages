/**
 * Perguntas rápidas das landings de loja. Fonte única: gera os <details> da
 * página (markup.ts) e o FAQPage do JSON-LD (structured-data.ts), para o dado
 * estruturado nunca divergir do texto visível. Texto puro, sem HTML.
 */
export type LojasFaqItem = { pergunta: string; resposta: string };

export const LOJAS_FAQ: readonly LojasFaqItem[] = [
  {
    pergunta: "O que é o Agenda Bela?",
    resposta:
      "O Agenda Bela é um app de agenda para salão de beleza, para iPhone e Android. Feito para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais, ele confirma e lembra suas clientes no WhatsApp, recebe o sinal no Pix pelo seu link e mostra o caixa do dia. Você testa 7 dias sem cartão; depois, R$ 59,90 por mês.",
  },
  {
    pergunta: "Preciso de cartão para começar?",
    resposta:
      "Não. Você usa 7 dias sem cartão. Eles começam quando você configura sua agenda no app.",
  },
  {
    pergunta: "Quanto custa depois?",
    resposta:
      "R$ 59,90 por mês. Cancele quando quiser.",
  },
  {
    pergunta: "Funciona no iPhone e no Android?",
    resposta:
      "Sim, nos dois. Procure por “Agenda Bela” nas lojas.",
  },
  {
    pergunta: "As mensagens para minhas clientes saem do meu WhatsApp?",
    resposta:
      "Saem do número do Agenda Bela, não do seu.",
  },
  {
    pergunta: "Minha cliente precisa baixar algo?",
    resposta:
      "Não. Ela marca pelo seu link e recebe a confirmação e o lembrete no WhatsApp.",
  },
];
