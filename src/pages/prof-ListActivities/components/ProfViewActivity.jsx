import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfViewActivityPage = () => {
  const { space_uuid, space_name, task_name } = useParams();
  const [instructions, setInstructions] = useState("");
  const [postedInstructions, setPostedInstructions] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
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

  const handleSaveInstructions = () => {
    setPostedInstructions(instructions);
    setInstructions("");
  };

  const handleCancelInstructions = () => {
    setInstructions("");
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
            <h1 className="text-lg font-bold">{task_name ? task_name : 'Task View'}</h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-20) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
        
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

          {/* Task Information */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg max-w-5xl mx-auto" style={{ 
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`
          }}>

            <h2 className="text-base sm:text-lg font-semibold mb-4 font-inter">Task Information:</h2>
            <hr className="mb-4" style={{ borderColor: currentColors.border }} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8 lg:mb-10">
              
              <div>
                <p className="font-semibold font-inter text-xl sm:text-2xl lg:text-3xl">{task_name ? task_name : 'Week 8 Individual Activity'}</p>
                <p className="text-xs sm:text-sm mt-2 flex flex-col sm:flex-row gap-2 sm:gap-10" style={{ opacity: 0.7 }}>Due Date: <span style={{ opacity: 1 }}>November 20, 2025</span></p>
                <p className="text-xs sm:text-sm mt-2 flex flex-col sm:flex-row gap-2 sm:gap-5" style={{ opacity: 0.7 }}>Assigned By: <span style={{ opacity: 1 }}>Zeldrick Delos Santos</span></p>
              </div>

              <div className="text-left lg:text-right">
                <p className="font-semibold">Grade:</p>
                <p className="text-xl sm:text-2xl font-bold mt-2">15/20</p>
              </div>

            </div>

            {/* Instructions Section */}
            <hr className="mb-4" style={{ borderColor: currentColors.border }} />
            <h3 className="font-semibold mb-4">Instructions (Optional)</h3>
            
            <div className="p-4 rounded-xl" style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#f8fafc' }}>
              <textarea
                placeholder="Add any additional instructions or notes..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full h-20 bg-transparent resize-none focus:outline-none rounded-lg p-3 text-sm"
                style={{
                  color: currentColors.text,
                  placeholderColor: currentColors.textSecondary
                }}
              />
              
              {/* Action Buttons */}
              {instructions && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleCancelInstructions}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#4b5563' : '#6b7280',
                      color: 'white'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInstructions}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6',
                      color: 'white'
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Posted Instructions Display */}
            {postedInstructions && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-base" style={{ opacity: 0.9 }}>Posted Instructions:</h4>
                <div className="p-6 rounded-xl shadow-lg" style={{ 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#f1f5f9',
                  border: `1px solid ${currentColors.border}`
                }}>
                  <p className="text-base whitespace-pre-wrap leading-normal font-medium" style={{ color: currentColors.text }}>{postedInstructions}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfViewActivityPage;
