import { agendaBelaBlogConfig, agendaBelaPosts } from "./agendabela";
import type { BlogPost, BlogProductSlug, ProductBlogConfig } from "./types";

export const productBlogConfigs: Record<BlogProductSlug, ProductBlogConfig> = {
  agendabela: agendaBelaBlogConfig,
};

export const productBlogPosts: Record<BlogProductSlug, BlogPost[]> = {
  agendabela: agendaBelaPosts,
};

export function getProductBlogConfig(
  productSlug: BlogProductSlug,
): ProductBlogConfig {
  return productBlogConfigs[productSlug];
}

export function getProductBlogPosts(productSlug: BlogProductSlug): BlogPost[] {
  return [...productBlogPosts[productSlug]].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getProductBlogPost(
  productSlug: BlogProductSlug,
  slug: string,
): BlogPost | undefined {
  return productBlogPosts[productSlug].find((post) => post.slug === slug);
}

export function getRelatedPosts(
  productSlug: BlogProductSlug,
  post: BlogPost,
): BlogPost[] {
  return post.relatedSlugs
    .map((slug) => getProductBlogPost(productSlug, slug))
    .filter((relatedPost): relatedPost is BlogPost => Boolean(relatedPost));
}

export function getAllProductBlogPosts(): Array<{
  config: ProductBlogConfig;
  post: BlogPost;
}> {
  return Object.entries(productBlogPosts).flatMap(([productSlug, posts]) => {
    const config = getProductBlogConfig(productSlug as BlogProductSlug);
    return posts.map((post) => ({ config, post }));
  });
}

export type { BlogPost, BlogPostSection, BlogProductSlug } from "./types";
