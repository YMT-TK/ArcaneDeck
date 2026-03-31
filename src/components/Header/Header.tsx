import { useTheme } from '../../contexts/ThemeContext'
import { 
  Search, 
  Bell, 
  Maximize2, 
  Minimize2,
  Download
} from 'lucide-react'
import { useState } from 'react'

/**
 * 头部组件
 * @description 应用程序的顶部导航栏
 */
function Header() {
  const { theme } = useTheme()
  const [isMaximized, setIsMaximized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * 切换窗口最大化状态
   */
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  /**
   * 处理搜索
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  return (
    <header 
      className="h-14 flex items-center justify-between px-4 border-b"
      style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}
    >
      <div className="flex items-center gap-4">
        <h1 
          className="text-lg font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          ArcaneDeck
        </h1>
        
        <form onSubmit={handleSearch} className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-secondary)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索卡片..."
            className="pl-9 pr-4 py-1.5 rounded-lg text-sm w-64"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
          title="备份数据"
        >
          <Download size={18} />
        </button>
        
        <button 
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
          title="通知"
        >
          <Bell size={18} />
        </button>
        
        <button 
          onClick={toggleMaximize}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <div 
          className="ml-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)'
          }}
        >
          {theme === 'scifi' ? '科幻' : theme === 'magic' ? '魔法' : '精简'}
        </div>
      </div>
    </header>
  )
}

export default Header
