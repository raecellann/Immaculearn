import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import {
  FiFileText,
  FiMenu,
  FiX,
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
} from "react-icons/fi";

const AdminTaskPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* ================= CREATE TASK MODE ================= */
  const [isCreatingTask, setIsCreatingTask] = useState(false);

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

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  // Task status styles
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  // Example tasks
  const [tasks, setTasks] = useState([
    {
      name: "Thesis Paper 📄",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Done",
    },
    {
      name: "OS Activity 🧠",
      deadline: "April 12, 2025",
      space: "Your Space",
      status: "In Progress",
    },
    {
      name: "Personal Reflection 📝",
      deadline: "April 12, 2025",
      space: "Nathaniel's Space",
      status: "Missing",
    },
  ]);
  const [openIndex, setOpenIndex] = useState(null);

  // Draft activities state
  const [draftActivities, setDraftActivities] = useState([
    {
      name: "Research Paper Draft 📝",
      deadline: "May 15, 2025",
      space: "Zeldrick's Space",
      status: "Draft",
    },
    {
      name: "Lab Report Outline 🧪",
      deadline: "May 20, 2025",
      space: "Your Space",
      status: "Draft",
    },
  ]);
  const [openDraftIndex, setOpenDraftIndex] = useState(null);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
  };

  const handleDraftStatusChange = (index, newStatus) => {
    const updated = [...draftActivities];
    updated[index].status = newStatus;
    setDraftActivities(updated);
    setOpenDraftIndex(null);
  };

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

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Zeldrick's Space</h1>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-stream")}
                >
                  Stream
                </button>
                <button
                  className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent"
                  onClick={() => navigate("/admin-task-page")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* ================= CREATE/UPLOAD ACTIVITY BUTTON ================= */}
          {!isCreatingTask && (
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setIsCreatingTask(true)}
              >
                <FiFileText size={16} />
                Create File
              </button>
            </div>
          )}

          {!isCreatingTask ? (
            <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-xl font-semibold mb-6">Activities 📚</h2>

            {/* DESKTOP TABLE - HIDDEN ON MOBILE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400 text-left">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#1E222A]"
                    >
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenIndex(openIndex === index ? null : index)
                            }
                            className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.status]}`}
                          >
                            {task.status} ▼
                          </button>
                          {openIndex === index && (
                            <div className="absolute left-0 mt-2 w-44 bg-[#1E222A] border border-gray-700 rounded-lg p-3 z-50 shadow-lg">
                              <div className="flex flex-col gap-2">
                                {Object.keys(statusStyles).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() =>
                                      handleStatusChange(index, st)
                                    }
                                    className={`w-full text-center px-4 py-2 rounded-full bg-black ${statusStyles[st]} text-sm font-medium hover:opacity-90 whitespace-nowrap`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {task.name}
                      </td>
                      <td className="py-3 px-4">{task.deadline}</td>
                      <td className="py-3 px-4">
                        <a
                          href="/task-view-admin"
                          className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS - SHOWN ON MOBILE */}
            <div className="md:hidden space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold">{task.name}</p>
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                      className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.status]}`}
                    >
                      {task.status}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Deadline:{" "}
                    <span className="text-white">{task.deadline}</span>
                  </p>

                  {openIndex === index && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-col gap-2">
                        {Object.keys(statusStyles).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              handleStatusChange(index, st);
                              setOpenIndex(null);
                            }}
                            className={`w-full text-center px-4 py-2 rounded-full ${statusStyles[st]} text-sm font-medium`}
                          >
                            Mark as {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <a
                      href="/task-view-admin"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* DRAFT ACTIVITIES TABLE */}
            <div className="max-w-5xl mx-auto w-full mt-12">
              <h2 className="text-xl font-semibold mb-6">Draft Activities 📝</h2>

              {/* DESKTOP TABLE - HIDDEN ON MOBILE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600 text-gray-400 text-left">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Task Name</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftActivities.map((draft, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#1E222A]"
                      >
                        <td className="py-3 px-4">
                          <span className="px-6 py-1 rounded-full bg-black text-sm font-bold border-2 border-gray-500 text-gray-400 inline-block min-w-[120px] text-center">
                            Draft
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {draft.name}
                        </td>
                        <td className="py-3 px-4">{draft.deadline}</td>
                        <td className="py-3 px-4">
                          <a
                            href="/task-view-admin"
                            className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS - SHOWN ON MOBILE */}
              <div className="md:hidden space-y-4">
                {draftActivities.map((draft, index) => (
                  <div
                    key={index}
                    className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold">{draft.name}</p>
                      <span className="px-3 py-1 rounded-full bg-black text-xs border-2 border-gray-500 text-gray-400">
                        Draft
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      Deadline:{" "}
                      <span className="text-white">{draft.deadline}</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <a
                        href="/task-view-admin"
                        className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          ) : (
            /* ================= CREATE TASK FORM ================= */
            <div className="max-w-5xl mx-auto">
              {/* BACK BUTTON */}
              <div className="flex justify-end mb-6">
                <button
                  className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
                  onClick={() => setIsCreatingTask(false)}
                >
                  <FiArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Tasks</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>

              {/* FORM CARD */}
              <div className="bg-black rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-white">
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
                        <FiUploadCloud
                          size={36}
                          className="mb-3 text-gray-300"
                        />

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

                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
                    <label className="font-semibold">Score:</label>
                    <input
                      type="text"
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      placeholder="20/20"
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
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => {
                      // Handle publish logic here
                      setIsCreatingTask(false);
                    }}
                  >
                    Publish Activity
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => {
                      // Handle save as draft logic here
                      setIsCreatingTask(false);
                    }}
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminTaskPage;
