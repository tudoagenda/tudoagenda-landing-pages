"use client";

import { useEffect, useState } from "react";
import { SignupCtaButton } from "../form";
import {
  consumeCheckoutReturn,
  readSignupContext,
} from "../signup-modal/signup-session";
import {
  pushAgendaBelaMainEvent,
  type SignupStep,
} from "@/lib/analytics/dataLayer";
import dynamic from "next/dynamic";
import Image from "next/image";
import { SimulatorLink } from "../try-simulator/simulator-link";
import { AppScreenStack } from "@/components/brand/app-screen-stack";
import { WhatsAppPreview } from "@/components/brand/whatsapp-preview";

// O cadastro só carrega quando a cliente toca no botão (ou volta do checkout).
const SignupModal = dynamic(
  () => import("../signup-modal").then((mod) => ({ default: mod.SignupModal })),
  { ssr: false },
);

const positiveDisclaimer = "Sem cartão para começar. Cancele quando quiser.";

const features = [
  "Sua cliente recebe a confirmação no WhatsApp assim que você marca",
  "No dia, ela recebe o lembrete com botões para confirmar, remarcar ou cancelar",
  "Toda manhã você recebe a agenda do dia no celular, e um aviso quando uma cliente confirma",
];

/**
 * Elementos que o card fixo do celular não pode cobrir: o rodapé (selos das
 * lojas) e o botão da seção do simulador (em 320px o card cobria o botão).
 */
const CARD_AVOID_IDS = ["rodape", "teste-sem-cadastro"] as const;

/**
 * true quando algum dos elementos de CARD_AVOID_IDS está na tela. Eles vêm de
 * next/dynamic, então os que ainda não estão no DOM são esperados.
 */
function useAvoidZonesInView(): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set<Element>();
    const watched = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      setInView(visible.size > 0);
    });
    let mo: MutationObserver | null = null;

    const watchFound = () => {
      CARD_AVOID_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && !watched.has(el)) {
          watched.add(el);
          io.observe(el);
        }
      });
      if (watched.size === CARD_AVOID_IDS.length) {
        mo?.disconnect();
        mo = null;
      }
    };

    watchFound();
    if (watched.size < CARD_AVOID_IDS.length) {
      mo = new MutationObserver(watchFound);
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      io.disconnect();
      mo?.disconnect();
    };
  }, []);

  return inView;
}

export const HeroComponent = () => {
  const avoidZoneInView = useAvoidZonesInView();
  // Com o foco num campo do card (digitando), ele não some nem fica inert.
  const [cardFocused, setCardFocused] = useState(false);
  const hideCard = avoidZoneInView && !cardFocused;

  // Um único cadastro para os dois botões (desktop e card do celular).
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("cadastro");
  // Remonta o modal a cada abertura (zera botão travado e formulário).
  const [signupKey, setSignupKey] = useState(0);

  // Volta do checkout AbacatePay: reabre o cadastro na tela certa. Também no
  // "voltar" do navegador que restaura a página do cache (bfcache), onde o
  // efeito de montagem não roda de novo e o modal ficaria no botão travado.
  useEffect(() => {
    const handleReturn = () => {
      const ret = consumeCheckoutReturn();
      if (!ret) return false;
      pushAgendaBelaMainEvent({ event: "checkout_returned", checkout_result: ret.result });
      setSignupStep(ret.step);
      setSignupKey((k) => k + 1);
      setSignupOpen(true);
      return true;
    };
    handleReturn();
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      // Sem volta a mostrar: fecha o modal para não ficar no botão travado.
      if (!handleReturn()) setSignupOpen(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Conta já criada nesta aba: não pede o cadastro de novo, volta à escolha.
  const startSignup = () => {
    setSignupStep(readSignupContext() ? "escolha" : "cadastro");
    setSignupKey((k) => k + 1);
    setSignupOpen(true);
  };

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

              {/* Botão desktop only — no celular fica no card fixo */}
              <div className="hidden md:flex flex-col gap-3 bg-white rounded-app-lg shadow-brand-md p-5 max-w-xl">
                <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-ink-muted">
                  Comece agora, é rápido
                </span>
                <SignupCtaButton ctaPosition="hero" onStart={startSignup} />
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
      {/* Some quando o rodapé ou a seção do simulador entram na tela, para não
          cobrir os selos das lojas nem o botão "Experimentar o Agenda Bela". */}
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
          <SignupCtaButton ctaPosition="sticky_mobile" onStart={startSignup} />
          <p className="font-inter text-[11px] leading-[15px] text-ink-muted text-center">
            {positiveDisclaimer}
          </p>
        </div>
      </div>

      {signupOpen && (
        <SignupModal
          key={signupKey}
          open={signupOpen}
          onOpenChange={setSignupOpen}
          initialStep={signupStep}
        />
      )}
    </>
  );
};
