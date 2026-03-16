import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { useTasks } from "../../../hooks/useTasks";
import Sidebar from "../../component/sidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import ButtonComponent from "../../component/Button.jsx";

const ViewAllTaskPage = () => {
  const { space_name, space_uuid } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showViewScore, setShowViewScore] = useState(false);
  const [viewScoreTask, setViewScoreTask] = useState(null);
  const [pendingViewScoreTask, setPendingViewScoreTask] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Use space hook for student response data
  const {
    studentResponseData,
    studentResponseDataLoading,
    setTaskId,
  } = useSpace();
  
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

  // Handle pending view score when studentResponseData becomes available
  useEffect(() => {
    if (pendingViewScoreTask && studentResponseData?.success) {
      const taskWithScoreData = {
        ...pendingViewScoreTask,
        task_title:
          pendingViewScoreTask.task_title ||
          studentResponseData?.data?.task_title ||
          "Quiz",
        quiz_content: {
          questions: studentResponseData?.data?.questions || [],
        },
        student_answers: studentResponseData?.data?.student_answers || {},
        score: studentResponseData?.data?.score || 0,
        total_score: studentResponseData?.data?.total_items_score || 0,
      };

      // Open ViewScore modal
      setViewScoreTask(taskWithScoreData);
      setShowViewScore(true);
      setPendingViewScoreTask(null); // Clear pending task
    }
  }, [studentResponseData, pendingViewScoreTask]);

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
  const otherTasks = sortedTasks.filter(task => task.task_category !== 'quiz' && task.task_category !== 'individual-activity');

  const getStatusColor = (task) => {
    // Check if task has been answered
    if (task.has_answered) {
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

  const handleViewScore = (task) => {
    const currentTaskId = Number(task?.task_id);
    setTaskId(currentTaskId);

    // Check if studentResponseData is successful
    if (!studentResponseData?.success) {
      setPendingViewScoreTask(task);
      return;
    }

    // Use actual studentResponseData instead of mock data
    const taskWithScoreData = {
      ...task,
      task_title:
        task.task_title || studentResponseData?.data?.task_title || "Quiz",
      quiz_content: {
        questions: studentResponseData?.data?.questions || [],
      },
      student_answers: studentResponseData?.data?.student_answers || {},
      score: studentResponseData?.data?.score || 0,
      total_score: studentResponseData?.data?.total_items_score || 0,
    };

    // Open ViewScore modal
    setViewScoreTask(taskWithScoreData);
    setShowViewScore(true);
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
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
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
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
                              {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <ButtonComponent
                              onClick={() => handleViewScore(task)}
                              style={{
                                backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                padding: '0.3em 0.8em',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                              }}
                            >
                              View Score
                            </ButtonComponent>
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
                            {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                        </div>
                        
                        {/* View Score Button */}
                        <div className="flex justify-end">
                          <ButtonComponent
                            onClick={() => handleViewScore(task)}
                            style={{
                              backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              padding: '0.3em 0.8em',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              width: '100%',
                            }}
                          >
                            View Score
                          </ButtonComponent>
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
                              {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <ButtonComponent
                              onClick={() => handleViewScore(task)}
                              style={{
                                backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                padding: '0.3em 0.8em',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                              }}
                            >
                              View Score
                            </ButtonComponent>
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
                            {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                        </div>
                        
                        {/* View Score Button */}
                        <div className="flex justify-end">
                          <ButtonComponent
                            onClick={() => handleViewScore(task)}
                            style={{
                              backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              padding: '0.3em 0.8em',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              width: '100%',
                            }}
                          >
                            View Score
                          </ButtonComponent>
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
                              {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.task_title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <ButtonComponent
                              onClick={() => handleViewScore(task)}
                              style={{
                                backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                                padding: '0.3em 0.8em',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                              }}
                            >
                              View Score
                            </ButtonComponent>
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
                            {task.has_answered ? 'Completed' : new Date(task.due_date) < new Date() ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">📅</span>
                          <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{formatDate(task.due_date)}</p>
                        </div>
                        
                        {/* View Score Button */}
                        <div className="flex justify-end">
                          <ButtonComponent
                            onClick={() => handleViewScore(task)}
                            style={{
                              backgroundColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              borderColor: isDarkMode ? '#1d4ed8' : '#2563eb',
                              padding: '0.3em 0.8em',
                              fontSize: '0.75rem',
                              borderRadius: '6px',
                              width: '100%',
                            }}
                          >
                            View Score
                          </ButtonComponent>
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

      {/* VIEW SCORE MODAL */}
      {showViewScore && viewScoreTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: currentColors.background }}
          >
            {/* Modal Header */}
            <div 
              className="sticky top-0 p-4 border-b flex justify-between items-center"
              style={{ 
                backgroundColor: currentColors.background,
                borderColor: currentColors.border 
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: currentColors.primary || currentColors.accent }}
                >
                  {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: currentColors.text }}>
                    {user?.fullname ? `${user?.fullname}'s Answers` : "Your Answers"}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-2xl font-bold" style={{ color: currentColors.text }}>
                      {viewScoreTask.score || 0}/{viewScoreTask.total_score || 0}
                    </span>
                    <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                      {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewScore(false);
                  setViewScoreTask(null);
                }}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: currentColors.text,
                  backgroundColor: 'transparent'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Render quiz questions with student answers */}
                {viewScoreTask.quiz_content?.questions?.map((question) => (
                  <div
                    key={question.question_id}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border
                    }}
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: currentColors.text }}>
                        {question.question}
                      </h4>
                      
                      {/* Question Type Badge */}
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: currentColors.accent + '20',
                          color: currentColors.accent
                        }}
                      >
                        {question.type}
                      </span>
                    </div>

                    {/* Display based on question type */}
                    {question.type === "mcq" && (
                      <div className="space-y-2">
                        {question.answers?.map((answer) => {
                          const studentAnswer = viewScoreTask.student_answers?.[question.question_id];
                          const isCorrect = answer.is_correct;
                          const isSelected = answer.letter_identifier === studentAnswer;
                          const isIncorrectAndSelected = isSelected && !isCorrect;
                          
                          return (
                            <div
                              key={answer.choice_id}
                              className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                                isCorrect ? 'bg-green-500 text-white' : 
                                isIncorrectAndSelected ? 'bg-red-500 text-white' : ''
                              }`}
                              style={{
                                backgroundColor: isCorrect ? '#10b981' : 
                                               isIncorrectAndSelected ? '#ef4444' : currentColors.surface,
                                color: isCorrect ? '#ffffff' : 
                                      isIncorrectAndSelected ? '#ffffff' : currentColors.text,
                                border: (isCorrect || isIncorrectAndSelected) ? 'none' : `1px solid ${currentColors.border}`
                              }}
                            >
                              <div 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                  isCorrect ? 'bg-white text-green-600 border-white' : 
                                  isIncorrectAndSelected ? 'bg-white text-red-600 border-white' : 'border-gray-300 text-gray-500'
                                }`}
                                style={{
                                  borderColor: isCorrect ? '#ffffff' : 
                                               isIncorrectAndSelected ? '#ffffff' : currentColors.border,
                                  color: isCorrect ? '#10b981' : 
                                        isIncorrectAndSelected ? '#ef4444' : currentColors.textSecondary
                                }}
                              >
                                {answer.letter_identifier}
                              </div>
                              <span className="flex-1">{answer.answer_text}</span>
                              {isCorrect && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              {isIncorrectAndSelected && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "true-false" && (
                      <div className="space-y-2">
                        {question.answers?.map((answer) => {
                          const studentAnswer = viewScoreTask.student_answers?.[question.question_id];
                          const isCorrect = answer.is_correct;
                          const isSelected = answer.letter_identifier === studentAnswer;
                          const isIncorrectAndSelected = isSelected && !isCorrect;
                          
                          return (
                            <div
                              key={answer.choice_id}
                              className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                                isCorrect ? 'bg-green-500 text-white' : 
                                isIncorrectAndSelected ? 'bg-red-500 text-white' : ''
                              }`}
                              style={{
                                backgroundColor: isCorrect ? '#10b981' : 
                                               isIncorrectAndSelected ? '#ef4444' : currentColors.surface,
                                color: isCorrect ? '#ffffff' : 
                                      isIncorrectAndSelected ? '#ffffff' : currentColors.text,
                                border: (isCorrect || isIncorrectAndSelected) ? 'none' : `1px solid ${currentColors.border}`
                              }}
                            >
                              <div 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                  isCorrect ? 'bg-white text-green-600 border-white' : 
                                  isIncorrectAndSelected ? 'bg-white text-red-600 border-white' : 'border-gray-300 text-gray-500'
                                }`}
                                style={{
                                  borderColor: isCorrect ? '#ffffff' : 
                                               isIncorrectAndSelected ? '#ffffff' : currentColors.border,
                                  color: isCorrect ? '#10b981' : 
                                        isIncorrectAndSelected ? '#ef4444' : currentColors.textSecondary
                                }}
                              >
                                {answer.letter_identifier}
                              </div>
                              <span className="flex-1">{answer.answer_text}</span>
                              {isCorrect && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              {isIncorrectAndSelected && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "identification" && (
                      <div>
                        {(() => {
                          const studentAnswer = viewScoreTask.student_answers?.[question.question_id];
                          const correctAnswers = question.answers?.[0]?.answer_text;
                          const isCorrect = studentAnswer && correctAnswers && 
                            correctAnswers.toLowerCase().includes(studentAnswer.toLowerCase());
                          const isIncorrect = studentAnswer && correctAnswers && 
                            !correctAnswers.toLowerCase().includes(studentAnswer.toLowerCase());
                          
                          return (
                            <div
                              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                                isCorrect ? 'bg-green-500 text-white' : 
                                isIncorrect ? 'bg-red-500 text-white' : ''
                              }`}
                              style={{
                                backgroundColor: isCorrect ? '#10b981' : 
                                               isIncorrect ? '#ef4444' : currentColors.surface,
                                color: isCorrect ? '#ffffff' : 
                                      isIncorrect ? '#ffffff' : currentColors.text,
                                border: `1px solid ${currentColors.border}`
                              }}
                            >
                              {isCorrect && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              {isIncorrect && (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <span>Student's Answer: {studentAnswer || 'Not answered'}</span>
                            </div>
                          );
                        })()}
                        <div 
                          className="mt-2 p-3 rounded-lg text-sm"
                          style={{
                            backgroundColor: currentColors.surface,
                            color: currentColors.textSecondary,
                            border: `1px solid ${currentColors.border}`
                          }}
                        >
                          Correct answers: {question.answers?.[0]?.answer_text || 'No correct answers available'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllTaskPage;
