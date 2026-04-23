import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import './TodoListEditor.css'

/**
 * 待办事项接口
 */
interface TodoItem {
  id: string
  text: string
  completed: boolean
}

/**
 * 待办列表数据接口
 */
interface TodoListData {
  items: TodoItem[]
}

/**
 * 待办列表编辑器组件属性
 */
interface TodoListEditorProps {
  content: string
  onChange: (content: string) => void
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 待办列表编辑器组件
 * @description 用于编辑带有多选框的待办事项列表
 */
const TodoListEditor = ({ content, onChange }: TodoListEditorProps) => {
  const [items, setItems] = useState<TodoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 解码 HTML 实体 - 简单但可靠的实现
   */
  const decodeHtmlEntities = (str: string): string => {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#38;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&#60;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#62;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
  }

  /**
   * 解析内容
   */
  useEffect(() => {
    console.log('=== TodoListEditor content changed ===')
    console.log('Received content:', content)
    
    try {
      // 处理 content 为 null、undefined 或空字符串的情况
      if (!content || content.trim() === '') {
        console.log('Content is empty, setting default items')
        setItems([])
        return
      }
      
      // 尝试直接解析，失败后再解码
      let data
      try {
        data = JSON.parse(content) as TodoListData
      } catch (e) {
        console.log('Direct parse failed, trying decoded content')
        const decodedContent = decodeHtmlEntities(content)
        console.log('Decoded content:', decodedContent)
        data = JSON.parse(decodedContent) as TodoListData
      }
      
      console.log('Parsed data:', data)
      
      // 确保 items 是数组
      if (Array.isArray(data.items)) {
        setItems(data.items)
      } else {
        console.warn('Parsed data has no valid items array, setting empty array')
        setItems([])
      }
    } catch (error) {
      console.error('Failed to parse content:', error)
      console.error('Content that caused error:', content)
      setItems([])
    }
  }, [content])

  /**
   * 保存变更
   */
  const saveChanges = (newItems: TodoItem[]) => {
    console.log('=== TodoListEditor saveChanges ===')
    console.log('newItems:', newItems)
    const data: TodoListData = { items: newItems }
    const jsonString = JSON.stringify(data)
    console.log('jsonString to save:', jsonString)
    onChange(jsonString)
  }

  /**
   * 添加新待办事项
   */
  const addTodoItem = () => {
    if (inputRef.current && inputRef.current.value.trim()) {
      const newItem: TodoItem = {
        id: generateId(),
        text: inputRef.current.value.trim(),
        completed: false,
      }
      const newItems = [...items, newItem]
      setItems(newItems)
      saveChanges(newItems)
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

  /**
   * 更新待办事项文本
   */
  const updateTodoText = (id: string, newText: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, text: newText } : item
    )
    setItems(newItems)
    saveChanges(newItems)
  }

  /**
   * 切换待办事项完成状态
   */
  const toggleTodoCompleted = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setItems(newItems)
    saveChanges(newItems)
  }

  /**
   * 删除待办事项
   */
  const deleteTodoItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
    setItems(newItems)
    saveChanges(newItems)
  }

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTodoItem()
    }
  }

  return (
    <div className="todo-editor">
      <div className="todo-input-container">
        <input
          ref={inputRef}
          type="text"
          className="todo-input"
          placeholder="添加新的待办事项..."
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: 'Georgia, serif',
            color: '#221b0b',
          }}
        />
        <button
          className="todo-add-btn"
          onClick={addTodoItem}
          disabled={!inputRef.current?.value.trim()}
          style={{ backgroundColor: '#430000' }}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="todo-list">
        {items.length === 0 ? (
          <div className="todo-empty-state">
            <p
              className="todo-empty-text"
              style={{
                fontFamily: 'Georgia, serif',
                color: 'rgba(67, 0, 0, 0.4)',
              }}
            >
              暂无待办事项
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="todo-item">
              <div className="todo-item-drag">
                <GripVertical size={16} style={{ color: 'rgba(67, 0, 0, 0.2)' }} />
              </div>
              <button
                className={`todo-checkbox-editor ${item.completed ? 'todo-checkbox-editor-checked' : ''}`}
                onClick={() => toggleTodoCompleted(item.id)}
              >
                {item.completed && <span className="todo-checkmark-editor">✓</span>}
              </button>
              <input
                type="text"
                className={`todo-item-text ${item.completed ? 'todo-item-text-completed' : ''}`}
                value={item.text}
                onChange={(e) => updateTodoText(item.id, e.target.value)}
                style={{
                  fontFamily: 'Georgia, serif',
                  color: '#221b0b',
                }}
              />
              <button
                className="todo-delete-btn"
                onClick={() => deleteTodoItem(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoListEditor
