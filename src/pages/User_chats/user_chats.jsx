import React, { useState } from "react";
import Sidebar from "../component/sidebar";

const ChatList = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Replace with actual data
  const chats = [
    {
      id: 1,
      name: "WEsmabe192O",
      message: "kumusta figma natin cel?",
      time: "1m",
      avatar: "https://via.placeholder.com/40",
      isYou: false,
    },
    {
      id: 2,
      name: "NathanielF.",
      message: "Tapos na ba ung figma natin?",
      time: "2h",
      avatar: "https://via.placeholder.com/40",
      isYou: true,
    },
    {
      id: 3,
      name: "ZeldrickJesus25",
      message: "update sa chapter 2",
      time: "2w",
      avatar: "https://via.placeholder.com/40",
      isYou: false,
    },
    {
      id: 4,
      name: "Galvez Raecell",
      message: "yaw ko na mag figma",
      time: "2w",
      avatar: "https://via.placeholder.com/40",
      isYou: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 md:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>

        {/* Chat List */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Desktop Header */}
          <div className="hidden md:flex p-4 justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-semibold">Chats</h2>
            <button className="text-gray-400 hover:text-white">⤢</button>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{chat.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.isYou ? "You: " : ""}
                    {chat.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700">
              💬 Chats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
