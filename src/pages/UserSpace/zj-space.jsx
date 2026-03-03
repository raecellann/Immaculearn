import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import Button from "../component/button_2";
import AddMember from "../component/AddMember";
import { useSpaceTheme } from "../../contexts/theme/spaceThemeContextProvider";
import {
  DeleteConfirmationDialog,
  SuccessDialog,
  CancelledDialog,
} from "../component/SweetAlert.jsx";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiCopy,
  FiUpload,
  FiRefreshCw,
  FiPaperclip,
  FiUser,
  FiMinimize2,
  FiMaximize2,
  FiSend,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUserPosts } from "../../hooks/useUserPosts";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import PageNotFound from "../PageNotFound/pageNotFound";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { timeAgo } from "../../utils/timeAgo.js";
import isValidEmail from "../../utils/isValidEmail.js";
import { useSpaceChat } from "../../hooks/useSpaceChat";

const UserPage = () => {
  const { space_uuid, space_name } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Add loading state for post creation
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // State hooks - MUST BE AT THE TOP
  const [isFocused, setIsFocused] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, completed, error
  const [uploadError, setUploadError] = useState(null);
  const [backgroundUpload, setBackgroundUpload] = useState(false);
  const [showUploadNotification, setShowUploadNotification] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [previousCoverPhotoUrl, setPreviousCoverPhotoUrl] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
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

  // Chat states
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // State for dialog management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCancelledDialog, setShowCancelledDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Refs - MUST BE AT THE TOP
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);
  const mobileEditorRef = useRef(null);
  const desktopEditorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHAR = 250;

  // Custom hooks - MUST BE AT THE TOP
  const { user, isLoading: userLoading } = useUser();
  const { addNotification, showGlobalNotification } = useNotification();
  const {
    setCurrentSpace,
    userSpaces,
    courseSpaces,
    friendSpaces,
    joinRequestsByLink,
    isLoading: spaceLoading,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace,
    inviteUser,
  } = useSpace();

  // Chat hook
  const { messages, sendMessage, spaceOnlineUsers, getOnlineCount } =
    useSpaceChat(space_uuid, user);

  // Find current space
  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];

  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  if (currentSpace) {
    setCurrentSpace(currentSpace);
  }

  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;

  // Debug logging
  console.log("Debug info:", {
    currentSpace: currentSpace,
    user: user,
    currentSpaceCreator: currentSpace?.creator,
    userId: user?.id,
    isOwnerSpace,
    space_uuid,
    space_name,
  });

  const isFriendSpace = !isOwnerSpace;

  // Posts hook with React Query for 15-minute auto-re-render
  const { createPost, createComment, getPosts, getComments } = useUserPosts();

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts", currentSpace?.space_id],
    queryFn: () => getPosts(currentSpace?.space_id || ""),
    enabled: !!currentSpace?.space_id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
  });

  const posts = postsData?.data || [];

  // Comments state
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});
  const [isLoadingComments, setIsLoadingComments] = useState({});

  // Comment functions
  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Load comments if not already loaded
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const loadComments = async (postId) => {
    setIsLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const result = await getComments(postId);
      if (result.success && result.data) {
        setComments((prev) => ({ ...prev, [postId]: result.data }));
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCreateComment = async (postId) => {
    const commentContent = commentInputs[postId]?.trim();

    if (!commentContent || !currentSpace?.space_id) {
      addNotification({
        type: "error",
        message: "Please write something before commenting",
      });
      return;
    }

    setIsLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const result = await createComment({
        space_id: currentSpace?.space_id,
        post_id: postId,
        post_content: commentContent,
      });

      if (result.success) {
        // Clear comment input
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

        // Reload comments
        await loadComments(postId);

        addNotification({
          type: "success",
          message: "Comment posted successfully!",
        });
      } else {
        addNotification({
          type: "error",
          message: result.message || "Failed to post comment",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to post comment. Please try again.",
      });
    } finally {
      setIsLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Join requests - MUST BE AT THE TOP (unconditionally)
  // const {
  //   data: joinRequestsByLink = [],
  //   isLoading: joinRequestsLoading,
  //   refetch: refetchJoinRequests,
  // } = useJoinRequests(space_uuid || "");

  // Calculate pending invites count
  const pendingInvitesCount = joinRequestsByLink?.length || 0;

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

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  // Scroll handler
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

  // Sync editors when screen size changes
  useEffect(() => {
    const syncEditors = () => {
      const isMobile = window.innerWidth < 1024;
      
      // Sync content between editors when switching screen sizes
      if (isMobile && desktopEditorRef.current && mobileEditorRef.current) {
        if (mobileEditorRef.current.innerText.trim() === "" && desktopEditorRef.current.innerText.trim() !== "") {
          mobileEditorRef.current.innerText = desktopEditorRef.current.innerText;
        }
      } else if (!isMobile && mobileEditorRef.current && desktopEditorRef.current) {
        if (desktopEditorRef.current.innerText.trim() === "" && mobileEditorRef.current.innerText.trim() !== "") {
          desktopEditorRef.current.innerText = mobileEditorRef.current.innerText;
        }
      }
    };

    window.addEventListener("resize", syncEditors);
    syncEditors(); // Initial sync
    
    return () => window.removeEventListener("resize", syncEditors);
  }, []);

  // UUID validation
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Loading state
  if (userLoading || spaceLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return <PageNotFound />;
  }

  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // Text formatting
  const applyFormat = (command) => {
    // Get the appropriate editor based on screen size
    const isMobile = window.innerWidth < 1024;
    const activeEditor = isMobile ? mobileEditorRef.current : desktopEditorRef.current;
    
    activeEditor?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  // Chat handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage("");

    // Auto-scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle post creation
  const handleCreatePost = async () => {
    // Get content from the appropriate editor based on screen size
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    const activeEditor = isMobile ? mobileEditorRef.current : desktopEditorRef.current;
    const postContent = activeEditor?.innerText?.trim();

    if (!postContent || !currentSpace?.space_id) {
      addNotification({
        type: "error",
        message: "Please write something before posting",
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      const result = await createPost({
        space_id: currentSpace.space_id,
        post_content: postContent,
      });

      if (result.success) {
        // Clear both editors
        if (mobileEditorRef.current) mobileEditorRef.current.innerHTML = "";
        if (desktopEditorRef.current) desktopEditorRef.current.innerHTML = "";
        setIsFocused(false);

        // Refetch posts to get the latest data
        refetchPosts();

        addNotification({
          type: "success",
          message: "Post created successfully!",
        });
      } else {
        addNotification({
          type: "error",
          message: result.message || "Failed to create post",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to create post. Please try again.",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Invite member
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!currentSpace) return;

    // Show delete confirmation dialog
    setDialogMessage(currentSpace.space_name);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    // Prevent multiple executions
    if (!currentSpace || !showDeleteDialog) return;

    setShowDeleteDialog(false);

    try {
      await deleteSpace(currentSpace.space_uuid, user.id);

      // Navigate immediately after successful deletion
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      addNotification({
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete space. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
  };

  const handleCancelledClose = () => {
    setShowCancelledDialog(false);
  };

  // Handle join requests
  const handleAcceptJoinRequest = async (userId) => {
    try {
      console.log(userId);
      await acceptJoinRequest(userId, currentSpace?.space_uuid);
      addNotification({
        type: "success",
        title: "Request Accepted",
        message: "Member has been added to the space successfully.",
        duration: 3000,
      });
      // Immediately refetch to update the UI
      refetchJoinRequests();
    } catch (error) {
      console.error("Failed to accept join request:", error);
      addNotification({
        type: "error",
        title: "Accept Failed",
        message: "Failed to accept join request. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
      addNotification({
        type: "info",
        title: "Request Declined",
        message: "Join request has been declined.",
        duration: 3000,
      });
      // Immediately refetch to update the UI
      // refetchJoinRequests();
    } catch (error) {
      console.error("Failed to decline join request:", error);
      addNotification({
        type: "error",
        title: "Decline Failed",
        message: "Failed to decline join request. Please try again.",
        duration: 5000,
      });
    }
  };

  // Send invite
  const sendInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      addNotification({
        type: "error",
        title: "Invalid Email",
        message: "Please enter an email address",
        duration: 3000,
      });
      return;
    }

    if (!isValidEmail(email)) {
      addNotification({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid Gmail address",
        duration: 3000,
      });
      return;
    }

    try {
      const result = await inviteUser(space_uuid, email);

      if (result.success) {
        addNotification({
          type: "success",
          title: "Invitation Sent",
          message: `Invitation has been sent to ${email}`,
          duration: 3000,
        });
        setInviteEmail("");
        setShowInvitePopup(false);
      } else {
        addNotification({
          type: "error",
          title: "Invitation Failed",
          message: result.message || "Failed to send invitation",
          duration: 3000,
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Invitation Failed",
        message: "Failed to send invitation. Please try again.",
        duration: 3000,
      });
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
    const newPosition = Math.max(
      0,
      Math.min(100, dragStartPosition - positionChange),
    );

    setCoverPhotoPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
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
      
      addNotification({
        type: "success",
        title: "Cover Photo Updated",
        message: "Your cover photo has been updated successfully!",
        duration: 3000,
      });
    } else {
      // For images, create canvas to apply transformations
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas size to cover photo dimensions
        canvas.width = 1200;
        canvas.height = 400;

        // Calculate scale to cover the entire canvas
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate position based on user vertical positioning
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);

        // Draw the image with transformations
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to data URL and update
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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
      coverPhotoInputRef.current.value = "";
    }
  };

  // Handle gradient selection for cover photo
  const handleGradientSelection = (gradient) => {
    setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
    setCoverPhotoUrl(gradient);
    setShowCoverPhotoConfirm(true); // Show confirmation dialog for gradients
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  const resetCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoPosition(50);
    // Remove from localStorage
    localStorage.removeItem(`coverPhoto_${space_uuid}`);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  // Handle chat popup
  const handleEnterChat = () => {
    setShowChatPopup(true);
  };

  const handleCloseChat = () => {
    setShowChatPopup(false);
  };

  // Sample space members (replace with actual data from your backend)
  const spaceMembers = [
    {
      id: user?.id,
      name: user?.fullname || "You",
      email: user?.email,
      avatar: user?.profile_pic,
      online: true,
    },
    {
      id: 2,
      name: "Zeldrick",
      email: "zeldrick@example.com",
      avatar:
        "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
      online: true,
    },
    {
      id: 3,
      name: "Nathaniel",
      email: "nathaniel@example.com",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
      online: false,
    },
  ];

  // File validation
  const validateFile = (file) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".xls", ".xlsx"];

    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    return isValidType || isValidExtension;
  };

  // Parse CSV/Excel file
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let data = [];
          let headers = [];

          if (file.name.toLowerCase().endsWith(".csv")) {
            // Handle CSV files
            const text = e.target.result;
            const lines = text.split("\n").filter((line) => line.trim());
            headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

            data = lines.slice(1).map((line, index) => {
              const values = line.split(",").map((v) => v.trim());
              return {
                id: `member-${index}`,
                email: values[0] || "",
                name: values[1] || "",
                status: "pending",
              };
            });
          } else {
            // Handle Excel files (XLS/XLSX)
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            headers = jsonData[0].map((h) => String(h).trim().toLowerCase());

            data = jsonData.slice(1).map((row, index) => {
              return {
                id: `member-${index}`,
                email: row[0] ? String(row[0]).trim() : "",
                name: row[1] ? String(row[1]).trim() : "",
                status: "pending",
              };
            });
          }

          // Find email column index
          const emailColumnIndex = headers.findIndex(
            (header) => header === "email" || header === "emails",
          );

          if (emailColumnIndex === -1) {
            reject(
              new Error(
                'No "email" or "emails" header found in the file. Please ensure your file has a header row with "email" or "emails" column.',
              ),
            );
            return;
          }

          // Find name column index (optional)
          const nameColumnIndex = headers.findIndex(
            (header) =>
              header === "name" ||
              header === "fullname" ||
              header === "full_name",
          );

          // Re-process data with correct column mapping
          if (file.name.toLowerCase().endsWith(".csv")) {
            const text = e.target.result;
            const lines = text.split("\n").filter((line) => line.trim());

            data = lines.slice(1).map((line, index) => {
              const values = line.split(",").map((v) => v.trim());
              return {
                id: `member-${index}`,
                email: values[emailColumnIndex] || "",
                name:
                  nameColumnIndex !== -1 ? values[nameColumnIndex] || "" : "",
                status: "pending",
              };
            });
          } else {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            data = jsonData.slice(1).map((row, index) => {
              return {
                id: `member-${index}`,
                email: row[emailColumnIndex]
                  ? String(row[emailColumnIndex]).trim()
                  : "",
                name:
                  nameColumnIndex !== -1
                    ? row[nameColumnIndex]
                      ? String(row[nameColumnIndex]).trim()
                      : ""
                    : "",
                status: "pending",
              };
            });
          }

          // Filter for Gmail addresses only and valid emails
          const gmailOnlyMembers = data.filter((member) => {
            const email = member.email.toLowerCase();
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            return gmailRegex.test(email);
          });

          if (gmailOnlyMembers.length === 0) {
            reject(
              new Error(
                "No valid Gmail addresses found in the file. Please ensure emails are in format: username@gmail.com",
              ),
            );
            return;
          }

          if (gmailOnlyMembers.length < data.length) {
            const nonGmailCount = data.length - gmailOnlyMembers.length;
            console.log(`Filtered out ${nonGmailCount} non-Gmail addresses`);
          }

          resolve(gmailOnlyMembers);
        } catch (error) {
          reject(new Error("Failed to parse file: " + error.message));
        }
      };

      if (file.name.toLowerCase().endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  // Process upload queue
  const processUploadQueue = async () => {
    setUploadStatus("uploading");
    setUploadError(null);
    setBackgroundUpload(true);
    setShowUploadModal(false);
    setShowUploadNotification(true);

    const updatedQueue = [...uploadQueue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const member = updatedQueue[i];

      try {
        // Simulate API call delay
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000),
        );

        // Simulate random success/failure (90% success rate)
        if (Math.random() > 0.1) {
          updatedQueue[i] = { ...member, status: "completed" };
        } else {
          updatedQueue[i] = {
            ...member,
            status: "error",
            error: "Failed to send invitation",
          };
        }

        setUploadQueue([...updatedQueue]);
        setUploadProgress((prev) => ({ ...prev, [member.id]: i + 1 }));
      } catch (error) {
        updatedQueue[i] = { ...member, status: "error", error: error.message };
        setUploadQueue([...updatedQueue]);
      }
    }

    const hasErrors = updatedQueue.some((m) => m.status === "error");
    setUploadStatus(hasErrors ? "error" : "completed");

    // Show completion notification
    setTimeout(() => {
      if (!hasErrors) {
        addNotification({
          type: "success",
          title: "All Invitations Sent",
          message: `Successfully invited ${updatedQueue.length} members!`,
          duration: 5000,
        });
        resetUploadState();
      } else {
        const successCount = updatedQueue.filter(
          (m) => m.status === "completed",
        ).length;
        const errorCount = updatedQueue.filter(
          (m) => m.status === "error",
        ).length;
        addNotification({
          type: "warning",
          title: "Upload Completed with Issues",
          message: `${successCount} successful, ${errorCount} failed. Check upload status for details.`,
          duration: 7000,
        });
      }
    }, 500);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      addNotification({
        type: "error",
        title: "Invalid File",
        message: "Please upload a valid CSV or Excel file",
        duration: 5000,
      });
      return;
    }

    try {
      const members = await parseFile(file);

      if (members.length === 0) {
        addNotification({
          type: "warning",
          title: "No Members Found",
          message: "No valid members found in file",
          duration: 5000,
        });
        return;
      }

      // Show info about Gmail filtering
      const totalParsed = members.length;
      addNotification({
        type: "info",
        title: "File Processed",
        message: `Found ${totalParsed} valid Gmail address(es). Non-Gmail addresses have been filtered out.`,
        duration: 5000,
      });

      setUploadQueue(members);
      setShowUploadModal(true);
      setUploadStatus("idle");
      setShowInvitePopup(false);
      // Reset file input
      event.target.value = "";
    } catch (error) {
      addNotification({
        type: "error",
        title: "Parse Error",
        message: "Error parsing file: " + error.message,
        duration: 5000,
      });
    }
  };

  // Retry failed uploads
  const retryFailedUploads = () => {
    const failedMembers = uploadQueue.filter((m) => m.status === "error");
    const updatedQueue = uploadQueue.map((m) =>
      m.status === "error" ? { ...m, status: "pending", error: null } : m,
    );

    setUploadQueue(updatedQueue);
    setUploadStatus("uploading");
    setUploadError(null);

    // Process only failed members
    processUploadQueue();
  };

  // Reset upload state
  const resetUploadState = () => {
    setUploadQueue([]);
    setUploadProgress({});
    setUploadStatus("idle");
    setUploadError(null);
    setBackgroundUpload(false);
    setShowUploadNotification(false);
  };

  // Remove member from upload queue
  const removeMemberFromQueue = (memberId) => {
    const updatedQueue = uploadQueue.filter((member) => member.id !== memberId);
    setUploadQueue(updatedQueue);

    if (updatedQueue.length === 0) {
      setShowUploadModal(false);
      resetUploadState();
    }
  };

  // Close upload modal
  const closeUploadModal = () => {
    if (uploadStatus === "uploading") {
      if (!confirm("Start upload in background and continue?")) {
        return;
      }
    }
    setShowUploadModal(false);
  };

  // Show upload status modal
  const showUploadStatusModal = () => {
    setShowUploadModal(true);
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        color: currentColors.text,
      }}
    >
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
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                ({currentSpace?.members?.length || 0} member(s))
              </span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div
                    onClick={() => setShowPendingInvitations(true)}
                    className="relative"
                  >
                    <Button text="Pending Invites" />
                    {pendingInvitesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingInvitesCount}
                      </span>
                    )}
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
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
                <button className="font-semibold border-b-2 border-white pb-2">
                  Stream
                </button>
                <button
                  onClick={() => {
                    console.log("Tasks button clicked:", {
                      isOwnerSpace,
                      space_uuid,
                      space_name,
                    });
                    const targetRoute = `/space/${space_uuid}/${space_name}/tasks`;
                    console.log("Navigating to:", targetRoute);
                    navigate(targetRoute);
                  }}
                >
                  Tasks
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/files`)
                  }
                >     
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/people`)
                  }
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
              <div
                onClick={() => setShowPendingInvitations(true)}
                className="relative"
              >
                <Button text="Pending Invites" />
                {pendingInvitesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingInvitesCount}
                  </span>
                )}
              </div>
              <div onClick={handleDeleteRoom}>
                <Button text="Delete Room" />
              </div>
            </div>
          )}

          {/* Space Link - Mobile (Non-owners) */}
          {isFriendSpace && (
            <div className="md:hidden flex justify-end mb-6">
              <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md max-w-full">
                <span className="text-xs text-blue-400 break-all flex-1">
                  {currentSpace?.space_link || "Loading..."}
                </span>
                <button
                  onClick={() => handleCopyLink(currentSpace?.space_link)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          )}

          {/* MAIN CONTENT GRID */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4">
            {/* LEFT SIDEBAR - 30% */}
            <div className="w-full lg:w-[30%] order-1 lg:order-1">
              {/* MOBILE CREATE POST - Only visible on mobile */}
              {isOwnerSpace && (
                <div className="lg:hidden mb-6">
                  <div
                    className={`
                    bg-white rounded-xl border cursor-text transition
                    ${isFocused ? "border-black" : "border-transparent"}
                    hover:border-black
                  `}
                    onClick={() => mobileEditorRef.current?.focus()}
                  >
                    <div className="relative p-6">
                      {/* AVATAR */}
                      <img
                        src={
                          user?.profile_pic ||
                          "/src/assets/HomePage/frieren-avatar.jpg"
                        }
                        alt="Avatar"
                        className="absolute left-6 top-6 w-10 h-10 rounded-full"
                      />

                      {/* EDITOR */}
                      <div
                        ref={mobileEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                          if (mobileEditorRef.current.innerText.trim() === "") {
                            setIsFocused(false);
                          }
                        }}
                        onInput={() => {
                          let text = mobileEditorRef.current.innerText;

                          if (text.length > MAX_CHAR) {
                            text = text.substring(0, MAX_CHAR);
                            mobileEditorRef.current.innerText = text;

                            // Move cursor to end
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.selectNodeContents(mobileEditorRef.current);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                          }

                          setCharCount(text.length);
                        }}
                        className="
                        editor
                        w-full
                        min-h-[40px]
                        bg-white
                        text-black
                        text-sm
                        pl-14
                        pr-4
                        py-2
                        outline-none
                      "
                      />

                      {/* ACTIONS */}
                      {isFocused && (
                        <>
                          {/* FORMAT */}

                          <div className="mt-4 border-t border-gray-300" />

                          {/* FOOTER */}
                          <div className="mt-4 flex justify-between items-center">
                            <div>
                              <span
                                className={`text-xs sm:text-sm ${
                                  charCount > MAX_CHAR
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {charCount}/{MAX_CHAR}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
                              <button
                                onClick={() => {
                                  setIsFocused(false);
                                  mobileEditorRef.current.innerHTML = "";
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 whitespace-nowrap"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCreatePost}
                                disabled={isCreatingPost}
                                className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCreatingPost ? "Posting..." : "Post"}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REMINDERS - STICKY */}
              <div
                className={`sticky top-4 bg-[#1B1F26] border border-gray-700 rounded-xl p-6 ${isOwnerSpace ? "h-fit max-h-[400px]" : "h-full"}`}
                style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
              >
                <h2 className="font-bold mb-4">Reminders</h2>
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">
                    No reminders posted yet
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Reminders will appear here when created
                  </p>
                </div>

                {/* CHAT */}
                <button
                  onClick={() => setShowChatPopup(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? "#000000" : "transparent",
                    borderColor: currentColors.border,
                    color: currentColors.text,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = isDarkMode
                      ? "#1f2937"
                      : currentColors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = isDarkMode
                      ? "#000000"
                      : "transparent";
                  }}
                >
                  <FiMessageCircle />
                  Enter Chat
                </button>

                {/* Chat Popup */}
                {showChatPopup && (
                  <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-0">
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                      onClick={() => !isChatMinimized && setShowChatPopup(false)}
                    />
                    <div
                      className={`relative w-full ${isChatMaximized ? "h-screen max-w-full" : "max-w-md sm:max-w-lg"} transform transition-all duration-300 ease-in-out ${isChatMinimized ? "translate-y-[calc(100%-48px)]" : ""}`}
                    >
                      {/* Chat Header */}
                      <div className="flex items-center justify-between bg-[#1E222A] rounded-t-lg p-3 border-b border-gray-700 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <FiUser className="text-white text-sm" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">
                              {spaceName}
                            </h3>
                            <div className="flex items-center py-2 text-sm text-gray-400">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${spaceOnlineUsers[space_uuid]?.length ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span>
                                {spaceOnlineUsers[space_uuid]?.length || 0}{" "}
                                online
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsChatMaximized(!isChatMaximized);
                            }}
                            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700"
                            title={isChatMaximized ? "Restore" : "Maximize"}
                          >
                            {isChatMaximized ? (
                              <FiMinimize2 size={14} />
                            ) : (
                              <FiMaximize2 size={14} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowChatPopup(false);
                              setIsChatMinimized(false);
                              setIsChatMaximized(false);
                            }}
                            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700"
                            title="Close"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      {!isChatMinimized && (
                        <>
                          <div
                            className={`bg-[#141820] overflow-y-auto ${isChatMaximized ? "h-[calc(100vh-120px)]" : "h-96"} p-4 space-y-2`}
                          >
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`flex flex-col pl-2 ${message.senderId === user?.id ? "items-end" : "items-start"}`}
                                >
                                  <div
                                    className={`p-3 rounded-lg max-w-xs break-words ${message.senderId === user?.id ? "bg-blue-500 rounded-tr-none text-white" : "bg-gray-700 rounded-tl-none text-gray-200"}`}
                                  >
                                    {message.content}
                                  </div>
                                  <p
                                    className={`text-xs mt-2 ${message.senderId === user?.id ? "text-blue-100 text-right" : "text-gray-400 text-left"}`}
                                  >
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Chat Input */}
                          <form
                            onSubmit={handleSendMessage}
                            className="bg-[#1B1F26] p-3 rounded-b-lg border-t border-gray-700"
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                className="text-gray-400 hover:text-white p-2"
                              >
                                <FiPaperclip />
                              </button>
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#141820] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <button
                                type="submit"
                                className="text-blue-400 hover:text-blue-300 p-2"
                                disabled={!newMessage.trim()}
                              >
                                <FiSend />
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT CONTENT - 70% */}
            <div className="w-full lg:w-[70%] space-y-6 order-2 lg:order-2">
              {/* DESKTOP CREATE POST - Only visible on desktop/laptop */}
              {isOwnerSpace && (
                <div className="hidden lg:block">
                  <div
                    className={`
                    bg-white rounded-xl border cursor-text transition
                    ${isFocused ? "border-black" : "border-black"}
                    hover:border-black
                  `}
                    onClick={() => desktopEditorRef.current?.focus()}
                  >
                    <div className="relative p-6">
                      {/* AVATAR */}
                      <img
                        src={
                          user?.profile_pic ||
                          "/src/assets/HomePage/frieren-avatar.jpg"
                        }
                        alt="Avatar"
                        className="absolute left-6 top-6 w-10 h-10 rounded-full"
                      />

                      {/* EDITOR */}
                      <div
                        ref={desktopEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                          if (desktopEditorRef.current.innerText.trim() === "") {
                            setIsFocused(false);
                          }
                        }}
                        onInput={() => {
                          let text = desktopEditorRef.current.innerText;

                          if (text.length > MAX_CHAR) {
                            text = text.substring(0, MAX_CHAR);
                            desktopEditorRef.current.innerText = text;

                            // Move cursor to end
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.selectNodeContents(desktopEditorRef.current);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                          }

                          setCharCount(text.length);
                        }}
                        className="
                        editor
                        w-full
                        min-h-[40px]
                        bg-white
                        text-black
                        text-sm
                        pl-14
                        pr-4
                        py-2
                        outline-none
                      "
                      />

                      {/* ACTIONS */}
                      {isFocused && (
                        <>
                          {/* FORMAT */}

                          <div className="mt-4 border-t border-gray-300" />

                          {/* FOOTER */}
                          <div className="mt-4 flex justify-between items-center">
                            <div>
                              <span
                                className={`text-xs sm:text-sm ${
                                  charCount > MAX_CHAR
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {charCount}/{MAX_CHAR}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
                              <button
                                onClick={() => {
                                  setIsFocused(false);
                                  desktopEditorRef.current.innerHTML = "";
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 whitespace-nowrap"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleCreatePost}
                                disabled={isCreatingPost}
                                className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCreatingPost ? "Posting..." : "Post"}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* POSTS FEED */}
              <div
                className={`bg-[#1B1F26] border border-gray-700 rounded-xl p-6 ${!isOwnerSpace && "h-full"} `}
                style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
              >
                <h2 className="font-bold mb-4 text-sm sm:text-base">
                  Announcement Feed
                </h2>

                {isLoadingPosts ? (
                  <div className="text-center py-8">
                    <p
                      className="text-sm sm:text-base"
                      style={{ color: currentColors.textSecondary }}
                    >
                      Loading posts...
                    </p>
                  </div>
                ) : postsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 text-sm sm:text-base">
                      Error loading posts
                    </p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p
                      className="text-base sm:text-lg"
                      style={{ color: currentColors.textSecondary }}
                    >
                      No posts yet
                    </p>
                    <p
                      className="text-xs sm:text-sm mt-1"
                      style={{ color: currentColors.textSecondary }}
                    >
                      Posts will appear here when created
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.post_id}
                        className="rounded-lg p-4 border"
                        style={{
                          backgroundColor: currentColors.background,
                          borderColor: isDarkMode
                            ? currentColors.border
                            : "#e5e7eb",
                          borderWidth: isDarkMode ? "1px" : "1px 0 1px 0",
                        }}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          {/* Avatar */}
                          {post.profile_pic ? (
                            <div
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                            >
                              <img
                                src={post.profile_pic}
                                alt={post.user_full_name || "User"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-xs sm:text-sm"
                              style={{
                                backgroundColor: currentColors.surface,
                                color: currentColors.text,
                              }}
                            >
                              {post.user_full_name?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                          )}

                          {/* Post Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                              <span
                                className="font-semibold text-xs sm:text-sm truncate"
                                style={{ color: currentColors.text }}
                              >
                                {post.user_full_name || "Unknown User"}
                              </span>
                              <span
                                className="text-xs"
                                style={{ color: currentColors.textSecondary }}
                              >
                                {timeAgo(post?.created_at)}
                              </span>
                            </div>
                            <p
                              className="whitespace-pre-wrap mb-3 text-sm break-words"
                              style={{ color: currentColors.text }}
                            >
                              {post.post_content}
                            </p>

                            {/* Comment Button */}
                            <button
                              onClick={() => toggleComments(post.post_id)}
                              className="flex items-center space-x-2 transition-colors text-xs sm:text-sm"
                              style={{ color: currentColors.textSecondary }}
                              onMouseEnter={(e) => {
                                e.target.style.color = currentColors.text;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color =
                                  currentColors.textSecondary;
                              }}
                            >
                              <FiMessageCircle
                                size={12}
                                className="sm:size-4"
                              />
                              <span>Comments</span>
                              {post.reply_count > 0 && (
                                <span
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: currentColors.surface,
                                    color: currentColors.textSecondary,
                                  }}
                                >
                                  {post.reply_count}
                                </span>
                              )}
                            </button>

                            {/* Comments Section */}
                            {expandedPosts.has(post.post_id) && (
                              <div
                                className="mt-4 pt-4 border-t"
                                style={{
                                  borderColor: isDarkMode
                                    ? currentColors.border
                                    : "#d1d5db",
                                }}
                              >
                                {/* Existing Comments */}
                                {comments[post.post_id] &&
                                  comments[post.post_id].length > 0 && (
                                    <div className="space-y-3 mb-4">
                                      {comments[post.post_id].map((comment) => (
                                        <div
                                          key={comment.post_id}
                                          className="flex items-start space-x-2 py-3 border-b last:border-b-0"
                                          style={{
                                            borderColor: isDarkMode
                                              ? currentColors.border
                                              : "#e5e7eb",
                                          }}
                                        >
                                          {/* <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                            {comment.user_full_name
                                              ?.charAt(0)
                                              ?.toUpperCase() || "U"}
                                          </div> */}

                                          {comment.profile_pic ? (
                                            <div
                                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                                              style={{
                                                backgroundColor:
                                                  currentColors.surface,
                                              }}
                                            >
                                              <img
                                                src={comment.profile_pic}
                                                alt={
                                                  comment.user_full_name ||
                                                  "User"
                                                }
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <div
                                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-sm sm:text-sm"
                                              style={{
                                                backgroundColor:
                                                  currentColors.surface,
                                                color: currentColors.text,
                                              }}
                                            >
                                              {comment.user_full_name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                              <span
                                                className="font-medium text-sm sm:text-sm truncate"
                                                style={{
                                                  color: currentColors.text,
                                                }}
                                              >
                                                {comment.user_full_name ||
                                                  "Unknown User"}
                                              </span>
                                              <span
                                                className="text-xs sm:text-xs"
                                                style={{
                                                  color:
                                                    currentColors.textSecondary,
                                                }}
                                              >
                                                {timeAgo(comment?.created_at)}
                                              </span>
                                            </div>
                                            <p
                                              className="text-sm sm:text-sm whitespace-pre-wrap break-words"
                                              style={{
                                                color: currentColors.text,
                                              }}
                                            >
                                              {comment.post_content}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                {/* Comment Loading */}
                                {isLoadingComments[post.post_id] && (
                                  <div className="text-center py-2">
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: currentColors.textSecondary,
                                      }}
                                    >
                                      Loading comments...
                                    </p>
                                  </div>
                                )}

                                {/* Add Comment */}
                                <div className="flex items-start space-x-2">
                                  {/* <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                    {user?.username?.charAt(0)?.toUpperCase() ||
                                      "Y"}
                                  </div> */}
                                  {user?.profile_pic ? (
                                    <div
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                                      style={{
                                        backgroundColor: currentColors.surface,
                                      }}
                                    >
                                      <img
                                        src={user?.profile_pic}
                                        alt={user?.full_name || "User"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-sm sm:text-sm"
                                      style={{
                                        backgroundColor: currentColors.surface,
                                        color: currentColors.text,
                                      }}
                                    >
                                      {user?.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "Y"}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <textarea
                                      value={commentInputs[post.post_id] || ""}
                                      onChange={(e) =>
                                        handleCommentChange(
                                          post.post_id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Write a comment..."
                                      className="w-full rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-sm"
                                      style={{
                                        backgroundColor:
                                          currentColors.background,
                                        color: currentColors.text,
                                        border: `1px solid ${currentColors.border}`,
                                      }}
                                      rows="2"
                                    />
                                    <div className="flex justify-end mt-2">
                                      <button
                                        onClick={() =>
                                          handleCreateComment(post.post_id)
                                        }
                                        disabled={
                                          !commentInputs[
                                            post.post_id
                                          ]?.trim() ||
                                          isLoadingComments[post.post_id]
                                        }
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isLoadingComments[post.post_id]
                                          ? "Posting..."
                                          : "Post"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PENDING INVITATIONS POPUP */}
        {showPendingInvitations && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pending Invitations</h2>
                <button
                  onClick={() => setShowPendingInvitations(false)}
                  className="text-gray-400 hover:text-white p-1 bg-transparent"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Invitations List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {joinRequestsByLink.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No pending invitations
                  </p>
                ) : (
                  joinRequestsByLink.map((invitation) => (
                    <div
                      key={invitation.account_id}
                      className="bg-[#2A2F3A] rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={invitation.profile_pic}
                          alt={invitation.fullname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{invitation.fullname}</h3>
                          <p className="text-sm text-gray-400">
                            {invitation.email}
                          </p>
                          <p className="text-sm mt-1">
                            {invitation.message || "Hello world"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
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

        {/* ADD MEMBER COMPONENT */}
        <AddMember
          currentSpace={currentSpace}
          onInviteMember={handleInviteMember}
          showInvitePopup={showInvitePopup}
          setShowInvitePopup={setShowInvitePopup}
        />

        {/* BACKGROUND UPLOAD NOTIFICATION */}
        {showUploadNotification && (
          <div className="fixed bottom-4 right-4 bg-[#1E222A] border border-gray-700 rounded-lg p-4 shadow-xl z-40 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">Inviting Members</h3>
              <button
                onClick={showUploadStatusModal}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Details
              </button>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Progress</span>
                <span className="text-gray-300">
                  {Object.keys(uploadProgress).length} / {uploadQueue.length}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.keys(uploadProgress).length / uploadQueue.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Upload continues in background. You can continue using the
              application.
            </p>
          </div>
        )}

        {/* UPLOAD STATUS MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {backgroundUpload
                    ? "Upload Status"
                    : uploadStatus === "idle"
                      ? "Review Members"
                      : uploadStatus === "uploading"
                        ? "Inviting Members..."
                        : uploadStatus === "completed"
                          ? "Upload Completed"
                          : "Upload Issues"}
                </h2>
                <button
                  onClick={
                    backgroundUpload ? showUploadStatusModal : closeUploadModal
                  }
                  className="text-gray-400 hover:text-white p-1 bg-transparent"
                  disabled={uploadStatus === "uploading" && !backgroundUpload}
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {uploadStatus === "idle" && (
                  <div>
                    <p className="text-sm text-gray-300 mb-4">
                      Found {uploadQueue.length} member(s) to invite. Review and
                      remove any you don't want to include.
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadQueue.map((member) => (
                        <div
                          key={member.id}
                          className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {member.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {member.email}
                            </p>
                          </div>
                          <button
                            onClick={() => removeMemberFromQueue(member.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                            title="Remove member"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadStatus === "uploading" && (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-gray-300">
                          {Object.keys(uploadProgress).length} /{" "}
                          {uploadQueue.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(Object.keys(uploadProgress).length / uploadQueue.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadQueue.map((member) => (
                        <div
                          key={member.id}
                          className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {member.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {member.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.status === "pending" && (
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
                            )}
                            {member.status === "completed" && (
                              <span className="text-green-400 text-xs">
                                ✓ Sent
                              </span>
                            )}
                            {member.status === "error" && (
                              <span className="text-red-400 text-xs">
                                ✗ Failed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(uploadStatus === "completed" || uploadStatus === "error") && (
                  <div>
                    <div className="mb-4 p-4 bg-[#2A2F3A] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-medium">
                          ✓{" "}
                          {
                            uploadQueue.filter((m) => m.status === "completed")
                              .length
                          }{" "}
                          invitations sent
                        </span>
                        {uploadQueue.some((m) => m.status === "error") && (
                          <span className="text-red-400 font-medium">
                            ✗{" "}
                            {
                              uploadQueue.filter((m) => m.status === "error")
                                .length
                            }{" "}
                            failed
                          </span>
                        )}
                      </div>
                    </div>

                    {uploadQueue.some((m) => m.status === "error") && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-300 mb-2">
                          Failed invitations:
                        </p>
                        {uploadQueue
                          .filter((m) => m.status === "error")
                          .map((member) => (
                            <div
                              key={member.id}
                              className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {member.name || "No name"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {member.email}
                                </p>
                                <p className="text-xs text-red-400 mt-1">
                                  {member.error}
                                </p>
                              </div>
                              <span className="text-red-400 text-xs">
                                ✗ Failed
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                {uploadStatus === "idle" && !backgroundUpload && (
                  <>
                    <button
                      onClick={closeUploadModal}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processUploadQueue}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                      disabled={uploadQueue.length === 0}
                    >
                      Invite {uploadQueue.length} Member(s)
                    </button>
                  </>
                )}

                {uploadStatus === "uploading" && backgroundUpload && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">
                      Processing in background...
                    </span>
                    <button
                      onClick={() => setShowUploadNotification(false)}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Hide
                    </button>
                  </div>
                )}

                {uploadStatus === "uploading" && !backgroundUpload && (
                  <button
                    disabled
                    className="px-4 py-2 text-sm bg-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                  >
                    Processing...
                  </button>
                )}

                {uploadStatus === "completed" && (
                  <button
                    onClick={resetUploadState}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                  >
                    Done
                  </button>
                )}

                {uploadStatus === "error" && (
                  <>
                    <button
                      onClick={resetUploadState}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={retryFailedUploads}
                      className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 rounded-md transition text-white flex items-center gap-2"
                    >
                      <FiRefreshCw size={16} />
                      Retry Failed
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Post something to your space with a maximum of 250 letters";
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        space={
          currentSpace || {
            space_name: "Unknown Space",
            members: [],
            files: [],
            tasks: [],
          }
        }
      />

      {/* SUCCESS DIALOG */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessClose}
        message={dialogMessage}
      />

      {/* CANCELLED DIALOG */}
      <CancelledDialog
        isOpen={showCancelledDialog}
        onClose={handleCancelledClose}
        message={dialogMessage}
      />

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo
              </h2>
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

              {/* Separator Line */}
              <div className="relative flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-3 text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Upload Option (only show when gradient is selected) */}
              {coverPhotoUrl && coverPhotoUrl.includes('gradient') && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => coverPhotoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <FiUpload size={14} />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}

              {/* Image Positioning (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-white mb-3">Position Image</p>
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      ref={coverPhotoEditorRef}
                      className={`relative w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                      style={{
                        backgroundImage: `url(${coverPhotoUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: `center ${coverPhotoPosition}%`,
                        backgroundRepeat: "no-repeat",
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
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo?
              </h2>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300">
                Do you want to change the cover photo for this space with the
                image you uploaded?
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

export default UserPage;
