export type BlogProductSlug = "agendabela";

export type BlogCategory =
  | "agenda-e-organizacao"
  | "faltas-e-lembretes"
  | "agendamento-online"
  | "profissionalizacao"
  | "rotina-da-profissional";

export type BlogPostSection =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "heading";
      content: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "callout";
      title: string;
      content: string;
    };

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  readingMinutes: number;
  hero: string;
  pain: string;
  ctaLabel: string;
  ctaHref: string;
  ctaPosition: string;
  sections: BlogPostSection[];
  relatedSlugs: string[];
};

export type ProductBlogConfig = {
  productSlug: BlogProductSlug;
  routeSlug: string;
  name: string;
  blogTitle: string;
  blogDescription: string;
  audience: string;
  basePath: string;
  landingPath: string;
  ctaLabel: string;
  ctaHref: string;
  themeEyebrow: string;
};
