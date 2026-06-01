import Image from "next/image";
import { WaitlistForm } from "./waitlist-form";

const benefits = [
  "Confirma e lembra seus clientes no WhatsApp, no automático",
  "Sua agenda do dia direto no celular toda manhã",
  "Profissionais, serviços e horários organizados num lugar só",
];

const ListaDeEspera = () => {
  return (
    <main className="min-h-screen w-full bg-surface-subtle px-5 md:px-10 lg:px-20 py-8 md:py-12">
      {/* Top bar — logo do app */}
      <header className="flex items-center justify-between max-w-5xl mx-auto mb-8 md:mb-12">
        <Image
          src="/brand/logo-app.png"
          alt="Agenda Bela"
          width={72}
          height={72}
          priority
          className="h-14 w-14 md:h-16 md:w-16"
        />
        <span className="hidden md:inline font-mono-brand text-[10px] tracking-[2px] uppercase text-brand-vinho">
          por Tudo Agenda
        </span>
      </header>

      <section className="relative max-w-5xl mx-auto overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-md">
        {/* Círculos decorativos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 md:h-80 md:w-80 rounded-full bg-brand-rosa-claro opacity-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-56 w-56 md:h-64 md:w-64 rounded-full bg-brand-creme-soft opacity-60"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 p-6 md:p-12 lg:p-16 items-center">
          {/* Coluna esquerda — copy */}
          <div className="flex flex-col gap-5 md:gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-rosa-50 px-3 py-1 font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-rosa">
              Em breve
            </span>

            <h1 className="font-fraunces italic font-normal text-brand-petroleo text-[34px] leading-[38px] md:text-[52px] md:leading-[54px] tracking-[-0.035em] max-w-[16ch]">
              O Agenda Bela está chegando.
            </h1>

            <p className="font-inter text-ink-muted text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[42ch]">
              A secretária digital do seu salão. Deixa seu nome e WhatsApp pra
              ser uma das{" "}
              <span className="text-brand-petroleo font-medium">
                primeiras a usar
              </span>{" "}
              quando lançar.
            </p>

            <ul className="flex flex-col gap-2.5">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 font-inter text-[14.5px] text-ink"
                >
                  <span className="inline-flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-brand-rosa-50 text-brand-rosa font-bold text-[12px]">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna direita — form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto mt-8 text-center">
        <span className="font-mono-brand text-[10px] tracking-[2px] uppercase text-ink-subtle">
          Agenda Bela · por Tudo Agenda
        </span>
      </footer>
    </main>
  );
};

export default ListaDeEspera;
