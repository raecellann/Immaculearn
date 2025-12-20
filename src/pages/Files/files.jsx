import React, { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";

const FilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const spaces = [
    { name: "ZJ’s Space" },
    { name: "Wilson’s Space" },
    { name: "Nath’s Space" },
    { name: "Raecell’s Space" },
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
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <h1 className="hidden md:block text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">Files</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          {spaces.map((space, index) => (
            <div
              key={index}
              className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
              onClick={() => {
                if (space.name === "ZJ’s Space") navigate("/view-all-files");
                if (space.name === "Raecell’s Space")
                  navigate("/create-file-admin");
              }}
            >
              <span className="text-xl">📁</span>
              <p className="text-lg">{space.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default FilePage;
