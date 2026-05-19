import type { Metadata } from "next";
import { LegalLayout, LegalSectionBlock } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Política de Privacidade | Agenda Bela",
  description:
    "Saiba como o Agenda Bela coleta, usa, armazena e protege dados pessoais na plataforma e em seus fluxos de atendimento.",
};

const collectedData = [
  "Dados cadastrais e de contato, como nome, e-mail, telefone e nome do salão.",
  "Dados operacionais informados durante o uso da plataforma, como agenda, serviços, profissionais, clientes e registros ligados aos atendimentos.",
  "Dados de cobrança e relacionamento comercial necessários para ativação, checkout e gestão da assinatura.",
  "Dados técnicos e de navegação, como interações com páginas, eventos de uso, dispositivo, navegador e informações de sessão.",
];

const usagePurposes = [
  "criar e manter contas, autenticar acessos e habilitar funcionalidades do Agenda Bela",
  "viabilizar agendamentos, comunicações transacionais e fluxos de atendimento ao cliente",
  "processar cobrança, prevenção a fraude e suporte operacional",
  "melhorar a experiência do produto, medir uso da plataforma e evoluir recursos",
  "cumprir obrigações legais, regulatórias e atender solicitações legítimas de autoridades",
];

const rights = [
  "confirmação da existência de tratamento",
  "acesso, correção e atualização de dados",
  "anonimização, bloqueio ou eliminação quando aplicável",
  "portabilidade, nos termos da legislação",
  "informações sobre compartilhamento e possibilidade de revogar consentimento quando essa for a base legal aplicável",
];

const sections = [
  { id: "dados-coletados", title: "1. Dados que coletamos" },
  { id: "como-usamos", title: "2. Como usamos os dados" },
  { id: "compartilhamento", title: "3. Compartilhamento" },
  { id: "armazenamento", title: "4. Armazenamento e segurança" },
  { id: "direitos", title: "5. Seus direitos" },
  { id: "contato", title: "6. Contato" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      pageTitle="Política de Privacidade"
      pageSubtitle="Como o Agenda Bela trata dados pessoais em seus produtos, landing pages e fluxos de atendimento."
      lastUpdated="18 de maio de 2026"
      controllerName="Tudo Agenda"
      sections={sections}
    >
      <div className="space-y-6 border-b border-surface-alt-border pb-8 mb-8">
        <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
          Transparência no tratamento de dados
        </span>
        <p className="font-inter text-[16px] leading-[26px] text-ink">
          O Agenda Bela oferece soluções para gestão de salões de beleza. Para
          operar a plataforma, podemos tratar dados pessoais de profissionais,
          responsáveis pelo salão, clientes finais e visitantes das nossas
          páginas.
        </p>
      </div>

      <div className="space-y-8">
        <LegalSectionBlock id="dados-coletados" title="1. Dados que coletamos">
          <p>
            Podemos coletar dados fornecidos diretamente por você, gerados
            durante o uso da plataforma ou recebidos de integrações e
            parceiros necessários para a operação do serviço.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            {collectedData.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalSectionBlock>

        <LegalSectionBlock id="como-usamos" title="2. Como usamos os dados">
          <p>Os dados tratados pelo Agenda Bela podem ser utilizados para:</p>
          <ul className="list-disc space-y-2 pl-6">
            {usagePurposes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LegalSectionBlock>

        <LegalSectionBlock id="compartilhamento" title="3. Compartilhamento de dados">
          <p>
            O compartilhamento acontece apenas quando necessário para viabilizar
            a prestação do serviço, como em infraestrutura, autenticação,
            analytics, meios de pagamento, provedores de comunicação e obrigações
            legais.
          </p>
          <p>
            Sempre buscamos limitar o compartilhamento ao mínimo necessário para
            cada finalidade e adotar medidas contratuais e técnicas compatíveis
            com o tratamento realizado.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock
          id="armazenamento"
          title="4. Armazenamento, retenção e segurança"
        >
          <p>
            Mantemos dados pessoais pelo tempo necessário para cumprir as
            finalidades descritas nesta política, respeitar exigências legais,
            resolver disputas, prevenir fraudes e garantir a continuidade
            operacional da plataforma.
          </p>
          <p>
            Adotamos medidas administrativas, técnicas e organizacionais
            razoáveis para reduzir riscos de acesso não autorizado, perda,
            alteração ou divulgação indevida.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="direitos" title="5. Seus direitos como titular">
          <p>
            Nos termos da legislação aplicável, especialmente a LGPD, você pode
            solicitar:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            {rights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Para exercer esses direitos, poderemos solicitar informações
            adicionais para confirmar a identidade do solicitante e proteger
            dados de terceiros.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="contato" title="6. Contato e atualizações">
          <p>
            Em caso de dúvidas, solicitações sobre privacidade ou exercício de
            direitos, fale com a Tudo Agenda pelo e-mail{" "}
            <a
              className="font-semibold text-brand-petroleo underline"
              href="mailto:contato@tudoagenda.com.br"
            >
              contato@tudoagenda.com.br
            </a>
            .
          </p>
          <p>
            Poderemos atualizar esta política periodicamente. Recomendamos a
            revisão desta página sempre que houver nova publicação.
          </p>
        </LegalSectionBlock>
      </div>
    </LegalLayout>
  );
}
