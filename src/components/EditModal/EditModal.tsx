import { useEffect, useState } from 'react'
import { X, Gamepad2, Film, BookOpen, MoreHorizontal, Sparkles, Wand2, Eraser } from 'lucide-react'
import { useEditModalStore, useCardStore } from '../../stores'
import './EditModal.css'

/**
 * 网站类型选项
 */
const websiteTypes = [
  { id: 'entertainment', icon: Gamepad2, label: '娱乐' },
  { id: 'film', icon: Film, label: '影视' },
  { id: 'study', icon: BookOpen, label: '学习' },
  { id: 'other', icon: MoreHorizontal, label: '其它' },
]

/**
 * 全局编辑弹窗组件
 * @description 提供全局遮盖层和编辑区域外框，点击卡片时显示
 */
const EditModal = () => {
  const { isOpen, cardId, cardType, isNew, closeEditModal } = useEditModalStore()
  const { cards, updateCard, addCard } = useCardStore()
  
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [favicon, setFavicon] = useState('')
  const [faviconPath, setFaviconPath] = useState('')
  const [selectedType, setSelectedType] = useState('entertainment')
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false)

  /**
   * 获取当前编辑的卡片
   */
  const currentCard = cards.find(card => card.id === cardId)

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (isNew) {
      handleReset()
    } else if (currentCard) {
      setTitle(currentCard.title || '')
      setUrl(currentCard.url || '')
      setFavicon(currentCard.favicon || '')
      setFaviconPath(currentCard.favicon || '')
    }
  }, [currentCard, isNew])

  /**
   * 按下ESC键关闭弹窗
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeEditModal])

  /**
   * 自动查询网站favicon
   */
  const fetchFavicon = async () => {
    if (!url) return
    
    setIsFetchingFavicon(true)
    try {
      const result = await window.electronAPI.attachment.fetchFavicon(url)
      setFaviconPath(result.path)
      setFavicon(result.path)
    } catch (error) {
      console.error('Failed to fetch favicon:', error)
    } finally {
      setIsFetchingFavicon(false)
    }
  }

  /**
   * 点击图标区域获取favicon
   */
  const handleIconClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      await fetchFavicon()
    }
  }

  /**
   * 点击遮盖层关闭弹窗
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeEditModal()
    }
  }

  /**
   * 保存链接卡片
   */
  const handleSave = async () => {
    if (isNew) {
      try {
        const newCard = await window.electronAPI.card.create({
          title: title || (url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : '未命名链接'),
          content: url,
          type: 'link',
          tabId: null,
          url: url,
          favicon: faviconPath,
        })
        addCard(newCard)
        closeEditModal()
      } catch (error) {
        console.error('Failed to create link card:', error)
      }
    } else {
      if (!cardId) return
      await updateCard(cardId, {
        title,
        url,
        favicon: faviconPath,
      })
      closeEditModal()
    }
  }

  /**
   * 重置表单
   */
  const handleReset = () => {
    setTitle('')
    setUrl('')
    setFavicon('')
    setFaviconPath('')
    setSelectedType('entertainment')
  }

  if (!isOpen) return null

  /**
   * 渲染链接卡片编辑表单
   */
  const renderLinkForm = () => (
    <>
      <div className="flex-1 p-8 md:p-12 border-r border-primary/5" style={{ borderColor: 'rgba(67, 0, 0, 0.05)' }}>
        <div className="mb-8">
          <h2 className="font-headline text-3xl italic mb-2" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
            {isNew ? '创建链接' : '编辑链接'}
          </h2>
          <p className="text-sm italic" style={{ fontFamily: 'Georgia, serif', color: '#544241' }}>
            将数字世界的精髓融入卡片之中.
          </p>
        </div>
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-2">
            <label className="text-lg italic flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
              <span>📜</span>
              网站名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Whisper of Forgotten Oak"
              className="w-full bg-transparent border-b focus:ring-0 outline-none py-2 font-body placeholder:text-outline/40 transition-colors"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#430000',
                borderColor: 'rgba(135, 114, 113, 0.3)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg italic flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
              <span>🔗</span>
              网站网址
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ancient-manuscripts.io/scroll-01"
              className="w-full bg-transparent border-b focus:ring-0 outline-none py-2 font-body placeholder:text-outline/40 transition-colors"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#430000',
                borderColor: 'rgba(135, 114, 113, 0.3)',
              }}
            />
          </div>

          <div className="space-y-4">
            <label className="text-lg italic" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
              网站类型
            </label>
            <div className="flex flex-wrap gap-4">
              {websiteTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-2 bg-secondary/5'
                        : 'border border-primary/10 hover:bg-secondary/10 hover:border-secondary'
                    }`}
                    style={{
                      color: isSelected ? '#a04100' : '#430000',
                      borderColor: isSelected ? '#a04100' : 'rgba(67, 0, 0, 0.1)',
                    }}
                  >
                    <Icon size={24} fill={isSelected ? 'currentColor' : 'none'} />
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </div>

      <div className="w-full md:w-80 p-8 flex flex-col items-center justify-between gap-8" style={{ backgroundColor: '#fcecd2' }}>
        <div className="text-center">
          <h3 className="text-xl italic mb-4" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
            网站图标
          </h3>
          <div className="relative w-48 h-48 mx-auto">
            <div
              className="absolute inset-0 border-4 animate-pulse"
              style={{ borderColor: 'rgba(67, 0, 0, 0.2)' }}
            ></div>
            <div
              className="absolute inset-2 border"
              style={{ borderColor: 'rgba(160, 65, 0, 0.3)' }}
            ></div>
            <div
              className="absolute inset-4 overflow-hidden shadow-inner flex items-center justify-center group cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2c1714 0%, #430000 70%, #221b0b 100%)',
              }}
              onClick={handleIconClick}
            >
              {isFetchingFavicon ? (
                <div className="animate-spin" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  <Wand2 size={32} />
                </div>
              ) : favicon ? (
                <img
                  src={favicon}
                  alt=""
                  className="w-full h-full object-contain opacity-80 group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <Wand2 size={32} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(67, 0, 0, 0.8), transparent)' }}
              ></div>
              <div className="absolute bottom-6 left-0 right-0 px-4 text-center pointer-events-none">
                <p
                  className="text-[10px] italic tracking-widest uppercase"
                  style={{ fontFamily: 'Georgia, serif', color: '#ffffff' }}
                >
                  {selectedType === 'entertainment' ? 'Entertainment' : selectedType === 'film' ? 'Film' : selectedType === 'study' ? 'Study' : 'Other'}
                </p>
                <p
                  className="text-[8px] truncate"
                  style={{ fontFamily: 'Georgia, serif', color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {url ? (() => {
                    try {
                      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
                    } catch {
                      return 'example.com'
                    }
                  })() : 'example.com'}
                </p>
              </div>
            </div>
          </div>
          <p
            className="mt-6 text-xs italic leading-relaxed"
            style={{ fontFamily: 'Georgia, serif', color: '#544241' }}
          >
            "The pool reflects the essence of the destination. If the link is true, the waters remain calm."
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full relative group"
          >
            <div
              className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: '#430000' }}
            ></div>
            <div
              className="relative py-3 rounded-full font-headline italic text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform overflow-hidden"
              style={{ fontFamily: 'Georgia, serif', backgroundColor: '#430000', color: '#ffffff' }}
            >
              <Sparkles size={24} fill="currentColor" />
              {isNew ? '创建链接' : '保存链接'}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full hover:text-error transition-colors font-headline italic py-2 text-sm flex items-center justify-center gap-2 active:scale-95"
            style={{ fontFamily: 'Georgia, serif', color: 'rgba(67, 0, 0, 0.6)' }}
          >
            <Eraser size={16} />
            重置
          </button>
        </div>
      </div>
    </>
  )

  /**
   * 根据卡片类型渲染不同的内容
   */
  const renderContent = () => {
    switch (cardType) {
      case 'link':
        return renderLinkForm()
      case 'note':
      case 'doc':
      case 'image':
      default:
        return (
          <div className="flex-1 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl italic mb-2" style={{ fontFamily: 'Georgia, serif', color: '#430000' }}>
                Edit Card
              </h2>
              <p className="text-sm italic" style={{ fontFamily: 'Georgia, serif', color: '#544241' }}>
                Card ID: {cardId} | Type: {cardType}
              </p>
            </div>
            <div className="space-y-8">
              <p className="italic" style={{ fontFamily: 'Georgia, serif', color: '#877271' }}>
                Edit form will be placed here...
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-modal-container">
        {renderContent()}

        <button
          className="absolute top-4 right-4 transition-colors"
          onClick={closeEditModal}
          title="Close"
          style={{ color: 'rgba(67, 0, 0, 0.3)' }}
        >
          <X size={32} />
        </button>
      </div>
    </div>
  )
}

export default EditModal
