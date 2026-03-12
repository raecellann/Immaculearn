import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { FiSun, FiMoon } from "react-icons/fi";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import EditorHeader from "./components/EditorHeader";
import MobileHeader from "./components/MobileHeader";
import CollaborativeEditor from "./components/CollaborativeEditor";
import TiptapToolbar from "./components/TiptapToolbar";
import HistoryPanel from "./components/HistoryPanel";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";
import { useTheme } from "./contexts/ThemeContext";
import { useHistory } from "./contexts/HistoryContext";
import { HistoryProvider } from "./contexts/HistoryContext";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Toolbar from "./components/Toolbar";
import { useSpace } from "../../contexts/space/useSpace";

const CreateDocumentContent = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { space_uuid, file_uuid, file_name } = useParams();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const { addToHistory, revertToHistory } = useHistory();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const headerRef = useRef(null);

  // ✅ FilePage pattern — state-based hide-on-scroll sticky header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const { userSpaces, friendSpaces } = useSpace();

  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);

  const { draft, list } = useFileManager(currentSpace?.space_id);
  const file = list.data?.find(f => f.file_uuid === file_uuid) || {};

  const [title, setTitle] = useState(file_name);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);

  const editorRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [paperSize, setPaperSize] = useState({ width: "8.27in", height: "11.69in" });
  const [margins, setMargins] = useState({ top: "1in", right: "1in", bottom: "1in", left: "1in" });
  const [fontFamily, setFontFamily] = useState("Inter");

  const saveTimeoutRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);
  const lastContentRef = useRef("");

  // === Generate consistent user color ===
  const getUserColor = (userId) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[userId % colors.length];
  };

  // === Update connected users from awareness ===
  const updateUsers = useCallback(() => {
    if (!awarenessRef.current) return;
    const states = Array.from(awarenessRef.current.getStates().entries() || []);
    const users = states
      .map(([clientId, state]) => state.user ? {
        clientId,
        id: state.user.id,
        name: state.user.name,
        color: state.user.color,
        avatar: state.user.avatar,
        cursor: state.user.cursor,
      } : null)
      .filter(Boolean)
      // Exclude current user
      .filter(user => user.id !== user?.id);
    setConnectedUsers(users);
  }, [user?.id]);

  // === Initialize with default content ===
  useEffect(() => {
    // Add initial empty content to history for new documents
    if (!file_uuid && lastContentRef.current === "") {
      const initialContent = "<p>Start typing to create your document...</p>";
      addToHistory(initialContent, {
        author: user?.first_name || user?.name || 'Anonymous User',
        description: 'New document created'
      });
      lastContentRef.current = initialContent;
    }
  }, [file_uuid, user?.first_name, user?.name, addToHistory]);

  // === Initialize Yjs + WebSocket Provider ===
  useEffect(() => {
    if (!file_uuid || !user || typeof window === "undefined") return;

    console.log('Initializing Yjs document for file:', file_uuid);

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      "ws://localhost:3001/crdt",
      file_uuid,
      ydoc,
      {
        connect: true,
        params: { userId: user?.id, userName: user?.name }
      }
    );

    ydocRef.current = ydoc;
    providerRef.current = provider;
    awarenessRef.current = provider.awareness;

    // Set local awareness state
    const localUserState = {
      user: {
        id: user?.id,
        name: user?.name,
        color: getUserColor(user?.id),
        avatar: user?.profile_pic || `https://i.pravatar.cc/40?u=${user?.id}`,
        cursor: null,
      },
    };

    awarenessRef.current.setLocalState(localUserState);
    awarenessRef.current.on("change", updateUsers);

    // WebSocket status listener
    provider.on("status", (event) => {
      const connected = event.status === "connected";
      console.log('WebSocket status:', event.status);
      setIsOnline(connected);
      if (connected) {
        setCollaborationEnabled(true);
        awarenessRef.current.setLocalState(localUserState);
        updateUsers();
      }
    });

    // Sync event
    provider.on("sync", (isSynced) => {
      console.log('Document synced:', isSynced);
      if (isSynced) {
        setCollaborationEnabled(true);
        updateUsers();
        
        // Add initial content to history
        const ytext = ydoc.getText('document');
        const content = ytext.toString();
        if (content && content !== lastContentRef.current) {
          addToHistory(content, {
            author: user?.first_name || user?.name || 'Anonymous User',
            description: 'Document loaded'
          });
          lastContentRef.current = content;
        }
      }
    });

    // Connection status
    provider.on("connection-close", () => {
      console.log('Connection closed');
      setIsOnline(false);
    });

    provider.on("connection-error", (error) => {
      console.error('Connection error:', error);
      setIsOnline(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Yjs document');
      awarenessRef.current?.off("change", updateUsers);
      provider.disconnect();
      ydoc.destroy();
      setConnectedUsers([]);
      setCollaborationEnabled(false);
      setIsOnline(false);
    };
  }, [file_uuid, user, updateUsers, addToHistory]);

  // === Editor ref ===
  const setEditorReference = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // === Editor update handler - for auto-save and history tracking ===
  const handleEditorUpdate = useCallback((htmlContent) => {
    setSaveStatus("unsaved");

    // Add to history if content changed significantly
    if (htmlContent !== lastContentRef.current) {
      addToHistory(htmlContent, {
        author: user?.first_name || user?.name || 'Anonymous User',
        description: 'Content updated'
      });
      lastContentRef.current = htmlContent;
    }

    // Auto-save to backend (debounced)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!file?.file_id) return;
      try {
        await draft.mutateAsync({
          file_id: file.file_id,
          content: htmlContent,
          title,
        });
        setSaveStatus("saved");
        setLastSaved(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Save error:', err);
        setSaveStatus("error");
      }
    }, 2000);
  }, [file?.file_id, draft, title, addToHistory, user?.first_name, user?.name, lastContentRef]);

  // === Handle history revert ===
  const handleHistoryRevert = useCallback((historyId) => {
    const entry = revertToHistory(historyId);
    if (entry && editorRef.current) {
      // Update editor content
      editorRef.current.innerHTML = entry.content;
      
      // Update Yjs document
      if (ydocRef.current) {
        const ytext = ydocRef.current.getText('document');
        ydocRef.current.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, entry.content);
        }, 'history-revert');
      }
      
      // Update save status
      setSaveStatus("unsaved");
      lastContentRef.current = entry.content;
    }
  }, [revertToHistory]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle format changes
  const handleFormatChange = (format) => {
    console.log('Format changed:', format);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background }}>

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-56 sm:w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ✅ Sticky Mobile Header — FilePage pattern (hamburger + title, hide on scroll down) */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-50 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.border,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1
              className="text-lg font-bold truncate"
              style={{ color: currentColors.text }}
            >
              {title || "Document"}
            </h1>
          </div>
        </div>

        {/* CONTENT — pt-[60px] offsets the fixed mobile header, removed on lg+ */}
        <div className="flex-1 flex pt-[60px] lg:pt-0 relative">

          {/* Main Content Area - Centered */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${showHistory ? 'mr-0' : 'mx-auto'}`}>
            {/* EditorHeader — desktop only (lg+) */}
            <EditorHeader
              navigate={navigate}
              saveStatus={saveStatus}
              lastSaved={lastSaved}
              title={title}
              setTitle={setTitle}
              connectedUsers={connectedUsers}
              isOnline={isOnline}
              collaborationEnabled={collaborationEnabled}
              onToggleHistory={() => setShowHistory(!showHistory)}
            />

            {/* Toolbar — responsive for all sizes */}
            <Toolbar
              editorRef={editorRef}
              paperSize={paperSize}
              margins={margins}
              fontFamily={fontFamily}
              onFormatChange={handleFormatChange}
              onPaperSizeChange={(size) => setPaperSize(size)}
              onMarginChange={(margin) => setMargins(margin)}
              onFontChange={(font) => setFontFamily(font)}
              isClient={typeof window !== 'undefined'}
              windowWidth={windowWidth}
            />

            {/* Editor area - Centered */}
            <div className={`flex justify-center items-start py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 lg:px-8 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] flex-1 transition-all duration-300 ease-in-out ${showHistory ? 'max-w-none' : ''}`}>
              <div className={`w-full transition-all duration-300 ease-in-out ${showHistory ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {file_uuid ? (
                  <CollaborativeEditor
                    ref={setEditorReference}
                    ydoc={ydocRef.current}
                    provider={providerRef.current}
                    user={{
                      id: user?.id,
                      name: user?.name,
                      color: getUserColor(user?.id),
                      avatar: user?.profile_pic || `https://i.pravatar.cc/40?u=${user?.id}`
                    }}
                    onUpdate={handleEditorUpdate}
                    initialContent={file?.content || ""}
                    paperSize={paperSize}
                    margins={margins}
                    fontFamily={fontFamily}
                  />
                ) : (
                  <div
                    ref={setEditorReference}
                    contentEditable
                    className="w-full min-h-[500px] p-6 rounded-lg border-2 focus:outline-none"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                      color: currentColors.text,
                      fontFamily: fontFamily,
                      ...paperSize
                    }}
                    onInput={(e) => handleEditorUpdate(e.target.innerHTML)}
                    suppressContentEditableWarning
                  >
                    <p>Start typing to create your document...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Connected users floating panel */}
            {collaborationEnabled && connectedUsers.length > 0 && (
              <div className="fixed bottom-3 sm:bottom-4 right-2 sm:right-4 z-50">
                <div
                  className="rounded-lg shadow-lg p-2 sm:p-3 max-w-[160px] sm:max-w-[200px] md:max-w-none"
                  style={{
                    backgroundColor: currentColors.surface,
                    border: `1px solid ${currentColors.border}`
                  }}
                >
                  <div className="text-xs mb-1.5 sm:mb-2 font-medium" style={{ color: currentColors.textSecondary }}>
                    <span className="hidden sm:inline">
                      {connectedUsers.length} {connectedUsers.length === 1 ? "other person" : "other people"} editing
                    </span>
                    <span className="sm:hidden">
                      {connectedUsers.length} {connectedUsers.length === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {connectedUsers.map((u) => (
                      <div
                        key={u.clientId}
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                        style={{ backgroundColor: currentColors.background }}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 shrink-0"
                          style={{ borderColor: u.color }}
                        />
                        <span
                          className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-[100px]"
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

          {/* History Panel Sidebar - Right Side (Overlay) */}
          <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
            showHistory ? 'translate-x-0' : 'translate-x-full'
          }`} style={{ backgroundColor: currentColors.surface }}>
            <HistoryPanel
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              onRevert={handleHistoryRevert}
              isSidebar={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateDocumentPage = () => {
  return (
    <HistoryProvider>
      <CreateDocumentContent />
    </HistoryProvider>
  );
};

export default CreateDocumentPage;
