import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { toast } from "react-toastify";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUserPosts } from "../../hooks/useUserPosts";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import PageNotFound from "../PageNotFound/pageNotFound";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { timeAgo } from "../../utils/timeAgo.js";
import isValidEmail from "../../utils/isValidEmail.js";
import { useSpaceChat } from "../../hooks/useSpaceChat";
import profanityFilter from "../../utils/profanityFilter";

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
  
  // Sidebar minimization state
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
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
  const [hasProfanity, setHasProfanity] = useState(false);
  const [activeChatSpaceUuid, setActiveChatSpaceUuid] = useState(null);
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
    userSpacesLoading,
    courseSpacesLoading,
    friendSpacesLoading,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace,
    inviteUser,
  } = useSpace();

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
  // Sync active chat space UUID with URL params (only when it changes)
  // useEffect(() => {
  //   if (space_uuid && space_uuid !== activeChatSpaceUuid) {
  //     setActiveChatSpaceUuid(space_uuid);
  //   }
  // }, [space_uuid, activeChatSpaceUuid]);

  // Chat hook
  const { messages, sendMessage, spaceOnlineUsers, getOnlineCount } =
    useSpaceChat(activeChatSpaceUuid, user);

  console.log("NEED FOR MESSAGE", activeChatSpaceUuid, user.id, messages);

  // Map messages to render-friendly format with date grouping
  const chatMessages = useMemo(() => {
    return messages.map((m) => ({
      id: m.id || Math.random().toString(36).substr(2, 9),
      from: m.senderId === user.id ? "me" : "them",
      senderId: m.senderId,
      text: m.content,
      type: m.type || "text",
      imageUrl:
        m.type === "image" && m.imageUrl
          ? `data:image/jpeg;base64,${m.imageUrl}`
          : m.imageUrl,
      avatar: m.senderAvatar,
      timestamp: new Date(m.timestamp),
      time: new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(m.timestamp).toLocaleDateString(),
      status: m.status || "sent", // sent, delivered, read
      seen: m.seen || false,
    }));
  }, [messages, user.id]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups = {};
    chatMessages.forEach((message) => {
      const today = new Date().toLocaleDateString();
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

      let dateLabel = message.date;
      if (message.date === today) {
        dateLabel = "Today";
      } else if (message.date === yesterday) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = new Date(message.timestamp).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(message);
    });
    return groups;
  }, [chatMessages]);

  const isFriendSpace = !isOwnerSpace;

  // Posts hook with React Query for 15-minute auto-re-render
  const { createPost, createComment, getPosts, getComments } = useUserPosts();

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts", currentSpace?.space_uuid],
    queryFn: () => getPosts(currentSpace?.space_uuid || ""),
    enabled: !!currentSpace?.space_uuid,
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
      toast.error("Please write something before commenting");
      return;
    }

    setIsLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const result = await createComment({
        space_uuid: currentSpace?.space_uuid,
        post_id: postId,
        post_content: commentContent,
      });

      if (result.success) {
        // Clear comment input
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

        // Reload comments
        await loadComments(postId);

        toast.success("Comment posted successfully!");
      } else {
        toast.error(result.message || "Failed to post comment");
      }
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
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
  const pendingInvitesCount =
    joinRequestsByLink?.filter((s) => s.space_id === currentSpace?.space_id)
      .length || 0;

  // Load saved cover photo on component mount
  useEffect(() => {
    const savedCoverPhoto = currentSpace?.space_cover;

    console.log(savedCoverPhoto);
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

  // Scroll to bottom when chat popup opens
  useEffect(() => {
    if (showChatPopup && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [showChatPopup]);

  // Scroll to bottom when new messages are received
  useEffect(() => {
    if (showChatPopup && messagesEndRef.current && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages, showChatPopup]);

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
        if (
          mobileEditorRef.current.innerText.trim() === "" &&
          desktopEditorRef.current.innerText.trim() !== ""
        ) {
          mobileEditorRef.current.innerText =
            desktopEditorRef.current.innerText;
        }
      } else if (
        !isMobile &&
        mobileEditorRef.current &&
        desktopEditorRef.current
      ) {
        if (
          desktopEditorRef.current.innerText.trim() === "" &&
          mobileEditorRef.current.innerText.trim() !== ""
        ) {
          desktopEditorRef.current.innerText =
            mobileEditorRef.current.innerText;
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

  if (userSpacesLoading || courseSpacesLoading || friendSpacesLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  if (!isValidUuid || !currentSpace) {
    return <PageNotFound />;
  }

  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // Text formatting
  const applyFormat = (command) => {
    // Get the appropriate editor based on screen size
    const isMobile = window.innerWidth < 1024;
    const activeEditor = isMobile
      ? mobileEditorRef.current
      : desktopEditorRef.current;

    activeEditor?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  // Chat handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || hasProfanity) return;

    try {
      // Check for profanity and censor if found
      const censoredMessage = profanityFilter
        ? profanityFilter.censorText(newMessage.trim())
        : newMessage.trim();

      sendMessage(censoredMessage);
      setNewMessage("");
      setHasProfanity(false); // Reset profanity warning

      // Auto-scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handle input change with profanity detection
  const handleInputChange = (value) => {
    setNewMessage(value);
    setHasProfanity(
      profanityFilter && profanityFilter.containsProfanity(value),
    );
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
    const activeEditor = isMobile
      ? mobileEditorRef.current
      : desktopEditorRef.current;
    const postContent = activeEditor?.innerText?.trim();

    if (!postContent || !currentSpace?.space_id) {
      toast.error("Please write something before posting");
      return;
    }

    setIsCreatingPost(true);
    try {
      const result = await createPost({
        space_uuid: currentSpace.space_uuid,
        post_content: postContent,
      });

      if (result.success) {
        // Clear both editors
        if (mobileEditorRef.current) mobileEditorRef.current.innerHTML = "";
        if (desktopEditorRef.current) desktopEditorRef.current.innerHTML = "";
        setIsFocused(true);

        // Refetch posts to get the latest data
        refetchPosts();

        toast.success("Post created successfully!");
      } else {
        toast.error(result.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
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
      toast.error("Failed to delete space. Please try again.");
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
      toast.success("Member has been added to the space successfully.");
      // Immediately refetch to update the UI
      refetchJoinRequests();
    } catch (error) {
      console.error("Failed to accept join request:", error);
      toast.error("Failed to accept join request. Please try again.");
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
      toast.info("Join request has been declined.");
      // Immediately refetch to update the UI
      // refetchJoinRequests();
    } catch (error) {
      console.error("Failed to decline join request:", error);
      toast.error("Failed to decline join request. Please try again.");
    }
  };

  // Send invite
  const sendInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    try {
      const result = await inviteUser(space_uuid, email);

      if (result.success) {
        toast.success(`Invitation has been sent to ${email}`);
        setInviteEmail("");
        setShowInvitePopup(false);
      } else {
        toast.error(result.message || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("Failed to send invitation. Please try again.");
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
        toast.error(
          "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please upload an image smaller than 5MB");
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
    if (coverPhotoUrl && coverPhotoUrl.includes("gradient")) {
      // For gradients, save directly without canvas transformations
      localStorage.setItem(`coverPhoto_${space_uuid}`, coverPhotoUrl);
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);

      toast.success("Your cover photo has been updated successfully!");
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

        toast.success("Your cover photo has been updated successfully!");
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
        toast.success(`Successfully invited ${updatedQueue.length} members!`);
        resetUploadState();
      } else {
        const successCount = updatedQueue.filter(
          (m) => m.status === "completed",
        ).length;
        const errorCount = updatedQueue.filter(
          (m) => m.status === "error",
        ).length;
        toast.warn(
          `${successCount} successful, ${errorCount} failed. Check upload status for details.`,
        );
      }
    }, 1000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      toast.error("Please upload a valid CSV or Excel file");
      return;
    }

    try {
      const members = await parseFile(file);

      if (members.length === 0) {
        toast.warn("No valid members found in file");
        return;
      }

      // Show info about Gmail filtering
      const totalParsed = members.length;
      toast.info(
        `Found ${totalParsed} valid Gmail address(es). Non-Gmail addresses have been filtered out.`,
      );

      setUploadQueue(members);
      setShowUploadModal(true);
      setUploadStatus("idle");
      setShowInvitePopup(false);
      // Reset file input
      event.target.value = "";
    } catch (error) {
      toast.error("Error parsing file: " + error.message);
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
        <Sidebar 
          isMinimized={isSidebarMinimized} 
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          onLogoutClick={() => setShowLogout(true)} 
        />
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
        <Sidebar 
          isMinimized={isSidebarMinimized} 
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          onLogoutClick={() => setShowLogout(true)} 
        />
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
              {coverPhotoUrl.includes("gradient") ? (
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
                        e.currentTarget.style.backgroundColor =
                          currentColors.hover;
                        e.currentTarget.style.color = currentColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color =
                          currentColors.textSecondary;
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
              <div
                className="flex items-center gap-2 p-2 rounded-md max-w-full"
                style={{ backgroundColor: currentColors.surface }}
              >
                <span
                  className="text-xs break-all flex-1"
                  style={{ color: currentColors.accent }}
                >
                  {currentSpace?.space_link || "Loading..."}
                </span>
                <button
                  onClick={() => handleCopyLink(currentSpace?.space_link)}
                  className="p-1 rounded transition-colors flex-shrink-0"
                  style={{
                    color: currentColors.textSecondary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.hover;
                    e.currentTarget.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = currentColors.textSecondary;
                  }}
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
                    border-black
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
                        data-placeholder="Post something..."
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
                className="sticky top-4 bg-[#1B1F26] border border-gray-700 rounded-xl p-6 h-fit max-h-[400px]"
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
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setActiveChatSpaceUuid(space_uuid);
                      setShowChatPopup(true);
                    }}
                    className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: currentColors.border,
                      color: currentColors.text,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = currentColors.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    <FiMessageCircle />
                    Enter Chat
                  </button>
                </div>
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
                          if (
                            desktopEditorRef.current.innerText.trim() === ""
                          ) {
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
              className="rounded-xl shadow-2xl max-w-md w-full border"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
            >
              {/* Header */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: currentColors.border }}
              >
                <h3
                  className="text-xl font-semibold"
                  style={{ color: currentColors.text }}
                >
                  Pending Invites
                </h3>
                <button
                  onClick={() => setShowPendingInvitations(false)}
                  className="transition-colors p-1 rounded-lg"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Invitations List */}
              <div className="p-6">
                {joinRequestsByLink.filter(
                  (s) => s.space_id === currentSpace?.space_id,
                ).length === 0 ? (
                  <>
                    <p className="mb-4" style={{ color: currentColors.text }}>
                      No pending invitations at the moment.
                    </p>
                    <div
                      className="text-sm"
                      style={{ color: currentColors.textSecondary }}
                    >
                      Invited members will appear here once they have not yet
                      accepted your invitation.
                    </div>
                  </>
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
              <div
                className="flex justify-end p-6 border-t"
                style={{ borderColor: currentColors.border }}
              >
                <button
                  onClick={() => setShowPendingInvitations(false)}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: currentColors.accent || "#3B82F6",
                    color: "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor =
                      currentColors.accentHover || "#2563EB";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor =
                      currentColors.accent || "#3B82F6";
                  }}
                >
                  Close
                </button>
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
          .hidden.lg\\:block .bg-white .editor:empty:before {
            content: "Post something to your space with a maximum of 250 letters";
            color: #9ca3af;
            pointer-events: none;
          }
          .editor[data-placeholder="Post something..."]:empty:before {
            content: attr(data-placeholder);
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
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: currentColors.text }}
                >
                  Color & Gradient
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded cursor-pointer border-2 transition-colors"
                      style={{
                        background: color,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor =
                          currentColors.accent || "#3B82F6";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = currentColors.border;
                      }}
                      onClick={() => handleGradientSelection(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Separator Line */}
              <div className="relative flex items-center my-4">
                <div
                  className="flex-1 border-t"
                  style={{ borderColor: currentColors.border }}
                ></div>
                <span
                  className="px-3 text-sm"
                  style={{ color: currentColors.textSecondary }}
                >
                  or
                </span>
                <div
                  className="flex-1 border-t"
                  style={{ borderColor: currentColors.border }}
                ></div>
              </div>

              {/* Upload Option (only show when gradient is selected) */}
              {coverPhotoUrl && coverPhotoUrl.includes("gradient") && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => coverPhotoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      border: `1px solid ${currentColors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        currentColors.accent || "#3B82F6";
                      e.target.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = currentColors.background;
                      e.target.style.color = currentColors.text;
                    }}
                  >
                    <FiUpload size={14} />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}

              {/* Image Positioning (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes("gradient") && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-white mb-3">
                    Position Image
                  </p>
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
              {coverPhotoUrl && !coverPhotoUrl.includes("gradient") && (
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

      {/* Chat Popup */}
      {showChatPopup && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-0">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !isChatMinimized && setShowChatPopup(false)}
          />
          <div
            className={`relative z-[999] ${isChatMinimized ? "w-64 max-w-64" : "w-full"} ${isChatMaximized ? "max-w-4xl h-[90vh]" : "max-w-md sm:max-w-lg"} transform transition-all duration-300 ease-in-out ${isChatMinimized ? "translate-y-[calc(100%-48px)]" : ""}`}
          >
            {/* Chat Header */}
            <div
              className="flex items-center justify-between rounded-t-lg p-3 border-b"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: currentColors.accent }}
                >
                  <FiUser className="text-white text-sm" />
                </div>
                <div>
                  <h3
                    className="font-medium text-sm"
                    style={{ color: currentColors.text }}
                  >
                    {spaceName}
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChatMaximized(!isChatMaximized);
                  }}
                  className="p-1.5 rounded-full transition-colors"
                  style={{
                    color: currentColors.textSecondary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.hover;
                    e.currentTarget.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = currentColors.textSecondary;
                  }}
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
                  className="p-1.5 rounded-full transition-colors"
                  style={{
                    color: currentColors.textSecondary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.hover;
                    e.currentTarget.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = currentColors.textSecondary;
                  }}
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
                  className={`overflow-y-auto ${isChatMaximized ? 'h-[calc(90vh-140px)]' : 'h-[calc(100vh-180px)] sm:h-96'} p-4 space-y-2`}
                  style={{
                    backgroundColor: currentColors.background,
                  }}
                >
                  {Object.entries(messagesByDate).map(
                    ([dateLabel, dateMessages]) => (
                      <div key={dateLabel}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center py-2">
                          <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                            {dateLabel}
                          </div>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((m, i) => {
                          const nextMessage = dateMessages[i + 1];
                          const shouldShowTime =
                            m.from === "me" &&
                            (!nextMessage || nextMessage.from !== "me");
                          const prevMessage = dateMessages[i - 1];
                          const shouldShowAvatar =
                            m.from === "them" &&
                            (!nextMessage || nextMessage.from !== "them");

                          return (
                            <div
                              key={m.id}
                              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} mb-3`}
                            >
                              {shouldShowAvatar && (
                                <img
                                  src={m.avatar || "/default-avatar.png"}
                                  className="w-8 h-8 rounded-full mr-2 mt-1"
                                />
                              )}
                              {!shouldShowAvatar && m.from === "them" && (
                                <div className="w-8 h-8 mr-2 mt-1"></div>
                              )}
                              <div
                                className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}
                              >
                                <div
                                  className={`p-3 rounded-lg max-w-xs break-words ${m.from === "me" ? "rounded-tr-none" : "rounded-tl-none"}`}
                                  style={{
                                    backgroundColor:
                                      m.from === "me"
                                        ? currentColors.accent
                                        : currentColors.surface,
                                    color:
                                      m.from === "me"
                                        ? "white"
                                        : currentColors.text,
                                  }}
                                >
                                  {m.type === "image" ? (
                                    <div className="space-y-2">
                                      <img
                                        src={m.imageUrl}
                                        alt={m.text}
                                        className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() =>
                                          window.open(m.imageUrl, "_blank")
                                        }
                                      />
                                      <p className="text-xs opacity-70">
                                        {m.text}
                                      </p>
                                    </div>
                                  ) : (
                                    <p>{m.text}</p>
                                  )}
                                </div>

                                {/* Time display */}
                                {shouldShowTime && (
                                  <p
                                    className={`text-xs mt-2 ${m.from === "me" ? "text-right" : "text-left"}`}
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    {m.time}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ),
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 rounded-b-lg border-t"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border,
                  }}
                >
                  <div className="relative w-full">
                    {/* Profanity Warning - Above Input Field */}
                    {hasProfanity && (
                      <div
                        className="absolute -top-12 left-0 right-0 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-pulse"
                        style={{
                          backgroundColor: isDarkMode ? "#dc2626" : "#ef4444",
                          color: "white",
                          zIndex: 10,
                        }}
                      >
                        <span>🚫</span>
                        <span className="hidden sm:inline">
                          <strong>Content Warning:</strong> Your message
                          contains inappropriate language and will be
                          automatically censored to maintain a respectful chat
                          environment.
                        </span>
                        <span className="sm:hidden">
                          <strong>Warning:</strong> Message contains
                          inappropriate language and will be censored.
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1"
                        style={{
                          backgroundColor: currentColors.background,
                          borderColor: currentColors.border,
                          color: currentColors.text,
                          focusRingColor: currentColors.accent,
                        }}
                      />
                      <button
                        type="submit"
                        className={`p-2 rounded transition-colors ${hasProfanity ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!newMessage.trim() || hasProfanity}
                        style={{
                          color:
                            !newMessage.trim() || hasProfanity
                              ? currentColors.textSecondary
                              : currentColors.accent,
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (newMessage.trim() && !hasProfanity) {
                            e.currentTarget.style.backgroundColor =
                              currentColors.hover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color =
                            !newMessage.trim() || hasProfanity
                              ? currentColors.textSecondary
                              : currentColors.accent;
                        }}
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
