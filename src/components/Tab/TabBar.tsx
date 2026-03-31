import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, AlertTriangle } from 'lucide-react'
import './TabBar.css'

/**
 * Tab 数据接口
 */
export interface TabData {
  id: string
  name: string
  position: number
  cardCount?: number
}

/**
 * TabBar 组件属性接口
 */
interface TabBarProps {
  tabs: TabData[]
  activeTabId: string | null
  onTabSelect: (id: string) => void
  onTabCreate: (name: string) => void
  onTabUpdate: (id: string, name: string) => void
  onTabDelete: (id: string) => void
  maxTabs?: number
  showRecycleBin?: boolean
  recycleBinCount?: number
  onRecycleBinClick?: () => void
}

/**
 * Tab 栏组件
 * @description 管理和切换 Tab 分类
 */
function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabCreate,
  onTabUpdate,
  onTabDelete,
  maxTabs = 20,
  showRecycleBin = false,
  recycleBinCount = 0,
  onRecycleBinClick,
}: TabBarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteConfirmTab, setDeleteConfirmTab] = useState<TabData | null>(null)

  const handleCreateTab = () => {
    if (tabs.length >= maxTabs) {
      alert(`Tab 数量已达上限 (${maxTabs}个)，请整理或归档后再创建`)
      return
    }
    setIsCreating(true)
    setNewTabName('')
  }

  const handleSaveNewTab = () => {
    const trimmedName = newTabName.trim()
    if (trimmedName) {
      onTabCreate(trimmedName)
      setIsCreating(false)
      setNewTabName('')
    }
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewTabName('')
  }

  const handleStartEdit = (tab: TabData) => {
    setEditingTabId(tab.id)
    setEditingName(tab.name)
  }

  const handleSaveEdit = () => {
    const trimmedName = editingName.trim()
    if (trimmedName && editingTabId) {
      onTabUpdate(editingTabId, trimmedName)
      setEditingTabId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingTabId(null)
    setEditingName('')
  }

  const handleDeleteRequest = (tab: TabData) => {
    setDeleteConfirmTab(tab)
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmTab) {
      onTabDelete(deleteConfirmTab.id)
      setDeleteConfirmTab(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmTab(null)
  }

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              {editingTabId === tab.id ? (
                <div className="tab-edit-form">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="tab-edit-input"
                  />
                </div>
              ) : (
                <>
                  <button
                    className="tab-button"
                    onClick={() => onTabSelect(tab.id)}
                    onDoubleClick={() => handleStartEdit(tab)}
                  >
                    <span className="tab-name">{tab.name}</span>
                    {tab.cardCount !== undefined && (
                      <span className="tab-count">{tab.cardCount}</span>
                    )}
                  </button>
                  <button
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRequest(tab)
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isCreating && (
          <motion.div
            className="tab-item creating"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNewTab()
                if (e.key === 'Escape') handleCancelCreate()
              }}
              onBlur={handleSaveNewTab}
              placeholder="输入Tab名称..."
              autoFocus
              className="tab-create-input"
            />
          </motion.div>
        )}

        <button
          className="tab-add-button"
          onClick={handleCreateTab}
          disabled={tabs.length >= maxTabs}
          title={tabs.length >= maxTabs ? `已达上限 (${maxTabs}个)` : '新建Tab'}
        >
          <Plus size={16} />
        </button>
      </div>

      {showRecycleBin && (
        <button
          className={`recycle-bin-button ${activeTabId === 'recycle-bin' ? 'active' : ''}`}
          onClick={onRecycleBinClick}
          title="回收站"
        >
          <Trash2 size={16} />
          {recycleBinCount > 0 && (
            <span className="recycle-bin-count">{recycleBinCount}</span>
          )}
        </button>
      )}

      {deleteConfirmTab && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon">
              <AlertTriangle size={48} />
            </div>
            <h3 className="delete-confirm-title">确认删除 Tab</h3>
            <p className="delete-confirm-message">
              确定要删除 "{deleteConfirmTab.name}" 吗？
            </p>
            {deleteConfirmTab.cardCount !== undefined && deleteConfirmTab.cardCount > 0 && (
              <p className="delete-confirm-warning">
                该 Tab 下有 {deleteConfirmTab.cardCount} 张卡片，删除后卡片将移动到默认 Tab。
              </p>
            )}
            <div className="delete-confirm-actions">
              <button className="delete-confirm-btn cancel" onClick={handleCancelDelete}>
                取消
              </button>
              <button className="delete-confirm-btn confirm" onClick={handleConfirmDelete}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TabBar
