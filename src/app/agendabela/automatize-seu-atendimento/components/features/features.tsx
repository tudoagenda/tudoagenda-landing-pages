"use client";

import Image from "next/image";
import { WhatsAppCard } from "@/components/brand/whatsapp-card";

// ─────────────────────────────────────────────────────────────────────────────
// <FeaturesComponent />
//
// "Tudo que sua secretária faz por você" — 4 cards com features reais.
// Mobile-first: stack vertical, cards full-width. Desktop 2x2.
//
// Mockups variam por feature:
//   - Confirmação no WhatsApp: simulação real da mensagem que cliente recebe
//   - Lembrete do dia: 2 mockups (cliente + dono do salão) — foco no dono
//   - Agenda do dia: phone com dashboard real do app (sem zoom/desfoque)
//   - Painel completo: phone com tela financeira
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
    text: (
      <>
        🔔 Bom dia, Camila!
        <br />
        Hoje você tem horário às <strong>15h</strong> com a Paula 💜
      </>
    ),
    time: "07:00",
    delay: "0.4s",
  },
];

const lembreteSalao = [
  {
    text: (
      <>
        🌅 Bom dia, Salão Estilo!
        <br />
        <strong>Sua agenda hoje (5 horários):</strong>
        <br />• 09:00 — Maria · Manicure
        <br />• 10:30 — Joana · Sobrancelha
        <br />• 13:00 — Camila · Pedicure
        <br />• 15:00 — Luzinete · Manicure e pedicure
        <br />• 16:30 — Megui · Banho de petróleo
      </>
    ),
    time: "07:00",
    delay: "0.4s",
  },
];

export const FeaturesComponent = () => {
  return (
    <section className="w-full bg-brand-creme-soft px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 md:mb-14 text-center">
          <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
            O que sua secretária faz
          </span>
          <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[32px] leading-[40px] md:text-[44px] md:leading-[52px] tracking-[-0.025em]">
            <span className="block">Cuida das mensagens</span>
            <span className="block">Lembra dos horários</span>
            <span className="block">Mostra o que importa</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {/* Card 1 — Avisa cliente no WhatsApp */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Confirmação automática
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Avisa seu cliente no WhatsApp
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Cada agendamento que você marca, a gente envia uma mensagem no
                WhatsApp do cliente confirmando. Sem ligar, sem digitar.
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

          {/* Card 2 — Lembrete do dia (foco no salão + cliente) */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme-soft shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Toda manhã, sem você lembrar
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Você recebe a agenda do dia. Seu cliente recebe o lembrete dele.
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Cedinho, antes do salão abrir, a gente manda no WhatsApp todos
                os horários do dia pra você — e lembra cada cliente do horário
                que ele marcou.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-3 items-center sm:items-start justify-center md:justify-start">
                <WhatsAppCard
                  contact="Salão Estilo · Você"
                  avatarInitial="SE"
                  messages={lembreteSalao}
                  width={232}
                />
                <WhatsAppCard
                  contact="Camila · Cliente"
                  avatarInitial="CA"
                  messages={lembreteCliente}
                  width={232}
                />
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
                Te entrega o dia pronto, no celular
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Você acorda e abre o app: aparece quanto vai entrar hoje,
                quantos clientes tem, quem é o próximo. Sem caderno, sem
                planilha.
              </p>
              <div className="mt-2 flex justify-center md:justify-start">
                <div className="relative w-[180px] md:w-[200px] aspect-[9/19.5] rounded-[28px] bg-brand-petroleo shadow-brand-md p-2">
                  <div className="relative h-full w-full rounded-[20px] overflow-hidden bg-surface-subtle">
                    <Image
                      src="/app-screens/dashboard-full.jpeg"
                      alt="Dashboard do app com agenda do dia"
                      fill
                      sizes="200px"
                      className="object-cover object-top"
                      style={{ aspectRatio: "626/1685" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 4 — Painel completo (financeiro) */}
          <article className="relative overflow-hidden rounded-app-xl bg-brand-creme-soft shadow-brand-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
            />
            <div className="relative flex flex-col gap-5 p-6 md:p-8">
              <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-brand-vinho">
                Painel completo
              </span>
              <h3 className="font-fraunces italic font-normal text-brand-petroleo text-[24px] leading-[28px] md:text-[28px] md:leading-[32px] tracking-[-0.02em] max-w-[18ch]">
                Mostra o que importa do salão
              </h3>
              <p className="font-inter text-ink-muted text-[15px] leading-[24px] max-w-[40ch]">
                Faturamento do mês, dias mais movimentados, serviços que mais
                saem, ranking dos profissionais. Tudo num toque.
              </p>
              <div className="mt-2 flex justify-center md:justify-start">
                <div className="relative w-[160px] md:w-[180px] aspect-[9/19] rounded-[24px] bg-brand-petroleo shadow-brand-md p-1.5">
                  <div className="relative h-full w-full rounded-[18px] overflow-hidden bg-surface-subtle">
                    <Image
                      src="/app-screens/financeiro-faturamento.jpeg"
                      alt="Tela financeira com gráfico de receita"
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
