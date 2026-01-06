import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";

const statusStyles = {
  Done: "border-2 border-[#00B865] text-[#10E164]",
  "In Progress": "border-[#0066D2] text-[#4D9BEF]",
  Missing: "border-[#FF5252] text-[#FF5252]",
};

const TaskPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

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
      name: "Thesis Paper 🧑‍🎓",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Done",
    },
    {
      name: "OS Activity 🎓",
      deadline: "April 12, 2025",
      space: "Your Space",
      status: "In Progress",
    },
    {
      name: "Personal Reflection 📄",
      deadline: "April 12, 2025",
      space: "Nathaniel's Space",
      status: "Missing",
    },
        {
      name: "Individual Activity 📄",
      deadline: "May 1, 2025",
      space: "Keziah's Space",
      status: "Done",
    },
        {
      name: "Personal Reflection 📄",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Missing",
    },
  ]);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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
            <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
              To Do Lists 📚
            </h2>

            {/* ================= MOBILE + TABLET (CARD VIEW) ================= */}
            <div className="flex flex-col gap-4 lg:hidden">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-[#1E222A] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
                >
                  <a
                    href="/task-view"
                    className="text-blue-400 hover:underline text-sm font-medium"
                  >
                    {task.name}
                  </a>

                  <p className="text-sm text-gray-300">
                    <strong className="text-gray-400">Deadline:</strong>{" "}
                    {task.deadline}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-300">
                      <strong className="text-gray-400">Space:</strong>{" "}
                      {task.space}
                    </p>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className={`bg-black px-3 py-1 rounded-full ${
                          statusStyles[task.status]
                        } flex items-center gap-2 text-xs`}
                      >
                        <span className="font-medium">{task.status}</span>
                        <span className="text-xs">▼</span>
                      </button>

                      {openIndex === index && (
                        <div className="absolute right-0 mt-2 w-40 bg-black border border-gray-700 rounded-lg p-2 z-50">
                          <div className="flex flex-col gap-2">
                            {Object.keys(statusStyles).map((st) => (
                              <button
                                key={st}
                                onClick={() =>
                                  handleStatusChange(index, st)
                                }
                                className={`w-full text-center px-3 py-1.5 rounded-full bg-black ${
                                  statusStyles[st]
                                } text-xs font-medium`}
                              >
                                {st}
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

            {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-600 text-left text-gray-400">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Space Name</th>
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
                            className={`bg-black px-4 py-1 rounded-full ${
                              statusStyles[task.status]
                            } flex items-center gap-2 text-sm`}
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
                                    onClick={() =>
                                      handleStatusChange(index, st)
                                    }
                                    className={`w-full rounded-full px-4 py-2 text-sm ${statusStyles[st]}`}
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
                          href="/task-view"
                          className="text-blue-400 hover:underline"
                        >
                          {task.name}
                        </a>
                      </td>
                      <td className="py-3 px-4">{task.deadline}</td>
                      <td className="py-3 px-4">{task.space}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
