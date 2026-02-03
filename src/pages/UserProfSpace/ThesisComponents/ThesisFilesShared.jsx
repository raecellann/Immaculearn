import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import { FiFileText, FiMenu, FiX } from "react-icons/fi";

const ThesisFilesShared = () => {
  const navigate = useNavigate();

  /* ================= HEADER + SIDEBAR (ZJ MATCH) ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  const files = [
    {
      name: "Thesis Proposal Draft",
      date: "April 10, 2025",
      by: "Jober Reyes",
      folder: "Thesis Documents",
    },
    {
      name: "Literature Review Matrix",
      date: "April 8, 2025",
      by: "Jober Reyes",
      folder: "Research Materials",
    },
    {
      name: "Data Collection Form",
      date: "April 5, 2025",
      by: "Jober Reyes",
      folder: "Research Tools",
    },
    {
      name: "Methodology Chapter",
      date: "April 3, 2025",
      by: "Jober Reyes",
      folder: "Thesis Chapters",
    },
    {
      name: "Survey Questionnaire",
      date: "April 1, 2025",
      by: "Jober Reyes",
      folder: "Research Tools",
    },
    {
      name: "Bibliography References",
      date: "March 28, 2025",
      by: "Jober Reyes",
      folder: "Research Materials",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER (EXACT ZJ) ================= */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457]
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <h1 className="text-xl font-bold">Jober Reyes' Thesis</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1769190537/cover_vwmkbn.png"
            alt="cover"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Jober Reyes' Thesis</h1>
          </div>

          {/* ================= TABS (ZJ COPY) ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis")}
                >
                  Stream
                </button>

                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis/tasks")}
                >
                  Tasks
                </button>

                <button className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent">
                  Files Shared
                </button>

                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis/people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-[#0F1115] rounded-xl p-6">
              <div className="grid grid-cols-4 text-sm text-gray-400 pb-3 border-b border-gray-700">
                <div className="col-span-2">File Name</div>
                <div>Date Posted</div>
                <div>Posted By</div>
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4"
                >
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <span>{file.name}</span>
                  </div>
                  <div>{file.date}</div>
                  <div>{file.by}</div>
                </div>
              ))}
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="md:hidden space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <p className="font-semibold">{file.name}</p>
                  </div>

                  <p className="text-sm text-gray-400">
                    Date: <span className="text-white">{file.date}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Posted by: <span className="text-white">{file.by}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ThesisFilesShared;
