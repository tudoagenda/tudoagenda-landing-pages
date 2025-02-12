import { Typography } from "../typography";
import Image from "next/image";

export const AboutComponent = () => {
  return (
    <div
      className="flex flex-col p-8 sm:p-11 gap-8 bg-slate-500 items-center"
      id="o-que-fazemos"
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/tudoagenda_logo_white.svg"
          width={32}
          height={32}
          alt="Tudo Agenda logo"
        />
        <Typography as="h2" className="text-white">
          O que fazemos
        </Typography>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
        <Typography as="p" className="text-center">
          O Tudo Agenda é a primeira startup do Brasil a oferecer soluções
          completas de automação de atendimento e também gestão de negócios
          completamente focadas em cada segmento.
        </Typography>
        <Typography as="p" className="text-center">
          Seu negócio é único e merece uma plataforma que atenda suas
          necessidades de forma personalizada e, por isso, criamos soluções
          focadas em cada tipo de negócio para atender cada especifidade dele. E
          acreditamos que a tecnologia pode ser uma grande aliada para otimizar
          o tempo e aumentar a produtividade.
        </Typography>
        <Typography as="p" className="text-center">
          Do atendimento ao seu cliente pelo WhatsApp até os gráficos dos
          indicadores principais do seu negócio, cada solução foi pensada para
          facilitar a sua rotina, te ajudar a crescer e ganhar mais dinheiro!
        </Typography>
      </div>
    </div>
  );
};
