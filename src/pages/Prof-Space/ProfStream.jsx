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
  FiUpload,
} from "react-icons/fi";
import Logout from "../component/logout";

const ProfStreamPage = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // File upload states
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = {
        id: Date.now(),
        name: e.dataTransfer.files[0].name,
        size: e.dataTransfer.files[0].size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const handleFileChange = (e) => {
    console.log('File change triggered', e.target.files);
    if (e.target.files && e.target.files[0]) {
      const newFile = {
        id: Date.now(),
        name: e.target.files[0].name,
        size: e.target.files[0].size,
      };
      console.log('New file added:', newFile);
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  useEffect(() => {
    console.log('showFileUploadModal changed:', showFileUploadModal);
  }, [showFileUploadModal]);

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
                  onClick={() => navigate("/prof-stream/tasks")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-stream/files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/prof-stream/people")}
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
            onClick={() => !showFileUploadModal && editorRef.current?.focus()}
          >
            <div className="relative p-6">
              {/* AVATAR */}
              <img
                src="/src/assets/HomePage/jober.jpg"
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
                  // Only close if editor is empty and no modal is open
                  if (editorRef.current.innerText.trim() === "" && !showFileUploadModal) {
                    // Don't close immediately - give user time to interact
                    setTimeout(() => {
                      if (editorRef.current.innerText.trim() === "" && !showFileUploadModal) {
                        setIsFocused(false);
                      }
                    }, 200);
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
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add File button clicked');
                          setShowFileUploadModal(true);
                        }}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0"
                      >
                        <FiFileText className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add File</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add Link button clicked');
                          // TODO: Add link modal functionality
                        }}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0"
                      >
                        <FiLink className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add Link</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Create Assignment button clicked');
                          // TODO: Add assignment modal functionality
                        }}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0"
                      >
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
            <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <img
                    src="/src/assets/HomePage/jober.jpg"
                    alt="Sir Jober"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold">
                      Sir Jober posted an announcement
                    </p>
                    <p className="text-sm text-gray-400">
                      Don't forget to submit your research proposals by Friday. Make sure to include your methodology and expected outcomes.
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {/* REMINDERS */}
            <div className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 md:p-5">
              <h2 className="font-bold mb-4">Reminders</h2>
              <div className="space-y-3">
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Reflection Paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Individual Activity
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
              </div>

              {/* CHAT */}
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-black border border-gray-700 hover:bg-gray-900">
                <FiMessageCircle />
                Enter Chat
              </button>
            </div>

            {/* ACTIVITY */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiFileText className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick shared a file with you
                    </p>
                    <p className="text-sm text-gray-400">OS • Week 7 Lecture</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See File
                </button>
              </div>

              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiCheckCircle className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick assigned task with you
                    </p>
                    <p className="text-sm text-gray-400">
                      Thesis • Survey Revision
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILE UPLOAD MODAL */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowFileUploadModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <FiX size={24} />
            </button>

            {/* CONTENT */}
            <div className="p-8 pt-12">
              {/* TITLE */}
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create file or Upload files here.
              </h2>

              {/* UPLOAD SECTION */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition relative ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />

                <FiUpload size={40} className="mx-auto mb-3 text-gray-400" />

                <p className="text-gray-900 font-medium text-sm">
                  Choose a file or drag & drop it here.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  DOCS, PDF, PPT AND EXCEL, UP TO 50 MB
                </p>
              </div>

              {/* BROWSE BUTTON */}
              <button
                onClick={() => document.getElementById("file-upload").click()}
                className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition mb-4 bg-white"
              >
                Browse Files
              </button>

              {/* DIVIDER */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">Or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* CREATE FILE BUTTON */}
              <button
                onClick={() => {
                  navigate("/create-document");
                  setShowFileUploadModal(false);
                }}
                className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center space-x-2 bg-white mb-6"
              >
                <FiFileText size={20} />
                <span>Create File</span>
              </button>

              {/* UPLOADED FILES LIST */}
              {uploadedFiles.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* FILE HEADER */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="text-2xl">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {file.name.toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(file.size / 1024).toFixed(0)}KB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Announce something to your class...";
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfStreamPage;
