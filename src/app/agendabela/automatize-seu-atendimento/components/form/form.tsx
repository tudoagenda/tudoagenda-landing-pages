"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SignupModal } from "../signup-modal";
import { useAmplitude } from "@/contexts/AmplitudeProvider";
import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";

export const FormComponent = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState("");
  const [initialStep, setInitialStep] = useState<1 | 2 | 3>(1);
  const { track } = useAmplitude();

  // Detect ?payment=success to show success step
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setInitialStep(3);
      setShowSignupModal(true);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);
    setInitialStep(1);
    track("agendabela/automatize-seu-atendimento/form_submission", { email: emailValue });
    pushAgendaBelaMainEvent({
      event: "lp_form_submitted",
      form_name: "signup_initial",
    });
    setShowSignupModal(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 w-full max-w-lg">
        <Input
          placeholder="Seu melhor email"
          type="email"
          name="email"
          required
          className="h-11 rounded-full font-inter"
        />
        <Button variant="brand-primary" size="lg" type="submit">
          Começar com 30 dias grátis
        </Button>
      </form>

      <SignupModal
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        initialEmail={email}
        initialStep={initialStep}
      />
    </>
  );
};
