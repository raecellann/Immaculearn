import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import Logout from "../component/logout";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useNavigate } from "react-router";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfListActivityPage = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces } = useSpace();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [showModal, setShowModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const activities = [
    { id: 1, status: "On Going", name: "Week 8 Personal Reflection", dueDate: "October 30", space: "Operating System", category: "your-space" },
    { id: 2, status: "To be Deployed", name: "OJT Final Output", dueDate: "N/A", space: "OJT Batch 2025-2026", category: "your-space" },
    { id: 3, status: "Already Ended", name: "Week 5 Individual Activity", dueDate: "September 12", space: "Businteg", category: "course-space" },
    { id: 4, status: "To be Deployed", name: "OJT Final Output", dueDate: "N/A", space: "OJT Batch 2025-2026", category: "course-space" },
    { id: 5, status: "Already Ended", name: "Week 5 Individual Activity", dueDate: "September 12", space: "Businteg", category: "course-space" },
    { id: 6, status: "On Going", name: "Week 8 Personal Reflection", dueDate: "October 30", space: "Operating System", category: "your-space" },
    { id: 7, status: "To be Deployed", name: "OJT Final Output", dueDate: "N/A", space: "OJT Batch 2025-2026", category: "your-space" },
  ];

  const activitiesByCategory = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {
    'your-space': [],
    'course-space': []
  });

  const getStatusColor = (status) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-[10px] sm:text-[11px] lg:text-base px-2 transition-all duration-300";

    if (status === "On Going") return `${base} text-green-400 bg-green-900/30 animate-pulse`;
    if (status === "To be Deployed") return `${base} text-blue-400 bg-blue-900/30`;
    if (status === "Already Ended") return `${base} text-red-400 bg-red-900/30`;
    return `${base} text-gray-400`;
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">List of Activities</h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-20) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            List of Activities
          </h1>

          {/* Your Space Activities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Space</h2>
            {userSpaces?.length === 0 ? (
              <div className="rounded-xl p-10 text-center border border-dashed" style={{
                backgroundColor: currentColors.surface,
                color: currentColors.textSecondary,
                borderColor: currentColors.border
              }}>
                No space list activity yet
              </div>
            ) : userSpaces?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {userSpaces?.map((space, index) => (
                  <div
                    key={`your-space-${index}`}
                    onClick={() => navigate(`/prof/list-activity/${space.space_uuid}/${space.space_name}`)}
                    className="rounded-lg p-4 flex items-center gap-3 transition cursor-pointer"
                    style={{
                      backgroundColor: currentColors.surface,
                      border: `1px solid ${currentColors.border}`
                    }}
                  >
                    <span className="text-xl">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{space.space_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>

          {/* Course Space Activities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Course Space</h2>
            {courseSpaces?.length === 0 ? (
              <div className="rounded-xl p-10 text-center border border-dashed" style={{
                backgroundColor: currentColors.surface,
                color: currentColors.textSecondary,
                borderColor: currentColors.border
              }}>
                No course space list activity yet
              </div>
            ) : courseSpaces?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {courseSpaces?.map((space, index) => (
                  <div
                    key={`course-space-${index}`}
                    onClick={() => navigate(`/prof/list-activity/${space.space_uuid}/${space.space_name}`)}
                    className="rounded-lg p-4 flex items-center gap-3 transition cursor-pointer"
                    style={{
                      backgroundColor: currentColors.surface,
                      border: `1px solid ${currentColors.border}`
                    }}
                  >
                    <span className="text-xl">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.space_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>
        </div>

        {/* Modal
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1F242D] p-6 rounded-lg w-[90%] max-w-[400px]">
              <h2 className="text-xl font-semibold mb-4 text-center">Create New Activity</h2>

              <form className="flex flex-col gap-3">
                <input className="p-2 bg-[#2A2E36] rounded-md" placeholder="Activity Name" />
                <input className="p-2 bg-[#2A2E36] rounded-md" placeholder="Due Date" />
                <input className="p-2 bg-[#2A2E36] rounded-md" placeholder="Space Name" />
                <select className="p-2 bg-[#2A2E36] rounded-md">
                  <option>To be Deployed</option>
                  <option>On Going</option>
                  <option>Already Ended</option>
                </select>
              </form>

              <div className="flex justify-end mt-5 gap-3">
                <button onClick={() => setShowModal(false)} className="bg-gray-600 px-3 py-1 rounded-md">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)} className="bg-blue-500 px-3 py-1 rounded-md">
                  Save
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfListActivityPage;