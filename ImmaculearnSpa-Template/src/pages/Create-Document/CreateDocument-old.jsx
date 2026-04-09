import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { FiArrowLeft, FiSun, FiMoon, FiCheck, FiSave, FiMenu } from "react-icons/fi";
import Sidebar from "../component/sidebar";
import EditorHeader from "./components-old/EditorHeader";
import TiptapToolbar from "./components-old/TiptapToolbar";
import { useTheme } from "./contexts-old/ThemeContext";
import useYDoc from "../../hooks/useYdoc";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";
import { useSpace } from "../../contexts/space/useSpace";
import CollaborativeEditor from "./components-old/CollaborativeEditor";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { space_uuid, file_uuid, file_name } = useParams();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const { ydoc, provider } = useYDoc(
    "bf284888-1e98-11f1-95af-c03532821bd5",
    1,
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { userSpaces, friendSpaces } = useSpace();
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find((s) => s.space_uuid === space_uuid);

  const { draft, list } = useFileManager(currentSpace?.space_id);
  const file = list.data?.find((f) => f.file_uuid === file_uuid) || {};

  const [title, setTitle]                   = useState(file_name);
  const [saveStatus, setSaveStatus]         = useState("saved");
  const [lastSaved, setLastSaved]           = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isOnline, setIsOnline]             = useState(false);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);

  const editorRef      = useRef(null);
  const saveTimeoutRef = useRef(null);
  const awarenessRef   = useRef(null);

  // ── Tiptap editor instance (passed to toolbar) ────────────────────────────
  const [tiptapEditor, setTiptapEditor] = useState(null);

  // ── Toolbar state ─────────────────────────────────────────────────────────
  const [selectedAlignment,      setSelectedAlignment]      = useState("left");
  const [selectedTextColor,      setSelectedTextColor]      = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("#ffff00");
  const [selectedFont,           setSelectedFont]           = useState("Inter");
  const [selectedFontSize,       setSelectedFontSize]       = useState(12);

  const [isAlignmentDropdownOpen,  setIsAlignmentDropdownOpen]  = useState(false);
  const [isColorDropdownOpen,      setIsColorDropdownOpen]      = useState(false);
  const [isFontDropdownOpen,       setIsFontDropdownOpen]       = useState(false);
  const [isFontSizeDropdownOpen,   setIsFontSizeDropdownOpen]   = useState(false);
  const [isListDropdownOpen,       setIsListDropdownOpen]       = useState(false);

  // ── Toolbar handlers ──────────────────────────────────────────────────────
  const applyBold      = () => tiptapEditor?.chain().focus().toggleBold().run();
  const applyItalic    = () => tiptapEditor?.chain().focus().toggleItalic().run();
  const applyUnderline = () => tiptapEditor?.chain().focus().toggleUnderline().run();

  const applyAlignment = (align) => {
    tiptapEditor?.chain().focus().setTextAlign(align).run();
    setSelectedAlignment(align);
  };

  const applyTextColor = (color) => {
    tiptapEditor?.chain().focus().setColor(color).run();
    setSelectedTextColor(color);
  };

  const applyHighlightColor = (color) => {
    tiptapEditor?.chain().focus().setHighlight({ color }).run();
    setSelectedHighlightColor(color);
  };

  const applyFontFamily = (font) => {
    setSelectedFont(font);
    editorRef.current?.setFontFamily?.(font);
  };

  const applyFontSize = (size) => {
    setSelectedFontSize(size);
    editorRef.current?.setFontSize?.(size);
  };

  const handleAddPage    = () => editorRef.current?.addPage?.();
  const handleDeletePage = () => editorRef.current?.deletePage?.();

  const handleDownload = () => {
    const html    = editorRef.current?.getHTML?.() ?? "";
    const docName = title || "document";
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${docName}</title>
          <style>
            body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 1in; }
          </style>
        </head>
        <body>${html}</body>
      </html>`;
    const blob = new Blob([content], { type: "application/msword" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${docName}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyList = (type) => {
    if (type === "bullet") {
      tiptapEditor?.chain().focus().toggleBulletList().run();
    } else if (type === "number") {
      tiptapEditor?.chain().focus().toggleOrderedList().run();
    } else {
      tiptapEditor?.chain().focus().liftListItem("listItem").run();
    }
  };

  // ── Collaboration awareness ───────────────────────────────────────────────
  const getUserColor = (userId) => {
    const palette = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];
    return palette[userId % palette.length];
  };

  const updateUsers = useCallback(() => {
    if (!awarenessRef.current) return;
    const states = Array.from(awarenessRef.current.getStates().entries() || []);
    setConnectedUsers(
      states
        .map(([clientId, state]) =>
          state.user
            ? { clientId, id: state.user.id, name: state.user.name,
                color: state.user.color, avatar: state.user.avatar }
            : null,
        )
        .filter(Boolean),
    );
  }, [user?.id]);

  useEffect(() => {
    if (!file_uuid || !user || !provider) return;
    awarenessRef.current = provider.awareness;
    const localState = {
      user: {
        id: user?.id, name: user?.name, color: getUserColor(user?.id),
        avatar: user?.profile_pic || `https://i.pravatar.cc/40?u=${user?.id}`,
        cursor: null,
      },
    };
    awarenessRef.current.setLocalState(localState);
    awarenessRef.current.on("change", updateUsers);
    provider.on("status", (e) => {
      const ok = e.status === "connected";
      setIsOnline(ok);
      if (ok) { setCollaborationEnabled(true); awarenessRef.current.setLocalState(localState); updateUsers(); }
    });
    provider.on("sync", (s) => { if (s) { setCollaborationEnabled(true); updateUsers(); } });
    provider.on("connection-close", () => setIsOnline(false));
    provider.on("connection-error",  () => setIsOnline(false));
    return () => {
      awarenessRef.current?.off("change", updateUsers);
      setConnectedUsers([]); setCollaborationEnabled(false); setIsOnline(false);
    };
  }, [file_uuid, user, provider, updateUsers]);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  const handleEditorUpdate = useCallback(
    (htmlContent) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        if (!file?.file_id) return;
        try {
          await draft.mutateAsync({ file_id: file.file_id, content: htmlContent, title });
          setSaveStatus("saved");
          setLastSaved(new Date().toLocaleTimeString());
        } catch {
          setSaveStatus("error");
        }
      }, 2000);
    },
    [file?.file_id, draft, title],
  );

  // ── Save badge (mobile) ───────────────────────────────────────────────────
  const SaveBadge = () => (
    <div className="flex items-center gap-1 text-xs" style={{ color: currentColors.textSecondary }}>
      {saveStatus === "saved"   && <><FiCheck size={12} className="text-green-500" /><span className="hidden sm:inline">Saved</span></>}
      {saveStatus === "unsaved" && <><FiSave  size={12} className="text-gray-400"  /><span className="hidden sm:inline">Unsaved</span></>}
      {saveStatus === "error"   && <span className="text-red-400">Error</span>}
    </div>
  );

  const workspaceBg = isDarkMode ? "#3a3a3a" : "#e0e0e0";

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: currentColors.background }}>

      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar overlay ────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <div className="h-full overflow-y-auto"><Sidebar /></div>
      </div>

      {/* ── Main content column ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">

        {/* ── Sticky header block ───────────────────────────────────────── */}
        <div className="sticky top-0 z-30 flex-shrink-0">

          {/* Mobile / Tablet header */}
          <div
            className="lg:hidden border-b"
            style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-1.5 rounded-md flex-shrink-0"
                style={{ color: currentColors.text }}
              >
                <FiMenu size={20} />
              </button>

              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-md flex-shrink-0"
                style={{ color: currentColors.textSecondary }}
              >
                <FiArrowLeft size={18} />
              </button>

              <input
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 min-w-0 text-sm font-semibold bg-transparent outline-none truncate"
                style={{ color: currentColors.text }}
                placeholder="Document title…"
              />

              <SaveBadge />

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentColors.surface, color: currentColors.text,
                         border: `1px solid ${currentColors.border}` }}
              >
                {isDarkMode ? <FiSun size={14} /> : <FiMoon size={14} />}
              </button>
            </div>
          </div>

          {/* Desktop EditorHeader */}
          <div className="hidden lg:block">
            <EditorHeader
              navigate={navigate}
              saveStatus={saveStatus}
              lastSaved={lastSaved}
              title={title}
              setTitle={setTitle}
              connectedUsers={connectedUsers}
              isOnline={isOnline}
              collaborationEnabled={collaborationEnabled}
              onDownload={handleDownload}
            />
          </div>

          {/* TiptapToolbar — all breakpoints */}
          <TiptapToolbar
            editor={tiptapEditor}
            selectedAlignment={selectedAlignment}
            selectedTextColor={selectedTextColor}
            selectedHighlightColor={selectedHighlightColor}
            selectedFont={selectedFont}
            selectedFontSize={selectedFontSize}
            applyAlignment={applyAlignment}
            applyTextColor={applyTextColor}
            applyHighlightColor={applyHighlightColor}
            applyFontFamily={applyFontFamily}
            applyFontSize={applyFontSize}
            applyBold={applyBold}
            applyItalic={applyItalic}
            applyUnderline={applyUnderline}
            applyList={applyList}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            isAlignmentDropdownOpen={isAlignmentDropdownOpen}
            isColorDropdownOpen={isColorDropdownOpen}
            isFontDropdownOpen={isFontDropdownOpen}
            isFontSizeDropdownOpen={isFontSizeDropdownOpen}
            isListDropdownOpen={isListDropdownOpen}
            setIsAlignmentDropdownOpen={setIsAlignmentDropdownOpen}
            setIsColorDropdownOpen={setIsColorDropdownOpen}
            setIsFontDropdownOpen={setIsFontDropdownOpen}
            setIsFontSizeDropdownOpen={setIsFontSizeDropdownOpen}
            setIsListDropdownOpen={setIsListDropdownOpen}
          />
        </div>

        {/* ── Gray workspace with centered Tiptap editor ────────────────── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ backgroundColor: workspaceBg }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "32px 16px 48px",
              minHeight: "100%",
            }}
          >
            <CollaborativeEditor
              ref={editorRef}
              ydoc={ydoc}
              provider={provider}
              user={{
                id: user?.id,
                name: user?.name,
                color: getUserColor(user?.id),
                avatar: user?.profile_pic || `https://i.pravatar.cc/40?u=${user?.id}`,
              }}
              onUpdate={handleEditorUpdate}
              initialContent={file?.content || ""}
              onEditorReady={setTiptapEditor}
            />
          </div>
        </div>

        {/* ── Connected users floating badge ────────────────────────────── */}
        {collaborationEnabled && connectedUsers.length > 0 && (
          <div className="fixed bottom-4 right-3 sm:right-4 z-50">
            <div
              className="rounded-lg shadow-lg p-2 sm:p-3"
              style={{ backgroundColor: currentColors.surface, border: `1px solid ${currentColors.border}` }}
            >
              <p className="text-xs mb-2 font-medium" style={{ color: currentColors.textSecondary }}>
                {connectedUsers.length} {connectedUsers.length === 1 ? "person" : "people"} editing
              </p>
              <div className="flex flex-col gap-1.5">
                {connectedUsers.map((u) => (
                  <div
                    key={u.clientId}
                    className="flex items-center gap-2 px-2 py-1 rounded-full"
                    style={{ backgroundColor: currentColors.background }}
                  >
                    <img
                      src={u.avatar} alt={u.name}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 shrink-0"
                      style={{ borderColor: u.color }}
                    />
                    <span
                      className="text-xs font-medium truncate max-w-[90px]"
                      style={{ color: currentColors.text }}
                    >
                      {u.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateDocumentPage;
