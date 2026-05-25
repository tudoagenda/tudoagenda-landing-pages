import type { MetadataRoute } from "next";

const siteUrl = "https://tudoagenda.com.br";
const lastModified = new Date("2026-05-25");

export default function sitemap(): MetadataRoute.Sitemap {
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
