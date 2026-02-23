import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfViewAllActivityPage = () => {
  const { space_name } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
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
      spaceName: "individual-space"
    },
    {
      id: 2,
      taskName: "Group Project Proposal",
      deadline: "November 25, 2025",
      status: "Ended",
      spaceUuid: "def-456",
      spaceName: "group-space"
    },
    {
      id: 3,
      taskName: "Literature Review",
      deadline: "December 1, 2025",
      status: "In Progress",
      spaceUuid: "ghi-789",
      spaceName: "research-space"
    }
  ]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Ended":
        return "bg-green-500/20 text-[#10E164] border-[#00B865]";
      case "In Progress":
        return "bg-blue-500/20 text-[#4D9BEF] border-[#0066D2]";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const handleViewDetails = (task) => {
    navigate(`/prof/list-activity/${task.spaceUuid}/${space_name}/${task.id}/${task.taskName}`);
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
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b" style={{ borderColor: currentColors.border }}>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-sm" style={{ color: currentColors.text }}>{task.taskName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>{task.deadline}</p>
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
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl p-4 border" style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border
                }}>
                  <div className="flex flex-col space-y-3">
                    {/* Header with Title and Status */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base flex-1" style={{ color: currentColors.text }}>{task.taskName}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border w-fit" style={{
                        backgroundColor: getStatusColor(task.status).includes('green') ? (isDarkMode ? 'rgba(16, 185, 100, 0.2)' : 'rgba(34, 197, 94, 0.2)') :
                                       getStatusColor(task.status).includes('blue') ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)') :
                                       (isDarkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.2)'),
                        color: getStatusColor(task.status).includes('green') ? (isDarkMode ? '#10e164' : '#22c55e') :
                               getStatusColor(task.status).includes('blue') ? (isDarkMode ? '#4d9bef' : '#3b82f6') :
                               currentColors.textSecondary,
                        borderColor: getStatusColor(task.status).includes('green') ? (isDarkMode ? '#00b865' : '#16a34a') :
                                   getStatusColor(task.status).includes('blue') ? (isDarkMode ? '#0066d2' : '#2563eb') :
                                   currentColors.border
                      }}>
                        {task.status}
                      </span>
                    </div>
                    
                    {/* Deadline */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📅</span>
                      <p className="text-xs sm:text-sm" style={{ color: currentColors.textSecondary }}>{task.deadline}</p>
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
        </div>
      </div>
    </div>
  );
};

export default ProfViewAllActivityPage;
