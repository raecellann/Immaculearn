import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Users, GraduationCap } from "lucide-react";

/*
 API USED:
 GET http://localhost:3000/v1/register_student/all_emails
*/

const AdminDashboard = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* 🔹 STATS STATE */
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    pending: 3,
  });

  /* 🔹 RECENT ACTIVITY */
  const [recentActivity, setRecentActivity] = useState([]);

  /* 🔹 FETCH STUDENT EMAIL COUNT */
  useEffect(() => {
  const fetchStudentCount = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/v1/register_student/all_emails_student"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch student emails");
      }

      const data = await res.json();

      // ✅ MATCHED TO YOUR API RESPONSE
      const studentCount = Array.isArray(data.emails)
        ? data.emails.length
        : 0;

      setStats((prev) => ({
        ...prev,
        students: studentCount,
      }));
    } catch (error) {
      console.error("Error fetching student count:", error);
    }
  };

  fetchStudentCount();
}, []);

/* 🔹 FETCH STUDENT EMAIL COUNT */
  useEffect(() => {
  const fetchprofCount = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/v1/register_prof/all_emails_prof"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch student emails");
      }

      const data = await res.json();

      // ✅ MATCHED TO YOUR API RESPONSE
      const profCount = Array.isArray(data.emails)
        ? data.emails.length
        : 0;

      setStats((prev) => ({
        ...prev,
        teachers: profCount,
      }));
    } catch (error) {
      console.error("Error fetching student count:", error);
    }
  };

  fetchprofCount();
}, []);


  /* 🔹 MOCK RECENT ACTIVITY */
  useEffect(() => {
    setRecentActivity([
      { id: 1, message: "New student account registered", time: "2 min ago" },
      { id: 2, message: "Teacher account verified", time: "10 min ago" },
      { id: 3, message: "Student updated profile information", time: "30 min ago" },
    ]);
  }, []);

  /* 🔹 SCROLL BEHAVIOR */
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

  /* 🔹 NAVIGATION */
  const navigateToTeachers = () => {
    window.location.href = "/admin-teachers";
  };

  const navigateToStudents = () => {
    window.location.href = "/admin-students";
  };

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
        className={`fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 lg:hidden
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
            className="text-2xl"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="hidden lg:block text-2xl font-bold mb-8">
            Admin Dashboard
          </h1>

          {/* STAT CARDS */}
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

          {/* RECENT ACTIVITY */}
          <div className="bg-[#1E242E] p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#2E3440] p-4 rounded-lg flex justify-between items-center"
                >
                  <p className="text-sm">{log.message}</p>
                  <span className="text-xs text-gray-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* 🔹 STAT CARD COMPONENT */
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const gradients = {
    blue: "from-blue-600 to-indigo-700",
    green: "from-emerald-600 to-teal-700",
  };

  const iconBg = {
    blue: "bg-blue-500/20 text-blue-200",
    green: "bg-emerald-500/20 text-emerald-200",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl flex items-center gap-5
      bg-gradient-to-br ${gradients[color]}
      hover:scale-[1.02] transition`}
    >
      <div className={`${iconBg[color]} p-3 rounded-xl`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </button>
  );
};

export default AdminDashboard;
