import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import { FiFileText, FiMenu, FiX } from "react-icons/fi";

const AdminTaskPage = () => {
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

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
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
                  onClick={() => navigate("/admin-space-zj")}
                >
                  Stream
                </button>
                <button 
                  className="text-white text-base sm:text-lg md:text-xl font-semibold border-b-2 border-white pb-2 px-1 whitespace-nowrap bg-transparent"
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
                  onClick={() => navigate("/user-space-zj/people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* CREATE/UPLOAD ACTIVITY BUTTON */}
          <div className="flex justify-end mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              onClick={() => navigate("/admin-create-activity-page")}
            >
              <FiFileText size={16} />
              Create or Upload File
            </button>
          </div>

          {/* ACTIVITIES SECTION */}
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-xl font-semibold mb-6">Activities 📚</h2>

            {/* DESKTOP TABLE - HIDDEN ON MOBILE */}
            <div className="hidden md:block">
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
                            className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.status]} flex items-center gap-1`}
                          >
                            {task.status}
                            <span className="text-xs">▼</span>
                          </button>
                          {openIndex === index && (
                            <div className="absolute left-0 mt-2 w-44 bg-black border border-gray-700 rounded-lg p-3 z-50">
                              <div className="flex flex-col gap-2">
                                {Object.keys(statusStyles).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleStatusChange(index, st)}
                                    className={`w-full text-center px-4 py-2 rounded-full bg-black ${statusStyles[st]} text-sm font-medium hover:opacity-90`}
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
                        <a
                          href="/task-view-admin"
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {task.name}
                        </a>
                      </td>
                      <td className="py-3 px-4">{task.deadline}</td>
                      <td className="py-3 px-4">
                        <a
                          href="/task-view-admin"
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          See Activity
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
                    <a
                      href="/task-view-admin"
                      className="text-sm font-semibold text-blue-400 hover:underline"
                    >
                      {task.name}
                    </a>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.status]} flex items-center gap-1`}
                      >
                        {task.status}
                        <span className="text-[10px]">▼</span>
                      </button>
                      {openIndex === index && (
                        <div className="absolute right-0 mt-1 w-40 bg-black border border-gray-700 rounded-lg p-2 z-50">
                          <div className="flex flex-col gap-1">
                            {Object.keys(statusStyles).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(index, st)}
                                className={`w-full text-center px-3 py-1.5 rounded-full bg-black ${statusStyles[st]} text-xs font-medium hover:opacity-90`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Deadline: <span className="text-white">{task.deadline}</span>
                  </p>
                  <div className="mt-2">
                    <a
                      href="/task-view-admin"
                      className="text-blue-400 hover:text-blue-300 hover:underline text-xs"
                    >
                      See Activity →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskPage;
