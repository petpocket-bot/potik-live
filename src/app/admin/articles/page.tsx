import { prisma } from "@/lib/db";
import AdminNav from "@/components/AdminNav";
import UnpublishButton from "./UnpublishButton";

export const dynamic = "force-dynamic";

export default async function ArticlesAdminPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif" }}>
      <AdminNav active="articles" />
      <h1 style={{ fontSize: 22, margin: "20px 0" }}>Лента публикаций</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Заголовок</th>
            <th style={{ padding: 8 }}>Источник</th>
            <th style={{ padding: 8 }}>Опубликовано</th>
            <th style={{ padding: 8 }}>Статус</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                <a href={`/article/${a.slug}`} target="_blank" style={{ color: "#111" }}>
                  {a.titleRewritten}
                </a>
              </td>
              <td style={{ padding: 8, fontSize: 13 }}>{a.sourceName}</td>
              <td style={{ padding: 8, fontSize: 13 }}>
                {new Date(a.publishedAt).toLocaleString("ru-RU")}
              </td>
              <td style={{ padding: 8, fontSize: 13 }}>
                {a.status === "PUBLISHED" ? "Опубликовано" : "Снято с публикации"}
              </td>
              <td style={{ padding: 8 }}>
                <UnpublishButton id={a.id} status={a.status} />
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, color: "#888" }}>
                Публикаций пока нет. Запустите пайплайн: `npm run pipeline`.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
