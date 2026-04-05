import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useEditModalStore } from '../../stores'
import './EditModal.css'

/**
 * 全局编辑弹窗组件
 * @description 提供全局遮盖层和编辑区域外框，点击卡片时显示
 */
const EditModal = () => {
  const { isOpen, cardId, cardType, closeEditModal } = useEditModalStore()

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
   * 点击遮盖层关闭弹窗
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeEditModal()
    }
  }

  if (!isOpen) return null

  return (
    <div className="edit-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-modal-container">
        <div className="edit-modal-content">
          <div className="mb-8">
            <h2 className="text-3xl italic text-[rgb(67,0,0)] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Edit Card
            </h2>
            <p className="text-sm italic text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
              Card ID: {cardId} | Type: {cardType}
            </p>
          </div>
          
          <div className="space-y-8">
            <p className="text-gray-500 italic">
              Edit form will be placed here...
            </p>
          </div>
        </div>

        <div className="edit-modal-sidebar">
          <div className="text-center">
            <h3 className="text-xl italic text-[rgb(67,0,0)] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Preview
            </h3>
            <p className="text-xs text-gray-500 italic mt-6 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              "Preview section will be implemented here..."
            </p>
          </div>
          
          <div className="w-full space-y-4">
            <button
              className="w-full bg-[rgb(67,0,0)] text-white py-3 rounded-full italic text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Save
            </button>
            <button
              className="w-full text-[rgb(67,0,0)]/60 hover:text-red-600 transition-colors py-2 text-sm flex items-center justify-center gap-2 active:scale-95"
              onClick={closeEditModal}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>

        <button
          className="edit-modal-close"
          onClick={closeEditModal}
          title="Close"
        >
          <X size={32} />
        </button>
      </div>
    </div>
  )
}

export default EditModal
