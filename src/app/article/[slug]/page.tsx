import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";

export const revalidate = 300;

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug: decodeURIComponent(slug) },
    include: { group: { include: { rawItems: { include: { source: true } } } } },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return {};

  const description = article.bodyRewritten.slice(0, 160);
  return {
    title: article.titleRewritten,
    description,
    openGraph: {
      title: article.titleRewritten,
      description,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
    },
    alternates: { canonical: `/article/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  const otherSources = article.group.rawItems.filter((ri) => ri.sourceArticleUrl !== article.sourceUrl);

  const related = await prisma.article.findFirst({
    where: { status: "PUBLISHED", category: article.category, id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
  });

  const popularCandidates = await prisma.article.findMany({
    where: { status: "PUBLISHED", id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { group: { include: { _count: { select: { rawItems: true } } } } },
  });
  const topPopular = [...popularCandidates].sort((a, b) => b.group._count.rawItems - a.group._count.rawItems).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titleRewritten,
    datePublished: article.publishedAt.toISOString(),
    articleBody: article.bodyRewritten,
  };

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 48px", display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ flex: 1, minWidth: 0, maxWidth: 680 }}>
        <div style={{ fontSize: 12, color: "#AFA999", marginBottom: 14 }}>
          <Link href={`/category/${article.category}`} style={{ color: "#1E3A5F", fontWeight: 600 }}>
            Україна в пресі
          </Link>
        </div>

        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 30, lineHeight: 1.28, margin: "0 0 12px", color: "#1C1A17" }}>
          {article.titleRewritten}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", background: "#EFEAE0", borderRadius: 10, color: "#6B6459" }}>
            {article.sourceName}
          </span>
          <span style={{ fontSize: 12, color: "#AFA999" }}>{new Date(article.publishedAt).toLocaleString("uk-UA")}</span>
        </div>

        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "#EFEAE0",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#AFA999",
            textTransform: "uppercase",
            letterSpacing: ".04em",
            marginBottom: 24,
          }}
        >
          фото до матеріалу
        </div>

        <div style={{ fontSize: 17, lineHeight: 1.75, whiteSpace: "pre-line", color: "#2A2721" }}>{article.bodyRewritten}</div>

        <div style={{ marginTop: 28, padding: "16px 18px", background: "#F2EEE5", borderRadius: 8, fontSize: 14 }}>
          Джерело: <strong>{article.sourceName}</strong>
          {" — "}
          <a href={article.sourceUrl} target="_blank" rel="nofollow noopener" style={{ color: "#1E3A5F", textDecoration: "underline" }}>
            читати оригінал →
          </a>
        </div>

        {otherSources.length > 0 && (
          <div style={{ marginTop: 18, fontSize: 14 }}>
            <p style={{ color: "#8A8275", marginBottom: 8 }}>Цю новину також писали:</p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#5B5548" }}>
              {otherSources.map((ri) => (
                <li key={ri.id} style={{ marginBottom: 4 }}>
                  <a href={ri.sourceArticleUrl} target="_blank" rel="nofollow noopener" style={{ color: "#1E3A5F", textDecoration: "underline" }}>
                    {ri.source.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {related && (
          <Link
            href={`/article/${related.slug}`}
            style={{
              display: "flex",
              gap: 14,
              padding: 16,
              background: "#fff",
              border: "1px solid #E5E0D8",
              borderRadius: 8,
              alignItems: "center",
              marginTop: 24,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ flex: "0 0 72px", height: 54, background: "#EFEAE0", borderRadius: 3 }} />
            <div>
              <div style={{ fontSize: 11, color: "#8A8275", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>
                Статті по темі
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{related.titleRewritten}</div>
            </div>
          </Link>
        )}

        <AdSlot height={100} />
      </div>

      <aside style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", gap: 20 }}>
        <AdSlot height={250} />

        {topPopular.length > 0 && (
          <div>
            <div style={{ paddingBottom: 8, borderBottom: "2px solid #1C1A17", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Популярне
            </div>
            {topPopular.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < topPopular.length - 1 ? "1px solid #EDE8DF" : "none", alignItems: "baseline", textDecoration: "none", color: "inherit" }}
              >
                <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 20, color: "#D8D2C6", flex: "0 0 20px" }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.35 }}>{a.titleRewritten}</span>
              </Link>
            ))}
          </div>
        )}

        <AdSlot height={280} />
      </aside>
    </main>
  );
}
