import fs from "fs";
import path from "path";
import jsQR from "jsqr";
import { LANDING_LOJAS } from "@/config/landing-lojas";

/**
 * O QR do computador é um arquivo estático. Este teste desenha o SVG em
 * pixels e decodifica: se alguém trocar o slug da rota ou o arquivo, falha.
 */
const SITE_URL = "https://tudoagenda.com.br";
const PX = 8; // pixels por módulo
const QUIET = 4; // margem branca em módulos, exigida pelo leitor

/** Lê o <path> do SVG (traços horizontais de 1 módulo) e devolve os módulos escuros. */
function modulosEscuros(svg: string): { size: number; dark: Set<string> } {
  const size = Number(svg.match(/width="(\d+)"/)?.[1]) / PX;
  const d = svg.match(/ d="([^"]+)"/)?.[1] ?? "";
  const dark = new Set<string>();
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([Mmh])([^Mmh]*)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number);
    if (cmd === "M") [x, y] = n;
    else if (cmd === "m") {
      x += n[0];
      y += n[1];
    } else {
      for (let i = 0; i < n[0]; i++) dark.add(`${x + i},${Math.floor(y)}`);
      x += n[0];
    }
  }
  return { size, dark };
}

function decodificar(svg: string): string | undefined {
  const { size, dark } = modulosEscuros(svg);
  const lado = (size + QUIET * 2) * PX;
  const pixels = new Uint8ClampedArray(lado * lado * 4).fill(255);
  for (const modulo of dark) {
    const [mx, my] = modulo.split(",").map(Number);
    for (let py = 0; py < PX; py++) {
      for (let px = 0; px < PX; px++) {
        const i =
          (((my + QUIET) * PX + py) * lado + (mx + QUIET) * PX + px) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
      }
    }
  }
  return jsQR(pixels, lado, lado)?.data;
}

describe.each(Object.values(LANDING_LOJAS))(
  "QR do computador de $slug",
  (config) => {
    it("abre a própria rota com ?ref=qr_desktop", () => {
      const svg = fs.readFileSync(
        path.join(__dirname, `../assets/qr-${config.slug}.svg`),
        "utf8",
      );
      expect(decodificar(svg)).toBe(
        `${SITE_URL}${config.path}?ref=qr_desktop`,
      );
    });
  },
);
