import { prisma } from "@/lib/db";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function FailedLogPage() {
  const logs = await prisma.rewriteLog.findMany({
    where: { result: "failed" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { rawItem: { include: { source: true } } },
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif" }}>
      <AdminNav active="failed" />
      <h1 style={{ fontSize: 22, margin: "20px 0" }}>Лог ошибок рерайта</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
        Постфактум-аудит без блокировки публикации остальных материалов (модерации нет —
        см. ТЗ, Модуль 2).
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Дата</th>
            <th style={{ padding: 8 }}>Источник</th>
            <th style={{ padding: 8 }}>Оригинальный заголовок</th>
            <th style={{ padding: 8 }}>Причина отсева</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8, fontSize: 13 }}>
                {new Date(l.createdAt).toLocaleString("ru-RU")}
              </td>
              <td style={{ padding: 8, fontSize: 13 }}>{l.rawItem.source.name}</td>
              <td style={{ padding: 8, fontSize: 13 }}>{l.rawItem.titleOriginal}</td>
              <td style={{ padding: 8, fontSize: 13, color: "#c5221f" }}>{l.failureReason}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 16, color: "#888" }}>
                Ошибок пока нет.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
