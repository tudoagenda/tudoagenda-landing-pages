import Image from "next/image";
import AgendabelaLogo from "../../assets/agendabela-logo.png";
import { FormComponent } from "../form";

export const HeroComponent = () => {
  return (
    <main
      id="teste-gratuitamente"
      className="flex flex-col w-full bg-purple-900 md:p-20 p-6 items-center gap-14"
    >
      <Image
        src={AgendabelaLogo}
        width={170}
        height={97}
        alt="AgendaBela logo"
      />
      <div className="flex flex-col text-center max-w-4xl items-center gap-4">
        <h1 className="md:text-5xl text-white text-4xl max-w-3xl font-bold">
          Automatize seu atendimento sem dores de cabeça.
        </h1>
        <div className="flex flex-col text-purple-300 md:text-xl text-sm font-lexend">
          <p>Nós somos experts em tecnologia. Você não precisa ser.</p>
          <p>
            Criamos o AgendaBela pra você automatizar seu atendimento e
            gerenciar melhor seu salão.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-2xl items-center">
        <FormComponent />
        <div className="md:text-xs text-[11px] font-lexend text-purple-500 text-center">
          <p>
            Teste nossa plataforma por 30 dias gratuitamente.{" "}
            <u>Não vamos te pedir nenhum dado de cartão de crédito agora.</u>
          </p>
        </div>
      </div>
    </main>
  );
};
