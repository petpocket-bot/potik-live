import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { isActive } = await req.json();
  const source = await prisma.source.update({
    where: { id: params.id },
    data: { isActive },
  });
  return NextResponse.json(source);
}
