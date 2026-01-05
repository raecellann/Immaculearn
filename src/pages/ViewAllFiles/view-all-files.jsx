<<<<<<< HEAD
import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import AdminSidebar from "../component/sidebar";
=======
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../component/sidebar";
>>>>>>> f23cf8177bdd7be3d9ba4e61bff33ae7a88909e9

const ViewAllFilesPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

<<<<<<< HEAD
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#4d9bef] via-[#3d8ee8] via-[#2c81e1] via-[#1a73da] to-[#0066d2] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Files</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-8">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Files</h1>
          </div>
        </div>

        {/* FILES TABLE */}
        <div className="p-4 lg:p-8">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date Posted
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Space Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody className="divide-y divide-gray-700">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-800/50 transition">
                      {/* STATUS */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-400 flex items-center space-x-1">
                            {file.status}
                            <ChevronDown size={14} />
                          </span>
                        </div>
                      </td>

                      {/* FILE NAME */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-white font-medium">
                        <div className="max-w-[200px] lg:max-w-none truncate">
                          {file.name}
                        </div>
                      </td>

                      {/* DATE POSTED */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-300">
                        {file.datePosted}
                      </td>

                      {/* SPACE NAME */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-300">
                        {file.spaceName}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        {file.isNew && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md cursor-pointer hover:bg-blue-600 transition inline-block">
                            View File
                          </span>
                        )}
=======
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
        <Sidebar />
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
        <Sidebar />
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
>>>>>>> f23cf8177bdd7be3d9ba4e61bff33ae7a88909e9
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<<<<<<< HEAD
=======

>>>>>>> f23cf8177bdd7be3d9ba4e61bff33ae7a88909e9
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllFilesPage;
