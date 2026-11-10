// ─────────────────────────────────────────────────────────────────────────────
// <TrySimulatorComponent />
//
// Convite para o simulador (/agendabela/experimente) para quem quer ver antes
// de criar conta. Botão contornado de propósito: o CTA cheio da página continua
// sendo o cadastro. Sem animação (nada a desligar em prefers-reduced-motion).
// ─────────────────────────────────────────────────────────────────────────────

import { SimulatorLink } from "./simulator-link";

export const TrySimulatorComponent = () => {
  return (
    <section
      id="teste-sem-cadastro"
      aria-labelledby="simulador-titulo"
      className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 pb-16 md:pb-24"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center bg-brand-creme-soft rounded-app-xl border border-surface-alt-border shadow-brand-xs px-6 py-10 md:px-12 md:py-14">
        <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
          Simulação · clientes de exemplo
        </span>
        <h2
          id="simulador-titulo"
          className="font-fraunces italic font-normal text-brand-petroleo text-[30px] leading-[34px] md:text-[40px] md:leading-[44px] tracking-[-0.025em] max-w-[20ch]"
        >
          Quer ver antes? Teste aqui, sem cadastro.
        </h2>
        <p className="font-inter text-ink-muted text-[15.5px] leading-[24px] md:text-[17px] md:leading-[26px] max-w-[46ch]">
          Marque uma cliente de exemplo e veja a confirmação que ela recebe no
          WhatsApp. Nada é enviado de verdade.
        </p>
        <SimulatorLink
          refId="automatize_secao"
          hash="marcar-cliente"
          ctaLocation="automatize_secao_simulador"
          className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand-petroleo bg-transparent px-7 font-inter text-[15px] font-semibold text-brand-petroleo transition-colors hover:bg-brand-petroleo/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo motion-reduce:transition-none"
        >
          Experimentar o Agenda Bela
        </SimulatorLink>
      </div>
    </section>
  );
};
