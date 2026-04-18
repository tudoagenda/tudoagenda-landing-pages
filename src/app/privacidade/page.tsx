import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4 border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-lexend text-2xl font-semibold text-slate-950">{title}</h2>
      <div className="space-y-4 text-base leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:px-8 lg:py-16">
        <aside className="top-10 h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:w-80">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Agenda Bela
            </p>
            <div className="space-y-3">
              <h1 className="font-lexend text-3xl font-semibold leading-tight text-slate-950">
                Política de Privacidade
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                Esta política explica como o Agenda Bela trata dados pessoais em seus produtos,
                landing pages e fluxos de atendimento relacionados à plataforma.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
              <p>
                <strong>Última atualização:</strong> 18 de abril de 2026
              </p>
              <p>
                <strong>Controladora:</strong> Tudo Agenda
              </p>
            </div>
          </div>

          <nav aria-label="Navegação da política" className="mt-6">
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#dados-coletados" className="hover:text-slate-950">Dados que coletamos</a></li>
              <li><a href="#como-usamos" className="hover:text-slate-950">Como usamos os dados</a></li>
              <li><a href="#compartilhamento" className="hover:text-slate-950">Compartilhamento</a></li>
              <li><a href="#armazenamento" className="hover:text-slate-950">Armazenamento e segurança</a></li>
              <li><a href="#direitos" className="hover:text-slate-950">Seus direitos</a></li>
              <li><a href="#contato" className="hover:text-slate-950">Contato</a></li>
            </ul>
          </nav>

          <div className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <p className="font-medium">Precisa falar com a gente?</p>
            <p>
              Entre em contato pelo e-mail{" "}
              <a className="underline" href="mailto:contato@tudoagenda.com.br">
                contato@tudoagenda.com.br
              </a>
              .
            </p>
          </div>
        </aside>

        <div className="flex-1 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-6 border-b border-slate-200 pb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Transparência no tratamento de dados
            </p>
            <p className="max-w-3xl text-lg leading-8 text-slate-700">
              O Agenda Bela oferece soluções para gestão e automação de atendimento em salões de
              beleza. Para operar a plataforma, podemos tratar dados pessoais de profissionais,
              responsáveis pelo salão, clientes finais e visitantes das nossas páginas.
            </p>
            <p className="max-w-3xl text-base leading-7 text-slate-700">
              Esta versão foi preparada como política inicial revisável para compliance e
              publicação institucional. Se houver mudança relevante no produto, nos meios de
              pagamento, integrações ou rotinas de comunicação, o texto poderá ser atualizado.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            <Section id="dados-coletados" title="1. Dados que coletamos">
              <p>
                Podemos coletar dados fornecidos diretamente por você, gerados durante o uso da
                plataforma ou recebidos de integrações e parceiros necessários para a operação do
                serviço.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                {collectedData.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Section>

            <Section id="como-usamos" title="2. Como usamos os dados">
              <p>Os dados tratados pelo Agenda Bela podem ser utilizados para:</p>
              <ul className="list-disc space-y-2 pl-6">
                {usagePurposes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Section>

            <Section id="compartilhamento" title="3. Compartilhamento de dados">
              <p>
                O compartilhamento acontece apenas quando necessário para viabilizar a prestação do
                serviço, como em serviços de infraestrutura, autenticação, analytics, meios de
                pagamento, provedores de comunicação e obrigações legais.
              </p>
              <p>
                Sempre buscamos limitar o compartilhamento ao mínimo necessário para cada finalidade
                e adotar medidas contratuais e técnicas compatíveis com o tratamento realizado.
              </p>
            </Section>

            <Section id="armazenamento" title="4. Armazenamento, retenção e segurança">
              <p>
                Mantemos dados pessoais pelo tempo necessário para cumprir as finalidades descritas
                nesta política, respeitar exigências legais, resolver disputas, prevenir fraudes e
                garantir a continuidade operacional da plataforma.
              </p>
              <p>
                Adotamos medidas administrativas, técnicas e organizacionais razoáveis para reduzir
                riscos de acesso não autorizado, perda, alteração ou divulgação indevida. Ainda
                assim, nenhum ambiente digital é completamente imune a incidentes.
              </p>
            </Section>

            <Section id="direitos" title="5. Seus direitos como titular">
              <p>
                Nos termos da legislação aplicável, especialmente a LGPD, você pode solicitar:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                {rights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                Para exercer esses direitos, poderemos solicitar informações adicionais para
                confirmar a identidade do solicitante e proteger dados de terceiros.
              </p>
            </Section>

            <Section id="contato" title="6. Contato e atualizações desta política">
              <p>
                Em caso de dúvidas, solicitações sobre privacidade ou exercício de direitos, fale
                com a Tudo Agenda pelo e-mail{" "}
                <a className="font-medium text-slate-950 underline" href="mailto:contato@tudoagenda.com.br">
                  contato@tudoagenda.com.br
                </a>
                .
              </p>
              <p>
                Poderemos atualizar esta política periodicamente para refletir melhorias no produto,
                adequações legais ou mudanças operacionais. Recomendamos a revisão desta página
                sempre que houver nova publicação.
              </p>
            </Section>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>URL pública sugerida para compartilhamento institucional: tudoagenda.com.br/privacidade</p>
            <Link href="/agendabela/automatize-seu-atendimento" className="font-medium text-slate-950 underline">
              Voltar para Agenda Bela
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
