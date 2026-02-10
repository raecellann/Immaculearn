import React, { useState, useMemo, useRef, useEffect } from "react";
import Button from "../component/Button";
import { FiEdit, FiSend, FiMoreVertical, FiSearch, FiPaperclip } from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceChat } from "../../hooks/useSpaceChat";
import { useUser } from "../../contexts/user/useUser";
import { GroupCover } from "../component/groupCover";
import ProfSidebar from "../component/profsidebar";

const ProfChatPage = () => {
  const { userSpaces, friendSpaces } = useSpace();
  const { user } = useUser();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [activeSpaceUuid, setActiveSpaceUuid] = useState(null);
  const [input, setInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];

  const uniqueSpaces = useMemo(() => {
    const map = new Map();
    allSpaces.forEach((s) => map.set(s.space_uuid, s));
    return Array.from(map.values());
  }, [allSpaces]);

  const uniqueMembers = useMemo(() => {
    const map = new Map();
    allSpaces.flatMap((s) => s.members || []).forEach((m) => {
      if (m.account_id !== user.id && !map.has(m.account_id)) {
        map.set(m.account_id, m);
      }
    });
    return Array.from(map.values());
  }, [allSpaces, user.id]);

  // 🚀 Our hook to manage messages and online users
  const { messages, sendMessage, spaceOnlineUsers } =
    useSpaceChat(activeSpaceUuid, user);

  // Map messages to render-friendly format with date grouping
  const chatMessages = useMemo(() => {
    return messages.map((m) => ({
      id: m.id || Math.random().toString(36).substr(2, 9),
      from: m.senderId === user.id ? "me" : "them",
      senderId: m.senderId,
      text: m.content,
      avatar: m.senderAvatar,
      timestamp: new Date(m.timestamp),
      time: new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(m.timestamp).toLocaleDateString(),
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
        dateLabel = new Date(message.timestamp).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
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

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const getPrivateSpaceUuid = (a, b) => [a, b].sort().join("-");

  const getOnlineCountForSpace = (space) => {
    return spaceOnlineUsers[space.space_uuid]?.filter(id => id !== user.id).length || 0;
  };

  const activeSpace = useMemo(() => {
    if (!activeSpaceUuid) return null;

    // Check if it's a private chat (between two users)
    const member = uniqueMembers.find(
      (m) => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid
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
      (m) => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid
    );
    if (member) {
      return spaceOnlineUsers[activeSpaceUuid]?.includes(member.account_id) ? "Online" : "Offline";
    }

    // For group chats, check if any member is online
    if (space && space.members) {
      const onlineMembers = spaceOnlineUsers[space.space_uuid] || [];
      const otherOnlineMembers = space.members.filter(member =>
        member.account_id !== user.id && onlineMembers.includes(member.account_id)
      );
      return otherOnlineMembers.length > 0 ? "Online" : "Offline";
    }
    return "Offline";
  };

  const participantStatus = getParticipantStatus(activeSpace);
  const statusColorClass = participantStatus === "Online" ? "text-green-500" : "text-gray-500";
  const statusDotClass = participantStatus === "Online" ? "bg-green-500" : "bg-gray-500";

  // Send message helper
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };
  

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <ProfSidebar />
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile + Tablet Header */}
        <div className="lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Chats</h1>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 gap-2 sm:gap-4 md:gap-6 overflow-hidden">
          {/* CHAT LIST */}
          <div className={`${showMobileChat ? "hidden lg:block" : "block"} w-full lg:w-80 xl:w-96 2xl:w-[420px] flex flex-col min-h-0`}>
            <div className="hidden lg:flex justify-between mb-4">
              <h1 className="font-bold text-lg">Chats</h1>
              <Button>
                <FiEdit />
              </Button>
            </div>

          {/* SEARCH BAR */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search People"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* PEOPLE */}
          <div className="bg-[#1E2330] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 flex-1 overflow-y-auto min-h-0">
            <h2 className="font-semibold text-sm mb-3 text-gray-300">Students</h2>
            {uniqueMembers
              .filter(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((m) => {
                const uuid = getPrivateSpaceUuid(user.id, m.account_id);
                return (
                  <div
                    key={m.account_id}
                    onClick={() => {
                      setActiveSpaceUuid(uuid);
                      setShowMobileChat(true);
                    }}
                    className="flex items-center gap-3 py-3 hover:bg-[#2A2F3E] rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={m.profile_pic || "/default-avatar.png"}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E2330]"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">{m.full_name}</p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* GROUPS */}
          <div className="bg-[#1E2330] rounded-xl p-3 sm:p-4 flex-1 overflow-y-auto min-h-0">
            <h2 className="font-semibold text-sm mb-3 text-gray-300">Courses</h2>
            {uniqueSpaces.map((space) => (
              <div
                key={space.space_uuid}
                onClick={() => {
                  setActiveSpaceUuid(space.space_uuid);
                  setShowMobileChat(true);
                }}
                className="flex items-center gap-3 py-3 hover:bg-[#2A2F3E] rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative">
                  <GroupCover
                    image={space.image}
                    name={space.space_name}
                    members={space.members.filter((m) => m.account_id !== user.id)}
                    className="w-10 h-10"
                  />
                  {getOnlineCountForSpace(space) > 0 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E2330]"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-white">{space.space_name}</p>
                  <p className="text-xs text-gray-400">
                    {getOnlineCountForSpace(space)} online • {space.members?.length || 0} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="flex-1 bg-[#1E2330] rounded-xl flex flex-col min-h-0">
          {!activeSpaceUuid ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          ) : (
            <>
              <div className="p-3 sm:p-4 border-b border-gray-700 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    ← Back
                  </button>
                  
                  {/* Profile Picture and Status */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          // For private chat, show the other person's profile
                          uniqueMembers.find(m => getPrivateSpaceUuid(user.id, m.account_id) === activeSpaceUuid)?.profile_pic ||
                          // For group chat, show group cover
                          uniqueSpaces.find(s => s.space_uuid === activeSpaceUuid)?.image ||
                          "/default-avatar.png"
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusDotClass} rounded-full border-2 border-[#1E2330]`}></div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">{activeSpace?.space_name || "Chat"}</h2>
                      <p className={`text-xs ${statusColorClass}`}>{participantStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-gray-400 cursor-pointer hover:text-white"
                  >
                    <FiMoreVertical />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-[#2A2F3E] rounded-lg shadow-lg border border-gray-600 z-50">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Handle change color theme
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-[#3A3F4E] hover:text-white transition-colors rounded-t-lg"
                      >
                        Change Color Theme
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Handle edit nickname
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-[#3A3F4E] hover:text-white transition-colors"
                      >
                        Edit Nickname
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Handle view profile
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-[#3A3F4E] hover:text-white transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // Handle delete conversation
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors rounded-b-lg"
                      >
                        Delete Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-y-auto min-h-0">
                {Object.entries(messagesByDate).map(([dateLabel, dateMessages]) => (
                  <div key={dateLabel}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center py-2">
                      <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {dateLabel}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    {dateMessages.map((m, i) => {
                      const showUnreadSeparator = dateLabel === "Today" && i === 3; // Show after 4th message of today
                      return (
                        <React.Fragment key={m.id}>
                          {showUnreadSeparator && (
                            <div className="flex items-center justify-center py-2">
                              <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                Unread messages
                              </div>
                            </div>
                          )}
                          <div className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} mb-2`}>
                            {m.from === "them" && (
                              <img src={m.avatar || "/default-avatar.png"} className="w-8 h-8 rounded-full mr-2" />
                            )}
                            <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-[200px] sm:max-w-xs md:max-w-sm ${m.from === "me" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}>
                              <p className="text-sm">{m.text}</p>
                              <div className="text-[10px] text-right mt-1 opacity-70">{m.time}</div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-2 sm:p-3 md:p-4 border-t border-gray-700">
                <div className="flex gap-2 sm:gap-3 bg-gray-800 rounded-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 items-center">
                  <FiPaperclip className="text-gray-400 cursor-pointer hover:text-white" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Type your message here..."
                  />
                  <button 
                    onClick={handleSend} 
                    className="text-blue-500 hover:text-blue-400 transition-colors p-1 sm:p-0"
                    disabled={!input.trim()}
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfChatPage;
