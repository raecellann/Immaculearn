import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiFileText, FiMenu, FiX } from "react-icons/fi";

const ProfFilesShared = () => {
  const navigate = useNavigate();

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
      name: "Calculus: Lecture 3",
      date: "October 8, 2025",
      by: "Zeldrick",
      folder: "Math",
    },
    {
      name: "IAS : Lecture 1",
      date: "October 8, 2025",
      by: "Nathaniel",
      folder: "IAS",
    },
    {
      name: "CS Thesis 2 : Lecture 4",
      date: "October 8, 2025",
      by: "Raeccell",
      folder: "Thesis",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <ProfSidebar />
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
        <ProfSidebar />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
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
          <h1 className="text-xl font-bold">CS Thesis 2 Space</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">CS Thesis 2 Space</h1>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-space-thesis")}
                >
                  Stream
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-space-thesis/tasks")}
                >
                  Tasks
                </button>
                <button className="text-white text-base sm:text-lg md:text-xl font-semibold border-b-2 border-white pb-2 px-1 whitespace-nowrap bg-transparent">
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

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-end items-center gap-1.5 sm:gap-2 mb-6">
              <button className="text-gray-300 hover:text-white text-[10px] xs:text-xs sm:text-sm bg-transparent whitespace-nowrap px-1.5 py-0.5">
                Create Folder
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap">
                New File
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap">
                Upload
              </button>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-[#0F1115] rounded-xl p-6">
              <div className="grid grid-cols-4 text-sm text-gray-400 pb-3 border-b border-gray-700">
                <div>File Name</div>
                <div>Date Posted</div>
                <div>Posted By</div>
                <div>Folder Saved</div>
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <span>{file.name}</span>
                  </div>
                  <div>{file.date}</div>
                  <div>{file.by}</div>
                  <div>{file.folder}</div>
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
                  <p className="text-sm text-gray-400 mt-1">
                    Folder: <span className="text-white">{file.folder}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfFilesShared;
