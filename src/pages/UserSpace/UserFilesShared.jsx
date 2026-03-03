import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar.jsx";
import AddMember from "../component/AddMember";
import { FiFileText, FiMenu, FiX, FiUpload, FiCopy } from "react-icons/fi";
import Logout from "../component/logout";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { useFileManager } from "../../hooks/useFileManager.js";
import { useFile } from "../../contexts/file/useFile";
import Button from "../component/button_2";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useNotification } from "../../contexts/notification/notificationContextProvider.js";

// ─── Helper Functions ────────────────────────────────────────────────────────

const FILE_TYPE_ICONS = {
  jsx: "⚛️",
  tsx: "🔷",
  js: "🟨",
  ts: "🔷",
  html: "🌐",
  htm: "🌐",
  css: "🎨",
  scss: "💅",
  sass: "💅",
  json: "📋",
  xml: "📄",
  doc: "📘",
  docx: "📘",
  pdf: "📕",
  txt: "📝",
  md: "📝",
  rtf: "📄",
  xls: "📗",
  xlsx: "📗",
  csv: "📗",
  ppt: "📙",
  pptx: "📙",
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  bmp: "🖼️",
  svg: "🖼️",
  webp: "🖼️",
  mp4: "🎥",
  avi: "🎥",
  mov: "🎥",
  wmv: "🎥",
  mkv: "🎥",
  mp3: "🎵",
  wav: "🎵",
  flac: "🎵",
  aac: "🎵",
  zip: "📦",
  rar: "📦",
  "7z": "📦",
  tar: "📦",
  gz: "📦",
  py: "🐍",
  java: "☕",
  php: "🐘",
  rb: "💎",
  go: "🐹",
  rs: "🦀",
  swift: "🍎",
  vue: "💚",
  svelte: "🧡",
  sql: "🗄️",
  db: "🗄️",
  sqlite: "🗄️",
  yml: "⚙️",
  yaml: "⚙️",
  env: "🔐",
  config: "⚙️",
};

const getFileExt = (name) => name?.split(".").pop()?.toLowerCase() || "";
const getFileTypeLetter = (name) => FILE_TYPE_ICONS[getFileExt(name)] ?? "📄";

const formatFileTitle = (filename) => {
  if (!filename) return "";
  const decoded = decodeURIComponent(filename);
  return decoded.split(".")[0].split("_")[0];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DeleteButton = ({ onClick, title, isDarkMode }) => (
  <div
    onClick={onClick}
    title={title}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 35,
      height: 35,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#991b1b" : "#ef4444",
      cursor: "pointer",
      transition: "background-color 0.3s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = isDarkMode
        ? "#b91c1c"
        : "#f87171")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = isDarkMode
        ? "#991b1b"
        : "#ef4444")
    }
  >
    <svg viewBox="0 0 39 7" fill="none" width={12} style={{ marginBottom: 1 }}>
      <line y1={5} x2={39} y2={5} stroke="white" strokeWidth={4} />
      <line x1={12} y1="1.5" x2={26} y2={1.5} stroke="white" strokeWidth={3} />
    </svg>
    <svg viewBox="0 0 33 39" fill="none" width={10}>
      <mask id="path-1-inside-1_8_19" fill="white">
        <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
      </mask>
      <path
        d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
        fill="white"
        mask="url(#path-1-inside-1_8_19)"
      />
      <path d="M12 6L12 29" stroke="white" strokeWidth={4} />
      <path d="M21 6V29" stroke="white" strokeWidth={4} />
    </svg>
  </div>
);

const DownloadButton = ({ onClick, title, isDarkMode }) => (
  <div
    onClick={onClick}
    title={title}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 35,
      height: 35,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#14532d" : "#22c55e",
      cursor: "pointer",
      transition: "background-color 0.3s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = isDarkMode
        ? "#166534"
        : "#16a34a")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = isDarkMode
        ? "#14532d"
        : "#22c55e")
    }
  >
    <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
      <path
        d="M12 3L12 15M12 15L8 11M12 15L16 11M3 17V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V17"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserFilesShared = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const {
    showGlobalNotification,
    hideGlobalNotification,
    updateNotificationData,
    updateNotificationMessage,
  } = useNotification();
  const { user, isLoading: userLoading } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    useJoinRequests,
    isLoading: spaceLoading,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace,
  } = useSpace();
  const { data: joinRequestsData = [] } = useJoinRequests(space_uuid || "");
  const {
    resources,
    files: contextFiles,
    uploadResource,
    isUploading,
    uploadProgress,
    refreshFiles,
  } = useFile();

  // Derived state
  const isValidUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      space_uuid,
    );
  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];
  const currentSpace = allSpaces.find((s) => s.space_uuid === space_uuid);
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const lastScrollY = useRef(0);

  // File/upload state
  const [showCreateUploadModal, setShowCreateUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [fileAlreadyExists, setFileAlreadyExists] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [lessonNameError, setLessonNameError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingLessonName, setPendingLessonName] = useState("");

  // Cover photo state
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [previousCoverPhotoUrl, setPreviousCoverPhotoUrl] = useState(null);
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPhotoPosition, setCoverPhotoPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const [showCoverPhotoConfirm, setShowCoverPhotoConfirm] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const coverPhotoEditorRef = useRef(null);

  // Gradient color options for cover photo
  const colorOptions = [
    "linear-gradient(45deg, #FFC107, #FF5722)",
    "linear-gradient(45deg, #3F51B5, #2196F3)",
    "linear-gradient(45deg, #9C27B0, #673AB7)",
    "linear-gradient(45deg, #E91E63, #F44336)",
    "linear-gradient(45deg, #4CAF50, #8BC34A)",
    "linear-gradient(45deg, #FF9800, #FFC107)",
    "linear-gradient(45deg, #00BCD4, #009688)",
    "linear-gradient(45deg, #795548, #607D8B)",
  ];

  // Scroll hide/show header
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowHeader(!(y > lastScrollY.current && y > 50));
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load saved cover photo on component mount
  useEffect(() => {
    const savedCoverPhoto = localStorage.getItem(`coverPhoto_${space_uuid}`);
    if (savedCoverPhoto) {
      setCoverPhotoUrl(savedCoverPhoto);
    }
  }, [space_uuid]);

  // Save cover photo to localStorage when it changes
  useEffect(() => {
    if (coverPhotoUrl && !showCoverPhotoEditor) {
      localStorage.setItem(`coverPhoto_${space_uuid}`, coverPhotoUrl);
      // Dispatch custom event to notify HomePage
      window.dispatchEvent(new CustomEvent('coverPhotoUpdated'));
    }
  }, [coverPhotoUrl, space_uuid, showCoverPhotoEditor]);

  // Cover photo drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPosition(coverPhotoPosition);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - dragStartY;
    const containerHeight = coverPhotoEditorRef.current?.offsetHeight || 400;
    const positionChange = (deltaY / containerHeight) * 100;
    const newPosition = Math.max(0, Math.min(100, dragStartPosition - positionChange));
    
    setCoverPhotoPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  // Cover photo handlers
  const handleCoverPhotoClick = () => {
    if (isOwnerSpace) {
      coverPhotoInputRef.current?.click();
    }
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        addNotification({
          type: "error",
          title: "Invalid File",
          message: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
          duration: 3000,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File Too Large",
          message: "Please upload an image smaller than 5MB",
          duration: 3000,
        });
        return;
      }

      setCoverPhoto(file);

      // Create preview and open editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
        setCoverPhotoUrl(e.target.result);
        setShowCoverPhotoEditor(true);
        setCoverPhotoPosition(50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoSave = () => {
    setShowCoverPhotoConfirm(true);
  };

  const handleConfirmCoverPhoto = () => {
    // Check if it's a gradient or an image
    if (coverPhotoUrl && coverPhotoUrl.includes('gradient')) {
      // For gradients, save directly without canvas transformations
      localStorage.setItem(`coverPhoto_${space_uuid}`, coverPhotoUrl);
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);
      
      // Dispatch custom event to notify HomePage
      window.dispatchEvent(new CustomEvent('coverPhotoUpdated'));
      
      addNotification({
        type: "success",
        title: "Cover Photo Updated",
        message: "Your cover photo has been updated successfully!",
        duration: 3000,
      });
    } else {
      // For images, create canvas to apply transformations
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to cover photo dimensions
        canvas.width = 1200;
        canvas.height = 400;
        
        // Calculate scale to cover the entire canvas
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Calculate position based on user vertical positioning
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);
        
        // Draw the image with transformations
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to data URL and update
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCoverPhotoUrl(dataUrl);
        
        // Save to localStorage
        localStorage.setItem(`coverPhoto_${space_uuid}`, dataUrl);
        
        // Dispatch custom event to notify HomePage
        window.dispatchEvent(new CustomEvent('coverPhotoUpdated'));
        
        setShowCoverPhotoEditor(false);
        setShowCoverPhotoConfirm(false);
        
        addNotification({
          type: "success",
          title: "Cover Photo Updated",
          message: "Your cover photo has been updated successfully!",
          duration: 3000,
        });
      };
      
      img.src = coverPhotoUrl;
    }
  };

  const handleCancelCoverPhoto = () => {
    setShowCoverPhotoConfirm(false);
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setCoverPhoto(null);
    // Restore previous cover photo URL
    setCoverPhotoUrl(previousCoverPhotoUrl);
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  // Handle gradient selection for cover photo
  const handleGradientSelection = (gradient) => {
    setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
    setCoverPhotoUrl(gradient);
    setShowCoverPhotoConfirm(true); // Show confirmation dialog for gradients
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  const resetCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoPosition(50);
    // Remove from localStorage
    localStorage.removeItem(`coverPhoto_${space_uuid}`);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  if (userLoading || spaceLoading)
    return (
      <div className="flex h-screen justify-center items-center">
        Loading...
      </div>
    );
  if (!isValidUuid || !currentSpace)
    return (
      <div
        className="flex h-screen justify-center items-center"
        style={{ color: currentColors.text }}
      >
        Space not found
      </div>
    );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const checkFileExists = (name) =>
    resources?.some((r) =>
      r.file_name.toLowerCase().includes(name.toLowerCase()),
    );

  const initiateUpload = (files) => {
    if (!files?.length) return;
    if (files.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }
    setPendingFiles(Array.from(files));
    setPendingLessonName(lessonName);
    setFileAlreadyExists(checkFileExists(files[0].name));
    setShowUploadConfirmation(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    initiateUpload(e.dataTransfer.files);
  };
  const handleFileChange = (e) => initiateUpload(e.target.files);

  const clearPending = () => {
    setShowUploadConfirmation(false);
    setPendingFiles([]);
    setPendingLessonName("");
    setFileAlreadyExists(false);
    const inp = document.getElementById("file-upload");
    if (inp) inp.value = "";
  };

  const confirmUpload = async () => {
    if (!pendingLessonName.trim()) {
      setLessonNameError("Lesson name is required");
      setShowUploadConfirmation(false);
      return;
    }
    setShowUploadConfirmation(false);
    setShowCreateUploadModal(false);
    setLessonName(pendingLessonName);
    setLessonNameError("");
    await handleUploadFile(pendingFiles[0]);
    clearPending();
  };

  const handleUploadFile = async (file, retryCount = 0) => {
    const maxRetries = 3;
    let notifId = null;
    try {
      notifId = showGlobalNotification({
        type: "loading",
        title: "Uploading File",
        message: `Uploading please wait`,
        duration: null,
        persistent: true,
      });
      const result = await uploadResource([file], space_uuid, lessonName);
      if (currentSpace?.space_id) await refreshFiles(space_uuid);
      updateNotificationData(notifId, { progress: 100, status: "completed" });
      showGlobalNotification({
        type: "success",
        title: "Upload Complete",
        message: `"Resources uploaded successfully.`,
        duration: 3000,
        actions: [
          {
            label: "View File",
            variant: "primary",
            onClick: () => {
              navigate(
                `/space/${space_uuid}/${space_name}/files/${file.file_name}/${result[0]?.id || "unknown"}`,
              );
              hideGlobalNotification();
            },
          },
          {
            label: "Close",
            variant: "secondary",
            onClick: () => hideGlobalNotification(),
          },
        ],
      });
    } catch (err) {
      if (retryCount < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000));
        return handleUploadFile(file, retryCount + 1);
      }
      showGlobalNotification({
        type: "error",
        title: "Upload Failed",
        message: `Failed to upload "${file.file_name}". ${err.message}`,
        duration: null,
        persistent: true,
        actions: [
          {
            label: "Retry",
            variant: "primary",
            onClick: () => {
              hideGlobalNotification();
              handleUploadFile(file, 0);
            },
          },
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => hideGlobalNotification(),
          },
        ],
      });
    }
  };

  const handleOpenFile = (file) =>
    navigate( 
      `/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.orig_file_name)}/${file.file_id}`,
    );

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteWarning(true);
  };
  const cancelDeleteFile = () => {
    setShowDeleteWarning(false);
    setFileToDelete(null);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    showGlobalNotification({
      type: "loading",
      title: "Deleting File",
      message: `Deleting "${fileToDelete.name}"...`,
      duration: null,
      persistent: true,
    });
    setShowDeleteWarning(false);
    try {
      await new Promise((r) => setTimeout(r, 1500)); // replace with real delete call
      if (currentSpace?.space_id) await refreshFiles(space_uuid);
      showGlobalNotification({
        type: "success",
        title: "File Deleted",
        message: `"${fileToDelete.name}" removed.`,
        duration: 4000,
      });
    } catch (err) {
      showGlobalNotification({
        type: "error",
        title: "Delete Failed",
        message: `Failed to delete "${fileToDelete.name}".`,
        duration: 5000,
      });
    }
    setFileToDelete(null);
  };

  const handleDownloadFile = async (file) => {
    showGlobalNotification({
      type: "loading",
      title: "Downloading",
      message: `Downloading "${file.file_name}"...`,
      duration: null,
      persistent: true,
    });
    try {
      const a = document.createElement("a");
      a.href = file.file_url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showGlobalNotification({
        type: "success",
        title: "Download Started",
        message: `"${file.file_name}" download started.`,
        duration: 4000,
      });
    } catch (err) {
      showGlobalNotification({
        type: "error",
        title: "Download Failed",
        message: `Failed to download "${file.file_name}".`,
        duration: 5000,
      });
    }
  };

  const handleDeleteRoom = () => {
    if (currentSpace) setShowDeleteDialog(true);
  };
  const confirmDeleteRoom = async () => {
    if (!currentSpace) return;
    setShowDeleteDialog(false);
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      navigate("/space");
    } catch (err) {
      alert("Failed to delete space. Please try again.");
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch(() => {
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Group resources by lesson name (stored in file.name prefix before the last "-filename" segment)
  // Assumes file name format: "timestamp-lessonname-originalfile.ext"
  // We'll group by the lesson_name field if available, else show ungrouped
  const groupedByLesson = (resources || []).reduce((acc, file) => {
    const lesson = file.lesson_name || "Uncategorized";
    if (!acc[lesson]) acc[lesson] = [];
    acc[lesson].push(file);
    return acc;
  }, {});

  const c = currentColors; // shorthand

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ backgroundColor: c.background, color: c.text }}
    >
      {/* SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
        style={{ backgroundColor: c.surface }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN */}
      <div
        className="flex-1 flex flex-col w-full"
        style={{ backgroundColor: c.background }}
      >
        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{ backgroundColor: c.surface, borderColor: c.border }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: c.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>
        <div className="lg:hidden h-16" />

        {/* COVER */}
        <div 
          className="relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          onClick={handleCoverPhotoClick}
        >
          {coverPhotoUrl ? (
            <>
              {coverPhotoUrl.includes('gradient') ? (
                <div
                  className="w-full h-full"
                  style={{ background: coverPhotoUrl }}
                />
              ) : (
                <img 
                  src={coverPhotoUrl} 
                  alt="Space Cover" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
              {isOwnerSpace && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Change Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className="absolute inset-0 bg-black/30" />
              {isOwnerSpace && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Upload Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          )}
          {isOwnerSpace && (
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          )}
        </div>

        <div className="p-4 sm:p-6">
          {/* DESKTOP TITLE */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: c.textSecondary }}>
                (
                {currentSpace?.space_type === "course"
                  ? currentSpace?.members?.length - 1 + " student(s)"
                  : (currentSpace?.members?.length || 0) + " member(s)"}
                )
              </span>
              {isOwnerSpace && (
                <>
                  <div onClick={() => setShowInvitePopup(true)}>
                    <Button text="Add Member" />
                  </div>
                  <div onClick={() => setShowPendingInvitations(true)}>
                    <Button text="Pending Invites" />
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
              )}
              {isFriendSpace && (
                <div
                  className="flex items-center gap-2 p-2 rounded-md"
                  style={{ backgroundColor: c.surface }}
                >
                  <span
                    className="text-xs break-all"
                    style={{ color: c.accent }}
                  >
                    {currentSpace?.space_link || "Loading..."}
                  </span>
                  <button
                    onClick={() => handleCopyLink(currentSpace?.space_link)}
                    className="p-1 rounded"
                    style={{
                      color: c.textSecondary,
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = c.hover;
                      e.currentTarget.style.color = c.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = c.textSecondary;
                    }}
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div
            className="w-full overflow-x-auto border-b pb-4 mb-6"
            style={{ borderColor: c.border }}
          >
            <div className="flex justify-center space-x-12 min-w-max mx-auto px-4">
              {[
                {
                  label: "Stream",
                  path: `/space/${space_uuid}/${space_name}`,
                },
                {
                  label: "Tasks",
                  path: `/space/${space_uuid}/${space_name}/tasks`,
                },
                { label: "Files", path: null },
                {
                  label: "People",
                  path: `/space/${space_uuid}/${space_name}/people`,
                },
              ].map(({ label, path }) =>
                path ? (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="transition"
                    style={{ color: c.textSecondary }}
                    onMouseEnter={(e) => (e.target.style.color = c.text)}
                    onMouseLeave={(e) =>
                      (e.target.style.color = c.textSecondary)
                    }
                  >
                    {label}
                  </button>
                ) : (
                  <button
                    key={label}
                    className="font-semibold border-b-2 pb-2"
                    style={{ borderColor: c.text }}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* MOBILE OWNER BUTTONS */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <div onClick={() => setShowInvitePopup(true)}>
                <Button text="Add Member" />
              </div>
              <div onClick={() => setShowPendingInvitations(true)}>
                <Button text="Pending Invites" />
              </div>
              <div onClick={handleDeleteRoom}>
                <Button text="Delete Room" />
              </div>
            </div>
          )}

          {/* FILES SECTION */}
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-4">
              {isOwnerSpace && (
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563eb")
                  }
                  onClick={() => setShowCreateUploadModal(true)}
                >
                  <FiFileText size={16} /> Upload Resources
                </button>
              )}
            </div>

            {/* FILE CARDS */}
            <div
              className="rounded-xl p-4 sm:p-6 border"
              style={{
                backgroundColor: c.surface,
                borderColor: isDarkMode ? c.border : "#000000",
              }}
            >
              {!resources || resources.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: c.textSecondary }}
                >
                  <FiFileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files uploaded yet.</p>
                </div>
              ) : (
                (() => {
                  // Flatten all files, limit to 5 for preview
                  const allFiles = resources || [];
                  const previewFiles = allFiles.slice(0, 5);
                  // Re-group only the preview files by lesson
                  const previewGrouped = previewFiles.reduce((acc, file) => {
                    const lesson = file.lesson_name || "Uncategorized";
                    if (!acc[lesson]) acc[lesson] = [];
                    acc[lesson].push(file);
                    return acc;
                  }, {});

                  return (
                    <>
                      {Object.entries(previewGrouped).map(
                        ([lesson, lessonFiles]) => (
                          <div key={lesson}>
                            {/* ── File Cards ── */}
                            {lessonFiles.map((file, idx) => {
                              const displayName =
                                formatFileTitle(file.file_name) ||
                                file.file_name;
                              const ext = getFileExt(
                                file.file_name,
                              ).toUpperCase();

                              return (
                                <div
                                  key={idx}
                                  className="border rounded-lg mb-2 overflow-hidden"
                                  style={{
                                    backgroundColor: c.background,
                                    borderColor: c.border,
                                  }}
                                >
                                  {/* ── Lesson Name — top left of every card ── */}
                                  <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
                                    <span
                                      className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                                      style={{
                                        backgroundColor: isDarkMode
                                          ? "#1e3a8a"
                                          : "#dbeafe",
                                        color: isDarkMode
                                          ? "#93c5fd"
                                          : "#1d4ed8",
                                      }}
                                    >
                                      Lesson
                                    </span>
                                    <span
                                      className="text-xs font-semibold"
                                      style={{
                                        color: isDarkMode
                                          ? "#93c5fd"
                                          : "#1d4ed8",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: "70%",
                                      }}
                                      title={lesson}
                                    >
                                      {lesson}
                                    </span>
                                  </div>

                                  {/* thin divider */}
                                  <div
                                    style={{
                                      height: 1,
                                      backgroundColor: c.border,
                                      margin: "0 12px",
                                    }}
                                  />

                                  {/* ── MOBILE layout ── */}
                                  <div className="sm:hidden p-3 pt-2">
                                    {/* File icon + name */}
                                    <div
                                      className="flex items-center gap-3 mb-3 cursor-pointer"
                                      onClick={() => handleOpenFile(file)}
                                    >
                                      <div
                                        className="flex items-center justify-center rounded-md flex-shrink-0"
                                        style={{
                                          width: 40,
                                          height: 40,
                                          backgroundColor: c.surface,
                                          border: `2px solid ${c.border}`,
                                        }}
                                      >
                                        <span className="text-base">
                                          {getFileTypeLetter(file.file_name)}
                                        </span>
                                      </div>
                                      <span
                                        className="text-sm font-semibold"
                                        style={{
                                          color: c.text,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          flex: 1,
                                          minWidth: 0,
                                        }}
                                        title={displayName}
                                      >
                                        {displayName}
                                      </span>
                                    </div>

                                    {/* meta + actions pinned to bottom-right */}
                                    <div className="flex items-end justify-between">
                                      <div className="flex flex-col gap-0.5">
                                        <span
                                          className="text-xs"
                                          style={{ color: c.textSecondary }}
                                        >
                                          {ext} · {formatSize(file.file_size)}
                                        </span>
                                        <span
                                          className="text-xs"
                                          style={{ color: c.textSecondary }}
                                        >
                                          {formatDate(file.created_at)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <DownloadButton
                                          isDarkMode={isDarkMode}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(file);
                                          }}
                                          title="Download"
                                        />
                                        {isOwnerSpace && (
                                          <DeleteButton
                                            isDarkMode={isDarkMode}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteFile(file);
                                            }}
                                            title="Delete"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* ── DESKTOP layout ── */}
                                  <div className="hidden sm:flex items-center px-3 py-2.5 gap-2">
                                    {/* File Name */}
                                    <div
                                      className="flex items-center gap-2 cursor-pointer min-w-0"
                                      style={{ flex: "3 1 0%" }}
                                      onClick={() => handleOpenFile(file)}
                                    >
                                      <div
                                        className="flex items-center justify-center rounded-md flex-shrink-0"
                                        style={{
                                          width: 32,
                                          height: 32,
                                          backgroundColor: c.surface,
                                          border: `2px solid ${c.border}`,
                                        }}
                                      >
                                        <span className="text-xs">
                                          {getFileTypeLetter(file.file_name)}
                                        </span>
                                      </div>
                                      <span
                                        className="text-sm font-medium"
                                        style={{
                                          color: c.text,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                        title={displayName}
                                      >
                                        {displayName}
                                      </span>
                                    </div>
                                    {/* Type */}
                                    <div
                                      className="text-sm"
                                      style={{
                                        flex: "1 1 0%",
                                        minWidth: 60,
                                        color: c.textSecondary,
                                      }}
                                    >
                                      {ext}
                                    </div>
                                    {/* Date Posted */}
                                    <div
                                      className="text-sm"
                                      style={{
                                        flex: "2 1 0%",
                                        minWidth: 120,
                                        color: c.textSecondary,
                                      }}
                                    >
                                      {formatDate(file.created_at)}
                                    </div>
                                    {/* Size */}
                                    <div
                                      className="text-sm"
                                      style={{
                                        flex: "1 1 0%",
                                        minWidth: 60,
                                        color: c.textSecondary,
                                      }}
                                    >
                                      {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'Unknown size'}
                                    </div>
                                    {/* Actions */}
                                    <div
                                      className="flex items-center gap-2 justify-end"
                                      style={{ flex: "1 1 0%", minWidth: 90 }}
                                    >
                                      <DownloadButton
                                        isDarkMode={isDarkMode}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadFile(file);
                                        }}
                                        title="Download"
                                      />
                                      {isOwnerSpace && (
                                        <DeleteButton
                                          isDarkMode={isDarkMode}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(file);
                                          }}
                                          title="Delete"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ),
                      )}

                      {/* View All Files button — only shown when there are more than 5 files */}
                      {allFiles.length > 5 && (
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/files/${space_name}/${space_uuid}`,
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: "transparent",
                              color: isDarkMode ? "#93c5fd" : "#2563eb",
                              border: `1px solid ${isDarkMode ? "#1e40af" : "#bfdbfe"}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? "#1e3a8a"
                                : "#eff6ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            View All Files
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ pointerEvents: "none" }}
                            >
                              <path d="M5 12h14" />
                              <path d="M13 6l6 6-6 6" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* PENDING INVITATIONS */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: c.surface }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: c.border }}
            >
              <h2 className="text-lg font-semibold" style={{ color: c.text }}>
                Pending Invitations
              </h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                style={{
                  color: c.textSecondary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: c.textSecondary }}
                >
                  No pending invitations
                </p>
              ) : (
                joinRequestsData.map((inv) => (
                  <div
                    key={inv.account_id}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: c.background }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={inv.profile_pic}
                        alt={inv.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{inv.fullname}</h3>
                        <p
                          className="text-sm"
                          style={{ color: c.textSecondary }}
                        >
                          {inv.email}
                        </p>
                        <p className="text-sm mt-1">
                          {inv.message || "Hello world"}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: c.textSecondary }}
                        >
                          {inv.added_at}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() => handleDeclineJoinRequest(inv.account_id)}
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptJoinRequest(inv.account_id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER */}
      <AddMember
        currentSpace={currentSpace}
        onInviteMember={() => {}}
        showInvitePopup={showInvitePopup}
        setShowInvitePopup={setShowInvitePopup}
      />

      {/* UPLOAD MODAL */}
      {showCreateUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: c.surface }}
          >
            <button
              onClick={() => {
                setShowCreateUploadModal(false);
                setLastUploadedFile(null);
                setLessonName("");
                setLessonNameError("");
              }}
              className="absolute top-4 right-4 rounded-full p-1"
              style={{
                backgroundColor: c.background,
                color: c.textSecondary,
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiX size={24} />
            </button>
            <div className="p-6 pt-12">
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: c.text }}
              >
                Upload Lesson
              </h2>

              {/* Lesson Name Input */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: c.text }}
                >
                  Lesson Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => {
                    setLessonName(e.target.value);
                    if (lessonNameError) setLessonNameError("");
                  }}
                  placeholder="Enter lesson name"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors"
                  style={{
                    backgroundColor: c.background,
                    color: c.text,
                    borderColor: lessonNameError ? "#ef4444" : c.border,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = lessonNameError
                      ? "#ef4444"
                      : c.border)
                  }
                />
                {lessonNameError && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                    {lessonNameError}
                  </p>
                )}
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition"
                style={{
                  borderColor: dragActive ? "#3b82f6" : c.border,
                  backgroundColor: dragActive ? "#eff6ff" : c.background,
                }}
                onClick={() =>
                  !lastUploadedFile &&
                  document.getElementById("file-upload").click()
                }
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                {lastUploadedFile ? (
                  <div className="text-center">
                    <span className="text-4xl">
                      {getFileTypeLetter(lastUploadedFile.name)}
                    </span>
                    <h3
                      className="text-lg font-semibold mt-3 mb-1"
                      style={{ color: c.text }}
                    >
                      {fileAlreadyExists
                        ? "File Already Exists"
                        : "File Ready!"}
                    </h3>
                    <p className="text-sm" style={{ color: c.text }}>
                      {lastUploadedFile.name}
                    </p>
                    {fileAlreadyExists && (
                      <>
                        <p
                          className="text-sm mt-2"
                          style={{ color: "#ef4444" }}
                        >
                          This file already exists in the space.
                        </p>
                        <button
                          className="mt-3 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLastUploadedFile(null);
                            setFileAlreadyExists(false);
                          }}
                        >
                          <FiUpload size={16} /> Upload Different File
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <FiUpload
                      size={32}
                      className="mx-auto mb-3"
                      style={{ color: c.textSecondary }}
                    />
                    <p className="font-medium" style={{ color: c.text }}>
                      Choose a file or drag & drop it here.
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: c.textSecondary }}
                    >
                      DOCS, PDF, PPT AND EXCEL, UP TO 50 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE FILE WARNING */}
      {showDeleteWarning && fileToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg p-6 max-w-sm w-full"
            style={{ backgroundColor: c.surface }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: c.text }}
            >
              Delete File
            </h3>
            <p className="text-sm mb-6" style={{ color: c.textSecondary }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: c.text }}>"{fileToDelete.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: c.background,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                <FiX size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD CONFIRMATION */}
      {showUploadConfirmation && pendingFiles.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{ backgroundColor: c.surface }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: c.text }}>
                {fileAlreadyExists ? "File Already Exists" : "Confirm Upload"}
              </h3>
              <button
                onClick={clearPending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: c.textSecondary,
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">
                {getFileTypeLetter(pendingFiles[0].name)}
              </span>
              <div>
                <p className="font-semibold" style={{ color: c.text }}>
                  {pendingFiles[0].name}
                </p>
                <p className="text-sm" style={{ color: c.textSecondary }}>
                  {(pendingFiles[0].size / 1024).toFixed(0)} KB ·{" "}
                  {getFileExt(pendingFiles[0].name).toUpperCase()}
                </p>
              </div>
            </div>

            {fileAlreadyExists && (
              <div
                className="p-3 rounded-lg mb-4"
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <p className="text-sm" style={{ color: "#dc2626" }}>
                  ⚠️ This file already exists. Uploading will create a
                  duplicate.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: c.text }}
              >
                Lesson Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={pendingLessonName}
                onChange={(e) => setPendingLessonName(e.target.value)}
                placeholder="Enter lesson name"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none border"
                style={{
                  backgroundColor: c.background,
                  color: c.text,
                  borderColor: c.border,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = c.border)}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={clearPending}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: c.background,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={!pendingLessonName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: pendingLessonName.trim()
                    ? "#2563eb"
                    : "#9ca3af",
                  color: "#fff",
                  border: "none",
                  cursor: pendingLessonName.trim() ? "pointer" : "not-allowed",
                }}
              >
                <FiUpload size={16} />{" "}
                {fileAlreadyExists ? "Upload Anyway" : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SPACE DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteRoom}
        space={
          currentSpace || {
            space_name: "Unknown Space",
            members: [],
            files: [],
            tasks: [],
          }
        }
      />

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Change Cover Photo</h2>
              <button
                onClick={handleCoverPhotoCancel}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Gradient Options */}
              <div className="mb-6">
                <p className="text-sm font-medium text-white mb-3">Color & Gradient</p>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded cursor-pointer border-2 border-gray-600 hover:border-blue-500 transition-colors"
                      style={{ background: color }}
                      onClick={() => handleGradientSelection(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Image Positioning (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-white mb-3">Position Image</p>
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      ref={coverPhotoEditorRef}
                      className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                      style={{
                        backgroundImage: `url(${coverPhotoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: `center ${coverPhotoPosition}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                      onMouseDown={handleMouseDown}
                    />
                    <div className="absolute inset-0 border-2 border-white/30 pointer-events-none" />
                    {isDragging && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        Dragging...
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Click and drag the image up or down to position it
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCoverPhotoCancel}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <button
                  onClick={handleCoverPhotoSave}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COVER PHOTO CONFIRMATION DIALOG */}
      {showCoverPhotoConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Change Cover Photo?</h2>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300">
                Do you want to change the cover photo for this space with the image you uploaded?
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCancelCoverPhoto}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCoverPhoto}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilesShared;
