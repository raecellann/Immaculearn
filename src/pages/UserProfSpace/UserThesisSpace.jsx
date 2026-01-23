import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
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

const UserThesisSpace = () => {
  // Removed Add Member, Pending Invitations, and Post field for student view
  // const [isFocused, setIsFocused] = useState(false);
  // const [showInvitePopup, setShowInvitePopup] = useState(false);
  // const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  // const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // Removed pending invitations data for student view

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Removed invite and post field handlers for student view

  return (
    <div className="flex min-h-screen bg-[#1B1F26] text-white font-sans">
      {/* Desktop Sidebar (Laptop+) */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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
          <h1 className="text-xl font-bold">Thesis and Research</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/SpacesCover/thesis.jpg"
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

        <div className="p-4 sm:p-6 font-sans">
          {/* HEADER (no Add Member or Pending Invites for students) */}
          <div className="hidden md:block mb-8">
            <h1
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "Inter, Arial, sans-serif" }}
            >
              Thesis and Research
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(3 Members)</span>
            </div>
          </div>

          {/* TABS */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                >
                  Stream
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  onClick={() => navigate("/user-prof-space-thesis/tasks")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  onClick={() =>
                    navigate("/user-prof-space-thesis/files-shared")
                  }
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  onClick={() => navigate("/user-prof-space-thesis/people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* STREAM CONTENT FOR STUDENT VIEW - ZJ Space Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {/* Reminders Section */}
            <div className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 md:p-5">
              <h2
                className="font-bold mb-4 text-white"
                style={{ fontFamily: "Inter, Arial, sans-serif" }}
              >
                Reminders
              </h2>
              <div className="space-y-3">
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p
                    className="font-semibold text-sm text-white"
                    style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  >
                    Week 7 Reflection Paper
                  </p>
                  <p
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  >
                    Operating System • Oct 15
                  </p>
                </div>
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p
                    className="font-semibold text-sm text-white"
                    style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  >
                    Week 7 Individual Activity
                  </p>
                  <p
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Inter, Arial, sans-serif" }}
                  >
                    Operating System • Oct 15
                  </p>
                </div>
              </div>
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-black border border-gray-700 hover:bg-gray-900 text-white"
                style={{ fontFamily: "Inter, Arial, sans-serif" }}
              >
                <FiMessageCircle /> Enter Chat
              </button>
            </div>
            {/* Shared Files/Tasks Section */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiFileText className="text-blue-400" size={24} />
                  <div>
                    <p
                      className="font-semibold text-white"
                      style={{ fontFamily: "Inter, Arial, sans-serif" }}
                    >
                      Zeldrick shared a file with you
                    </p>
                    <p
                      className="text-sm text-gray-400"
                      style={{ fontFamily: "Inter, Arial, sans-serif" }}
                    >
                      OS • Week 7 Lecture
                    </p>
                  </div>
                </div>
                <button
                  className="text-blue-400 hover:underline bg-transparent"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                >
                  See File
                </button>
              </div>

              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiCheckCircle className="text-blue-400" size={24} />
                  <div>
                    <p
                      className="font-semibold text-white"
                      style={{ fontFamily: "Inter, Arial, sans-serif" }}
                    >
                      Zeldrick assigned task with you
                    </p>
                    <p
                      className="text-sm text-gray-400"
                      style={{ fontFamily: "Inter, Arial, sans-serif" }}
                    >
                      Thesis • Survey Revision
                    </p>
                  </div>
                </div>
                <button
                  className="text-blue-400 hover:underline bg-transparent"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                >
                  See Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Invite and Pending Invitations popups for student view */}
    </div>
  );
};

export default UserThesisSpace;
