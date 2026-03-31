import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

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
