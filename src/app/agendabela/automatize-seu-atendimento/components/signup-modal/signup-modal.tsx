"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUser, useCreateBilling, useSendMagicLink } from "@/hooks/use-create-user";
import { useAmplitude } from "@/contexts/AmplitudeProvider";
import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";
import { Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "agendabela_signup_email";
const SESSION_NAME_KEY = "agendabela_signup_name";
const SESSION_PHONE_KEY = "agendabela_signup_phone";
const SESSION_MAGIC_LINK_SENT = "agendabela_magic_link_sent";

// Note: No CPF field needed — AbacatePay v2 only requires email for customer.

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail: string;
  initialStep?: Step;
}

type Step = 1 | 2 | 3;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(pw)) return "Precisa de letra maiúscula";
  if (!/[a-z]/.test(pw)) return "Precisa de letra minúscula";
  if (!/[0-9]/.test(pw)) return "Precisa de número";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Precisa de caractere especial (!@#$...)";
  return null;
}

export const SignupModal = ({ open, onOpenChange, initialEmail, initialStep = 1 }: SignupModalProps) => {
  const [step, setStep] = useState<Step>(initialStep);
  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: createBilling, isPending: isBilling } = useCreateBilling();
  const { mutate: sendMagicLink, isPending: isSendingLink } = useSendMagicLink();
  const [magicLinkError, setMagicLinkError] = useState(false);
  const [noPhone, setNoPhone] = useState(false);
  const { track } = useAmplitude();

  // Sync initialEmail when modal opens
  useEffect(() => {
    if (open && initialEmail) {
      setEmail(initialEmail);
    }
  }, [open, initialEmail]);

  // Guard step 3: only allow if user completed signup (email in sessionStorage)
  useEffect(() => {
    if (initialStep === 3) {
      const storedEmail = sessionStorage.getItem(SESSION_KEY);
      const storedPhone = sessionStorage.getItem(SESSION_PHONE_KEY);
      if (!storedEmail) {
        // No signup context — ignore the query param, reset to step 1
        setStep(1);
      } else {
        setEmail(storedEmail);
        setStep(3);
        // Send magic link after payment success (only once per session)
        if (!storedPhone) {
          setNoPhone(true);
        } else if (!sessionStorage.getItem(SESSION_MAGIC_LINK_SENT)) {
          sessionStorage.setItem(SESSION_MAGIC_LINK_SENT, "1");
          sendMagicLink(
            { phone: storedPhone, email: storedEmail },
            {
              onError: () => setMagicLinkError(true),
            }
          );
        }
      }
    }
  }, [initialStep]);

  // Sync initialEmail/step when modal opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setEmail(initialEmail);
      if (initialStep === 3) {
        const storedEmail = sessionStorage.getItem(SESSION_KEY);
        setStep(storedEmail ? 3 : 1);
        if (storedEmail) setEmail(storedEmail);
      } else {
        setStep(initialStep);
      }
    }
    if (!nextOpen) {
      // Reset on close
      setStep(1);
      setName("");
      setSalonName("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setAcceptedTerms(false);
      setErrors({});
      setGeneralError(null);
      setMagicLinkError(false);
      setNoPhone(false);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_NAME_KEY);
      sessionStorage.removeItem(SESSION_PHONE_KEY);
      sessionStorage.removeItem(SESSION_MAGIC_LINK_SENT);
    }
    onOpenChange(nextOpen);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!salonName.trim()) newErrors.salonName = "Nome do salão é obrigatório";

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) newErrors.phone = "Telefone inválido";

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email inválido";

    const pwError = validatePassword(password);
    if (pwError) newErrors.password = pwError;

    if (password !== confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";

    if (!acceptedTerms) newErrors.terms = "Aceite os termos para continuar";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = () => {
    if (!validateStep1()) return;

    setGeneralError(null);
    const phoneDigits = phone.replace(/\D/g, "");

    track("agendabela/signup-modal/step1_submit", { email });

    createUser(
      { email, password, name, salonName, phone: phoneDigits },
      {
        onSuccess: () => {
          track("agendabela/signup-modal/account_created", { email });
          pushAgendaBelaMainEvent({ event: "lp_signup_completed" });
          // Persist email, name and phone so step 3 can validate context and send magic link
          sessionStorage.setItem(SESSION_KEY, email);
          sessionStorage.setItem(SESSION_NAME_KEY, name);
          sessionStorage.setItem(SESSION_PHONE_KEY, phoneDigits);
          setStep(2);
        },
        onError: (error: Error) => {
          setGeneralError(error.message || "Erro ao criar conta. Tente novamente.");
        },
      }
    );
  };

  const handlePayment = () => {
    track("agendabela/signup-modal/payment_click", { email });

    const customerName = name || sessionStorage.getItem(SESSION_NAME_KEY) || "";
    const customerPhone = phone.replace(/\D/g, "") || sessionStorage.getItem(SESSION_PHONE_KEY) || "";
    createBilling(
      { email, name: customerName, phone: customerPhone },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.location.href = data.url;
          }
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md mx-0 sm:mx-auto px-4 sm:px-6 max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">
                Crie sua conta gratuita
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Preencha seus dados para começar a usar o Agenda Bela
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 py-2">
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                  {generalError}
                </div>
              )}
              <div>
                <Input
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Nome do salão"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className={errors.salonName ? "border-red-500" : ""}
                />
                {errors.salonName && (
                  <p className="text-xs text-red-500 mt-1">{errors.salonName}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="(11) 99999-9999"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Seu e-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    placeholder="Crie uma senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min. 8 caracteres, maiúscula, minúscula, número e especial
                  </p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    placeholder="Confirme sua senha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-purple-700"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  Li e aceito os{" "}
                  <a
                    href="https://tudoagenda.com.br/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-purple-700"
                  >
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a
                    href="https://tudoagenda.com.br/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-purple-700"
                  >
                    Política de Privacidade
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-500">{errors.terms}</p>
              )}
            </div>

            <AlertDialogFooter className="flex-col gap-2">
              <Button
                onClick={handleStep1Submit}
                disabled={isCreating}
                className="w-full bg-[#673ab7] hover:bg-[#5e35b1] text-white"
              >
                Criar conta e continuar
                {isCreating && <Spinner size="sm" variant="primary" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full"
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">
                💳 Cadastre seu cartão
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-center">
                  <p>
                    <strong>Trial gratuito de 30 dias.</strong> Cadastre seu
                    cartão — você{" "}
                    <strong className="text-green-600">NÃO será cobrado agora</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Após 30 dias: R$59,90/mês. Cancele quando quiser.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex-col gap-2 pt-4">
              <Button
                onClick={handlePayment}
                disabled={isBilling}
                className="w-full bg-[#673ab7] hover:bg-[#5e35b1] text-white"
              >
                Cadastrar cartão
                {isBilling && <Spinner size="sm" variant="primary" />}
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">
                {isSendingLink ? "Enviando link..." : "Conta criada! 🎉"}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-center">
                  {isSendingLink && (
                    <div className="flex justify-center py-4">
                      <Spinner size="md" variant="primary" />
                    </div>
                  )}
                  {magicLinkError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                      Não conseguimos enviar o link. Baixe o app e faça login manualmente.
                    </div>
                  )}
                  {!isSendingLink && !magicLinkError && (
                    <>
                      {noPhone ? (
                        <p>
                          Conta criada! Baixe o app e faça login:
                        </p>
                      ) : (
                        <p>
                          Enviamos um link pro seu WhatsApp.
                          <br />
                          <strong>Toque nele pra abrir o app!</strong>
                        </p>
                      )}

                      <div className="bg-purple-50 p-3 rounded-lg text-sm">
                        <p className="font-medium mb-2">{noPhone ? "Baixe o app:" : "Não recebeu? Baixe o app e faça login:"}</p>
                        <div className="flex gap-3 justify-center">
                          <a
                            href="https://apps.apple.com/app/agenda-bela"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-purple-700"
                          >
                            📱 App Store
                          </a>
                          <a
                            href="https://play.google.com/store/apps/details?id=com.agendabela"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-purple-700"
                          >
                            🤖 Google Play
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex-col gap-2 pt-2">
              <Button
                onClick={() => handleOpenChange(false)}
                disabled={isSendingLink}
                className="w-full bg-[#673ab7] hover:bg-[#5e35b1] text-white"
              >
                Fechar
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
