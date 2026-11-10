"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { SimulatorLink } from "../try-simulator/simulator-link";
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
      7 dias grátis.
    </strong>{" "}
    Cancele quando quiser.
  </>
);

const features = [
  "Sua cliente recebe a confirmação no WhatsApp assim que você marca",
  "No dia, ela recebe o lembrete com botões para confirmar, remarcar ou cancelar",
  "Toda manhã você recebe a agenda do dia no celular, e um aviso quando uma cliente confirma",
];

/**
 * true quando o rodapé (#rodape) está na tela. O card fixo do celular some
 * nesse momento para não cobrir os selos das lojas do rodapé.
 */
function useFooterInView(): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;

    const watch = (footer: Element) => {
      io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
      io.observe(footer);
    };

    const footer = document.getElementById("rodape");
    if (footer) {
      watch(footer);
    } else {
      // O rodapé é carregado à parte (next/dynamic): espera ele entrar no DOM.
      mo = new MutationObserver(() => {
        const el = document.getElementById("rodape");
        if (!el) return;
        mo?.disconnect();
        mo = null;
        watch(el);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      io?.disconnect();
      mo?.disconnect();
    };
  }, []);

  return inView;
}

export const HeroComponent = () => {
  const footerInView = useFooterInView();
  // Com o foco num campo do card (digitando), ele não some nem fica inert.
  const [cardFocused, setCardFocused] = useState(false);
  const hideCard = footerInView && !cardFocused;

  return (
    <>
      <main
        id="teste-gratuitamente"
        className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 pt-6 md:pt-10 pb-32 md:pb-20"
      >
        {/* Top bar — logo do app (icon-only, igual mobile) */}
        <header className="flex items-center justify-between max-w-7xl mx-auto mb-6 md:mb-12">
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
                A Bela cuida da sua agenda enquanto você atende.
              </h1>

              <p className="font-inter text-ink-muted text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[44ch]">
                Você marca, a Bela avisa sua cliente no WhatsApp e lembra ela no
                dia do horário. Ela confirma ou pede para remarcar com um
                toque, e você é avisada.{" "}
                <span className="text-brand-petroleo font-medium">
                  Tranquilidade para você atender.
                </span>
              </p>

              {/* Bullets de features — fluxo real: confirmação, lembrete com botões e aviso à dona */}
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
                  Comece agora, é rápido
                </span>
                <FormComponent />
                <p className="font-inter text-[12px] leading-[18px] text-ink-muted">
                  {positiveDisclaimer}
                </p>
              </div>
              <SimulatorLink
                refId="automatize_hero"
                ctaLocation="automatize_hero_link"
                className="hidden md:inline-flex self-start min-h-11 items-center -mt-2 font-inter text-[14.5px] font-medium text-brand-petroleo underline underline-offset-4 decoration-brand-rosa hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo rounded-sm"
              >
                Prefere ver antes? Teste o app sem cadastro →
              </SimulatorLink>
            </div>

            {/* Coluna direita — stack de phones reais + notificações push.
                Mobile: altura compacta, só dashboard central (laterais ficam
                em sm+). WhatsAppPreview empurrado pra baixo-esquerda em
                mobile pra não tapar o miolo da prova visual. */}
            <div className="relative h-[400px] sm:h-[520px] lg:h-[580px]">
              <div className="absolute inset-0">
                <AppScreenStack />
              </div>

              {/* Chat WhatsApp da CLIENTE recebendo confirmação + lembrete com botões.
                  z-10 = ATRÁS do phone central (z-20 no AppScreenStack) pra
                  não tapar o dashboard. Mobile com scale menor.
                  Posição/scale no wrapper e animação no filho: o keyframe de
                  float-soft define `transform` e, no mesmo elemento, anularia
                  o `scale-[0.8]` do mobile (o card crescia sobre os bullets). */}
              <div className="absolute z-10 -left-2 sm:-left-4 lg:-left-8 bottom-2 sm:bottom-auto sm:top-4 scale-[0.8] sm:scale-100 origin-bottom-left sm:origin-top-left">
                <div
                  className="animate-float-soft"
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
          </div>
        </section>
      </main>

      {/* Sticky CTA mobile — card flutuante */}
      {/* Some quando o rodapé entra na tela, para não cobrir os selos das lojas. */}
      <div
        className={`md:hidden fixed bottom-3 left-3 right-3 bg-white rounded-app-xl shadow-brand-lg p-4 z-30 motion-safe:transition-[transform,opacity] motion-safe:duration-200${
          hideCard ? " translate-y-[120%] opacity-0 pointer-events-none" : ""
        }`}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        aria-hidden={hideCard || undefined}
        inert={hideCard || undefined}
        onFocus={() => setCardFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setCardFocused(false);
          }
        }}
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
