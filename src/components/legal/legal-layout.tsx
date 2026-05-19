import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// <LegalLayout />
//
// Layout compartilhado pras páginas legais (Termos de Serviço, Política de
// Privacidade). Usa identidade visual do app — paleta creme/rosa/petróleo,
// Fraunces italic nos títulos, Inter no corpo. Sidebar com nav + conteúdo.
// ─────────────────────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  pageTitle: string;
  pageSubtitle: string;
  lastUpdated: string;
  controllerName: string;
  sections: LegalSection[];
  children: ReactNode;
}

export function LegalLayout({
  pageTitle,
  pageSubtitle,
  lastUpdated,
  controllerName,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-surface-subtle text-ink">
      {/* Header simples */}
      <header className="w-full px-5 md:px-10 lg:px-20 pt-6 md:pt-10 mb-6 md:mb-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/agendabela/automatize-seu-atendimento">
            <Image
              src="/brand/logo-wine-cream.png"
              alt="Agenda Bela"
              width={140}
              height={40}
              priority
              className="h-auto w-[120px] md:w-[150px]"
            />
          </Link>
          <Link
            href="/agendabela/automatize-seu-atendimento"
            className="font-inter text-[13px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:px-10 lg:px-8 pb-16 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside className="top-10 h-fit rounded-app-xl bg-brand-creme p-6 md:p-8 lg:sticky lg:w-80 relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-brand-rosa-claro opacity-30"
          />

          <div className="relative space-y-4">
            <span className="font-mono-brand text-[10px] tracking-[2px] uppercase text-brand-vinho">
              Agenda Bela
            </span>
            <h1 className="font-fraunces italic font-normal text-brand-petroleo text-[28px] leading-[32px] md:text-[34px] md:leading-[38px] tracking-[-0.02em]">
              {pageTitle}
            </h1>
            <p className="font-inter text-[14px] leading-[22px] text-ink-muted">
              {pageSubtitle}
            </p>
          </div>

          <div className="relative rounded-app-md bg-white shadow-brand-xs p-4 mt-5 font-inter text-[12px] leading-[18px] text-ink-muted">
            <p>
              <strong className="text-ink">Última atualização:</strong>{" "}
              {lastUpdated}
            </p>
            <p>
              <strong className="text-ink">Responsável:</strong>{" "}
              {controllerName}
            </p>
          </div>

          <nav aria-label="Navegação" className="relative mt-6">
            <ul className="space-y-2.5 font-inter text-[13px] text-ink-muted">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="hover:text-brand-petroleo transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 rounded-app-xl bg-surface-alt-card border border-surface-alt-border p-6 sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}

interface LegalSectionBlockProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSectionBlock({
  id,
  title,
  children,
}: LegalSectionBlockProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-4 border-t border-surface-alt-border pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="font-fraunces italic font-normal text-brand-petroleo text-[22px] leading-[26px] md:text-[26px] md:leading-[32px] tracking-[-0.015em]">
        {title}
      </h2>
      <div className="space-y-4 font-inter text-[15px] leading-[24px] text-ink">
        {children}
      </div>
    </section>
  );
}
