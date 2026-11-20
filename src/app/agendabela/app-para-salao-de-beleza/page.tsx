import type { Viewport } from "next";
import { LANDING_LOJAS } from "@/config/landing-lojas";
import { LandingLojas, buildLojasMetadata } from "../_lojas/landing-lojas";

const config = LANDING_LOJAS.appParaSalaoDeBeleza;

export const metadata = buildLojasMetadata({
  config,
  title: "App para salão de beleza: agenda e lembretes | Agenda Bela",
  description:
    "Baixe o Agenda Bela, o app de agenda para salão de beleza: avisa suas clientes no WhatsApp e lembra dos horários. 7 dias grátis, sem cartão.",
  index: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AppParaSalaoDeBelezaPage() {
  return <LandingLojas config={config} />;
}
