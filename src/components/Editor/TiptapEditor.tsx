import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useCallback } from 'react'
import EditorToolbar from './EditorToolbar'
import './Editor.css'

/**
 * Tiptap 编辑器属性接口
 */
interface TiptapEditorProps {
  content?: string
  placeholder?: string
  editable?: boolean
  onUpdate?: (content: string) => void
  onSave?: (content: string) => void
  autoFocus?: boolean
}

/**
 * Tiptap 编辑器组件
 * @description 基于 Tiptap 的富文本编辑器，支持 Markdown 快捷键
 */
function TiptapEditor({
  content = '',
  placeholder = '开始输入内容...',
  editable = true,
  onUpdate,
  onSave,
  autoFocus = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
    ],
    content,
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-full min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  const handleSave = useCallback(() => {
    if (editor && onSave) {
      onSave(editor.getHTML())
    }
  }, [editor, onSave])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  if (!editor) {
    return (
      <div className="editor-loading">
        <span>加载编辑器...</span>
      </div>
    )
  }

  return (
    <div className="editor-container">
      {editable && <EditorToolbar editor={editor} onSave={handleSave} />}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

export default TiptapEditor
