import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import Logout from "../component/logout";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiCopy
} from "react-icons/fi";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import PageNotFound from "../PageNotFound/pageNotFound";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import Button from "../component/button_2";
import AddMember from "../component/AddMember";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";

import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfStreamPage = () => {
  const { space_uuid, space_name } = useParams();
  const navigate = useNavigate();

  // State hooks - MUST BE AT THE TOP
  const [isFocused, setIsFocused] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteButtonClicked, setInviteButtonClicked] = useState(false);
  const [pendingButtonClicked, setPendingButtonClicked] = useState(false);
  const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const MAX_CHAR = 250;

  // Additional state for posts and comments
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [comments, setComments] = useState({});
  const [isLoadingComments, setIsLoadingComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Refs - MUST BE AT THE TOP
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);

  // Custom hooks - MUST BE AT THE TOP
  const { user, isLoading: userLoading } = useUser();
  const { addNotification, showGlobalNotification } = useNotification();
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
    deleteSpace
  } = useSpace();

  // Join requests - MUST BE AT THE TOP (unconditionally)
  const { data: joinRequestsData = [], isLoading: joinRequestsLoading } = useJoinRequests(space_uuid || "");

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

  // UUID validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Find current space
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || []), ...(friendSpaces || [])];

  const currentSpace = allSpaces.find(space => space.space_uuid === space_uuid);

  console.log(userSpaces)
  console.log(courseSpaces)
  console.log(friendSpaces)

  
  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;

  const isFriendSpace = !isOwnerSpace;

  // Loading state
  if (userLoading || spaceLoading) {
    return <div className="flex h-screen justify-center items-center"><MainLoading /></div>;
  }

  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return <PageNotFound />;
  }

  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // Text formatting
  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  // Invite member
  const handleInviteMember = () => {
    setInviteButtonClicked(true);
    setIsInviting(true);
    setShowInvitePopup(true);
    setTimeout(() => {
      setInviteButtonClicked(false);
      setIsInviting(false);
    }, 500);
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
    setDeleteButtonClicked(true);
    setIsDeleting(true);
    
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      
      // Navigate immediately after successful deletion
      navigate("/prof/spaces");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteButtonClicked(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteButtonClicked(false);
  };

  // Handle pending invitations
  const handlePendingInvitations = () => {
    setPendingButtonClicked(true);
    setShowPendingInvitations(true);
    setTimeout(() => {
      setPendingButtonClicked(false);
    }, 500);
  };
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
    navigator.clipboard.writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  // Create post
  const handleCreatePost = async () => {
    const content = editorRef.current?.innerText?.trim();
    if (!content) return;

    setIsCreatingPost(true);
    try {
      // TODO: Implement actual post creation logic
      console.log("Creating post:", content);
      editorRef.current.innerHTML = "";
      setIsFocused(false);
      setCharCount(0);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Enter chat
  const handleEnterChat = () => {
    setShowChatPopup(true);
  };

  const handleCloseChat = () => {
    setShowChatPopup(false);
  };

  const handleSendMessage = (messageText) => {
    // Add message to chat (you can integrate with your chat backend here)
    const newMessage = {
      id: Date.now(),
      senderId: user?.id,
      senderName: user?.fullname || "You",
      text: messageText,
      timestamp: "Just now",
      avatar: user?.profile_pic,
      isRead: false,
    };

    // For now, just show a notification (replace with actual chat implementation)
    addNotification({
      type: "success",
      title: "Message Sent",
      message: "Your message was sent successfully",
      duration: 3000,
    });

    console.log("Message sent:", newMessage);
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

  // Time ago helper
  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Toggle comments
  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  // Handle comment change
  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // Create comment
  const handleCreateComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setIsLoadingComments(prev => ({
      ...prev,
      [postId]: true
    }));

    try {
      // TODO: Implement actual comment creation logic
      console.log("Creating comment:", content, "for post:", postId);
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsLoadingComments(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
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
          backgroundColor: currentColors.surface
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
            borderColor: currentColors.border
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
              <span className="text-xs" style={{ color: currentColors.textSecondary }}>({currentSpace?.space_type === "course" ? (currentSpace?.members?.length - 1) + " student(s)": (currentSpace?.members?.length) + " member(s)" || 0})</span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div onClick={handlePendingInvitations} className="relative">
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
                  <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: currentColors.surface }}>
                    <span className="text-xs break-all" style={{ color: currentColors.accent }}>
                      {currentSpace?.space_link || 'Loading...'}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="p-1 rounded transition-colors"
                      style={{
                        color: currentColors.textSecondary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.color = currentColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
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
          <div className="w-full overflow-x-auto no-scrollbar border-b pb-4 mb-6" style={{ borderColor: currentColors.border }}>
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button className="font-semibold border-b-2 pb-2" style={{ borderColor: currentColors.text }}>
                  Stream
                </button>
                <button
                 onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}/tasks`)}
                 style={{ color: currentColors.textSecondary }}
                >
                  Tasks
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/files`)
                  }
                  style={{ color: currentColors.textSecondary }}
                >
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/people`)
                  }
                  style={{ color: currentColors.textSecondary }}
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
              <div onClick={handlePendingInvitations} className="relative">
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


                  {/* MAIN CONTENT GRID */}
                  <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4">
                    {/* LEFT SIDEBAR - 30% */}
                    <div className="w-full lg:w-[30%]">
                      {/* MOBILE CREATE POST - Only visible on mobile */}
                      {isOwnerSpace && (
                        <div className="lg:hidden mb-6">
                          <div
                            className={`
                            bg-white rounded-xl border cursor-text transition
                            ${isFocused ? "border-black" : "border-black"}
                            hover:border-black
                          `}
                            onClick={() => editorRef.current?.focus()}
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
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                  if (editorRef.current.innerText.trim() === "") {
                                    setIsFocused(false);
                                  }
                                }}
                                onInput={() => {
                                  let text = editorRef.current.innerText;

                                  if (text.length > MAX_CHAR) {
                                    text = text.substring(0, MAX_CHAR);
                                    editorRef.current.innerText = text;

                                    // Move cursor to end
                                    const range = document.createRange();
                                    const sel = window.getSelection();
                                    range.selectNodeContents(editorRef.current);
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

                                  <div className="mt-4 border-t" style={{ borderColor: currentColors.border }} />

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
                                          editorRef.current.innerHTML = "";
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
                        className={`sticky top-4 border rounded-xl p-6 ${isOwnerSpace && "h-full"}`}
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border
                        }}
                      >
                        <h2 className="font-bold mb-4">Reminders</h2>
                        <div className="text-center py-6">
                          <div className="mb-2" style={{ color: currentColors.textSecondary }}>
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
                          <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                            Reminders will appear here when created
                          </p>
                        </div>
        
                        {/* CHAT */}
                        <button
                          onClick={handleEnterChat}
                          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors"
                          style={{
                            backgroundColor: isDarkMode ? '#000000' : 'transparent',
                            borderColor: currentColors.border,
                            color: currentColors.text
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = isDarkMode ? '#1f2937' : currentColors.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = isDarkMode ? '#000000' : 'transparent';
                          }}
                        >
                          <FiMessageCircle />
                          Enter Chat
                        </button>
                      </div>
                    </div>
        
                    {/* RIGHT CONTENT - 70% */}
                    <div className="w-full lg:w-[70%] space-y-6">
                      {/* CREATE POST - Desktop/Laptop Only */}
                      {isOwnerSpace && (
                        <div className="hidden lg:block mb-6">
                          <div
                            className={`
                            bg-white rounded-xl border cursor-text transition
                            ${isFocused ? "border-black" : "border-black"}
                            hover:border-black
                          `}
                            onClick={() => editorRef.current?.focus()}
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
                              ref={editorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => {
                                if (editorRef.current.innerText.trim() === "") {
                                  setIsFocused(false);
                                }
                              }}
                              onInput={() => {
                                let text = editorRef.current.innerText;
        
                                if (text.length > MAX_CHAR) {
                                  text = text.substring(0, MAX_CHAR);
                                  editorRef.current.innerText = text;
        
                                  // Move cursor to end
                                  const range = document.createRange();
                                  const sel = window.getSelection();
                                  range.selectNodeContents(editorRef.current);
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
                                          editorRef.current.innerHTML = "";
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
                        className={`border rounded-xl p-6 ${!isOwnerSpace && "h-full"}`}
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border
                        }}
                      >
                        <h2 className="font-bold mb-4">Announcement Feed</h2>
        
                        {isLoadingPosts ? (
                          <div className="text-center py-8">
                            <p style={{ color: currentColors.textSecondary }}>Loading posts...</p>
                          </div>
                        ) : postsError ? (
                          <div className="text-center py-8">
                            <p className="text-red-400">Error loading posts</p>
                          </div>
                        ) : posts.length === 0 ? (
                          <div className="text-center py-8">
                            <p style={{ color: currentColors.textSecondary }} className="text-lg">No posts yet</p>
                            <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
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
                                  borderColor: currentColors.border
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  {/* Avatar */}
                                  {post.profile_pic ? (
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                                      style={{
                                        backgroundColor: currentColors.surface,
                                        borderColor: currentColors.border
                                      }}
                                    >
                                      <img
                                        src={post.profile_pic}
                                        alt={post.user_full_name || "User"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {post.user_full_name?.charAt(0)?.toUpperCase() ||
                                        "U"}
                                    </div>
                                  )}
        
                                  {/* Post Content */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-semibold text-sm" style={{ color: currentColors.text }}>
                                        {post.user_full_name || "Unknown User"}
                                      </span>
                                      <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                                        {timeAgo(post?.created_at)}
                                      </span>
                                    </div>
                                    <p className="whitespace-pre-wrap mb-3" style={{ color: currentColors.text }}>
                                      {post.post_content}
                                    </p>
        
                                    {/* Comment Button */}
                                    <button
                                      onClick={() => toggleComments(post.post_id)}
                                      className="flex items-center space-x-2 transition-colors text-sm"
                                      style={{ color: currentColors.textSecondary }}
                                      onMouseEnter={(e) => {
                                        e.target.style.color = currentColors.text;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.color = currentColors.textSecondary;
                                      }}
                                    >
                                      <FiMessageCircle size={16} />
                                      <span>Comments</span>
                                      {post.reply_count > 0 && (
                                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: currentColors.surface, color: currentColors.textSecondary }}>
                                          {post.reply_count}
                                        </span>
                                      )}
                                    </button>
        
                                    {/* Comments Section */}
                                    {expandedPosts.has(post.post_id) && (
                                      <div className="mt-4 pt-4" style={{ borderColor: currentColors.border }}>
                                        {/* Existing Comments */}
                                        {comments[post.post_id] &&
                                          comments[post.post_id].length > 0 && (
                                            <div className="space-y-3 mb-4">
                                              {comments[post.post_id].map((comment) => (
                                                <div
                                                  key={comment.post_id}
                                                  className="flex items-start space-x-2"
                                                >
                                                  {/* <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                                    {comment.user_full_name
                                                      ?.charAt(0)
                                                      ?.toUpperCase() || "U"}
                                                  </div> */}
        
                                                  {post.profile_pic ? (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentColors.surface }}>
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
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: currentColors.surface, color: currentColors.text }}>
                                                      {post.user_full_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                    </div>
                                                  )}
                                                  <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                      <span className="font-medium text-sm" style={{ color: currentColors.text }}>
                                                        {comment.user_full_name ||
                                                          "Unknown User"}
                                                      </span>
                                                      <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                                        {timeAgo(comment?.created_at)}
                                                      </span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap" style={{ color: currentColors.text }}>
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
                                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>
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
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                              <img
                                                src={user?.profile_pic}
                                                alt={user?.full_name || "User"}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                                              {post.user_full_name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "Y"}
                                            </div>
                                          )}
                                          <div className="flex-1">
                                            <textarea
                                              value={commentInputs[post.post_id] || ""}
                                              onChange={(e) =>
                                                handleCommentChange(
                                                  post.post_id,
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Write a comment..."
                                              className="w-full rounded-lg p-2 resize-none focus:outline-none focus:ring-2"
                                              style={{
                                                backgroundColor: currentColors.background,
                                                color: currentColors.text,
                                                borderColor: currentColors.border
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
        
        {/* ADD MEMBER COMPONENT */}
        <AddMember
          currentSpace={currentSpace}
          onInviteMember={handleInviteMember}
          showInvitePopup={showInvitePopup}
          setShowInvitePopup={setShowInvitePopup}
        />

      </div>

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Post something to your space";
                                  color: ${currentColors.textSecondary};
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
        itemName={dialogMessage}
      />

    
    </div>
  );
};

export default ProfStreamPage;