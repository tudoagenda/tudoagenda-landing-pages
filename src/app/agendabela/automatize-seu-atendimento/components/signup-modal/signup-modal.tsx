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
import { AppStoreBadges } from "@/components/app-store-badges/app-store-badges";
import { useCreateBilling, useSendMagicLink } from "@/hooks/use-create-user";
import { useAmplitude } from "@/contexts/AmplitudeProvider";
import { pushAgendaBelaMainEvent } from "@/lib/analytics/dataLayer";
import { Eye, EyeOff } from "lucide-react";

const SESSION_KEY = "agendabela_signup_email";
const SESSION_NAME_KEY = "agendabela_signup_name";
const SESSION_PHONE_KEY = "agendabela_signup_phone";

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

/**
 * Calcula a data de término do trial (now + 30 dias) e retorna formatada
 * em pt-BR. O cálculo é feito no momento da renderização do step 3
 * (logo após o pagamento) — mesma janela do `trialEndsAt` que o backend
 * grava em Subscription. Aceitamos pequena divergência (segundos) entre
 * o que o user vê e o que está no banco.
 */
function formatTrialEndDate(now: Date = new Date()): string {
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  const day = String(end.getDate()).padStart(2, "0");
  const month = String(end.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
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

  const { mutate: createBilling, isPending: isBilling } = useCreateBilling();
  const { mutate: sendMagicLink, isPending: isSendingLink } = useSendMagicLink();
  const [magicLinkError, setMagicLinkError] = useState(false);
  const [noPhone, setNoPhone] = useState(false);
  // Quando o backend devolve 409 "email já tem conta" sinalizamos com banner
  // dedicado no step 1 — orienta a usuária a usar `/agendabela/reativar` em
  // vez de tentar novo cadastro. Mensagem do backend é estável (veja
  // `agendabela-backend-services/src/subscriptions/abacatepay.service.ts`).
  const [duplicateEmail, setDuplicateEmail] = useState(false);
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
        if (!storedPhone) {
          setNoPhone(true);
        }
        // Magic link is now dispatched server-side by the AbacatePay
        // webhook (backend PR #65). Step 3 just informs the user it's
        // coming via WhatsApp; the "Reenviar link" button below can
        // request a resend through the public endpoint, which only
        // succeeds for subscriptions already marked ACTIVE.
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
      setDuplicateEmail(false);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_NAME_KEY);
      sessionStorage.removeItem(SESSION_PHONE_KEY);
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

    track("agendabela/signup-modal/account_details_completed", { email });
    pushAgendaBelaMainEvent({ event: "lp_signup_completed" });
    sessionStorage.setItem(SESSION_KEY, email);
    sessionStorage.setItem(SESSION_NAME_KEY, name);
    sessionStorage.setItem(SESSION_PHONE_KEY, phoneDigits);
    setStep(2);
  };

  const handlePayment = () => {
    track("agendabela/signup-modal/payment_click", { email });
    setGeneralError(null);
    setDuplicateEmail(false);

    createBilling(
      {
        email,
        password,
        name: name || sessionStorage.getItem(SESSION_NAME_KEY) || "",
        salonName,
        phone: phone.replace(/\D/g, "") || sessionStorage.getItem(SESSION_PHONE_KEY) || "",
      },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.location.href = data.url;
          }
        },
        onError: (error: Error) => {
          // O backend (`abacatepay.service.ts`) responde 409 quando o
          // email já tem conta — caminho típico pra base legada que
          // tenta usar o signup novo. Voltamos pra step 1 com banner
          // explicando e link pra LP de reativação.
          const msg = (error.message || "").toLowerCase();
          const isDuplicate =
            msg.includes("já possui uma conta") ||
            msg.includes("já existe") ||
            msg.includes("reativação");
          if (isDuplicate) {
            track("agendabela/signup-modal/duplicate_email_blocked", { email });
            setDuplicateEmail(true);
            setStep(1);
            return;
          }
          // Outros erros: mensagem genérica no banner (toast do hook já
          // cobre como fallback secundário).
          setGeneralError(
            error.message ||
              "Não foi possível processar o pagamento. Tente novamente.",
          );
          setStep(1);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md mx-0 sm:mx-auto px-4 sm:px-6 max-h-[90vh] overflow-y-auto bg-surface-subtle border border-surface-alt-border rounded-app-xl">
        {step === 1 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-fraunces italic font-normal text-brand-petroleo text-[26px] leading-[30px] tracking-[-0.015em] text-center">
                Crie sua conta gratuita
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Preencha seus dados para começar a usar o Agenda Bela
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 py-2">
              {duplicateEmail && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                  <p className="text-sm text-amber-900 font-semibold">
                    Esse email já tem conta no Agenda Bela.
                  </p>
                  <p className="text-sm text-amber-800">
                    Se você já é nossa cliente, reative sua conta cadastrando o cartão — seus dados antigos são mantidos.
                  </p>
                  <a
                    href="/agendabela/reativar"
                    className="inline-flex items-center justify-center w-full h-10 px-4 rounded-full bg-brand-rosa hover:bg-brand-rosa-hover text-white font-inter font-semibold text-sm transition-colors"
                  >
                    Reativar minha conta
                  </a>
                </div>
              )}
              {generalError && !duplicateEmail && (
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
                  className="mt-1 accent-brand-rosa"
                />
                <label htmlFor="terms" className="text-xs text-ink-muted font-inter">
                  Li e aceito os{" "}
                  <a
                    href="/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-brand-rosa hover:text-brand-rosa-hover"
                  >
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-brand-rosa hover:text-brand-rosa-hover"
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
                className="w-full bg-brand-rosa hover:bg-brand-rosa-hover text-white rounded-full font-inter font-semibold"
              >
                Continuar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full rounded-full font-inter font-semibold"
              >
                Cancelar
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-fraunces italic font-normal text-brand-petroleo text-[26px] leading-[30px] tracking-[-0.015em] text-center">
                Cadastre seu cartão
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-center">
                  <p>
                    <strong>Trial gratuito de 30 dias.</strong> Cadastre seu
                    cartão — você{" "}
                    <strong className="text-emerald-700">NÃO será cobrado agora</strong>.
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
                className="w-full bg-brand-rosa hover:bg-brand-rosa-hover text-white rounded-full font-inter font-semibold"
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
              <AlertDialogTitle className="font-fraunces italic font-normal text-brand-petroleo text-[26px] leading-[30px] tracking-[-0.015em] text-center">
                Pagamento confirmado! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-center">
                  <div className="rounded-app-md bg-brand-creme border border-brand-creme-soft text-brand-petroleo text-sm p-4 text-left font-inter">
                    <p className="font-semibold">
                      30 dias grátis começam agora.
                    </p>
                    <p className="mt-1 text-ink-muted">
                      Primeira cobrança automática em{" "}
                      <strong className="text-brand-petroleo">{formatTrialEndDate()}</strong> de R$ 59,90/mês.
                      Cancele quando quiser pelo perfil.
                    </p>
                  </div>

                  {noPhone ? (
                    <p>
                      Sua conta está pronta! Baixe o app abaixo e faça login com seu email.
                    </p>
                  ) : (
                    <p>
                      Em até <strong>1 minuto</strong> você vai receber no
                      WhatsApp o link para abrir o app Meu Salão.
                      <br />
                      <br />
                      Se ainda não tem o app instalado, baixe primeiro pelos
                      botões abaixo e depois toque no link do WhatsApp.
                    </p>
                  )}

                  <AppStoreBadges heading="Baixe o app Meu Salão:" />

                  {!noPhone && (
                    <>
                      {magicLinkError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                          Não conseguimos reenviar o link. Tente de novo em alguns minutos.
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={isSendingLink}
                        onClick={() => {
                          const storedPhone = sessionStorage.getItem(SESSION_PHONE_KEY);
                          const storedEmail = sessionStorage.getItem(SESSION_KEY);
                          if (!storedPhone || !storedEmail) return;
                          setMagicLinkError(false);
                          sendMagicLink(
                            { phone: storedPhone, email: storedEmail },
                            { onError: () => setMagicLinkError(true) },
                          );
                        }}
                        className="text-sm text-brand-rosa hover:text-brand-rosa-hover underline disabled:opacity-50 font-inter"
                      >
                        {isSendingLink ? "Reenviando..." : "Não recebeu? Reenviar link"}
                      </button>
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex-col gap-2 pt-2">
              <Button
                onClick={() => handleOpenChange(false)}
                className="w-full bg-brand-rosa hover:bg-brand-rosa-hover text-white rounded-full font-inter font-semibold"
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
