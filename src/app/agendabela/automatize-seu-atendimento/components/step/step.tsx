import { Store, Smartphone, UsersRound } from "lucide-react";
import { JSX } from "react";

type Step = "Step1" | "Step2" | "Step3";

type StepDescription = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const stepDescription: Record<Step, StepDescription> = {
  Step1: {
    icon: <Store size="32" color="#A855F7" />,

    title: "1 Configure seu salão",
    description:
      "Talvez você já conheceu outras plataformas onde, pra configurar o seu salão, era quase que um exercício de matemática. O AgendaBela não é assim. Simples e rápido, com tutoriais em vídeo, você vai conseguir configurar o seu salão em 5 minutos!",
  },
  Step2: {
    icon: <Smartphone size="32" color="#A855F7" />,

    title: "2 Peça seu atendente virtual",
    description:
      "Sim, nós vamos criar um atendente virtual para você no WhatsApp. Mas não se preocupe, você não vai perder o seu número atual. Nós criamos um novo número para o seu atendente virtual. Seus clientes podem interagir com ele e, com poucos cliques, serem atendidos rapidamente.",
  },
  Step3: {
    icon: <UsersRound size="32" color="#A855F7" />,

    title: "3 Agora é só falar para seus clientes",
    description:
      "Configure uma mensagem automática no seu WhatsApp atual para redirecionar seus clientes para serem atendidos pelo atendente virtual. Nós te ajudamos com isso também, não se preocupe. Pronto! É só isso mesmo. Seu salão já está na frente de 90% dos outros salões.",
  },
};

type StepComponentProps = {
  step: Step;
};

export const StepComponent = ({ step }: StepComponentProps) => {
  const { description, icon, title } = stepDescription[step];
  return (
    <div className="flex flex-col w-full max-w-sm gap-2">
      {icon}
      <h3 className="text-purple-950 font-bold text-lg">{title}</h3>
      <p className="text-purple-950 text-base">{description}</p>
    </div>
  );
};
