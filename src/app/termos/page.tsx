import type { Metadata } from "next";
import { LegalLayout, LegalSectionBlock } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Termos de Serviço | Agenda Bela",
  description:
    "Termos e condições de uso da plataforma Agenda Bela: assinatura, cancelamento, propriedade intelectual, responsabilidades e limitações.",
};

const sections = [
  { id: "objeto", title: "1. Objeto" },
  { id: "conta", title: "2. Conta e responsabilidades" },
  { id: "assinatura", title: "3. Assinatura e pagamento" },
  { id: "cancelamento", title: "4. Cancelamento e reativação" },
  { id: "uso", title: "5. Uso da plataforma" },
  { id: "limitacoes", title: "6. Limitações de responsabilidade" },
  { id: "alteracoes", title: "7. Alterações nos termos" },
  { id: "contato", title: "8. Contato" },
];

export default function TermosPage() {
  return (
    <LegalLayout
      pageTitle="Termos de Serviço"
      pageSubtitle="Condições gerais de uso da plataforma Agenda Bela, da assinatura ao cancelamento."
      lastUpdated="18 de maio de 2026"
      controllerName="Tudo Agenda"
      sections={sections}
    >
      <div className="space-y-6 border-b border-surface-alt-border pb-8 mb-8">
        <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
          Antes de começar
        </span>
        <p className="font-inter text-[16px] leading-[26px] text-ink">
          Ao criar uma conta e usar o Agenda Bela, você concorda com os termos
          abaixo. Recomendamos a leitura atenta antes de iniciar a assinatura.
        </p>
      </div>

      <div className="space-y-8">
        <LegalSectionBlock id="objeto" title="1. Objeto">
          <p>
            O Agenda Bela é uma plataforma da Tudo Agenda voltada para gestão
            de agenda, comunicação com clientes e operação de salões de beleza.
            Estes termos regulam a relação entre você (titular da conta do
            salão) e a Tudo Agenda durante a utilização do produto.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="conta" title="2. Conta e responsabilidades">
          <p>
            Para usar o Agenda Bela, é necessário criar uma conta fornecendo
            dados verdadeiros e atualizados. Você é responsável por manter a
            confidencialidade do acesso (senha e dispositivos autenticados) e
            por todas as atividades realizadas pela sua conta.
          </p>
          <p>
            O cadastro de profissionais, serviços e clientes finais deve
            respeitar a legislação aplicável, especialmente a LGPD — só envie
            dados de terceiros (clientes) que estejam autorizados ou amparados
            por base legal pertinente.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="assinatura" title="3. Assinatura e pagamento">
          <p>
            O Agenda Bela é oferecido em modelo de assinatura mensal recorrente
            de R$ 59,90/mês, cobrada via cartão de crédito por intermédio do
            processador AbacatePay. A primeira ativação inclui período de 30
            dias gratuitos.
          </p>
          <p>
            Reativações após cancelamento não recebem novo período gratuito —
            a cobrança recorrente reinicia imediatamente conforme o plano
            vigente.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="cancelamento" title="4. Cancelamento e reativação">
          <p>
            Você pode cancelar sua assinatura a qualquer momento pelo painel
            da plataforma, sem ônus adicionais ou fidelidade. O acesso
            permanece ativo até o fim do período já pago, e nenhum valor é
            cobrado em ciclos seguintes.
          </p>
          <p>
            A reativação pode ser feita a qualquer momento. Seus dados são
            preservados por até 6 meses após o cancelamento, permitindo que
            você retome de onde parou.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="uso" title="5. Uso da plataforma">
          <p>
            Você concorda em usar o Agenda Bela apenas para finalidades
            legítimas associadas à operação do salão. É vedado:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              utilizar a plataforma para envio de comunicações comerciais não
              autorizadas a terceiros;
            </li>
            <li>
              tentar acessar áreas ou dados que não pertencem à sua conta;
            </li>
            <li>
              fazer engenharia reversa, copiar ou reproduzir o produto sem
              autorização expressa;
            </li>
            <li>
              comprometer a segurança ou disponibilidade da plataforma.
            </li>
          </ul>
        </LegalSectionBlock>

        <LegalSectionBlock
          id="limitacoes"
          title="6. Limitações de responsabilidade"
        >
          <p>
            O Agenda Bela é fornecido em base &ldquo;como está&rdquo;.
            Trabalhamos para garantir alta disponibilidade e segurança, mas
            não garantimos ausência total de erros, interrupções ou
            indisponibilidades pontuais. Eventos de força maior, falhas de
            terceiros (provedores de WhatsApp, AbacatePay, hospedagem) ou
            manutenção programada podem afetar temporariamente o uso.
          </p>
          <p>
            A Tudo Agenda não se responsabiliza por danos indiretos
            decorrentes de uso indevido da plataforma ou de configurações
            incorretas feitas pelo titular da conta.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="alteracoes" title="7. Alterações nos termos">
          <p>
            Estes termos podem ser atualizados periodicamente para refletir
            melhorias no produto, mudanças legais ou ajustes operacionais.
            Mudanças significativas serão comunicadas pelo e-mail cadastrado
            ou pelo próprio app antes da entrada em vigor.
          </p>
        </LegalSectionBlock>

        <LegalSectionBlock id="contato" title="8. Contato">
          <p>
            Para dúvidas, suporte ou questões contratuais, fale com a Tudo
            Agenda pelo e-mail{" "}
            <a
              className="font-semibold text-brand-petroleo underline"
              href="mailto:contato@tudoagenda.com.br"
            >
              contato@tudoagenda.com.br
            </a>
            .
          </p>
        </LegalSectionBlock>
      </div>
    </LegalLayout>
  );
}
