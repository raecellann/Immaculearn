import React, { forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

const TiptapEditor = forwardRef(({
  ydoc,
  provider,
  user,
  paperSize,
  margins,
  fontFamily: selectedFontFamily,
  onUpdate,
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Color.configure({
        types: ['textStyle'],   // apply color to marks
        defaultColor: 'black',  // default text color
      }),
      Highlight.configure({ multicolor: true }),
      FontFamily,
      ...(ydoc && provider ? [
        Collaboration.configure({ document: ydoc }),
        CollaborationCursor.configure({
          provider,
          user, // { name, color, id }
          // optional: display cursor name next to the selection
        }),
      ] : []),
    ],
    content: `<p style="color: black;"></p>`,
    editorProps: {
      attributes: {
        class: "tiptap-editor bg-white outline-none shadow-md",
        style: `
          width: ${paperSize?.width || '8.27in'};
          min-height: ${paperSize?.height || '11.69in'};
          padding: ${margins?.top || '1in'} ${margins?.right || '1in'} ${margins?.bottom || '1in'} ${margins?.left || '1in'};
          font-family: ${selectedFontFamily || 'Inter'}, Arial, sans-serif;
          color: black; /* fallback color for all text */
        `,
      },
    },
    onUpdate: ({ editor }) => onUpdate?.(),
    immediatelyRender: false,
  });

  useImperativeHandle(ref, () => ({
    getText: () => editor?.getText() || '',
    getHTML: () => editor?.getHTML() || '',
    chain: () => editor?.chain(),
    focus: () => editor?.commands.focus(),
    isActive: (name, attributes) => editor?.isActive(name, attributes),
  }), [editor]);

  if (!editor) {
    return <div className="tiptap-editor bg-white outline-none shadow-md" style={{
      width: paperSize?.width || '8.27in',
      minHeight: paperSize?.height || '11.69in',
      padding: `${margins?.top || '1in'} ${margins?.right || '1in'} ${margins?.bottom || '1in'} ${margins?.left || '1in'}`,
      fontFamily: `${selectedFontFamily || 'Inter'}, Arial, sans-serif`,
    }}>Loading editor...</div>;
  }

  return <EditorContent editor={editor} />;
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;
