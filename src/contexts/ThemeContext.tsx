import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * 主题类型定义
 */
export type ThemeType = 'scifi' | 'magic' | 'minimal'

/**
 * 主题上下文接口
 */
interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * 主题提供者组件
 * @param children - 子组件
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('arcanedeck-theme')
    return (saved as ThemeType) || 'scifi'
  })

  /**
   * 设置主题
   * @param newTheme - 新主题
   */
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem('arcanedeck-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  /**
   * 切换主题（循环切换）
   */
  const toggleTheme = () => {
    const themes: ThemeType[] = ['scifi', 'magic', 'minimal']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * 使用主题上下文的 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
