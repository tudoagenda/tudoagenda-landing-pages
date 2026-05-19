import Image from "next/image";

import SantanderX from "@/app/agendabela/automatize-seu-atendimento/assets/santander-x.png";
import FoundersClub from "@/app/agendabela/automatize-seu-atendimento/assets/founders-club.png";

// Bloco de prova social institucional — Santander X + Founders Club.
// Posição estratégica: depois dos depoimentos e antes do footer.
// Valida o risco de assinar uma empresa nova ("apoiada por X").
export const TrustComponent = () => {
  return (
    <section className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 border-t border-surface-alt-border pt-12 md:pt-14">
        <span className="font-mono-brand text-[10px] tracking-[2px] uppercase text-brand-vinho">
          Apoiado por
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-14">
          <Image
            src={SantanderX}
            width={180}
            height={24}
            alt="Santander X"
            className="h-auto opacity-70 hover:opacity-100 transition-opacity"
          />
          <Image
            src={FoundersClub}
            width={120}
            height={68}
            alt="Founders Club"
            className="h-auto opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </section>
  );
};
