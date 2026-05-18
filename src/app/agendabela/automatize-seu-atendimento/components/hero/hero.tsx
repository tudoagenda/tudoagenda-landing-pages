"use client";

import dynamic from "next/dynamic";
import { AgendaBelaLogo } from "@/components/brand/agenda-bela-logo";
import { AppScreenStack } from "@/components/brand/app-screen-stack";
import { WhatsAppPreview } from "@/components/brand/whatsapp-preview";

const FormComponent = dynamic(
  () => import("../form").then((mod) => ({ default: mod.FormComponent })),
  {
    loading: () => (
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <div className="h-11 bg-surface-alt-card animate-pulse rounded-full flex-1" />
        <div className="h-11 bg-brand-rosa/40 animate-pulse rounded-full md:w-44" />
      </div>
    ),
  },
);

const positiveDisclaimer = (
  <>
    <strong className="font-inter font-semibold text-ink">
      30 dias grátis.
    </strong>{" "}
    Cancela quando quiser.
  </>
);

const features = [
  "Confirmação automática no WhatsApp do cliente",
  "Lembrete pro cliente no dia do horário",
  "Agenda do dia direto no seu celular toda manhã",
];

export const HeroComponent = () => {
  return (
    <>
      <main
        id="teste-gratuitamente"
        className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 pt-6 md:pt-10 pb-44 md:pb-20"
      >
        {/* Top bar — logo + wordmark */}
        <header className="flex items-center justify-between max-w-7xl mx-auto mb-6 md:mb-12">
          <div className="flex items-center gap-2">
            <AgendaBelaLogo color="navy" size={32} />
            <span className="font-fraunces italic text-brand-petroleo text-lg md:text-2xl tracking-tight">
              Agenda Bela
            </span>
          </div>
          <span className="hidden md:inline font-mono-brand text-[10px] tracking-[2px] uppercase text-ink-muted">
            por Tudo Agenda
          </span>
        </header>

        {/* Hero card — primeira dobra compacta, identidade do app */}
        <section className="relative max-w-7xl mx-auto overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-md">
          {/* Círculos decorativos */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 md:h-80 md:w-80 rounded-full bg-brand-rosa-claro opacity-40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-32 h-56 w-56 md:h-64 md:w-64 rounded-full bg-brand-creme-soft opacity-60"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16 p-6 md:p-12 lg:p-16 items-center">
            {/* Coluna esquerda — copy + form */}
            <div className="flex flex-col gap-5 md:gap-7">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                A secretária do seu salão
              </span>

              <h1 className="font-fraunces italic font-normal text-brand-petroleo text-[38px] leading-[40px] md:text-[60px] md:leading-[62px] lg:text-[68px] lg:leading-[68px] tracking-[-0.035em] max-w-[18ch]">
                Tem alguém cuidando da sua agenda agora.
              </h1>

              <p className="font-inter text-ink-muted text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[44ch]">
                A gente avisa seu cliente no WhatsApp toda vez que ele agenda, e
                lembra ele no dia. Você recebe a agenda do dia direto no
                celular. Você fica com o que faz melhor:{" "}
                <span className="text-brand-petroleo font-medium">
                  atender bem
                </span>
                .
              </p>

              {/* Bullets de features — fluxo de notificação real (unilateral) */}
              <ul className="flex flex-col gap-2.5 -mt-1">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 font-inter text-[14.5px] text-ink"
                  >
                    <span className="inline-flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-brand-rosa-50 text-brand-rosa font-bold text-[12px]">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Form desktop only — mobile usa sticky */}
              <div className="hidden md:flex flex-col gap-3 bg-white rounded-app-lg shadow-brand-md p-5 max-w-xl">
                <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-ink-muted">
                  Comece em 30 segundos
                </span>
                <FormComponent />
                <p className="font-inter text-[12px] leading-[18px] text-ink-muted">
                  {positiveDisclaimer}
                </p>
              </div>
            </div>

            {/* Coluna direita — stack de phones reais + notificações push */}
            <div className="relative h-[480px] sm:h-[520px] lg:h-[580px]">
              {/* Stack de phones com prints reais (sênior — composição estática
                  com float subtle nos secundários) */}
              <div className="absolute inset-0">
                <AppScreenStack />
              </div>

              {/* Chat WhatsApp do CLIENTE recebendo confirmação + lembrete.
                  Flutua por cima dos phones. */}
              <div
                className="absolute z-30 -left-2 sm:-left-4 lg:-left-8 top-2 sm:top-4 animate-float-soft"
                style={
                  {
                    "--card-rotate": "-3deg",
                    animationDelay: "0.5s",
                  } as React.CSSProperties
                }
              >
                <WhatsAppPreview />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA mobile — card flutuante */}
      <div
        className="md:hidden fixed bottom-3 left-3 right-3 bg-white rounded-app-xl shadow-brand-lg p-4 z-30"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-2.5">
          <FormComponent />
          <p className="font-inter text-[11px] leading-[15px] text-ink-muted text-center">
            {positiveDisclaimer}
          </p>
        </div>
      </div>
    </>
  );
};
