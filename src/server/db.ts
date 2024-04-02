import { PrismaClient } from "@prisma/client";

import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "@/env";
import { Pool } from "@neondatabase/serverless";

const createPrismaClient = () => {
  if (env.DATABASE_TYPE === "postgres") {
    return new PrismaClient({
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } else if (env.DATABASE_TYPE === "neon") {
    // console.debug("Using Neon database adapter");
    const neon = new Pool({ connectionString: env.POSTGRES_URL });
    const adapter = new PrismaNeon(neon);
    return new PrismaClient({ adapter, log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"] });
  } else {
    throw new Error(`Unsupported database type`);
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
