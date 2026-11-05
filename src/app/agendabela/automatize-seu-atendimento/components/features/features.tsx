"use client";

import Image from "next/image";
import { WhatsAppCard } from "@/components/brand/whatsapp-card";
import {
  CLIENT_REMINDER_BUTTONS,
  CLIENT_REMINDER_TIME,
  ClientReminderText,
} from "@/components/brand/client-reminder";

// ─────────────────────────────────────────────────────────────────────────────
// <FeaturesComponent />
//
// "O que a Bela faz por você" — 4 cards com features reais.
// Mobile-first: stack vertical, cards full-width. Desktop 2x2.
//
// Mockups variam por feature:
//   - Confirmação no WhatsApp: simulação da mensagem que a cliente recebe
//   - Toda manhã: push da dona (bom-dia 07:30 + "{nome} confirmou ✅") e o
//     lembrete da cliente (07:00) com os botões Confirmar/Remarcar/Cancelar
//   - Agenda do dia: phone com dashboard real do app (sem zoom/desfoque)
//   - Fluxo de caixa: phone com o caixa do dia
// ─────────────────────────────────────────────────────────────────────────────

const confirmacaoCliente = [
  {
    text: (
      <>
        Oi Camila! ✨ Seu agendamento foi confirmado:
        <br />
        <strong>Manicure com Paula</strong>
        <br />
        amanhã (sex), 15h
      </>
    ),
    time: "14:32",
    delay: "0.4s",
  },
];

const lembreteCliente = [
  {
    text: <ClientReminderText />,
    time: CLIENT_REMINDER_TIME,
    delay: "0.4s",
    buttons: CLIENT_REMINDER_BUTTONS,
  },
];

// Push que a dona recebe no celular. Textos no formato do backend
// (push-messages.ts: bom-dia V1, de 4+ horários, das 07:30 e
// CLIENT_CONFIRMED), com nomes de exemplo.
const avisosDona = [
  {
    time: "07:30",
    title: "Bom dia, Paula! Hoje são 5 atendimentos",
    body: "Já lembrei as 5 clientes. A primeira é Maria, às 9h. Bom trabalho 💜",
  },
  {
    time: "08:12",
    title: "Camila confirmou ✅",
    body: "Manicure hoje às 15h. Pode atender tranquila.",
  },
];

function PushNotificationStack({ width = 232 }: { width?: number }) {
  return (
    <div className="flex flex-col gap-2" style={{ width }}>
      {avisosDona.map((n, idx) => (
        <div
          key={n.title}
          className="wa-msg-in flex gap-2 rounded-[14px] bg-white/95 px-2.5 py-2 shadow-brand-md"
          style={{ animationDelay: `${0.4 + idx * 0.8}s` }}
        >
          <Image
            src="/brand/logo-app.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-[7px]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-inter text-[9px] font-semibold uppercase tracking-[0.4px] text-[#667781]">
                Agendabela
              </span>
              <span className="font-inter text-[9px] text-[#667781]">
                {n.time}
              </span>
            </div>
            <p className="font-inter text-[11px] font-semibold leading-[14px] text-[#111B21]">
              {n.title}
            </p>
            <p className="font-inter text-[10.5px] leading-[14px] text-[#111B21]">
              {n.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export const FeaturesComponent = () => {
  return (
    <section className="w-full bg-brand-creme-soft px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14 text-center">
          <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
            O que a Bela faz por você
          </span>
          <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[32px] leading-[40px] md:text-[44px] md:leading-[52px] tracking-[-0.025em]">
            <span className="block">Avisa suas clientes</span>
            <span className="block">Lembra dos horários</span>
            <span className="block">Mostra seu dia e seu caixa</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {/* Card 1 — Avisa a cliente no WhatsApp */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Na hora que você marca
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Sua cliente recebe a confirmação no WhatsApp
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Toda vez que você marca, a Bela manda a confirmação no WhatsApp
                da sua cliente. Você não liga e não digita.
              </p>
              <div className="mt-2 flex justify-center md:justify-start">
                <WhatsAppCard
                  contact="Salão Estilo"
                  avatarInitial="SE"
                  messages={confirmacaoCliente}
                />
              </div>
            </div>
          </article>

          {/* Card 2 — Toda manhã (push da dona + lembrete da cliente) */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme-soft shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Toda manhã, sem você precisar lembrar
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Você recebe a agenda do dia. Sua cliente recebe o lembrete e responde com um toque.
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Cedinho, antes do salão abrir, você recebe no celular os
                horários do dia. E cada cliente recebe o lembrete do horário
                dela. Quando ela confirma, você é avisada.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-4 sm:gap-3 items-center sm:items-start justify-center md:justify-start">
                <div className="flex flex-col gap-2">
                  <span className="font-mono-brand text-[9.5px] tracking-[1.5px] uppercase text-ink-muted">
                    No seu celular
                  </span>
                  <PushNotificationStack width={232} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono-brand text-[9.5px] tracking-[1.5px] uppercase text-ink-muted">
                    No WhatsApp da cliente
                  </span>
                  <WhatsAppCard
                    contact="Salão Estilo"
                    avatarInitial="SE"
                    messages={lembreteCliente}
                    width={232}
                  />
                </div>
              </div>
            </div>
          </article>

          {/* Card 3 — Dashboard real (sem zoom/desfoque, igual hero) */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Tela inicial do app
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Seu dia pronto no celular
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Abra o app e veja quanto deve entrar hoje, quantas clientes você
                atende e quem é a próxima. Sem caderno, sem planilha.
              </p>
              <div className="mt-2 flex justify-center md:justify-start">
                <div className="relative w-[180px] md:w-[200px] aspect-[9/19.5] rounded-[28px] bg-brand-petroleo shadow-brand-md p-2">
                  <div className="relative h-full w-full rounded-[20px] overflow-hidden bg-surface-subtle">
                    <Image
                      src="/app-screens/dashboard-demo.jpeg"
                      alt="Tela inicial do app com o resumo do dia e a próxima cliente"
                      fill
                      sizes="200px"
                      className="object-cover object-top"
                      style={{ aspectRatio: "990/2667" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 4 — Fluxo de caixa do dia */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme-soft shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Fluxo de caixa
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                O caixa do seu dia
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Veja o que entrou, o que saiu e quanto sobrou no dia, no Pix,
                no cartão ou no dinheiro.
              </p>
              <div className="mt-2 flex justify-center md:justify-start">
                <div className="relative w-[160px] md:w-[180px] aspect-[9/19] rounded-[24px] bg-brand-petroleo shadow-brand-md p-1.5">
                  <div className="relative h-full w-full rounded-[18px] overflow-hidden bg-surface-subtle">
                    <Image
                      src="/app-screens/caixa-demo.jpeg"
                      alt="Tela de fluxo de caixa com o saldo do dia"
                      fill
                      sizes="180px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
