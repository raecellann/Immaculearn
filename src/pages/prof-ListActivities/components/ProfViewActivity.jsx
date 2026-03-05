import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useTasks } from "../../../hooks/useTasks";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfViewActivityPage = () => {
  const { space_uuid, space_name, task_name, task_id } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Use useTasks hook to fetch tasks
  const { uploadedTasksQuery, draftedTasksQuery } = useTasks(space_uuid);
  
  // Filter tasks to find current task
  const uploadedTaskData = uploadedTasksQuery?.data || [];
  const draftedTaskData = draftedTasksQuery?.data || [];
  
  // Handle API response structure
  const uploadedTasks = Array.isArray(uploadedTaskData) 
    ? uploadedTaskData 
    : uploadedTaskData?.data || [];
  const draftedTasks = Array.isArray(draftedTaskData) 
    ? draftedTaskData 
    : draftedTaskData?.data || [];
    
  // Find current task by task_id
  const currentTask = [...uploadedTasks, ...draftedTasks].find(t => t.task_id === task_id || t.task_id === task_id);
  
  console.log(currentTask)
  // Decode URL parameters
  const decodedSpaceName = decodeURIComponent(space_name || '');
  const decodedTaskName = decodeURIComponent(task_name || '');
  
  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, navigate]);

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

  useEffect(() => {
    // Fetch quiz data based on currentTask from useTasks
    console.log("Fetching quiz data for task_id:", task_id, "space_uuid:", space_uuid);
    console.log("Current task found:", currentTask);
    
    try {
      // Use currentTask data if found
      if (currentTask) {
        console.log("Setting quiz data from currentTask:", currentTask);
        setQuizData(currentTask);
      } else {
        // Fallback to localStorage for local tasks
        const savedQuiz = localStorage.getItem("quizTask");
        if (savedQuiz) {
          const parsedQuiz = JSON.parse(savedQuiz);
          console.log("Found saved quiz data:", parsedQuiz);
          
          // Check if this quiz matches the current task_id
          if (parsedQuiz.task_id === task_id || parsedQuiz.id === task_id) {
            setQuizData(parsedQuiz);
            console.log("Set quiz data from localStorage");
          } else {
            console.log("Saved quiz doesn't match current task_id");
          }
        }
      }
      
      // TODO: Add API call to fetch task data from backend using task_id if not found
      // Example: fetchTaskData(task_id, space_uuid)
      
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }, [task_id, space_uuid, currentTask]);

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date set";
    try {
      const date = new Date(dueDate);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
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
          <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-xl sm:text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate">{decodedTaskName || 'Task View'}</h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-16 sm:pt-20 lg:pt-10) */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10 pt-16 sm:pt-20 lg:pt-10 overflow-y-auto">
        
          {/* Back Button */}
          <div className="mb-3 sm:mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-base sm:text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
              ← Back
            </button>
          </div>

          {/* Task Information */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-4xl sm:max-w-5xl mx-auto" style={{ 
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`
          }}>

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 font-inter">Task Information:</h2>
            <hr className="mb-3 sm:mb-4" style={{ borderColor: currentColors.border }} />

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
              
              <div className="space-y-2 sm:space-y-3">
                <p className="font-semibold font-inter text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                  {quizData?.task_title || currentTask?.task_title || decodedTaskName || 'Week 8 Individual Activity'}
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                    Due Date: <span style={{ opacity: 1 }}>{formatDueDate(quizData?.due_date || currentTask?.due_date)}</span>
                  </p>
                  {!quizData && !currentTask && (
                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                      Task ID: <span style={{ opacity: 1 }}>{task_id}</span>
                    </p>
                  )}
                  {!quizData && !currentTask && (
                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                      Space: <span style={{ opacity: 1 }}>{decodedSpaceName}</span>
                    </p>
                  )}
                  {(quizData?.task_instruction || currentTask?.task_instruction) && (
                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                      Instructions: <span style={{ opacity: 1 }} className="break-words">{quizData?.task_instruction || currentTask?.task_instruction}</span>
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Students Who Took Quiz Table */}
            <div className="mt-6 sm:mt-8">
              <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Students Who Completed This Quiz:</h3>
              
              {/* Mobile Card View - For small screens */}
              <div className="block sm:hidden">
                <div className="space-y-3">
                  {/* Sample data - replace with actual student submissions */}
                  <div className="rounded-lg border p-3" style={{ 
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border,
                    transition: 'background-color 0.2s ease'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm" style={{ color: currentColors.text }}>Juan Dela Cruz</h4>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.primary || currentColors.text
                      }}>
                        15/{quizData?.total_score || currentTask?.total_score || 20}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                      Completed: Nov 20, 2025 at 2:30 PM
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3" style={{ 
                    backgroundColor: currentColors.hover,
                    borderColor: currentColors.border,
                    transition: 'background-color 0.2s ease'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm" style={{ color: currentColors.text }}>Maria Santos</h4>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                        backgroundColor: currentColors.background,
                        color: currentColors.primary || currentColors.text
                      }}>
                        18/{quizData?.total_score || currentTask?.total_score || 20}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                      Completed: Nov 20, 2025 at 3:15 PM
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3" style={{ 
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border,
                    transition: 'background-color 0.2s ease'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm" style={{ color: currentColors.text }}>Jose Reyes</h4>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.primary || currentColors.text
                      }}>
                        12/{quizData?.total_score || currentTask?.total_score || 20}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                      Completed: Nov 21, 2025 at 10:45 AM
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Desktop Table View - For medium screens and up */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-sm rounded-lg border" style={{ borderColor: currentColors.border }}>
                      <table className="min-w-full divide-y" style={{ borderColor: currentColors.border }}>
                        <thead style={{ 
                          backgroundColor: currentColors.surface,
                          borderBottom: `2px solid ${currentColors.border}`
                        }}>
                          <tr>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold" style={{ color: currentColors.text }}>
                              Student Name
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold" style={{ color: currentColors.text }}>
                              Score
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold" style={{ color: currentColors.text }}>
                              Total Score
                            </th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold" style={{ color: currentColors.text }}>
                              Completed
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                          {/* Sample data - replace with actual student submissions */}
                          <tr style={{ 
                            backgroundColor: currentColors.background,
                            transition: 'background-color 0.2s ease'
                          }}>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              Juan Dela Cruz
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <span className="font-medium" style={{ color: currentColors.primary || currentColors.text }}>15</span>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              {quizData?.total_score || currentTask?.total_score || 20}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <div>
                                <div>Nov 20, 2025</div>
                                <div className="text-xs" style={{ color: currentColors.textSecondary }}>2:30 PM</div>
                              </div>
                            </td>
                          </tr>
                          <tr style={{ 
                            backgroundColor: currentColors.hover,
                            transition: 'background-color 0.2s ease'
                          }}>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              Maria Santos
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <span className="font-medium" style={{ color: currentColors.primary || currentColors.text }}>18</span>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              {quizData?.total_score || currentTask?.total_score || 20}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <div>
                                <div>Nov 20, 2025</div>
                                <div className="text-xs" style={{ color: currentColors.textSecondary }}>3:15 PM</div>
                              </div>
                            </td>
                          </tr>
                          <tr style={{ 
                            backgroundColor: currentColors.background,
                            transition: 'background-color 0.2s ease'
                          }}>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              Jose Reyes
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <span className="font-medium" style={{ color: currentColors.primary || currentColors.text }}>12</span>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              {quizData?.total_score || currentTask?.total_score || 20}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm" style={{ color: currentColors.text }}>
                              <div>
                                <div>Nov 21, 2025</div>
                                <div className="text-xs" style={{ color: currentColors.textSecondary }}>10:45 AM</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty state message when no students have taken the quiz */}
              {false && ( // Change to true when no data is available
                <div className="text-center py-8 sm:py-12" style={{ color: currentColors.textSecondary }}>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
                  <p className="text-sm sm:text-base">No students have completed this quiz yet.</p>
                  <p className="text-xs sm:text-sm mt-1">Check back later for submissions.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfViewActivityPage;
