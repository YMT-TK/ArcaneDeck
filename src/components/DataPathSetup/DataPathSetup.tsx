import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Database, AlertCircle } from 'lucide-react'
import './DataPathSetup.css'

/**
 * 数据存储路径设置弹窗组件
 * @description 用于初始安装时设置数据存储路径
 */
interface DataPathSetupProps {
  isOpen: boolean
  onConfirm: (path: string) => Promise<void>
  onUseDefault: () => Promise<void>
}

function DataPathSetup({ isOpen, onConfirm, onUseDefault }: DataPathSetupProps) {
  const [selectedPath, setSelectedPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 选择文件夹路径
   */
  const handleSelectPath = async () => {
    try {
      const result = await window.electronAPI.dialog.selectFolder()
      if (result && !result.canceled && result.filePaths[0]) {
        setSelectedPath(result.filePaths[0])
      }
    } catch (error) {
      console.error('Failed to select path:', error)
    }
  }

  /**
   * 确认选择路径
   */
  const handleConfirm = async () => {
    if (!selectedPath) return
    setIsLoading(true)
    try {
      await onConfirm(selectedPath)
    } catch (error) {
      console.error('Failed to set data path:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 使用默认路径
   */
  const handleUseDefault = async () => {
    setIsLoading(true)
    try {
      await onUseDefault()
    } catch (error) {
      console.error('Failed to use default path:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="data-path-setup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="data-path-setup-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <header className="data-path-setup-header">
              <div className="data-path-setup-icon">
                <Database size={32} />
              </div>
              <h1 className="data-path-setup-title">欢迎使用 ArcaneDeck</h1>
              <p className="data-path-setup-subtitle">
                在开始之前，请设置您的数据存储位置
              </p>
            </header>

            <div className="data-path-setup-content">
              <div className="data-path-setup-hint">
                <p className="data-path-setup-hint-text">
                  数据将存储在您选择的位置，包括数据库文件、附件和备份。
                  建议选择一个有足够存储空间且安全的位置。
                </p>
              </div>

              <div className="path-input-wrapper">
                <input
                  type="text"
                  className="path-input"
                  value={selectedPath || '请选择数据存储位置...'}
                  readOnly
                  placeholder="请选择数据存储位置..."
                />
                <button className="path-btn" onClick={handleSelectPath} disabled={isLoading}>
                  <FolderOpen size={16} />
                  选择路径
                </button>
              </div>

              <div className="data-path-setup-warning">
                <AlertCircle size={16} className="data-path-setup-warning-icon" />
                <p className="data-path-setup-warning-text">
                  一旦设置，数据存储路径将永久保存。如需更改，请在设置中操作。
                  更改路径时会自动迁移现有数据。
                </p>
              </div>
            </div>

            <footer className="data-path-setup-footer">
              <button
                className="default-btn"
                onClick={handleUseDefault}
                disabled={isLoading}
              >
                使用默认路径
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirm}
                disabled={!selectedPath || isLoading}
              >
                {isLoading ? '设置中...' : '确认设置'}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DataPathSetup
