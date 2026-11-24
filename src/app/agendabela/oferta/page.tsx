import type { Viewport } from "next";
import { LANDING_LOJAS } from "@/config/landing-lojas";
import { LandingLojas, buildLojasMetadata } from "../_lojas/landing-lojas";
import "../_lojas/oferta.css";

const config = LANDING_LOJAS.oferta;
const { percentual, meses } = config.oferta;

/* Página de campanha: noindex e fora do sitemap, com canonical própria, como
   a Black Friday. Sem JSON-LD: página fora do índice não leva dado
   estruturado. Sem valor em reais nem data no title e na description: o HTML
   fica em cache e o valor é o que a loja mostrar. */
export const metadata = buildLojasMetadata({
  config,
  title: `Oferta Agenda Bela: ${percentual}% nos ${meses} primeiros meses`,
  description: `Oferta Agenda Bela: ${percentual}% de desconto nos ${meses} primeiros meses para quem assina pela primeira vez, pelo app. Baixe no iPhone ou Android e teste 7 dias, sem cartão.`,
  index: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function OfertaPage() {
  return <LandingLojas config={config} />;
}
