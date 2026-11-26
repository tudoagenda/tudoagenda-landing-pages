/**
 * Perguntas rápidas da Oferta Agenda Bela (/agendabela/oferta). Texto da nota
 * 16 da campanha (cupom, 26/11/2026); todo valor e o código do cupom saem da
 * config da oferta.
 *
 * Diferente de faq.ts, a resposta é HTML: uma leva link e duas mudam com o
 * aparelho (data-dev). A página é noindex e não tem JSON-LD, então não há
 * FAQPage para acompanhar. As três últimas perguntas são as mesmas da landing
 * de loja padrão e vêm de faq.ts.
 */
import { formatarCentavos, type OfertaConfig } from "@/config/landing-lojas";
import { supportWhatsappUrl } from "@/config/company";
import { LOJAS_FAQ } from "./faq";

export type OfertaFaqItem = { pergunta: string; respostaHtml: string };

const PERGUNTAS_COMUNS = [
  "Funciona no iPhone e no Android?",
  "As mensagens para minhas clientes saem do meu WhatsApp?",
  "Minha cliente precisa baixar algo?",
];

const reais = (centavos: number) => `R$&nbsp;${formatarCentavos(centavos)}`;

/** Resposta que muda com o aparelho; sem JavaScript vale a do computador. */
const porAparelho = (ios: string, android: string, semAparelho: string) =>
  `<span data-dev="ios">${ios}</span>` +
  `<span data-dev="android">${android}</span>` +
  `<span data-dev="desktop">${semAparelho}</span>` +
  `<span data-dev="nojs">${semAparelho}</span>`;

export function buildOfertaFaq(oferta: OfertaConfig): OfertaFaqItem[] {
  const m = oferta.meses;
  const cupom = oferta.cupom;
  const cheio = reais(oferta.precoCheioCentavos);
  const promo = reais(oferta.precoPromoCentavos);
  const whatsapp = supportWhatsappUrl(
    `Oi! Tenho uma dúvida sobre o cupom ${cupom} do Agenda Bela`,
  ).replace(/&/g, "&amp;");
  const comoFunciona = `Como funciona o cupom ${cupom}?`;
  const ondeDigita = (tela: string) =>
    `Na tela de assinatura do app, toque em “Tenho um cupom”. Vai abrir ${tela}: digite ${cupom} e confirme. Esse link aparece também quando você está montando sua conta, no começo.`;
  return [
    {
      pergunta: "O que é o Agenda Bela?",
      respostaHtml: `O Agenda Bela é um app de agenda para salão de beleza, para iPhone e Android. Feito para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais, ele confirma e lembra suas clientes no WhatsApp, recebe o sinal no Pix pelo seu link e mostra o caixa do dia. Você testa 7 dias sem cartão e depois assina pelo app. O cupom ${cupom} e os valores estão na pergunta “${comoFunciona}”.`,
    },
    {
      pergunta: comoFunciona,
      respostaHtml: `Na hora de assinar, toque em “Tenho um cupom” e digite ${cupom}. Nos ${m} primeiros meses da assinatura, você paga ${promo} por mês em vez de ${cheio}. Do ${m + 1}º mês em diante, a assinatura continua por ${cheio} por mês, até você cancelar. A cobrança é feita pela loja (App Store ou Google Play).`,
    },
    {
      pergunta: "Onde eu coloco o cupom?",
      respostaHtml: porAparelho(
        ondeDigita("uma tela da Apple"),
        ondeDigita("um campo no próprio app"),
        `No app, na tela de assinatura, toque em “Tenho um cupom” e digite ${cupom} antes de confirmar.`,
      ),
    },
    {
      pergunta: "O cupom vale para quem já assinou?",
      respostaHtml: `Não. O cupom vale só para a primeira assinatura do Agenda Bela. Se você já assinou antes, o preço é o normal, ${cheio} por mês. Dúvida? <a href="${whatsapp}" target="_blank" rel="noopener noreferrer">Chame a gente no WhatsApp<span class="sr"> (abre em nova aba)</span></a>.`,
    },
    {
      pergunta: "O cupom vale junto com o teste de 7 dias?",
      respostaHtml: porAparelho(
        `Sim. O cupom dá 7 dias para testar, sem pagar nada. Depois, a App Store cobra ${promo} por mês nos ${m} primeiros meses, uma cobrança por mês, não tudo de uma vez. Do ${m + 1}º mês em diante, ${cheio} por mês.`,
        `Sim. Com o cupom, você testa 7 dias e depois paga ${promo} por mês nos ${m} primeiros meses (${oferta.percentual}% de desconto). Do ${m + 1}º mês em diante, ${cheio} por mês.`,
        `Sim. Os 7 dias sem cartão continuam. Ao assinar pelo app, use o cupom ${cupom} para ter o desconto nos ${m} primeiros meses.`,
      ),
    },
    {
      pergunta: "E se eu não usar o cupom?",
      respostaHtml: `Sem o cupom, a assinatura custa ${cheio} por mês. Digite o ${cupom} antes de confirmar a assinatura.`,
    },
    {
      pergunta: "Preciso de cartão para começar?",
      respostaHtml:
        "Para testar, não. Você usa 7 dias sem cartão, que contam a partir de quando você monta sua agenda no app. Só quando decidir assinar, a loja vai pedir seu cartão ou outra forma de pagar.",
    },
    {
      pergunta: `E depois dos ${m} meses, quanto custa?`,
      respostaHtml: `${cheio} por mês, o preço normal. A assinatura renova sozinha, e você cancela quando quiser, em Assinaturas da App Store ou do Google Play, antes da data da cobrança.`,
    },
    {
      pergunta: `E se eu cancelar antes dos ${m} meses?`,
      respostaHtml:
        "Você deixa de ser cobrada na renovação seguinte. Se voltar depois, o preço é o normal, porque o cupom vale só para a primeira assinatura.",
    },
    ...LOJAS_FAQ.filter((item) =>
      PERGUNTAS_COMUNS.includes(item.pergunta),
    ).map((item) => ({
      pergunta: item.pergunta,
      respostaHtml: item.resposta,
    })),
  ];
}
