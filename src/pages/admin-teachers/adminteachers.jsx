import React, { useEffect, useState } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Users, GraduationCap, UserCheck } from "lucide-react";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    teachers: 12,
    students: 240,
    pending: 3,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Replace with API fetch  
    setRecentActivity([
      { id: 1, message: "New student account registered", time: "2 min ago" },
      { id: 2, message: "Teacher account verified", time: "10 min ago" },
      { id: 3, message: "Student changed profile info", time: "30 min ago" },
    ]);
  }, []);

  return (
    <div className="flex bg-[#161A20] text-white min-h-screen">

      {/* Sidebar */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Title */}
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          {/* Teachers */}
          <div className="bg-[#1E242E] p-6 rounded-xl flex items-center gap-5 hover:bg-[#242B38] transition">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <GraduationCap className="text-blue-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Teachers</p>
              <h2 className="text-2xl font-bold">{stats.teachers}</h2>
            </div>
          </div>

          {/* Students */}
          <div className="bg-[#1E242E] p-6 rounded-xl flex items-center gap-5 hover:bg-[#242B38] transition">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Users className="text-green-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Students</p>
              <h2 className="text-2xl font-bold">{stats.students}</h2>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-[#1E242E] p-6 rounded-xl flex items-center gap-5 hover:bg-[#242B38] transition">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <UserCheck className="text-yellow-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Verifications</p>
              <h2 className="text-2xl font-bold">{stats.pending}</h2>
            </div>
          </div>

        </div>

        {/* MAIN GRID: Recent Activity + Pending Accounts */}
        <div className="grid grid-cols-3 gap-6">

          {/* RECENT ACTIVITY */}
          <div className="col-span-2 bg-[#1E242E] p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#2E3440] p-4 rounded-lg flex justify-between items-center hover:bg-[#363D4A] transition"
                >
                  <p className="text-sm">{log.message}</p>
                  <span className="text-xs text-gray-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PENDING VERIFICATIONS */}
          <div className="bg-[#1E242E] p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Accounts Pending Verification</h2>

            <div className="space-y-4">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="bg-[#2E3440] p-4 rounded-lg flex justify-between items-center hover:bg-[#363D4A] transition"
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

export default AdminDashboard;
