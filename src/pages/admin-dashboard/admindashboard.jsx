import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Users, GraduationCap, UserCheck, Menu } from "lucide-react";

const AdminDashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar />
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
        <AdminSidebar />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard icon={GraduationCap} label="Teachers" value={stats.teachers} color="blue" />
            <StatCard icon={Users} label="Students" value={stats.students} color="green" />
            <StatCard icon={UserCheck} label="Pending Verifications" value={stats.pending} color="yellow" />
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

          {/* ===== ACCOUNTS PENDING ===== */}
          <div className="bg-[#1E242E] p-5 sm:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Accounts Pending Verification
            </h2>

            <div className="space-y-3">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="bg-[#2E3440] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-[#363D4A] transition"
                >
                  <div>
                    <p className="font-medium text-sm">User {id}</p>
                    <p className="text-gray-400 text-xs">email{id}@school.edu</p>
                  </div>
                  <button className="text-[#007AFF] text-sm hover:underline">
                    Verify
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* 🔹 REUSABLE STAT CARD */
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400'
  };

  return (
    <div className="bg-[#1E242E] p-5 sm:p-6 rounded-xl flex items-center gap-4 hover:bg-[#242B38] transition">
      <div className={`${colorClasses[color]} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h2 className="text-xl sm:text-2xl font-bold">{value}</h2>
      </div>
    </div>
  );
};

export default AdminDashboard;
