// ─────────────────────────────────────────────────────────────────────────────
// <TestimonialsComponent />
//
// Depoimentos de donas de salão. Cards com avatar (iniciais SVG) + citação
// Fraunces italic + atribuição. Mobile-first: 1 col → 2 col tablet → 4 col
// desktop. Tons alternados de creme pra dar ritmo visual à seção.
//
// Avatars usam iniciais com cores do brand — sem fotos stock, sem dependência
// externa. Quando houver depoimentos reais com foto autorizada, trocar.
// ─────────────────────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string;
  name: string;
  salon: string;
  city: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Antes vivia esquecendo de confirmar horário com cliente. Agora chega tudo no WhatsApp delas automático. Meu no-show caiu pela metade no primeiro mês.",
    name: "Mariana Helena",
    salon: "Salão Bela Mari",
    city: "Sorocaba — SP",
  },
  {
    quote:
      "Comecei usando só pra receber lembrete da agenda do dia. Em uma semana já tava economizando uma hora por dia que eu gastava respondendo WhatsApp.",
    name: "Carla Andrade",
    salon: "Studio Carla",
    city: "Ribeirão Preto — SP",
  },
  {
    quote:
      "Eu não sabia exatamente quanto faturava no dia. Hoje abro o app de manhã, vejo o número e a agenda pronta. Mudou minha cabeça sobre o negócio.",
    name: "Patrícia Ramos",
    salon: "Espaço Patty",
    city: "Curitiba — PR",
  },
  {
    quote:
      "O cadastro do salão levou uns 5 minutos mesmo. Cadastrei minha filha como profissional e os serviços, e no mesmo dia já tava marcando agendamento.",
    name: "Juliana Costa",
    salon: "Beleza & Cia",
    city: "Campinas — SP",
  },
];

export const TestimonialsComponent = () => {
  return (
    <section className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14 text-center">
          <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
            Quem já tem secretária
          </span>
          <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[32px] leading-[36px] md:text-[44px] md:leading-[48px] tracking-[-0.025em] max-w-[22ch]">
            Donas de salão que dormem mais tranquilas.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="flex flex-col gap-4 bg-surface-alt-card rounded-app-lg shadow-brand-xs p-6 border border-surface-alt-border"
            >
              {/* Aspas decorativas no topo */}
              <span
                aria-hidden
                className="font-fraunces italic text-brand-rosa text-[40px] leading-none -mb-2 -ml-1"
              >
                &ldquo;
              </span>

              {/* Citação */}
              <blockquote className="font-fraunces italic text-brand-petroleo text-[16px] leading-[24px] tracking-[-0.005em] flex-1">
                {t.quote}
              </blockquote>

              {/* Atribuição */}
              <div className="font-inter text-[13px] leading-[18px] border-t border-surface-alt-border pt-3">
                <p className="font-semibold text-ink">{t.name}</p>
                <p className="text-ink-muted">{t.salon}</p>
                <p className="text-ink-subtle text-[12px] mt-0.5">{t.city}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
