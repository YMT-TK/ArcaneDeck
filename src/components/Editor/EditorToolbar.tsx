import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image,
  Save,
} from 'lucide-react'

/**
 * 编辑器工具栏属性接口
 */
interface EditorToolbarProps {
  editor: Editor
  onSave?: () => void
}

/**
 * 编辑器工具栏组件
 * @description 提供富文本编辑功能的工具栏
 */
function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('输入链接地址:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('输入图片地址:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const toolbarGroups = [
    {
      name: '历史',
      items: [
        {
          icon: Undo,
          action: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          title: '撤销 (Ctrl+Z)',
        },
        {
          icon: Redo,
          action: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          title: '重做 (Ctrl+Y)',
        },
      ],
    },
    {
      name: '文本格式',
      items: [
        {
          icon: Bold,
          action: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive('bold'),
          title: '粗体 (Ctrl+B)',
        },
        {
          icon: Italic,
          action: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive('italic'),
          title: '斜体 (Ctrl+I)',
        },
        {
          icon: Strikethrough,
          action: () => editor.chain().focus().toggleStrike().run(),
          active: editor.isActive('strike'),
          title: '删除线',
        },
        {
          icon: Code,
          action: () => editor.chain().focus().toggleCode().run(),
          active: editor.isActive('code'),
          title: '行内代码',
        },
      ],
    },
    {
      name: '标题',
      items: [
        {
          icon: Heading1,
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive('heading', { level: 1 }),
          title: '标题 1',
        },
        {
          icon: Heading2,
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive('heading', { level: 2 }),
          title: '标题 2',
        },
        {
          icon: Heading3,
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          active: editor.isActive('heading', { level: 3 }),
          title: '标题 3',
        },
      ],
    },
    {
      name: '列表',
      items: [
        {
          icon: List,
          action: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive('bulletList'),
          title: '无序列表',
        },
        {
          icon: ListOrdered,
          action: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive('orderedList'),
          title: '有序列表',
        },
        {
          icon: Quote,
          action: () => editor.chain().focus().toggleBlockquote().run(),
          active: editor.isActive('blockquote'),
          title: '引用',
        },
      ],
    },
    {
      name: '插入',
      items: [
        {
          icon: Link,
          action: setLink,
          active: editor.isActive('link'),
          title: '插入链接',
        },
        {
          icon: Image,
          action: addImage,
          title: '插入图片',
        },
      ],
    },
  ]

  return (
    <div className="editor-toolbar">
      {toolbarGroups.map((group) => (
        <div key={group.name} className="toolbar-group">
          {group.items.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              disabled={(item as any).disabled}
              title={item.title}
              className={`toolbar-button ${(item as any).active ? 'active' : ''} ${(item as any).disabled ? 'disabled' : ''}`}
            >
              <item.icon size={18} />
            </button>
          ))}
        </div>
      ))}
      {onSave && (
        <div className="toolbar-group ml-auto">
          <button
            onClick={onSave}
            title="保存 (Ctrl+S)"
            className="toolbar-button save-button"
          >
            <Save size={18} />
            <span className="ml-1">保存</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default EditorToolbar
