import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useTasks } from "../../../hooks/useTasks";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfViewAllActivityPage = () => {
  const { space_name, space_uuid } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Fetch tasks by space_uuid
  const { uploadedTasksQuery } = useTasks(space_uuid);
  const { data: tasks = [], isLoading, error } = uploadedTasksQuery;
  
  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
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

  // Sort tasks by deadline (closest first) and separate by type
  // Open tasks (not overdue) should appear first, then closed tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIsOverdue = new Date(a.due_date) < new Date();
    const bIsOverdue = new Date(b.due_date) < new Date();
    
    // If one is overdue and the other isn't, the non-overdue comes first
    if (aIsOverdue !== bIsOverdue) {
      return aIsOverdue ? 1 : -1;
    }
    
    // If both have the same overdue status, sort by deadline (closest first)
    return new Date(a.due_date) - new Date(b.due_date);
  });
  const quizTasks = sortedTasks.filter(task => task.task_category === 'quiz');
  const individualTasks = sortedTasks.filter(task => task.task_category === 'individual-activity');
  const groupTasks = sortedTasks.filter(task => task.task_category === 'group-activity');
  const otherTasks = sortedTasks.filter(task => task.task_category !== 'quiz' && task.task_category !== 'individual-activity' && task.task_category !== 'group-activity');

  const getStatusColor = (task) => {
    // Check if task has been answered OR if status is Done/Completed
    const isCompleted = task.has_answered || 
                        task.task_status === "Done" || 
                        task.task_status === "done" || 
                        task.task_status === "completed" || 
                        task.task_status === "Completed";
    
    if (isCompleted) {
      return "bg-green-500/20 text-[#10E164] border-[#00B865]";
    }
    
    // Check if due date has passed
    const dueDate = new Date(task.due_date);
    const now = new Date();
    if (dueDate < now) {
      return "bg-red-500/20 text-red-400 border-red-500";
    }
    
    // Task is still active
    return "bg-green-500/20 text-[#10E164] border-[#00B865]";
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
    navigate(`/prof/list-activity/${space_uuid}/${space_name}/${task.task_id}/${task.task_title}`);
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* Desktop ProfSidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet ProfSidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">

        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">{space_name ? `${space_name} Tasks` : 'Tasks'}</h1>
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
              <h1 className="hidden lg:block text-2xl lg:text-5xl font-bold text-center mb-4 lg:mb-8 font-grotesque">
                {space_name ? `${space_name} Tasks` : 'Tasks'}
              </h1>

          {/* Back Button */}
          <div className="mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
              ← Back
            </button>
          </div>

          {/* Tasks Table */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl shadow-lg max-w-7xl mx-auto" style={{ 
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`
          }}>

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6 font-inter">Task List:</h2>

            {/* Quizzes Section */}
            {quizTasks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>Quizzes</h3>
                  <span className="text-sm px-2 py-1 rounded-full" style={{ 
                    backgroundColor: currentColors.background,
                    color: currentColors.textSecondary 
                  }}>
                    {quizTasks.length} {quizTasks.length === 1 ? 'quiz' : 'quizzes'}
                  </span>
                </div>
                
                {/* Desktop Table for Quizzes */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border 
                }}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Quiz Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Deadline</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizTasks.map((task) => (
                        <tr key={task.task_id} className="border-b" style={{ borderColor: currentColors.border }}>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task)}`}>
                              {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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

                {/* Mobile/Tablet Cards for Quizzes */}
                <div className="lg:hidden space-y-3">
                  {quizTasks.map((task) => (
                    <div key={task.task_id} className="rounded-xl p-4 border" style={{ 
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border
                    }}>
                      <div className="flex flex-col space-y-3">
                        {/* Header with Title and Status */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.task_title}</h3>
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
                            {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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
              </div>
            )}

            {/* Individual Activities Section */}
            {individualTasks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>Individual Activities</h3>
                  <span className="text-sm px-2 py-1 rounded-full" style={{ 
                    backgroundColor: currentColors.background,
                    color: currentColors.textSecondary 
                  }}>
                    {individualTasks.length} {individualTasks.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
                
                {/* Desktop Table for Individual Activities */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border 
                }}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Activity Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Deadline</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {individualTasks.map((task) => (
                        <tr key={task.task_id} className="border-b" style={{ borderColor: currentColors.border }}>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task)}`}>
                              {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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

                {/* Mobile/Tablet Cards for Individual Activities */}
                <div className="lg:hidden space-y-3">
                  {individualTasks.map((task) => (
                    <div key={task.task_id} className="rounded-xl p-4 border" style={{ 
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border
                    }}>
                      <div className="flex flex-col space-y-3">
                        {/* Header with Title and Status */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.task_title}</h3>
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
                            {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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
              </div>
            )}

            {/* Group Activities Section */}
            {groupTasks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>Group Activities</h3>
                  <span className="text-sm px-2 py-1 rounded-full" style={{ 
                    backgroundColor: currentColors.background,
                    color: currentColors.textSecondary 
                  }}>
                    {groupTasks.length} {groupTasks.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
                
                {/* Desktop Table for Group Activities */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border 
                }}>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Activity Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Deadline</th>
                        <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: currentColors.textSecondary }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTasks.map((task) => (
                        <tr key={task.task_id} className="border-b" style={{ borderColor: currentColors.border }}>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task)}`}>
                              {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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

                {/* Mobile/Tablet Cards for Group Activities */}
                <div className="lg:hidden space-y-3">
                  {groupTasks.map((task) => (
                    <div key={task.task_id} className="rounded-xl p-4 border" style={{ 
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border
                    }}>
                      <div className="flex flex-col space-y-3">
                        {/* Header with Title and Status */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.task_title}</h3>
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
                            {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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
              </div>
            )}

            {/* Other Tasks Section */}
            {otherTasks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📋</span>
                  <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>Other Tasks</h3>
                  <span className="text-sm px-2 py-1 rounded-full" style={{ 
                    backgroundColor: currentColors.background,
                    color: currentColors.textSecondary 
                  }}>
                    {otherTasks.length} {otherTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                
                {/* Desktop Table for Other Tasks */}
                <div className="hidden lg:block overflow-x-auto rounded-xl border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border 
                }}>
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
                      {otherTasks.map((task) => (
                        <tr key={task.task_id} className="border-b" style={{ borderColor: currentColors.border }}>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task)}`}>
                              {task.has_answered || 
                               task.task_status === "Done" || 
                               task.task_status === "done" || 
                               task.task_status === "completed" || 
                               task.task_status === "Completed" ? 'Completed' : 
                               new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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

                {/* Mobile/Tablet Cards for Other Tasks */}
                <div className="lg:hidden space-y-3">
                  {otherTasks.map((task) => (
                    <div key={task.task_id} className="rounded-xl p-4 border" style={{ 
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border
                    }}>
                      <div className="flex flex-col space-y-3">
                        {/* Header with Title and Status */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.task_title}</h3>
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
                            {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Overdue' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
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
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
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

export default ProfViewAllActivityPage;
