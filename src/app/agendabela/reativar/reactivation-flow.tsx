"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReactivationLookup, useReactivationStart } from "@/hooks/use-reactivation";
import {
  pushAgendaBelaReativacaoEvent,
} from "@/lib/analytics/dataLayer";
import type { ReactivationLookupResponse } from "@/services/reactivation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(pw)) return "Precisa de letra maiúscula";
  if (!/[a-z]/.test(pw)) return "Precisa de letra minúscula";
  if (!/[0-9]/.test(pw)) return "Precisa de número";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Precisa de caractere especial (!@#$...)";
  return null;
}

// ---------------------------------------------------------------------------
// Tipos de step
// ---------------------------------------------------------------------------

type Step =
  | "lookup"        // Usuária informa email/WhatsApp
  | "confirm"       // Mostra dados mascarados e pede nova senha
  | "redirecting"   // Redirecionando para AbacatePay
  | "success"       // Tela pós-checkout (volta com ?reactivation=success)
  | "already_active"
  | "new_signup_required"
  | "token_expired"
  | "error";

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ReactivationFlow() {
  const [step, setStep] = useState<Step>("lookup");
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<ReactivationLookupResponse | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const lookup = useReactivationLookup();
  const startReactivation = useReactivationStart();

  // Detecta volta do AbacatePay com ?reactivation=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reactivation") === "success") {
      setStep("success");
      const url = new URL(window.location.href);
      url.searchParams.delete("reactivation");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleLookupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIdentifierError(null);
    setGeneralError(null);

    const value = identifier.trim();
    if (!value) {
      setIdentifierError("Informe seu email ou WhatsApp.");
      return;
    }

    lookup.mutate(value, {
      onSuccess: (data) => {
        setLookupResult(data);

        if (data.status === "ALREADY_ACTIVE") {
          setStep("already_active");
          return;
        }

        if (data.status === "NEW_SIGNUP_REQUIRED") {
          setStep("new_signup_required");
          return;
        }

        // LEGACY_PROFILE_FOUND — mostra confirmação + dispara paywall_viewed
        setStep("confirm");
        pushAgendaBelaReativacaoEvent({
          event: "paywall_viewed",
          flow: "reactivation",
          landing_slug: "reativacao",
        });
      },
      onError: (err) => {
        setGeneralError(err.message ?? "Erro ao buscar conta. Tente novamente.");
      },
    });
  }

  function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    const pwErr = validatePassword(password);
    if (pwErr) {
      setPasswordError(pwErr);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("As senhas não coincidem.");
      return;
    }

    if (!lookupResult?.reactivationToken) {
      setGeneralError("Sessão perdida. Reinicie o processo.");
      setStep("lookup");
      return;
    }

    // Dispara checkout_opened antes de redirecionar
    pushAgendaBelaReativacaoEvent({
      event: "checkout_opened",
      flow: "reactivation",
      source: "lp_reactivation",
    });

    startReactivation.mutate(
      { reactivationToken: lookupResult.reactivationToken, password },
      {
        onSuccess: (data) => {
          setStep("redirecting");
          window.location.href = data.checkoutUrl;
        },
        onError: (err) => {
          if (err.code === "TOKEN_EXPIRED" || err.status === 410) {
            setStep("token_expired");
            return;
          }
          setGeneralError(
            err.message ?? "Erro ao iniciar pagamento. Tente novamente.",
          );
        },
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-dvh bg-surface-subtle flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <Image
          src="/brand/logo-app.png"
          alt="Agenda Bela"
          width={56}
          height={56}
          priority
          className="h-12 w-12"
        />
        <span className="font-mono-brand text-[10px] tracking-[2px] uppercase text-brand-vinho">
          por Tudo Agenda
        </span>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col items-center justify-start px-5 pb-16 max-w-lg mx-auto w-full">

        {/* ------------------------------------------------------------------ */}
        {/* Step: lookup                                                         */}
        {/* ------------------------------------------------------------------ */}
        {step === "lookup" && (
          <div className="w-full space-y-6">
            {/* Chamada emocional */}
            <div className="space-y-2 pt-4">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Reative sua conta
              </span>
              <h1 className="font-fraunces italic font-normal text-brand-petroleo text-[34px] leading-[36px] tracking-[-0.02em]">
                O Agenda Bela agora virou app.
              </h1>
              <p className="font-inter text-ink-muted text-[15px] leading-[22px]">
                Mantenha seus dados antigos e reative cadastrando o cartão.
                Teste grátis por 30 dias.
              </p>
            </div>

            {/* Bullets de garantias */}
            <ul className="space-y-2">
              {[
                "Você não será cobrada hoje.",
                "Depois dos 30 dias, R$59,90/mês.",
                "Pode cancelar quando quiser.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 font-inter text-[14px] text-ink"
                >
                  <span className="inline-flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-brand-rosa-50 text-brand-rosa font-bold text-[11px] shrink-0">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Formulário */}
            <form onSubmit={handleLookupSubmit} className="space-y-3">
              <div>
                <Input
                  type="text"
                  placeholder="Email ou WhatsApp cadastrado"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="email"
                  className={identifierError ? "border-red-500" : ""}
                  aria-label="Email ou WhatsApp"
                  aria-invalid={!!identifierError}
                  aria-describedby={identifierError ? "identifier-error" : undefined}
                />
                {identifierError && (
                  <p id="identifier-error" className="text-xs text-red-500 mt-1">
                    {identifierError}
                  </p>
                )}
              </div>

              {generalError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3"
                >
                  {generalError}
                </div>
              )}

              <Button
                type="submit"
                variant="brand-primary"
                size="lg"
                disabled={lookup.isPending}
                className="w-full rounded-full font-inter font-semibold"
              >
                {lookup.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
                    Buscando sua conta...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>

              <p className="text-center font-inter text-[12px] text-ink-muted">
                Não tem conta?{" "}
                <Link
                  href="/agendabela/automatize-seu-atendimento"
                  className="text-brand-rosa hover:text-brand-rosa-hover underline"
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: confirm                                                        */}
        {/* ------------------------------------------------------------------ */}
        {step === "confirm" && lookupResult && (
          <div className="w-full space-y-6 pt-4">
            <div className="space-y-2">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Encontramos sua conta
              </span>
              <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[28px] leading-[32px] tracking-[-0.015em]">
                {lookupResult.salonName
                  ? `${lookupResult.salonName}`
                  : "Sua conta foi encontrada"}
              </h2>
            </div>

            {/* Card com dados mascarados */}
            <div className="rounded-app-md bg-brand-creme border border-brand-creme-soft p-4 space-y-2 font-inter text-[14px]">
              {lookupResult.maskedEmail && (
                <p>
                  <span className="text-ink-muted">Email: </span>
                  <span className="font-medium text-brand-petroleo">
                    {lookupResult.maskedEmail}
                  </span>
                </p>
              )}
              {lookupResult.maskedPhone && (
                <p>
                  <span className="text-ink-muted">WhatsApp: </span>
                  <span className="font-medium text-brand-petroleo">
                    {lookupResult.maskedPhone}
                  </span>
                </p>
              )}
            </div>

            <p className="font-inter text-[14px] text-ink-muted leading-relaxed">
              Crie uma nova senha para reativar sua conta. Seus dados e
              agendamentos anteriores serão mantidos.
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-3">
              {/* Senha */}
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                    aria-label="Nova senha"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "pw-error" : "pw-hint"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
                {passwordError ? (
                  <p id="pw-error" className="text-xs text-red-500 mt-1">
                    {passwordError}
                  </p>
                ) : (
                  <p id="pw-hint" className="text-xs text-ink-muted mt-1">
                    Min. 8 caracteres, maiúscula, minúscula, número e especial
                  </p>
                )}
              </div>

              {/* Confirmar senha */}
              <div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={
                      confirmError ? "border-red-500 pr-10" : "pr-10"
                    }
                    aria-label="Confirme a senha"
                    aria-invalid={!!confirmError}
                    aria-describedby={confirmError ? "confirm-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
                {confirmError && (
                  <p id="confirm-error" className="text-xs text-red-500 mt-1">
                    {confirmError}
                  </p>
                )}
              </div>

              {generalError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3"
                >
                  {generalError}
                </div>
              )}

              {/* Garantias antes do CTA */}
              <ul className="space-y-1.5 pt-1">
                {[
                  "Você não será cobrada hoje.",
                  "Depois dos 30 dias, R$59,90/mês.",
                  "Pode cancelar quando quiser.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 font-inter text-[13px] text-ink-muted"
                  >
                    <span className="text-brand-rosa font-bold text-[11px]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                type="submit"
                variant="brand-primary"
                size="lg"
                disabled={startReactivation.isPending}
                className="w-full rounded-full font-inter font-semibold"
              >
                {startReactivation.isPending ? (
                  <>
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden
                    />
                    Abrindo pagamento...
                  </>
                ) : (
                  "Reativar com 30 dias grátis"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("lookup");
                  setLookupResult(null);
                  setPassword("");
                  setConfirmPassword("");
                  setGeneralError(null);
                }}
                className="w-full text-center font-inter text-[13px] text-ink-muted hover:text-brand-petroleo underline"
              >
                Não é sua conta? Voltar
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: redirecting                                                    */}
        {/* ------------------------------------------------------------------ */}
        {step === "redirecting" && (
          <div className="w-full flex flex-col items-center justify-center pt-16 gap-4 text-center">
            <Loader2
              className="w-10 h-10 text-brand-rosa animate-spin"
              aria-hidden
            />
            <p className="font-fraunces italic text-[22px] text-brand-petroleo">
              Abrindo pagamento...
            </p>
            <p className="font-inter text-[14px] text-ink-muted">
              Você será redirecionada para o ambiente seguro da AbacatePay.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: success                                                        */}
        {/* ------------------------------------------------------------------ */}
        {step === "success" && (
          <div className="w-full space-y-5 pt-4">
            <div className="space-y-2">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Tudo certo!
              </span>
              <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[30px] leading-[34px] tracking-[-0.015em]">
                Cartão confirmado. Bem-vinda de volta!
              </h2>
            </div>

            <div className="rounded-app-md bg-brand-creme border border-brand-creme-soft p-4 font-inter text-[14px] text-brand-petroleo space-y-1">
              <p className="font-semibold">30 dias grátis começam agora.</p>
              <p className="text-ink-muted">
                Primeira cobrança automática em 30 dias — R$59,90/mês. Cancele
                quando quiser.
              </p>
            </div>

            <p className="font-inter text-[14px] text-ink-muted leading-relaxed">
              Em até 1 minuto você vai receber no WhatsApp o link para abrir o
              app Agenda Bela. Se ainda não tiver instalado, baixe agora:
            </p>

            {/* App store badges — reutilizando componente se existir, senão links simples */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://apps.apple.com/br/app/agenda-bela/id6742810003"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-brand-petroleo text-white font-inter text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                App Store (iOS)
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-brand-petroleo text-white font-inter text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Google Play (Android)
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: already_active                                                 */}
        {/* ------------------------------------------------------------------ */}
        {step === "already_active" && (
          <div className="w-full space-y-5 pt-4">
            <div className="space-y-2">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Conta ativa
              </span>
              <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[28px] leading-[32px] tracking-[-0.015em]">
                Sua conta já está ativa.
              </h2>
            </div>

            <div
              role="status"
              className="rounded-app-md bg-brand-creme border border-brand-creme-soft p-4 font-inter text-[14px] text-brand-petroleo"
            >
              <p>
                Você já tem uma assinatura ativa. Para acessar sua conta, use o
                magic link que chegou no seu WhatsApp ou faça login pelo app.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://apps.apple.com/br/app/agenda-bela/id6742810003"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-brand-petroleo text-white font-inter text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Baixar app (iOS)
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.tudoagenda.agendabela"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-brand-petroleo text-white font-inter text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Baixar app (Android)
              </a>
            </div>

            <button
              type="button"
              onClick={() => setStep("lookup")}
              className="w-full text-center font-inter text-[13px] text-ink-muted hover:text-brand-petroleo underline"
            >
              Tentar com outro email ou WhatsApp
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: new_signup_required                                            */}
        {/* ------------------------------------------------------------------ */}
        {step === "new_signup_required" && (
          <div className="w-full space-y-5 pt-4">
            <div className="space-y-2">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Conta não encontrada
              </span>
              <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[28px] leading-[32px] tracking-[-0.015em]">
                Não encontramos sua conta.
              </h2>
            </div>

            <div
              role="status"
              className="rounded-app-md bg-brand-creme border border-brand-creme-soft p-4 font-inter text-[14px] text-brand-petroleo"
            >
              <p>
                Não localizamos nenhuma conta com esse email ou WhatsApp. Se
                você é nova por aqui, faça seu cadastro e ganhe 30 dias grátis.
              </p>
            </div>

            <Link
              href="/agendabela/automatize-seu-atendimento"
              className="inline-flex items-center justify-center w-full h-12 px-6 rounded-full bg-brand-rosa hover:bg-brand-rosa-hover text-white font-inter font-semibold text-[15px] transition-colors"
            >
              Criar conta nova com 30 dias grátis
            </Link>

            <button
              type="button"
              onClick={() => {
                setStep("lookup");
                setIdentifier("");
              }}
              className="w-full text-center font-inter text-[13px] text-ink-muted hover:text-brand-petroleo underline"
            >
              Tentar com outro email ou WhatsApp
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: token_expired                                                  */}
        {/* ------------------------------------------------------------------ */}
        {step === "token_expired" && (
          <div className="w-full space-y-5 pt-4">
            <div className="space-y-2">
              <span className="font-mono-brand text-[11px] tracking-[2px] uppercase text-brand-vinho">
                Sessão expirada
              </span>
              <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[28px] leading-[32px] tracking-[-0.015em]">
                O tempo esgotou.
              </h2>
            </div>

            <div
              role="alert"
              className="rounded-app-md bg-red-50 border border-red-200 p-4 font-inter text-[14px] text-red-700"
            >
              <p>
                Por segurança, a sessão expirou após 15 minutos. Por favor,
                reinicie o processo.
              </p>
            </div>

            <Button
              variant="brand-primary"
              size="lg"
              onClick={() => {
                setStep("lookup");
                setLookupResult(null);
                setPassword("");
                setConfirmPassword("");
                setGeneralError(null);
              }}
              className="w-full rounded-full font-inter font-semibold"
            >
              Reiniciar
            </Button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step: error genérico                                                 */}
        {/* ------------------------------------------------------------------ */}
        {step === "error" && (
          <div className="w-full space-y-5 pt-4">
            <div
              role="alert"
              className="rounded-app-md bg-red-50 border border-red-200 p-4 font-inter text-[14px] text-red-700"
            >
              <p className="font-semibold mb-1">Algo deu errado.</p>
              <p>{generalError ?? "Tente novamente mais tarde."}</p>
            </div>

            <Button
              variant="brand-primary"
              size="lg"
              onClick={() => {
                setStep("lookup");
                setGeneralError(null);
              }}
              className="w-full rounded-full font-inter font-semibold"
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </main>

      {/* Footer mínimo */}
      <footer className="px-5 py-6 border-t border-surface-alt-border">
        <nav className="flex flex-wrap justify-center gap-4">
          <Link
            href="/termos"
            className="font-inter text-[12px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            Termos de serviço
          </Link>
          <Link
            href="/privacidade"
            className="font-inter text-[12px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            Política de privacidade
          </Link>
          <a
            href="mailto:contato@tudoagenda.com.br"
            className="font-inter text-[12px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            contato@tudoagenda.com.br
          </a>
        </nav>
        <p className="text-center font-inter text-[11px] text-ink-subtle mt-4">
          © {new Date().getFullYear()} Tudo Agenda. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
