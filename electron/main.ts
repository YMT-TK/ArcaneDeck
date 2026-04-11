import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  CardService,
  TabService,
  BackupService,
  DatabaseService,
  AttachmentService,
  setCustomDataPath,
  initDatabase,
} from './services'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'ArcaneDeck - 奥秘卡组',
    backgroundColor: '#0a0e27',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    show: false,
  })

  Menu.setApplicationMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow?.webContents.toggleDevTools()
    }
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    try {
      await initDatabase()
      console.log('[Main] Database initialized successfully')
    } catch (error) {
      console.error('[Main] Failed to initialize database:', error)
    }
    createWindow()
    registerIpcHandlers()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await DatabaseService.disconnect()
})

function registerIpcHandlers() {
  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('app:getPath', (_event, name: string) =>
    app.getPath(name as Parameters<typeof app.getPath>[0])
  )

  ipcMain.handle('dialog:openFile', async (_event, options) =>
    dialog.showOpenDialog(mainWindow!, options)
  )

  ipcMain.handle('dialog:saveFile', async (_event, options) =>
    dialog.showSaveDialog(mainWindow!, options)
  )

  ipcMain.handle('dialog:showMessage', async (_event, options) =>
    dialog.showMessageBox(mainWindow!, options)
  )

  ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择存储路径',
    })
    return result
  })

  ipcMain.handle('database:backup', async () => {
    try {
      const backupPath = await BackupService.createBackup()
      return { success: true, path: backupPath }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('database:restore', async (_event, filePath: string) => {
    try {
      await BackupService.restoreBackup(filePath)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('database:checkIntegrity', async () => {
    const result = await DatabaseService.checkIntegrity()
    return result
  })

  ipcMain.handle('database:getStats', async () => {
    return DatabaseService.getStats()
  })

  ipcMain.handle('database:getPath', async () => {
    return DatabaseService.getDatabasePath()
  })

  ipcMain.handle('database:setPath', async (_event, customPath: string) => {
    try {
      const success = setCustomDataPath(customPath)
      return { success }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('card:create', async (_event, data) => {
    try {
      return await CardService.create(data)
    } catch (error) {
      console.error('[CardService] Create failed:', error)
      throw error
    }
  })

  ipcMain.handle('card:update', async (_event, id: string, data) => {
    return CardService.update(id, data)
  })

  ipcMain.handle('card:delete', async (_event, id: string) => {
    return CardService.softDelete(id)
  })

  ipcMain.handle('card:restore', async (_event, id: string) => {
    return CardService.restore(id)
  })

  ipcMain.handle('card:getAll', async (_event, tabId?: string) => {
    return CardService.getAll(tabId)
  })

  ipcMain.handle('card:getByType', async (_event, type: string) => {
    return CardService.getByType(type as 'note' | 'doc' | 'link' | 'image')
  })

  ipcMain.handle('card:togglePin', async (_event, id: string) => {
    return CardService.togglePin(id)
  })

  ipcMain.handle('card:getById', async (_event, id: string) => {
    return CardService.getById(id)
  })

  ipcMain.handle('card:search', async (_event, query: string) => {
    return CardService.search(query)
  })

  ipcMain.handle('card:reorder', async (_event, ids: string[]) => {
    return CardService.reorder(ids)
  })

  ipcMain.handle('tab:create', async (_event, name: string) => {
    return TabService.create(name)
  })

  ipcMain.handle('tab:update', async (_event, id: string, name: string) => {
    return TabService.update(id, name)
  })

  ipcMain.handle('tab:delete', async (_event, id: string) => {
    return TabService.delete(id)
  })

  ipcMain.handle('tab:getAll', async () => {
    return TabService.getAll()
  })

  ipcMain.handle('tab:reorder', async (_event, ids: string[]) => {
    return TabService.reorder(ids)
  })

  ipcMain.handle('backup:list', async () => {
    return BackupService.getBackupList()
  })

  ipcMain.handle('backup:create', async () => {
    const backupPath = await BackupService.selectBackupPath()
    if (backupPath) {
      return BackupService.createBackup(path.dirname(backupPath))
    }
    return null
  })

  ipcMain.handle('backup:restore', async () => {
    const filePath = await BackupService.selectRestoreFile()
    if (filePath) {
      return BackupService.restoreBackup(filePath)
    }
    return null
  })

  ipcMain.handle('backup:delete', async (_event, backupPath: string) => {
    return BackupService.deleteBackup(backupPath)
  })

  ipcMain.handle(
    'attachment:saveImage',
    async (_event, file: { path: string; name: string; type: string }) => {
      return AttachmentService.saveImage(file)
    }
  )

  ipcMain.handle('attachment:saveBase64', async (_event, base64Data: string) => {
    return AttachmentService.saveBase64Image(base64Data)
  })

  ipcMain.handle('attachment:fetchFavicon', async (_event, url: string) => {
    return AttachmentService.fetchAndSaveFavicon(url)
  })

  ipcMain.handle('attachment:delete', async (_event, filePath: string) => {
    return AttachmentService.deleteAttachment(filePath)
  })
}
