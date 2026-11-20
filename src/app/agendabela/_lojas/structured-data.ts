import { APP_STORE_URL, GOOGLE_PLAY_BASE_URL } from "@/config/app-stores";
import type { LandingLojasConfig } from "@/config/landing-lojas";
import { LOJAS_FAQ } from "./faq";

const SITE_URL = "https://tudoagenda.com.br";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOCIAL_IMAGE = `${SITE_URL}/brand/agenda-bela/social-preview-demo.png`;

/**
 * O app é um só no site: mesmo @id do SoftwareApplication da landing principal
 * (automatize-seu-atendimento/page.tsx) e da home. Cada página é lida sozinha
 * pelos buscadores, por isso o nó é repetido aqui em vez de só referenciado.
 */
export const AGENDA_BELA_SOFTWARE_ID = `${SITE_URL}/agendabela/automatize-seu-atendimento#software`;

/** Preço mensal, no formato de schema.org. Na página ele aparece como "R$ 59,90". */
export const AGENDA_BELA_MONTHLY_PRICE = "59.90";

/** Link da Google Play sem os parâmetros de idioma e país. */
const GOOGLE_PLAY_CANONICAL_URL = GOOGLE_PLAY_BASE_URL.split("&")[0];

/**
 * JSON-LD da landing de loja indexável. Só descreve o que a página mostra:
 * sem nota nem avaliação (a página não exibe nota) e com as mesmas perguntas
 * do FAQ visível (LOJAS_FAQ). A Black Friday é noindex e não leva JSON-LD.
 */
export function buildLojasStructuredData({
  config,
  title,
  description,
}: {
  config: LandingLojasConfig;
  title: string;
  description: string;
}) {
  const url = `${SITE_URL}${config.path}`;
  const stores = [APP_STORE_URL, GOOGLE_PLAY_CANONICAL_URL];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Tudo Agenda",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/tudo-agenda/favicon.png`,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: "Tudo Agenda",
        url: SITE_URL,
        inLanguage: "pt-BR",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "pt-BR",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": AGENDA_BELA_SOFTWARE_ID },
        mainEntity: { "@id": AGENDA_BELA_SOFTWARE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: SOCIAL_IMAGE,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Agenda Bela",
            item: `${SITE_URL}/agendabela/automatize-seu-atendimento`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "App para salão de beleza",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": AGENDA_BELA_SOFTWARE_ID,
        name: "Agenda Bela",
        alternateName: ["Agendabela", "AgendaBela"],
        applicationCategory: "BusinessApplication",
        operatingSystem: "iOS, Android",
        url: `${SITE_URL}/agendabela/automatize-seu-atendimento`,
        image: SOCIAL_IMAGE,
        inLanguage: "pt-BR",
        description:
          "App de agenda para salão de beleza que confirma agendamentos e lembra as clientes no WhatsApp, recebe sinal no Pix e mostra o caixa do dia.",
        // Só o que esta página mostra.
        featureList: [
          "Confirmação do agendamento no WhatsApp da cliente",
          "Lembrete no dia do horário, com opção de confirmar, remarcar ou cancelar",
          "Aviso no celular da profissional com os horários do dia e cada confirmação",
          "Link de agendamento com o nome do salão",
          "Sinal no Pix para garantir o horário marcado pelo link",
          "Fluxo de caixa com entradas e saídas do dia",
          "Pacote de sessões na ficha da cliente",
        ],
        audience: {
          "@type": "Audience",
          audienceType:
            "Cabeleireiras, manicures e esteticistas que atendem sozinhas ou com poucas profissionais",
        },
        // Sem `brand`: no schema.org ela vale para Product, Service e
        // Organization, não para SoftwareApplication.
        publisher: { "@id": ORGANIZATION_ID },
        installUrl: stores,
        sameAs: stores,
        // Offer simples: o período de teste não tem propriedade própria e vai
        // na descrição, com o texto da página.
        offers: {
          "@type": "Offer",
          price: AGENDA_BELA_MONTHLY_PRICE,
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          url,
          description:
            "7 dias grátis, sem cartão para começar. Depois, R$ 59,90 por mês. Cancele quando quiser.",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${url}#webpage` },
        mainEntity: LOJAS_FAQ.map((item) => ({
          "@type": "Question",
          name: item.pergunta,
          acceptedAnswer: { "@type": "Answer", text: item.resposta },
        })),
      },
    ],
  };
}
