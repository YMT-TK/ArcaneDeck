import { getPrisma } from './database'
import { Card } from '@prisma/client'
import validator from 'validator'
import { AttachmentService } from './attachment'

/**
 * 卡片类型
 * - note: 便签（瀑布流布局）
 * - doc: 笔记（统一网格布局）
 * - link: 网址（统一网格布局）
 * - image: 图文（瀑布流布局）
 * - todo: 待办（瀑布流布局）
 */
export type CardType = 'note' | 'doc' | 'link' | 'image' | 'todo'

/**
 * 卡片状态
 */
export type CardStatus = 'active' | 'archived' | 'deleted'

/**
 * 卡片创建输入接口
 */
export interface CreateCardInput {
  title: string
  content: string
  type?: CardType
  tabId?: string
  style?: string
  url?: string
  imagePath?: string
  favicon?: string
}

/**
 * 卡片更新输入接口
 */
export interface UpdateCardInput {
  title?: string
  content?: string
  type?: CardType
  tabId?: string | null
  position?: number
  style?: string
  status?: CardStatus
  url?: string
  imagePath?: string
  favicon?: string
  pinned?: boolean
}

/**
 * 卡片服务类
 * @description 处理所有卡片相关的数据库操作
 */
export class CardService {
  /**
   * 创建新卡片
   */
  static async create(data: CreateCardInput): Promise<Card> {
    const prisma = await getPrisma()
    const sanitizedTitle = this.sanitizeInput(data.title)
    // 待办卡片存储的是 JSON 数据，不要转义
    const sanitizedContent = data.type === 'todo' ? data.content : this.sanitizeInput(data.content)

    const maxPosition = await prisma.card.aggregate({
      where: { tabId: data.tabId ?? null, status: 'active' },
      _max: { position: true },
    })

    const position = (maxPosition._max.position ?? -1) + 1

    return prisma.card.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        type: data.type ?? 'note',
        tabId: data.tabId,
        style: data.style,
        url: data.url,
        imagePath: data.imagePath,
        favicon: data.favicon,
        position,
      },
    })
  }

  /**
   * 更新卡片
   */
  static async update(id: string, data: UpdateCardInput): Promise<Card> {
    const prisma = await getPrisma()
    const updateData: UpdateCardInput = { ...data }

    // 获取当前卡片类型
    const currentCard = await prisma.card.findUnique({
      where: { id },
      select: { type: true },
    })

    if (data.title) {
      updateData.title = this.sanitizeInput(data.title)
    }
    if (data.content) {
      // 待办卡片存储的是 JSON 数据，不要转义
      updateData.content = (currentCard?.type === 'todo' || data.type === 'todo') 
        ? data.content 
        : this.sanitizeInput(data.content)
    }

    const oldCard = await prisma.card.findUnique({
      where: { id },
      select: { favicon: true },
    })

    if (oldCard && oldCard.favicon && data.favicon && oldCard.favicon !== data.favicon) {
      await AttachmentService.deleteAttachment(oldCard.favicon)
    }

    return prisma.card.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * 软删除卡片
   */
  static async softDelete(id: string): Promise<Card> {
    const prisma = await getPrisma()

    const card = await prisma.card.findUnique({
      where: { id },
      select: { favicon: true, imagePath: true },
    })

    if (card && card.favicon) {
      await AttachmentService.deleteAttachment(card.favicon)
    }
    if (card && card.imagePath) {
      await AttachmentService.deleteAttachment(card.imagePath)
    }

    return prisma.card.update({
      where: { id },
      data: {
        status: 'deleted',
        deletedAt: new Date(),
      },
    })
  }

  /**
   * 恢复已删除的卡片
   */
  static async restore(id: string): Promise<Card> {
    const prisma = await getPrisma()
    return prisma.card.update({
      where: { id },
      data: {
        status: 'active',
        deletedAt: null,
      },
    })
  }

  /**
   * 永久删除卡片
   */
  static async permanentDelete(id: string): Promise<void> {
    const prisma = await getPrisma()
    await prisma.card.delete({
      where: { id },
    })
  }

  /**
   * 获取所有活跃卡片
   */
  static async getAll(tabId?: string): Promise<Card[]> {
    const prisma = await getPrisma()
    return prisma.card.findMany({
      where: {
        status: 'active',
        tabId: tabId ?? null,
      },
      orderBy: [{ pinned: 'desc' }, { position: 'asc' }],
    })
  }

  /**
   * 根据类型获取卡片
   */
  static async getByType(type: CardType): Promise<Card[]> {
    const prisma = await getPrisma()
    return prisma.card.findMany({
      where: {
        status: 'active',
        type,
      },
      orderBy: [{ pinned: 'desc' }, { position: 'asc' }],
    })
  }

  /**
   * 获取已删除的卡片
   */
  static async getDeleted(): Promise<Card[]> {
    const prisma = await getPrisma()
    return prisma.card.findMany({
      where: { status: 'deleted' },
      orderBy: { deletedAt: 'desc' },
    })
  }

  /**
   * 根据ID获取卡片
   */
  static async getById(id: string): Promise<Card | null> {
    const prisma = await getPrisma()
    return prisma.card.findUnique({
      where: { id },
      include: { attachments: true },
    })
  }

  /**
   * 搜索卡片
   */
  static async search(query: string): Promise<Card[]> {
    const prisma = await getPrisma()
    const sanitizedQuery = this.sanitizeInput(query)

    return prisma.card.findMany({
      where: {
        status: 'active',
        OR: [{ title: { contains: sanitizedQuery } }, { content: { contains: sanitizedQuery } }],
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      take: 50,
    })
  }

  /**
   * 更新卡片位置
   */
  static async reorder(cardIds: string[]): Promise<void> {
    const prisma = await getPrisma()
    const updates = cardIds.map((id, index) =>
      prisma.card.update({
        where: { id },
        data: { position: index },
      })
    )

    await prisma.$transaction(updates)
  }

  /**
   * 置顶/取消置顶卡片
   */
  static async togglePin(id: string): Promise<Card> {
    const prisma = await getPrisma()
    const card = await prisma.card.findUnique({
      where: { id },
      select: { pinned: true },
    })

    if (!card) {
      throw new Error('Card not found')
    }

    return prisma.card.update({
      where: { id },
      data: { pinned: !card.pinned },
    })
  }

  /**
   * 归档卡片
   */
  static async archive(id: string): Promise<Card> {
    const prisma = await getPrisma()
    return prisma.card.update({
      where: { id },
      data: { status: 'archived' },
    })
  }

  /**
   * 清理过期删除的卡片（超过30天）
   */
  static async cleanupDeleted(): Promise<number> {
    const prisma = await getPrisma()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const cardsToDelete = await prisma.card.findMany({
      where: {
        status: 'deleted',
        deletedAt: { lt: thirtyDaysAgo },
      },
      select: {
        id: true,
        favicon: true,
        imagePath: true,
      },
    })

    for (const card of cardsToDelete) {
      if (card.favicon) {
        await AttachmentService.deleteAttachment(card.favicon)
      }
      if (card.imagePath) {
        await AttachmentService.deleteAttachment(card.imagePath)
      }
    }

    const result = await prisma.card.deleteMany({
      where: {
        status: 'deleted',
        deletedAt: { lt: thirtyDaysAgo },
      },
    })

    return result.count
  }

  /**
   * 输入净化
   */
  private static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }
    return validator.escape(input.trim())
  }
}
