import { useState } from 'react'
import { Link, Loader2 } from 'lucide-react'
import './LinkCardEditor.css'

type LinkCardEditorProps = {
  initialUrl?: string
  initialTitle?: string
  onSave: (data: { url: string; title: string; favicon?: string }) => void
  onCancel: () => void
}

/**
 * 链接卡片编辑器组件
 * @description 用于创建和编辑链接类型的卡片
 */
function LinkCardEditor({
  initialUrl = '',
  initialTitle = '',
  onSave,
  onCancel,
}: LinkCardEditorProps) {
  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState(initialTitle)
  const [favicon, setFavicon] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 验证URL格式
   */
  const isValidUrl = (string: string): boolean => {
    try {
      const urlObj = new URL(string)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * 从URL获取网站信息
   */
  const fetchUrlInfo = async (urlString: string) => {
    if (!isValidUrl(urlString)) {
      setError('请输入有效的网址')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const urlObj = new URL(urlString)
      const domain = urlObj.hostname

      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      setFavicon(faviconUrl)

      if (!title) {
        setTitle(domain.replace('www.', ''))
      }
    } catch (err) {
      setError('无法获取网站信息')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理URL输入变化
   */
  const handleUrlChange = (value: string) => {
    setUrl(value)
    setError('')
  }

  /**
   * 处理URL失焦事件
   */
  const handleUrlBlur = () => {
    if (url && isValidUrl(url)) {
      fetchUrlInfo(url)
    }
  }

  /**
   * 处理保存
   */
  const handleSave = () => {
    if (!url) {
      setError('请输入网址')
      return
    }

    if (!isValidUrl(url)) {
      setError('请输入有效的网址')
      return
    }

    onSave({ url, title, favicon })
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="link-card-editor" onKeyDown={handleKeyDown}>
      <div className="link-editor-header">
        <Link size={20} className="link-icon" />
        <h3>添加链接</h3>
      </div>

      <div className="link-editor-content">
        <div className="link-field">
          <label>网址 *</label>
          <div className="url-input-wrapper">
            <input
              type="url"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com"
              className={error ? 'error' : ''}
            />
            {isLoading && <Loader2 size={16} className="loading-spinner" />}
          </div>
          {error && <span className="error-message">{error}</span>}
        </div>

        <div className="link-field">
          <label>标题</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="网站标题（可选）"
          />
        </div>

        {favicon && (
          <div className="link-preview">
            <img src={favicon} alt="" className="preview-favicon" />
            <span className="preview-title">{title || new URL(url).hostname}</span>
          </div>
        )}
      </div>

      <div className="link-editor-actions">
        <button className="cancel-btn" onClick={onCancel}>
          取消
        </button>
        <button className="save-btn" onClick={handleSave} disabled={!url || isLoading}>
          保存
        </button>
      </div>
    </div>
  )
}

export default LinkCardEditor
