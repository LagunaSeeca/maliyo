import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL?.trim()

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: dbUrl ? {
    db: {
      url: dbUrl,
    },
  } : undefined,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
