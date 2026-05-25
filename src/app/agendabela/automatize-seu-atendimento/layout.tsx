import { Metadata } from "next";

const pageUrl = "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento";
const title = "Agenda Bela | Secretária digital para salões de beleza";
const description =
  "Agenda Bela é a secretária digital para salões de beleza: confirma agendamentos no WhatsApp, envia lembretes e organiza a agenda do dia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/agendabela/automatize-seu-atendimento",
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
        alt: "Logo do Agenda Bela e telas atuais do app",
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
