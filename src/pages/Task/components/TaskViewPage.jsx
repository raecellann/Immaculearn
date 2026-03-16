import React, { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const TaskViewPage = () => {
  const { space_uuid, space_name, task_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const navigate = useNavigate();
  // const { isAuthenticated } = useUser();
  
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
    // Fetch quiz data from localStorage
    try {
      const savedQuiz = localStorage.getItem("quizTask");
      if (savedQuiz) {
        const parsedQuiz = JSON.parse(savedQuiz);
        setQuizData(parsedQuiz);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }, []);

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
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate">{task_name ? task_name : 'Task View'}</h1>
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
                  {quizData?.task_title || task_name || 'Week 8 Individual Activity'}
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                    Due Date: <span style={{ opacity: 1 }}>{formatDueDate(quizData?.due_date)}</span>
                  </p>
                  {quizData?.task_instruction && (
                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10" style={{ opacity: 0.7 }}>
                      Instructions: <span style={{ opacity: 1 }} className="break-words">{quizData.task_instruction}</span>
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskViewPage;
