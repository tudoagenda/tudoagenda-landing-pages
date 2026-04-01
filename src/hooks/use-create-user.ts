import { useMutation } from "@tanstack/react-query";
import { userService, CreateUserParams, CreateBillingParams } from "@/services/user";
import { useToast } from "@/hooks/use-toast";

export function useCreateUser() {
  return useMutation({
    mutationFn: (params: CreateUserParams) => userService.createUser(params),
  });
}

export function useSendMagicLink() {
  return useMutation({
    mutationFn: ({ phone, email }: { phone: string; email: string }) =>
      userService.sendMagicLink(phone, email),
  });
}

export function useCreateBilling() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: CreateBillingParams) =>
      userService.createBilling(params),
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao gerar link de pagamento",
        description: error.message || "Tente novamente mais tarde",
      });
    },
  });
}
