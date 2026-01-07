"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import {TextStyle} from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { useState, useEffect } from "react"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  ChevronDown,
} from "lucide-react"

const MenuBar = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [showTextSizeDropdown, setShowTextSizeDropdown] = useState(false)

  if (!editor) {
    return null
  }

  const applyColor = () => {
    if (currentColor) {
      editor.chain().focus().setColor(currentColor).run()
    }
    setShowColorPicker(false)
  }

  const setHeading = (level) => {
    if (editor.isActive('heading', { level })) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level }).run()
    }
    setShowTextSizeDropdown(false)
  }

  const textSizeOptions = [
    { level: 1, label: "Heading 1", icon: <Heading1 className="w-4 h-4" /> },
    { level: 2, label: "Heading 2", icon: <Heading2 className="w-4 h-4" /> },
    { level: 3, label: "Heading 3", icon: <Heading3 className="w-4 h-4" /> },
    { level: 4, label: "Heading 4", icon: <Heading4 className="w-4 h-4" /> },
    { level: 5, label: "Heading 5", icon: <Heading5 className="w-4 h-4" /> },
    { level: 6, label: "Heading 6", icon: <Heading6 className="w-4 h-4" /> },
    { level: 0, label: "Normal Text", icon: <Type className="w-4 h-4" /> }
  ]

  return (
    <div className="border-b border-gray-200 pb-3 mb-3">
      <div className="flex flex-wrap items-center gap-1 mb-2">
        {/* Text Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTextSizeDropdown(!showTextSizeDropdown)}
            className={`flex items-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive('heading') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
            type="button"
          >
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showTextSizeDropdown && (
            <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200">
              {textSizeOptions.map((option) => (
                <button
                  key={option.level || 'normal'}
                  onClick={() => option.level ? setHeading(option.level) : editor.chain().focus().setParagraph().run()}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm ${
                    editor.isActive('heading', { level: option.level }) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("bold") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Bold"
            type="button"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("italic") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Italic"
            type="button"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Align Left"
            type="button"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Align Center"
            type="button"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Align Right"
            type="button"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Bullet List"
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Ordered List"
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("textStyle") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Text Color"
            type="button"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>

        {/* Other Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("blockquote") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Quote"
            type="button"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("codeBlock") ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
            title="Code Block"
            type="button"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-600"
            title="Undo"
            type="button"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-600"
            title="Redo"
            type="button"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-10 h-10 cursor-pointer"
          />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            onKeyDown={(e) => e.key === "Enter" && applyColor()}
          />
          <button
            onClick={applyColor}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            type="button"
          >
            Apply
          </button>
          <button
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              setShowColorPicker(false)
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            type="button"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

const FileEditor = ({ value, onChange, placeholder = "Describe your file..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none min-h-[150px] p-4",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all duration-200">
      <div className="p-2">
        <MenuBar editor={editor} />
        <div className="min-h-[150px]">
          <EditorContent editor={editor} className="prose max-w-none focus:outline-none" />
        </div>
      </div>
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
          padding: 0.5rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.25rem;
          margin: 0.5rem 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 0.75rem;
          margin: 0.75rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .ProseMirror pre {
          background: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.75rem;
          margin: 0.75rem 0;
          overflow-x: auto;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.2rem;
          font-family: 'Courier New', monospace;
        }
        .ProseMirror .text-align-left {
          text-align: left;
        }
        .ProseMirror .text-align-center {
          text-align: center;
        }
        .ProseMirror .text-align-right {
          text-align: right;
        }
      `}</style>
    </div>
  )
}

export default FileEditor