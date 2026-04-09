import { Search, Bell, Download, RefreshCw, Plus } from 'lucide-react'
import { useState } from 'react'

type CardType = 'note' | 'doc' | 'link' | 'image'

/**
 * 头部组件
 * @description 应用程序的顶部导航栏
 */
function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * 处理搜索
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  /**
   * 处理刷新按钮点击
   */
  const handleRefresh = async () => {
    const actions = (window as any).cardActions
    if (actions?.loadCards) {
      await actions.loadCards()
    }
  }

  /**
   * 处理添加按钮点击
   */
  const handleAdd = () => {
    const actions = (window as any).cardActions
    if (actions?.handleAddCard) {
      actions.handleAddCard()
    }
  }

  /**
   * 获取当前卡片类型
   */
  const getCurrentType = (): CardType | null => {
    const actions = (window as any).cardActions
    if (actions?.getCurrentCardType) {
      return actions.getCurrentCardType()
    }
    return null
  }

  const showRecycleBin = (window as any).cardActions?.showRecycleBin ?? false

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
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
            onChange={e => setSearchQuery(e.target.value)}
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
          title="刷新"
          onClick={handleRefresh}
        >
          <RefreshCw size={18} />
        </button>

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

        {!showRecycleBin && (
          <button className="add-card-button ml-2" onClick={handleAdd}>
            <Plus size={16} />
            <span>
              添加
              {getCurrentType() === 'note'
                ? '便签'
                : getCurrentType() === 'doc'
                  ? '笔记'
                  : getCurrentType() === 'link'
                    ? '链接'
                    : getCurrentType() === 'image'
                      ? '图文'
                      : '卡片'}
            </span>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
