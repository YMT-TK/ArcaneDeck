import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露给渲染进程的 API
 */
const electronAPI = {
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },
  dialog: {
    openFile: (options: any) => ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options: any) => ipcRenderer.invoke('dialog:saveFile', options),
    showMessage: (options: any) => ipcRenderer.invoke('dialog:showMessage', options),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  database: {
    backup: () => ipcRenderer.invoke('database:backup'),
    restore: (filePath: string) => ipcRenderer.invoke('database:restore', filePath),
    checkIntegrity: () => ipcRenderer.invoke('database:checkIntegrity'),
    getStats: () => ipcRenderer.invoke('database:getStats'),
    getPath: () => ipcRenderer.invoke('database:getPath'),
    setPath: (customPath: string) => ipcRenderer.invoke('database:setPath', customPath),
    isPathSetup: () => ipcRenderer.invoke('database:isPathSetup'),
    init: (customPath?: string) => ipcRenderer.invoke('database:init', customPath),
  },
  card: {
    create: (data: unknown) => ipcRenderer.invoke('card:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('card:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('card:delete', id),
    restore: (id: string) => ipcRenderer.invoke('card:restore', id),
    getAll: (tabId?: string) => ipcRenderer.invoke('card:getAll', tabId),
    getByType: (type: string) => ipcRenderer.invoke('card:getByType', type),
    getById: (id: string) => ipcRenderer.invoke('card:getById', id),
    search: (query: string) => ipcRenderer.invoke('card:search', query),
    reorder: (ids: string[]) => ipcRenderer.invoke('card:reorder', ids),
    togglePin: (id: string) => ipcRenderer.invoke('card:togglePin', id),
  },
  tab: {
    create: (name: string) => ipcRenderer.invoke('tab:create', name),
    update: (id: string, name: string) => ipcRenderer.invoke('tab:update', id, name),
    delete: (id: string) => ipcRenderer.invoke('tab:delete', id),
    getAll: () => ipcRenderer.invoke('tab:getAll'),
    reorder: (ids: string[]) => ipcRenderer.invoke('tab:reorder', ids),
  },
  backup: {
    list: () => ipcRenderer.invoke('backup:list'),
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore'),
    delete: (backupPath: string) => ipcRenderer.invoke('backup:delete', backupPath),
  },
  attachment: {
    saveImage: (file: { path: string; name: string; type: string }) =>
      ipcRenderer.invoke('attachment:saveImage', file),
    saveBase64: (base64Data: string) => ipcRenderer.invoke('attachment:saveBase64', base64Data),
    fetchFavicon: (url: string) => ipcRenderer.invoke('attachment:fetchFavicon', url),
    delete: (filePath: string) => ipcRenderer.invoke('attachment:delete', filePath),
  },
  file: {
    upload: (filePath: string) => ipcRenderer.invoke('file:upload', filePath),
    delete: (filePath: string) => ipcRenderer.invoke('file:delete', filePath),
    move: (oldPath: string, newPath: string) => ipcRenderer.invoke('file:move', oldPath, newPath),
  },
}

/**
 * 使用 contextBridge 暴露 API 到渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
