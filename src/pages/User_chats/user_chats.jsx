import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";
import { FiEdit, FiSend, FiImage, FiMoreVertical, FiPaperclip, FiSmile, FiUser, FiTrash2 } from "react-icons/fi";
import { BsCheck2 } from "react-icons/bs";

const ChatList = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [conversations, setConversations] = useState({
    zeldrick: {
      id: "zeldrick",
      name: "Zeldrick Jesus25",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg",
      type: "person",
      messages: [
        { from: "them", text: "Hello, cell!", time: "08:34 AM" },
        {
          from: "them",
          text: "Kamusta prototype natin sa figma?",
          time: "08:35 AM",
        },
        {
          from: "me",
          text: "Hello, zj!",
          time: "08:36 AM",
        },
        {
          from: "me",
          text: "Nagawa ko na ibang pages, paki-check naman pre",
          time: "08:37 AM",
        },
        {
          from: "them",
          text: "Okay na rin pala 'yong paper natin",
          time: "08:38 AM",
        },
        {
          from: "them",
          text: "Ayon sakto, anong chapter po?",
          time: "08:39 AM",
        },
        {
          from: "them",
          text: "Chapter 3. Pero paki-proof read mo na rin",
          time: "08:40 AM",
        },
        {
          from: "me",
          text: "owki, no worries pre. Update me later",
          time: "08:41 AM",
        },
      ],
    },
    nathaniel: {
      id: "nathaniel",
      name: "Nathaniel Fabuarada",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
      type: "person",
      messages: [
        {
          from: "them",
          text: "Tapos na ba yung figma natin? 😄",
          time: "09:10 AM",
        },
        {
          from: "me",
          text: "Oo naman! Ready na for review",
          time: "09:15 AM",
        },
      ],
    },
    maria: {
      id: "maria",
      name: "Maria Santos",
      avatar:
        "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
      type: "person",
      messages: [
        {
          from: "them",
          text: "Good morning! Ready na ba for presentation?",
          time: "07:30 AM",
        },
        {
          from: "me",
          text: "Morning! Yes, ready na. See you later!",
          time: "07:45 AM",
        },
      ],
    },
    john: {
      id: "john",
      name: "Wilson Esmabe",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990149/wilson_gjdkdm.jpg",
      type: "person",
      messages: [
        {
          from: "them",
          text: "Bro, paki-send nung docs",
          time: "10:20 AM",
        },
      ],
    },
    sarah: {
      id: "sarah",
      name: "Sarah Chen",
      avatar:
        "https://res.cloudinary.com/diws5bcu6/image/upload/v1767278617/1382144_gfoesr.png",
      type: "person",
      messages: [
        {
          from: "me",
          text: "Thanks for the help earlier!",
          time: "Yesterday",
        },
        {
          from: "them",
          text: "You're welcome! Anytime 😊",
          time: "Yesterday",
        },
      ],
    },
    thesis: {
      id: "thesis",
      name: "Thesis Group",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990458/55516289_871534966513522_1623869577760866304_n_wh48kr.jpg",
      type: "group",
      messages: [
        {
          from: "them",
          text: "Chapter 3 discussion later 📘",
          time: "10:00 AM",
        },
        {
          from: "them",
          text: "Don't forget the deadline this Friday!",
          time: "11:30 AM",
        },
      ],
    },
    project_team: {
      id: "project_team",
      name: "Project Team Alpha",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990500/team_h7i8j9.jpg",
      type: "group",
      messages: [
        {
          from: "them",
          text: "Meeting moved to 2PM today",
          time: "08:00 AM",
        },
        {
          from: "me",
          text: "Noted, thanks for the update!",
          time: "08:05 AM",
        },
      ],
    },
    study_group: {
      id: "study_group",
      name: "CS Study Group",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990550/study_k1l2m3.jpg",
      type: "group",
      messages: [
        {
          from: "them",
          text: "Review session tomorrow at the library",
          time: "Yesterday",
        },
      ],
    },
  });

  const activeChat = activeChatId ? conversations[activeChatId] : null;

  const handleMobileChatSelect = (chatId) => {
    setActiveChatId(chatId);
    setShowMobileChat(true);
  };

  const handleBackToChatList = () => {
    setShowMobileChat(false);
  };

  const sendMessage = (type = "text", content = "") => {
    if (!activeChat || (!input.trim() && type === "text")) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg =
      type === "image"
        ? { from: "me", image: content, time }
        : { from: "me", text: input, time };

    setConversations((prev) => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMsg],
      },
    }));

    setInput("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => sendMessage("image", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transition-transform lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex px-6 py-6 gap-6 h-screen overflow-hidden">
        {/* CHAT LIST - Hidden on mobile when chat is selected */}
        <div className={`${showMobileChat ? 'hidden lg:block' : 'block'} w-full lg:w-[420px] flex flex-col min-h-0`}>
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden text-2xl leading-none bg-transparent p-0 border-none outline-none focus:outline-none focus:ring-0 active:bg-transparent"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                ☰
              </button>


              <h1 className="text-lg font-bold truncate">Chats</h1>
            </div>

            <div className="ml-auto">
              <Button
                style={{
                  padding: "0.4rem",
                  backgroundColor: "#3B82F6",
                  borderRadius: "8px",
                }}
              >
                <FiEdit />
              </Button>
            </div>
          </div>

          <input
            placeholder="Search People"
            className="w-full mb-4 px-4 py-2 rounded-full bg-[#EDEAF0] text-black text-sm"
          />

          <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
            <div 
              className="bg-white rounded-xl p-4 text-black overflow-y-auto h-48"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitScrollbar: { display: 'none' }
              }}
            >
              <h2 className="text-sm font-semibold mb-3">People</h2>
              {["zeldrick", "nathaniel", "maria", "john", "sarah"].map((id) => (
                <div
                  key={id}
                  onClick={() => handleMobileChatSelect(id)}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2"
                >
                  <img
                    src={conversations[id].avatar}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold text-sm">
                    {conversations[id].name}
                  </p>
                </div>
              ))}
            </div>

            <div 
              className="bg-white rounded-xl p-4 text-black overflow-y-auto h-48"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitScrollbar: { display: 'none' }
              }}
            >
              <h2 className="text-sm font-semibold mb-3">Groups</h2>
              {["thesis", "project_team", "study_group"].map((id) => (
                <div
                  key={id}
                  onClick={() => handleMobileChatSelect(id)}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2"
                >
                  <div className="relative w-10 h-10">
                    <img
                      src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg"
                      className="absolute top-0 left-2 w-6 h-6 rounded-full border-2 border-white"
                    />
                    <img
                      src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg"
                      className="absolute top-0 right-2 w-6 h-6 rounded-full border-2 border-white"
                    />
                    <img
                      src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg"
                      className="absolute bottom-0 left-2 w-6 h-6 rounded-full border-2 border-white"
                    />
                  </div>
                  <p className="font-semibold text-sm">
                    {conversations[id].name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE CHAT VIEW */}
        <div className={`${showMobileChat ? 'block' : 'hidden'} lg:hidden absolute inset-0 bg-[#161A20] p-6`}>
          {/* Mobile Header - Outside conversation */}
            <div className="flex items-center h-14 mb-4">
              {/* LEFT SIDE: Back + Avatar + Name */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToChatList}
                  className="text-gray-400 hover:text-gray-200 bg-transparent p-0"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {activeChat && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeChat.avatar}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="leading-tight">
                      <h2 className="font-semibold text-white text-sm truncate max-w-[140px]">
                        {activeChat.name}
                      </h2>
                      <p className="text-[10px] text-green-400">Active now</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Menu */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="ml-auto text-gray-400 hover:text-gray-200 bg-transparent p-0"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>


          {activeChat ? (
            <div className="bg-white rounded-xl w-full flex flex-col h-[calc(100%-5rem)]">

              {/* Messages */}
              <div 
                className="flex-1 p-3 space-y-2 overflow-y-auto bg-gray-50"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                {/* Unread messages separator */}
                <div className="flex items-center justify-center my-3">
                  <div className="bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full">
                    Unread messages
                  </div>
                </div>
                
                {activeChat.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.from === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-2xl ${
                        m.from === "me"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-200 text-black rounded-bl-sm"
                      }`}
                    >
                      {m.text && <p className="text-xs">{m.text}</p>}
                      {m.image && (
                        <img
                          src={m.image}
                          className="rounded-lg max-h-32"
                        />
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        m.from === "me" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        <p className="text-[9px]">
                          {m.time}
                        </p>
                        {m.from === "me" && (
                          <BsCheck2 size={10} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent outline-none text-xs text-gray-700 placeholder-gray-500"
                  />
                  <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                    <FiPaperclip size={16} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImage}
                    />
                  </label>
                  <button
                    onClick={() => sendMessage()}
                    className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FiSend size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </div>

        {/* CHAT PANEL */}
        <div className="hidden lg:flex flex-1">
          {activeChat ? (
            <div className="bg-white rounded-xl w-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeChat.avatar}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-black text-lg">
                      {activeChat.name}
                    </h2>
                    <p className="text-xs text-green-500">Active now</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FiMoreVertical size={20} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 text-white">
                      <ul className="py-1">
                        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          Change Color Theme
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-xs">
                          <FiEdit size={14} />
                          Edit Nickname
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-xs">
                          <FiUser size={14} />
                          View Profile
                        </li>
                        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-500 flex items-center gap-2 text-xs">
                          <FiTrash2 size={14} />
                          Delete Conversation
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                {/* Unread messages separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                    Unread messages
                  </div>
                </div>
                
                {activeChat.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.from === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        m.from === "me"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-200 text-black rounded-bl-sm"
                      }`}
                    >
                      {m.text && <p className="text-sm">{m.text}</p>}
                      {m.image && (
                        <img
                          src={m.image}
                          className="rounded-lg max-h-48"
                        />
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-2 ${
                        m.from === "me" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        <p className="text-[10px]">
                          {m.time}
                        </p>
                        {m.from === "me" && (
                          <BsCheck2 size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                  />
                  <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                    <FiPaperclip size={20} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImage}
                    />
                  </label>
                  <button
                    onClick={() => sendMessage()}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
