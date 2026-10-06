import stringSimilarity from "string-similarity";
import { prisma } from "./db";

// MVP-уровень дедупликации — fuzzy matching по заголовку (см. ТЗ, Модуль 3).
// Порог 0.72 выбран консервативно: лучше пропустить дубль в LLM (лишний
// вызов), чем ошибочно склеить две разные новости в одну группу.
const SIMILARITY_THRESHOLD = 0.72;
const LOOKBACK_HOURS = 24;

/**
 * Для RawItem со статусом NEW определяет, дубликат ли это недавней новости.
 * Если да — помечает DUPLICATE и привязывает к существующей group.
 * Если нет — создаёт новую ArticleGroup и помечает QUEUED (готово к рерайту).
 */
export async function deduplicateNewItems() {
  const newItems = await prisma.rawItem.findMany({ where: { status: "NEW" } });
  if (newItems.length === 0) return { processed: 0, duplicates: 0, newGroups: 0 };

  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);
  // Кандидаты на сравнение — всё, что уже прошло дедуп за последние 24ч
  // (и дубли, и уникальные), чтобы новый дубль мог сматчиться и на другой дубль.
  const recentItems = await prisma.rawItem.findMany({
    where: {
      createdAt: { gte: since },
      status: { in: ["QUEUED", "DUPLICATE", "REWRITTEN"] },
      groupId: { not: null },
    },
    select: { id: true, titleOriginal: true, groupId: true },
  });

  let duplicates = 0;
  let newGroups = 0;

  for (const item of newItems) {
    const match = findBestMatch(item.titleOriginal, recentItems);

    if (match) {
      await prisma.rawItem.update({
        where: { id: item.id },
        data: { status: "DUPLICATE", groupId: match.groupId },
      });
      duplicates++;
    } else {
      const group = await prisma.articleGroup.create({ data: {} });
      await prisma.rawItem.update({
        where: { id: item.id },
        data: { status: "QUEUED", groupId: group.id },
      });
      // Добавляем в пул кандидатов, чтобы следующие newItems в этом же batch
      // тоже могли с ним сматчиться.
      recentItems.push({ id: item.id, titleOriginal: item.titleOriginal, groupId: group.id });
      newGroups++;
    }
  }

  return { processed: newItems.length, duplicates, newGroups };
}

function findBestMatch(
  title: string,
  candidates: { id: string; titleOriginal: string; groupId: string | null }[]
): { groupId: string } | null {
  if (candidates.length === 0) return null;

  let best = { score: 0, groupId: null as string | null };
  for (const c of candidates) {
    const score = stringSimilarity.compareTwoStrings(normalize(title), normalize(c.titleOriginal));
    if (score > best.score) best = { score, groupId: c.groupId };
  }

  if (best.score >= SIMILARITY_THRESHOLD && best.groupId) {
    return { groupId: best.groupId };
  }
  return null;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}
