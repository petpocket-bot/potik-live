import { PrismaClient } from "@prisma/client";

// Стандартный паттерн синглтона для Next.js dev-режима (hot-reload не плодит
// новые подключения к БД).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
