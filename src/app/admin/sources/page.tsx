import { prisma } from "@/lib/db";
import SourceForm from "./SourceForm";
import SourceToggle from "./SourceToggle";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <AdminNav active="sources" />
      <h1 style={{ fontSize: 22, margin: "20px 0" }}>Источники</h1>

      <SourceForm />

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Название</th>
            <th style={{ padding: 8 }}>RSS URL</th>
            <th style={{ padding: 8 }}>Интервал (мин)</th>
            <th style={{ padding: 8 }}>Последний опрос</th>
            <th style={{ padding: 8 }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{s.name}</td>
              <td style={{ padding: 8, fontSize: 12, color: "#555" }}>{s.rssUrl}</td>
              <td style={{ padding: 8 }}>{s.pollIntervalMinutes}</td>
              <td style={{ padding: 8, fontSize: 13 }}>
                {s.lastFetchedAt ? new Date(s.lastFetchedAt).toLocaleString("ru-RU") : "—"}
              </td>
              <td style={{ padding: 8 }}>
                <SourceToggle id={s.id} isActive={s.isActive} />
              </td>
            </tr>
          ))}
          {sources.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, color: "#888" }}>
                Источников пока нет. Добавьте первый выше или выполните `npm run seed`.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
