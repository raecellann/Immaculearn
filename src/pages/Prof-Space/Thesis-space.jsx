import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
} from "react-icons/fi";
import Logout from "../component/logout";

const ThesisSpace = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);
  const navigate = useNavigate();

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

  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar (Laptop+) */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header (Mobile + Tablet) */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">CS Thesis 2 Space</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Cover"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* SEARCH - Desktop */}
          <div className="hidden md:block absolute top-4 right-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          {/* SEARCH - Mobile */}
          <div className="md:hidden absolute bottom-4 left-4 right-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* HEADER */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              CS Thesis 2 Space
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(5 Members)</span>
              <button className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition">
                Manage Class
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent">
                  Stream
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-space-thesis/tasks")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-space-thesis/files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-space-thesis/people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* Manage Class Button - Mobile */}
          <div className="md:hidden flex justify-end mb-6">
            <button className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition text-sm">
              Manage Class
            </button>
          </div>

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
                src="/src/assets/HomePage/frieren-avatar.jpg"
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
                data-placeholder="Announce something to your class..."
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
                      <button className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0">
                        <FiCheckCircle className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          Create Assignment
                        </span>
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

          {/* ANNOUNCEMENTS */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Recent Announcements</h2>
            <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/src/assets/HomePage/frieren-avatar.jpg"
                  alt="Professor Susan"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">Professor Susan</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Don't forget to submit your research proposals by Friday. Make
                sure to include your methodology and expected outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ThesisSpace;
