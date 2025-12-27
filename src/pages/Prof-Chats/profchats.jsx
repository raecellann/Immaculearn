import React, { useState } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";

const ProfChatsPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const chats = [
    {
      name: "WEsnabe1920",
      message:
        "Good Evening po, Sir Jober. Nakapag-pasa na po ako ng OJT Paper.",
      time: "1m",
      avatar: "/avatar1.png",
    },
    {
      name: "Nathaniel F.",
      message: "Okay na, nakita ko na output mo.",
      time: "2h",
      avatar: "/avatar2.png",
      isYou: true,
    },
    {
      name: "CS THESIS 1 - 1SY2025-2026",
      message:
        "Good Evening mga AnaCS4... On-line consultation na lang muna tayo bukas.",
      time: "15m",
      avatar: "/group.png",
      isYou: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 max-w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>

          <h1 className="text-lg sm:text-xl font-bold flex-1 text-center">
            Chats
          </h1>

          <Button
            style={{
              padding: "0.3rem 0.7rem",
              fontSize: "0.7rem",
              backgroundColor: "#3B82F6",
              borderRadius: "0.375rem",
            }}
          >
            New
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex relative items-center mb-6">
          <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl xl:text-3xl font-bold">
            Chats
          </h1>
          <div className="ml-auto">
            <Button
              style={{
                padding: "0.4rem 1rem",
                fontSize: "0.85rem",
                backgroundColor: "#3B82F6",
                borderRadius: "0.375rem",
              }}
            >
              New Message
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-1 sm:space-y-2">
          {chats.map((chat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-md
                         hover:bg-[#1F242D] cursor-pointer transition
                         border-b border-gray-700"
            >
              {/* Avatar */}
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
              />

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-sm sm:text-base truncate">
                    {chat.name}
                  </h2>
                  <span className="text-[10px] sm:text-xs text-gray-400 ml-2">
                    {chat.time}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {chat.isYou ? "You: " : ""}
                  {chat.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfChatsPage;
