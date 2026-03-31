import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LayoutGrid, Columns, RefreshCw } from 'lucide-react'
import { Card } from '../Card'
import { LinkCardEditor } from '../LinkCardEditor'
import { ImageCardEditor } from '../ImageCardEditor'
import { useCardStore } from '../../stores/cardStore'
import { useSidebarStore } from '../../stores/sidebarStore'
import './CardGrid.css'

type ViewMode = 'grid' | 'masonry' | 'auto'

type CardType = 'note' | 'doc' | 'link' | 'image'

type CardStatus = 'active' | 'archived' | 'deleted'

interface CardData {
  id: string
  title: string
  content: string
  type: CardType
  status: CardStatus
  tabId: string | null
  position: number
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
  return type === 'note' || type === 'image' ? 'masonry' : 'grid'
}

/**
 * 获取导航标题
 */
const getNavTitle = (navId: string): string => {
  const titles: Record<string, string> = {
    all: '全部卡片',
    note: '便签',
    doc: '笔记',
    link: '链接',
    image: '图文',
  }
  return titles[navId] || '全部卡片'
}

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
    updateCard,
    deleteCard,
    restoreCard,
    setLoading,
  } = useCardStore()

  const { activeNavId, showRecycleBin } = useSidebarStore()

  const [viewMode, setViewMode] = useState<ViewMode>('auto')
  const [showLinkEditor, setShowLinkEditor] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)

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

  useEffect(() => {
    loadCards()
  }, [loadCards])

  /**
   * 获取当前选中的卡片类型
   */
  const getCurrentCardType = (): CardType | null => {
    if (activeNavId === 'all') return null
    if (['note', 'doc', 'link', 'image'].includes(activeNavId)) {
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
      setShowLinkEditor(true)
    } else if (cardType === 'image') {
      setShowImageEditor(true)
    } else if (cardType) {
      handleCreateSimpleCard(cardType)
    } else {
      handleCreateSimpleCard('note')
    }
  }

  /**
   * 创建便签或笔记卡片
   */
  const handleCreateSimpleCard = async (type: CardType) => {
    try {
      const newCard = await window.electronAPI.card.create({
        title: '',
        content: '',
        type,
        tabId: null,
      })
      addCard(newCard)
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  /**
   * 创建链接卡片
   */
  const handleCreateLinkCard = async (data: { url: string; title: string; favicon?: string }) => {
    try {
      const newCard = await window.electronAPI.card.create({
        title: data.title || new URL(data.url).hostname,
        content: data.url,
        type: 'link',
        tabId: null,
        url: data.url,
        favicon: data.favicon,
      })
      addCard(newCard)
      setShowLinkEditor(false)
    } catch (error) {
      console.error('Failed to create link card:', error)
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
   * 更新卡片
   */
  const handleUpdateCard = async (id: string, data: { title: string; content: string }) => {
    try {
      await window.electronAPI.card.update(id, data)
      updateCard(id, data)
    } catch (error) {
      console.error('Failed to update card:', error)
    }
  }

  /**
   * 删除卡片（软删除）
   */
  const handleDeleteCard = async (id: string) => {
    try {
      await window.electronAPI.card.delete(id)
      deleteCard(id)
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
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
   * 根据视图模式分组卡片
   */
  const getGroupedCards = () => {
    if (viewMode === 'auto') {
      const masonryCards = cards.filter((c) => getCardLayout(c.type) === 'masonry')
      const gridCards = cards.filter((c) => getCardLayout(c.type) === 'grid')
      return { masonryCards, gridCards }
    }
    return { masonryCards: cards, gridCards: [] }
  }

  const { masonryCards, gridCards } = getGroupedCards()

  const currentTitle = showRecycleBin ? '回收站' : getNavTitle(activeNavId)

  return (
    <div className="card-grid-container">
      <div className="card-grid-toolbar">
        <div className="toolbar-left">
          <h2 className="toolbar-title">{currentTitle}</h2>
          <span className="card-count">{cards.length} 张卡片</span>
        </div>
        <div className="toolbar-right">
          <button
            className="toolbar-button"
            onClick={loadCards}
            title="刷新"
          >
            <RefreshCw size={16} />
          </button>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'masonry' ? 'active' : ''}`}
              onClick={() => setViewMode('masonry')}
              title="瀑布流视图"
            >
              <Columns size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'auto' ? 'active' : ''}`}
              onClick={() => setViewMode('auto')}
              title="自动混合布局"
            >
              ⚡
            </button>
          </div>
          {!showRecycleBin && (
            <button
              className="add-card-button"
              onClick={handleAddCard}
            >
              <Plus size={16} />
              <span>添加{getCurrentCardType() === 'note' ? '便签' : getCurrentCardType() === 'doc' ? '笔记' : getCurrentCardType() === 'link' ? '链接' : getCurrentCardType() === 'image' ? '图文' : '卡片'}</span>
            </button>
          )}
        </div>
      </div>

      <div className={`card-grid-content ${viewMode}`}>
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>加载中...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {showRecycleBin ? '🗑️' : '📝'}
            </div>
            <h3>{showRecycleBin ? '回收站为空' : '暂无卡片'}</h3>
            <p>
              {showRecycleBin
                ? '删除的卡片将在这里显示'
                : '点击上方"添加卡片"按钮创建第一张卡片'}
            </p>
            {!showRecycleBin && (
              <button className="empty-add-button" onClick={handleAddCard}>
                <Plus size={16} />
                <span>添加卡片</span>
              </button>
            )}
          </div>
        ) : viewMode === 'auto' ? (
          <div className="mixed-layout">
            {masonryCards.length > 0 && (
              <div className="masonry-section">
                <div className="section-label">便签 & 图文</div>
                <div className="masonry-grid">
                  <AnimatePresence mode="popLayout">
                    {masonryCards.map((card) => (
                      <Card
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        content={card.content}
                        type={card.type}
                        status={card.status}
                        url={card.url}
                        imagePath={card.imagePath}
                        favicon={card.favicon}
                        createdAt={card.createdAt}
                        updatedAt={card.updatedAt}
                        onEdit={handleUpdateCard}
                        onDelete={handleDeleteCard}
                        onRestore={handleRestoreCard}
                        onClick={() => console.log('Card clicked:', card.id)}
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
                    {gridCards.map((card) => (
                      <Card
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        content={card.content}
                        type={card.type}
                        status={card.status}
                        url={card.url}
                        imagePath={card.imagePath}
                        favicon={card.favicon}
                        createdAt={card.createdAt}
                        updatedAt={card.updatedAt}
                        onEdit={handleUpdateCard}
                        onDelete={handleDeleteCard}
                        onRestore={handleRestoreCard}
                        onClick={() => console.log('Card clicked:', card.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={viewMode === 'masonry' ? 'masonry-grid' : 'uniform-grid'}>
            <AnimatePresence mode="popLayout">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  content={card.content}
                  type={card.type}
                  status={card.status}
                  url={card.url}
                  imagePath={card.imagePath}
                  favicon={card.favicon}
                  createdAt={card.createdAt}
                  updatedAt={card.updatedAt}
                  onEdit={handleUpdateCard}
                  onDelete={handleDeleteCard}
                  onRestore={handleRestoreCard}
                  onClick={() => console.log('Card clicked:', card.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLinkEditor && (
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
              <LinkCardEditor
                onSave={handleCreateLinkCard}
                onCancel={() => setShowLinkEditor(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      </AnimatePresence>
    </div>
  )
}

export default CardGrid
