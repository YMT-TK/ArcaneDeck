import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card } from '../Card'
import { ImageCardEditor } from '../ImageCardEditor'
import { useCardStore } from '../../stores/cardStore'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useEditModalStore } from '../../stores'
import './CardGrid.css'

type CardType = 'note' | 'doc' | 'link' | 'image' | 'todo'

type CardStatus = 'active' | 'archived' | 'deleted'

interface CardData {
  id: string
  title: string
  content: string
  type: CardType
  status: CardStatus
  tabId: string | null
  position: number
  pinned: boolean
  styleConfig: string | null
  url?: string
  imagePath?: string
  favicon?: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

/**
 * 判断卡片类型使用的布局
 */
const getCardLayout = (type: CardType): 'masonry' | 'grid' => {
  return type === 'note' || type === 'image' || type === 'todo' ? 'masonry' : 'grid'
}

/**
 * 获取导航标题
 */
// const getNavTitle = (navId: string): string => {
//   const titles: Record<string, string> = {
//     all: '全部卡片',
//     note: '便签',
//     doc: '笔记',
//     link: '链接',
//     image: '图文',
//   }
//   return titles[navId] || '全部卡片'
// }

/**
 * 卡片网格组件
 * @description 主内容区域，展示卡片列表，支持混合布局
 */
function CardGrid() {
  const {
    cards,
    isLoading,
    setCards,
    addCard,
    deleteCard,
    restoreCard,
    toggleCardPin,
    setLoading,
  } = useCardStore()

  const { activeNavId, showRecycleBin } = useSidebarStore()
  const { openEditModal } = useEditModalStore()

  const [showImageEditor, setShowImageEditor] = useState(false)
  const [deleteConfirmCardId, setDeleteConfirmCardId] = useState<string | null>(null)

  /**
   * 处理卡片点击事件
   */
  const handleCardClick = (cardId: string, cardType: CardType) => {
    openEditModal(cardId, cardType)
  }

  /**
   * 加载卡片列表
   */
  const loadCards = useCallback(async () => {
    setLoading(true)
    try {
      let cardList: CardData[] = await window.electronAPI.card.getAll()

      if (showRecycleBin) {
        cardList = cardList.filter((c: CardData) => c.status === 'deleted')
      } else {
        cardList = cardList.filter((c: CardData) => c.status !== 'deleted')
        if (activeNavId !== 'all') {
          cardList = cardList.filter((c: CardData) => c.type === activeNavId)
        }
      }
      setCards(cardList)
    } catch (error) {
      console.error('Failed to load cards:', error)
    } finally {
      setLoading(false)
    }
  }, [activeNavId, showRecycleBin, setCards, setLoading])

  /**
   * 获取当前选中的卡片类型
   */
  const getCurrentCardType = (): CardType | null => {
    if (activeNavId === 'all') return null
    if (['note', 'todo', 'doc', 'link', 'image'].includes(activeNavId)) {
      return activeNavId as CardType
    }
    return null
  }

  /**
   * 添加卡片按钮点击处理
   */
  const handleAddCard = () => {
    const cardType = getCurrentCardType()

    if (cardType === 'link') {
      openEditModal(null, 'link')
    } else if (cardType === 'image') {
      setShowImageEditor(true)
    } else if (cardType === 'todo') {
      openEditModal(null, 'todo')
    } else if (cardType) {
      handleCreateSimpleCard(cardType)
    } else {
      handleCreateSimpleCard('note')
    }
  }

  useEffect(() => {
    loadCards()
  }, [loadCards])

  /**
   * 将函数暴露到 window 对象上，供 Header 组件使用
   */
  useEffect(() => {
    ;(window as any).cardActions = {
      loadCards,
      handleAddCard,
      getCurrentCardType,
      showRecycleBin,
    }

    return () => {
      delete (window as any).cardActions
    }
  }, [loadCards, handleAddCard, getCurrentCardType, showRecycleBin])

  /**
   * 创建便签或笔记卡片
   */
  const handleCreateSimpleCard = async (type: CardType) => {
    try {
      const defaultContent = type === 'todo' ? JSON.stringify({ items: [] }) : ''
      const newCard = await window.electronAPI.card.create({
        title: '',
        content: defaultContent,
        type,
        tabId: null,
      })
      addCard(newCard)
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  /**
   * 创建图文卡片
   */
  const handleCreateImageCard = async (data: { imagePath: string; caption: string }) => {
    try {
      const newCard = await window.electronAPI.card.create({
        title: data.caption || '图文卡片',
        content: data.caption,
        type: 'image',
        tabId: null,
        imagePath: data.imagePath,
      })
      addCard(newCard)
      setShowImageEditor(false)
    } catch (error) {
      console.error('Failed to create image card:', error)
    }
  }

  /**
   * 删除卡片（软删除）
   */
  const handleDeleteCard = (id: string) => {
    setDeleteConfirmCardId(id)
  }

  /**
   * 确认删除卡片
   */
  const confirmDeleteCard = async () => {
    if (!deleteConfirmCardId) return
    try {
      await window.electronAPI.card.delete(deleteConfirmCardId)
      deleteCard(deleteConfirmCardId)
    } catch (error) {
      console.error('Failed to delete card:', error)
    } finally {
      setDeleteConfirmCardId(null)
    }
  }

  /**
   * 取消删除
   */
  const cancelDelete = () => {
    setDeleteConfirmCardId(null)
  }

  /**
   * 恢复卡片
   */
  const handleRestoreCard = async (id: string) => {
    try {
      await window.electronAPI.card.restore(id)
      restoreCard(id)
    } catch (error) {
      console.error('Failed to restore card:', error)
    }
  }

  /**
   * 置顶/取消置顶卡片
   */
  const handleTogglePin = async (id: string) => {
    try {
      const updatedCard = await window.electronAPI.card.togglePin(id)
      toggleCardPin(id, updatedCard.pinned)
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  /**
   * 分组卡片，置顶卡片排在顶部
   */
  const getGroupedCards = () => {
    const sortedCards = [...cards].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return b.pinned ? 1 : -1
      }
      return a.position - b.position
    })

    const masonryCards = sortedCards.filter(c => getCardLayout(c.type) === 'masonry')
    const gridCards = sortedCards.filter(c => getCardLayout(c.type) === 'grid')
    return { masonryCards, gridCards }
  }

  const { masonryCards, gridCards } = getGroupedCards()

  return (
    <div className="card-grid-container">
      {/* <div className="card-grid-toolbar">
        <div className="toolbar-left">
          <h2 className="toolbar-title">{showRecycleBin ? '回收站' : activeNavId === 'all' ? '全部卡片' : activeNavId === 'note' ? '便签' : activeNavId === 'doc' ? '笔记' : activeNavId === 'link' ? '链接' : activeNavId === 'image' ? '图文' : '全部卡片'}</h2>
          <span className="card-count">{cards.length} 张卡片</span>
        </div>
        <div className="toolbar-right">
        </div>
      </div> */}

      <div className="card-grid-content auto">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>加载中...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{showRecycleBin ? '🗑️' : '📝'}</div>
            <h3>{showRecycleBin ? '回收站为空' : '暂无卡片'}</h3>
            <p>
              {showRecycleBin ? '删除的卡片将在这里显示' : '点击上方"添加卡片"按钮创建第一张卡片'}
            </p>
            {!showRecycleBin && (
              <button className="empty-add-button" onClick={handleAddCard}>
                <Plus size={16} />
                <span>添加卡片</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mixed-layout">
            {masonryCards.length > 0 && (
              <div className="masonry-section">
                <div className="section-label">便签、待办 & 图文</div>
                <div className="masonry-grid">
                  <AnimatePresence mode="popLayout">
                    {masonryCards.map(card => (
                      <Card
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        content={card.content}
                        type={card.type}
                        status={card.status}
                        pinned={card.pinned}
                        url={card.url}
                        imagePath={card.imagePath}
                        favicon={card.favicon}
                        createdAt={card.createdAt}
                        updatedAt={card.updatedAt}
                        onDelete={handleDeleteCard}
                        onRestore={handleRestoreCard}
                        onPin={handleTogglePin}
                        onClick={() => handleCardClick(card.id, card.type)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            {gridCards.length > 0 && (
              <div className="grid-section">
                <div className="section-label">笔记 & 网址</div>
                <div className="uniform-grid">
                  <AnimatePresence mode="popLayout">
                    {gridCards.map(card => (
                      <Card
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        content={card.content}
                        type={card.type}
                        status={card.status}
                        pinned={card.pinned}
                        url={card.url}
                        imagePath={card.imagePath}
                        favicon={card.favicon}
                        createdAt={card.createdAt}
                        updatedAt={card.updatedAt}
                        onDelete={handleDeleteCard}
                        onRestore={handleRestoreCard}
                        onPin={handleTogglePin}
                        onClick={() => handleCardClick(card.id, card.type)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {showImageEditor && (
            <motion.div
              className="editor-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="editor-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ImageCardEditor
                  onSave={handleCreateImageCard}
                  onCancel={() => setShowImageEditor(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {deleteConfirmCardId && (
            <motion.div
              className="editor-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
            >
              <motion.div
                className="editor-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="delete-confirm-dialog">
                  <h3 className="delete-confirm-title">确认删除</h3>
                  <p className="delete-confirm-message">
                    确定要删除这张卡片吗？此操作可以在回收站中恢复。
                  </p>
                  <div className="delete-confirm-actions">
                    <button className="delete-confirm-btn cancel" onClick={cancelDelete}>
                      取消
                    </button>
                    <button className="delete-confirm-btn confirm" onClick={confirmDeleteCard}>
                      确认删除
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

export default CardGrid
