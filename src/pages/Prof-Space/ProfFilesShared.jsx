import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
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

const ProfFilesShared = () => {
  const navigate = useNavigate();
  const {
    showGlobalLoading,
    showGlobalNotification,
    hideGlobalNotification,
    updateNotificationData,
    updateNotificationMessage,
  } = useNotification();
  const { space_uuid, space_name } = useParams();

  // Custom hooks

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

  // Join requests
  const { data: joinRequestsData = [], isLoading: joinRequestsLoading } =
    useJoinRequests(space_uuid || "");
  // UUID validation
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Find current space
  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;
  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const { list, create } = useFileManager(currentSpace?.space_id || null);

  const {
    resources,
    files: contextFiles,
    uploadResource,
    isUploading,
    uploadProgress,
    createFile: createFileWithContext,
    refreshFiles,
  } = useFile();

  const files = list?.data || contextFiles;

  console.log(resources);
  console.log(space_uuid);

  /* ================= HEADER + SIDEBAR ================= */

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const lastScrollY = useRef(0);

  // File upload states

  const [showCreateUploadModal, setShowCreateUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [fileAlreadyExists, setFileAlreadyExists] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [lessonName, setLessonName] = useState("");
  const [lessonNameError, setLessonNameError] = useState("");

  const checkFileExists = (fileName) => {
    return resources?.some((resource) =>
      resource.name.toLowerCase().includes(fileName.toLowerCase()),
    );
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "doc":
      case "docx":
        return "📘"; // Word document - blue book
      case "ppt":
      case "pptx":
        return "📙"; // PowerPoint - orange book
      case "xls":
      case "xlsx":
        return "📗"; // Excel - green book
      case "pdf":
        return "📕"; // PDF - red book
      case "txt":
        return "📄"; // Text file
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "svg":
        return "🖼️"; // Image
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return "🎥"; // Video
      case "mp3":
      case "wav":
      case "flac":
        return "🎵"; // Audio
      case "zip":
      case "rar":
      case "7z":
        return "📦"; // Archive
      case "html":
      case "htm":
      case "css":
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return "💻"; // Code
      default:
        return "📄"; // Default file
    }
  };

  const getFileTypeLetter = (fileName) => {
    if (!fileName) return "📄";

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      // Development Files
      case "jsx":
        return "⚛️"; // React icon
      case "tsx":
        return "🔷"; // TypeScript React
      case "js":
        return "🟨"; // JavaScript
      case "ts":
        return "🔷"; // TypeScript
      case "html":
        return "🌐"; // HTML
      case "htm":
        return "🌐"; // HTML
      case "css":
        return "🎨"; // CSS
      case "scss":
        return "💅"; // SCSS
      case "sass":
        return "💅"; // SASS
      case "json":
        return "📋"; // JSON
      case "xml":
        return "📄"; // XML

      // Documents
      case "doc":
      case "docx":
        return "📘"; // Word document - blue book
      case "pdf":
        return "📕"; // PDF - red book
      case "txt":
      case "md":
        return "📝"; // Text/Markdown
      case "rtf":
        return "📄"; // Rich Text

      // Spreadsheets
      case "xls":
      case "xlsx":
      case "csv":
        return "📗"; // Excel - green book

      // Presentations
      case "ppt":
      case "pptx":
        return "📙"; // PowerPoint - orange book

      // Images
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "svg":
      case "webp":
      case "ico":
        return "🖼️"; // Image

      // Videos
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
      case "flv":
      case "webm":
      case "mkv":
        return "🎥"; // Video

      // Audio
      case "mp3":
      case "wav":
      case "flac":
      case "aac":
      case "ogg":
      case "m4a":
        return "🎵"; // Audio

      // Archives
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
        return "📦"; // Archive

      // Configuration Files
      case "yml":
      case "yaml":
        return "⚙️"; // YAML
      case "env":
        return "🔐"; // Environment
      case "config":
      case "conf":
        return "⚙️"; // Config
      case "ini":
        return "⚙️"; // INI

      // Database Files
      case "sql":
        return "🗄️"; // SQL
      case "db":
      case "sqlite":
        return "🗄️"; // Database

      // Fonts
      case "ttf":
      case "otf":
      case "woff":
      case "woff2":
        return "🔤"; // Font

      // Code Files (other)
      case "py":
        return "🐍"; // Python
      case "java":
        return "☕"; // Java
      case "cpp":
      case "c++":
        return "⚙️"; // C++
      case "c":
        return "⚙️"; // C
      case "php":
        return "🐘"; // PHP
      case "rb":
        return "💎"; // Ruby
      case "go":
        return "🐹"; // Go
      case "rs":
        return "🦀"; // Rust
      case "swift":
        return "🍎"; // Swift
      case "kt":
        return "🎯"; // Kotlin
      case "dart":
        return "🎯"; // Dart
      case "vue":
        return "💚"; // Vue
      case "svelte":
        return "🧡"; // Svelte

      // Design Files
      case "psd":
        return "🎨"; // Photoshop
      case "ai":
        return "🎨"; // Illustrator
      case "fig":
        return "🎨"; // Figma
      case "sketch":
        return "🎨"; // Sketch

      // Default
      default:
        return "📄"; // Default file
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 5) {
        alert("Maximum 5 files allowed");
        return;
      }
      try {
        // Check if file already exists before uploading
        const fileExists = checkFileExists(files[0].name);
        setFileAlreadyExists(fileExists);

        await uploadResource(files, space_uuid);
        // Refresh the file list after successful upload
        if (currentSpace?.space_id) {
          await refreshFiles(space_uuid);
        }
        // Set the last uploaded file and keep modal open to show view state
        setLastUploadedFile(files[0]);
        setUploadedFiles([]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert("Maximum 5 files allowed");
        return;
      }
      try {
        // Check if file already exists before uploading
        const fileExists = checkFileExists(files[0].name);
        setFileAlreadyExists(fileExists);

        await uploadResource(files, space_uuid);
        // Refresh the file list after successful upload
        if (currentSpace?.space_uuid) {
          await refreshFiles(space_uuid);
        }
        // Set the last uploaded file and keep modal open to show view state
        setLastUploadedFile(files[0]);
        setUploadedFiles([]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const handleUploadFile = async (file, retryCount = 0) => {
    const maxRetries = 3;
    let notificationId = null;

    try {
      // Close the upload modal immediately when upload starts
      setShowCreateUploadModal(false);

      // Show initial loading notification
      notificationId = showGlobalNotification({
        type: "loading",
        title: "Uploading File",
        message: `Uploading "${file.name}"...`,
        duration: null, // Keep visible until manually closed
        persistent: true,
        data: {
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: "uploading",
          retryCount,
          startTime: new Date().toISOString(),
        },
      });

      // Simulate upload progress (replace with actual upload logic)
      const simulateProgress = async () => {
        const progressSteps = [10, 25, 50, 75, 90, 100];

        for (const progress of progressSteps) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (notificationId) {
            updateNotificationData(notificationId, {
              ...file,
              progress,
              status: progress === 100 ? "processing" : "uploading",
            });

            // Update message based on progress
            const message =
              progress === 100
                ? `Processing "${file.name}"...`
                : `Uploading "${file.name}" - ${progress}%`;

            // Update the notification message using the context function
            updateNotificationMessage(notificationId, message);
          }
        }
      };

      // Start progress simulation
      simulateProgress();

      // Actual file upload logic (replace with your API call)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("space_id", currentSpace?.space_id);
      formData.append("owner_id", user?.id);

      // Simulate API call with potential failure (replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate random failure for demonstration (remove in production)
      const shouldFail = Math.random() < 0.3; // 30% chance of failure for testing
      if (shouldFail && retryCount < maxRetries) {
        throw new Error(
          `Upload interrupted (attempt ${retryCount + 1}/${maxRetries})`,
        );
      }

      // For now, simulate success (replace with actual API response)
      const uploadResult = { success: true, file_id: Date.now() };

      if (uploadResult.success) {
        // Update notification to success
        if (notificationId) {
          updateNotificationData(notificationId, {
            ...file,
            progress: 100,
            status: "completed",
            fileId: uploadResult.file_id,
            completedTime: new Date().toISOString(),
          });
        }

        // Show success notification
        showGlobalNotification({
          type: "success",
          title: "Upload Complete",
          message: `"${file.name}" has been successfully uploaded.`,
          duration: 3000,
          data: {
            fileName: file.name,
            fileId: uploadResult.file_id,
          },
          actions: [
            {
              label: "View File",
              variant: "primary",
              onClick: () => {
                // Navigate to the uploaded file
                navigate(
                  `/prof/space/${space_uuid}/${space_name}/files/${file.name}/${uploadResult.file_id}`,
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
      } else {
        throw new Error(uploadResult.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Check if we should retry
      if (retryCount < maxRetries && error.message.includes("interrupted")) {
        // Update notification to show retry attempt
        if (notificationId) {
          updateNotificationData(notificationId, {
            ...file,
            progress: 0,
            status: "retrying",
            retryCount: retryCount + 1,
            error: error.message,
          });

          updateNotificationMessage(
            notificationId,
            `Upload interrupted. Retrying... (${retryCount + 1}/${maxRetries})`,
          );
        }

        // Wait a moment before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Retry the upload
        return handleUploadFile(file, retryCount + 1);
      }

      // Final error state after all retries exhausted
      if (notificationId) {
        updateNotificationData(notificationId, {
          ...file,
          progress: 0,
          status: "error",
          error: error.message,
          retryCount,
          failedTime: new Date().toISOString(),
        });
      }

      // Show error notification with retry option
      showGlobalNotification({
        type: "error",
        title: "Upload Failed",
        message: `Failed to upload "${file.name}". ${error.message}`,
        duration: null, // Keep visible until manually closed
        persistent: true,
        data: {
          fileName: file.name,
          error: error.message,
          originalFile: file,
          retryCount,
          canRetry: retryCount < maxRetries,
        },
        actions: [
          {
            label: retryCount < maxRetries ? "Retry Upload" : "Start Fresh",
            variant: "primary",
            onClick: () => {
              hideGlobalNotification();
              // Retry the upload with reset counter
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
  if (userLoading || spaceLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        Loading...
      </div>
    );
  }
  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return (
      <div
        className="flex h-screen justify-center items-center"
        style={{ color: currentColors.text }}
      >
        Space not found
      </div>
    );
  }

  // Invite member
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    console.log("handleDeleteRoom called, currentSpace:", currentSpace);
    if (!currentSpace) return;
    setShowDeleteDialog(true);
  };

  const confirmDeleteRoom = async () => {
    if (!currentSpace) return;
    setShowDeleteDialog(false);
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
  };

  // Handle join requests
  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to accept join request:", error);
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to decline join request:", error);
    }
  };

  // Send invite
  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  // Copy link
  const handleCopyLink = (space_link) => {
    navigator.clipboard
      .writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  const handleOpenFile = (file) => {
    const url = `/prof/space/${space_uuid}/${space_name}/files/${file.name}/${file.id || file.uuid || "unknown"}`;
    navigate(url);
  };

  // Custom delete button component
  const DeleteButton = ({ onClick, title, className = "", style = {} }) => {
    return (
      <div
        className={`bin-button ${className}`}
        onClick={onClick}
        title={title}
        style={style}
      >
        <svg
          className="bin-top"
          viewBox="0 0 39 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line y1={5} x2={39} y2={5} stroke="white" strokeWidth={4} />
          <line
            x1={12}
            y1="1.5"
            x2={26.0357}
            y2={1.5}
            stroke="white"
            strokeWidth={3}
          />
        </svg>
        <svg
          className="bin-bottom"
          viewBox="0 0 33 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
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
  };

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteWarning(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      // Show loading state
      showGlobalNotification({
        type: "loading",
        title: "Deleting File",
        message: `Deleting "${fileToDelete.filename}"...`,
        duration: null,
        persistent: true,
      });

      // Close warning modal
      setShowDeleteWarning(false);

      // You'll need to implement the actual delete API call
      // await deleteFile(fileToDelete.fuuid, space_uuid);

      // Simulate API call for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Refresh the file list after deletion
      if (currentSpace?.space_id) {
        await refreshFiles(space_uuid);
      }

      // Show success notification
      showGlobalNotification({
        type: "success",
        title: "File Deleted Successfully",
        message: `"${fileToDelete.filename}" has been permanently removed from the space.`,
        duration: 4000,
        data: {
          fileName: fileToDelete.filename,
          actionType: "delete",
        },
      });

      // Reset state
      setFileToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      showGlobalNotification({
        type: "error",
        title: "Delete Failed",
        message: `Failed to delete "${fileToDelete.filename}". Please try again.`,
        duration: 5000,
        data: {
          fileName: fileToDelete.filename,
          error: error.message,
        },
      });
    }
  };

  const cancelDeleteFile = () => {
    setShowDeleteWarning(false);
    setFileToDelete(null);
  };

  const handleDownloadFile = async (file) => {
    try {
      // Show loading state
      showGlobalNotification({
        type: "loading",
        title: "Downloading File",
        message: `Downloading "${file.name}"...`,
        duration: null,
        persistent: true,
      });

      // You'll need to implement the actual download API call
      // For now, create a download link
      const downloadUrl = file.url;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      showGlobalNotification({
        type: "success",
        title: "Download Started",
        message: `"${file.name}" download has started.`,
        duration: 4000,
        data: {
          fileName: file.name,
          actionType: "download",
        },
      });
    } catch (error) {
      console.error("Download failed:", error);
      showGlobalNotification({
        type: "error",
        title: "Download Failed",
        message: `Failed to download "${file.name}". Please try again.`,
        duration: 5000,
        data: {
          fileName: file.name,
          error: error.message,
        },
      });
    }
  };

  // Download Button Component
  const DownloadButton = ({ onClick, title, className = "" }) => {
    return (
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
          border: isDarkMode ? "#1e3a8a" : "#2563eb",
          cursor: "pointer",
          transitionDuration: "0.3s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = isDarkMode ? "#2563eb" : "#60a5fa";
          e.target.style.borderColor = isDarkMode ? "#1e40af" : "#3b82f6";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = isDarkMode ? "#1e40af" : "#3b82f6";
          e.target.style.borderColor = isDarkMode ? "#1e3a8a" : "#2563eb";
        }}
        onMouseDown={(e) => {
          e.target.style.transform = "scale(0.9)";
        }}
        onMouseUp={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L12 14M12 14L8 10M12 14L16 10M3 17V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };

  const formatFileTitle = (filename) => {
    if (!filename) return "";

    const decodedFileName = decodeURIComponent(filename);
    const nameWithoutExtension = decodedFileName.split(".")[0];
    const cleanTitle = nameWithoutExtension.split("_")[0];

    return cleanTitle;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
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
          border: ${isDarkMode ? "#7f1d1d" : "#dc2626"};
        }
        .bin-bottom {
          width: 10px;
        }
        .bin-top {
          width: 12px;
          transform-origin: right;
          transition-duration: 0.3s;
        }
        .bin-button:hover .bin-top {
          transform: rotate(45deg);
        }
        .bin-button:hover {
          background-color: ${isDarkMode ? "#b91c1c" : "#f87171"};
        }
        .bin-button:active {
          transform: scale(0.9);
        }
      `}</style>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        {/* <ProfSidebar onLogoutClick={() => setShowLogout(true)} /> */}
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface,
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}

      <div
        className="flex-1 flex flex-col w-full"
        style={{ backgroundColor: currentColors.background }}
      >
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
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

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                (
                {currentSpace?.space_type === "course"
                  ? currentSpace?.members?.length - 1 + " student(s)"
                  : currentSpace?.members?.length + " member(s)" || 0}
                )
              </span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
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
                <div className="flex flex-col gap-2 mt-2">
                  <div
                    className="flex items-center gap-2 p-2 rounded-md"
                    style={{ backgroundColor: currentColors.surface }}
                  >
                    <span
                      className="text-xs break-all"
                      style={{ color: currentColors.accent }}
                    >
                      {currentSpace?.space_link || "Loading..."}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="p-1 rounded transition-colors"
                      style={{
                        color: currentColors.textSecondary,
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.color = currentColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = currentColors.textSecondary;
                      }}
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
          <div
            className="w-full overflow-x-auto no-scrollbar border-b pb-4 mb-6"
            style={{ borderColor: currentColors.border }}
          >
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}`)
                  }
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  Stream
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/tasks`)
                  }
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  Tasks
                </button>
                <button
                  className="font-semibold border-b-2 pb-2"
                  style={{ borderColor: currentColors.text }}
                >
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/people`)
                  }
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <div onClick={handleInviteMember}>
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

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* BUTTON */}
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#2563eb";
                }}
                onClick={() => setShowCreateUploadModal(true)}
              >
                <FiFileText size={16} />
                Upload Resources
              </button>
            </div>

            {/* RESPONSIVE TABLE */}
            <div
              className="rounded-xl p-4 sm:p-6 border"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: isDarkMode ? currentColors.border : "#000000",
              }}
            >
              {/* TABLE HEADER - Hidden on mobile, visible on larger screens */}
              <div
                className="hidden sm:grid grid-cols-7 text-sm pb-3 border-b mb-4"
                style={{
                  color: currentColors.textSecondary,
                  borderColor: currentColors.border,
                }}
              >
                <div className="col-span-2">File Name</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Date Posted</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* FILE LIST - Responsive cards for all screen sizes */}
              {resources?.map((file, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border,
                  }}
                >
                  {/* Mobile and Tablet Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="p-2 rounded-md flex items-center justify-center w-10 h-10 flex-shrink-0"
                          style={{
                            backgroundColor: currentColors.surface,
                            border: `2px solid ${currentColors.border}`,
                          }}
                          onClick={() => handleOpenFile(file)}
                        >
                          <span
                            className="text-sm font-bold cursor-pointer"
                            style={{ color: currentColors.text }}
                          >
                            {getFileTypeLetter(file.name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold cursor-pointer truncate"
                            onClick={() => handleOpenFile(file)}
                            style={{ color: currentColors.text }}
                          >
                            {formatFileTitle(
                              file.name.split("-").slice(3).join("-"),
                            )}
                          </p>

                          <p
                            className="text-xs mt-1"
                            style={{ color: currentColors.textSecondary }}
                          >
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DownloadButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file);
                          }}
                          title="Download file"
                        />
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file);
                          }}
                          title="Delete file"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-7 items-center">
                    <div
                      className="flex items-center gap-3 col-span-2 cursor-pointer"
                      onClick={() => handleOpenFile(file)}
                    >
                      <div
                        className="p-2 rounded-md flex items-center justify-center w-8 h-8"
                        style={{
                          backgroundColor: currentColors.surface,
                          border: `2px solid ${currentColors.border}`,
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: currentColors.text }}
                        >
                          {getFileTypeLetter(file.name)}
                        </span>
                      </div>
                      <span className="truncate">
                        {formatFileTitle(
                          file.name.split("-").slice(3).join("-"),
                        )}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {getFileExtension(file.name)}
                    </div>
                    <div className="col-span-2">
                      {formatDate(file.created_at)}
                    </div>
                    <div className="col-span-1">{file.size}</div>
                    <div className="col-span-1 flex items-center gap-2 justify-end">
                      <DownloadButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(file);
                        }}
                        title="Download file"
                      />
                      <DeleteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file);
                        }}
                        title="Delete file"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!resources || resources.length === 0) && (
                <div
                  className="text-center py-12"
                  style={{ color: currentColors.textSecondary }}
                >
                  <FiFileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: currentColors.surface }}
          >
            {/* Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: currentColors.text }}
              >
                Pending Invitations
              </h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="p-1 bg-transparent transition-colors"
                style={{ color: currentColors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentColors.text;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentColors.textSecondary;
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Invitations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: currentColors.textSecondary }}
                >
                  No pending invitations
                </p>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div
                    key={invitation.account_id}
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentColors.background }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={invitation.profile_pic}
                        alt={invitation.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.fullname}</h3>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.textSecondary }}
                        >
                          {invitation.email}
                        </p>
                        <p className="text-sm mt-1">
                          {invitation.message || "Hello world"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-xs"
                            style={{ color: currentColors.textSecondary }}
                          >
                            {invitation.added_at}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          handleDeclineJoinRequest(invitation.account_id)
                        }
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition"
                      >
                        Decline
                      </button>
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          handleAcceptJoinRequest(invitation.account_id)
                        }
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

      {/* CREATE/UPLOAD POPUP MODAL */}
      {showCreateUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
            style={{ backgroundColor: currentColors.surface }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setShowCreateUploadModal(false);
                setLastUploadedFile(null);
                setFileAlreadyExists(false);
                // Clear file input
                const fileInput = document.getElementById("file-upload");
                if (fileInput) fileInput.value = "";
              }}
              className="absolute top-4 right-4 z-10 rounded-full p-1 transition-colors"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.textSecondary,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentColors.hover;
                e.target.style.color = currentColors.text;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentColors.background;
                e.target.style.color = currentColors.textSecondary;
              }}
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
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors ${
                    lessonNameError ? "border-red-500" : ""
                  }`}
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: lessonNameError
                      ? "#ef4444"
                      : currentColors.border,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = lessonNameError
                      ? "#ef4444"
                      : "#3b82f6";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = lessonNameError
                      ? "#ef4444"
                      : currentColors.border;
                  }}
                />
                {lessonNameError && (
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                    {lessonNameError}
                  </p>
                )}
              </div>

              {/* UPLOAD SECTION */}
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
                  backgroundColor: dragActive
                    ? "#eff6ff"
                    : currentColors.background,
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
                  // VIEW FILE STATE
                  <div className="space-y-4">
                    <div className="text-center">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4"
                        style={{
                          backgroundColor: currentColors.surface,
                          border: `2px solid ${currentColors.border}`,
                        }}
                      >
                        <span
                          className="text-2xl font-bold"
                          style={{ color: currentColors.text }}
                        >
                          {getFileTypeLetter(lastUploadedFile.name)}
                        </span>
                      </div>
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: currentColors.text }}
                      >
                        {fileAlreadyExists
                          ? "File Already Exists"
                          : "File Uploaded Successfully!"}
                      </h3>
                      <p
                        className="text-sm mb-4"
                        style={{ color: currentColors.text }}
                      >
                        {lastUploadedFile.name}
                      </p>
                      <p
                        className="text-xs mb-6"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Size: {(lastUploadedFile.size / 1024).toFixed(0)}KB •
                        Type:{" "}
                        {lastUploadedFile.name
                          .split(".")
                          .pop()
                          ?.toUpperCase() || "Unknown"}
                      </p>
                      {fileAlreadyExists && (
                        <p
                          className="text-sm mb-4"
                          style={{ color: "#ef4444" }}
                        >
                          This file has already been uploaded to the space.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {fileAlreadyExists ? (
                        <button
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#1d4ed8";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Reset to upload state for a different file
                            setLastUploadedFile(null);
                            setFileAlreadyExists(false);
                            // Clear file input
                            const fileInput =
                              document.getElementById("file-upload");
                            if (fileInput) fileInput.value = "";
                          }}
                        >
                          <FiUpload size={16} />
                          Upload Other File
                        </button>
                      ) : null}
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
                    <p
                      className="font-medium text-sm sm:text-base"
                      style={{ color: currentColors.text }}
                    >
                      Choose a file or drag & drop it here.
                    </p>
                    <p
                      className="text-xs sm:text-sm mt-1"
                      style={{ color: currentColors.textSecondary }}
                    >
                      DOCS, PDF, PPT AND EXCEL, UP TO 50 MB
                    </p>
                  </>
                ) : (
                  // FILES SELECTED STATE (existing code)
                  <div className="space-y-2 sm:space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 sm:p-4 rounded-lg border"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                        }}
                      >
                        {/* FILE HEADER */}
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                            <span className="text-xl sm:text-2xl">📄</span>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs sm:text-sm font-semibold truncate"
                                style={{ color: currentColors.text }}
                              >
                                {file.name.toUpperCase()}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: currentColors.textSecondary }}
                              >
                                {(file.size / 1024).toFixed(0)}KB
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* UPLOAD BUTTON */}
                        <button
                          className="w-full px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#1d4ed8";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadFile(file);
                          }}
                        >
                          Upload File
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* UPLOAD BUTTON AND PROGRESS */}
                {uploadedFiles.length > 0 && !lastUploadedFile && (
                  <div className="mt-4 space-y-3">
                    {isUploading && (
                      <div className="w-full">
                        <div
                          className="flex justify-between text-sm mb-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          <span>Uploading resources...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        const fileInput =
                          document.getElementById("file-upload");
                        const files = Array.from(fileInput.files || []);

                        if (files.length > 0) {
                          // Check if file already exists before uploading
                          const fileExists = checkFileExists(files[0].name);
                          setFileAlreadyExists(fileExists);

                          // Validate lesson name
                          if (!lessonName.trim()) {
                            setLessonNameError(
                              fileExists
                                ? "Lesson name is required when uploading a duplicate file"
                                : "Lesson name is required",
                            );
                            return;
                          }

                          try {
                            await uploadResource(files, space_uuid);
                            if (space_uuid) {
                              await refreshFiles(space_uuid);
                            }
                            // Set the last uploaded file and keep modal open to show view state
                            setLastUploadedFile(files[0]);
                            setUploadedFiles([]);
                            setLessonNameError("");
                          } catch (error) {
                            console.error("Upload failed:", error);
                          }
                        }
                      }}
                      disabled={isUploading}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      style={{
                        backgroundColor: isUploading ? "#9ca3af" : "#2563eb",
                        color: "#ffffff",
                      }}
                      onMouseEnter={(e) => {
                        if (!isUploading) {
                          e.target.style.backgroundColor = "#1d4ed8";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUploading) {
                          e.target.style.backgroundColor = "#2563eb";
                        }
                      }}
                    >
                      <FiUpload size={16} />
                      <span>
                        {isUploading
                          ? "Uploading..."
                          : `Upload ${uploadedFiles.length} Resource${uploadedFiles.length > 1 ? "s" : ""}`}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* BOTTOM-RIGHT ACTIONS - shown after file is uploaded */}
              {lastUploadedFile && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      border: `1px solid ${currentColors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        currentColors.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        currentColors.background;
                    }}
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
                    style={{
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1d4ed8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }}
                    onClick={() => {
                      // Validate lesson name before confirming
                      if (!lessonName.trim()) {
                        setLessonNameError(
                          fileAlreadyExists
                            ? "Lesson name is required when uploading a duplicate file"
                            : "Lesson name is required",
                        );
                        return;
                      }

                      setShowCreateUploadModal(false);
                      setLastUploadedFile(null);
                      setFileAlreadyExists(false);
                      setLessonName("");
                      setLessonNameError("");
                      const fileInput = document.getElementById("file-upload");
                      if (fileInput) fileInput.value = "";
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
      {/* FILE TITLE MODAL */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">File Title</h2>
                <button
                  onClick={() => setIsCreatingFile(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
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
                  onClick={() => setIsCreatingFile(false)}
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
      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      {/* DELETE WARNING MODAL */}
      {showDeleteWarning && fileToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-lg p-4 sm:p-6 max-w-md w-full"
            style={{ backgroundColor: currentColors.surface }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: currentColors.text }}
              >
                Delete File
              </h3>
              <button
                onClick={cancelDeleteFile}
                className="p-1 bg-transparent transition-colors rounded-md"
                style={{ color: currentColors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentColors.text;
                  e.target.style.backgroundColor = currentColors.background;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentColors.textSecondary;
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Warning Message */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-md flex items-center justify-center w-10 h-10"
                  style={{
                    backgroundColor: currentColors.background,
                    border: `2px solid ${currentColors.border}`,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: currentColors.text }}
                  >
                    {getFileTypeLetter(fileToDelete.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold"
                    style={{ color: currentColors.text }}
                  >
                    {formatFileTitle(
                      fileToDelete.name.split("-").slice(3).join("-"),
                    )}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {formatDate(fileToDelete.created_at)}
                  </p>
                </div>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{ color: currentColors.textSecondary }}
              >
                Are you sure you want to delete{" "}
                <span
                  className="font-medium"
                  style={{ color: currentColors.text }}
                >
                  "
                  {formatFileTitle(
                    fileToDelete.name.split("-").slice(3).join("-"),
                  )}
                  "
                </span>{" "}
                from this space?
              </p>
              <p
                className="text-sm mt-2 font-medium"
                style={{ color: "#ef4444" }}
              >
                ⚠️ This action cannot be undone. The file will be permanently
                removed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = currentColors.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = currentColors.background;
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: isDarkMode ? "#991b1b" : "#ef4444",
                  color: "#ffffff",
                  border: isDarkMode ? "#7f1d1d" : "#dc2626",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode
                    ? "#b91c1c"
                    : "#f87171";
                  e.target.style.borderColor = isDarkMode
                    ? "#991b1b"
                    : "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isDarkMode
                    ? "#991b1b"
                    : "#ef4444";
                  e.target.style.borderColor = isDarkMode
                    ? "#7f1d1d"
                    : "#dc2626";
                }}
              >
                <FiX size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
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
    </div>
  );
};
export default ProfFilesShared;
