import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import { FiMenu, FiX } from "react-icons/fi";

const ThesisTaskPage = () => {
  const navigate = useNavigate();

  /* ================= HEADER + SIDEBAR (COPIED FROM ZJ) ================= */
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

  /* ================= TASK LOGIC (THESIS SPECIFIC) ================= */
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  const [tasks, setTasks] = useState([
    {
      name: "Thesis Paper Draft 📄",
      deadline: "April 12, 2025",
      space: "Jober Reyes' Thesis",
      status: "In Progress",
    },
    {
      name: "Literature Review 📚",
      deadline: "April 15, 2025",
      space: "Jober Reyes' Thesis",
      status: "In Progress",
    },
    {
      name: "Data Collection 📊",
      deadline: "April 20, 2025",
      space: "Jober Reyes' Thesis",
      status: "Missing",
    },
    {
      name: "Methodology Chapter 🔬",
      deadline: "April 25, 2025",
      space: "Jober Reyes' Thesis",
      status: "In Progress",
    },
    {
      name: "Final Presentation 🎯",
      deadline: "May 1, 2025",
      space: "Jober Reyes' Thesis",
      status: "In Progress",
    },
  ]);

  const [openIndex, setOpenIndex] = useState(null);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR (ZJ) ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY (ZJ) ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR (ZJ) ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER (EXACT ZJ PLACEMENT) ================= */}
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

          {/* TITLE PLACEMENT MATCHED */}
          <h1 className="text-xl font-bold">Jober Reyes' Thesis</h1>
        </div>

        {/* HEADER SPACER (ZJ) */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER (ZJ STYLE) ================= */}
        <div className="relative">
          <img
            src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1769190537/cover_vwmkbn.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Jober Reyes' Thesis</h1>
          </div>

          {/* ================= TABS (COPIED FROM ZJ) ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis")}
                >
                  Stream
                </button>

                <button className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent">
                  Tasks
                </button>

                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis/files-shared")}
                >
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

          {/* ================= TASKS ================= */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Thesis Tasks 📚</h2>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400 text-left">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">Deadline</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
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

                  <p className="text-sm text-gray-400">
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

export default ThesisTaskPage;
