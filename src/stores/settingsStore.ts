import { create } from 'zustand'

interface SettingsStore {
  isOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  toggleSettings: () => void
}

/**
 * 设置弹窗状态管理 Store
 */
export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  openSettings: () => set({ isOpen: true }),
  closeSettings: () => set({ isOpen: false }),
  toggleSettings: () => set((state) => ({ isOpen: !state.isOpen })),
}))
