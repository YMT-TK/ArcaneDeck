import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DataPathStore {
  dataPath: string | null
  isSetupComplete: boolean
  setDataPath: (path: string) => void
  setSetupComplete: (complete: boolean) => void
  resetDataPath: () => void
}

const defaultDataPath: string | null = null

/**
 * 数据存储路径状态管理 Store
 */
export const useDataPathStore = create<DataPathStore>()(
  persist(
    set => ({
      dataPath: defaultDataPath,
      isSetupComplete: false,

      setDataPath: path => set({ dataPath: path }),
      setSetupComplete: complete => set({ isSetupComplete: complete }),
      resetDataPath: () => set({ dataPath: defaultDataPath, isSetupComplete: false }),
    }),
    {
      name: 'arcanedeck-data-path',
    }
  )
)
