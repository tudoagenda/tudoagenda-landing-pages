"use client";

// ─────────────────────────────────────────────────────────────────────────────
// <WhatsAppPreview />
//
// Chat WhatsApp aberto do CLIENTE recebendo mensagens do salão. Apenas
// mensagens RECEBIDAS (bubbles brancas à esquerda) — fiel ao produto real:
// o cliente só recebe avisos, não responde nada.
//
// Cores oficiais WhatsApp: header #075E54, bg #ECE5DD com pattern,
// bubbles incoming brancas. Animação: mensagens entram em sequência.
// ─────────────────────────────────────────────────────────────────────────────

export function WhatsAppPreview() {
  return (
    <div className="w-[260px] rounded-[18px] overflow-hidden shadow-brand-lg bg-white">
      {/* Header WhatsApp */}
      <div className="flex items-center gap-2.5 bg-[#075E54] px-3 py-2.5">
        <span className="text-white text-[16px] leading-none">‹</span>
        <div className="h-7 w-7 rounded-full bg-brand-rosa-claro flex items-center justify-center text-brand-petroleo font-fraunces italic text-[11px] font-semibold">
          SE
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[12.5px] font-semibold text-white leading-tight truncate">
            Salão Estilo
          </p>
          <p className="font-inter text-[9.5px] text-white/70 leading-tight">
            online
          </p>
        </div>
        <span className="text-white/80 text-[12px]">⋮</span>
      </div>

      {/* Background da conversa — bege padrão WhatsApp com pattern */}
      <div
        className="relative px-3 py-4 flex flex-col gap-2 min-h-[260px]"
        style={{
          backgroundColor: "#ECE5DD",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at 45% 80%, rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 32px 32px, 20px 20px",
        }}
      >
        {/* Tag de data */}
        <div className="flex justify-center mb-1">
          <span className="bg-white/90 rounded-md px-2 py-0.5 font-inter text-[9.5px] text-[#54656F]">
            HOJE
          </span>
        </div>

        {/* Bubble 1 — confirmação no momento do agendamento */}
        <div
          className="wa-msg-in self-start max-w-[88%] rounded-[8px] rounded-tl-[2px] bg-white px-2.5 py-1.5"
          style={{
            animationDelay: "0.4s",
            boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
          }}
        >
          <p className="font-inter text-[12px] leading-[17px] text-[#111B21]">
            Oi Camila! ✨ Seu agendamento foi confirmado:
          </p>
          <p className="font-inter text-[12px] leading-[17px] text-[#111B21] font-semibold mt-1">
            Manicure com Paula
            <br />
            amanhã (sex), 15h
          </p>
          <p className="font-inter text-[11.5px] leading-[16px] text-[#111B21] mt-1.5">
            Te esperamos! 💜
          </p>
          <span className="block text-right font-inter text-[9px] text-[#667781] mt-0.5">
            14:32
          </span>
        </div>

        {/* Bubble 2 — lembrete no dia */}
        <div
          className="wa-msg-in self-start max-w-[88%] rounded-[8px] rounded-tl-[2px] bg-white px-2.5 py-1.5"
          style={{
            animationDelay: "1.6s",
            boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
          }}
        >
          <p className="font-inter text-[12px] leading-[17px] text-[#111B21]">
            🔔 Bom dia, Camila!
          </p>
          <p className="font-inter text-[12px] leading-[17px] text-[#111B21] mt-1">
            Lembrando que hoje você tem horário às <strong>15h</strong> com a
            Paula.
          </p>
          <span className="block text-right font-inter text-[9px] text-[#667781] mt-0.5">
            07:00
          </span>
        </div>
      </div>

      {/* Footer input fake — não interativo */}
      <div className="flex items-center gap-2 bg-[#F0F2F5] px-2 py-1.5">
        <div className="flex-1 rounded-full bg-white h-7 px-3 flex items-center">
          <span className="font-inter text-[10.5px] text-[#667781]">
            Mensagem
          </span>
        </div>
        <div className="h-7 w-7 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[11px]">
          🎤
        </div>
      </div>
    </div>
  );
}

export default WhatsAppPreview;
