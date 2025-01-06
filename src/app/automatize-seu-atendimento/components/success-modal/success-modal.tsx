import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessModal = ({ open, onOpenChange }: SuccessModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Sucesso!</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="text-base mb-2">
              Em breve você receberá um e-mail com o usuário e senha para
              acessar a sua nova plataforma.
            </p>
            <p className="text-base mb-2">
              Não se preocupe, o e-mail é o seu e-mail de contato.
            </p>
            <p className="text-base mb-2">
              Lá na plataforma você terá acesso a todas as funcionalidades e aos
              vídeo-tutoriais para começar a usar.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="agendabela-accent"
            onClick={() => onOpenChange(false)}
          >
            Ok
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
