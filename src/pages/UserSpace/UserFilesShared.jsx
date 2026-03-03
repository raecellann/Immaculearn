import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import AddMember from "../component/AddMember";
import { FiCopy, FiFileText, FiMenu, FiX, FiUpload } from "react-icons/fi";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import Button from "../component/button_2";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { useFileManager } from "../../hooks/useFileManager.js";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/spaceThemeContextProvider";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { toast } from "react-toastify";

// Hardcoded lesson data for demonstration
export const hardcodedLessons = [
  { id: 1, name: "Module 1: Introduction to React", description: "Basic React concepts and components" },
  { id: 2, name: "Module 2: State and Props", description: "Managing component state and passing props" },
  { id: 3, name: "Module 3: React Hooks", description: "Using useState, useEffect, and custom hooks" },
  { id: 4, name: "Module 4: Component Lifecycle", description: "Understanding component lifecycle methods" },
  { id: 5, name: "Module 5: Routing in React", description: "Implementing navigation with React Router" },
  { id: 6, name: "Module 6: Forms and Validation", description: "Building forms with validation" },
  { id: 7, name: "Module 7: Redux Integration", description: "State management with Redux" },
  { id: 8, name: "Module 8: Testing React Apps", description: "Unit and integration testing" }
];

const UserFilesShared = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const { addNotification } = useNotification();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [joinRequestsData, setJoinRequestsData] = useState([]);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const lastScrollY = useRef(0);

  // File upload states
  const [showCreateUploadModal, setShowCreateUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Prof-style upload states
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [fileAlreadyExists, setFileAlreadyExists] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Lesson name states (from ProfFilesShared)
  const [lessonName, setLessonName] = useState("");
  const [lessonNameError, setLessonNameError] = useState("");

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

  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();

  const { user, isLoading } = useUser();
  const {
    userSpaces,
    friendSpaces,
    courseSpaces,
    deleteSpace,
    acceptJoinRequest,
    declineJoinRequest,
  } = useSpace();

  /* ================= SPACE & OWNER LOGIC ================= */
  const allSpaces = [
    ...(userSpaces || []),
    ...(friendSpaces || []),
    ...(courseSpaces || []),
  ];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  const isOwnerSpace = currentSpace?.creator === user?.id;
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const isFriendSpace = !isOwnerSpace;

  /* ================= FILE TYPE HELPERS ================= */
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const getFileTypeLetter = (fileName) => {
    if (!fileName) return "📄";
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jsx": return "⚛️";
      case "tsx": return "🔷";
      case "js": return "🟨";
      case "ts": return "🔷";
      case "html": case "htm": return "🌐";
      case "css": return "🎨";
      case "scss": case "sass": return "💅";
      case "json": return "📋";
      case "xml": return "📄";
      case "doc": case "docx": return "📘";
      case "pdf": return "📕";
      case "txt": case "md": return "📝";
      case "rtf": return "📄";
      case "xls": case "xlsx": case "csv": return "📗";
      case "ppt": case "pptx": return "📙";
      case "jpg": case "jpeg": case "png": case "gif":
      case "bmp": case "svg": case "webp": case "ico": return "🖼️";
      case "mp4": case "avi": case "mov": case "wmv":
      case "flv": case "webm": case "mkv": return "🎥";
      case "mp3": case "wav": case "flac": case "aac":
      case "ogg": case "m4a": return "🎵";
      case "zip": case "rar": case "7z": case "tar": case "gz": return "📦";
      case "yml": case "yaml": case "config": case "conf": case "ini": return "⚙️";
      case "env": return "🔐";
      case "sql": case "db": case "sqlite": return "🗄️";
      case "ttf": case "otf": case "woff": case "woff2": return "🔤";
      case "py": return "🐍";
      case "java": return "☕";
      case "cpp": case "c++": case "c": return "⚙️";
      case "php": return "🐘";
      case "rb": return "💎";
      case "go": return "🐹";
      case "rs": return "🦀";
      case "swift": return "🍎";
      case "kt": case "dart": return "🎯";
      case "vue": return "💚";
      case "svelte": return "🧡";
      case "psd": case "ai": case "fig": case "sketch": return "🎨";
      default: return "📄";
    }
  };

  const checkFileExists = (fileName) => {
    return files?.some((resource) =>
      resource.filename?.toLowerCase().includes(fileName.toLowerCase())
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  /* ================= DRAG & DROP ================= */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileExists = checkFileExists(droppedFile.name);
      setFileAlreadyExists(fileExists);
      setLastUploadedFile(droppedFile);
      setUploadedFiles([]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFileObj = e.target.files[0];
      const fileExists = checkFileExists(selectedFileObj.name);
      setFileAlreadyExists(fileExists);
      setLastUploadedFile(selectedFileObj);
      setUploadedFiles([]);
    }
  };

  /* ================= RESET MODAL ================= */
  const resetUploadModal = () => {
    setShowCreateUploadModal(false);
    setLastUploadedFile(null);
    setFileAlreadyExists(false);
    setUploadedFiles([]);
    setLessonName("");
    setLessonNameError("");
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  /* ================= FILE ACTIONS ================= */
  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFileOptions(true);
  };

  const handleOpenFile = (file) => {
    const url = `/space/${space_uuid}/${space_name}/files/${file.file_uuid}/${file.filename}`;
    navigate(url);
    setShowFileOptions(false);
  };

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteWarning(true);
    setShowFileOptions(false);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      // Add your actual delete API call here
      // await deleteFile(fileToDelete.file_uuid, space_uuid);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`"${fileToDelete.filename}" deleted successfully!`);
      setShowDeleteWarning(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(`Failed to delete "${fileToDelete.filename}". Please try again.`);
    }
  };

  const cancelDeleteFile = () => {
    setShowDeleteWarning(false);
    setFileToDelete(null);
  };

  const handleDownloadFile = async (file) => {
    try {
      toast.info(`Downloading "${file.filename}"...`);
      // Add your actual download logic here
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download "${file.filename}".`);
    }
  };

  const handleCreateFile = () => {
    if (!fileName.trim()) {
      toast.error("File title is required");
      return;
    }
    create.mutate(
      {
        title: fileName,
        space_id: currentSpace?.space_id ?? null,
        owner_id: user?.id ?? null,
        content: "",
      },
      {
        onSuccess: (newFile) => {
          toast.success(`File "${fileName}" created successfully!`, {
            duration: 3000,
            position: "top-center",
          });
          const url = `/space/${space_uuid}/${space_name}/files/${newFile.fuuid}/${newFile.title}`;
          navigate(url);
          setFileName("");
          setIsCreatingFile(false);
          setShowCreateUploadModal(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(err?.message || "Failed to create file");
        },
      },
    );
  };

  /* ================= CUSTOM BUTTON COMPONENTS ================= */
  const DeleteButton = ({ onClick, title, className = "", style = {} }) => (
    <div
      className={`bin-button ${className}`}
      onClick={onClick}
      title={title}
      style={style}
    >
      <svg className="bin-top" viewBox="0 0 39 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line y1={5} x2={39} y2={5} stroke="white" strokeWidth={4} />
        <line x1={12} y1="1.5" x2={26.0357} y2={1.5} stroke="white" strokeWidth={3} />
      </svg>
      <svg className="bin-bottom" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_8_19" fill="white">
          <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
        </mask>
        <path d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z" fill="white" mask="url(#path-1-inside-1_8_19)" />
        <path d="M12 6L12 29" stroke="white" strokeWidth={4} />
        <path d="M21 6V29" stroke="white" strokeWidth={4} />
      </svg>
    </div>
  );

  const DownloadButton = ({ onClick, title, className = "" }) => (
    <button
      onClick={onClick}
      title={title}
      className={`transition-all duration-300 flex items-center justify-center ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "35px",
        height: "35px",
        borderRadius: "10px",
        backgroundColor: isDarkMode ? "#1e40af" : "#3b82f6",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#2563eb" : "#60a5fa"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#1e40af" : "#3b82f6"; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.9)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L12 14M12 14L8 10M12 14L16 10M3 17V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  /* ================= SCROLL HANDLER ================= */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    // Create canvas to apply transformations
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
    setShowCoverPhotoEditor(false); // Close editor since gradients don't need positioning
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

  const { list, create } = useFileManager(currentSpace?.space_id || null);
  const files = list?.data || [];

  const handleInviteMember = () => setShowInvitePopup(true);

  const handleDeleteRoom = async () => {
    if (!currentSpace) return;
    setDialogMessage(currentSpace.space_name);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentSpace || !showDeleteDialog) return;
    setShowDeleteDialog(false);
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
  };

  const handleCancelDelete = () => setShowDeleteDialog(false);

  const handleAcceptJoinRequest = async (userId) => {
    try { await acceptJoinRequest(userId, space_uuid); }
    catch (error) { console.error("Failed to accept join request:", error); }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try { await declineJoinRequest(userId, space_uuid); }
    catch (error) { console.error("Failed to decline join request:", error); }
  };

  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  const handleCopyLink = (space_link) => {
    navigator.clipboard.writeText(space_link)
      .then(() => { setCopyFeedback("Copied!"); setTimeout(() => setCopyFeedback(""), 2000); })
      .catch((err) => { console.error("Failed to copy: ", err); setCopyFeedback("Error!"); setTimeout(() => setCopyFeedback(""), 2000); });
  };

  const formatFileTitle = (filename) => {
    if (!filename) return "";
    const decodedFileName = decodeURIComponent(filename);
    const nameWithoutExtension = decodedFileName.split(".")[0];
    const cleanTitle = nameWithoutExtension.split("_")[0];
    return cleanTitle;
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}
    >
      <style>{`
        .bin-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background-color: ${isDarkMode ? "#991b1b" : "#ef4444"};
          cursor: pointer;
          transition-duration: 0.3s;
          border: none;
        }
        .bin-bottom { width: 10px; }
        .bin-top {
          width: 12px;
          transform-origin: right;
          transition-duration: 0.3s;
        }
        .bin-button:hover .bin-top { transform: rotate(45deg); }
        .bin-button:hover { background-color: ${isDarkMode ? "#b91c1c" : "#f87171"}; }
        .bin-button:active { transform: scale(0.9); }
      `}</style>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>

        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div 
          className="relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          onClick={handleCoverPhotoClick}
        >
          {coverPhotoUrl ? (
            <>
              <img 
                src={coverPhotoUrl} 
                alt="Space Cover" 
                className="w-full h-full object-cover"
              />
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
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                ({currentSpace?.members?.length || 0} member(s))
              </span>
              {isOwnerSpace && (
                <div className="flex flex-wrap gap-2">
                  <div onClick={handleInviteMember}><Button text="Add Member" /></div>
                  <div onClick={() => setShowPendingInvitations(true)} className="relative">
                    <Button text="Pending Invites" />
                    {joinRequestsData.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {joinRequestsData.length}
                      </span>
                    )}
                  </div>
                  <div onClick={handleDeleteRoom}><Button text="Delete Room" /></div>
                </div>
              )}
              {isFriendSpace && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md">
                    <span className="text-xs text-blue-400 break-all">
                      {currentSpace?.space_link || "Loading..."}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}>Stream</button>
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}>Tasks</button>
                <button className="font-semibold border-b-2 pb-2" style={{ borderColor: currentColors.text }}>
                  Files
                </button>
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/people`)}>People</button>
              </div>
            </div>
          </div>

          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <Button onClick={handleInviteMember} text="Add Member" />
              <Button onClick={() => setShowPendingInvitations(true)} text="Pending Invites" className="relative">
                {joinRequestsData.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {joinRequestsData.length}
                  </span>
                )}
              </Button>
              <Button onClick={handleDeleteRoom} text="Delete Room" />
            </div>
          )}

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* UPLOAD RESOURCES BUTTON */}
            {isOwnerSpace && (
              <div className="flex justify-end mb-4">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
                  onClick={() => setShowCreateUploadModal(true)}
                >
                  <FiUpload size={16} />
                  Upload Resources
                </button>
              </div>
            )}

            {/* RESPONSIVE TABLE */}
            <div
              className="rounded-xl p-4 sm:p-6 border"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: isDarkMode ? currentColors.border : "#000000",
              }}
            >
              {/* TABLE HEADER */}
              <div
                className="hidden sm:grid grid-cols-4 text-sm pb-3 border-b mb-4"
                style={{ color: currentColors.textSecondary, borderColor: currentColors.border }}
              >
                <div className="col-span-2">File Name</div>
                <div>Date Posted</div>
                <div>Posted By</div>
              </div>

              {/* FILE LIST */}
              {files.map((file, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 cursor-pointer"
                  style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}
                  onClick={() => handleFileClick(file)}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="p-2 rounded-md flex items-center justify-center w-10 h-10 flex-shrink-0"
                          style={{ backgroundColor: currentColors.surface, border: `2px solid ${currentColors.border}` }}
                        >
                          <FiFileText style={{ color: currentColors.text }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate" style={{ color: currentColors.text }}>
                            {formatFileTitle(file.filename)}
                          </p>
                          <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                            Posted by:{" "}
                            {file.owner_id === user.id
                              ? "You"
                              : currentSpace?.members?.find((m) => m.account_id === file.owner_id)?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-4 items-center">
                    <div className="flex items-center gap-3 col-span-2">
                      <div
                        className="p-2 rounded-md flex items-center justify-center w-8 h-8"
                        style={{ backgroundColor: currentColors.surface, border: `2px solid ${currentColors.border}` }}
                      >
                        <FiFileText style={{ color: currentColors.text }} />
                      </div>
                      <span className="truncate" style={{ color: currentColors.text }}>
                        {formatFileTitle(file.filename)}
                      </span>
                    </div>
                    <div style={{ color: currentColors.text }}>
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ color: currentColors.text }}>
                      {file.owner_id === user.id
                        ? "You"
                        : currentSpace?.members?.find((m) => m.account_id === file.owner_id)?.full_name}
                    </div>
                  </div>
                </div>
              ))}

              {files.length === 0 && (
                <div className="text-center py-12" style={{ color: currentColors.textSecondary }}>
                  <FiFileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CREATE/UPLOAD MODAL (Prof style) ================= */}
      {showCreateUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
            style={{ backgroundColor: currentColors.surface }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={resetUploadModal}
              className="absolute top-4 right-4 z-10 rounded-full p-1 transition-colors"
              style={{ backgroundColor: currentColors.background, color: currentColors.textSecondary }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = currentColors.hover; e.currentTarget.style.color = currentColors.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentColors.background; e.currentTarget.style.color = currentColors.textSecondary; }}
            >
              <FiX size={24} />
            </button>

            {/* CONTENT */}
            <div className="p-4 sm:p-6 lg:p-8 pt-8 sm:pt-10 lg:pt-12">
              {/* MODAL TITLE */}
              <div className="mb-6">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: currentColors.text }}
                >
                  Upload Lesson
                </h2>
              </div>

              {/* LESSON NAME INPUT */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentColors.text }}
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
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: lessonNameError ? "#ef4444" : currentColors.border,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = lessonNameError ? "#ef4444" : "#3b82f6";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = lessonNameError ? "#ef4444" : currentColors.border;
                  }}
                />
                {lessonNameError && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                    {lessonNameError}
                  </p>
                )}
              </div>

              {/* DRAG & DROP ZONE */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center mb-4 cursor-pointer transition relative ${
                  dragActive ? "border-blue-500 bg-blue-50" : ""
                }`}
                style={{
                  borderColor: dragActive ? "#3b82f6" : currentColors.border,
                  backgroundColor: dragActive ? "#eff6ff" : currentColors.background,
                }}
                onClick={() => !lastUploadedFile && document.getElementById("file-upload").click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />

                {lastUploadedFile ? (
                  // SUCCESS / FILE ALREADY EXISTS STATE
                  <div className="space-y-4">
                    <div className="text-center">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4"
                        style={{
                          backgroundColor: currentColors.surface,
                          border: `2px solid ${currentColors.border}`,
                        }}
                      >
                        <span className="text-2xl font-bold" style={{ color: currentColors.text }}>
                          {getFileTypeLetter(lastUploadedFile.name)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: currentColors.text }}>
                        {fileAlreadyExists ? "File Already Exists" : "File Uploaded Successfully!"}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: currentColors.text }}>
                        {lastUploadedFile.name}
                      </p>
                      <p className="text-xs mb-6" style={{ color: currentColors.textSecondary }}>
                        Size: {(lastUploadedFile.size / 1024).toFixed(0)}KB • Type:{" "}
                        {lastUploadedFile.name.split(".").pop()?.toUpperCase() || "Unknown"}
                      </p>
                      {fileAlreadyExists && (
                        <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
                          This file has already been uploaded to the space.
                        </p>
                      )}
                    </div>
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  // INITIAL UPLOAD STATE
                  <>
                    <FiUpload
                      size={32}
                      className="mx-auto mb-3 sm:mb-4"
                      style={{ color: currentColors.textSecondary }}
                    />
                    <p className="font-medium text-sm sm:text-base" style={{ color: currentColors.text }}>
                      Choose a file or drag & drop it here.
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: currentColors.textSecondary }}>
                      DOCS, PDF, PPT AND EXCEL, UP TO 50 MB
                    </p>
                  </>
                ) : (
                  // FILES SELECTED STATE
                  <div className="space-y-2 sm:space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 sm:p-4 rounded-lg border"
                        style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                          <span className="text-xl sm:text-2xl">{getFileTypeLetter(file.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: currentColors.text }}>
                              {file.name.toUpperCase()}
                            </p>
                            <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                              {(file.size / 1024).toFixed(0)}KB
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOTTOM-RIGHT ACTIONS — shown after file is uploaded */}
              {lastUploadedFile && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      border: `1px solid ${currentColors.border}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = currentColors.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentColors.background; }}
                    onClick={() => {
                      setLastUploadedFile(null);
                      setFileAlreadyExists(false);
                      const fileInput = document.getElementById("file-upload");
                      if (fileInput) fileInput.value = "";
                    }}
                  >
                    <FiUpload size={14} />
                    Reupload File
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2563eb"; }}
                    onClick={() => {
                      if (!lessonName.trim()) {
                        setLessonNameError("Lesson name is required");
                        return;
                      }
                      resetUploadModal();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= FILE TITLE MODAL ================= */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">File Title</h2>
                <button onClick={() => { setFileName(""); setIsCreatingFile(false); }} className="text-gray-400 hover:text-white p-1">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <label className="font-semibold text-white mb-3 block">
                File Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-[#23272F] text-white rounded-lg px-4 py-2 mb-6 outline-none border border-[#23272F] focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter file title"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={() => { setFileName(""); setIsCreatingFile(false); }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE WARNING MODAL ================= */}
      {showDeleteWarning && fileToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg p-4 sm:p-6 max-w-md w-full" style={{ backgroundColor: currentColors.surface }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: currentColors.text }}>
                Delete File
              </h3>
              <button
                onClick={cancelDeleteFile}
                className="p-1 bg-transparent transition-colors rounded-md"
                style={{ color: currentColors.textSecondary }}
                onMouseEnter={(e) => { e.currentTarget.style.color = currentColors.text; e.currentTarget.style.backgroundColor = currentColors.background; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = currentColors.textSecondary; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-md flex items-center justify-center w-10 h-10"
                  style={{ backgroundColor: currentColors.background, border: `2px solid ${currentColors.border}` }}
                >
                  <span className="text-sm font-bold" style={{ color: currentColors.text }}>
                    {getFileTypeLetter(fileToDelete.filename)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: currentColors.text }}>
                    {formatFileTitle(fileToDelete.filename)}
                  </p>
                  <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                    {formatDate(fileToDelete.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: currentColors.textSecondary }}>
                Are you sure you want to delete{" "}
                <span className="font-medium" style={{ color: currentColors.text }}>
                  "{formatFileTitle(fileToDelete.filename)}"
                </span>{" "}
                from this space?
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: "#ef4444" }}>
                ⚠️ This action cannot be undone. The file will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: currentColors.background, color: currentColors.text, border: `1px solid ${currentColors.border}` }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = currentColors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentColors.background; }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{ backgroundColor: isDarkMode ? "#991b1b" : "#ef4444", color: "#ffffff" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#b91c1c" : "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#991b1b" : "#ef4444"; }}
              >
                <FiX size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PENDING INVITATIONS ================= */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              <button onClick={() => setShowPendingInvitations(false)} className="text-gray-400 hover:text-white p-1 bg-transparent">
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No pending invitations</p>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div key={invitation.account_id} className="bg-[#2A2F3A] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img src={invitation.profile_pic} alt={invitation.fullname} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.fullname}</h3>
                        <p className="text-sm text-gray-400">{invitation.email}</p>
                        <p className="text-sm mt-1">{invitation.message || "Hello world"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{invitation.added_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        disabled={spaceLoading}
                        onClick={() => handleDeclineJoinRequest(invitation.account_id)}
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition"
                      >
                        Decline
                      </button>
                      <button
                        disabled={spaceLoading}
                        onClick={() => handleAcceptJoinRequest(invitation.account_id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition"
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

      {/* ADD MEMBER POPUP */}
      <AddMember
        currentSpace={currentSpace}
        onInviteMember={sendInvite}
        showInvitePopup={showInvitePopup}
        setShowInvitePopup={setShowInvitePopup}
      />

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={dialogMessage}
      />

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Position Cover Photo</h2>
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
              <button
                onClick={handleCoverPhotoSave}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Apply
              </button>
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
                Change Cover Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilesShared;