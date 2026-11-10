// ─────────────────────────────────────────────────────────────────────────────
// <TestimonialsComponent />
//
// Avaliações reais publicadas nas lojas (App Store e Google Play). Mesmo texto
// e autoria da landing /agendabela/experimente (_prototipo/markup.ts) — se
// mudar lá, mudar aqui. Sem nota/estrelas e sem número de resultado.
// Mobile-first: 1 col → 2 col.
// ─────────────────────────────────────────────────────────────────────────────

import { SimulatorLink } from "../try-simulator/simulator-link";

interface StoreReview {
  quote: string;
  author: string;
  store: string;
  date: string;
}

const reviews: StoreReview[] = [
  {
    quote:
      "Sou manicure e estava procurando uma forma mais prática de organizar meus horários. Está facilitando bastante minha rotina, principalmente nos dias mais corridos. Fácil de usar e bem organizado…",
    author: "Cintia",
    store: "App Store",
    date: "set/2026",
  },
  {
    quote:
      "Deixou minha rotina muito mais organizada e ficou bem mais fácil cuidar dos agendamentos. É simples de mexer, rápido e tem tudo bem explicado…",
    author: "Tatiane C.",
    store: "Google Play",
    date: "set/2026",
  },
];

export const TestimonialsComponent = () => {
  return (
    <section
      aria-labelledby="avaliacoes-titulo"
      className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14 text-center">
          <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
            Quem já usa a Bela
          </span>
          <h2
            id="avaliacoes-titulo"
            className="font-fraunces italic font-normal text-brand-petroleo text-[32px] leading-[36px] md:text-[44px] md:leading-[48px] tracking-[-0.025em] max-w-[22ch]"
          >
            Avaliações de quem já usa
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          {reviews.map((r) => (
            <figure
              key={r.author}
              className="flex flex-col gap-4 bg-surface-alt-card rounded-app-lg shadow-brand-xs p-6 border border-surface-alt-border"
            >
              {/* Aspas decorativas no topo */}
              <span
                aria-hidden
                className="font-fraunces italic text-brand-rosa text-[40px] leading-none -mb-2 -ml-1"
              >
                &ldquo;
              </span>

              <blockquote className="font-fraunces italic text-brand-petroleo text-[16px] leading-[24px] tracking-[-0.005em] flex-1">
                {r.quote}
              </blockquote>

              <figcaption className="font-inter text-[13px] leading-[18px] border-t border-surface-alt-border pt-3">
                <span className="block font-semibold text-ink">{r.author}</span>
                <span className="block text-ink-muted">
                  {r.store} · {r.date}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center">
          <SimulatorLink
            refId="automatize_avaliacoes"
            ctaLocation="automatize_avaliacoes"
            className="inline-flex min-h-11 items-center font-inter text-[15px] font-semibold text-brand-petroleo underline underline-offset-4 decoration-brand-rosa hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo rounded-sm"
          >
            Veja o que a Bela faz na prática →
          </SimulatorLink>
        </p>
      </div>
    </section>
  );
};
