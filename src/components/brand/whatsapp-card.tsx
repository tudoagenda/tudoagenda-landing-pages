"use client";

import { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// <WhatsAppCard />
//
// Versão configurável e mais compacta do WhatsAppPreview pra usar dentro dos
// cards de feature. Aceita props pra customizar contato, avatar e mensagens.
// Mensagens são SEMPRE recebidas (bubble branca à esquerda) — fluxo unilateral
// do produto. Sem input no rodapé (não cabe no card pequeno).
// ─────────────────────────────────────────────────────────────────────────────

export interface WhatsAppMessage {
  text: ReactNode;
  time: string;
  delay?: string;
}

interface WhatsAppCardProps {
  contact: string;
  avatarInitial: string;
  messages: WhatsAppMessage[];
  width?: number;
}

export function WhatsAppCard({
  contact,
  avatarInitial,
  messages,
  width = 240,
}: WhatsAppCardProps) {
  return (
    <div
      className="rounded-[14px] overflow-hidden shadow-brand-md bg-white"
      style={{ width }}
    >
      {/* Header WhatsApp */}
      <div className="flex items-center gap-2 bg-[#075E54] px-2.5 py-2">
        <span className="text-white text-[13px] leading-none">‹</span>
        <div className="h-6 w-6 rounded-full bg-brand-rosa-claro flex items-center justify-center text-brand-petroleo font-fraunces italic text-[10px] font-semibold">
          {avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[11px] font-semibold text-white leading-tight truncate">
            {contact}
          </p>
          <p className="font-inter text-[8.5px] text-white/70 leading-tight">
            online
          </p>
        </div>
      </div>

      {/* Background chat WhatsApp */}
      <div
        className="px-2.5 py-3 flex flex-col gap-1.5"
        style={{
          backgroundColor: "#ECE5DD",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 28px 28px",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="wa-msg-in self-start max-w-[90%] rounded-[7px] rounded-tl-[2px] bg-white px-2 py-1.5"
            style={{
              animationDelay: msg.delay ?? `${0.3 + idx * 0.6}s`,
              boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
            }}
          >
            <div className="font-inter text-[10.5px] leading-[14px] text-[#111B21]">
              {msg.text}
            </div>
            <span className="block text-right font-inter text-[8px] text-[#667781] mt-0.5">
              {msg.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhatsAppCard;
