import { Button } from "@/components/ui/button";
import { StepComponent } from "../step";
import Link from "next/link";

export const AboutComponent = () => {
  return (
    <article className="flex flex-col w-full md:p-12 p-6 items-center gap-10 md:gap-20">
      <h2 className="text-purple-950 font-bold text-3xl md:text-4xl text-center md:text-left">
        Saia na frente dos outros salões em 3 passos:
      </h2>
      <section className="flex flex-col md:flex-row w-full max-w-7xl justify-between gap-8">
        <StepComponent step="Step1" />
        <StepComponent step="Step2" />
        <StepComponent step="Step3" />
      </section>
      <Button asChild variant="agendabela-accent" size="lg">
        <Link href="#teste-gratuitamente">Teste Gratuitamente</Link>
      </Button>
    </article>
  );
};
