import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import {
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiCopy,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiSearch,
  FiPaperclip,
  FiSmile,
  FiSend,
  FiUser,
  FiChevronLeft,
  FiMinus,
  FiMaximize2,
  FiMinimize2,
  FiChevronUp
} from "react-icons/fi";

import { useUser } from "../../contexts/user/useUser";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import PageNotFound from "../PageNotFound/pageNotFound";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { useSpaceChat } from "../../hooks/useSpaceChat"; // ✅ new hook

const UserPage = () => {
  // ALL hooks go here - MUST BE AT THE TOP
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const { user, isLoading } = useUser();
  const {
    userSpaces,
    friendSpaces,
    useJoinRequests,
    isLoading: spaceLoading,
    joinRequests,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace
  } = useSpace();

  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();

  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  // =======================
  // Chat Hook
  // =======================
  const { messages, sendMessage, spaceOnlineUsers, getOnlineCount } = useSpaceChat(space_uuid, user);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage('');

    // Auto-scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  const { data: joinRequestsData = [], isLoading: joinRequestsLoading } = useJoinRequests(space_uuid || "");

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

  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
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

  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

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

  // 1️⃣ First check loading state
  if (isLoading || spaceLoading) {
    return <div className="flex h-screen justify-center items-center"><MainLoading /></div>;
  }

  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const isValidUuid = uuidPattern.test(space_uuid);
  const currentSpace = allSpaces.find(space => space.space_uuid === space_uuid);
  const isOwnerSpace = currentSpace?.creator === user.id;
  const isFriendSpace = !isOwnerSpace;

  if (!isValidUuid || !currentSpace) {
    return <PageNotFound />;
  }

  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const userAvatar = user?.profile_pic || "/src/assets/HomePage/frieren-avatar.jpg";

  const handleDeleteRoom = async () => {
    if (!currentSpace) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${currentSpace.space_name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      alert(`Space "${currentSpace.space_name}" deleted successfully.`);
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
  };

  // =======================
  // JSX Return
  // =======================
  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:block lg:hidden`}>
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none">
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>
        <div className="lg:hidden h-16"></div>

        {/* COVER */}
        <div className="relative">
          <img src="/src/assets/UserSpace/cover.png" alt="Cover" className="w-full h-32 sm:h-40 md:h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          {/* Search Desktop */}
          <div className="hidden md:block absolute top-4 right-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search" className="pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
            </div>
          </div>
          {/* Search Mobile */}
          <div className="md:hidden absolute bottom-4 left-4 right-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search" className="w-full pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* HEADER */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">({(currentSpace?.members.length) || 0} member(s))</span>
              {isOwnerSpace && (
                <>
                  <button 
                    onClick={handleInviteMember} 
                    className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition"
                  >
                    Add Member
                  </button>
                  <button 
                    onClick={() => setShowPendingInvitations(true)} 
                    className="px-3 py-1 text-xs bg-blue-600 rounded-md hover:bg-blue-500 transition"
                  >
                    Pending Invites
                  </button>
                  <button
                    onClick={handleDeleteRoom}
                    className="px-3 py-1 text-xs bg-red-600 rounded-md hover:bg-red-500 transition"
                  >
                    Delete Room
                  </button>
                </>
              )}
              {isFriendSpace && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md">
                    <span className="text-xs text-blue-400 break-all">
                      {currentSpace?.space_link || 'Loading...'}
                    </span>
                    <button
                      onClick={() => {
                        if (currentSpace?.space_link) {
                          navigator.clipboard.writeText(currentSpace.space_link)
                            .then(() => {
                              const button = document.getElementById('copy-space-link-btn');
                              if (button) {
                                const originalHTML = button.innerHTML;
                                button.innerHTML = '<FiCheckCircle className="text-green-500" />';
                                setTimeout(() => {
                                  button.innerHTML = originalHTML;
                                }, 2000);
                              }
                            })
                            .catch(err => console.error('Failed to copy link:', err));
                        }
                      }}
                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                      id="copy-space-link-btn"
                      title="Copy to clipboard"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* TABS */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button className="text-white text-base sm:text-lg md:text-xl font-semibold border-b-2 border-white pb-2 px-1 whitespace-nowrap bg-transparent">
                  Stream
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}/files`)}
                >
                  Files
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}/people`)}
                >
                  People
                </button>
              </div>
            </div>
          </div>
          
          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <button 
                onClick={handleInviteMember} 
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition text-sm"
              >
                Add Member
              </button>
              <button 
                onClick={() => setShowPendingInvitations(true)} 
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition text-sm"
              >
                Pending Invites
              </button>
            </div>
          )}

          {/* POST BOX */}
          <div
            className={`
              bg-white rounded-xl border cursor-text transition
              ${isFocused ? "border-black" : "border-transparent"}
              hover:border-black
            `}
            onClick={() => editorRef.current?.focus()}
          >
            <div className="relative p-6">
              {/* AVATAR */}
              <img
                src={userAvatar}
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
                  <div className="flex gap-8 mt-4 text-black">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("bold");
                      }}
                      className="font-bold text-lg bg-white"
                    >
                      B
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("italic");
                      }}
                      className="italic text-lg bg-white"
                    >
                      I
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("underline");
                      }}
                      className="underline text-lg bg-white"
                    >
                      U
                    </button>
                  </div>

                  <div className="mt-4 border-t border-gray-300" />

                  {/* FOOTER */}
                  <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600">
                      <button className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0">
                        <FiFileText className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add File</span>
                      </button>
                      <button className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0">
                        <FiLink className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add Link</span>
                      </button>
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
                      <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">
                        Post
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {/* REMINDERS */}
            <div className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 md:p-5">
              <h2 className="font-bold mb-4">Reminders</h2>
              <div className="space-y-3">
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Reflection Paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Individual Activity
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
              </div>

              {/* CHAT */}
              <button 
                onClick={() => setShowChat(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-black border border-gray-700 hover:bg-gray-900 transition-colors"
              >
                <FiMessageCircle />
                Enter Chat
              </button>

              {/* Chat Popup */}
              {showChat && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-0">
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => !isChatMinimized && setShowChat(false)} />
                  <div className={`relative w-full ${isChatMaximized ? 'h-screen max-w-full' : 'max-w-md sm:max-w-lg'} transform transition-all duration-300 ease-in-out ${isChatMinimized ? 'translate-y-[calc(100%-48px)]' : ''}`}>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between bg-[#1E222A] rounded-t-lg p-3 border-b border-gray-700 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white text-sm">{spaceName}</h3>
                          <div className="flex items-center py-2 text-sm text-gray-400">
                            <div className={`w-2 h-2 rounded-full mr-2 ${spaceOnlineUsers[space_uuid]?.length ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span>{spaceOnlineUsers[space_uuid]?.length || 0} online</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={(e) => { e.stopPropagation(); setIsChatMaximized(!isChatMaximized); }} className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700" title={isChatMaximized ? 'Restore' : 'Maximize'}>
                          {isChatMaximized ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowChat(false); setIsChatMinimized(false); setIsChatMaximized(false); }} className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700" title="Close">
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    {!isChatMinimized && (
                      <>
                        <div className={`bg-[#141820] overflow-y-auto ${isChatMaximized ? 'h-[calc(100vh-120px)]' : 'h-96'} p-4 space-y-2`}>
                          {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex flex-col pl-2 ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 rounded-lg max-w-xs break-words ${message.senderId === user?.id ? 'bg-blue-500 rounded-tr-none text-white' : 'bg-gray-700 rounded-tl-none text-gray-200'}`}>
                                  {message.content}
                                </div>
                                <p className={`text-xs mt-2 ${message.senderId === user?.id ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="bg-[#1B1F26] p-3 rounded-b-lg border-t border-gray-700">
                          <div className="flex items-center space-x-2">
                            <button type="button" className="text-gray-400 hover:text-white p-2">
                              <FiPaperclip />
                            </button>
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 bg-[#141820] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button type="submit" className="text-blue-400 hover:text-blue-300 p-2" disabled={!newMessage.trim()}>
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

            {/* ACTIVITY */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiFileText className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick shared a file with you
                    </p>
                    <p className="text-sm text-gray-400">OS • Week 7 Lecture</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See File
                </button>
              </div>

              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiCheckCircle className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick assigned task with you
                    </p>
                    <p className="text-sm text-gray-400">
                      Thesis • Survey Revision
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See Task
                </button>
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
                {joinRequestsData.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No pending invitations</p>
                ) : (
                  joinRequestsData.map((invitation) => (
                    <div key={invitation.account_id} className="bg-[#2A2F3A] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={invitation.profile_pic}
                          alt={invitation.fullname}
                          className="w-12 h-12 rounded-full object-cover"
                        />
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

        {/* INVITE POPUP */}
        {showInvitePopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#E6E6E6] rounded-2xl w-[420px] max-w-[90vw] p-6 shadow-xl">
              
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">Add Member</h2>
                <button
                  onClick={() => setShowInvitePopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* INVITATION LINK */}
              <div className="mb-4">
                <p className="text-sm font-medium text-black mb-1">
                  Invitation Link
                </p>
                <div className="flex items-center justify-between bg-white px-3 py-1 rounded-md border border-gray-300">
                  <span className="text-xs text-gray-600 truncate flex-1">
                    {currentSpace?.space_link}
                  </span>
                  {/* <button className="text-gray-500 hover:text-black text-sm ml-2">
                    Copy Link
                  </button> */}
                  <button 
                    onClick={() => handleCopyLink(currentSpace?.space_link)} 
                    className={`text-sm ml-2 px-2 py-1 rounded transition-colors ${
                      copyFeedback 
                        ? copyFeedback === "Copied!" 
                          ? "text-green-600 bg-green-50" 
                          : "text-red-600 bg-red-50"
                        : "text-gray-500 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    {copyFeedback || "Copy Link"}
                  </button>
                </div>
              </div>

              {/* INPUT */}
              <div className="mb-4">
                <p className="text-sm font-medium text-black mb-1">
                  Type username or email
                </p>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="
                    w-full
                    px-3
                    py-2
                    rounded-md
                    border
                    border-purple-500
                    bg-white
                    text-black
                    outline-none
                    focus:ring-2
                    focus:ring-purple-500
                  "
                />
              </div>

              {/* SUGGESTED USERS */}
              <div>
                <p className="text-sm font-medium text-black mb-2">
                  Suggested Users
                </p>

                <div className="space-y-3">
                  {[
                    {
                      name: "Raecell Ann Galvez",
                      email: "raecellanngalvez@gmail.com",
                      avatar: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
                    },
                    {
                      name: "Nathaniel Faborada",
                      email: "faboradanathaniel@gmail.com",
                      avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
                    },
                    {
                      name: "Wilson Esmabe",
                      email: "wilsonesmabe2003@gmail.com",
                      avatar: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/wilson_fw2qoz.jpg",
                    },
                  ].map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-transparent hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-black">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Post something to your space";
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
};

export default UserPage;