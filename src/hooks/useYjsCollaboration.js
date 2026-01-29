import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import EditorHeader from "./components/EditorHeader";
import EditorToolbar from "./components/EditorToolBar";
import MobileHeader from "./components/MobileHeader";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import { useYjsCollaboration } from "../../hooks/useYjsCollaboration";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  /* ===================== STATE ===================== */
  const [title, setTitle] = useState("Thesis Chapter 2 Participation");
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [selectedTextColor, setSelectedTextColor] = useState("black");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("transparent");
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedPaperSize, setSelectedPaperSize] = useState("A4");
  const [selectedMargin, setSelectedMargin] = useState("Normal");
  const [selectedFont, setSelectedFont] = useState("Inter");

  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  const saveTimeoutRef = useRef(null);

  /* ===================== COLLAB ===================== */
  const roomName = documentId || "default-room";
  const collaborationEnabled = !!documentId;

  const {
    ydoc,
    provider,
    users: connectedUsers,
    connected: isOnline,
    loading: collaborationLoading,
  } = useYjsCollaboration(roomName, {
    userName: "Current User",
    userColor: "#3b82f6",
  });

  /* ===================== CONSTANTS ===================== */
  const paperSizes = {
    A4: { width: "8.27in", height: "11.69in" },
    Letter: { width: "8.5in", height: "11in" },
    A3: { width: "11.69in", height: "16.53in" },
  };

  const marginOptions = {
    Normal: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    Narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    Wide: { top: "1in", right: "2in", bottom: "1in", left: "2in" },
  };

  /* ===================== TIPTAP ===================== */
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ...(collaborationEnabled
        ? [
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
              provider,
              user: {
                name: "Current User",
                color: "#3b82f6",
              },
            }),
          ]
        : []),
    ],
    editorProps: {
      attributes: {
        class: "bg-white outline-none shadow-md",
        style: `
          width: ${paperSizes[selectedPaperSize].width};
          min-height: ${paperSizes[selectedPaperSize].height};
          padding: ${marginOptions[selectedMargin].top}
                   ${marginOptions[selectedMargin].right}
                   ${marginOptions[selectedMargin].bottom}
                   ${marginOptions[selectedMargin].left};
          font-family: ${selectedFont}, Arial, sans-serif;
        `,
      },
    },
    onUpdate: () => {
      setSaveStatus("unsaved");

      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus("saved");
        setLastSaved(new Date());
      }, 2000);
    },
  });

  /* ===================== TOOLBAR ACTIONS ===================== */
  const applyBold = () => editor?.chain().focus().toggleBold().run();
  const applyItalic = () => editor?.chain().focus().toggleItalic().run();
  const applyUnderline = () => editor?.chain().focus().toggleUnderline().run();

  const applyAlignment = (alignment) => {
    editor?.chain().focus().setTextAlign(alignment).run();
    setSelectedAlignment(alignment);
  };

  const applyTextColor = (color) => {
    editor?.chain().focus().setColor(color).run();
    setSelectedTextColor(color);
  };

  const applyHighlightColor = (color) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
    setSelectedHighlightColor(color);
  };

  const applyFontFamily = (font) => {
    editor?.chain().focus().setFontFamily(font).run();
    setSelectedFont(font);
  };

  const applyFontSize = (size) => {
    editor
      ?.chain()
      .focus()
      .setMark("textStyle", { fontSize: `${size}px` })
      .run();
    setSelectedFontSize(size);
  };

  const applyList = (type) => {
    if (type === "bullet") {
      editor?.chain().focus().toggleBulletList().run();
    } else if (type === "number") {
      editor?.chain().focus().toggleOrderedList().run();
    } else {
      editor?.chain().focus().clearNodes().run();
    }
  };

  /* ===================== DOWNLOAD ===================== */
  const downloadDocument = (format) => {
    if (!editor) return;

    const content = editor.getText();
    const html = editor.getHTML();

    if (format === "txt") {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href: url,
        download: `${title}.txt`,
      }).click();
    }

    if (format === "html") {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), {
        href: url,
        download: `${title}.html`,
      }).click();
    }

    if (format === "pdf") window.print();

    setIsDownloadDropdownOpen(false);
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      <div className="flex-1">
        <MobileHeader
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        <EditorHeader
          navigate={navigate}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          title={title}
          setTitle={setTitle}
          isDownloadDropdownOpen={isDownloadDropdownOpen}
          setIsDownloadDropdownOpen={setIsDownloadDropdownOpen}
          downloadDocument={downloadDocument}
          connectedUsers={connectedUsers}
          isOnline={isOnline}
          collaborationEnabled={collaborationEnabled}
          collaborationLoading={collaborationLoading}
        />

        <EditorToolbar
          applyBold={applyBold}
          applyItalic={applyItalic}
          applyUnderline={applyUnderline}
          applyAlignment={applyAlignment}
          applyTextColor={applyTextColor}
          applyHighlightColor={applyHighlightColor}
          applyFontFamily={applyFontFamily}
          applyFontSize={applyFontSize}
          applyList={applyList}
        />

        <div className="flex justify-center py-10">
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default CreateDocumentPage;
