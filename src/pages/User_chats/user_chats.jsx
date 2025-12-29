import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";

const ChatList = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const chats = [
    { id: 1, name: "Wilson Esmabe", message: "kumusta figma natin cel?", time: "1m", avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990149/wilson_gjdkdm.jpg", isYou: false,},
    { id: 2, name: "Nathaniel Fabuarada .", message: "Tapos na ba ung figma natin?", time: "2h", avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg", isYou: true, },
    { id: 3, name: "Zeldrick Jesus Delos Santos",message: "update sa chapter 2",time: "2w",avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg",isYou: false,},
    { id: 4, name: "Raecell Ann Galvez", message: "yaw ko na mag figma", time: "2w", avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990458/55516289_871534966513522_1623869577760866304_n_wh48kr.jpg", isYou: true, },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile / Tablet Header */}
        <div
          className="
            lg:hidden
            sticky top-0 z-30
            bg-[#1E222A]
            px-4
            pt-[env(safe-area-inset-top)]
            border-b border-[#3B4457]
          "
        >
          <div className="flex items-center h-14">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-2xl leading-none bg-transparent p-0 border-none focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              ☰
            </button>

            <h1 className="ml-4 text-lg font-bold truncate">Chats</h1>

            <div className="ml-auto">
              <Button
                style={{
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.75rem",
                  backgroundColor: "#3B82F6",
                  borderRadius: "0.375rem",
                }}
              >
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex relative items-center px-8 py-6">
          <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold">
            Chats
          </h1>
          <div className="ml-auto">
            <Button
              style={{
                padding: "0.45rem 1.1rem",
                fontSize: "0.9rem",
                backgroundColor: "#3B82F6",
                borderRadius: "0.375rem",
              }}
            >
              New Message
            </Button>
          </div>
        </div>

        {/* ✅ CHAT LIST – FULL WIDTH, NO SIDE GAPS */}
        <div className="flex-1 overflow-y-auto pb-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="
                flex items-center gap-3 sm:gap-4
                px-3 sm:px-4
                py-3 sm:p-4
                border-b border-gray-700
                hover:bg-[#1F242D]
                transition
                cursor-pointer
              "
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-sm sm:text-base truncate">
                    {chat.name}
                  </h2>
                  <span className="text-xs text-gray-400 ml-2">
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

export default ChatList;
