import React, { useState, useEffect, useRef } from "react";
import { Menu, Star, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import ProfSidebar from "../component/profsidebar";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const SettingsSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

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
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
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
        className={`fixed left-0 top-0 h-full w-64 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        {/* ✅ MOBILE / TABLET HEADER */}
        <div
          className={`
            lg:hidden
            p-4
            border-b
            flex items-center gap-4
            fixed top-0 left-0 right-0 z-30
            transition-transform duration-300
            ${showHeader ? "translate-y-0" : "-translate-y-full"}
          `}
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.border,
            color: currentColors.text
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: currentColors.text }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

              {/* SPACE SETTINGS */}
              <button
                onClick={handleSpaceSettings}
                className="rounded-xl p-8 hover:opacity-90 transition-all duration-200 group"
                style={{
                  backgroundColor: currentColors.surface,
                  color: currentColors.text
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                    <Star size={30} />
                  </div>

                  <h2 className="text-xl font-semibold mb-2">
                    Space Settings
                  </h2>

                  <p style={{ color: currentColors.textSecondary }} className="text-sm">
                    Configure spaces, permissions, and features
                  </p>

                  <span className="mt-4 text-sm font-medium group-hover:opacity-80" style={{ color: '#10b981' }}>
                    Configure Space →
                  </span>
                </div>
              </button>

              {/* THEME SETTINGS */}
              <button
                onClick={toggleTheme}
                className="rounded-xl p-8 hover:opacity-90 transition-all duration-200 group"
                style={{
                  backgroundColor: currentColors.surface,
                  color: currentColors.text
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                    {isDarkMode ? <Sun size={30} /> : <Moon size={30} />}
                  </div>

                  <h2 className="text-xl font-semibold mb-2">
                    Theme Settings
                  </h2>

                  <p style={{ color: currentColors.textSecondary }} className="text-sm">
                    Switch between light and dark mode
                  </p>

                  <span className="mt-4 text-sm font-medium group-hover:opacity-80" style={{ color: '#3b82f6' }}>
                    {isDarkMode ? 'Switch to Light →' : 'Switch to Dark →'}
                  </span>
                </div>
              </button>

              {/* QUICK INFO */}
              <div 
                className="rounded-xl p-6"
                style={{
                  backgroundColor: currentColors.surface,
                  color: currentColors.text
                }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <SettingsIcon size={20} className="mr-2" />
                  Quick Info
                </h3>

                <div style={{ color: currentColors.textSecondary }}>
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: currentColors.text }}>
                      Space Settings
                    </h4>
                    <ul className="space-y-1">
                      <li>• Space configuration</li>
                      <li>• Member permissions</li>
                      <li>• Feature toggles</li>
                      <li>• Access control</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2" style={{ color: currentColors.text }}>
                      Theme Settings
                    </h4>
                    <ul className="space-y-1">
                      <li>• Light/Dark mode toggle</li>
                      <li>• Automatic theme saving</li>
                      <li>• System preference detection</li>
                      <li>• Smooth transitions</li>
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
