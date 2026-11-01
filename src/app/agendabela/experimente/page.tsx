import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Space_Mono } from "next/font/google";
import { EXPERIMENTE_MARKUP } from "./_prototipo/markup";
import { ExperimenteRuntime } from "./experimente-runtime";
import "./experimente.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // Sem o "Inter Fallback" (Arial ajustada): glifos que o Inter não tem, como
  // "→", caem no system-ui igual ao protótipo.
  adjustFontFallback: false,
  variable: "--font-inter",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-space-mono",
});

const pageUrl = "https://tudoagenda.com.br/agendabela/experimente";
const title = "Experimente o Agenda Bela";
const description =
  "Experimente o Agenda Bela: teste as telas do app com clientes de exemplo, sem criar conta. Nada é enviado.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: pageUrl },
  icons: {
    icon: [
      {
        url: "/images/experimente/agenda-bela-icone.png",
        type: "image/png",
        sizes: "256x256",
      },
    ],
    apple: [{ url: "/images/experimente/agenda-bela-icone.png" }],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ExperimentePage() {
  return (
    <>
      <div
        className={`ab-exp ${fraunces.variable} ${inter.variable} ${spaceMono.variable}`}
        dangerouslySetInnerHTML={{ __html: EXPERIMENTE_MARKUP }}
      />
      <ExperimenteRuntime />
    </>
  );
}
