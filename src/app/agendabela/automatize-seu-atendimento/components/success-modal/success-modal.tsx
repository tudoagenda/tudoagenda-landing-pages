import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  tempPassword?: string;
}

// TODO: Update these URLs when the apps are published
const APP_STORE_URL = "https://apps.apple.com";
const PLAY_STORE_URL = "https://play.google.com";

export const SuccessModal = ({ open, onOpenChange, email, tempPassword }: SuccessModalProps) => {
  const handleAccessPanel = () => {
    if (email && tempPassword) {
      const url = `https://agendabela.tudoagenda.com.br/entrar/?email=${encodeURIComponent(email)}&temp=${encodeURIComponent(tempPassword)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md mx-0 sm:mx-auto px-4 sm:px-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-center mb-4">
            🎉 Cadastro realizado com sucesso!
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">1️⃣</span>
                  <span className="break-words">Baixe o app ou acesse pelo navegador.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">2️⃣</span>
                  <span className="break-words">Cadastre o nome do seu salão.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">3️⃣</span>
                  <span className="break-words">Compartilhe seu link e receba seus primeiros agendamentos.</span>
                </div>
              </div>

              {/* Store Badges */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105 active:scale-95"
                >
                  <Image
                    src="/images/badges/app-store.svg"
                    alt="Baixar na App Store"
                    width={135}
                    height={40}
                    className="h-10 w-auto"
                  />
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105 active:scale-95"
                >
                  <Image
                    src="/images/badges/google-play.svg"
                    alt="Disponível no Google Play"
                    width={135}
                    height={40}
                    className="h-10 w-auto"
                  />
                </a>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-800 break-words">
                  💬 <strong>Dica:</strong> você também pode testar o agendamento clicando no link da sua agenda!
                </div>
              </div>

              {email && tempPassword && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg flex-shrink-0">🔐</span>
                    <span className="text-sm font-medium flex-shrink-0">Login:</span>
                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border break-all">{email}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg flex-shrink-0">🔑</span>
                    <span className="text-sm font-medium flex-shrink-0">Senha:</span>
                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border break-all">{tempPassword}</span>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2">
          {email && tempPassword && (
            <Button
              onClick={handleAccessPanel}
              className="w-full text-white"
              style={{ backgroundColor: '#673ab7', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5e35b1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#673ab7'}
            >
              🚀 Começar a usar agora
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
