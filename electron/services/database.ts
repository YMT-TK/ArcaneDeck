import { app } from 'electron'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

let prismaInstance: PrismaClient | undefined = undefined

/**
 * 获取数据库文件路径
 * @description 默认使用用户数据目录，确保可写权限
 */
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log('[Database] Created database directory:', dbDir)
  }

  const dbPath = path.join(dbDir, 'arcanedeck.db')
  console.log('[Database] Database file path:', dbPath)
  console.log('[Database] Database file exists:', fs.existsSync(dbPath))

  return dbPath
}

/**
 * 设置Prisma引擎路径
 * @description 确保打包后能找到查询引擎
 */
function setupPrismaEngine(): void {
  if (app.isPackaged) {
    const resourcesPath = process.resourcesPath

    const possibleEnginePaths = [
      path.join(
        resourcesPath,
        'node_modules',
        '.prisma',
        'client',
        'query_engine-windows.dll.node'
      ),
      path.join(
        resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        '.prisma',
        'client',
        'query_engine-windows.dll.node'
      ),
      path.join(
        resourcesPath,
        'node_modules',
        '@prisma',
        'engines',
        'query_engine-windows.dll.node'
      ),
      path.join(
        resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        '@prisma',
        'engines',
        'query_engine-windows.dll.node'
      ),
    ]

    for (const enginePath of possibleEnginePaths) {
      console.log('[Database] Checking engine path:', enginePath)
      if (fs.existsSync(enginePath)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath
        console.log('[Database] Set PRISMA_QUERY_ENGINE_LIBRARY:', enginePath)
        return
      }
    }

    console.error('[Database] Prisma engine not found in any location!')
    console.log('[Database] Resources path:', resourcesPath)

    try {
      const files = fs.readdirSync(resourcesPath)
      console.log('[Database] Resources contents:', files)
    } catch (e) {
      console.log('[Database] Cannot read resources path:', e)
    }
  }
}

/**
 * 检查数据库表是否存在
 * @description 检查Card表是否存在
 */
async function checkTableExists(prisma: PrismaClient): Promise<boolean> {
  try {
    const result =
      (await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Card'`) as {
        name: string
      }[]
    return result.length > 0
  } catch (error) {
    console.error('[Database] Failed to check table existence:', error)
    return false
  }
}

/**
 * 创建数据库表结构
 * @description 使用原始SQL创建所有必要的表
 */
async function createDatabaseSchema(prisma: PrismaClient): Promise<void> {
  console.log('[Database] Creating database schema...')

  try {
    // 创建Tab表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Tab" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `
    console.log('[Database] Tab table created')

    // 创建Card表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Card" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'note',
        "status" TEXT NOT NULL DEFAULT 'active',
        "tabId" TEXT,
        "position" INTEGER NOT NULL DEFAULT 0,
        "pinned" BOOLEAN NOT NULL DEFAULT false,
        "style" TEXT,
        "url" TEXT,
        "imagePath" TEXT,
        "favicon" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "deletedAt" DATETIME,
        FOREIGN KEY ("tabId") REFERENCES "Tab"("id") ON DELETE SET NULL
      )
    `
    console.log('[Database] Card table created')

    // 创建Attachment表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Attachment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "filename" TEXT NOT NULL,
        "path" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL DEFAULT 0,
        "cardId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL
      )
    `
    console.log('[Database] Attachment table created')

    // 创建索引
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Card_tabId_idx" ON "Card"("tabId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Card_status_idx" ON "Card"("status")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Card_type_idx" ON "Card"("type")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Card_pinned_idx" ON "Card"("pinned")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Tab_position_idx" ON "Tab"("position")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Attachment_cardId_idx" ON "Attachment"("cardId")`
    console.log('[Database] Indexes created')

    console.log('[Database] Database schema created successfully')
  } catch (error) {
    console.error('[Database] Failed to create schema:', error)
    throw error
  }
}

/**
 * 同步数据库结构
 * @description 检查并添加缺失的列
 */
async function syncDatabaseSchema(prisma: PrismaClient): Promise<void> {
  try {
    // 首先检查表是否存在，不存在则创建
    const tableExists = await checkTableExists(prisma)
    if (!tableExists) {
      console.log('[Database] Tables do not exist, creating schema...')
      await createDatabaseSchema(prisma)
      return
    }

    // 表存在，检查并添加缺失的列
    const tableInfo = (await prisma.$queryRaw`PRAGMA table_info(Card)`) as { name: string }[]
    const existingColumns = tableInfo.map(col => col.name)

    const requiredColumns = ['pinned']

    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`[Database] Adding missing column: ${column}`)

        if (column === 'pinned') {
          await prisma.$executeRaw`ALTER TABLE Card ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT false`
        }

        console.log(`[Database] Column ${column} added successfully`)
      }
    }
  } catch (error) {
    console.error('[Database] Failed to sync schema:', error)
  }
}

/**
 * 初始化数据库
 * @description 设置数据库路径并创建Prisma客户端
 */
export async function initDatabase(): Promise<PrismaClient> {
  if (prismaInstance) {
    return prismaInstance
  }

  setupPrismaEngine()

  const dbPath = getDatabasePath()

  // 将 Windows 路径转换为正斜杠格式，并添加 file: 前缀
  const normalizedPath = dbPath.replace(/\\/g, '/')
  const dbUrl = `file:${normalizedPath}`

  process.env.DATABASE_URL = dbUrl

  console.log('[Database] Database path:', dbPath)
  console.log('[Database] Normalized path:', normalizedPath)
  console.log('[Database] Database URL:', dbUrl)
  console.log('[Database] App is packaged:', app.isPackaged)
  console.log('[Database] Resources path:', process.resourcesPath)
  console.log('[Database] DATABASE_URL:', process.env.DATABASE_URL)
  console.log('[Database] PRISMA_QUERY_ENGINE_LIBRARY:', process.env.PRISMA_QUERY_ENGINE_LIBRARY)

  // 测试目录是否可写
  try {
    const testFile = path.join(path.dirname(dbPath), 'test_write.tmp')
    fs.writeFileSync(testFile, 'test')
    fs.unlinkSync(testFile)
    console.log('[Database] Directory is writable')
  } catch (e) {
    console.error('[Database] Directory is NOT writable:', e)
  }

  try {
    prismaInstance = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    })

    await prismaInstance.$connect()
    console.log('[Database] Connected successfully')

    await syncDatabaseSchema(prismaInstance)

    return prismaInstance
  } catch (error) {
    console.error('[Database] Failed to initialize:', error)
    throw error
  }
}

/**
 * 获取Prisma客户端实例
 * @description 延迟初始化，确保app ready后调用
 */
export async function getPrisma(): Promise<PrismaClient> {
  if (!prismaInstance) {
    return initDatabase()
  }
  return prismaInstance
}

/**
 * 设置自定义数据存储路径
 * @description 允许用户自定义数据存储位置
 */
export function setCustomDataPath(customPath: string): boolean {
  try {
    if (!fs.existsSync(customPath)) {
      fs.mkdirSync(customPath, { recursive: true })
    }

    const dbPath = path.join(customPath, 'arcanedeck.db')
    const normalizedPath = dbPath.replace(/\\/g, '/')
    const dbUrl = `file:${normalizedPath}`

    process.env.DATABASE_URL = dbUrl

    console.log('[Database] Custom data path set:', customPath)
    console.log('[Database] New database path:', dbPath)

    return true
  } catch (error) {
    console.error('[Database] Failed to set custom data path:', error)
    return false
  }
}

/**
 * 获取当前数据库路径
 */
export function getCurrentDatabasePath(): string {
  return process.env.DATABASE_URL || getDatabasePath()
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
      const db = await getPrisma()
      await db.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('[Database] Connection check failed:', error)
      return false
    }
  }

  /**
   * 断开数据库连接
   */
  static async disconnect(): Promise<void> {
    if (prismaInstance) {
      await prismaInstance.$disconnect()
    }
  }

  /**
   * 执行数据库完整性检查
   */
  static async checkIntegrity(): Promise<{ ok: boolean; errors: string[] }> {
    try {
      const db = await getPrisma()
      const result = (await db.$queryRaw`PRAGMA integrity_check`) as { integrity_check: string }[]
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
    const db = await getPrisma()
    await db.$executeRaw`VACUUM`
    await db.$executeRaw`ANALYZE`
  }

  /**
   * 获取数据库统计信息
   */
  static async getStats() {
    const db = await getPrisma()
    const [cardCount, tabCount, attachmentCount] = await Promise.all([
      db.card.count({ where: { status: 'active' } }),
      db.tab.count(),
      db.attachment.count(),
    ])

    return {
      totalCards: cardCount,
      totalTabs: tabCount,
      totalAttachments: attachmentCount,
    }
  }

  /**
   * 获取数据库文件路径
   */
  static getDatabasePath(): string {
    return getCurrentDatabasePath()
  }

  /**
   * 同步数据库结构
   */
  static async syncSchema(): Promise<void> {
    const db = await getPrisma()
    await syncDatabaseSchema(db)
  }
}
