"use client";

import { useEffect, useRef, useState } from "react";
import { Fraunces, Inter } from "next/font/google";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AppStoreBadges } from "@/components/app-store-badges/app-store-badges";
import { APP_STORE_URL, googlePlayUrl } from "@/config/app-stores";
import {
  getLandingAttribution,
  pushAgendaBelaMainEvent,
  type DeviceOs,
  type SignupStep,
} from "@/lib/analytics/dataLayer";
import { SignupWebError, signupWebService } from "@/services/signup-web";
import { ChevronLeft, Eye, EyeOff, X } from "lucide-react";
import { EMAIL_REGEX, PASSWORD_RULES } from "@/lib/signup-rules";
import {
  type SignupContext,
  firstNameOf,
  formatPhone,
  formatTaxId,
  formatTrialEndDate,
  readSignupContext,
  writeSignupContext,
} from "./signup-session";

/**
 * Cadastro SEM cartão (Opção B, desenho aprovado em 06/11/2026, telas
 * Cadastro → Escolha → Sem cartão | Cartão → Aprovado/Desistiu, e Já tem
 * conta). A conta nasce em "Criar minha conta", igual ao cadastro do app; o
 * cartão é opcional depois. CPF só no caminho do cartão (D4).
 */

export type { SignupStep };

/* A landing não carrega Fraunces/Inter (as classes font-fraunces/font-inter
   dela caem na fonte do body). O cadastro segue o desenho com as fontes do
   app, só dentro do modal e sem preload: nada muda no carregamento da landing. */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStep?: SignupStep;
}

/* Classes do desenho com os tokens do repo (brand-vinho = #90496A,
   brand-rosa-50 = #FFF1F5, surface-alt-border = #F4D7DF). O que não tem token
   fica com o valor do desenho. */
const TITLE =
  "font-fraunces font-semibold text-brand-petroleo text-[28px] leading-[1.15] tracking-normal text-left";
const BODY = "font-inter text-[15px] leading-[1.45] text-[#4A4548]";
const LABEL = "font-inter text-sm font-semibold text-ink";
const INPUT =
  "h-auto rounded-xl border-[#E2D3CB] px-3.5 py-3 text-base md:text-base font-inter text-ink";
const PRIMARY =
  "flex w-full items-center justify-center gap-2 rounded-[14px] bg-brand-vinho px-5 py-4 text-center font-inter text-[17px] font-bold text-white transition-colors hover:bg-[#783B58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo disabled:opacity-60";
const SECONDARY =
  "w-full rounded-[14px] border border-brand-vinho bg-white px-5 py-3.5 font-inter text-[15px] font-semibold text-brand-vinho transition-colors hover:bg-brand-rosa-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo disabled:opacity-60";
const LINK =
  "self-center min-h-11 px-2 font-inter text-sm font-semibold text-brand-vinho hover:text-[#783B58] underline-offset-4 hover:underline disabled:opacity-60";
const SUCCESS_BOX =
  "rounded-[14px] bg-[#EAF7F0] px-3.5 py-3 font-inter text-sm leading-[1.45] text-[#2E6B50]";
const ERROR_BOX =
  "rounded-xl border border-red-200 bg-red-50 p-3 font-inter text-sm text-red-700";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3D8B68"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function detectDevice(): DeviceOs {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * "Já baixei, abrir o app" / "Entrar no app". A web não abre o app sem um
 * link de acesso: no celular, leva para a página do app na loja do aparelho
 * (com o app instalado, a loja mostra "Abrir"). No computador, não há o que
 * abrir: vira a orientação de entrar pelo celular.
 */
function OpenAppButton({
  label,
  ctaLocation,
  className = PRIMARY,
  desktopHint = true,
}: {
  label: string;
  ctaLocation: string;
  className?: string;
  /** false onde os selos já dizem para abrir pelo celular. */
  desktopHint?: boolean;
}) {
  const [device, setDevice] = useState<DeviceOs | null>(null);
  const [androidHref, setAndroidHref] = useState("");
  useEffect(() => {
    setDevice(detectDevice());
    setAndroidHref(googlePlayUrl(getLandingAttribution()));
  }, []);

  if (device === null) return null;
  if (device === "desktop") {
    if (!desktopHint) return null;
    return (
      <p className={`${BODY} text-center`}>
        Abra o app Agenda Bela no seu celular e entre com seu e-mail e senha.
      </p>
    );
  }
  const store = device === "ios" ? "app_store" : "google_play";
  return (
    <a
      href={device === "ios" ? APP_STORE_URL : androidHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        pushAgendaBelaMainEvent({
          event: "store_click",
          store,
          cta_location: ctaLocation,
          device_os: device,
        })
      }
    >
      {label}
    </a>
  );
}

function StoreBadges({ ctaLocation }: { ctaLocation: string }) {
  return (
    <AppStoreBadges
      heading=""
      ctaLocation={ctaLocation}
      className="flex flex-col items-start gap-1 [&>div]:justify-start [&>p]:text-left [&>p]:text-xs [&>p]:text-ink-muted [&>p]:mt-1"
    />
  );
}

type CadastroErrors = Partial<
  Record<"name" | "salonName" | "phone" | "email" | "password", string>
>;

export const SignupModal = ({
  open,
  onOpenChange,
  initialStep = "cadastro",
}: SignupModalProps) => {
  const [step, setStep] = useState<SignupStep>(initialStep);
  const [ctx, setCtx] = useState<SignupContext | null>(null);

  // Cadastro
  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<CadastroErrors>({});
  const [creating, setCreating] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const focusEmailRef = useRef(false);

  // Cartão
  const [taxId, setTaxId] = useState("");
  const [taxIdError, setTaxIdError] = useState<string | null>(null);
  const [openingCheckout, setOpeningCheckout] = useState(false);
  // Cartão que já tinha entrado antes (409): a data da 1ª cobrança não é hoje + 7.
  const [chargeDateUnknown, setChargeDateUnknown] = useState(false);

  // Comum
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [linkState, setLinkState] = useState<"idle" | "sending" | "sent">("idle");
  const [linkError, setLinkError] = useState<string | null>(null);

  // Ao abrir: passo pedido pelo dono do modal e o contexto da aba.
  useEffect(() => {
    if (!open) return;
    setStep(initialStep);
    setCtx(readSignupContext());
  }, [open, initialStep]);

  // Cada tela que aparece vira um evento (cadastro = cadastro iniciado).
  useEffect(() => {
    if (!open) return;
    pushAgendaBelaMainEvent({ event: "signup_step_viewed", signup_step: step });
    setGeneralError(null);
    setLinkState("idle");
    setLinkError(null);
  }, [open, step]);

  useEffect(() => {
    if (open && step === "cadastro" && focusEmailRef.current) {
      focusEmailRef.current = false;
      emailRef.current?.focus();
    }
  }, [open, step]);

  // O Hero desmonta o modal ao fechar: o formulário zera sozinho e a conta
  // (se criada) continua no contexto da aba.
  const handleOpenChange = (nextOpen: boolean) => onOpenChange(nextOpen);

  const firstName = ctx?.firstName ?? "";

  // ---------------------------------------------------------------- cadastro
  const clearError = (key: keyof CadastroErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validateCadastro = (): CadastroErrors => {
    const e: CadastroErrors = {};
    if (!name.trim()) e.name = "Conte como você quer ser chamada.";
    if (!salonName.trim()) e.salonName = "Informe o nome do salão ou espaço.";
    if (phone.replace(/\D/g, "").length < 10)
      e.phone = "Informe o WhatsApp com DDD.";
    if (!EMAIL_REGEX.test(email.trim()))
      e.email = "Confira o e-mail.";
    if (!PASSWORD_RULES.every((r) => r.test(password)))
      e.password = "A senha precisa cumprir todos os itens abaixo.";
    return e;
  };

  const handleCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (creating) return;
    const e = validateCadastro();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setGeneralError(null);
    setCreating(true);
    pushAgendaBelaMainEvent({ event: "lp_form_submitted", form_name: "signup_web" });
    try {
      const result = await signupWebService.signup({
        name: name.trim(),
        salonName: salonName.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        password,
      });
      const next: SignupContext = {
        profileId: result.profileId,
        email: result.email,
        firstName: firstNameOf(name),
        accessLinkSent: result.accessLinkSent,
      };
      writeSignupContext(next);
      setCtx(next);
      setPassword("");
      pushAgendaBelaMainEvent({ event: "lp_signup_completed" });
      setStep("escolha");
    } catch (err) {
      if (err instanceof SignupWebError && err.code === "EMAIL_ALREADY_REGISTERED") {
        pushAgendaBelaMainEvent({ event: "signup_email_exists" });
        setStep("ja_tem_conta");
        return;
      }
      const status = err instanceof SignupWebError ? err.status : 0;
      pushAgendaBelaMainEvent({
        event: "signup_failed",
        signup_step: "cadastro",
        failure_reason:
          status === 0 ? "network" : status === 400 ? "invalid_data" : status === 429 ? "rate_limited" : "server",
      });
      setGeneralError(
        err instanceof SignupWebError
          ? err.message
          : "Não consegui criar sua conta agora. Tente de novo em instantes.",
      );
    } finally {
      setCreating(false);
    }
  };

  // ------------------------------------------------------------ link acesso
  const requestLink = async (
    origin: "sem_cartao" | "aprovado" | "ja_tem_conta",
    target: string,
  ) => {
    if (!target || linkState === "sending") return;
    setLinkError(null);
    setLinkState("sending");
    pushAgendaBelaMainEvent({ event: "access_link_requested", signup_step: origin });
    try {
      await signupWebService.requestAccessLink(target);
      setLinkState("sent");
    } catch (err) {
      setLinkState("idle");
      setLinkError(
        err instanceof SignupWebError
          ? err.message
          : "Não deu para mandar o link agora. Tente de novo em instantes.",
      );
    }
  };

  // ------------------------------------------------------------------ cartão
  const choosePath = (
    path: "cartao" | "sem_cartao",
    from: "escolha" | "cartao" | "desistiu",
  ) => {
    pushAgendaBelaMainEvent({ event: "signup_path_chosen", signup_path: path, signup_step: from });
    setStep(path === "cartao" ? "cartao" : "sem_cartao");
  };

  const handleStartTrial = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (openingCheckout || !ctx) return;
    const digits = taxId.replace(/\D/g, "");
    if (digits.length !== 11 && digits.length !== 14) {
      setTaxIdError("Confira o CPF ou CNPJ.");
      return;
    }
    setTaxIdError(null);
    setGeneralError(null);
    setOpeningCheckout(true);
    try {
      const { checkoutUrl } = await signupWebService.startTrial(ctx.profileId, digits);
      writeSignupContext({ ...ctx, checkoutPending: true });
      pushAgendaBelaMainEvent({
        event: "checkout_opened",
        flow: "new_signup",
        source: "lp_signup_web",
      });
      window.location.href = checkoutUrl;
      // Mantém o botão travado até a página trocar.
    } catch (err) {
      setOpeningCheckout(false);
      if (err instanceof SignupWebError && err.code === "ALREADY_SUBSCRIBED") {
        pushAgendaBelaMainEvent({ event: "checkout_returned", checkout_result: "ja_cadastrado" });
        setChargeDateUnknown(true);
        setStep("aprovado");
        return;
      }
      const status = err instanceof SignupWebError ? err.status : 0;
      pushAgendaBelaMainEvent({
        event: "signup_failed",
        signup_step: "cartao",
        failure_reason:
          status === 0
            ? "network"
            : status === 400
              ? "invalid_data"
              : status === 409
                ? "already_active"
                : status === 429
                  ? "rate_limited"
                  : "server",
      });
      setGeneralError(
        err instanceof SignupWebError
          ? err.message
          : "Não consegui abrir o pagamento agora. Tente de novo em instantes.",
      );
    }
  };

  // -------------------------------------------------------------- telas
  const stepHeader = (onBack: () => void) => (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full text-brand-petroleo hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-petroleo"
      >
        <ChevronLeft className="h-[22px] w-[22px]" aria-hidden="true" />
      </button>
      <span className="font-inter text-[13px] text-ink-muted">Passo 1 de 2</span>
    </div>
  );

  const closeButton = (
    <div className="-mb-2 flex justify-end">
      <button
        type="button"
        onClick={() => handleOpenChange(false)}
        aria-label="Fechar"
        className="-mr-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-petroleo"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );

  const linkFeedback = (sentText: string) => (
    <>
      {linkState === "sent" && (
        <div role="status" className={SUCCESS_BOX}>
          {sentText}
        </div>
      )}
      {linkError && (
        <div role="alert" className={ERROR_BOX}>
          {linkError}
        </div>
      )}
    </>
  );

  const field = (
    id: string,
    label: string,
    input: React.ReactNode,
    error?: string,
    hint?: React.ReactNode,
  ) => (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {input}
      {error && (
        <p id={`${id}-erro`} className="font-inter text-xs text-red-600">
          {error}
        </p>
      )}
      {hint}
    </div>
  );

  const inputClass = (err?: string) =>
    `${INPUT}${err ? " border-red-500 focus-visible:border-red-500" : ""}`;

  let content: React.ReactNode = null;

  if (step === "cadastro") {
    content = (
      <form onSubmit={handleCreate} noValidate className="flex flex-col gap-3.5">
        {stepHeader(() => handleOpenChange(false))}
        <div className="flex flex-col gap-1.5">
          <AlertDialogTitle className={TITLE}>Crie sua conta</AlertDialogTitle>
          <AlertDialogDescription className={BODY}>
            Leva 1 minuto. Você testa tudo por 7 dias grátis, sem cartão.
          </AlertDialogDescription>
        </div>
        {generalError && (
          <div role="alert" className={ERROR_BOX}>
            {generalError}
          </div>
        )}
        {field(
          "signup-nome",
          "Seu nome",
          <Input
            id="signup-nome"
            autoComplete="name"
            placeholder="Como você quer ser chamada"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "signup-nome-erro" : undefined}
            className={inputClass(errors.name)}
          />,
          errors.name,
        )}
        {field(
          "signup-salao",
          "Nome do salão ou espaço",
          <Input
            id="signup-salao"
            autoComplete="organization"
            placeholder="Ex.: Studio da Carla"
            value={salonName}
            onChange={(e) => {
              setSalonName(e.target.value);
              clearError("salonName");
            }}
            aria-invalid={!!errors.salonName}
            aria-describedby={errors.salonName ? "signup-salao-erro" : undefined}
            className={inputClass(errors.salonName)}
          />,
          errors.salonName,
        )}
        {field(
          "signup-whatsapp",
          "WhatsApp com DDD",
          <Input
            id="signup-whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhone(e.target.value));
              clearError("phone");
            }}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "signup-whatsapp-erro" : undefined}
            className={inputClass(errors.phone)}
          />,
          errors.phone,
        )}
        {field(
          "signup-email",
          "E-mail",
          <Input
            id="signup-email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-erro" : undefined}
            className={inputClass(errors.email)}
          />,
          errors.email,
        )}
        {field(
          "signup-senha",
          "Crie uma senha",
          <div className="relative">
            <Input
              id="signup-senha"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Você vai usar para entrar no app"
              value={password}
              onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
              aria-invalid={!!errors.password}
              aria-describedby="signup-senha-regras"
              className={`${inputClass(errors.password)} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>,
          errors.password,
          <ul
            id="signup-senha-regras"
            className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1.5 font-inter text-xs"
          >
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={ok ? "text-[#3D8B68]" : "text-ink-muted"}>
                  <span aria-hidden="true">{ok ? "✓" : "○"}</span> {rule.label}
                  <span className="sr-only">{ok ? " (ok)" : " (falta)"}</span>
                </li>
              );
            })}
          </ul>,
        )}
        <p className="font-inter text-xs leading-[1.45] text-ink-muted">
          Ao criar sua conta, você aceita os{" "}
          <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-brand-vinho underline-offset-2 hover:underline">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-brand-vinho underline-offset-2 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
        <button type="submit" disabled={creating} className={PRIMARY}>
          Criar minha conta
          {creating && <Spinner size="sm" variant="primary" />}
        </button>
      </form>
    );
  }

  if (step === "ja_tem_conta") {
    const backToCadastro = () => {
      focusEmailRef.current = true;
      setStep("cadastro");
    };
    content = (
      <div className="flex flex-col gap-3.5">
        {stepHeader(() => setStep("cadastro"))}
        <AlertDialogTitle className={TITLE}>Crie sua conta</AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Esse e-mail já tem conta no Agenda Bela.
        </AlertDialogDescription>
        {field(
          "signup-email-existente",
          "E-mail",
          <Input
            id="signup-email-existente"
            value={email}
            readOnly
            aria-invalid
            className={`${INPUT} border-2 border-[#A94468]`}
          />,
        )}
        <div className="flex flex-col gap-3 rounded-2xl bg-[#FCEEF2] p-4">
          <p className="font-inter text-base font-bold text-brand-petroleo">
            Esse e-mail já tem conta.
          </p>
          <p className="font-inter text-sm leading-normal text-[#4A4548]">
            Entre no app com ele. Sua agenda e suas clientes continuam lá.
          </p>
          <OpenAppButton
            label="Entrar no app"
            ctaLocation="ja_tem_conta_entrar_app"
            className={`${PRIMARY} rounded-xl py-3.5 text-base`}
          />
          <button
            type="button"
            className={`${SECONDARY} rounded-xl`}
            disabled={linkState === "sending"}
            onClick={() => requestLink("ja_tem_conta", email.trim().toLowerCase())}
          >
            {linkState === "sending" ? "Mandando..." : "Esqueci a senha"}
          </button>
          {linkFeedback("Se esse e-mail tiver conta, mandei o link no seu WhatsApp e no e-mail.")}
          <button type="button" onClick={backToCadastro} className={LINK}>
            Usar outro e-mail
          </button>
        </div>
      </div>
    );
  }

  if (step === "escolha") {
    content = (
      <div className="flex flex-col gap-[18px]">
        {closeButton}
        <div role="status" className="flex items-start gap-2.5 rounded-[14px] bg-[#EAF7F0] p-3.5 font-inter text-sm leading-[1.45] text-[#2E6B50]">
          <Check className="mt-px" />
          <span>
            Conta criada{firstName ? `, ${firstName}` : ""}. Seu e-mail e sua senha já valem para entrar no app.
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <AlertDialogTitle className={`${TITLE} text-[27px] leading-[1.18]`}>
            Como você quer começar seus 7 dias?
          </AlertDialogTitle>
          <AlertDialogDescription className={BODY}>
            Nos dois jeitos você usa tudo, igualzinho.
          </AlertDialogDescription>
        </div>
        <button
          type="button"
          onClick={() => choosePath("cartao", "escolha")}
          className="flex flex-col gap-2 rounded-[18px] border-2 border-brand-vinho bg-brand-rosa-50 p-[18px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo"
        >
          <span className="self-start rounded-full bg-brand-vinho px-[9px] py-1 font-inter text-[11px] font-bold tracking-[0.6px] text-white">
            SEM PREOCUPAÇÃO DEPOIS
          </span>
          <span className="font-inter text-[19px] font-bold text-brand-petroleo">
            Já cadastrar o cartão
          </span>
          <span className="font-inter text-sm leading-[1.45] text-[#4A4548]">
            Nada é cobrado hoje. Depois dos 7 dias, R$ 59,90 por mês. Cancele quando quiser.
          </span>
        </button>
        <button
          type="button"
          onClick={() => choosePath("sem_cartao", "escolha")}
          className="flex flex-col gap-2 rounded-[18px] border border-[#E2D3CB] bg-white p-[18px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-petroleo"
        >
          <span className="font-inter text-lg font-bold text-brand-petroleo">
            Testar 7 dias sem cartão
          </span>
          <span className="font-inter text-sm leading-[1.45] text-[#4A4548]">
            Baixe o app e comece agora. No fim dos 7 dias, você decide se assina.
          </span>
        </button>
        <p className="mt-auto text-center font-inter text-[13px] leading-normal text-ink-muted">
          Se fechar esta página agora, tudo bem: sua conta já está criada e o teste sem cartão continua valendo.
        </p>
      </div>
    );
  }

  if (step === "sem_cartao") {
    content = (
      <div className="flex flex-col gap-4">
        {closeButton}
        <AlertDialogTitle className={TITLE}>
          {firstName ? `Pronto, ${firstName}! Agora é no app.` : "Pronto! Agora é no app."}
        </AlertDialogTitle>
        {ctx ? (
          <AlertDialogDescription className="rounded-[14px] bg-brand-creme-soft px-3.5 py-[13px] font-inter text-sm leading-[1.45] text-[#8A5220]">
            Seus 7 dias grátis começam quando você configurar sua agenda no app. Não precisa correr.
          </AlertDialogDescription>
        ) : (
          // Genérica: volta do checkout sem o contexto desta aba.
          <AlertDialogDescription className="sr-only">
            Baixe o app e entre com seu e-mail e senha.
          </AlertDialogDescription>
        )}
        <div className="flex flex-col gap-2.5">
          <p className="font-inter text-[15px] font-bold text-brand-petroleo">
            1. Baixe o app Agenda Bela
          </p>
          <StoreBadges ctaLocation="cadastro_sem_cartao_selo" />
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="font-inter text-[15px] font-bold text-brand-petroleo">
            2. Toque no link que a Bela te mandou no WhatsApp
          </p>
          <div aria-hidden="true" className="flex flex-col gap-2 rounded-[14px] bg-[#E9F8E4] p-3">
            <div className="rounded-[10px] bg-white px-3 py-[11px] font-inter text-sm leading-[1.45] text-ink">
              Oi{firstName ? `, ${firstName}` : ""}! Sou a Bela. Sua conta do Agendabela está pronta. Toque abaixo para entrar no app.
            </div>
            <div className="rounded-[10px] bg-white p-2.5 text-center font-inter text-sm font-semibold text-[#1F7AD1]">
              Entrar no Agendabela
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-inter text-[15px] font-bold text-brand-petroleo">
            Ou entre com seu e-mail e senha
          </p>
          {ctx?.email && (
            <p className="font-inter text-sm text-[#4A4548] break-all">E-mail: {ctx.email}</p>
          )}
        </div>
        <OpenAppButton label="Já baixei, abrir o app" ctaLocation="cadastro_sem_cartao_abrir_app" desktopHint={false} />
        {ctx?.email && (
          <button
            type="button"
            className={LINK}
            disabled={linkState === "sending"}
            onClick={() => requestLink("sem_cartao", ctx.email)}
          >
            {linkState === "sending" ? "Reenviando..." : "Não chegou? Reenviar link"}
          </button>
        )}
        {linkFeedback("Mandei o link de novo no seu WhatsApp e no e-mail. Pode levar até 1 minuto.")}
        {ctx && (
          <p className="mt-auto text-center font-inter text-xs leading-normal text-ink-muted">
            Depois dos 7 dias, sua agenda continua lá para você consultar. Para seguir marcando, é só assinar pelo app.
          </p>
        )}
      </div>
    );
  }

  if (step === "cartao") {
    content = (
      <form onSubmit={handleStartTrial} noValidate className="flex flex-col gap-4">
        {closeButton}
        <AlertDialogTitle className={TITLE}>Cadastre seu cartão</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="flex flex-col gap-2 rounded-2xl border border-surface-alt-border bg-brand-rosa-50 p-4">
            <span className="font-inter text-lg font-bold text-brand-petroleo">
              7 dias grátis. Você não paga nada hoje.
            </span>
            <span className="font-inter text-sm leading-[1.45] text-[#4A4548]">
              Depois dos 7 dias, R$ 59,90 por mês. Cancele quando quiser.
            </span>
            <span className="font-inter text-sm text-[#4A4548]">
              Primeira cobrança em {formatTrialEndDate()}, só se você não cancelar antes.
            </span>
          </div>
        </AlertDialogDescription>
        {generalError && (
          <div role="alert" className={ERROR_BOX}>
            {generalError}
          </div>
        )}
        {field(
          "signup-cpf",
          "CPF ou CNPJ",
          <Input
            id="signup-cpf"
            inputMode="numeric"
            placeholder="Só números"
            value={taxId}
            onChange={(e) => setTaxId(formatTaxId(e.target.value))}
            aria-invalid={!!taxIdError}
            aria-describedby={taxIdError ? "signup-cpf-erro" : "signup-cpf-dica"}
            className={inputClass(taxIdError ?? undefined)}
          />,
          taxIdError ?? undefined,
          <span id="signup-cpf-dica" className="font-inter text-xs text-ink-muted">
            Pedido só aqui, para o pagamento.
          </span>,
        )}
        <button type="submit" disabled={openingCheckout || !ctx} className={PRIMARY}>
          Cadastrar cartão e começar
          {openingCheckout && <Spinner size="sm" variant="primary" />}
        </button>
        <button type="button" className={LINK} onClick={() => choosePath("sem_cartao", "cartao")}>
          Prefiro testar sem cartão
        </button>
        <p className="text-center font-inter text-xs text-ink-muted">
          Pagamento seguro pela AbacatePay. Você volta para cá no fim.
        </p>
      </form>
    );
  }

  if (step === "aprovado") {
    content = (
      <div className="flex flex-col gap-4">
        {closeButton}
        <AlertDialogTitle className={`${TITLE} text-[27px] leading-[1.2]`}>
          Cartão cadastrado! Seus 7 dias grátis começaram
        </AlertDialogTitle>
        <AlertDialogDescription className={`${BODY} leading-normal`}>
          {chargeDateUnknown
            ? "Seu cartão já estava cadastrado. A data da primeira cobrança, de R$ 59,90, está no seu perfil no app. Para cancelar antes, é só entrar no seu perfil."
            : `Nada foi cobrado hoje. A primeira cobrança, de R$ 59,90, será em ${formatTrialEndDate()}. Para cancelar antes, é só entrar no seu perfil.`}
        </AlertDialogDescription>
        <div className={SUCCESS_BOX}>
          Em até 1 minuto você recebe no WhatsApp o link para entrar no app Agenda Bela.
        </div>
        <StoreBadges ctaLocation="cadastro_concluido_selo" />
        <OpenAppButton label="Já baixei, abrir o app" ctaLocation="cadastro_concluido_abrir_app" desktopHint={false} />
        {ctx?.email && (
          <button
            type="button"
            className={LINK}
            disabled={linkState === "sending"}
            onClick={() => requestLink("aprovado", ctx.email)}
          >
            {linkState === "sending" ? "Reenviando..." : "Não recebeu? Reenviar link"}
          </button>
        )}
        {linkFeedback("Mandei o link de novo no seu WhatsApp e no e-mail. Pode levar até 1 minuto.")}
      </div>
    );
  }

  if (step === "desistiu") {
    content = (
      <div className="flex flex-col gap-4">
        {closeButton}
        <AlertDialogTitle className={`${TITLE} text-[27px] leading-[1.2]`}>
          Tudo bem, sua conta continua criada.
        </AlertDialogTitle>
        <AlertDialogDescription className={`${BODY} leading-normal`}>
          Você pode começar agora sem cartão e cadastrar depois, pelo app, quando quiser.
        </AlertDialogDescription>
        <button type="button" className={PRIMARY} onClick={() => choosePath("sem_cartao", "desistiu")}>
          Testar 7 dias sem cartão
        </button>
        {ctx && (
          <button type="button" className={SECONDARY} onClick={() => choosePath("cartao", "desistiu")}>
            Tentar cadastrar o cartão de novo
          </button>
        )}
        <p className="text-center font-inter text-[13px] text-ink-muted">Nada foi cobrado.</p>
      </div>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className={`${fraunces.variable} ${inter.variable} font-inter inset-0 left-0 top-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 bg-white px-[22px] pb-6 pt-[22px] data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:max-w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[22px] sm:border sm:border-surface-alt-border sm:shadow-brand-lg`}
      >
        <div className="flex min-h-full flex-1 flex-col">{content}</div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
