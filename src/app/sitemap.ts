import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || "https://example.com";

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  return [
    { url: baseUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/category/ukraine-in-press`, changeFrequency: "hourly", priority: 0.8 },
    ...articles.map((a) => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: a.publishedAt,
      changeFrequency: "never" as const,
      priority: 0.6,
    })),
  ];
}
