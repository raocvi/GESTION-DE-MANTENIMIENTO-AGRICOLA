/**
 * @file db.ts
 * @description Singleton de PrismaClient para AgroMaint Pro.
 *
 * Reutiliza la instancia existente en `globalThis` durante el desarrollo
 * (Hot Module Replacement de Next.js crea múltiples instancias sin este patrón,
 * lo que agota el pool de conexiones de la BD).
 *
 * En producción se crea una instancia fresca en cada proceso — no hay HMR.
 *
 * Uso: import { db } from '@core/lib/db'
 *      const orders = await db.workOrder.findMany(...)
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
