import { Electron } from 'electron'

/**
 * Electron API 类型定义
 */
export interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>
    getPath: (name: string) => Promise<string>
  }
  dialog: {
    openFile: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>
    saveFile: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>
    showMessage: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>
  }
  store: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
    delete: (key: string) => Promise<void>
  }
  database: {
    backup: () => Promise<string>
    restore: (filePath: string) => Promise<void>
    checkIntegrity: () => Promise<boolean>
  }
  card: {
    create: (data: CardCreateInput) => Promise<Card>
    update: (id: string, data: CardUpdateInput) => Promise<Card>
    delete: (id: string) => Promise<void>
    restore: (id: string) => Promise<Card>
    getAll: (tabId?: string) => Promise<Card[]>
    search: (query: string) => Promise<Card[]>
  }
  tab: {
    create: (name: string) => Promise<Tab>
    update: (id: string, name: string) => Promise<Tab>
    delete: (id: string) => Promise<void>
    getAll: () => Promise<Tab[]>
    reorder: (ids: string[]) => Promise<void>
  }
  file: {
    upload: (filePath: string) => Promise<string>
    delete: (filePath: string) => Promise<void>
    move: (oldPath: string, newPath: string) => Promise<string>
  }
  attachment: {
    saveImage: (file: { path: string; name: string; type: string }) => Promise<{ path: string }>
    saveBase64: (base64Data: string) => Promise<{ path: string }>
    delete: (filePath: string) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

/**
 * 卡片类型枚举
 */
export type CardType = 'note' | 'doc' | 'link' | 'image'

/**
 * 卡片状态枚举
 */
export type CardStatus = 'active' | 'archived' | 'deleted'

/**
 * 卡片接口
 */
export interface Card {
  id: string
  title: string
  content: string
  type: CardType
  status: CardStatus
  tabId: string | null
  position: number
  styleConfig: string | null
  url?: string
  imagePath?: string
  favicon?: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

/**
 * 卡片样式接口
 */
export interface CardStyle {
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  borderRadius?: number
  customClass?: string
}

/**
 * 附件接口
 */
export interface Attachment {
  id: string
  filename: string
  path: string
  mimeType: string
  size: number
}

/**
 * 卡片创建输入接口
 */
export interface CardCreateInput {
  title: string
  content: string
  type: CardType
  tabId?: string | null
  url?: string
  imagePath?: string
  favicon?: string
}

/**
 * 卡片更新输入接口
 */
export interface CardUpdateInput {
  title?: string
  content?: string
  type?: CardType
  tabId?: string | null
  position?: number
  url?: string
  imagePath?: string
  favicon?: string
}

/**
 * 标签页接口
 */
export interface Tab {
  id: string
  name: string
  position: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  theme: 'scifi' | 'magic' | 'minimal'
  layout: 'grid' | 'masonry'
  fontSize: number
  textFontSize: number
  autoBackup: boolean
  backupPath: string
  language: string
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  cards: Card[]
  total: number
  query: string
}
