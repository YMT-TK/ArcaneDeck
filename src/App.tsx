import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/Layout/MainLayout'
import EditModal from './components/EditModal/EditModal'
import { useConfigStore } from './stores'
import './styles/globals.css'

/**
 * ArcaneDeck 主应用组件
 * @description 负责主题切换和全局状态管理
 */
function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { textFontSize } = useConfigStore()

  useEffect(() => {
    const initApp = async () => {
      try {
        // 初始化应用配置
        const savedTheme = localStorage.getItem('arcanedeck-theme') || 'scifi'
        document.documentElement.setAttribute('data-theme', savedTheme)

        // 模拟加载延迟
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('App initialization failed:', error)
        setIsLoading(false)
      }
    }

    initApp()
  }, [])

  /**
   * 应用保存的文本字体大小（仅用于卡片文本）
   */
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-text', `${textFontSize}px`)
  }, [textFontSize])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-scifi-bg">
        <div className="text-scifi-primary font-mono text-xl animate-pulse">
          Loading ArcaneDeck...
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <MainLayout />
      <EditModal />
    </ThemeProvider>
  )
}

export default App
