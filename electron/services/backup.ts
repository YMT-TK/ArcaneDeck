import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import archiver from 'archiver'
import unzipper from 'unzipper'
import { getPrisma } from './database'

/**
 * 备份服务类
 * @description 处理数据库备份和恢复操作
 */
export class BackupService {
  private static getBackupDir(): string {
    const userDataPath = app.getPath('userData')
    const backupDir = path.join(userDataPath, 'backups')
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    return backupDir
  }

  /**
   * 创建备份
   */
  static async createBackup(customPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `arcanedeck_backup_${timestamp}.zip`
    const backupPath = customPath 
      ? path.join(customPath, backupFileName)
      : path.join(this.getBackupDir(), backupFileName)

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(backupPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => {
        resolve(backupPath)
      })

      archive.on('error', (err) => {
        reject(err)
      })

      archive.pipe(output)

      const dbPath = path.join(app.getPath('userData'), 'data', 'arcanedeck.db')
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'arcanedeck.db' })
      }

      const attachmentsDir = path.join(app.getPath('userData'), 'attachments')
      if (fs.existsSync(attachmentsDir)) {
        archive.directory(attachmentsDir, 'attachments')
      }

      const configPath = path.join(app.getPath('userData'), 'config.json')
      if (fs.existsSync(configPath)) {
        archive.file(configPath, { name: 'config.json' })
      }

      archive.finalize()
    })
  }

  /**
   * 恢复备份
   */
  static async restoreBackup(backupPath: string): Promise<void> {
    const userDataPath = app.getPath('userData')
    const tempDir = path.join(userDataPath, 'temp_restore')

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }
    fs.mkdirSync(tempDir, { recursive: true })

    return new Promise((resolve, reject) => {
      fs.createReadStream(backupPath)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', async () => {
          try {
            const prisma = await getPrisma()
            await prisma.$disconnect()

            const restoredDbPath = path.join(tempDir, 'arcanedeck.db')
            if (fs.existsSync(restoredDbPath)) {
              const currentDbPath = path.join(userDataPath, 'data', 'arcanedeck.db')
              if (fs.existsSync(currentDbPath)) {
                fs.renameSync(currentDbPath, `${currentDbPath}.bak`)
              }
              fs.copyFileSync(restoredDbPath, currentDbPath)
            }

            const restoredAttachmentsDir = path.join(tempDir, 'attachments')
            if (fs.existsSync(restoredAttachmentsDir)) {
              const attachmentsDir = path.join(userDataPath, 'attachments')
              if (fs.existsSync(attachmentsDir)) {
                fs.rmSync(attachmentsDir, { recursive: true })
              }
              fs.cpSync(restoredAttachmentsDir, attachmentsDir, { recursive: true })
            }

            fs.rmSync(tempDir, { recursive: true })

            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on('error', reject)
    })
  }

  /**
   * 获取备份列表
   */
  static async getBackupList(): Promise<{ name: string; path: string; size: number; createdAt: Date }[]> {
    const backupDir = this.getBackupDir()
    
    if (!fs.existsSync(backupDir)) {
      return []
    }

    const files = fs.readdirSync(backupDir)
    const backups: { name: string; path: string; size: number; createdAt: Date }[] = []

    for (const file of files) {
      if (file.endsWith('.zip')) {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
        })
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * 删除备份
   */
  static async deleteBackup(backupPath: string): Promise<void> {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
    }
  }

  /**
   * 清理旧备份（保留最近N个）
   */
  static async cleanupOldBackups(keepCount: number = 10): Promise<number> {
    const backups = await this.getBackupList()
    let deletedCount = 0

    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount)
      for (const backup of toDelete) {
        await this.deleteBackup(backup.path)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * 选择备份保存路径
   */
  static async selectBackupPath(): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title: '选择备份保存位置',
      defaultPath: `arcanedeck_backup_${Date.now()}.zip`,
      filters: [
        { name: 'ZIP压缩包', extensions: ['zip'] },
      ],
    })

    return result.filePath || null
  }

  /**
   * 选择要恢复的备份文件
   */
  static async selectRestoreFile(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: '选择备份文件',
      filters: [
        { name: 'ZIP压缩包', extensions: ['zip'] },
      ],
      properties: ['openFile'],
    })

    return result.filePaths[0] || null
  }
}
