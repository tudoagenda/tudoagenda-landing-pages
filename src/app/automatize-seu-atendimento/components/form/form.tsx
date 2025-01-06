"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SuccessModal } from "../success-modal";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export const FormComponent = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = formData.get("email");
      const response = await fetch("http://localhost:3000/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShowSuccessModal(true);
      console.log(data);
    },
    onError: (error) => {
      toast({
        variant: "default",
        title: "Ops, algo deu errado",
        description: "Tente novamente mais tarde",
      });
      console.error("error", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(formData);
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

      <Toaster />
    </>
  );
};
