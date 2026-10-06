import Parser from "rss-parser";
import { prisma } from "./db";

const parser = new Parser({
  timeout: 10_000, // 10 сек таймаут на источник — см. ТЗ, Модуль 1
  headers: { "User-Agent": "news-aggregator-bot/0.1 (+contact: set-your-email)" },
});

/**
 * Опрашивает один активный источник, сохраняет новые записи как RawItem(status=NEW).
 * Не бросает исключение наружу — недоступность одного источника не должна
 * останавливать цикл опроса остальных (см. ТЗ, Модуль 1, функциональные требования).
 */
export async function fetchSource(sourceId: string): Promise<{ fetched: number; errors: string[] }> {
  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source || !source.isActive) return { fetched: 0, errors: ["source inactive or not found"] };

  const errors: string[] = [];
  let fetched = 0;

  try {
    const feed = await withRetry(() => parser.parseURL(source.rssUrl), 2);

    for (const item of feed.items) {
      const url = item.link?.trim();
      if (!url) continue;

      // sourceArticleUrl уникален в схеме — upsert защищает от дублей при
      // повторном опросе одного и того же фида.
      await prisma.rawItem.upsert({
        where: { sourceArticleUrl: url },
        update: {},
        create: {
          sourceId: source.id,
          titleOriginal: (item.title || "").trim(),
          summaryOriginal: stripHtml(item.contentSnippet || item.content || item.summary || "").slice(0, 2000),
          sourceArticleUrl: url,
          publishedAt: item.isoDate ? new Date(item.isoDate) : null,
        },
      });
      fetched++;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() },
    });
  } catch (e: any) {
    errors.push(`${source.name}: ${e?.message || "unknown fetch error"}`);
  }

  return { fetched, errors };
}

export async function fetchAllActiveSources() {
  const sources = await prisma.source.findMany({ where: { isActive: true } });
  const results = [];
  for (const s of sources) {
    // Последовательно, не параллельно — проще на MVP не держать много открытых
    // соединений одновременно и не упереться в rate limit источников.
    results.push({ source: s.name, ...(await fetchSource(s.id)) });
  }
  return results;
}

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
