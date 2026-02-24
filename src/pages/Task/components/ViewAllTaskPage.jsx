import React, { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { capitalizeWords } from "../../../utils/capitalizeFirstLetter";
import { useTasks } from "../../../hooks/useTasks";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ViewAllTaskPage = () => {
  const { space_uuid, space_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();

  const { userSpaces, courseSpaces, friendSpaces } = useSpace();
  // ================= SPACE & OWNER LOGIC =================
  const allSpaces = [
    ...(userSpaces || []),
    ...(friendSpaces || []),
    ...(courseSpaces || []),
  ];

  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;

  const {
    uploadedTasksQuery,
    draftedTasksQuery,
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  } = useTasks(currentSpace?.space_id);

  const taskData = uploadedTasksQuery?.data || [];
  const draftActivities = draftedTasksQuery?.data || [];
  // const isLoadingTasks = uploadedTasksQuery?.isLoading;
  // const isLoadingDrafts = draftedTasksQuery?.isLoading;
  // const tasksError = uploadedTasksQuery?.error;
  // const draftsError = draftedTasksQuery?.error;
  const uploadedTask = Array.isArray(taskData)
    ? taskData
    : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities)
    ? draftActivities
    : draftActivities?.data || [];

  const allTasks = [...(uploadedTask || []), ...(draftedTask || [])];

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mock data for tasks
  const [tasks] = useState([
    {
      id: 1,
      taskName: "Week 8 Individual Activity",
      deadline: "November 20, 2025",
      status: "In Progress",
      spaceUuid: "abc-123",
      spaceName: "individual-space",
    },
    {
      id: 2,
      taskName: "Group Project Proposal",
      deadline: "November 25, 2025",
      status: "Ended",
      spaceUuid: "def-456",
      spaceName: "group-space",
    },
    {
      id: 3,
      taskName: "Literature Review",
      deadline: "December 1, 2025",
      status: "In Progress",
      spaceUuid: "ghi-789",
      spaceName: "research-space",
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Ended":
        return "bg-green-500/20 text-[#10E164] border-[#00B865]";
      case "uploaded":
        return "bg-green-500/20 text-[#10E164] border-[#00B865]";
      case "In Progress":
        return "bg-blue-500/20 text-[#4D9BEF] border-[#0066D2]";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const handleViewDetails = (task) => {
    navigate(
      `/task/${currentSpace?.space_uuid}/${currentSpace?.space_name}/${task.task_title}`,
    );
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
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
            <h1 className="text-lg font-bold" style={{ color: isDarkMode ? "white" : currentColors.text }}>{space_name ? `${space_name} Tasks` : "Tasks"}</h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-20) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          {/* Title */}
          <h1 className="hidden lg:block text-2xl lg:text-5xl font-bold text-center mb-4 lg:mb-8" style={{ color: currentColors.text }}>
            {space_name ? `${space_name} Tasks` : "Tasks"}
          </h1>

          {/* Back Button */}
          <div className="mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = currentColors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = currentColors.textSecondary}
            >
              ← Back
            </button>
          </div>

          {/* Tasks Table */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl shadow-lg" style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border
          }}>
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4" style={{ color: currentColors.text }}>Task List:</h2>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: currentColors.border }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Task Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Deadline</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8" style={{ color: currentColors.textSecondary }}>
                        No tasks available
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="border-b" style={{ borderColor: currentColors.border }}>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.task_status)}`} style={{ color: currentColors.text }}>
                            {task.task_status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-400 text-sm" style={{ color: currentColors.textSecondary }}>{new Date(task.task_due).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                            style={{ backgroundColor: currentColors.primary, color: 'white' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentColors.primary}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-3">
              {tasks.length === 0 && (
                <div className="text-center py-8" style={{ color: currentColors.textSecondary }}>
                  No tasks available
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#1F242D] rounded-xl p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base flex-1">{task.task_name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.task_status)}`}>{task.task_status}</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">📅 {new Date(task.task_due).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(task)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                      style={{ backgroundColor: currentColors.primary, color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentColors.primary}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-[#1A1A1A] rounded-xl p-6 sm:p-8 border border-gray-600">
                  <p className="text-gray-400 text-base sm:text-lg">
                    No tasks available
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base mt-2">
                    Tasks will appear here once they are assigned.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllTaskPage;
