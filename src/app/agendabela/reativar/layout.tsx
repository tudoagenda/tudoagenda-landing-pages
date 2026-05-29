import { Metadata } from "next";

const pageUrl = "https://tudoagenda.com.br/agendabela/reativar";
const title = "Reative sua conta | Agenda Bela";
const description =
  "O Agenda Bela agora virou app. Reative sua conta, mantenha seus dados antigos e teste grátis por 30 dias. Você não será cobrada hoje.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/agendabela/reativar",
  },
  robots: {
    index: false, // LP de campanha — não indexar
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    siteName: "Agenda Bela",
    title,
    description,
    images: [
      {
        url: "/brand/agenda-bela/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Agenda Bela — Reative sua conta",
      },
    ],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
