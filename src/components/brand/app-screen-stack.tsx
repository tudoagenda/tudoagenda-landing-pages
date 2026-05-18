"use client";

import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// <AppScreenStack />
//
// Phone hero central (com scroll vertical infinito da home unificada) +
// 2 phones laterais com prints reais (agenda + financeiro), com float
// suave. Composição sênior — vende "produto polido" sem fade brusco.
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
          // Imagem mais alta que o frame: scroll vertical infinito suave
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
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Phone secundário — topo esquerdo: agenda semana */}
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
          src="/app-screens/agenda-semana.jpeg"
          alt="Agenda semanal do app"
          imageHeight="natural"
          className="h-full"
        />
      </div>

      {/* Phone central principal — dashboard completo com scroll */}
      <div className="relative z-20 w-[220px] sm:w-[240px] lg:w-[260px] aspect-[9/19.5]">
        <PhoneFrame
          src="/app-screens/dashboard-full.jpeg"
          alt="Tela principal do Agenda Bela com agenda do dia, estatísticas e ações"
          imageHeight="tall"
          className="h-full"
        />
      </div>

      {/* Phone secundário — base direita: financeiro */}
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
          src="/app-screens/financeiro-faturamento.jpeg"
          alt="Tela financeira com gráfico de receita"
          imageHeight="natural"
          className="h-full"
        />
      </div>
    </div>
  );
}

export default AppScreenStack;
