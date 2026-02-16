import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import EditorHeader from "./components/EditorHeader";
import MobileHeader from "./components/MobileHeader";
import CollaborativeEditor from "./components/CollaborativeEditor";
import TiptapToolbar from "./components/TiptapToolbar";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";
import { useTheme } from "./contexts/ThemeContext";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Toolbar from "./components/Toolbar";
import { useSpace } from "../../contexts/space/useSpace";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { space_uuid, file_uuid, file_name } = useParams();
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

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
       // Exclude current user
    setConnectedUsers(users);
  }, [user?.id]);

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
  }, [file_uuid, user, updateUsers]);

  // === Editor ref ===
  const setEditorReference = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // === Editor update handler - for auto-save only ===
  const handleEditorUpdate = useCallback((htmlContent) => {
    setSaveStatus("unsaved");

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
  }, [file?.file_id, draft, title]);





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
    // You can trigger auto-save or other actions here
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background }}>
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <MobileHeader />
        <EditorHeader
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          title={title}
          setTitle={setTitle}
          connectedUsers={connectedUsers}
          isOnline={isOnline}
          collaborationEnabled={collaborationEnabled}
        />
        
        {/* Optional: Toolbar for formatting */}
        {/* <TiptapToolbar editor={editorRef.current} /> */}

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

        <div className="flex justify-center items-center py-6 px-4 min-h-[calc(100vh-200px)]">
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
          />
        </div>

        {/* Connection status indicator */}
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? '● Online' : '● Offline'}
          </div>
        </div>

        {/* Connected users */}
        {collaborationEnabled && connectedUsers.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="text-xs text-gray-600 mb-2 font-medium">
                {connectedUsers.length} {connectedUsers.length === 1 ? "other person" : "other people"} editing
              </div>
              <div className="flex flex-col gap-2">
                {connectedUsers.map((u) => (
                  <div key={u.clientId} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-6 h-6 rounded-full border-2" 
                      style={{ borderColor: u.color }} 
                    />
                    <span className="text-sm font-medium text-gray-800">{u.name}</span>
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