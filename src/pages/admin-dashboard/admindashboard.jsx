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

      {/* ===== DESKTOP SIDEBAR ===== */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <div className="h-full overflow-y-auto">
          <AdminSidebar />
        </div>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===== MOBILE SIDEBAR ===== */}
      <div
        className={`fixed top-0 left-0 h-screen w-[260px] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full overflow-y-auto bg-[#1E222A]">
          <AdminSidebar />
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 STICKY MOBILE HEADER (RESTORED) */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-white/10 transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent p-0 border-none"
            >
              <Menu className="w-7 h-7 text-white" />
            </button>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-14" />

        {/* ===== PAGE CONTENT (WINDOW SCROLL ENABLED) ===== */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">

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
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#1E242E] p-5 sm:p-6 rounded-xl flex items-center gap-4 hover:bg-[#242B38] transition">
    <div className={`bg-${color}-500/20 p-3 rounded-lg`}>
      <Icon className={`text-${color}-400 w-6 h-6 sm:w-7 sm:h-7`} />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <h2 className="text-xl sm:text-2xl font-bold">{value}</h2>
    </div>
  </div>
);

export default AdminDashboard;
