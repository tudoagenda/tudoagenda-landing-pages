import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getProductBlogConfig,
  getProductBlogPosts,
} from "@/content/product-blogs";
import type { BlogPost } from "@/content/product-blogs";

const siteUrl = "https://tudoagenda.com.br";
const config = getProductBlogConfig("agendabela");
const posts = getProductBlogPosts("agendabela");

const categoryLabels: Record<BlogPost["category"], string> = {
  "agenda-e-organizacao": "Agenda e organização",
  "faltas-e-lembretes": "Faltas e lembretes",
  "agendamento-online": "Agendamento online",
  profissionalizacao: "Profissionalização",
  "rotina-da-profissional": "Rotina da profissional",
};

export const metadata: Metadata = {
  title: `${config.blogTitle} | Guias para profissionais da beleza`,
  description: config.blogDescription,
  alternates: {
    canonical: config.basePath,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${siteUrl}${config.basePath}`,
    siteName: "Agenda Bela",
    title: config.blogTitle,
    description: config.blogDescription,
    images: [
      {
        url: "/brand/agenda-bela/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Agenda Bela",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: config.blogTitle,
    description: config.blogDescription,
    images: ["/brand/agenda-bela/social-preview.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${siteUrl}${config.basePath}#blog`,
  name: config.blogTitle,
  description: config.blogDescription,
  url: `${siteUrl}${config.basePath}`,
  publisher: {
    "@type": "Organization",
    name: "Tudo Agenda",
    url: siteUrl,
  },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${siteUrl}${config.basePath}/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
  })),
};

export default function AgendaBelaBlogPage() {
  const [featuredPost, ...secondaryPosts] = posts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main className="min-h-screen bg-surface-subtle text-ink">
        <header className="px-5 md:px-10 lg:px-20 pt-6 md:pt-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              href={config.landingPath}
              className="flex items-center gap-3"
              aria-label="Ir para a página do Agenda Bela"
            >
              <Image
                src="/brand/logo-app.png"
                alt="Agenda Bela"
                width={56}
                height={56}
                priority
                className="h-12 w-12"
              />
              <span className="hidden font-mono-brand text-[10px] uppercase tracking-[2px] text-brand-vinho sm:inline">
                por Tudo Agenda
              </span>
            </Link>
            <Link
              href={config.landingPath}
              className="font-inter text-sm font-semibold text-brand-petroleo hover:text-brand-vinho"
            >
              Conhecer o app
            </Link>
          </div>
        </header>

        <section className="px-5 md:px-10 lg:px-20 py-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <span className="font-mono-brand text-[11px] uppercase tracking-[2px] text-brand-vinho">
                {config.themeEyebrow}
              </span>
              <h1 className="mt-4 max-w-[12ch] font-fraunces text-[46px] font-normal italic leading-[48px] tracking-[-0.025em] text-brand-petroleo md:text-[72px] md:leading-[72px]">
                Conteúdo para deixar sua agenda mais leve.
              </h1>
            </div>
            <p className="max-w-2xl font-inter text-[17px] leading-8 text-ink-muted md:text-[19px]">
              Guias práticos para quem atende, responde cliente, organiza
              horários e ainda precisa fazer o salão vender. Começamos pelo
              Agenda Bela, mas esta estrutura já nasce pronta para os próximos
              produtos verticais da Tudo Agenda.
            </p>
          </div>
        </section>

        <section className="px-5 md:px-10 lg:px-20 pb-10 md:pb-16">
          <div className="mx-auto max-w-7xl">
            <Link
              href={`${config.basePath}/${featuredPost.slug}`}
              className="group grid overflow-hidden rounded-app-xl bg-brand-creme shadow-brand-md transition-transform hover:-translate-y-1 lg:grid-cols-[1fr_1.1fr]"
            >
              <div className="flex min-h-[260px] flex-col justify-between p-7 md:p-10">
                <div>
                  <span className="font-mono-brand text-[10px] uppercase tracking-[2px] text-brand-vinho">
                    Artigo em destaque
                  </span>
                  <h2 className="mt-4 max-w-xl font-fraunces text-[34px] font-normal italic leading-[38px] text-brand-petroleo md:text-[44px] md:leading-[48px]">
                    {featuredPost.title}
                  </h2>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-petroleo">
                  Ler guia
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
              <div className="bg-surface-alt-card p-7 md:p-10">
                <p className="font-inter text-lg leading-8 text-ink-muted">
                  {featuredPost.hero}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-rosa-50 px-3 py-1 font-inter text-xs font-semibold text-brand-vinho">
                    {categoryLabels[featuredPost.category]}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-inter text-xs text-ink-muted">
                    {featuredPost.readingMinutes} min de leitura
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="px-5 md:px-10 lg:px-20 pb-20">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {secondaryPosts.map((post) => (
              <Link
                key={post.slug}
                href={`${config.basePath}/${post.slug}`}
                className="group flex min-h-[300px] flex-col justify-between rounded-app-lg border border-surface-alt-border bg-white p-6 shadow-brand-xs transition hover:-translate-y-1 hover:shadow-brand-md"
              >
                <div>
                  <span className="font-inter text-xs font-semibold text-brand-vinho">
                    {categoryLabels[post.category]}
                  </span>
                  <h2 className="mt-3 font-fraunces text-[27px] font-normal italic leading-[31px] text-brand-petroleo">
                    {post.title}
                  </h2>
                  <p className="mt-4 font-inter text-[15px] leading-7 text-ink-muted">
                    {post.description}
                  </p>
                </div>
                <span className="mt-7 inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-petroleo">
                  Ler artigo
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
