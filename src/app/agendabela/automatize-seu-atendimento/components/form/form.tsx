"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SignupModal } from "../signup-modal";
import { useAmplitude } from "@/contexts/AmplitudeProvider";

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
    setShowSignupModal(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 w-full max-w-lg">
        <Input
          placeholder="Digite seu e-mail aqui"
          type="email"
          name="email"
          required
        />
        <Button variant="agendabela-accent" type="submit">
          Teste Gratuitamente
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
