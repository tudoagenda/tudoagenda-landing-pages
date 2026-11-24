/**
 * Perguntas rápidas da Oferta Agenda Bela (/agendabela/oferta). Texto do
 * protótipo aprovado em 24/11/2026; todo valor sai da config da oferta.
 *
 * Diferente de faq.ts, a resposta é HTML: uma leva link e outra muda com o
 * aparelho (data-dev). A página é noindex e não tem JSON-LD, então não há
 * FAQPage para acompanhar. As três últimas perguntas são as mesmas da landing
 * de loja padrão e vêm de faq.ts.
 */
import {
  descontoPorExtenso,
  formatarCentavos,
  type OfertaConfig,
} from "@/config/landing-lojas";
import { supportWhatsappUrl } from "@/config/company";
import { LOJAS_FAQ } from "./faq";

export type OfertaFaqItem = { pergunta: string; respostaHtml: string };

const PERGUNTAS_COMUNS = [
  "Funciona no iPhone e no Android?",
  "As mensagens para minhas clientes saem do meu WhatsApp?",
  "Minha cliente precisa baixar algo?",
];

const reais = (centavos: number) => `R$&nbsp;${formatarCentavos(centavos)}`;

export function buildOfertaFaq(oferta: OfertaConfig): OfertaFaqItem[] {
  const m = oferta.meses;
  const cheio = reais(oferta.precoCheioCentavos);
  const promo = reais(oferta.precoPromoCentavos);
  const whatsapp = supportWhatsappUrl(
    "Oi! Tenho uma dúvida sobre o desconto do Agenda Bela",
  ).replace(/&/g, "&amp;");
  const semAparelho = `Os 7 dias sem cartão continuam. Ao assinar pelo app, o desconto vale nos ${m} primeiros meses.`;
  return [
    {
      pergunta: "O que é o Agenda Bela?",
      respostaHtml: `O Agenda Bela é um app de agenda para salão de beleza, para iPhone e Android. Feito para cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais, ele confirma e lembra suas clientes no WhatsApp, recebe o sinal no Pix pelo seu link e mostra o caixa do dia. Você testa 7 dias sem cartão e depois assina pelo app. Os valores e o desconto estão na pergunta “Como funciona o desconto de ${oferta.percentual}%?”.`,
    },
    {
      pergunta: `Como funciona o desconto de ${oferta.percentual}%?`,
      respostaHtml: `Nos ${m} primeiros meses da assinatura, você paga ${promo} por mês em vez de ${cheio}. Do ${m + 1}º mês em diante, a assinatura continua por ${cheio} por mês, até você cancelar. O desconto aparece na tela da loja (App Store ou Google Play) na hora de assinar, e é a loja que faz a cobrança.`,
    },
    {
      pergunta: "Quem pode usar o desconto?",
      respostaHtml: `Quem assina o Agenda Bela pela primeira vez, pelo app. Se na tela da App Store ou do Google Play o desconto não aparecer, é porque você já usou uma oferta antes ou porque ela saiu do ar. Nesse caso, o preço é o normal, ${cheio}. Dúvida? <a href="${whatsapp}" target="_blank" rel="noopener noreferrer">Chame a gente no WhatsApp<span class="sr"> (abre em nova aba)</span></a>.`,
    },
    {
      pergunta: "O desconto vale junto com o teste de 7 dias?",
      respostaHtml:
        `<span data-dev="ios">Sim. Primeiro você testa 7 dias, sem cartão e sem pagar nada. Quando decidir assinar, a App Store cobra na hora o primeiro mês: ${promo}. É ${promo} por mês durante ${m} meses, uma cobrança por mês, não tudo de uma vez. Do ${m + 1}º mês em diante, ${cheio} por mês.</span>` +
        `<span data-dev="android">Sim. Os 7 dias sem cartão continuam. Ao assinar, você paga ${promo} por mês nos ${m} primeiros meses (${descontoPorExtenso(oferta)}) e, depois, ${cheio} por mês.</span>` +
        `<span data-dev="desktop">${semAparelho}</span>` +
        `<span data-dev="nojs">${semAparelho}</span>`,
    },
    {
      pergunta: "Preciso de cartão para começar?",
      respostaHtml:
        "Para testar, não. Você usa 7 dias sem cartão, que contam a partir de quando você monta sua agenda no app. Só quando decidir assinar a loja vai pedir seu cartão ou outra forma de pagar.",
    },
    {
      pergunta: `E depois dos ${m} meses, quanto custa?`,
      respostaHtml: `${cheio} por mês, o preço normal. A assinatura renova sozinha, e você cancela quando quiser, em Assinaturas da App Store ou do Google Play, antes da data da cobrança.`,
    },
    {
      pergunta: `E se eu cancelar antes dos ${m} meses?`,
      respostaHtml:
        "Você deixa de ser cobrada na renovação seguinte. Se voltar depois, o preço é o normal, porque o desconto vale uma vez por pessoa.",
    },
    ...LOJAS_FAQ.filter((item) =>
      PERGUNTAS_COMUNS.includes(item.pergunta),
    ).map((item) => ({
      pergunta: item.pergunta,
      respostaHtml: item.resposta,
    })),
  ];
}
