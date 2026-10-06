import { fetchAllActiveSources } from "./rss";
import { deduplicateNewItems } from "./dedup";
import { rewriteQueuedItems } from "./rewrite";

/**
 * Полный цикл: сбор → дедупликация → рерайт+guard → автопубликация.
 * Вызывается из /api/cron (внешним планировщиком раз в 30 мин) или вручную
 * через `npm run pipeline`.
 */
export async function runPipelineOnce() {
  const fetchResults = await fetchAllActiveSources();
  const dedupResult = await deduplicateNewItems();
  const rewriteResult = await rewriteQueuedItems();

  return {
    timestamp: new Date().toISOString(),
    fetch: fetchResults,
    dedup: dedupResult,
    rewrite: rewriteResult,
  };
}
