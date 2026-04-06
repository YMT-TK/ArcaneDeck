import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, BookOpen, Minus, FolderOpen, Palette, Info, Download, Type } from 'lucide-react'
import { useSettingsStore, useConfigStore } from '../../stores'
import { useTheme } from '../../contexts/ThemeContext'
import './Settings.css'

/**
 * 主题选项接口
 */
interface ThemeOption {
  id: 'scifi' | 'magic' | 'minimal'
  label: string
  description: string
  icon: React.ComponentType<any>
  previewBg: string
  previewText?: string
}

/**
 * 系统设置弹窗组件
 * @description 提供主题切换、文本字体大小、存储路径等配置功能
 */
function Settings() {
  const { isOpen, closeSettings } = useSettingsStore()
  const { 
    textFontSize: savedTextFontSize, 
    setTextFontSize: saveTextFontSize, 
    backupPath: savedBackupPath, 
    setBackupPath: saveBackupPath
  } = useConfigStore()
  const { theme: currentTheme, setTheme: applyTheme } = useTheme()

  const [previewTheme, setPreviewTheme] = useState<'scifi' | 'magic' | 'minimal'>(currentTheme)
  const [previewTextFontSize, setPreviewTextFontSize] = useState(savedTextFontSize)
  const [previewBackupPath, setPreviewBackupPath] = useState(savedBackupPath)
  const [hasChanges, setHasChanges] = useState(false)
  const [appVersion, setAppVersion] = useState('v1.0.0')

  /**
   * 获取应用版本号
   */
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await window.electronAPI.app.getVersion()
        setAppVersion(`v${version}`)
      } catch (error) {
        console.error('Failed to get app version:', error)
      }
    }

    fetchVersion()
  }, [])

  const themes: ThemeOption[] = [
    {
      id: 'scifi',
      label: '科幻',
      description: '数字、精准、未来感',
      icon: Sparkles,
      previewBg: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
      previewText: 'HUD_OVERLAY_V2',
    },
    {
      id: 'magic',
      label: '魔法',
      description: '古老、神秘、仪式感',
      icon: BookOpen,
      previewBg: 'linear-gradient(135deg, #f5e6d3 0%, #fff8e7 100%)',
    },
    {
      id: 'minimal',
      label: '精简',
      description: '简洁、现代、高效',
      icon: Minus,
      previewBg: '#fafafa',
    },
  ]

  /**
   * 检测是否有未保存的更改
   */
  useEffect(() => {
    const changed = 
      previewTheme !== currentTheme ||
      previewTextFontSize !== savedTextFontSize ||
      previewBackupPath !== savedBackupPath
    setHasChanges(changed)
  }, [previewTheme, previewTextFontSize, previewBackupPath, currentTheme, savedTextFontSize, savedBackupPath])

  /**
   * 打开设置时重置预览状态
   */
  useEffect(() => {
    if (isOpen) {
      setPreviewTheme(currentTheme)
      setPreviewTextFontSize(savedTextFontSize)
      setPreviewBackupPath(savedBackupPath)
    }
  }, [isOpen, currentTheme, savedTextFontSize, savedBackupPath])

  /**
   * 应用文本字体大小到 CSS 变量（仅用于卡片文本）
   */
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-text', `${previewTextFontSize}px`)
  }, [previewTextFontSize])

  /**
   * ESC 键关闭弹窗
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      handleClose()
    }
  }, [isOpen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  /**
   * 关闭弹窗（放弃未保存的更改）
   */
  const handleClose = () => {
    setPreviewTheme(currentTheme)
    setPreviewTextFontSize(savedTextFontSize)
    setPreviewBackupPath(savedBackupPath)
    document.documentElement.style.setProperty('--font-size-text', `${savedTextFontSize}px`)
    closeSettings()
  }

  /**
   * 保存所有设置
   */
  const handleSave = () => {
    applyTheme(previewTheme)
    saveTextFontSize(previewTextFontSize)
    saveBackupPath(previewBackupPath)
    closeSettings()
  }

  /**
   * 选择存储路径
   */
  const handleSelectPath = async () => {
    const result = await window.electronAPI.dialog.selectFolder()
    if (result && !result.canceled && result.filePaths[0]) {
      setPreviewBackupPath(result.filePaths[0])
    }
  }

  /**
   * 处理文本字体大小变化
   */
  const handleTextFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10)
    if (size >= 12 && size <= 24) {
      setPreviewTextFontSize(size)
    }
  }

  /**
   * 恢复默认设置
   */
  const handleReset = () => {
    setPreviewTheme('scifi')
    setPreviewTextFontSize(14)
    setPreviewBackupPath('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="settings-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 左侧页面：核心配置 */}
            <div className="settings-left">
              <header className="settings-header">
                <h1 className="settings-title">系统设置</h1>
                <p className="settings-subtitle">配置您的知识管理工具</p>
              </header>

              <div className="settings-content">
                {/* 主题选择 */}
                <section className="settings-section">
                  <h3 className="section-title">
                    <Palette size={18} />
                    主题风格
                  </h3>
                  <div className="theme-grid">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        className={`theme-card ${previewTheme === t.id ? 'theme-card-active' : ''}`}
                        onClick={() => setPreviewTheme(t.id)}
                      >
                        <div 
                          className="theme-preview"
                          style={{ background: t.previewBg }}
                        >
                          {t.previewText && (
                            <span className="theme-preview-text">{t.previewText}</span>
                          )}
                          <t.icon size={24} className="theme-preview-icon" />
                        </div>
                        <p className="theme-label">{t.label}</p>
                        <p className="theme-desc">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 存储路径 */}
                <section className="settings-section">
                  <h3 className="section-title">
                    <FolderOpen size={18} />
                    数据存储路径
                  </h3>
                  <div className="path-input-wrapper">
                    <input
                      type="text"
                      className="path-input"
                      value={previewBackupPath || '使用默认路径'}
                      readOnly
                    />
                    <button className="path-btn" onClick={handleSelectPath}>
                      选择路径
                    </button>
                  </div>
                  <p className="section-hint">选择数据备份和附件存储的位置</p>
                </section>

                {/* 文本字体大小 */}
                <section className="settings-section">
                  <h3 className="section-title">
                    <Type size={18} />
                    文本字体大小
                  </h3>
                  <div className="font-size-control">
                    <span className="font-label">小</span>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={previewTextFontSize}
                      onChange={handleTextFontSizeChange}
                      className="font-slider"
                    />
                    <span className="font-label">大</span>
                    <span className="font-value">{previewTextFontSize}px</span>
                  </div>
                  <p className="section-hint">调整便签、链接、图文卡片的文本大小（笔记文档不受影响）</p>
                </section>
              </div>
            </div>

            {/* 右侧页面：管理与信息 */}
            <div className="settings-right">
              {/* 水印装饰 */}
              <div className="settings-watermark">
                <BookOpen size={200} />
              </div>

              <div className="settings-content">
                {/* 版本信息 */}
                <section className="settings-section">
                  <h3 className="section-title">
                    <Info size={18} />
                    版本信息
                  </h3>
                  <div className="version-info">
                    <div className="version-item">
                      <span className="version-label">软件版本</span>
                      <span className="version-value">{appVersion}</span>
                    </div>
                    <div className="version-item">
                      <span className="version-label">Electron</span>
                      <span className="version-value">v28.0.0</span>
                    </div>
                    <div className="version-item">
                      <span className="version-label">数据库版本</span>
                      <span className="version-value">v1.0</span>
                    </div>
                  </div>
                </section>

                {/* 软件升级 */}
                <section className="settings-section">
                  <h3 className="section-title">
                    <Download size={18} />
                    软件升级
                  </h3>
                  <div className="upgrade-section">
                    <p className="upgrade-status">当前已是最新版本</p>
                    <button className="upgrade-btn" disabled>
                      检查更新
                    </button>
                  </div>
                  <p className="section-hint">自动检查更新功能将在后续版本中添加</p>
                </section>

                {/* 操作按钮 */}
                <footer className="settings-footer">
                  <button 
                    className="save-btn" 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    style={{ opacity: hasChanges ? 1 : 0.5 }}
                  >
                    <span>{hasChanges ? '保存设置' : '未修改'}</span>
                  </button>
                  <button 
                    className="reset-btn"
                    onClick={handleReset}
                  >
                    恢复默认
                  </button>
                </footer>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button className="settings-close" onClick={handleClose}>
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Settings
