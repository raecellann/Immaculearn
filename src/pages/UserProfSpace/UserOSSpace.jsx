import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";

const UserOSSpace = () => {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();

  // 🔹 ADDED: mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 🔹 ADDED: hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // OS space data from professor's perspective
  const spaceData = {
    title: "Operating System",
    image: "/src/assets/SpacesCover/os.jpg",
    time: "Opened 3 mins ago",
    category: "Classroom Space",
    members: 40,
    yearLevel: "3rd Year",
    instructor: "Prof. Johnson",
    description: "Operating system concepts and implementation for 3rd year students",
    schedule: "TTH 2:00-3:30 PM"
  };

  // Mock data for activities/tasks in this space
  const activities = [
    {
      id: 1,
      title: "Process Scheduling Assignment",
      description: "Implement CPU scheduling algorithms",
      dueDate: "2026-01-22",
      dueTime: "11:59 PM",
      priority: "high",
      status: "pending",
      type: "Assignment"
    },
    {
      id: 2,
      title: "Memory Management Lab",
      description: "Complete lab exercises on memory allocation",
      dueDate: "2026-01-25",
      dueTime: "5:00 PM",
      priority: "medium",
      status: "pending",
      type: "Lab Activity"
    },
    {
      id: 3,
      title: "File Systems Quiz",
      description: "Online quiz on file system concepts",
      dueDate: "2026-01-20",
      dueTime: "2:00 PM",
      priority: "medium",
      status: "pending",
      type: "Exam"
    }
  ];

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* ================= Desktop Sidebar (Laptop+) ================= */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ================= Mobile + Tablet Overlay ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= Tablet Sidebar ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar />
      </div>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= Header (Mobile + Tablet) ================= */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">{spaceData.title}</h1>
        </div>

        {/* ================= Spacer for fixed header ================= */}
        <div className="lg:hidden h-16"></div>

        {/* ================= Page Content ================= */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Header (Desktop only) */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/space")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-4xl font-bold">{spaceData.title}</h1>
            </div>
          </div>

          {/* ================= Space Info Card ================= */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-8 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Space Info */}
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  {spaceData.title}
                </h2>
                <p className="text-gray-300 text-sm mb-1">
                  {spaceData.description}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Active</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {spaceData.members} Students
                  </div>
                  <div className="text-sm text-gray-300">
                    {spaceData.yearLevel}
                  </div>
                </div>
              </div>

              {/* Right side - Instructor Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Instructor
                </h3>
                <div className="bg-[#1E242E] rounded-lg p-4 border border-[#3B4457]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">J</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{spaceData.instructor}</p>
                      <p className="text-gray-400 text-sm">Professor</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    <strong>Schedule:</strong> {spaceData.schedule}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Activities Section ================= */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Activities & Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457]"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm">
                        {activity.title}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.priority === 'high' ? 'bg-red-500' :
                        activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="block">Due: {activity.dueDate}</span>
                        <span className="block">{activity.dueTime}</span>
                      </div>
                      <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                        {activity.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOSSpace;
