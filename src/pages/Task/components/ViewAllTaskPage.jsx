import React, { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";

const ViewAllTaskPage = () => {
  const { space_name } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  
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
    navigate(`/task/${task.spaceUuid}/${space_name}/${task.taskName}`);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
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
              className="text-gray-400 hover:text-white bg-transparent border-none p-2 text-lg font-medium transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Tasks Table */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl shadow-lg max-w-7xl mx-auto bg-[#1F242D]">

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-4 sm:mb-6 font-inter">Task List:</h2>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300 text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300 text-sm">Task Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300 text-sm">Deadline</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-300 text-sm">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-700">
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-white text-sm">{task.taskName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 text-sm">{task.deadline}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs font-medium"
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
                <div key={task.id} className="bg-[#1F242D] rounded-xl p-4 border border-gray-600">
                  <div className="flex flex-col space-y-3">
                    {/* Header with Title and Status */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm sm:text-base flex-1">{task.taskName}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {/* Deadline */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">📅</span>
                      <p className="text-gray-300 text-xs sm:text-sm">{task.deadline}</p>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewDetails(task)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
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
                <div className="bg-[#1A1A1A] rounded-xl p-6 sm:p-8 border border-gray-600">
                  <p className="text-gray-400 text-base sm:text-lg">No tasks available</p>
                  <p className="text-gray-500 text-sm sm:text-base mt-2">Tasks will appear here once they are assigned.</p>
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
