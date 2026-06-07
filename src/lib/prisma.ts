import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient();
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  // Après une migration, le client Turbopack peut être obsolète (modèles manquants)
  if (cached && "siteDocument" in cached) {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
