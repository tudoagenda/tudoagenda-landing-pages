import { Fraunces, Inter, Space_Mono } from "next/font/google";

/* Fontes do app, como no Experimente. Fraunces só em itálico: é o que o
   protótipo carrega (todo título da página é itálico). */
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

export const inter = Inter({
  subsets: ["latin"],
  // Só os pesos do protótipo: o relógio do celular desenhado pede 300 e deve
  // cair no 400, como lá.
  weight: ["400", "500", "600", "700"],
  display: "swap",
  // Sem o "Inter Fallback" (Arial ajustada): glifos que o Inter não tem, como
  // "→", caem no system-ui igual ao protótipo.
  adjustFontFallback: false,
  variable: "--font-inter",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-space-mono",
});
