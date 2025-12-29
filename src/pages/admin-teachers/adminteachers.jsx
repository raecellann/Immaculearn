import React, { useState, useEffect } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Menu, CheckCircle } from "lucide-react";

const AdminTeachers = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    setTeachers([
      { id: 1, name: "Jober Reyes", email: "joberreyes@gmail.com" },
      { id: 2, name: "Nathaniel Cruz", email: "nathanielcruz@gmail.com" },
    ]);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white relative">

      {/* OVERLAY (Mobile & Tablet) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static z-40 h-full
          transform transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full flex flex-col">

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex items-center gap-4 p-4 border-b border-white/10">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent p-0 border-none outline-none"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          <h1 className="text-lg font-semibold">Teachers</h1>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Teachers List
          </h1>

          {/* ================= MOBILE & TABLET (CARD VIEW) ================= */}
          <div className="flex flex-col gap-4 lg:hidden">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-[#1E242E] border border-gray-700 rounded-xl p-4"
              >
                {/* 🔥 FIXED FONT SIZE (MATCHES STUDENT PAGE) */}
                <p className="text-base font-semibold mb-1">
                  {teacher.name}
                </p>

                <p className="text-gray-400 text-sm mb-3">
                  {teacher.email}
                </p>

                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>
            ))}
          </div>

          {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
          <div className="hidden lg:block bg-[#1E242E] p-6 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Verified</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-gray-800 hover:bg-[#242B38] transition"
                  >
                    <td className="py-4">{teacher.name}</td>
                    <td className="py-4">{teacher.email}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminTeachers;
