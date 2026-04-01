import { useMutation } from "@tanstack/react-query";
import { userService, CreateUserParams } from "@/services/user";
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
    mutationFn: ({ email, name, phone }: { email: string; name: string; phone: string }) =>
      userService.createBilling(email, name, phone),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao gerar link de pagamento",
        description: "Tente novamente mais tarde",
      });
    },
  });
}
