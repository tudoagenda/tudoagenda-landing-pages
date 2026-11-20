import type { Viewport } from "next";
import { LANDING_LOJAS } from "@/config/landing-lojas";
import { LandingLojas, buildLojasMetadata } from "../_lojas/landing-lojas";
import { buildLojasStructuredData } from "../_lojas/structured-data";

const config = LANDING_LOJAS.appParaSalaoDeBeleza;

const title = "App para salão de beleza: agenda e lembretes | Agenda Bela";
const description =
  "Agenda Bela é o app de agenda para salão de beleza: lembra suas clientes no WhatsApp, recebe sinal no Pix e mostra o caixa. 7 dias grátis, sem cartão.";

export const metadata = buildLojasMetadata({
  config,
  title,
  description,
  index: true,
});

const structuredData = buildLojasStructuredData({ config, title, description });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AppParaSalaoDeBelezaPage() {
  return <LandingLojas config={config} structuredData={structuredData} />;
}
