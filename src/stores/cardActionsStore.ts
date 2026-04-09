import { create } from 'zustand'

interface CardActionsStore {
  showRecycleBin: boolean
  setShowRecycleBin: (showRecycleBin: boolean) => void
}

/**
 * 卡片操作共享状态管理 Store
 */
export const useCardActionsStore = create<CardActionsStore>((set) => ({
  showRecycleBin: false,
  setShowRecycleBin: (showRecycleBin) => set({ showRecycleBin }),
}))
