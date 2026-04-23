import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  StickyNote,
  FileText,
  Link,
  Image,
  Settings,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckSquare,
} from 'lucide-react'
import { useSettingsStore, useSidebarStore, useCardStore } from '../../stores'
import './Sidebar.css'

/**
 * 导航项接口
 */
interface NavItem {
  id: string
  icon: React.ComponentType<any>
  label: string
  type?: 'note' | 'doc' | 'link' | 'image' | 'todo'
}

/**
 * 侧边栏组件
 * @description 应用程序的主导航侧边栏，包含logo、内容类型标签、回收站和设置按钮
 */
function Sidebar() {
  const {
    activeNavId,
    setActiveNavId,
    showRecycleBin,
    toggleRecycleBin,
    collapsed,
    toggleCollapse,
  } = useSidebarStore()
  const { openSettings } = useSettingsStore()
  const { cards } = useCardStore()

  const navItems: NavItem[] = [
    { id: 'all', icon: Sparkles, label: '全部' },
    { id: 'note', icon: StickyNote, label: '便签', type: 'note' },
    { id: 'todo', icon: CheckSquare, label: '待办', type: 'todo' },
    { id: 'doc', icon: FileText, label: '笔记', type: 'doc' },
    { id: 'link', icon: Link, label: '链接', type: 'link' },
    { id: 'image', icon: Image, label: '图文', type: 'image' },
  ]

  const recycleBinCount = cards.filter(c => c.status === 'deleted').length

  const handleNavClick = (id: string) => {
    setActiveNavId(id)
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
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
            title={item.label}
          >
            <item.icon size={18} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 底部区域 */}
      <div className="sidebar-footer">
        {/* 折叠按钮 */}
        <button
          className="collapse-btn"
          onClick={toggleCollapse}
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* 回收站按钮 */}
        <button
          className={`footer-link ${showRecycleBin ? 'footer-link-active' : ''}`}
          onClick={toggleRecycleBin}
          title="回收站"
        >
          <Trash2 size={16} />
          <span className="footer-text">回收站</span>
          {!collapsed && recycleBinCount > 0 && (
            <span className="recycle-bin-badge">{recycleBinCount}</span>
          )}
          {collapsed && recycleBinCount > 0 && (
            <span className="recycle-bin-badge-mini">{recycleBinCount}</span>
          )}
        </button>
        <button className="footer-link" onClick={openSettings} title="设置">
          <Settings size={16} />
          <span className="footer-text">设置</span>
        </button>
        <button className="footer-link" title="帮助">
          <HelpCircle size={16} />
          <span className="footer-text">帮助</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
