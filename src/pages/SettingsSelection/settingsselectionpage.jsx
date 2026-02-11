import React, { useState, useEffect, useRef } from "react";
import { Menu, User, Star, Settings as SettingsIcon } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import ProfSidebar from "../component/profsidebar";

const SettingsSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  const handleAccountSettings = () => {
    navigate('/accsettings');
  };

  const handleSpaceSettings = () => {
    navigate('/space-settings');
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed left-0 top-0 h-full w-60 bg-[#1a73da] text-white transform transition-transform duration-300 z-50 md:block lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        {/* MOBILE HEADER */}
        <div
          className={`sticky top-0 z-30 bg-[#161A20] text-white p-4 flex items-center justify-between transition-transform duration-300 md:hidden ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="w-10" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* PAGE HEADER */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
              <p className="text-gray-400">Choose what you'd like to configure</p>
            </div>

            {/* SETTINGS OPTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* ACCOUNT SETTINGS CARD */}
              <button
                onClick={handleAccountSettings}
                className="bg-[#1E242E] rounded-xl p-8 hover:bg-[#2E3440] transition-all duration-200 text-left group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                    <User size={32} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
                  <p className="text-gray-400 text-sm">
                    Manage your personal profile, security, and preferences
                  </p>
                  <div className="mt-4 text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                    Configure Account →
                  </div>
                </div>
              </button>

              {/* SPACE SETTINGS CARD */}
              <button
                onClick={handleSpaceSettings}
                className="bg-[#1E242E] rounded-xl p-8 hover:bg-[#2E3440] transition-all duration-200 text-left group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                    <Star size={32} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Space Settings</h2>
                  <p className="text-gray-400 text-sm">
                    Configure learning spaces, permissions, and collaboration features
                  </p>
                  <div className="mt-4 text-green-400 text-sm font-medium group-hover:text-green-300 transition-colors">
                    Configure Space →
                  </div>
                </div>
              </button>
            </div>

            {/* QUICK INFO */}
            <div className="bg-[#1E242E] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <SettingsIcon size={20} className="mr-2" />
                Quick Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Account Settings</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Profile information</li>
                    <li>• Email and password</li>
                    <li>• Security settings</li>
                    <li>• Notification preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Space Settings</h4>
                  <ul className="text-gray-400 space-y-1">
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

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default SettingsSelectionPage;
