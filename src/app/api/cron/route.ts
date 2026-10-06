import { NextRequest, NextResponse } from "next/server";
import { runPipelineOnce } from "@/lib/pipeline";

export const maxDuration = 60;

// Внешний планировщик (Vercel Cron / системный cron на сервере) дёргает этот
// роут раз в 30 минут с заголовком Authorization: Bearer <CRON_SECRET>.
// См. ТЗ, Модуль 1: интервал опроса 30 минут.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runPipelineOnce();
  return NextResponse.json(result);
}
