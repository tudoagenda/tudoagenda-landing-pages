// ─────────────────────────────────────────────────────────────────────────────
// <HowItWorksComponent />
//
// Seção "Como funciona em 3 passos" — mata a objeção "vai dar trabalho?"
// Mobile-first: stack vertical com cards alargados. Desktop empilha 3 colunas.
// Substitui o `Step` antigo com claims falsos sobre atendente virtual.
// ─────────────────────────────────────────────────────────────────────────────

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Cadastra seu salão em 5 minutos",
    description:
      "Pelo celular, sem complicação. Você cria os profissionais, os serviços com preço e duração, e pronto — tá no ar.",
  },
  {
    number: "2",
    title: "Marca agendamentos no app",
    description:
      "Toda vez que você marca um horário, o cliente recebe a confirmação no WhatsApp dele. Sem você apertar nada.",
  },
  {
    number: "3",
    title: "A gente cuida do dia a dia",
    description:
      "Toda manhã, seu cliente recebe o lembrete do horário do dia. Você acorda com a agenda pronta no celular.",
  },
];

export const HowItWorksComponent = () => {
  return (
    <section className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 pt-10 pb-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14 text-center">
          <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
            Sem complicação
          </span>
          <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[32px] leading-[34px] md:text-[44px] md:leading-[46px] tracking-[-0.025em] max-w-[18ch]">
            Em 5 minutos a sua secretária tá trabalhando.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col gap-3 bg-surface-alt-card rounded-app-lg shadow-brand-xs p-6 md:p-7"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-rosa text-white font-fraunces italic text-xl">
                {step.number}
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[22px] leading-[26px] tracking-[-0.015em]">
                {step.title}
              </h3>
              <p className="font-inter text-ink-muted text-[14.5px] leading-[22px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
