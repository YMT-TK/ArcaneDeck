import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  activeNavId: string
  showRecycleBin: boolean
  setActiveNavId: (id: string) => void
  setShowRecycleBin: (show: boolean) => void
  toggleRecycleBin: () => void
}

/**
 * 侧边栏状态管理 Store
 */
export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      activeNavId: 'all',
      showRecycleBin: false,
      setActiveNavId: (id) => set({ activeNavId: id, showRecycleBin: false }),
      setShowRecycleBin: (show) => set({ showRecycleBin: show }),
      toggleRecycleBin: () => set((state) => ({ showRecycleBin: !state.showRecycleBin, activeNavId: '' })),
    }),
    {
      name: 'arcanedeck-sidebar',
    }
  )
)
