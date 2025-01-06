import { useMutation } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { useToast } from "@/hooks/use-toast";

export function useCreateUser() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: userService.createUser,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Ops, algo deu errado",
        description: "Tente novamente mais tarde",
      });
    },
  });
}
