import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

const PAGE_HEIGHT = 13 * 96; // 13 inches * 96 DPI
const MARGIN = 96; // 1 inch
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

const EditorPage = () => {
  const [pages, setPages] = useState(["<p></p>"]);

  const editor = useEditor({
    extensions: [StarterKit, Document, Paragraph, Text],
    content: pages[0],
    editorProps: {
      attributes: {
        class: "editor-content",
        contenteditable: "true",
      },
    },
    onUpdate: ({ editor }) => {
      handlePagination(editor);
    },
  });

  const handlePagination = (editorInstance) => {
    const container = document.querySelector(".page-content");
    if (!container) return;

    const height = container.scrollHeight;

    if (height > CONTENT_HEIGHT) {
      const html = editorInstance.getHTML();

      // Split roughly (simple version)
      const midpoint = Math.floor(html.length / 2);
      const first = html.slice(0, midpoint);
      const second = html.slice(midpoint);

      setPages([first, second]);
    }
  };

  return (
    <div style={{ background: "#f0f0f0", padding: 20 }}>
      {pages.map((page, index) => (
        <div key={index} style={paperStyle}>
          {index === 0 ? (
            <EditorContent
              editor={editor}
              className="page-content"
              style={editorStyle}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: page }}
              style={editorStyle}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const paperStyle = {
  width: "8in",
  height: "13in",
  margin: "20px auto",
  color: "black",
  background: "white",
  padding: "1in",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  overflow: "hidden",
};

const editorStyle = {
  fontFamily: "'Times New Roman', serif",
  fontSize: "12pt",
  lineHeight: 2,
  height: "100%",
  outline: "none",
};

export default EditorPage;
