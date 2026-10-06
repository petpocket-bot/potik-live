import stringSimilarity from "string-similarity";
import { prisma } from "./db";

const MIN_LEN = 300;
const MAX_LEN = 1500;
const TITLE_COPY_THRESHOLD = 0.9; // выше — считаем, что LLM не перефразировала
const REFUSAL_PATTERNS = [
  /вот переформулированн/i,
  /ось переформульован/i,
  /i cannot/i,
  /i can't/i,
  /як (ai|ші|мовна модель)(?!\p{L})/iu,
  /как (ai|ии|языковая модель)/i,
  /^(конечно|certainly|sure)[,!]/i,
  /^(звісно|звичайно)[,!]/i,
];

const SYSTEM_PROMPT = `Ти — редактор новинного сайту POTIK.LIVE. Тобі дають заголовок і короткий
зміст новини — мовою оригіналу (може бути українська чи російська).
ЗАВЖДИ пиши результат українською мовою, незалежно від мови вхідних даних —
весь сайт українськомовний, це не підлягає обговоренню.
Переформулюй своїми словами, зберігаючи всі факти (дати, імена, цифри,
географію) без спотворень. Не копіюй формулювання дослівно. Не додавай
фактів, яких немає у вхідних даних.
Не пиши вступних фраз на кшталт "ось переформульований текст" — одразу видай результат.
Зазвичай текст займає 2-4 абзаци, але якщо в повідомленні користувача вказано
конкретне обмеження довжини — воно важливіше за це загальне правило, дотримуйся його.

Відповідай СУВОРО у форматі JSON без пояснень і без markdown-розмітки:
{"title": "новий заголовок українською", "body": "новий текст українською"}`;

// Источники с ограничением на объём свободного использования (см. seed.ts) —
// держим рерайт короче их лимита, чтобы не выйти за рамки того, что они
// явно разрешают без отдельного согласования. Euromaidan Press разрешает
// ссылку + до 500 знаков свободно — целимся заметно ниже этого потолка.
const SOURCE_LENGTH_HINTS: Record<string, string> = {
  "Euromaidan Press":
    "Вкладись у 250–450 символів. Якщо вихідний зміст коротший — не розтягуй " +
    "його вигаданими деталями, краще скороти ще: ми не додаємо фактів, яких немає в джерелі.",
};

const SOURCE_MIN_LEN: Record<string, number> = {
  "Euromaidan Press": 150,
  "ZN.UA": 200,
  "Радіо Свобода": 200,
};

/**
 * Берёт все RawItem со статусом QUEUED, рерайтит через LLM, прогоняет через
 * guard-слой (см. ТЗ) и либо публикует Article, либо помечает FAILED.
 * Модерации нет — публикация полностью автоматическая, брак отсекается
 * только автоматическими проверками ниже.
 */
export async function rewriteQueuedItems() {
  const items = await prisma.rawItem.findMany({
    where: { status: "QUEUED" },
    include: { group: true },
  });

  let published = 0;
  let failed = 0;

  for (const item of items) {
    // id записи лога этого прогона — чтобы при отказе пометить именно её,
    // а не успешные записи прошлых прогонов той же новости
    let logId: string | undefined;
    try {
      const source = await prisma.source.findUnique({ where: { id: item.sourceId } });
      const lengthHint = source ? SOURCE_LENGTH_HINTS[source.name] : undefined;
      const minLen = (source && SOURCE_MIN_LEN[source.name]) || MIN_LEN;

      const result = await callLLM(item.titleOriginal, item.summaryOriginal, lengthHint);

      const log = await prisma.rewriteLog.create({
        data: {
          rawItemId: item.id,
          llmResponseRaw: JSON.stringify(result),
          result: "success",
        },
      });
      logId = log.id;

      const guardFailure = runGuardChecks(item.titleOriginal, result.title, result.body, minLen);

      if (guardFailure) {
        await markFailed(item.id, guardFailure, logId);
        failed++;
        continue;
      }

      await prisma.article.create({
        data: {
          rawItemId: item.id,
          groupId: item.groupId!,
          slug: await uniqueSlug(result.title),
          titleRewritten: result.title,
          bodyRewritten: result.body,
          sourceName: source!.name,
          sourceUrl: item.sourceArticleUrl,
        },
      });

      await prisma.rawItem.update({ where: { id: item.id }, data: { status: "REWRITTEN" } });
      published++;
    } catch (e: any) {
      const reason = e?.message || "LLM call error";
      if (!logId) {
        // упали до записи лога (вызов LLM / парсинг JSON) — фиксируем отказ отдельной записью
        await prisma.rewriteLog.create({
          data: {
            rawItemId: item.id,
            llmResponseRaw: "",
            result: "failed",
            failureReason: reason,
          },
        });
      }
      await markFailed(item.id, reason, logId);
      failed++;
    }
  }

  return { processed: items.length, published, failed };
}

async function markFailed(rawItemId: string, reason: string, logId?: string) {
  await prisma.rawItem.update({ where: { id: rawItemId }, data: { status: "FAILED" } });

  // ответ LLM этого прогона мог быть записан как success, но не пройти guard
  // или упасть на публикации — помечаем только его
  if (logId) {
    await prisma.rewriteLog.update({
      where: { id: logId },
      data: { result: "failed", failureReason: reason },
    });
  }
}

/**
 * Guard-слой из ТЗ: отсекает явный брак без второго вызова LLM и без
 * человека в цикле. Возвращает причину отказа, либо null если всё ок.
 */
function runGuardChecks(
  originalTitle: string,
  newTitle: string,
  newBody: string,
  minLen: number = MIN_LEN
): string | null {
  if (!newTitle?.trim() || !newBody?.trim()) return "empty title or body";

  if (newBody.length < minLen) return `body too short (${newBody.length} chars, min ${minLen})`;
  if (newBody.length > MAX_LEN) return `body too long (${newBody.length} chars, max ${MAX_LEN})`;

  const titleSimilarity = stringSimilarity.compareTwoStrings(
    originalTitle.toLowerCase(),
    newTitle.toLowerCase()
  );
  if (titleSimilarity >= TITLE_COPY_THRESHOLD) {
    return `title too close to original (similarity ${titleSimilarity.toFixed(2)}) — likely not paraphrased`;
  }

  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(newTitle) || pattern.test(newBody)) {
      return `detected meta-commentary / refusal artifact (pattern: ${pattern})`;
    }
  }

  return null;
}

async function callLLM(
  title: string,
  summary: string,
  lengthHint?: string
): Promise<{ title: string; body: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY не задан — заполните .env перед запуском пайплайна рерайта");
  }

  const userContent = lengthHint
    ? `Заголовок: ${title}\n\nСодержание: ${summary}\n\n${lengthHint}`
    : `Заголовок: ${title}\n\nСодержание: ${summary}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "";
  const cleaned = text.replace(/```json|```/g, "").trim();

  const parsed = JSON.parse(cleaned); // бросит исключение, если LLM не выдала валидный JSON — это тоже обрабатывается как failed
  return { title: parsed.title, body: parsed.body };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  let slug = base || "news";
  let i = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
