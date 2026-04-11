import { useState, useRef } from 'react'
import { Image, Upload, X, Loader2 } from 'lucide-react'
import './ImageCardEditor.css'

type ImageCardEditorProps = {
  initialImagePath?: string
  initialCaption?: string
  onSave: (data: { imagePath: string; caption: string }) => void
  onCancel: () => void
}

/**
 * 图文卡片编辑器组件
 * @description 用于创建和编辑图文类型的卡片
 */
function ImageCardEditor({
  initialImagePath = '',
  initialCaption = '',
  onSave,
  onCancel,
}: ImageCardEditorProps) {
  const [imagePath, setImagePath] = useState(initialImagePath)
  const [caption, setCaption] = useState(initialCaption)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await window.electronAPI.attachment.saveImage(file)
      setImagePath(result.path)
    } catch (err) {
      setError('保存图片失败')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  /**
   * 处理拖拽放置
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * 处理文件输入变化
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * 移除图片
   */
  const handleRemoveImage = () => {
    setImagePath('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * 处理保存
   */
  const handleSave = () => {
    if (!imagePath) {
      setError('请选择图片')
      return
    }

    onSave({ imagePath, caption })
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="image-card-editor" onKeyDown={handleKeyDown}>
      <div className="image-editor-header">
        <Image size={20} className="image-icon" />
        <h3>添加图文</h3>
      </div>

      <div className="image-editor-content">
        <div className="image-upload-area">
          {imagePath ? (
            <div className="image-preview-container">
              <img src={`file://${imagePath}`} alt="预览" className="image-preview" />
              <button className="remove-image-btn" onClick={handleRemoveImage}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {isLoading ? (
                <div className="loading-state">
                  <Loader2 size={24} className="loading-spinner" />
                  <span>上传中...</span>
                </div>
              ) : (
                <>
                  <Upload size={32} className="upload-icon" />
                  <p>拖拽图片到这里或点击上传</p>
                  <span className="upload-hint">支持 JPG、PNG、GIF，最大 10MB</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {error && <span className="error-message">{error}</span>}

        <div className="caption-field">
          <label>说明文字</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="添加图片说明（可选）"
            rows={3}
          />
        </div>
      </div>

      <div className="image-editor-actions">
        <button className="cancel-btn" onClick={onCancel}>
          取消
        </button>
        <button className="save-btn" onClick={handleSave} disabled={!imagePath || isLoading}>
          保存
        </button>
      </div>
    </div>
  )
}

export default ImageCardEditor
