import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/Layout/MainLayout'
import EditModal from './components/EditModal/EditModal'
import DataPathSetup from './components/DataPathSetup'
import { useConfigStore, useDataPathStore } from './stores'
import './styles/globals.css'

/**
 * ArcaneDeck 主应用组件
 * @description 负责主题切换和全局状态管理
 */
function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const { textFontSize } = useConfigStore()
  const { isSetupComplete, setDataPath, setSetupComplete } = useDataPathStore()

  /**
   * 检查并初始化数据路径
   */
  const checkAndInitDataPath = async () => {
    try {
      const isPathSetup = await window.electronAPI.database.isPathSetup()
      
      if (!isPathSetup && !isSetupComplete) {
        setShowSetup(true)
        setIsLoading(false)
        return
      }

      await initDatabase()
      setIsReady(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to check data path:', error)
      setShowSetup(true)
      setIsLoading(false)
    }
  }

  /**
   * 初始化数据库
   */
  const initDatabase = async (customPath?: string) => {
    try {
      const result = await window.electronAPI.database.init(customPath)
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * 确认选择路径
   */
  const handleConfirmPath = async (path: string) => {
    try {
      setDataPath(path)
      await initDatabase(path)
      setSetupComplete(true)
      setShowSetup(false)
      setIsReady(true)
    } catch (error) {
      console.error('Failed to set data path:', error)
    }
  }

  /**
   * 使用默认路径
   */
  const handleUseDefault = async () => {
    try {
      const userDataPath = await window.electronAPI.app.getPath('userData')
      const defaultPath = `${userDataPath}/data`
      await handleConfirmPath(defaultPath)
    } catch (error) {
      console.error('Failed to use default path:', error)
    }
  }

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedTheme = localStorage.getItem('arcanedeck-theme') || 'scifi'
        document.documentElement.setAttribute('data-theme', savedTheme)

        await checkAndInitDataPath()
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

  if (showSetup) {
    return (
      <ThemeProvider>
        <DataPathSetup
          isOpen={true}
          onConfirm={handleConfirmPath}
          onUseDefault={handleUseDefault}
        />
      </ThemeProvider>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-scifi-bg">
        <div className="text-scifi-primary font-mono text-xl animate-pulse">
          Initializing database...
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
