import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import {
  Link,
  Trash2,
  ExternalLink,
  Copy,
  Pin,
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
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
  onPin?: (id: string) => void
  onClick?: () => void
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
 * 截断文本内容
 */
const truncateContent = (text: string, maxLength: number = 200) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
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
    onDelete,
    onPin,
    onClick,
  },
  ref
) {
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      window.open(url, '_blank')
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

  /**
   * 渲染统一模板的卡片（便签和笔记）
   */
  const renderUnifiedCard = () => {
    const rotation = 'rotate-2'
    const bgClass = getNoteColor(id)

    return (
      <div 
        className={`unified-card torn-edge ${bgClass} ${rotation} group`}
        data-pinned={pinned}
      >
        <div className="card-inner">
          <div className="card-top">
            <span className="card-title-unified">{title || '无标题'}</span>
            <div className="card-actions-unified">
              <button
                className="card-action-icon"
                onClick={e => {
                  e.stopPropagation()
                  onPin?.(id)
                }}
                title={pinned ? '取消置顶' : '置顶'}
              >
                {pinned ? <Pin size={20} fill="currentColor" /> : <Pin size={20} />}
              </button>
              <button
                className="card-action-icon delete"
                onClick={e => {
                  e.stopPropagation()
                  onDelete?.(id)
                }}
                title="删除"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="card-content-unified">
            <p>{truncateContent(content) || '点击添加内容...'}</p>
          </div>
          <div className="card-bottom">
            <span className="card-date-unified">{formatDate(updatedAt)}</span>
            <div className="card-badges">
              <div className="badge">✨</div>
              <div className="badge">📜</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            {pinned ? <Pin size={14} fill="currentColor" /> : <Pin size={14} />}
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
            className="card-action-btn delete"
            onClick={e => {
              e.stopPropagation()
              onDelete?.(id)
            }}
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {url && (
        <div className="card-content" onClick={handleOpenLink} style={{ cursor: 'pointer' }}>
          <p className="card-description">{content || url}</p>
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
          <img src={imagePath} alt={title} className="card-img" />
          {pinned && (
            <div className="card-image-pin-indicator">
              <Pin size={12} />
            </div>
          )}
        </div>
      )}
      <div className="card-header">
        <div className="card-title-wrapper">
          <h3 className="card-title">
            {!imagePath && pinned && <Pin size={12} className="card-title-pin" />}
            {title || '图文卡片'}
          </h3>
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
            {pinned ? <Pin size={14} fill="currentColor" /> : <Pin size={14} />}
          </button>
          <button
            className="card-action-btn delete"
            onClick={e => {
              e.stopPropagation()
              onDelete?.(id)
            }}
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {content && (
        <div className="card-content">
          <p className="card-caption">{content}</p>
        </div>
      )}

      <div className="card-footer">
        <span className="card-date">{formatDate(updatedAt)}</span>
        <span className="card-type-label">图文</span>
      </div>
    </>
  )

  /**
   * 根据类型渲染卡片内容
   */
  const renderCardContent = () => {
    switch (type) {
      case 'note':
      case 'doc':
        return renderUnifiedCard()
      case 'link':
        return renderLinkCard()
      case 'image':
      default:
        return renderImageCard()
    }
  }

  if (type === 'note' || type === 'doc') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
      >
        {renderCardContent()}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={`card ${isDeleted ? 'card-deleted' : ''} ${pinned ? 'card-pinned' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
    >
      {renderCardContent()}
    </motion.div>
  )
})

export default Card
