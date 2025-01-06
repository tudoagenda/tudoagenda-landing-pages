"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { SuccessModal } from "../success-modal";
import { useCreateUser } from "@/hooks/use-create-user";

export const FormComponent = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    mutate(email, {
      onSuccess: () => setShowSuccessModal(true),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg">
        <Input
          placeholder="Digite seu e-mail aqui"
          type="email"
          name="email"
          required
        />
        <Button variant="agendabela-accent" type="submit" disabled={isPending}>
          Teste Gratuitamente
          {isPending && <Spinner size="sm" variant="primary" />}
        </Button>
      </form>

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />
    </>
  );
};
