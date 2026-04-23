import { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import Settings from '../Settings/Settings'
import { CardGrid } from '../CardGrid'
import { useTheme } from '../../contexts/ThemeContext'
import { useCardStore } from '../../stores/cardStore'
import { useSidebarStore } from '../../stores/sidebarStore'

/**
 * 主布局组件
 * @description 应用程序的主布局容器，包含侧边栏、头部和内容区域
 */
interface MainLayoutProps {
  children?: ReactNode
}

/**
 * 获取导航标题
 */
const getNavTitle = (navId: string): string => {
  const titles: Record<string, string> = {
    all: '全部卡片',
    note: '便签',
    todo: '待办',
    doc: '笔记',
    link: '链接',
    image: '图文',
  }
  return titles[navId] || '全部卡片'
}

function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme()
  const { cards } = useCardStore()
  const { activeNavId, showRecycleBin } = useSidebarStore()

  /**
   * 计算当前筛选的卡片数量
   */
  const getFilteredCardCount = () => {
    let filteredCards = cards

    if (showRecycleBin) {
      filteredCards = filteredCards.filter(c => c.status === 'deleted')
    } else {
      filteredCards = filteredCards.filter(c => c.status !== 'deleted')
      if (activeNavId !== 'all') {
        filteredCards = filteredCards.filter(c => c.type === activeNavId)
      }
    }

    return filteredCards.length
  }

  const currentTitle = showRecycleBin ? '回收站' : getNavTitle(activeNavId)
  const cardCount = getFilteredCardCount()

  return (
    <div className="flex h-screen w-screen overflow-hidden" data-theme={theme}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">{children || <CardGrid />}</main>
        {/* 状态栏,显示当前编辑区域的类型以及当前种类的卡片数量 */}
        <div
          className="h-8 flex items-center justify-between px-4 border-t"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {currentTitle}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              ·
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {cardCount} 张卡片
            </span>
          </div>
        </div>
      </div>
      <Settings />
    </div>
  )
}

export default MainLayout
