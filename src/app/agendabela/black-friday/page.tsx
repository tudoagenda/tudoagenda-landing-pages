import type { Viewport } from "next";
import { LANDING_LOJAS } from "@/config/landing-lojas";
import { LandingLojas, buildLojasMetadata } from "../_lojas/landing-lojas";

const config = LANDING_LOJAS.blackFriday;

/* Página de campanha: noindex e fora do sitemap, como reativar e
   lista-de-espera. Sem desconto: o tema é só visual. */
export const metadata = buildLojasMetadata({
  config,
  title: "Black Friday no Agenda Bela: a Bela cuida da sua agenda",
  description:
    "Nesta Black Friday o preço é o de sempre: R$ 59,90 por mês. A Bela lembra suas clientes enquanto você atende. Baixe o app no iPhone ou no Android.",
  index: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function BlackFridayPage() {
  return <LandingLojas config={config} />;
}
