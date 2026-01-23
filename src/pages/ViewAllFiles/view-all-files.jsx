import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";

const ViewAllFilesPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [files] = useState([
    {
      status: "Posted",
      name: "LPS CS Thesis 1 - Week 6",
      datePosted: "July 24",
      spaceName: "Zjs Space",
      isNew: true,
    },
    {
      status: "Posted",
      name: "MOOTECH-LECTURE",
      datePosted: "Oct 30",
      spaceName: "Zjs Space",
      isNew: false,
    },
    {
      status: "Posted",
      name: "Basic File and Access Concepts-2021",
      datePosted: "Oct 10",
      spaceName: "Zjs Space",
      isNew: false,
    },
  ]);

  /* 🔹 ADDED — SAME STICKY HEADER LOGIC */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE + TABLET OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE + TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 MOBILE + TABLET STICKY HEADER */}
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
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        {/* 🔹 Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            Files
          </h1>

          <div className="max-w-6xl mx-auto">

            {/* ================= MOBILE + TABLET (CARD VIEW) ================= */}
            <div className="flex flex-col gap-4 lg:hidden">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-[#1E222A] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
                >
                  <p className="text-sm text-green-400 font-medium">
                    ● {file.status}
                  </p>

                  <p className="text-blue-400 font-medium">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Date Posted:</span>{" "}
                    {file.datePosted}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Space:</span>{" "}
                      {file.spaceName}
                    </p>

                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition">
                      View File
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
            <div className="hidden lg:block bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-left">
                    <th className="px-6 py-4 text-xs uppercase">Status</th>
                    <th className="px-6 py-4 text-xs uppercase">File Name</th>
                    <th className="px-6 py-4 text-xs uppercase">Date Posted</th>
                    <th className="px-6 py-4 text-xs uppercase">Space Name</th>
                    <th className="px-6 py-4 text-xs uppercase">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700">
                  {files.map((file, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="text-green-400 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          {file.status}
                          <ChevronDown size={14} />
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium">{file.name}</td>

                      <td className="px-6 py-4 text-gray-300">
                        {file.datePosted}
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {file.spaceName}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition">
                          View File
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ViewAllFilesPage;
