/* eslint-disable @next/next/no-img-element */
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
  return (
    <>
      <a
        href="https://www.producthunt.com/posts/tudo-agenda-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tudo&#0045;agenda&#0045;2"
        target="_blank"
        className="right-10 bottom-10 z-50 md:fixed hidden md:block"
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=709488&theme=light"
          alt="Tudo&#0032;Agenda - Automatize&#0032;sua&#0032;agenda&#0044;&#0032;otimize&#0032;seu&#0032;tempo | Product Hunt"
          width={250}
          height={54}
        />
      </a>
      {children}
    </>
  );
}
