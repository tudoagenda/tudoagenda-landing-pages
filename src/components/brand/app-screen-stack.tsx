"use client";

import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// <AppScreenStack />
//
// Composição visual do hero: phone central (dashboard com scroll vertical) +
// 2 phones laterais com float suave + rotação. Sequência decidida pelo
// fundador (2026-05-18):
//   1. Centro: dashboard inicial completo (scroll vertical loop)
//   2. Esquerda: agenda do dia (lista dos agendamentos)
//   3. Direita: tela de criar novo agendamento
// (Financeiro saiu do hero — já aparece nas seções abaixo.)
// ─────────────────────────────────────────────────────────────────────────────

interface PhoneProps {
  src: string;
  alt: string;
  imageHeight: "natural" | "tall";
  className?: string;
  style?: React.CSSProperties;
}

function PhoneFrame({
  src,
  alt,
  imageHeight,
  className = "",
  style,
}: PhoneProps) {
  return (
    <div
      className={`relative rounded-[36px] bg-brand-petroleo shadow-brand-lg p-2 ${className}`}
      style={style}
    >
      <div className="relative h-full w-full rounded-[28px] overflow-hidden bg-surface-subtle">
        {imageHeight === "tall" ? (
          <div className="absolute inset-0">
            <div className="screen-scroll relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 220px, 280px"
                className="object-cover object-top !h-auto"
                style={{ aspectRatio: "626/1685" }}
                priority
              />
            </div>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 180px, 200px"
            className="object-cover object-top"
            priority
          />
        )}
      </div>
    </div>
  );
}

export function AppScreenStack() {
  return (
    // Mobile: só o phone central, encostado à direita com respiro controlado.
    // sm+: volta a composição triangular com os 2 laterais flutuando.
    <div className="relative w-full h-full flex items-center justify-end sm:justify-center pr-2 sm:pr-0">
      {/* Phone esquerdo — agenda do dia (só sm+: profundidade lateral) */}
      <div
        className="absolute left-0 lg:left-4 top-2 z-10 w-[140px] sm:w-[160px] lg:w-[180px] aspect-[9/19] animate-float-soft hidden sm:block"
        style={
          {
            "--card-rotate": "-8deg",
            animationDelay: "0s",
          } as React.CSSProperties
        }
      >
        <PhoneFrame
          src="/app-screens/agenda-dia.jpeg"
          alt="Tela de agenda do dia com horários"
          imageHeight="natural"
          className="h-full"
        />
      </div>

      {/* Phone central — dashboard completo com scroll vertical (peça-chave) */}
      <div className="relative z-20 w-[200px] sm:w-[240px] lg:w-[260px] aspect-[9/19.5]">
        <PhoneFrame
          src="/app-screens/dashboard-full.jpeg"
          alt="Tela inicial do Agenda Bela com agenda do dia e estatísticas"
          imageHeight="tall"
          className="h-full"
        />
      </div>

      {/* Phone direito — novo agendamento (só sm+: profundidade lateral) */}
      <div
        className="absolute right-0 lg:right-2 bottom-2 z-10 w-[140px] sm:w-[160px] lg:w-[180px] aspect-[9/19] animate-float-soft hidden sm:block"
        style={
          {
            "--card-rotate": "8deg",
            animationDelay: "1.5s",
          } as React.CSSProperties
        }
      >
        <PhoneFrame
          src="/app-screens/agenda-mes.jpeg"
          alt="Tela de calendário mensal com agendamentos marcados"
          imageHeight="natural"
          className="h-full"
        />
      </div>
    </div>
  );
}

export default AppScreenStack;
