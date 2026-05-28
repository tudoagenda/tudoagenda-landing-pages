import type { MetadataRoute } from "next";
import {
  getAllProductBlogPosts,
  getProductBlogConfig,
} from "@/content/product-blogs";

const siteUrl = "https://tudoagenda.com.br";
const lastModified = new Date("2026-05-27");

export default function sitemap(): MetadataRoute.Sitemap {
  const agendaBelaBlogConfig = getProductBlogConfig("agendabela");
  const blogPosts = getAllProductBlogPosts();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/agendabela/automatize-seu-atendimento`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}${agendaBelaBlogConfig.basePath}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.map(({ config, post }) => ({
      url: `${siteUrl}${config.basePath}/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/privacidade`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/termos`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
