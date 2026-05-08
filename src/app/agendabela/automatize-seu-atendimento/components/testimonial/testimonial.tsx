"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";

export const TestimonialComponent = () => {
  return (
    <div className="flex flex-col w-full p-10 gap-16 items-center">
      <div className="flex flex-col w-full max-w-3xl text-center gap-4 items-center">
        <p className="text-2xl text-purple-950">
          ”O Agenda Bela facilitou muito o dia-a-dia aqui no salão. Agora eu
          consigo gerenciar a minha agenda e ter uma visão muito melhor do meu
          trabalho por aqui”
        </p>
        <p className="text-lg font-semibold text-purple-950">
          MARIA JOANA, PROPRIETÁRIA DO SALÃO PARIS
        </p>
      </div>
      <Button asChild variant="agendabela-accent" size="lg">
        <Link
          href="#teste-gratuitamente"
          onClick={() =>
            pushAgendaBelaMainEvent({
              event: "lp_cta_clicked",
              cta_position: "testimonial",
              cta_intent: "primary",
            })
          }
        >
          Teste Gratuitamente
        </Link>
      </Button>
    </div>
  );
};
