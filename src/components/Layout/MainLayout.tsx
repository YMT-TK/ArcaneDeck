import { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import Settings from '../Settings/Settings'
import { CardGrid } from '../CardGrid'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * 主布局组件
 * @description 应用程序的主布局容器，包含侧边栏、头部和内容区域
 */
interface MainLayoutProps {
  children?: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme()

  return (
    <div className="flex h-screen w-screen overflow-hidden" data-theme={theme}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children || <CardGrid />}
        </main>
      </div>
      <Settings />
    </div>
  )
}

export default MainLayout
