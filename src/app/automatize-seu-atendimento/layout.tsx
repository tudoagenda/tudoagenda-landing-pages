import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgendaBela | Atendimento automatizado para o seu salão",
  description:
    "Nunca mais perca um cliente por não responder o WhatsApp. Conheça o AgendaBela: automação de atendimento e gestão completa do seu salão.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
