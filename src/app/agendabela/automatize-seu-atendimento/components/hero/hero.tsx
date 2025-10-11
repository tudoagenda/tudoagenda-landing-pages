"use client";

import Image from "next/image";
import AgendabelaLogo from "../../assets/agendabela-logo.png";
import GifAgendamento from "../../assets/gif-agendamento.gif";
import { FormComponent } from "../form";
import { useState, useEffect } from "react";

export const HeroComponent = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <>
      <main
        id="teste-gratuitamente"
        className="flex flex-col w-full bg-purple-900 md:p-20 p-6 items-center gap-20 md:gap-14"
      >
        <Image
          src={AgendabelaLogo}
          width={170}
          height={97}
          alt="AgendaBela logo"
        />
        <div className="flex flex-col text-center max-w-4xl items-center gap-4">
          <h1 className="md:text-5xl text-white text-4xl max-w-3xl font-bold">
            Automatize seu atendimento com o WhatsApp.
          </h1>
          <div className="flex flex-col text-purple-300 md:text-xl text-sm font-lexend">
            <p>
              Criamos o AgendaBela pra você automatizar seu atendimento e
              gerenciar melhor seu salão.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Image
              src={GifAgendamento}
              alt="Demonstração do sistema de agendamento"
              width={400}
              height={300}
              className="rounded-lg shadow-lg max-h-[450px] w-auto mx-auto"
            />
          </div>
          
        </div>

        {/* Form visível apenas no desktop */}
        {!isMobile && (
          <div className="flex flex-col gap-4 w-full max-w-2xl items-center">
            <FormComponent />
            <div className="md:text-xs text-[11px] font-lexend text-purple-500 text-center">
              <p>
                Teste nossa plataforma por 30 dias gratuitamente.{" "}
                <u>Não vamos te pedir nenhum dado de cartão de crédito agora.</u>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Form fixado na parte inferior apenas no mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-purple-900 p-4 border-t border-purple-700">
          <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
            <FormComponent />
            <div className="text-[11px] font-lexend text-purple-500 text-center">
              <p>
                Teste nossa plataforma por 30 dias gratuitamente.{" "}
                <u>Não vamos te pedir nenhum dado de cartão de crédito agora.</u>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
