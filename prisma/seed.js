const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * 数据库种子数据
 * @description 初始化默认数据
 */
async function main() {
  console.log('开始初始化数据库...')

  const existingTabs = await prisma.tab.count()
  
  if (existingTabs === 0) {
    console.log('创建默认 Tab...')
    
    await prisma.tab.createMany({
      data: [
        { name: '备忘录', position: 0 },
        { name: '便签', position: 1 },
        { name: '收藏', position: 2 },
      ],
    })
    
    console.log('默认 Tab 创建完成')
  }

  const existingConfig = await prisma.config.findUnique({
    where: { id: 'app' },
  })

  if (!existingConfig) {
    console.log('创建默认配置...')
    
    await prisma.config.create({
      data: {
        id: 'app',
        theme: 'scifi',
        layout: 'grid',
        fontSize: 16,
        autoBackup: true,
        language: 'zh-CN',
      },
    })
    
    console.log('默认配置创建完成')
  }

  console.log('数据库初始化完成!')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
