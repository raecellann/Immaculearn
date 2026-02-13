import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import ProfSidebar from "../../component/profsidebar";

const ProfViewActivityPage = () => {
  const { space_uuid, space_name, task_name } = useParams();
  const [instructions, setInstructions] = useState("");
  const [postedInstructions, setPostedInstructions] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  
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
    <div className="flex min-h-screen bg-[#161A20] text-white">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">

        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0"
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
              className="text-gray-400 hover:text-white bg-transparent border-none p-2 text-lg font-medium transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Task Information */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg max-w-5xl mx-auto bg-[#1F242D]">

            <h2 className="text-base sm:text-lg font-semibold mb-4 font-inter">Task Information:</h2>
            <hr className="border-gray-700 mb-4" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-8 lg:mb-10">
              
              <div>
                <p className="font-semibold font-inter text-xl sm:text-2xl lg:text-3xl">{task_name ? task_name : 'Week 8 Individual Activity'}</p>
                <p className="text-xs sm:text-sm opacity-70 mt-2 flex flex-col sm:flex-row gap-2 sm:gap-10">Due Date: <span className="opacity-100">November 20, 2025</span></p>
                <p className="text-xs sm:text-sm opacity-70 mt-2 flex flex-col sm:flex-row gap-2 sm:gap-5">Assigned By: <span className="opacity-100">Zeldrick Delos Santos</span></p>
              </div>

              <div className="text-left lg:text-right">
                <p className="font-semibold">Grade:</p>
                <p className="text-xl sm:text-2xl font-bold mt-2">15/20</p>
              </div>

            </div>

            {/* Instructions Section */}
            <hr className="border-gray-700 mb-4" />
            <h3 className="font-semibold mb-4">Instructions (Optional)</h3>
            
            <div className="p-4 rounded-xl bg-[#1A1A1A]">
              <textarea
                placeholder="Add any additional instructions or notes..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full h-20 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none rounded-lg p-3 text-sm"
              />
              
              {/* Action Buttons */}
              {instructions && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleCancelInstructions}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInstructions}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Posted Instructions Display */}
            {postedInstructions && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-base opacity-90">Posted Instructions:</h4>
                <div className="p-6 rounded-xl bg-[#2A2A2A] border border-gray-500 shadow-lg">
                  <p className="text-base text-white whitespace-pre-wrap leading-normal font-medium">{postedInstructions}</p>
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
