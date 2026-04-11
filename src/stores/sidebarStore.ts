import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  activeNavId: string
  showRecycleBin: boolean
  collapsed: boolean
  setActiveNavId: (id: string) => void
  setShowRecycleBin: (show: boolean) => void
  toggleRecycleBin: () => void
  toggleCollapse: () => void
}

/**
 * 侧边栏状态管理 Store
 */
export const useSidebarStore = create<SidebarStore>()(
  persist(
    set => ({
      activeNavId: 'all',
      showRecycleBin: false,
      collapsed: false,
      setActiveNavId: id => set({ activeNavId: id, showRecycleBin: false }),
      setShowRecycleBin: show => set({ showRecycleBin: show }),
      toggleRecycleBin: () =>
        set(state => ({ showRecycleBin: !state.showRecycleBin, activeNavId: '' })),
      toggleCollapse: () => set(state => ({ collapsed: !state.collapsed })),
    }),
    {
      name: 'arcanedeck-sidebar',
    }
  )
)
