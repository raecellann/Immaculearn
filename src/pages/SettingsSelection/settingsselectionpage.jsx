import React, { useState, useEffect, useRef } from "react";
import { Menu, Star, Settings as SettingsIcon } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import ProfSidebar from "../component/profsidebar";

const SettingsSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide-on-scroll header
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


  const handleSpaceSettings = () => {
    navigate("/space-settings");
  };


  const ActiveSidebar =
    user?.role === "professor" ? ProfSidebar : Sidebar;

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed left-0 top-0 h-full w-60 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        {/* ✅ MOBILE / TABLET HEADER */}
        <div
          className={`
            lg:hidden
            bg-[#1E222A]
            p-4
            border-b border-[#3B4457]
            flex items-center gap-4
            fixed top-0 left-0 right-0 z-30
            transition-transform duration-300
            ${showHeader ? "translate-y-0" : "-translate-y-full"}
          `}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10 pt-20 lg:pt-10">
          <div className="max-w-4xl mx-auto">

            {/* Desktop Header */}
            <div className="hidden lg:block px-10 pt-10">
              <h1 className="text-4xl font-bold text-center mb-2">
                Settings
              </h1>
              <p className="text-gray-300 mb-8 text-center">
                Choose what you'd like to configure
              </p>
            </div>

            {/* SETTINGS CARDS AND QUICK INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

              {/* SPACE SETTINGS */}
              <button
                onClick={handleSpaceSettings}
                className="bg-[#1E242E] rounded-xl p-8 hover:bg-[#2E3440] transition-all duration-200 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                    <Star size={30} />
                  </div>

                  <h2 className="text-xl font-semibold mb-2">
                    Space Settings
                  </h2>

                  <p className="text-gray-400 text-sm">
                    Configure spaces, permissions, and features
                  </p>

                  <span className="mt-4 text-green-400 text-sm font-medium group-hover:text-green-300">
                    Configure Space →
                  </span>
                </div>
              </button>

              {/* QUICK INFO */}
              <div className="bg-[#1E242E] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <SettingsIcon size={20} className="mr-2" />
                  Quick Info
                </h3>

                <div className="text-sm text-gray-400">
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      Space Settings
                    </h4>
                    <ul className="space-y-1">
                      <li>• Space configuration</li>
                      <li>• Member permissions</li>
                      <li>• Feature toggles</li>
                      <li>• Access control</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <Logout
          onClose={() => setShowLogout(false)}
        />
      )}
    </div>
  );
};

export default SettingsSelectionPage;
