import { Metadata } from "next";

const pageUrl = "https://tudoagenda.com.br/agendabela/lista-de-espera";
const title = "Agenda Bela | Entre na lista de espera";
const description =
  "O Agenda Bela, a secretária digital para salões de beleza, está chegando. Deixe seu nome e WhatsApp e seja uma das primeiras a usar no lançamento.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/agendabela/lista-de-espera",
  },
  robots: {
    index: false, // LP de campanha (pré-lançamento) — não indexar
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
        alt: "Agenda Bela — Entre na lista de espera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/brand/agenda-bela/social-preview.png"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
