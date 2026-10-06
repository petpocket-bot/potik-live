import { prisma } from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";
import type { Metadata } from "next";

export const revalidate = 300;

const CATEGORY_TITLES: Record<string, string> = {
  "ukraine-in-press": "Україна в пресі",
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: CATEGORY_TITLES[params.slug] || params.slug };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: params.slug },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, color: "#1C1A17" }}>
        {CATEGORY_TITLES[params.slug] || params.slug}
      </h1>
      <AdSlot height={90} />
      {articles.map((a) => (
        <ArticleCard key={a.id} slug={a.slug} title={a.titleRewritten} sourceName={a.sourceName} publishedAt={a.publishedAt} />
      ))}
      {articles.length === 0 && <p style={{ color: "#AFA999", padding: "40px 0" }}>Пока нет публикаций.</p>}
    </main>
  );
}
