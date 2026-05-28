import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogArticleTracker } from "@/components/product-blog/blog-article-tracker";
import { BlogCta } from "@/components/product-blog/blog-cta";
import {
  getProductBlogConfig,
  getProductBlogPost,
  getProductBlogPosts,
  getRelatedPosts,
} from "@/content/product-blogs";
import type { BlogPost, BlogPostSection } from "@/content/product-blogs";

const siteUrl = "https://tudoagenda.com.br";
const config = getProductBlogConfig("agendabela");

const categoryLabels: Record<BlogPost["category"], string> = {
  "agenda-e-organizacao": "Agenda e organização",
  "faltas-e-lembretes": "Faltas e lembretes",
  "agendamento-online": "Agendamento online",
  profissionalizacao: "Profissionalização",
  "rotina-da-profissional": "Rotina da profissional",
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getProductBlogPosts("agendabela").map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getProductBlogPost("agendabela", slug);

  if (!post) {
    return {
      title: "Artigo não encontrado",
    };
  }

  const url = `${config.basePath}/${post.slug}`;

  return {
    title: post.seoTitle,
    description: post.description,
    authors: [{ name: post.author }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: `${siteUrl}${url}`,
      siteName: "Agenda Bela",
      title: post.seoTitle,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
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
      title: post.seoTitle,
      description: post.description,
      images: ["/brand/agenda-bela/social-preview.png"],
    },
  };
}

function renderSection(section: BlogPostSection, index: number) {
  if (section.type === "heading") {
    return (
      <h2
        key={`${section.type}-${index}`}
        className="mt-12 font-fraunces text-[32px] font-normal italic leading-[38px] text-brand-petroleo"
      >
        {section.content}
      </h2>
    );
  }

  if (section.type === "list") {
    return (
      <ul
        key={`${section.type}-${index}`}
        className="my-7 space-y-3 rounded-app-lg border border-surface-alt-border bg-surface-alt-card p-5"
      >
        {section.items.map((item) => (
          <li
            key={item}
            className="flex gap-3 font-inter text-[17px] leading-8 text-ink"
          >
            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-brand-rosa" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (section.type === "callout") {
    return (
      <aside
        key={`${section.type}-${index}`}
        className="my-9 rounded-app-xl bg-brand-creme p-6 shadow-brand-sm"
      >
        <strong className="font-mono-brand text-[11px] uppercase tracking-[2px] text-brand-vinho">
          {section.title}
        </strong>
        <p className="mt-3 font-inter text-[17px] leading-8 text-brand-petroleo">
          {section.content}
        </p>
      </aside>
    );
  }

  return (
    <p
      key={`${section.type}-${index}`}
      className="mt-6 font-inter text-[18px] leading-9 text-ink"
    >
      {section.content}
    </p>
  );
}

export default async function AgendaBelaBlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getProductBlogPost("agendabela", slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts("agendabela", post);
  const articleUrl = `${siteUrl}${config.basePath}/${post.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
          "@type": "Organization",
          name: post.author,
        },
        publisher: {
          "@type": "Organization",
          name: "Tudo Agenda",
          url: siteUrl,
        },
        mainEntityOfPage: articleUrl,
        image: `${siteUrl}/brand/agenda-bela/social-preview.png`,
        articleSection: categoryLabels[post.category],
        keywords: post.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Agenda Bela",
            item: `${siteUrl}${config.landingPath}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteUrl}${config.basePath}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <BlogArticleTracker
        product={config.productSlug}
        blogSlug={config.routeSlug}
        articleSlug={post.slug}
        articleTitle={post.title}
        category={post.category}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <main className="min-h-screen bg-surface-subtle text-ink">
        <header className="px-5 md:px-10 lg:px-20 pt-6 md:pt-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link
              href={config.basePath}
              className="inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-petroleo hover:text-brand-vinho"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Blog
            </Link>
            <Link
              href={config.landingPath}
              className="flex items-center gap-3"
              aria-label="Ir para a página do Agenda Bela"
            >
              <Image
                src="/brand/logo-app.png"
                alt="Agenda Bela"
                width={48}
                height={48}
                className="h-11 w-11"
              />
            </Link>
          </div>
        </header>

        <article className="px-5 md:px-10 lg:px-20 py-10 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-rosa-50 px-3 py-1 font-inter text-xs font-semibold text-brand-vinho">
                {categoryLabels[post.category]}
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-inter text-xs text-ink-muted">
                {post.readingMinutes} min de leitura
              </span>
            </div>

            <h1 className="mt-6 font-fraunces text-[42px] font-normal italic leading-[46px] tracking-[-0.02em] text-brand-petroleo md:text-[66px] md:leading-[68px]">
              {post.title}
            </h1>

            <p className="mt-6 font-inter text-xl leading-9 text-ink-muted">
              {post.hero}
            </p>

            <div className="mt-8 border-y border-surface-alt-border py-5">
              <p className="font-inter text-sm leading-6 text-ink-muted">
                <strong className="text-brand-petroleo">Dor tratada:</strong>{" "}
                {post.pain}
              </p>
            </div>

            <div className="mt-10">
              {post.sections.slice(0, 5).map(renderSection)}
            </div>

            <div className="my-12 rounded-app-xl bg-white p-6 shadow-brand-md">
              <span className="font-mono-brand text-[10px] uppercase tracking-[2px] text-brand-vinho">
                Para colocar em prática
              </span>
              <p className="mt-3 max-w-2xl font-inter text-[17px] leading-8 text-ink-muted">
                O Agenda Bela organiza agenda, link de agendamento, lembretes e
                confirmação para profissionais da beleza que querem sair do
                improviso sem montar uma operação pesada.
              </p>
              <BlogCta
                href={post.ctaHref}
                label={post.ctaLabel}
                product={config.productSlug}
                blogSlug={config.routeSlug}
                articleSlug={post.slug}
                position={`${post.ctaPosition}_middle`}
                className="mt-5"
              />
            </div>

            <div>{post.sections.slice(5).map(renderSection)}</div>

            <div className="mt-14 rounded-app-xl bg-brand-petroleo p-7 text-white shadow-brand-lg">
              <span className="font-mono-brand text-[10px] uppercase tracking-[2px] text-brand-rosa-claro">
                Agenda Bela
              </span>
              <h2 className="mt-3 font-fraunces text-[34px] font-normal italic leading-[38px]">
                Uma secretária para cuidar da agenda enquanto você atende.
              </h2>
              <p className="mt-4 max-w-2xl font-inter text-[16px] leading-8 text-white/80">
                Comece com 30 dias grátis e veja se sua rotina fica mais leve
                com agenda online, link para clientes e lembretes automáticos.
              </p>
              <BlogCta
                href={post.ctaHref}
                label={post.ctaLabel}
                product={config.productSlug}
                blogSlug={config.routeSlug}
                articleSlug={post.slug}
                position={`${post.ctaPosition}_footer`}
                className="mt-6"
              />
            </div>
          </div>
        </article>

        <section className="px-5 md:px-10 lg:px-20 pb-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-fraunces text-[34px] font-normal italic leading-[38px] text-brand-petroleo">
              Continue lendo
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`${config.basePath}/${relatedPost.slug}`}
                  className="group rounded-app-lg border border-surface-alt-border bg-white p-5 shadow-brand-xs transition hover:-translate-y-1 hover:shadow-brand-md"
                >
                  <span className="font-inter text-xs font-semibold text-brand-vinho">
                    {categoryLabels[relatedPost.category]}
                  </span>
                  <h3 className="mt-3 font-fraunces text-[24px] font-normal italic leading-[28px] text-brand-petroleo">
                    {relatedPost.title}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-2 font-inter text-sm font-semibold text-brand-petroleo">
                    Ler artigo
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
