import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import * as https from 'https'
import * as http from 'http'

/**
 * 附件服务
 * @description 处理图片等附件的保存和管理
 */
export class AttachmentService {
  private static attachmentsDir = path.join(app.getPath('userData'), 'attachments')

  /**
   * 初始化附件目录
   */
  static init(): void {
    if (!fs.existsSync(this.attachmentsDir)) {
      fs.mkdirSync(this.attachmentsDir, { recursive: true })
    }
  }

  /**
   * 保存图片文件
   * @param file 图片文件对象（来自渲染进程）
   * @returns 保存后的相对路径
   */
  static async saveImage(file: { path: string; name: string; type: string }): Promise<{ path: string }> {
    this.init()

    const ext = path.extname(file.name) || '.jpg'
    const fileName = `${uuidv4()}${ext}`
    const destPath = path.join(this.attachmentsDir, fileName)

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.path)
      const writeStream = fs.createWriteStream(destPath)

      readStream.on('error', reject)
      writeStream.on('error', reject)
      writeStream.on('finish', () => {
        resolve({ path: destPath })
      })

      readStream.pipe(writeStream)
    })
  }

  /**
   * 保存Base64图片
   * @param base64Data Base64编码的图片数据
   * @returns 保存后的路径
   */
  static async saveBase64Image(base64Data: string): Promise<{ path: string }> {
    this.init()

    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image data')
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
    const fileName = `${uuidv4()}.${ext}`
    const destPath = path.join(this.attachmentsDir, fileName)
    const buffer = Buffer.from(matches[2], 'base64')

    await fs.promises.writeFile(destPath, buffer)
    return { path: destPath }
  }

  /**
   * 下载图片并保存
   */
  static async downloadAndSaveImage(url: string): Promise<{ path: string }> {
    this.init()

    const buffer = await this.downloadImage(url)
    const ext = this.getImageExtension(url) || 'png'
    const fileName = `${uuidv4()}.${ext}`
    const destPath = path.join(this.attachmentsDir, fileName)

    await fs.promises.writeFile(destPath, buffer)
    return { path: destPath }
  }

  /**
   * 下载图片
   */
  private static async downloadImage(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http
      client.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
          if (response.headers.location) {
            this.downloadImage(response.headers.location).then(resolve).catch(reject)
            return
          }
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`))
          return
        }

        const chunks: Buffer[] = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
        response.on('error', reject)
      }).on('error', reject)
    })
  }

  /**
   * 获取图片扩展名
   */
  private static getImageExtension(url: string): string | null {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    if (pathname.endsWith('.png')) return 'png'
    if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'jpg'
    if (pathname.endsWith('.gif')) return 'gif'
    if (pathname.endsWith('.svg')) return 'svg'
    if (pathname.endsWith('.ico')) return 'ico'
    return null
  }

  /**
   * 获取网站favicon
   */
  static async fetchAndSaveFavicon(url: string): Promise<{ path: string }> {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname

    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      `https://${hostname}/favicon.ico`,
      `https://${hostname}/favicon.png`,
      `https://${hostname}/apple-touch-icon.png`,
    ]

    for (const faviconUrl of faviconUrls) {
      try {
        return await this.downloadAndSaveImage(faviconUrl)
      } catch (error) {
        console.log(`Failed to fetch favicon from ${faviconUrl}:`, error)
        continue
      }
    }

    throw new Error('Failed to fetch favicon from all sources')
  }

  /**
   * 删除附件
   * @param filePath 文件路径
   */
  static async deleteAttachment(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error)
    }
  }

  /**
   * 获取附件目录路径
   */
  static getAttachmentsDir(): string {
    return this.attachmentsDir
  }
}
