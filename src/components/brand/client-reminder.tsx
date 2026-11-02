// ─────────────────────────────────────────────────────────────────────────────
// Lembrete da cliente (WhatsApp, 07:00 do dia do horário) — fonte única do
// texto usado nas prévias da landing (hero e card "Toda manhã"), pra página
// não mostrar duas versões do mesmo lembrete.
//
// Fiel ao produto: o lembrete chega com os botões Confirmar / Remarcar /
// Cancelar, e a resposta da cliente vira aviso para a dona.
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENT_REMINDER_TIME = "07:00";

export const CLIENT_REMINDER_BUTTONS = ["Confirmar", "Remarcar", "Cancelar"];

export function ClientReminderText() {
  return (
    <>
      🔔 Bom dia, Camila!
      <br />
      Lembrando que hoje você tem horário às <strong>15h</strong> com a Paula
      💜
    </>
  );
}

interface QuickRepliesProps {
  buttons: string[];
  size?: "sm" | "md";
}

/**
 * Botões de resposta rápida do WhatsApp, logo abaixo da mensagem. Só visual:
 * não são interativos na landing.
 */
export function WhatsAppQuickReplies({ buttons, size = "md" }: QuickRepliesProps) {
  const text = size === "sm" ? "text-[10.5px] py-1" : "text-[12px] py-1.5";
  return (
    <div className="flex flex-col gap-1 w-full">
      {buttons.map((label) => (
        <span
          key={label}
          className={`block rounded-[7px] bg-white text-center font-inter font-medium text-[#027EB5] ${text}`}
          style={{ boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
