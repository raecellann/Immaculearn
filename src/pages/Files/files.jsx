import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";

const FilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // 🔹 ADDED: hide-on-scroll state
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

  const spaces = [
    { name: "ZJ’s Space" },
    { name: "Wilson’s Space" },
    { name: "Nath’s Space" },
    { name: "Raecell’s Space" },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header with hide-on-scroll */}
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

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Files
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {spaces.map((space, index) => (
              <div
                key={index}
                className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                onClick={() => {
                  if (space.name === "ZJ’s Space") navigate("/view-all-files");
                  if (space.name === "Raecell’s Space")
                    navigate("/create-file-admin");
                }}
              >
                <span className="text-xl">📁</span>
                <p className="text-lg">{space.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default FilePage;
