import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma 客户端实例
 * @description 单例模式确保开发环境热更新时不会创建多个连接
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * 数据库服务类
 * @description 封装所有数据库操作
 */
export class DatabaseService {
  /**
   * 检查数据库连接
   */
  static async checkConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }

  /**
   * 断开数据库连接
   */
  static async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }

  /**
   * 执行数据库完整性检查
   */
  static async checkIntegrity(): Promise<{ ok: boolean; errors: string[] }> {
    try {
      const result = await prisma.$queryRaw`PRAGMA integrity_check` as { integrity_check: string }[]
      const status = result[0]?.integrity_check
      return {
        ok: status === 'ok',
        errors: status === 'ok' ? [] : [status],
      }
    } catch (error) {
      return {
        ok: false,
        errors: [String(error)],
      }
    }
  }

  /**
   * 优化数据库
   */
  static async optimize(): Promise<void> {
    await prisma.$executeRaw`VACUUM`
    await prisma.$executeRaw`ANALYZE`
  }

  /**
   * 获取数据库统计信息
   */
  static async getStats() {
    const [cardCount, tabCount, attachmentCount] = await Promise.all([
      prisma.card.count({ where: { status: 'active' } }),
      prisma.tab.count(),
      prisma.attachment.count(),
    ])

    return {
      totalCards: cardCount,
      totalTabs: tabCount,
      totalAttachments: attachmentCount,
    }
  }
}

export default prisma
