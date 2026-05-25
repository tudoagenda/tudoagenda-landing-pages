import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const workPanels = [
  {
    title: "Secretária confirmou horários",
    text: "Trabalho recorrente resolvido antes da profissional parar o atendimento.",
    className: "right-[18rem] top-4 lg:right-[15rem]",
  },
  {
    title: "Analista encontrou oportunidades",
    text: "Horários vazios viram ação pronta, não só informação em tela.",
    className: "right-0 top-44 lg:top-48",
  },
  {
    title: "Marketing preparou retorno",
    text: "Clientes sem agenda recebem campanha com linguagem do nicho.",
    className: "bottom-8 right-[13rem] lg:right-[12rem]",
  },
];

const principles = [
  {
    title: "Vertical primeiro",
    text: "Cada produto nasce para um nicho específico e fala a linguagem dele.",
  },
  {
    title: "Agentes concretos",
    text: "Secretária, marketing, financeiro e analista, não módulos abstratos.",
  },
  {
    title: "Operação em movimento",
    text: "A usuária percebe o que foi encontrado, preparado e encaminhado.",
  },
];

const flow = ["percepção", "impacto", "ação", "resultado"];

const appScreens = [
  {
    src: "/app-screens/agenda-bela/relatorios-faturamento.jpeg",
    alt: "Tela de relatório de faturamento do Agenda Bela",
    className:
      "bottom-8 right-[15.8rem] z-10 h-[22.75rem] w-[11.125rem] opacity-95",
  },
  {
    src: "/app-screens/agenda-bela/dashboard-acabou-de-passar.jpeg",
    alt: "Tela de decisões de atendimento do Agenda Bela",
    className: "bottom-10 right-0 z-20 h-[22.75rem] w-[11.125rem] opacity-95",
  },
  {
    src: "/app-screens/agenda-bela/dashboard-resumo-do-dia.jpeg",
    alt: "Tela de resumo do dia do Agenda Bela",
    className: "bottom-0 right-[7.375rem] z-30 h-[27.875rem] w-[13.625rem]",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tudoagenda.com.br/#organization",
      name: "Tudo Agenda",
      url: "https://tudoagenda.com.br",
      logo: "https://tudoagenda.com.br/brand/tudo-agenda/favicon.png",
      description:
        "A Tudo Agenda cria SaaS verticais com agentes digitais para pequenos negócios.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "contato@tudoagenda.com.br",
        contactType: "customer support",
        availableLanguage: "pt-BR",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://tudoagenda.com.br/#website",
      name: "Tudo Agenda",
      url: "https://tudoagenda.com.br",
      inLanguage: "pt-BR",
      publisher: {
        "@id": "https://tudoagenda.com.br/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento#software",
      name: "Agenda Bela",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      url: "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento",
      image:
        "https://tudoagenda.com.br/app-screens/agenda-bela/dashboard-resumo-do-dia.jpeg",
      description:
        "SaaS para profissionais de beleza feminina com automação de atendimento e gestão de agenda.",
      publisher: {
        "@id": "https://tudoagenda.com.br/#organization",
      },
    },
  ],
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#353839]">
    {children}
  </p>
);

const CtaLink = ({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) => (
  <Link
    href={href}
    className={
      variant === "primary"
        ? "inline-flex min-h-12 items-center justify-center rounded-lg bg-[#1D1D1D] px-6 text-sm font-semibold text-[#FFFCEE] transition hover:bg-[#353839]"
        : "inline-flex min-h-12 items-center justify-center rounded-lg border border-[#1D1D1D]/20 px-6 text-sm font-semibold text-[#1D1D1D] transition hover:border-[#1D1D1D]/45"
    }
  >
    {children}
  </Link>
);

const PhoneScreen = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => (
  <div
    className={`absolute overflow-hidden rounded-[1.875rem] border-8 border-[#213745] bg-[#FFF7F0] shadow-[0_26px_70px_rgba(33,55,69,0.22)] ${className}`}
  >
    <Image src={src} alt={alt} fill sizes="220px" className="object-contain object-top" />
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FFFCEE] text-[#1D1D1D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="relative bg-[#FFFCEE]">
        <div className="absolute right-0 top-0 hidden h-[610px] w-[350px] bg-[#1D1D1D] lg:block">
          <div className="h-[360px] bg-[radial-gradient(circle_at_34%_55%,rgba(255,252,238,0.9),transparent_28%),linear-gradient(145deg,#D7F20B_0%,#EFFF00_48%,#FFFCEE_100%)] opacity-90" />
        </div>

        <header className="relative z-30 mx-auto flex max-w-[342px] items-center justify-between pt-8 sm:max-w-[1328px] sm:px-10 lg:px-0">
          <Link href="/" aria-label="Tudo Agenda" className="inline-flex">
            <Image
              src="/brand/tudo-agenda/logo.svg"
              alt="Tudo Agenda"
              width={190}
              height={148}
              priority
              className="h-auto w-[132px] sm:w-[150px]"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#353839] md:flex">
            <Link href="#o-que-fazemos">O que fazemos</Link>
            <Link href="#portfolio">Produtos</Link>
            <Link href="#como-trabalhamos">Como trabalhamos</Link>
            <Link href="#contato">Contato</Link>
            <Link
              href="#portfolio"
              className="rounded-lg border border-[#1D1D1D] bg-[#FFFCEE]/80 px-5 py-3 text-[#1D1D1D] transition hover:bg-white"
            >
              Ver produtos
            </Link>
          </nav>
        </header>

        <section className="relative z-20 mx-auto grid max-w-[342px] gap-12 pb-20 pt-20 sm:max-w-[1328px] sm:px-10 lg:grid-cols-[1fr_540px] lg:px-0 lg:pb-24 lg:pt-28">
          <div>
            <Eyebrow>Soluções para negócios verticais</Eyebrow>
            <h1 className="max-w-full text-[clamp(2.45rem,10vw,5.5rem)] font-bold leading-[0.98] tracking-normal sm:max-w-[760px]">
              SaaS verticais com agentes que trabalham pelo seu negócio.
            </h1>
            <p className="mt-8 max-w-full text-lg font-semibold leading-snug text-[#353839] sm:max-w-[650px] sm:text-2xl">
              Criamos soluções para pequenos negócios que precisam vender mais,
              organizar a operação e liberar tempo do trabalho manual.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <CtaLink href="#portfolio">Ver nossos produtos</CtaLink>
              <CtaLink href="#o-que-fazemos" variant="secondary">
                Como trabalhamos
              </CtaLink>
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block" aria-hidden="true">
            <div className="absolute -right-20 top-8 h-[520px] w-[520px] rotate-[-22deg] rounded-full border-[42px] border-[#1D1D1D] border-b-transparent border-l-transparent">
              <div className="absolute right-14 top-14 h-[230px] w-[230px] rotate-[18deg] rounded-full border-[28px] border-[#CECECE] border-r-transparent border-t-transparent" />
            </div>

            {workPanels.map((panel) => (
              <div
                key={panel.title}
                className={`absolute w-[270px] rounded-lg border border-[#1D1D1D]/15 bg-[#FFFCEE]/90 p-4 shadow-[0_24px_60px_rgba(29,29,29,0.13)] backdrop-blur ${panel.className}`}
              >
                <strong className="mb-2 flex items-start gap-2 text-lg leading-tight">
                  <span className="mt-1.5 block h-2.5 w-2.5 rounded-full bg-[#1D1D1D]" />
                  {panel.title}
                </strong>
                <span className="block text-sm font-semibold leading-snug text-[#353839]">
                  {panel.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="o-que-fazemos"
          className="relative z-20 mx-auto max-w-[342px] rounded-lg bg-[#1D1D1D] px-6 py-16 text-[#FFFCEE] sm:max-w-none sm:px-10 lg:max-w-[1328px] lg:px-16 lg:py-20"
        >
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFFCEE]/20">
            O que fazemos
          </p>
          <h2 className="max-w-full text-[clamp(2.1rem,8vw,3.5rem)] font-bold leading-none tracking-normal sm:max-w-[820px]">
            Menos dashboard. Mais trabalho realizado.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="min-h-40 rounded-lg border border-[#FFFCEE]/15 p-6"
              >
                <h3 className="mb-4 text-2xl font-bold text-[#FFFCEE]">
                  {principle.title}
                </h3>
                <p className="font-semibold leading-snug text-[#FFFCEE]/70">
                  {principle.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="como-trabalhamos"
          className="relative z-20 mx-auto max-w-[342px] py-20 sm:max-w-[1328px] sm:px-10 lg:px-0"
        >
          <Eyebrow>Como trabalhamos</Eyebrow>
          <h2 className="max-w-full text-[clamp(2.1rem,8vw,3.5rem)] font-bold leading-none tracking-normal sm:max-w-[860px]">
            Uma agente só existe quando deixa rastro de trabalho.
          </h2>
          <div className="mt-12 grid overflow-hidden rounded-lg border border-[#1D1D1D]/15 bg-[#FFFCEE]/70 md:grid-cols-4">
            {flow.map((item, index) => (
              <div
                key={item}
                className="min-h-36 border-b border-[#1D1D1D]/10 p-6 md:border-b-0 md:border-r md:last:border-r-0"
              >
                <small className="mb-8 block text-xs font-semibold uppercase tracking-[0.12em] text-[#A8A8A8]">
                  {String(index + 1).padStart(2, "0")}
                </small>
                <strong className="text-2xl font-bold">{item}</strong>
              </div>
            ))}
          </div>
        </section>

        <section
          id="portfolio"
          className="relative z-20 mx-auto grid max-w-[342px] gap-10 pb-20 sm:max-w-[1328px] sm:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:px-0"
        >
          <div className="flex min-h-[420px] flex-col justify-between border-t border-[#1D1D1D]/20 pt-7">
            <div>
              <Eyebrow>Portfólio</Eyebrow>
              <h2 className="max-w-full text-[clamp(2.1rem,8vw,3.5rem)] font-bold leading-none tracking-normal sm:max-w-[620px]">
                Um portfólio de SaaS verticais.
              </h2>
              <p className="mt-12 max-w-[450px] text-xl font-semibold leading-snug text-[#353839]">
                Cada SaaS nasce para um nicho específico, com marca própria,
                linguagem própria e especialistas digitais cuidando de rotinas
                recorrentes.
              </p>
            </div>
            <CtaLink href="/agendabela/automatize-seu-atendimento">
              Conhecer Agenda Bela
            </CtaLink>
          </div>

          <article className="relative min-h-[470px] overflow-hidden rounded-lg border border-[#90496A]/20 bg-[radial-gradient(circle_at_82%_18%,rgba(255,91,142,0.18),transparent_28%),linear-gradient(135deg,#FFE3CC,#FFF7F0_52%,#FFE9EF)] p-8">
            <div className="absolute left-8 top-8 z-10 h-28 w-28 rounded-[28px] bg-white/45 p-4 shadow-[0_18px_42px_rgba(144,73,106,0.16)]">
              <Image
                src="/brand/agenda-bela/logo-app.png"
                alt="Agenda Bela"
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="absolute -left-16 bottom-0 top-0 z-0 flex items-center opacity-[0.055]">
              <Image
                src="/brand/agenda-bela/logo-app.png"
                alt=""
                width={420}
                height={420}
                className="h-[420px] w-[420px] object-contain"
              />
            </div>

            <div className="absolute bottom-6 right-10 h-[460px] w-[430px] max-lg:relative max-lg:bottom-auto max-lg:right-auto max-lg:mt-8 max-lg:h-[390px] max-lg:w-full">
              {appScreens.map((screen) => (
                <PhoneScreen key={screen.src} {...screen} />
              ))}
            </div>
          </article>
        </section>

        <footer
          id="contato"
          className="relative z-20 mx-auto flex max-w-[342px] flex-col gap-6 border-t border-[#1D1D1D]/10 py-10 text-[#353839] sm:max-w-[1328px] sm:px-10 md:flex-row md:items-center md:justify-between lg:px-0"
        >
          <Image
            src="/brand/tudo-agenda/logo.svg"
            alt="Tudo Agenda"
            width={170}
            height={132}
            className="h-auto w-[150px]"
          />
          <p className="max-w-xl text-sm font-semibold">
            Soluções que organizam seu negócio e otimizam seu tempo.
          </p>
          <Link href="/privacidade" className="text-sm font-semibold hover:underline">
            Política de privacidade
          </Link>
        </footer>
      </div>
    </main>
  );
}
