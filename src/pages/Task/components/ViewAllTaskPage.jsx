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
  const isLoadingTasks = uploadedTasksQuery?.isLoading;
  const isLoadingDrafts = draftedTasksQuery?.isLoading;
  const tasksError = uploadedTasksQuery?.error;
  const draftsError = draftedTasksQuery?.error;
  const uploadedTask = Array.isArray(taskData)
    ? taskData
    : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities)
    ? draftActivities
    : draftActivities?.data || [];

  const allTasks = [...(uploadedTask || []), ...(draftedTask || [])];
  const isLoading = isLoadingTasks || isLoadingDrafts;
  const error = tasksError || draftsError;

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  
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

  const getStatusColor = (task) => {
    // Check if task has been answered
    if (task.has_answered) {
      return "bg-green-500/20 text-[#10E164] border-[#00B865]";
    }
    
    // Check if due date has passed
    const dueDate = new Date(task.task_due || task.due_date);
    const now = new Date();
    if (dueDate < now) {
      return "bg-red-500/20 text-red-400 border-red-500";
    }
    
    // Task is still active
    return "bg-blue-500/20 text-[#4D9BEF] border-[#0066D2]";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
        
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading tasks: {error.message}</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
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
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl shadow-lg max-w-7xl mx-auto" style={{ 
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`
          }}>

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6">Task List:</h2>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: currentColors.border }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Task Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Deadline</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.map((task) => (
                    <tr key={task.task_id} className="border-b" style={{ borderColor: currentColors.border }}>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task)}`} style={{ color: currentColors.text }}>
                          {task.has_answered ? 'Completed' : new Date(task.task_due || task.due_date) < new Date() ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_name || task.task_title}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.task_due || task.due_date)}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="px-3 py-2 rounded-lg transition-colors text-xs font-medium"
                          style={{
                            backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                            color: 'white'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-3">
              {allTasks.map((task) => (
                <div key={task.task_id} className="rounded-xl p-4 border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border
                }}>
                  <div className="flex flex-col space-y-3">
                    {/* Header with Title and Status */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.task_name || task.task_title}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border w-fit" style={{
                        backgroundColor: getStatusColor(task).includes('green') ? (isDarkMode ? 'rgba(16, 185, 100, 0.2)' : 'rgba(34, 197, 94, 0.2)') :
                                       getStatusColor(task).includes('red') ? (isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)') :
                                       (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'),
                        color: getStatusColor(task).includes('green') ? (isDarkMode ? '#10e164' : '#22c55e') :
                               getStatusColor(task).includes('red') ? (isDarkMode ? '#ef4444' : '#ef4444') :
                               (isDarkMode ? '#4d9bef' : '#3b82f6'),
                        borderColor: getStatusColor(task).includes('green') ? (isDarkMode ? '#00b865' : '#16a34a') :
                                   getStatusColor(task).includes('red') ? (isDarkMode ? '#dc2626' : '#dc2626') :
                                   (isDarkMode ? '#0066d2' : '#2563eb')
                      }}>
                        {task.has_answered ? 'Completed' : new Date(task.task_due || task.due_date) < new Date() ? 'Overdue' : 'Active'}
                      </span>
                    </div>
                    
                    {/* Deadline */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📅</span>
                      <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.task_due || task.due_date)}</p>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewDetails(task)}
                        className="px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                        style={{
                          backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                          color: 'white'
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {allTasks.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="rounded-xl p-6 sm:p-8 border" style={{ 
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#f8fafc',
                  borderColor: currentColors.border
                }}>
                  <p className="text-base sm:text-lg" style={{ color: currentColors.textSecondary }}>No tasks available</p>
                  <p className="text-sm sm:text-base mt-2" style={{ color: currentColors.textSecondary }}>Tasks will appear here once they are assigned.</p>
                </div>
              </div>
            )}

          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllTaskPage;
