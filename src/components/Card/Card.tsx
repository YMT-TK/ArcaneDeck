import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { TiptapEditor } from '../Editor'
import {
  FileText,
  Link,
  StickyNote,
  Image,
  MoreVertical,
  Trash2,
  Archive,
  RotateCcw,
  ExternalLink,
  Copy,
  Pin,
  PinOff,
} from 'lucide-react'
import './Card.css'

/**
 * 卡片类型
 * - note: 便签（瀑布流布局）
 * - doc: 笔记（统一网格布局）
 * - link: 网址（统一网格布局）
 * - image: 图文（瀑布流布局）
 */
type CardType = 'note' | 'doc' | 'link' | 'image'

/**
 * 卡片状态
 */
type CardStatus = 'active' | 'archived' | 'deleted'

/**
 * 卡片组件属性接口
 */
interface CardProps {
  id: string
  title: string
  content: string
  type: CardType
  status?: CardStatus
  pinned?: boolean
  url?: string
  imagePath?: string
  favicon?: string
  createdAt: Date
  updatedAt: Date
  onEdit?: (id: string, data: { title: string; content: string }) => void
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
  onArchive?: (id: string) => void
  onPin?: (id: string) => void
  onClick?: (id: string) => void
}

/**
 * 获取卡片类型图标
 */
const getCardTypeIcon = (type: CardType) => {
  const icons = {
    note: StickyNote,
    doc: FileText,
    link: Link,
    image: Image,
  }
  return icons[type] || StickyNote
}

/**
 * 获取便签背景色
 */
const getNoteColor = (id: string) => {
  const colors = ['note-yellow', 'note-pink', 'note-blue', 'note-green', 'note-purple']
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

/**
 * 卡片组件
 * @description 展示单个知识卡片的组件，支持4种类型
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    id,
    title,
    content,
    type,
    status = 'active',
    pinned = false,
    url,
    imagePath,
    favicon,
    updatedAt,
    onEdit,
    onDelete,
    onRestore,
    onArchive,
    onPin,
    onClick,
  },
  ref
) {
  const [isEditing, setIsEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)

  const TypeIcon = getCardTypeIcon(type)

  const handleSave = () => {
    setIsEditing(false)
    onEdit?.(id, { title: editTitle, content: editContent })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle(title)
    setEditContent(content)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing) {
      if (type === 'link' && url) {
        window.open(url, '_blank')
      } else {
        onClick?.(id)
      }
    }
  }

  const handleDoubleClick = () => {
    if (!isEditing && type !== 'link') {
      setIsEditing(true)
    }
  }

  const handleCopyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isDeleted = status === 'deleted'
  const noteColor = type === 'note' ? getNoteColor(id) : ''

  /**
   * 渲染便签类型卡片
   */
  const renderNoteCard = () => (
    <div className={`card-note ${noteColor}`}>
      {pinned && (
        <div className="card-pin-indicator">
          <Pin size={12} />
        </div>
      )}
      <div className="card-content">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="note-textarea"
            placeholder="快速记录..."
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <p className="note-text">{content || '双击编辑便签...'}</p>
        )}
      </div>
      <div className="card-footer">
        <span className="card-date">{formatDate(updatedAt)}</span>
        {!isEditing && (
          <div className="note-actions">
            <button
              className="note-action-btn"
              onClick={e => {
                e.stopPropagation()
                onPin?.(id)
              }}
              title={pinned ? '取消置顶' : '置顶'}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              className="note-action-btn delete"
              onClick={e => {
                e.stopPropagation()
                onDelete?.(id)
              }}
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {isEditing && (
        <div className="card-edit-actions">
          <button className="card-btn cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="card-btn save" onClick={handleSave}>
            保存
          </button>
        </div>
      )}
    </div>
  )

  /**
   * 渲染笔记类型卡片
   */
  const renderDocCard = () => (
    <>
      <div className="card-header">
        <div className="card-type-icon">
          <TypeIcon size={16} />
        </div>
        <div className="card-title-wrapper">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="card-title-input"
              placeholder="输入标题..."
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <h3 className="card-title">
              {pinned && <Pin size={12} className="card-title-pin" />}
              {title || '无标题笔记'}
            </h3>
          )}
        </div>
        <div className="card-actions">
          <button
            className="card-action-btn"
            onClick={e => {
              e.stopPropagation()
              onPin?.(id)
            }}
            title={pinned ? '取消置顶' : '置顶'}
          >
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            className="card-menu-button"
            onClick={e => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="card-menu" onClick={e => e.stopPropagation()}>
              {isDeleted ? (
                <button
                  className="card-menu-item"
                  onClick={() => {
                    onRestore?.(id)
                    setShowMenu(false)
                  }}
                >
                  <RotateCcw size={14} />
                  <span>恢复</span>
                </button>
              ) : (
                <>
                  <button
                    className="card-menu-item"
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="card-menu-item"
                    onClick={() => {
                      onArchive?.(id)
                      setShowMenu(false)
                    }}
                  >
                    <Archive size={14} />
                    <span>归档</span>
                  </button>
                  <button
                    className="card-menu-item delete"
                    onClick={() => {
                      onDelete?.(id)
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 size={14} />
                    <span>删除</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card-content">
        {isEditing ? (
          <div onClick={e => e.stopPropagation()}>
            <TiptapEditor
              content={editContent}
              onUpdate={setEditContent}
              placeholder="输入内容..."
            />
          </div>
        ) : (
          <div className="card-content-preview">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <span className="card-content-empty">无内容</span>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-date">{formatDate(updatedAt)}</span>
        <span className="card-type-label">笔记</span>
      </div>

      {isEditing && (
        <div className="card-edit-actions">
          <button className="card-btn cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="card-btn save" onClick={handleSave}>
            保存
          </button>
        </div>
      )}
    </>
  )

  /**
   * 渲染链接类型卡片
   */
  const renderLinkCard = () => (
    <>
      <div className="card-header">
        <div className="card-type-icon link-icon">
          {favicon ? <img src={favicon} alt="" className="card-favicon" /> : <Link size={16} />}
        </div>
        <div className="card-title-wrapper">
          <h3 className="card-title">
            {pinned && <Pin size={12} className="card-title-pin" />}
            {title || url || '未命名链接'}
          </h3>
          {url && <p className="card-url">{new URL(url).hostname}</p>}
        </div>
        <div className="card-actions">
          <button
            className="card-action-btn"
            onClick={e => {
              e.stopPropagation()
              onPin?.(id)
            }}
            title={pinned ? '取消置顶' : '置顶'}
          >
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            className="card-action-btn"
            onClick={e => {
              e.stopPropagation()
              handleCopyLink()
            }}
            title="复制链接"
          >
            <Copy size={14} />
          </button>
          <button
            className="card-action-btn"
            onClick={e => {
              e.stopPropagation()
              window.open(url, '_blank')
            }}
            title="打开链接"
          >
            <ExternalLink size={14} />
          </button>
          <button
            className="card-menu-button"
            onClick={e => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="card-menu" onClick={e => e.stopPropagation()}>
              {isDeleted ? (
                <button
                  className="card-menu-item"
                  onClick={() => {
                    onRestore?.(id)
                    setShowMenu(false)
                  }}
                >
                  <RotateCcw size={14} />
                  <span>恢复</span>
                </button>
              ) : (
                <>
                  <button
                    className="card-menu-item"
                    onClick={() => {
                      onDelete?.(id)
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 size={14} />
                    <span>删除</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {content && (
        <div className="card-content">
          <p className="card-description">{content}</p>
        </div>
      )}

      <div className="card-footer">
        <span className="card-date">{formatDate(updatedAt)}</span>
        <span className="card-type-label">网址</span>
      </div>
    </>
  )

  /**
   * 渲染图文类型卡片
   */
  const renderImageCard = () => (
    <>
      {imagePath && (
        <div className="card-image-wrapper">
          <img src={imagePath} alt={title} className="card-image" />
          {pinned && (
            <div className="card-image-pin-indicator">
              <Pin size={12} />
            </div>
          )}
        </div>
      )}
      <div className="card-header">
        <div className="card-type-icon">
          <TypeIcon size={16} />
        </div>
        <div className="card-title-wrapper">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="card-title-input"
              placeholder="输入标题..."
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <h3 className="card-title">
              {!imagePath && pinned && <Pin size={12} className="card-title-pin" />}
              {title || '图文卡片'}
            </h3>
          )}
        </div>
        <div className="card-actions">
          <button
            className="card-action-btn"
            onClick={e => {
              e.stopPropagation()
              onPin?.(id)
            }}
            title={pinned ? '取消置顶' : '置顶'}
          >
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            className="card-menu-button"
            onClick={e => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="card-menu" onClick={e => e.stopPropagation()}>
              {isDeleted ? (
                <button
                  className="card-menu-item"
                  onClick={() => {
                    onRestore?.(id)
                    setShowMenu(false)
                  }}
                >
                  <RotateCcw size={14} />
                  <span>恢复</span>
                </button>
              ) : (
                <>
                  <button
                    className="card-menu-item"
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="card-menu-item delete"
                    onClick={() => {
                      onDelete?.(id)
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 size={14} />
                    <span>删除</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {content && (
        <div className="card-content">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="card-caption-input"
              placeholder="添加说明..."
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <p className="card-caption">{content}</p>
          )}
        </div>
      )}

      <div className="card-footer">
        <span className="card-date">{formatDate(updatedAt)}</span>
        <span className="card-type-label">图文</span>
      </div>

      {isEditing && (
        <div className="card-edit-actions">
          <button className="card-btn cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="card-btn save" onClick={handleSave}>
            保存
          </button>
        </div>
      )}
    </>
  )

  /**
   * 根据类型渲染卡片内容
   */
  const renderCardContent = () => {
    switch (type) {
      case 'note':
        return renderNoteCard()
      case 'link':
        return renderLinkCard()
      case 'image':
        return renderImageCard()
      case 'doc':
      default:
        return renderDocCard()
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`card card-${type} ${isDeleted ? 'card-deleted' : ''} ${pinned ? 'card-pinned' : ''} ${noteColor}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: isEditing ? 1 : type === 'link' ? 1.01 : 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
    >
      {renderCardContent()}
    </motion.div>
  )
})

export default Card
