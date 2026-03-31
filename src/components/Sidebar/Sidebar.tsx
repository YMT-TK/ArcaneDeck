import { Trash2 } from 'lucide-react'
import {
  StickyNote,
  FileText,
  Link,
  Image,
  Settings,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { useSettingsStore, useSidebarStore, useCardStore } from '../../stores'
import './Sidebar.css'

/**
 * 导航项接口
 */
interface NavItem {
  id: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  type?: 'note' | 'doc' | 'link' | 'image'
}

/**
 * 侧边栏组件
 * @description 应用程序的主导航侧边栏，包含logo、内容类型标签、回收站和设置按钮
 */
function Sidebar() {
  const { activeNavId, setActiveNavId, showRecycleBin, toggleRecycleBin } = useSidebarStore()
  const { openSettings } = useSettingsStore()
  const { cards } = useCardStore()

  const navItems: NavItem[] = [
    { id: 'all', icon: Sparkles, label: '全部' },
    { id: 'note', icon: StickyNote, label: '便签', type: 'note' },
    { id: 'doc', icon: FileText, label: '笔记', type: 'doc' },
    { id: 'link', icon: Link, label: '链接', type: 'link' },
    { id: 'image', icon: Image, label: '图文', type: 'image' },
  ]

  const recycleBinCount = cards.filter((c) => c.status === 'deleted').length

  const handleNavClick = (id: string) => {
    setActiveNavId(id)
  }

  return (
    <aside className="sidebar">
      {/* Logo 区域 */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <BookOpen size={20} />
          </div>
          <div className="logo-text">
            <h1 className="logo-title">ArcaneDeck</h1>
            <p className="logo-subtitle">知识管理</p>
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`nav-item ${activeNavId === item.id && !showRecycleBin ? 'nav-item-active' : ''}`}
          >
            <item.icon size={18} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 底部区域 */}
      <div className="sidebar-footer">
        {/* 回收站按钮 */}
        <button 
          className={`footer-link ${showRecycleBin ? 'footer-link-active' : ''}`}
          onClick={toggleRecycleBin}
        >
          <Trash2 size={16} />
          <span>回收站</span>
          {recycleBinCount > 0 && (
            <span className="recycle-bin-badge">{recycleBinCount}</span>
          )}
        </button>
        <button className="footer-link" onClick={openSettings}>
          <Settings size={16} />
          <span>设置</span>
        </button>
        <button className="footer-link">
          <HelpCircle size={16} />
          <span>帮助</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
