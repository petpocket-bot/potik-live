import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, rssUrl, pollIntervalMinutes } = await req.json();
  if (!name || !rssUrl) {
    return NextResponse.json({ error: "name и rssUrl обязательны" }, { status: 400 });
  }

  const source = await prisma.source.create({
    data: { name, rssUrl, pollIntervalMinutes: pollIntervalMinutes || 30 },
  });
  return NextResponse.json(source);
}
