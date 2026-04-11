import { getPrisma } from './database'
import { Tab } from '@prisma/client'
import validator from 'validator'

/**
 * 标签页服务类
 * @description 处理所有标签页相关的数据库操作
 */
export class TabService {
  /**
   * 创建新标签页
   */
  static async create(name: string): Promise<Tab> {
    const prisma = await getPrisma()
    const sanitizedName = this.sanitizeInput(name)

    const maxPosition = await prisma.tab.aggregate({
      _max: { position: true },
    })

    const position = (maxPosition._max.position ?? -1) + 1

    return prisma.tab.create({
      data: {
        name: sanitizedName,
        position,
      },
    })
  }

  /**
   * 更新标签页名称
   */
  static async update(id: string, name: string): Promise<Tab> {
    const prisma = await getPrisma()
    const sanitizedName = this.sanitizeInput(name)

    return prisma.tab.update({
      where: { id },
      data: { name: sanitizedName },
    })
  }

  /**
   * 删除标签页
   */
  static async delete(id: string): Promise<void> {
    const prisma = await getPrisma()
    await prisma.$transaction(async tx => {
      await tx.card.updateMany({
        where: { tabId: id },
        data: { tabId: null },
      })

      await tx.tab.delete({
        where: { id },
      })
    })
  }

  /**
   * 获取所有标签页
   */
  static async getAll(): Promise<Tab[]> {
    const prisma = await getPrisma()
    return prisma.tab.findMany({
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: { cards: { where: { status: 'active' } } },
        },
      },
    })
  }

  /**
   * 根据ID获取标签页
   */
  static async getById(id: string): Promise<Tab | null> {
    const prisma = await getPrisma()
    return prisma.tab.findUnique({
      where: { id },
    })
  }

  /**
   * 更新标签页顺序
   */
  static async reorder(tabIds: string[]): Promise<void> {
    const prisma = await getPrisma()
    const updates = tabIds.map((id, index) =>
      prisma.tab.update({
        where: { id },
        data: { position: index },
      })
    )

    await prisma.$transaction(updates)
  }

  /**
   * 输入净化
   */
  private static sanitizeInput(input: string): string {
    return validator.escape(input.trim())
  }
}
