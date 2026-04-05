import { create } from 'zustand'

type CardType = 'note' | 'doc' | 'link' | 'image'

interface EditModalStore {
  isOpen: boolean
  cardId: string | null
  cardType: CardType | null
  isNew: boolean
  openEditModal: (cardId: string | null, cardType: CardType) => void
  closeEditModal: () => void
}

/**
 * 编辑弹窗状态管理 Store
 * @description 控制全局编辑弹窗的显示/隐藏和当前编辑的卡片信息
 */
export const useEditModalStore = create<EditModalStore>((set) => ({
  isOpen: false,
  cardId: null,
  cardType: null,
  isNew: false,
  openEditModal: (cardId: string | null, cardType: CardType) => set({ 
    isOpen: true, cardId, cardType, isNew: cardId === null }),
  closeEditModal: () => set({ 
    isOpen: false, cardId: null, cardType: null, isNew: false }),
}))
