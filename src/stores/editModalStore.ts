import { create } from 'zustand'

type CardType = 'note' | 'doc' | 'link' | 'image'

interface EditModalStore {
  isOpen: boolean
  cardId: string | null
  cardType: CardType | null
  openEditModal: (cardId: string, cardType: CardType) => void
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
  openEditModal: (cardId: string, cardType: CardType) => set({ 
    isOpen: true, cardId, cardType }),
  closeEditModal: () => set({ 
    isOpen: false, cardId: null, cardType: null }),
}))
