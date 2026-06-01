import { NextResponse } from "next/server";

/**
 * BFF da lista de espera (pré-lançamento) do Agenda Bela.
 *
 * Recebe { name, whatsapp } do form da LP `/agendabela/lista-de-espera`,
 * valida/normaliza e repassa pra um Google Apps Script Web App que faz
 * append numa planilha do Google Sheets.
 *
 * Env vars (configurar no Railway):
 * - AGENDABELA_WAITLIST_WEBHOOK_URL: URL `/exec` do Apps Script publicado.
 * - AGENDABELA_WAITLIST_SECRET (opcional): segredo compartilhado, enviado no
 *   corpo e validado pelo Apps Script pra evitar gravações de terceiros.
 *
 * Setup do Apps Script: ver docs/lista-de-espera-apps-script.md.
 */

// Normaliza telefone brasileiro pra dígitos. Aceita com/sem DDI 55.
function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  // 10 dígitos (fixo c/ DDD) a 11 (celular c/ DDD); ou com DDI 55 -> 12/13.
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const name: string =
      typeof body?.name === "string" ? body.name.trim() : "";
    const whatsappRaw: string =
      typeof body?.whatsapp === "string" ? body.whatsapp.trim() : "";

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Informe seu nome." },
        { status: 400 },
      );
    }

    const whatsapp = normalizeWhatsapp(whatsappRaw);
    if (!whatsapp) {
      return NextResponse.json(
        { error: "Informe um WhatsApp válido com DDD." },
        { status: 400 },
      );
    }

    const webhookUrl = process.env.AGENDABELA_WAITLIST_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("[Waitlist] AGENDABELA_WAITLIST_WEBHOOK_URL não configurada.");
      return NextResponse.json(
        { error: "Cadastro temporariamente indisponível. Tente mais tarde." },
        { status: 502 },
      );
    }

    const sheetRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        whatsapp,
        source: "lp/lista-de-espera",
        secret: process.env.AGENDABELA_WAITLIST_SECRET ?? "",
      }),
      // Apps Script /exec responde com 302 -> seguir o redirect.
      redirect: "follow",
    });

    // Apps Script (ContentService) responde 200 mesmo em erro de aplicação
    // (ex.: segredo inválido), então checamos o corpo, não só o status HTTP.
    const detail = await sheetRes.text().catch(() => "");
    let payload: { ok?: boolean; error?: string } = {};
    try {
      payload = JSON.parse(detail);
    } catch {
      // corpo não-JSON
    }

    if (!sheetRes.ok || payload.ok !== true) {
      console.error("[Waitlist] Apps Script error:", sheetRes.status, detail);
      return NextResponse.json(
        { error: "Não conseguimos salvar seu cadastro. Tente novamente." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Waitlist] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
