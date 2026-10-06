import Link from "next/link";
import { prisma } from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import AdSlot from "@/components/AdSlot";

export const revalidate = 300;

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const popular = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { group: { include: { _count: { select: { rawItems: true } } } } },
  });
  const topPopular = [...popular]
    .sort((a, b) => b.group._count.rawItems - a.group._count.rawItems)
    .slice(0, 3);

  const [hero, ...rest] = articles;
  const thumbRows = rest.slice(0, 3);
  const denseRows = rest.slice(3);

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 40px", display: "flex", gap: 32, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {hero && (
          <Link
            href={`/article/${hero.slug}`}
            style={{ display: "flex", gap: 18, paddingBottom: 18, borderBottom: "1px solid #E5E0D8", alignItems: "flex-start", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ flex: "0 0 220px", height: 150, background: "#EFEAE0", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#AFA999", textTransform: "uppercase", letterSpacing: ".04em" }}>
              фото
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", background: "#1E3A5F", color: "#fff", borderRadius: 3, textTransform: "uppercase" }}>
                Головне
              </span>
              <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 22, lineHeight: 1.25, margin: "8px 0 6px" }}>
                {hero.titleRewritten}
              </h1>
              <div style={{ fontSize: 11, color: "#AFA999" }}>
                <span style={{ fontWeight: 600, color: "#6B6459" }}>{hero.sourceName}</span>
                {" · "}
                {new Date(hero.publishedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </Link>
        )}

        <div style={{ padding: "12px 0 6px", fontSize: 11, fontWeight: 700, color: "#8A8275", textTransform: "uppercase", letterSpacing: ".05em" }}>
          Стрічка новин
        </div>

        {thumbRows.map((a) => (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #EDE8DF", alignItems: "center", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ flex: "0 0 64px", height: 48, background: "#EFEAE0", borderRadius: 3 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, lineHeight: 1.3, fontWeight: 600 }}>{a.titleRewritten}</span>
              <span style={{ fontSize: 11, color: "#AFA999" }}>
                {a.sourceName} · {new Date(a.publishedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </Link>
        ))}

        <AdSlot height={80} />

        {denseRows.map((a, i) => (
          <div key={a.id}>
            <ArticleCard slug={a.slug} title={a.titleRewritten} sourceName={a.sourceName} publishedAt={a.publishedAt} />
            {i === 4 && <AdSlot height={90} />}
          </div>
        ))}

        {articles.length === 0 && (
          <p style={{ color: "#AFA999", padding: "40px 0" }}>Пока нет опубликованных новостей. Запустите пайплайн сбора.</p>
        )}
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
