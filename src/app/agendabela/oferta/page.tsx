import type { Viewport } from "next";
import { LANDING_LOJAS } from "@/config/landing-lojas";
import { LandingLojas, buildLojasMetadata } from "../_lojas/landing-lojas";
import "../_lojas/oferta.css";

const config = LANDING_LOJAS.oferta;
const { percentual, meses, cupom } = config.oferta;

/* Página de campanha: noindex e fora do sitemap, com canonical própria, como
   a Black Friday. Sem JSON-LD: página fora do índice não leva dado
   estruturado. Sem valor em reais nem data no title e na description (o HTML
   e a prévia do link ficam em cache). O desconto não é automático: title e
   description dizem que ele vem com o cupom, que sai da config. */
export const metadata = buildLojasMetadata({
  config,
  title: `Oferta Agenda Bela: ${percentual}% nos ${meses} primeiros meses com o cupom ${cupom}`,
  description: `Oferta Agenda Bela: use o cupom ${cupom} e tenha ${percentual}% de desconto nos ${meses} primeiros meses, na primeira assinatura pelo app. Baixe no iPhone ou Android e teste 7 dias, sem cartão.`,
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
