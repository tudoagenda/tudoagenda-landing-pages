import Link from "next/link";
import Image from "next/image";

export const FooterComponent = () => {
  return (
    <footer className="w-full bg-surface-subtle px-5 md:px-10 lg:px-20 py-10 md:py-12 border-t border-surface-alt-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Image
            src="/brand/logo-app.png"
            alt="Agenda Bela"
            width={56}
            height={56}
            className="h-12 w-12"
          />
          <span className="font-mono-brand text-[10px] tracking-[2px] uppercase text-brand-vinho">
            por Tudo Agenda
          </span>
        </div>

        <nav className="flex flex-col md:flex-row gap-3 md:gap-6 items-center">
          <Link
            href="/agendabela/blog"
            className="font-inter text-[13px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/termos"
            className="font-inter text-[13px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            Termos de serviço
          </Link>
          <Link
            href="/privacidade"
            className="font-inter text-[13px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            Política de privacidade
          </Link>
          <a
            href="mailto:contato@tudoagenda.com.br"
            className="font-inter text-[13px] text-ink-muted hover:text-brand-petroleo transition-colors"
          >
            contato@tudoagenda.com.br
          </a>
        </nav>
      </div>

      <p className="text-center md:text-left font-inter text-[11px] text-ink-subtle mt-8">
        © {new Date().getFullYear()} Tudo Agenda. Todos os direitos reservados.
      </p>
    </footer>
  );
};
