import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Кнопка "снять с публикации" из ТЗ — soft-delete, статья остаётся в БД.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  if (status !== "PUBLISHED" && status !== "UNPUBLISHED") {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const article = await prisma.article.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(article);
}
