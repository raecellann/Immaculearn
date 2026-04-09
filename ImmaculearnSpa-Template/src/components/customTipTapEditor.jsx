// src/components/CollaborativeTipTapEditor.jsx
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
// Import additional extensions as needed
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';

const CollaborativeTipTapEditor = forwardRef(({
  content = '',
  onContentChange,
  onSelectionChange,
  readOnly = false,
  placeholder = 'Start typing...',
  className = '',
  collaborationEnabled = false,
  yjsProvider = null,
}, ref) => {
  const isSyncingRef = useRef(false);
  const lastContentRef = useRef(content);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
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
      TextStyle,
      Color,
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading...';
          }
          return placeholder;
        },
      }),
    ],
    content: content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-[500px] p-4',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      // Prevent infinite loops
      if (html === lastContentRef.current) return;
      
      lastContentRef.current = html;
      onContentChange(html);
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const selection = editor.state.selection;
        onSelectionChange({
          from: selection.from,
          to: selection.to,
          empty: selection.empty,
        });
      }
    },
  });

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getContent: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
    getJSON: () => editor?.getJSON() || null,
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
    clear: () => editor?.commands.clearContent(),
    // Formatting commands
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
    toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
    setHeading: (level) => editor?.chain().focus().toggleHeading({ level }).run(),
    setAlignment: (alignment) => editor?.chain().focus().setTextAlign(alignment).run(),
    setColor: (color) => editor?.chain().focus().setColor(color).run(),
    setHighlight: (color) => editor?.chain().focus().setHighlight({ color }).run(),
    toggleBulletList: () => editor?.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor?.chain().focus().toggleOrderedList().run(),
    // Utility methods
    insertText: (text) => editor?.chain().focus().insertContent(text).run(),
    setContent: (content) => {
      if (editor) {
        editor.commands.setContent(content);
        lastContentRef.current = content;
      }
    },
  }));

  // Update content when prop changes (for remote updates)
  useEffect(() => {
    if (!editor || isSyncingRef.current || content === lastContentRef.current) {
      return;
    }

    isSyncingRef.current = true;
    
    // Save current selection
    const selection = editor.state.selection;
    
    // Update content
    editor.commands.setContent(content, false);
    
    // Restore selection if possible
    if (selection.from >= 0 && selection.from <= editor.state.doc.content.size) {
      editor.commands.setTextSelection(selection.from);
    }
    
    lastContentRef.current = content;
    
    // Reset sync flag after a delay
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 10);
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return (
      <div className={`tiptap-loading ${className}`}>
        <div className="animate-pulse bg-gray-200 h-[500px] rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`collaborative-tiptap-editor ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
});

CollaborativeTipTapEditor.displayName = 'CollaborativeTipTapEditor';

export default CollaborativeTipTapEditor;