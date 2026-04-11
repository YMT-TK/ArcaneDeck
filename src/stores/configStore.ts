import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppConfig } from '../types'

interface ConfigStore extends AppConfig {
  setTheme: (theme: AppConfig['theme']) => void
  setLayout: (layout: AppConfig['layout']) => void
  setFontSize: (size: number) => void
  setTextFontSize: (size: number) => void
  setAutoBackup: (enabled: boolean) => void
  setBackupPath: (path: string) => void
  setLanguage: (lang: string) => void
  resetConfig: () => void
}

const defaultConfig: AppConfig = {
  theme: 'scifi',
  layout: 'grid',
  fontSize: 16,
  textFontSize: 14,
  autoBackup: true,
  backupPath: '',
  language: 'zh-CN',
}

/**
 * 应用配置状态管理 Store
 */
export const useConfigStore = create<ConfigStore>()(
  persist(
    set => ({
      ...defaultConfig,

      setTheme: theme => set({ theme }),
      setLayout: layout => set({ layout }),
      setFontSize: fontSize => set({ fontSize }),
      setTextFontSize: textFontSize => set({ textFontSize }),
      setAutoBackup: autoBackup => set({ autoBackup }),
      setBackupPath: backupPath => set({ backupPath }),
      setLanguage: language => set({ language }),
      resetConfig: () => set(defaultConfig),
    }),
    {
      name: 'arcanedeck-config',
    }
  )
)
