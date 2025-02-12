import { Button } from "../button";
import { LogoComponent } from "../logo";
import { Typography } from "../typography";

export const HeaderComponent = () => (
  <article className="flex flex-col items-start gap-16 sm:p-11 p-8">
    <LogoComponent color="white" width={72} height={72} />
    <section className="flex flex-col gap-6 max-w-6xl">
      <Typography as="h1">
        Pare de perder dinheiro fazendo tarefas automáticas no seu negócio.
      </Typography>
      <div className="flex flex-col gap-4">
        <Typography as="p" className="sm:text-2xl text-lg text-slate-400">
          O Tudo Agenda tem soluções de automação de atendimento, relacionamento
          com cliente, além de te dar uma ampla visão do seu fluxo de caixa,
          cadeia de suprimentos e mais.
        </Typography>
        <Typography as="p" className="sm:text-2xl text-lg text-slate-400">
          É muito mais que agenda. É Tudo Agenda.
        </Typography>
      </div>

      <div className="flex gap-4 mt-8">
        <Button href="#o-que-fazemos">Comece agora</Button>
      </div>
    </section>
  </article>
);
