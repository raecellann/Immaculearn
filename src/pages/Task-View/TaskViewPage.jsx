import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import InputField from "@/pages/component/InputField";
import Logout from "../component/logout";

const TaskViewPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [spaceComment, setSpaceComment] = useState("");
  const [privateComment, setPrivateComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedInstruction, setUploadedInstruction] = useState(null);
  const [showSendSpace, setShowSendSpace] = useState(false);
  const [showSendPrivate, setShowSendPrivate] = useState(false);

  // 🔹 ADDED: hide-on-scroll state
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

  const handleSendSpaceComment = () => {
    console.log("Sending space comment:", spaceComment);
    setSpaceComment("");
    setShowSendSpace(false);
  };

  const handleSendPrivateComment = () => {
    console.log("Sending private comment:", privateComment);
    setPrivateComment("");
    setShowSendPrivate(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setUploadedFile(file);
    } else {
      alert("Please select a PDF or DOC file.");
    }
  };

  const handleInstructionFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setUploadedInstruction(file);
    } else {
      alert("Please select a PDF or DOC file.");
    }
  };
  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Task</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            Task
          </h1>

          <div className="max-w-5xl mx-auto">
            <div className="p-4 lg:p-8 rounded-2xl shadow-lg">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 font-inter">Task Information:</h2>
              <hr className="border-gray-700 mb-4" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
                
                <div>
                  <p className="font-semibold font-inter text-xl lg:text-3xl">Week 8 Individual Activity</p>
                  <p className="text-sm opacity-70 mt-2 flex gap-10">Due Date: <span className="opacity-100">November 20, 2025</span></p>
                  <p className="text-sm opacity-70 mt-2 flex gap-5">Assigned By: <span className="opacity-100">Zeldrick Delos Santos</span></p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">Grade:</p>
                  <p className="text-2xl font-bold mt-2">15/20</p>
                </div>

              </div>

              {/* Files Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">

                {/* File Uploaded */}
                <div>
                  <h3 className="font-semibold mb-3">File Uploaded:</h3>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInstructionFileChange}
                    className="hidden"
                    id="instruction-upload"
                  />
                  <label
                    htmlFor="instruction-upload"
                    className="bg-[#2A2A2A] px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-[#3A3A3A]"
                  >
                    <span className="text-xl">+</span> {uploadedInstruction ? uploadedInstruction.name : "Upload Here"}
                  </label>
                </div>

                {/* Your Work */}
                <div>
                  <h3 className="font-semibold mb-3">Your Work:</h3>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-[#2A2A2A] px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-[#3A3A3A]"
                  >
                    <span className="text-xl">+</span> {uploadedFile ? uploadedFile.name : "Upload Here"}
                  </label>
                </div>

              </div>

              {/* Comments Section */}
              <hr className="border-gray-700 mb-4" />
              <h3 className="font-semibold mb-4">Comments</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Add Space Comment */}
                <div className="p-4 rounded-xl">
                  <p className="text-sm mb-2 opacity-70">Add space comment</p>
                  <div className="relative">
                    <img src="/src/assets/HomePage/frieren-avatar.jpg" alt="Frieren" className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full z-10" />
                    <InputField
                      placeholder="Write a comment..."
                      value={spaceComment}
                      onChange={(e) => {
                        setSpaceComment(e.target.value);
                        setShowSendSpace(e.target.value.length > 0);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendSpaceComment()}
                      style={{ fontSize: '0.875rem', paddingLeft: '3rem', paddingRight: '4rem', width: "100%" }}
                    />
                    {showSendSpace && (
                      <button
                        onClick={handleSendSpaceComment}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <span>&rarr;</span> Send
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Private Comment */}
                <div className="p-4 rounded-xl">
                  <p className="text-sm mb-2 opacity-70">Add private comment</p>
                  <div className="relative">
                    <img src="/src/assets/HomePage/frieren-avatar.jpg" alt="Frieren" className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full z-10" />
                    <InputField
                      placeholder="Write a private comment..."
                      value={privateComment}
                      onChange={(e) => {
                        setPrivateComment(e.target.value);
                        setShowSendPrivate(e.target.value.length > 0);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendPrivateComment()}
                      style={{ fontSize: '0.875rem', paddingLeft: '3rem', paddingRight: '4rem', width: "100%" }}
                    />
                    {showSendPrivate && (
                      <button
                        onClick={handleSendPrivateComment}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <span>&rarr;</span> Send
                      </button>
                    )}
                  </div>
                  <p className="text-xs opacity-50 mt-1">
                    Private comments are only visible to you and your admin
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default TaskViewPage;
