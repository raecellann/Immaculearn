import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import EditorHeader from "./components/EditorHeader";
import MobileHeader from "./components/MobileHeader";
import TiptapEditor from "./components/TiptapEditor";
import { getYjsProvider, cleanupProvider } from "../../crdt/yjsProvider";
import TiptapToolbar from "./components/TiptapToolbar";
import { useUser } from "../../contexts/user/useUser";

const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { file_uuid } = useParams();


  
  // State declarations
  const [title, setTitle] = useState("Thesis Chapter 2 Participation");
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("transparent");
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [selectedPaperSize, setSelectedPaperSize] = useState("A4");
  const [selectedMargin, setSelectedMargin] = useState("Normal");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Toolbar dropdown states
  const [isAlignmentDropdownOpen, setIsAlignmentDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  
  // Collaboration states
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [collaborationLoading, setCollaborationLoading] = useState(false);

  // Refs
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const yjsRef = useRef(null);
  const awarenessRef = useRef(null);

  // Constants
  const paperSizes = {
    Letter: { width: "8.5in", height: "11in" },
    Tabloid: { width: "11in", height: "17in" },
    Legal: { width: "8.5in", height: "14in" },
    Statement: { width: "5.5in", height: "8.5in" },
    Executive: { width: "7.25in", height: "10.5in" },
    A3: { width: "11.69in", height: "16.53in" },
    A4: { width: "8.27in", height: "11.69in" },
    A5: { width: "5.83in", height: "8.27in" },
    "B4 (JIS)": { width: "10.12in", height: "14.33in" },
    "B5 (JIS)": { width: "7.16in", height: "10.12in" },
    Custom: { width: "21cm", height: "29.7cm" },
  };

  const marginOptions = {
    Normal: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    Narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    Moderate: { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" },
    Wide: { top: "1in", right: "2in", bottom: "1in", left: "2in" },
    Mirrored: { top: "1in", right: "1.25in", bottom: "1in", left: "1.25in" },
    Custom: { top: "2.54cm", right: "2.54cm", bottom: "2.54cm", left: "2.54cm" },
  };

  // Initialize Yjs collaboration

  useEffect(() => {
    if (!file_uuid || !user || typeof window === "undefined") return;

    const initializeCollaboration = async () => {
      try {
        setCollaborationLoading(true);

        const providerData = getYjsProvider(file_uuid);
        if (!providerData) return;

        yjsRef.current = providerData;

        // Awareness
        awarenessRef.current = providerData.provider.awareness;
        const localUser = {
          id: user.id,           // use real user id
          name: user.name,
          color: "#3b82f6",
          avatar: user.profile_pic
        };
        awarenessRef.current.setLocalStateField("user", localUser);

        // Track connected users
        awarenessRef.current.on("change", () => {
          const states = Array.from(awarenessRef.current.getStates().values());
          const users = states
            .map(state => state.user)
            .filter(u => u && u.id)
            .map(u => ({
              id: u.id,
              name: u.name,
              color: u.color,
              avatar: u.avatar,
            }))
            .filter((u, index, self) => index === self.findIndex(x => x.id === u.id));

          setConnectedUsers(users);
        });

        // Online status
        providerData.provider.on("status", (event) => {
          setIsOnline(event.status === "connected");
        });

        setCollaborationEnabled(true);
        setCollaborationLoading(false);
      } catch (error) {
        console.error("Failed to initialize Yjs collaboration:", error);
        setCollaborationEnabled(false);
        setCollaborationLoading(false);
      }
    };

    initializeCollaboration();

    return () => cleanupCollaboration();
  }, [file_uuid, user]); // run only after user and file_uuid are available

  console.log(connectedUsers)

  const cleanupCollaboration = () => {
    if (yjsRef.current && file_uuid) {
      cleanupProvider(file_uuid);
      yjsRef.current = null;
      awarenessRef.current = null;
      setConnectedUsers([]);
      setCollaborationEnabled(false);
    }
  };

  // Set editor reference
  const setEditorReference = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // Formatting functions
  const applyBold = () => {
    editorRef.current?.chain().focus().toggleBold().run();
    handleEditorUpdate();
  };

  const applyItalic = () => {
    editorRef.current?.chain().focus().toggleItalic().run();
    handleEditorUpdate();
  };

  const applyUnderline = () => {
    editorRef.current?.chain().focus().toggleUnderline().run();
    handleEditorUpdate();
  };

  const applyAlignment = (alignment) => {
    editorRef.current?.chain().focus().setTextAlign(alignment).run();
    setSelectedAlignment(alignment);
    handleEditorUpdate();
  };

  const applyTextColor = (color) => {
    editorRef.current?.chain().focus().setColor(color).run();
    setSelectedTextColor(color);
    handleEditorUpdate();
  };

  const applyHighlightColor = (color) => {
    editorRef.current?.chain().focus().toggleHighlight({ color }).run();
    setSelectedHighlightColor(color);
    handleEditorUpdate();
  };

  const applyFontSize = (size) => {
    editorRef.current?.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
    setSelectedFontSize(size);
    handleEditorUpdate();
  };

  const applyPaperSize = (size) => {
    setSelectedPaperSize(size);
    handleEditorUpdate();
  };

  const applyMargin = (margin) => {
    setSelectedMargin(margin);
    handleEditorUpdate();
  };

  const applyFontFamily = (font) => {
    editorRef.current?.chain().focus().setFontFamily(font).run();
    setSelectedFont(font);
    handleEditorUpdate();
  };

  const applyList = (listType) => {
    if (listType === "bullet") {
      editorRef.current?.chain().focus().toggleBulletList().run();
    } else if (listType === "number") {
      editorRef.current?.chain().focus().toggleOrderedList().run();
    }
    handleEditorUpdate();
  };

  // Handle editor updates
  const handleEditorUpdate = () => {
    setSaveStatus('unsaved');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 2000);
  };

  // Download document function - ADDED THIS FUNCTION
  const downloadDocument = (format) => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.getText();
    const htmlContent = editorRef.current.getHTML();
    const docTitle = title || 'Document';
    
    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const fullHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: ${selectedFont}, Arial, sans-serif; 
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .tiptap-editor {
              max-width: ${paperSizes[selectedPaperSize].width};
              margin: 0 auto;
              padding: ${marginOptions[selectedMargin].top} ${marginOptions[selectedMargin].right} ${marginOptions[selectedMargin].bottom} ${marginOptions[selectedMargin].left};
              box-sizing: border-box;
            }
            @media print {
              @page {
                size: ${paperSizes[selectedPaperSize].width} ${paperSizes[selectedPaperSize].height};
                margin: 0;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="tiptap-editor">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([fullHtmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      window.print();
    }
    
    setIsDownloadDropdownOpen(false);
  };

  // Share document function - ADDED THIS FUNCTION
  const shareDocument = () => {
    const shareUrl = `${window.location.origin}/document/${file_uuid || 'new'}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Collaborate on this document with me!',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      cleanupCollaboration();
    };
  }, []);



  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <MobileHeader
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Desktop Header */}
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
          shareDocument={shareDocument}
        />

        {/* Toolbar */}
        <TiptapToolbar
          editor={editorRef.current}
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

        {/* TipTap Editor */}
        <div className="flex justify-center py-6 px-4">
          {collaborationEnabled && yjsRef.current ? (
            <TiptapEditor
              ref={setEditorReference}
              ydoc={yjsRef.current.doc}
              provider={yjsRef.current.provider}
              user={{
                id: `user-${Date.now()}`, // can be a real user id
                name: "Current User",
                color: "#3b82f6",
                avatar: user.profile_pic
              }}
              paperSize={paperSizes[selectedPaperSize]}
              margins={marginOptions[selectedMargin]}
              fontFamily={selectedFont}
              onUpdate={handleEditorUpdate}
            />
          ) : (
            <TiptapEditor
              ref={setEditorReference}
              paperSize={paperSizes[selectedPaperSize]}
              margins={marginOptions[selectedMargin]}
              fontFamily={selectedFont}
              onUpdate={handleEditorUpdate}
            />
          )}
        </div>

        {/* Collaboration Status Indicator */}
        {collaborationEnabled && connectedUsers.length > 0 && (
          <div className="flex gap-2 items-center mb-2 overflow-x-auto py-1 px-2">
            {connectedUsers && connectedUsers.map(user => (
              <div 
                key={user.id} 
                className="flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full shadow-sm"
              >
                {/* User Avatar */}
                <img
                  src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                />
                {/* User Name */}
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                {/* User Color Indicator */}
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color || "#ccc" }}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Logout Modal */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default CreateDocumentPage;