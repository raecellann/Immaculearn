import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Menu, CheckCircle } from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setStudents([
      { id: 1, name: "Raecell Ann Galvez", email: "raecell@gmail.com" },
      { id: 2, name: "Zeldrick Jesus Delos Santos", email: "zeldrickjesus@gmail.com" },
      { id: 3, name: "Wilson Esmabe", email: "wesmabe1920@gmail.com" },
      { id: 4, name: "Nathaniel Faburada", email: "faburadanathaniel@gmail.com" },
      { id: 5, name: "Christian Joy Bedana", email: "gimple20@gmail.com" },
      { id: 6, name: "Keziah Tangco", email: "keziahtangco@gmail.com" },
    ]);
  }, []);

  /* 🔹 SCROLL BEHAVIOR */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white relative">

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ✅ SIDEBAR (NO TRANSFORM = MODAL SAFE) */}
      <div
        className={`
          fixed top-0 left-0 h-full z-40
          transition-all duration-300
          ${mobileSidebarOpen ? "left-0" : "-left-60"}
          lg:left-0 lg:static
        `}
      >
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full flex flex-col">

        {/* 🔹 STICKY MOBILE / TABLET HEADER */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-white/10 transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="flex items-center gap-4 px-4 h-14 pt-[env(safe-area-inset-top)]">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent p-0 border-none text-white"
            >
              <Menu className="w-7 h-7" />
            </button>
            <h1 className="text-lg font-semibold">Students</h1>
          </div>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Students List
          </h1>

          {/* MOBILE / TABLET */}
          <div className="flex flex-col gap-4 lg:hidden">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#1E242E] p-5 rounded-xl border border-white/10"
              >
                <h2 className="font-semibold text-base mb-1">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-400 mb-3">
                  {student.email}
                </p>

                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Verified
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
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
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-800 hover:bg-[#242B38]"
                  >
                    <td className="py-4">{student.name}</td>
                    <td className="py-4">{student.email}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Verified
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

export default AdminStudents;
