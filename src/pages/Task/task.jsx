 import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import { FiCheckSquare, FiCalendar, FiUsers } from "react-icons/fi";

const TaskPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const navigate = useNavigate();

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

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Thesis Paper 🧑‍🎓",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Done",
    },
    {
      id: 2,
      name: "OS Activity 🎓",
      deadline: "April 12, 2025",
      space: "Your Space",
      status: "In Progress",
    },
    {
      id: 3,
      name: "Personal Reflection 📄",
      deadline: "April 12, 2025",
      space: "Nathaniel's Space",
      status: "Missing",
    },
        {
      id: 4,
      name: "Individual Activity 📄",
      deadline: "May 1, 2025",
      space: "Keziah's Space",
      status: "Done",
    },
        {
      id: 5,
      name: "Personal Reflection 📄",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Missing",
    },
  ]);

  // Group tasks by space
  const tasksBySpace = tasks.reduce((acc, task) => {
    if (!acc[task.space]) {
      acc[task.space] = [];
    }
    acc[task.space].push(task);
    return acc;
  }, {});

  const handleSpaceClick = (spaceName) => {
    setSelectedSpace(selectedSpace === spaceName ? null : spaceName);
  };

  const toggleStatusDropdown = (taskId) => {
    setOpenStatusDropdown(openStatusDropdown === taskId ? null : taskId);
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updated = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updated);
    setOpenStatusDropdown(null);
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
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Task
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {Object.entries(tasksBySpace).map(([spaceName, spaceTasks]) => (
              <div
                key={spaceName}
                className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 hover:bg-[#252B34] transition cursor-pointer"
                onClick={() => handleSpaceClick(spaceName)}
              >
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-xl text-blue-400" />
                  <div className="flex-1">
                    <p className="text-lg font-medium">{spaceName}</p>
                    <p className="text-sm text-gray-400">{spaceTasks.length} task{spaceTasks.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show tasks for selected space */}
          {selectedSpace && tasksBySpace[selectedSpace] && (
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="bg-[#1F242D] border border-gray-600 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">{selectedSpace}</h2>
                  <button
                    onClick={() => setSelectedSpace(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tasksBySpace[selectedSpace].map((task) => (
                    <div key={task.id} className="bg-[#161A20] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-2">{task.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              <span>{task.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => toggleStatusDropdown(task.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              task.status === 'Done' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : task.status === 'In Progress'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {task.status}
                            <span className="ml-1 text-xs">▼</span>
                          </button>

                          {openStatusDropdown === task.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-[#1E222A] border border-gray-700 rounded-lg shadow-lg p-2 z-50">
                              <div className="flex flex-col gap-1">
                                {['Done', 'In Progress', 'Missing'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(task.id, status)}
                                    className={`w-full text-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                      status === 'Done' 
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : status === 'In Progress'
                                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

export default TaskPage;
