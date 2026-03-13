import React, { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import {
  FiSend,
  FiMoreVertical,
  FiSearch,
  FiPaperclip,
  FiCheck,
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceChat } from "../../hooks/useSpaceChat";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { GroupCover } from "../component/groupCover";
import profanityFilter from "../../utils/profanityFilter";

const ChatList = () => {
  const { userSpaces, courseSpaces, friendSpaces } = useSpace();
  const { user } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [activeSpaceUuid, setActiveSpaceUuid] = useState(null);
  const [input, setInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasProfanity, setHasProfanity] = useState(false);

  // Theme state
  const [showColorPicker, setShowColorPicker] = useState(false);

  // State to force re-render when cover photos change in localStorage
  const [coverPhotoUpdateTrigger, setCoverPhotoUpdateTrigger] = useState(0);

  // Color options for chat bubbles
  const colorOptions = [
    { name: "Blue", sent: "bg-blue-500", received: "bg-gray-700" },
    { name: "Green", sent: "bg-green-500", received: "bg-gray-700" },
    { name: "Red", sent: "bg-red-500", received: "bg-gray-700" },
    { name: "Purple", sent: "bg-purple-500", received: "bg-gray-700" },
    { name: "Pink", sent: "bg-pink-500", received: "bg-gray-700" },
    { name: "Orange", sent: "bg-orange-500", received: "bg-gray-700" },
    { name: "Teal", sent: "bg-teal-500", received: "bg-gray-700" },
    { name: "Indigo", sent: "bg-indigo-500", received: "bg-gray-700" },
    { name: "Cyan", sent: "bg-cyan-500", received: "bg-gray-700" },
    { name: "Yellow", sent: "bg-yellow-500", received: "bg-gray-700" },
    { name: "Lime", sent: "bg-lime-500", received: "bg-gray-700" },
    { name: "Rose", sent: "bg-rose-500", received: "bg-gray-700" },
  ];

  // Per-conversation color state
  const [conversationColors, setConversationColors] = useState({});

  // Get current conversation color
  const currentConversationColor =
    conversationColors[activeSpaceUuid] || colorOptions[0];

  const handleThemeChange = () => {
    setShowColorPicker(true);
    setShowDropdown(false);
  };

  const handleColorSelect = (color) => {
    setConversationColors((prev) => ({
      ...prev,
      [activeSpaceUuid]: color,
    }));
    setShowColorPicker(false);

    // Save color preference to localStorage (per conversation)
    const savedColors = JSON.parse(
      localStorage.getItem("conversationColors") || "{}",
    );
    savedColors[activeSpaceUuid] = color;
    localStorage.setItem("conversationColors", JSON.stringify(savedColors));
  };

  // Load saved colors on component mount and when activeSpaceUuid changes
  useEffect(() => {
    const savedColors = JSON.parse(
      localStorage.getItem("conversationColors") || "{}",
    );
    setConversationColors(savedColors);
  }, [activeSpaceUuid]);

  // Listen for localStorage changes to update cover photos in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if the changed key is a cover photo
      if (e.key && e.key.startsWith("coverPhoto_")) {
        // Force re-render by incrementing the trigger
        setCoverPhotoUpdateTrigger((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];

  const uniqueSpaces = useMemo(() => {
    const map = new Map();
    allSpaces.forEach((s) => map.set(s.space_uuid, s));
    return Array.from(map.values());
  }, [allSpaces, coverPhotoUpdateTrigger]);

  const uniqueMembers = useMemo(() => {
    const map = new Map();

    allSpaces.forEach((s) => {
      // Add members
      (s.members || []).forEach((m) => {
        if (m.account_id !== user.id && !map.has(m.account_id)) {
          map.set(m.account_id, m);
        }
      });

      // Add professor
      if (s.professor && s.creator !== user.id && !map.has(s.creator)) {
        map.set(s.creator, {
          account_id: s.creator,
          full_name: s.professor.name,
          profile_pic: s.professor.avatar,
          is_professor: true,
        });
      }
    });

    return Array.from(map.values());
  }, [allSpaces, user.id]);

  // 🚀 Our hook to manage messages and online users
  const { messages, sendMessage, sendImageMessage, spaceOnlineUsers } =
    useSpaceChat(activeSpaceUuid, user);

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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Handle sticky header scroll behavior
  useEffect(() => {
    let lastScrollTop = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollableElement = document.querySelector(
            ".chat-messages-container",
          );
          const scrollTop = scrollableElement
            ? scrollableElement.scrollTop
            : window.pageYOffset;

          if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            setShowHeader(false);
          } else {
            // Scrolling up
            setShowHeader(true);
          }

          lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    const scrollableElement = document.querySelector(
      ".chat-messages-container",
    );
    if (scrollableElement) {
      scrollableElement.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () =>
        scrollableElement.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const getPrivateSpaceUuid = (a, b) => [a, b].sort().join("-");

  // Helper function to get space cover photo from localStorage or server data
  const getSpaceCoverPhoto = (space) => {
    if (!space) return null;
    // First check localStorage for updated cover photo
    const localCover = localStorage.getItem(`coverPhoto_${space.space_uuid}`);
    if (localCover) return localCover;
    // Fall back to server data
    return space.settings?.space_cover;
  };

  const getOnlineCountForSpace = (space) => {
    return (
      spaceOnlineUsers[space.space_uuid]?.filter((id) => id !== user.id)
        .length || 0
    );
  };

  const activeSpace = useMemo(() => {
    if (!activeSpaceUuid) return null;

    // Check if it's a private chat (between two users)
    const member = uniqueMembers.find(
      (m) => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid,
    );
    if (member) {
      return { space_name: member.full_name }; // 1:1 chat
    }

    // Otherwise, group chat
    return uniqueSpaces.find((s) => s.space_uuid === activeSpaceUuid) || null;
  }, [activeSpaceUuid, uniqueSpaces, uniqueMembers, user.id]);

  const getParticipantStatus = (space) => {
    if (!space || !user) return "Offline";

    // For private chats, check if the other participant is online
    const member = uniqueMembers.find(
      (m) => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid,
    );
    if (member) {
      return spaceOnlineUsers[activeSpaceUuid]?.includes(member.account_id)
        ? "Online"
        : "Offline";
    }

    // For group chats, check if any member is online
    if (space && space.members) {
      const onlineMembers = spaceOnlineUsers[space.space_uuid] || [];
      const otherOnlineMembers = space.members.filter(
        (member) =>
          member.account_id !== user.id &&
          onlineMembers.includes(member.account_id),
      );
      return otherOnlineMembers.length > 0 ? "Online" : "Offline";
    }
    return "Offline";
  };

  const participantStatus = getParticipantStatus(activeSpace);
  const statusColorClass =
    participantStatus === "Online" ? "text-green-500" : "text-gray-500";
  const statusDotClass =
    participantStatus === "Online" ? "bg-green-500" : "bg-gray-500";

  // Handle input change with profanity detection
  const handleInputChange = (value) => {
    setInput(value);
    setHasProfanity(profanityFilter.containsProfanity(value));
  };

  // Send message helper with profanity filtering
  const handleSend = () => {
    if (!input.trim()) return;

    // Additional check to prevent sending profanity
    if (hasProfanity) return;

    // Check for profanity and censor if found
    const censoredMessage = profanityFilter.censorText(input);

    // Send the censored message
    sendMessage(censoredMessage);
    setInput("");
    setHasProfanity(false); // Reset profanity warning
    inputRef.current?.focus();
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // Send image message
        sendImageMessage(file);
      } else {
        // Handle other file types if needed
        console.log("Non-image file uploaded:", file);
      }
    }
  };

  // Message status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <FiCheck className="text-xs text-gray-400" />;
      case "delivered":
        return <FiCheckCircle className="text-xs text-gray-400" />;
      case "read":
        return <FiCheckCircle className="text-xs text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ maxHeight: "100vh" }}
      >
        {/* Mobile + Tablet Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0 focus:outline-none"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1
              className="text-lg font-bold"
              style={{ color: currentColors.text }}
            >
              Chats
            </h1>
          </div>
        </div>

        {/* Chat Content */}
        <div
          className={`flex-1 flex flex-col lg:flex-row px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 gap-2 sm:gap-4 md:gap-6 overflow-hidden transition-all duration-300 ${showHeader ? "pt-20 sm:pt-24 md:pt-20" : "pt-2"} lg:pt-2 lg:py-6`}
        >
          {/* CHAT LIST */}
          <div
            className={`${showMobileChat ? "hidden lg:block" : "block"} w-full lg:w-80 xl:w-96 2xl:w-[420px] flex flex-col min-h-0 lg:min-h-0 overflow-y-auto sm:overflow-y-auto lg:overflow-y-visible`}
          >
            <div className="hidden lg:flex mb-4">
              <h1 className="font-bold text-lg">Chats</h1>
            </div>

            {/* SEARCH BAR */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search People"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    border: isDarkMode ? "none" : "1px solid black",
                  }}
                />
                <FiSearch
                  className="absolute right-3 top-3"
                  style={{ color: currentColors.textSecondary }}
                />
              </div>
            </div>

            {/* PEOPLE */}
            <div
              className="rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 overflow-y-auto max-h-48 custom-scrollbar"
              style={{
                backgroundColor: currentColors.surface,
                border: isDarkMode ? "none" : "1px solid black",
              }}
            >
              <h2
                className="font-semibold text-sm mb-3"
                style={{ color: currentColors.textSecondary }}
              >
                People
              </h2>
              {uniqueMembers
                .filter((m) =>
                  m.full_name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((m) => {
                  const uuid = getPrivateSpaceUuid(user.id, m.account_id);
                  return (
                    <div
                      key={m.account_id}
                      onClick={() => {
                        setActiveSpaceUuid(uuid);
                        setShowMobileChat(true);
                      }}
                      className="flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-colors"
                      style={{
                        ":hover": { backgroundColor: currentColors.hover },
                      }}
                    >
                      <div className="relative">
                        <img
                          src={m.profile_pic || "/default-avatar.png"}
                          className="w-10 h-10 rounded-full"
                        />
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
                          style={{ borderColor: currentColors.surface }}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: currentColors.text }}
                        >
                          {m.full_name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Online
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* GROUPS */}
            <div
              className="rounded-xl p-3 sm:p-4 overflow-y-auto max-h-80 custom-scrollbar"
              style={{
                backgroundColor: currentColors.surface,
                border: isDarkMode ? "none" : "1px solid black",
              }}
            >
              <h2
                className="font-semibold text-sm mb-3"
                style={{ color: currentColors.textSecondary }}
              >
                Groups
              </h2>
              {uniqueSpaces.map((space) => (
                <div
                  key={space.space_uuid}
                  onClick={() => {
                    setActiveSpaceUuid(space.space_uuid);
                    setShowMobileChat(true);
                  }}
                  className="flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-colors"
                  style={{ ":hover": { backgroundColor: currentColors.hover } }}
                >
                  <div className="relative">
                    <GroupCover
                      image={getSpaceCoverPhoto(space)}
                      name={space.space_name}
                      members={space.members.filter(
                        (m) => m.account_id !== user.id,
                      )}
                      className="w-10 h-10"
                    />
                    {getOnlineCountForSpace(space) > 0 && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
                        style={{ borderColor: currentColors.surface }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm truncate"
                      style={{ color: currentColors.text }}
                    >
                      {space.space_name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: currentColors.textSecondary }}
                    >
                      {getOnlineCountForSpace(space)} online •{" "}
                      {space.members?.length || 0} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT PANEL */}
          <div
            className={`${showMobileChat ? "block" : "hidden lg:block"} flex-1 rounded-xl flex flex-col h-full pr-4 overflow-hidden`}
            style={{
              backgroundColor: currentColors.surface,
              border: isDarkMode ? "none" : "1px solid black",
              maxHeight: "100vh",
            }}
          >
            {!activeSpaceUuid ? (
              <div className="flex-1 flex items-center justify-center min-h-[400px] mt-16">
                <div
                  className="text-center text-lg"
                  style={{ color: currentColors.textSecondary }}
                >
                  Select a chat to start messaging
                </div>
              </div>
            ) : (
              <>
                {/* Fixed Header - Always Visible */}
                <div
                  className="p-3 sm:p-4 border-b flex justify-between items-center relative rounded-t-xl sticky top-0 z-10"
                  style={{
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.surface,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="lg:hidden bg-transparent border-none p-0"
                      style={{ color: currentColors.textSecondary }}
                    >
                      ←
                    </button>

                    {/* Profile Picture and Status */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            // For private chat, show the other person's profile
                            uniqueMembers.find(
                              (m) =>
                                getPrivateSpaceUuid(user.id, m.account_id) ===
                                activeSpaceUuid,
                            )?.profile_pic ||
                            // For group chat, show group cover from localStorage or server data
                            getSpaceCoverPhoto(
                              uniqueSpaces.find(
                                (s) => s.space_uuid === activeSpaceUuid,
                              ),
                            ) ||
                            "/default-avatar.png"
                          }
                          className="w-10 h-10 rounded-full"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 ${statusDotClass} rounded-full border-2`}
                          style={{ borderColor: currentColors.surface }}
                        ></div>
                      </div>
                      <div>
                        <h2
                          className="font-semibold truncate"
                          style={{ color: currentColors.text }}
                        >
                          {activeSpace?.space_name || "Chat"}
                        </h2>
                        <p className={`text-xs ${statusColorClass}`}>
                          {participantStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="cursor-pointer bg-transparent border-none p-0"
                      style={{ color: currentColors.textSecondary }}
                    >
                      <FiMoreVertical />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div
                        className="absolute right-0 mt-2 w-44 sm:w-48 rounded-lg shadow-lg border z-50"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                        }}
                      >
                        <button
                          onClick={handleThemeChange}
                          className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-t-lg flex items-center gap-3 transition-colors"
                          style={{ color: currentColors.textSecondary }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              currentColors.hover)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <FiSettings className="text-sm" />
                          Change Color Theme
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages - Scrollable Area */}
                <div
                  className={`chat-messages-container flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto min-h-0 scrollbar-hide`}
                  style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    maxHeight: "calc(100vh - 180px)",
                    minHeight: "200px",
                  }}
                >
                  {Object.entries(messagesByDate).map(
                    ([dateLabel, dateMessages]) => (
                      <div key={dateLabel}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center py-2">
                          <div
                            className="text-xs px-3 py-1"
                            style={{
                              color: currentColors.textSecondary,
                            }}
                          >
                            {dateLabel}
                          </div>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((m, i) => {
                          const showUnreadSeparator =
                            dateLabel === "Today" && i === 3; // Show after 4th message of today
                          const isLastUserMessage =
                            m.from === "me" && i === dateMessages.length - 1;
                          const nextMessage = dateMessages[i + 1];
                          const prevMessage = dateMessages[i - 1];

                          // Optimized avatar logic for large group chats (10+ participants)
                          let shouldShowAvatar = false;
                          if (m.from === "them") {
                            // Always show avatar for first message
                            if (!prevMessage) {
                              shouldShowAvatar = true;
                            } else {
                              // Show avatar only if previous message was from different sender
                              // This works for any number of participants
                              shouldShowAvatar =
                                prevMessage.senderId !== m.senderId;
                            }
                          }

                          // Optimized time logic for large group chats
                          let shouldShowTime = false;
                          if (m.from === "me") {
                            // Always show time for last message
                            if (!nextMessage) {
                              shouldShowTime = true;
                            } else {
                              // Show time only if next message is from different sender
                              // This works for any number of participants
                              shouldShowTime =
                                nextMessage.senderId !== m.senderId;
                            }
                          }

                          return (
                            <React.Fragment key={m.id}>
                              {showUnreadSeparator && (
                                <div className="flex items-center justify-center py-2">
                                  <div
                                    className="text-xs px-3 py-1"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    Unread messages
                                  </div>
                                </div>
                              )}
                              <div
                                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} ${m.from === "me" ? "mb-1" : "mb-3"} items-start`}
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
                                  className={`px-4 py-2 rounded-2xl max-w-[70%] sm:max-w-[75%] md:max-w-[80%] break-words ${m.from === "me" ? `${currentConversationColor.sent} text-white rounded-br-md` : `${currentConversationColor.received} text-white rounded-bl-md`} ${m.from === "them" ? "-mt-1" : ""}`}
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
                                    <p className="text-sm">{m.text}</p>
                                  )}

                                  {/* Time and Status */}
                                  <div
                                    className={`flex items-center gap-1 mt-1 ${m.from === "me" ? "justify-end" : "justify-start"}`}
                                  >
                                    {shouldShowTime && (
                                      <>
                                        <span className="text-[10px] opacity-70">
                                          {m.time}
                                        </span>
                                        {m.from === "me" &&
                                          getStatusIcon(m.status)}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ),
                  )}
                </div>

                {/* Fixed Input - Always Visible */}
                <div
                  className="p-2 sm:p-3 md:p-4 border-t rounded-b-xl sticky bottom-0 relative"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border,
                  }}
                >
                  <div
                    className="flex gap-2 sm:gap-3 rounded-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 items-center"
                    style={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <FiPaperclip
                      className="cursor-pointer transition-colors"
                      style={{ color: currentColors.textSecondary }}
                      onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                      }}
                      className="flex-1 bg-transparent outline-none text-sm sm:text-base"
                      style={{
                        color: currentColors.text,
                        placeholderColor: currentColors.textSecondary,
                      }}
                      placeholder="Type your message here..."
                    />
                    <button
                      onClick={handleSend}
                      className={`transition-colors p-1 sm:p-0 bg-transparent border-none ${hasProfanity ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={{ color: hasProfanity ? "#9ca3af" : "#3b82f6" }}
                      disabled={!input.trim() || hasProfanity}
                    >
                      <FiSend />
                    </button>
                  </div>

                  {/* Profanity Warning - Absolute Position */}
                  {hasProfanity && (
                    <div
                      className="absolute -top-12 left-3 right-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-pulse lg:-top-12"
                      style={{
                        backgroundColor: isDarkMode ? "#dc2626" : "#ef4444",
                        color: "white",
                        zIndex: 10,
                      }}
                    >
                      <span>🚫</span>
                      <span className="hidden sm:inline">
                        <strong>Content Warning:</strong> Your message contains
                        inappropriate language and will be automatically
                        censored to maintain a respectful chat environment.
                      </span>
                      <span className="sm:hidden">
                        <strong>Warning:</strong> Message contains inappropriate
                        language and will be censored.
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Color Picker Dialog */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#2A2F3E] rounded-xl p-6 w-80 max-w-[90%] border border-gray-600">
            <h3 className="text-white font-semibold mb-4">Choose Chat Color</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color)}
                  className={`w-12 h-12 rounded-lg ${color.sent} hover:scale-110 transition-transform duration-200 border-2 ${
                    currentConversationColor?.sent === color.sent
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">
                Selected: {currentConversationColor?.name}
              </span>
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
