import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import Logout from "../component/logout";

const ProfFilePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const headerRef = useRef(null);
  const lastScroll = useRef(0);

  const files = [
    {
      status: "Posted",
      fileName: "LPS CS Thesis 1 – Week 6",
      datePosted: "July 24",
      spaceName: "CS THESIS 1 - 1SY2025-2026",
      posted: true,
    },
    {
      status: "To be Uploaded",
      fileName: "Data Mining-Lecture",
      datePosted: "Oct 30",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: false,
    },
    {
      status: "Posted",
      fileName: "Basic File and Access Concepts-2021",
      datePosted: "Oct 10",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: true,
    },
  ];

  // 🔹 Hide-on-scroll header
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (headerRef.current) {
        if (currentScroll > lastScroll.current) {
          headerRef.current.style.transform = "translateY(-100%)";
        } else {
          headerRef.current.style.transform = "translateY(0)";
        }
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ MOBILE / TABLET STICKY HEADER */}
        <div
          ref={headerRef}
          className="
            lg:hidden
            sticky top-0 z-30
            bg-[#1E222A]
            px-3
            pt-[env(safe-area-inset-top)]
            border-b border-gray-700
            transition-transform duration-300
          "
        >
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-2xl bg-transparent p-0 border-none focus:outline-none"
            >
              ☰
            </button>

            <h1 className="text-lg font-bold flex-1 truncate">Files</h1>

            <Button
              onClick={() => setShowModal(true)}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.75rem",
                borderRadius: "0.375rem",
                backgroundColor: "#3B82F6",
              }}
            >
              Upload
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center px-10 pt-10 mb-6 relative">
          <h1 className="text-4xl font-bold text-center flex-1">Files</h1>
          <div className="absolute right-10 top-10">
            <Button
              onClick={() => setShowModal(true)}
              style={{
                padding: "0.35rem 1rem",
                fontSize: "0.8rem",
                borderRadius: "0.375rem",
                backgroundColor: "#3B82F6",
              }}
            >
              Create or Upload File
            </Button>
          </div>
        </div>

        {/* ✅ CONTENT (ADDED SPACE HERE) */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10 mt-4 sm:mt-6">
          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="bg-[#1E222A] p-4 rounded-lg border border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-blue-400">
                    {file.fileName}
                  </h3>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      file.posted
                        ? "text-green-400 bg-green-900/30"
                        : "text-blue-400 bg-blue-900/30"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  <b>Date:</b> {file.datePosted}
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  <b>Space:</b> {file.spaceName}
                </p>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-md text-sm">
                  {file.posted ? "View File" : "Upload"}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto mt-4">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-gray-600 text-gray-300 text-sm">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Date Posted</th>
                  <th className="py-3 px-4">Space Name</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-700 hover:bg-[#1F242D] transition"
                  >
                    <td
                      className={`py-3 px-4 ${
                        file.posted ? "text-green-400" : "text-blue-400"
                      }`}
                    >
                      {file.status}
                    </td>
                    <td className="py-3 px-4">{file.fileName}</td>
                    <td className="py-3 px-4">{file.datePosted}</td>
                    <td className="py-3 px-4">{file.spaceName}</td>
                    <td className="py-3 px-4">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                        {file.posted ? "View File" : "Upload"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ MODAL RESTORED */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#1F242D] p-6 rounded-lg w-[90%] max-w-[400px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Upload New File
            </h2>

            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="File Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <input
                type="text"
                placeholder="Date Posted (e.g. Oct 30)"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <input
                type="text"
                placeholder="Space Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <select className="p-2 bg-[#2A2E36] rounded-md text-white outline-none">
                <option>To be Uploaded</option>
                <option>Posted</option>
              </select>
            </form>

            <div className="flex justify-end mt-5 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfFilePage;
