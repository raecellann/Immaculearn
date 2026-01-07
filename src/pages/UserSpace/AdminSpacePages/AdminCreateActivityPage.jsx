import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
  FiMenu,
  FiX
} from "react-icons/fi";


const AdminCreateActivityPage = () => {
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Apply formatting ONLY inside instruction box
  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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

          <h1 className="text-xl font-bold">Zeldrick's Space</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        <div className="p-4 sm:p-6">
          {/* ================= COVER ================= */}
          <div className="relative mb-6">
            <img
              src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
              className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-b-xl"
              alt="cover"
            />
            <div className="absolute inset-0 bg-black/50 rounded-b-xl" />
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-black text-white px-6 sm:px-10 py-3 rounded-br-[1rem] text-xl sm:text-2xl font-extrabold">
                Zeldrick's Space
              </div>
            </div>
          </div>

          {/* ================= BACK BUTTON ================= */}
          <div className="flex justify-end mb-6">
            <button
              className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
              onClick={() => navigate("/admin-task-page")}
            >
              <FiArrowLeft size={16} /> 
              <span className="hidden sm:inline">Back to Tasks</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          {/* ================= FORM CARD ================= */}
          <div className="max-w-6xl mx-auto bg-black rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-white">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT SECTION */}
              <div className="flex-1 flex flex-col gap-4">
              <label className="font-semibold text-lg">
                Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                placeholder="Enter activity title"
              />

              {/* INSTRUCTION */}
              <label className="font-semibold">Instruction (optional)</label>

              <div className="bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
                {/* Editable Instruction Area */}
                <div
                  ref={instructionRef}
                  contentEditable
                  className="min-h-[140px] px-4 py-3 outline-none"
                  suppressContentEditableWarning
                />

                {/* Divider */}
                <div className="border-t border-[#2F3440]" />

                {/* Formatting Toolbar (BOTTOM) */}
                <div className="flex gap-4 px-4 py-2 text-gray-300">
                  <button
                    type="button"
                    onClick={() => applyFormat("bold")}
                    className="hover:text-white"
                  >
                    <FiBold />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("italic")}
                    className="hover:text-white"
                  >
                    <FiItalic />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("underline")}
                    className="hover:text-white"
                  >
                    <FiUnderline />
                  </button>
                </div>
              </div>

              {/* FILE UPLOAD */}
              <div className="mt-6">
                <label className="block font-semibold mb-2">
                  Choose a file or drag & drop it here.
                </label>

                <div
                  onClick={handleFileClick}
                  className="border border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-[#0F1115] hover:border-blue-500 transition"
                >
                  <FiUploadCloud size={36} className="mb-3 text-gray-300" />

                  <p className="text-sm text-gray-300 mb-2">
                    Choose a file or drag & drop it here.
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    DOCS, PDF, PPT AND EXCEL, UP TO 10 MB
                  </p>

                  <button
                    type="button"
                    className="px-4 py-1.5 border border-gray-400 rounded-md text-sm hover:bg-gray-800"
                  >
                    Browse Files
                  </button>

                  <input ref={fileInputRef} type="file" className="hidden" />
                </div>
              </div>
            </div>

              {/* RIGHT SECTION */}
              <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
              <label className="font-semibold">Grades:</label>
              <input
                type="text"
                className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                placeholder="e.g. 95/100"
              />

              <label className="font-semibold">Assignees:</label>
              <select className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500">
                <option>Individual</option>
                <option>Group</option>
              </select>

              <label className="font-semibold">Due Date:</label>
              <input
                type="date"
                className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
              />
            </div>
          </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto">
                Publish Activity
              </button>
              <button className="bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateActivityPage;
