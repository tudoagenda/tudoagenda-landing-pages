"use client";

// ─────────────────────────────────────────────────────────────────────────────
// <DashboardOverlay />
//
// Overlay HTML/CSS por cima da imagem `dashboard-full.jpeg` pra mostrar dados
// fake convincentes (R$ 1.240,00, 6 agendamentos, 72% ocupação, etc.) sem
// editar o PNG/JPEG. Usa Fraunces italic e Inter via tokens — fica pixel-fiel
// e respeita responsividade.
//
// Cada overlay é posicionado em PERCENTUAL relativo ao container, então
// funciona em qualquer tamanho de phone frame (180px, 240px, 280px).
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardOverlay() {
  return (
    <>
      {/* Cobre "R$ 0,00" do hero card com creme e escreve "R$ 1.240,00" */}
      <div
        className="absolute bg-brand-creme"
        style={{ left: "3.5%", top: "11.5%", right: "8%", height: "7%" }}
      />
      <div
        className="absolute font-fraunces italic text-ink"
        style={{
          left: "4%",
          top: "11.4%",
          fontSize: "calc(min(8vw, 8.2%) * 0.9)",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        <span style={{ fontSize: "5.8cqw" }}>R$ 1.240,00</span>
      </div>

      {/* Cobre os 2 badges originais + reescreve */}
      <div
        className="absolute bg-brand-creme"
        style={{ left: "3.5%", top: "18.6%", right: "8%", height: "3%" }}
      />
      {/* Badge verde "6 agendamentos" */}
      <div
        className="absolute inline-flex items-center gap-1 rounded-full bg-emerald-100/80 text-emerald-700 font-inter font-semibold"
        style={{
          left: "4%",
          top: "18.7%",
          fontSize: "2.3cqw",
          paddingLeft: "2.5%",
          paddingRight: "2.5%",
          paddingTop: "0.5%",
          paddingBottom: "0.5%",
        }}
      >
        <span
          className="inline-block rounded-full bg-emerald-600"
          style={{ width: "1.2cqw", height: "1.2cqw" }}
        />
        6 agendamentos
      </div>
      {/* Badge branco "Próximo às 14:30" */}
      <div
        className="absolute rounded-full bg-white text-ink font-inter font-semibold"
        style={{
          left: "39%",
          top: "18.7%",
          fontSize: "2.3cqw",
          paddingLeft: "3%",
          paddingRight: "3%",
          paddingTop: "0.5%",
          paddingBottom: "0.5%",
          boxShadow: "0 1px 2px rgba(33,55,69,0.04)",
        }}
      >
        Próximo às 14:30
      </div>

      {/* STATS GRID 2x2 — cobre números antigos e reescreve */}
      {/* Card 1: AGENDADOS → 6 */}
      <div
        className="absolute bg-white"
        style={{ left: "5%", top: "27.2%", width: "38%", height: "4.5%" }}
      />
      <div
        className="absolute font-fraunces italic text-ink leading-none"
        style={{ left: "5.5%", top: "27.4%", fontSize: "4.8cqw" }}
      >
        6
      </div>
      {/* Card 1 sub: "nenhum hoje" → "hoje" */}
      <div
        className="absolute bg-white"
        style={{ left: "5%", top: "30.9%", width: "38%", height: "2.2%" }}
      />
      <div
        className="absolute font-inter text-ink-muted"
        style={{ left: "5.5%", top: "31%", fontSize: "1.8cqw" }}
      >
        hoje
      </div>

      {/* Card 2: HORÁRIOS LIVRES → 2h */}
      <div
        className="absolute bg-white"
        style={{ left: "53%", top: "27.2%", width: "38%", height: "4.5%" }}
      />
      <div
        className="absolute font-fraunces italic text-ink leading-none"
        style={{ left: "53.5%", top: "27.4%", fontSize: "4.8cqw" }}
      >
        2h
      </div>

      {/* Card 3: OCUPAÇÃO → 72% */}
      <div
        className="absolute bg-white"
        style={{ left: "5%", top: "36.5%", width: "38%", height: "4.5%" }}
      />
      <div
        className="absolute font-fraunces italic text-ink leading-none"
        style={{ left: "5.5%", top: "36.7%", fontSize: "4.8cqw" }}
      >
        72%
      </div>

      {/* Card 4: TICKET MÉDIO → R$ 207 */}
      <div
        className="absolute bg-white"
        style={{ left: "53%", top: "36.5%", width: "38%", height: "4.5%" }}
      />
      <div
        className="absolute font-fraunces italic text-ink leading-none"
        style={{ left: "53.5%", top: "36.7%", fontSize: "4cqw" }}
      >
        R$ 207
      </div>
    </>
  );
}

export default DashboardOverlay;
