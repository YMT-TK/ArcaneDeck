import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, FileText, Link, Image, X, CheckSquare } from 'lucide-react'
import './CardTypeSelector.css'

/**
 * 卡片类型定义
 */
export interface CardTypeOption {
  type: 'note' | 'doc' | 'link' | 'image' | 'todo'
  label: string
  description: string
  icon: typeof StickyNote
  layout: 'masonry' | 'grid'
}

/**
 * 卡片类型选项列表
 */
export const CARD_TYPES: CardTypeOption[] = [
  {
    type: 'note',
    label: '便签',
    description: '快速记录灵感、待办事项',
    icon: StickyNote,
    layout: 'masonry',
  },
  {
    type: 'todo',
    label: '待办',
    description: '带复选框的任务列表',
    icon: CheckSquare,
    layout: 'masonry',
  },
  {
    type: 'doc',
    label: '笔记',
    description: 'Markdown富文本笔记',
    icon: FileText,
    layout: 'grid',
  },
  {
    type: 'link',
    label: '网址',
    description: '收藏网站链接',
    icon: Link,
    layout: 'grid',
  },
  {
    type: 'image',
    label: '图文',
    description: '图片与说明文字',
    icon: Image,
    layout: 'masonry',
  },
]

/**
 * 卡片类型选择器属性接口
 */
interface CardTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: 'note' | 'doc' | 'link' | 'image' | 'todo') => void
}

/**
 * 卡片类型选择器组件
 * @description 创建卡片时选择类型的弹窗
 */
function CardTypeSelector({ isOpen, onClose, onSelect }: CardTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  const handleSelect = (type: 'note' | 'doc' | 'link' | 'image' | 'todo') => {
    onSelect(type)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="type-selector-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="type-selector-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="type-selector-header">
              <h2 className="type-selector-title">选择卡片类型</h2>
              <button className="type-selector-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="type-selector-grid">
              {CARD_TYPES.map(option => {
                const Icon = option.icon
                const isHovered = hoveredType === option.type

                return (
                  <motion.button
                    key={option.type}
                    className={`type-option ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredType(option.type)}
                    onMouseLeave={() => setHoveredType(null)}
                    onClick={() => handleSelect(option.type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="type-option-icon">
                      <Icon size={32} />
                    </div>
                    <div className="type-option-content">
                      <h3 className="type-option-label">{option.label}</h3>
                      <p className="type-option-description">{option.description}</p>
                      <span className="type-option-layout">
                        {option.layout === 'masonry' ? '瀑布流' : '网格'}布局
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="type-selector-footer">
              <p className="type-selector-hint">
                💡 提示：便签、待办和图文使用瀑布流布局，笔记和网址使用网格布局
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CardTypeSelector
