import type { Metadata } from "next";
import type { LandingLojasConfig } from "@/config/landing-lojas";
import santanderX from "@/app/agendabela/automatize-seu-atendimento/assets/santander-x.png";
import foundersClub from "@/app/agendabela/automatize-seu-atendimento/assets/founders-club.png";
import logoApp from "./assets/logo-app.png";
import qrAppParaSalaoDeBeleza from "./assets/qr-app-para-salao-de-beleza.svg";
import qrBlackFriday from "./assets/qr-black-friday.svg";
import qrOferta from "./assets/qr-oferta.svg";
import { fraunces, inter, spaceMono } from "./fonts";
import { LojasRuntime } from "./lojas-runtime";
import { buildLojasMarkup } from "./markup";
import "./lojas.css";

const SITE_URL = "https://tudoagenda.com.br";

/** QR do computador: abre a própria rota no celular com ?ref=qr_desktop. */
const QR_BY_SLUG = {
  "app-para-salao-de-beleza": qrAppParaSalaoDeBeleza,
  "black-friday": qrBlackFriday,
  oferta: qrOferta,
} as const;

/** Metadata comum às landings de loja; cada rota passa título, descrição e indexação. */
export function buildLojasMetadata({
  config,
  title,
  description,
  index,
}: {
  config: LandingLojasConfig;
  title: string;
  description: string;
  index: boolean;
}): Metadata {
  const url = `${SITE_URL}${config.path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Ícone do app na aba, como no Experimente.
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
    ...(index ? {} : { robots: { index: false } }),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url,
      siteName: "Agenda Bela",
      title,
      description,
      images: [
        {
          url: "/brand/agenda-bela/social-preview-demo.png",
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
      images: ["/brand/agenda-bela/social-preview-demo.png"],
    },
  };
}

/**
 * Página de loja do Agenda Bela. Uma página só para as três rotas: a config
 * diz o slug (medição), o tema e a validade dele, e a oferta. O HTML vem pronto do
 * servidor (funciona sem JavaScript, com os dois selos); LojasRuntime liga
 * animações, links das lojas e eventos.
 */
export function LandingLojas({
  config,
  structuredData,
}: {
  config: LandingLojasConfig;
  /** JSON-LD da rota (structured-data.ts). Só a rota indexável passa. */
  structuredData?: object;
}) {
  const html = buildLojasMarkup({
    slug: config.slug,
    tema: config.tema,
    temaExpiraEm: config.temaExpiraEm,
    refSimulador: config.refSimulador,
    oferta: config.oferta,
    assets: {
      logo: logoApp.src,
      qr: QR_BY_SLUG[config.slug].src,
      santanderX: santanderX.src,
      foundersClub: foundersClub.src,
    },
    ano: new Date().getFullYear(),
  });
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {/* O script em linha grava data-os/data-tema em #lp antes da hidratação:
          o HTML deixa de bater com a string de propósito. */}
      <div
        suppressHydrationWarning
        className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <LojasRuntime slug={config.slug} />
    </>
  );
}
