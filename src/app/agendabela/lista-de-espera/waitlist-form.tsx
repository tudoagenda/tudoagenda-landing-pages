"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAmplitude } from "@/contexts/AmplitudeProvider";
import { pushAgendaBelaListaEsperaEvent } from "@/lib/analytics/dataLayer";

// Máscara visual de telefone BR: (11) 91234-5678 / (11) 1234-5678.
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type Status = "idle" | "loading" | "success" | "error";

export const WaitlistForm = () => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { track } = useAmplitude();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    track("agendabela/lista-de-espera/form_submission", {
      whatsapp_digits: whatsapp.replace(/\D/g, "").length,
    });
    pushAgendaBelaListaEsperaEvent({
      event: "lp_form_submitted",
      form_name: "waitlist",
    });

    try {
      const res = await fetch("/api/agendabela/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsapp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Não conseguimos salvar. Tente novamente.");
        setStatus("error");
        return;
      }

      pushAgendaBelaListaEsperaEvent({ event: "lp_signup_completed" });
      setStatus("success");
    } catch {
      setErrorMsg("Sem conexão. Confira sua internet e tente de novo.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col gap-3 bg-white rounded-app-lg shadow-brand-md p-6 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-rosa-50 text-brand-rosa text-2xl font-bold">
          ✓
        </span>
        <h2 className="font-fraunces italic text-brand-petroleo text-[24px] leading-tight">
          Tá feito, {name.split(" ")[0]}!
        </h2>
        <p className="font-inter text-ink-muted text-[15px] leading-[22px]">
          Você está na lista. Assim que o Agenda Bela sair, a gente te chama no
          WhatsApp — você vai ser uma das primeiras a usar.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 bg-white rounded-app-lg shadow-brand-md p-5 md:p-6"
    >
      <span className="font-mono-brand text-[10px] tracking-[1.8px] uppercase text-ink-muted">
        Entre na lista de espera
      </span>

      <Input
        placeholder="Seu nome"
        type="text"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-11 font-inter rounded-full"
      />

      <Input
        placeholder="Seu WhatsApp com DDD"
        type="tel"
        name="whatsapp"
        inputMode="numeric"
        autoComplete="tel"
        required
        value={whatsapp}
        onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
        className="h-11 font-inter rounded-full"
      />

      {status === "error" && (
        <p className="font-inter text-[13px] leading-[18px] text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <Button
        variant="brand-primary"
        size="lg"
        type="submit"
        disabled={status === "loading"}
        className="rounded-full whitespace-nowrap"
      >
        {status === "loading" ? "Salvando..." : "Quero ser avisada no lançamento"}
      </Button>

      <p className="font-inter text-[12px] leading-[17px] text-ink-muted text-center">
        Sem spam. A gente só te chama quando o app estiver no ar.
      </p>
    </form>
  );
};
