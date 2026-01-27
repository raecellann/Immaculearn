import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Users, GraduationCap, UserCheck, Menu } from "lucide-react";
import Logout from "../component/logout";

const AdminDashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const [stats, setStats] = useState({
    teachers: 12,
    students: 240,
    pending: 3,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    setRecentActivity([
      { id: 1, message: "New student account registered", time: "2 min ago" },
      { id: 2, message: "Teacher account verified", time: "10 min ago" },
      { id: 3, message: "Student changed profile info", time: "30 min ago" },
    ]);
  }, []);

  /* 🔹 SCROLL BEHAVIOR (RESTORED) */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation handlers
  const navigateToTeachers = () => {
    // This will navigate to the teachers page
    window.location.href = '/admin-teachers';
  };

  const navigateToStudents = () => {
    // This will navigate to the students page
    window.location.href = '/admin-students';
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 lg:hidden overflow-hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* MOBILE HEADER */}
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
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          <h1 className="hidden lg:block text-2xl font-bold mb-8">
            Admin Dashboard
          </h1>

          {/* ===== STAT CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <StatCard 
              icon={GraduationCap} 
              label="Teachers" 
              value={stats.teachers} 
              color="blue" 
              onClick={navigateToTeachers}
            />
            <StatCard 
              icon={Users} 
              label="Students" 
              value={stats.students} 
              color="green" 
              onClick={navigateToStudents}
            />
          </div>

          {/* ===== RECENT ACTIVITY ===== */}
          <div className="bg-[#1E242E] p-5 sm:p-6 rounded-xl mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#2E3440] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-[#363D4A] transition"
                >
                  <p className="text-sm">{log.message}</p>
                  <span className="text-xs text-gray-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

/* 🔹 REUSABLE STAT CARD */
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const colorGradients = {
    blue: 'from-blue-600 to-indigo-700',
    green: 'from-emerald-600 to-teal-700',
    yellow: 'from-yellow-500 to-amber-600',
  };

  const iconBackgrounds = {
    blue: 'bg-blue-500/20 text-blue-200',
    green: 'bg-emerald-500/20 text-emerald-200',
    yellow: 'bg-amber-500/20 text-amber-200',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl flex items-center gap-5 
        bg-gradient-to-br ${colorGradients[color]} 
        shadow-lg hover:shadow-xl hover:shadow-${color}-500/20 
        transition-all duration-300 transform hover:-translate-y-1 
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-[#1E242E] focus:ring-${color}-400
        border border-${color}-400/20`}
    >
      <div className={`${iconBackgrounds[color]} p-3.5 rounded-xl backdrop-blur-sm`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <div className="text-white">
        <p className="text-opacity-80 text-sm font-medium">{label}</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</h2>
      </div>
      <div className="ml-auto opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </button>
  );
};

export default AdminDashboard;
