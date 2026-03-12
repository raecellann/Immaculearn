import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import CreateActivityForm from "./CreateActivityForm";
import { FiArrowLeft, FiLoader, FiAlertCircle } from "react-icons/fi";

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [spaceData, setSpaceData] = useState(null);

  // Load space data
  useEffect(() => {
    const loadSpaceData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you'd fetch space data from API
        // For now, we'll simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSpaceData({
          name: space_name,
          uuid: space_uuid,
          description: "Create engaging activities for your space"
        });
        setHasError(false);
      } catch (error) {
        console.error("Error loading space data:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (space_uuid && space_name) {
      loadSpaceData();
    }
  }, [space_uuid, space_name]);

  const handleBack = () => {
    navigate(`/space/${space_uuid}/${space_name}/tasks`);
  };

  // Format space name for display
  const displayName = space_name ? space_name.charAt(0).toUpperCase() + space_name.slice(1).replace(/-/g, ' ') : "Space";

  if (isLoading) {
    return (
      <div className="font-sans p-4 sm:p-6 md:p-8 min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin" size={32} style={{ color: currentColors.accent }} />
          <p className="text-lg">Loading space...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="font-sans p-4 sm:p-6 md:p-8 min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <FiAlertCircle size={48} className="text-red-500" />
          <h2 className="text-xl font-semibold">Failed to Load Space</h2>
          <p className="text-gray-500">We couldn't load the space information. Please try again.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: currentColors.accent, color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
          >
            Go Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans p-4 sm:p-6 md:p-8 min-h-screen" 
         style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
      
      {/* Enhanced Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all hover:shadow-xl transform hover:scale-105 w-fit"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
              color: currentColors.text,
              border: `1px solid ${currentColors.border}`
            }}
            onClick={handleBack}
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Tasks</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="text-center sm:text-right">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: currentColors.accent }}>
              {displayName}
            </h1>
            <p className="text-xs opacity-60">{displayName} Space</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-sm opacity-75 overflow-x-auto">
          <span>Tasks</span>
          <span style={{ color: currentColors.accent }}>→</span>
          <span>Create Activity</span>
        </div>
      </div>

      {/* Enhanced Form Container */}
      <div className="rounded-xl shadow-2xl overflow-hidden"
           style={{ 
             backgroundColor: currentColors.surface,
             border: `1px solid ${currentColors.border}`
           }}>
        {/* Form Header */}
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: currentColors.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: currentColors.accent }}>
              <span className="text-white font-bold text-sm sm:text-lg">+</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold">Create New Activity</h2>
              <p className="text-xs sm:text-sm opacity-75">Fill in the details below to create your activity</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6">
          <CreateActivityForm spaceName={displayName} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm opacity-60">
        <p>Need help? Check our documentation or contact support</p>
      </div>
    </div>
  );
};

export default CreateActivityPage;
