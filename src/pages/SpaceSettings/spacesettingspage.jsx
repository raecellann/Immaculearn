import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Menu, Bell, Lock, Globe, Users, FileText, Settings as SettingsIcon, ChevronRight, Plus } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import Logout from "../component/logout";
import ProfSidebar from "../component/profsidebar";

const SpaceSettingsPage = () => {
  const { user } = useUser();
  const { userSpaces, isLoading } = useSpace();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Debug logging
  console.log("Space Settings Debug:", { 
    user: user ? `authenticated (id: ${user.account_id}, role: ${user.role})` : 'not authenticated',
    userSpaces: userSpaces,
    isLoading: isLoading,
    userSpacesLength: userSpaces?.length || 0,
    route: window.location.pathname
  });

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

  const handleBackToSpaces = () => {
    console.log("Navigating back to spaces list");
    navigate('/space-settings');
  };

  const handleSpaceSettingsClick = (spaceUuid, spaceName) => {
    console.log("Navigating to space settings:", { spaceUuid, spaceName });
    navigate(`/space-settings/${spaceUuid}/${encodeURIComponent(spaceName)}`);
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
          className={`sticky top-0 z-30 bg-[#1a73da] text-white p-4 flex items-center justify-between transition-transform duration-300 md:hidden ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Space Settings</h1>
          <div className="w-10" />
        </div>

        {/* DESKTOP HEADER SPACER */}
        <div className="hidden md:block h-16" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* PAGE HEADER */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Space Settings</h1>
              <p className="text-gray-400">Select a space to configure its settings and preferences</p>
            </div>

            {/* SPACES LIST */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : userSpaces && userSpaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSpaces.map((space) => (
                  <div
                    key={space.space_uuid}
                    onClick={() => handleSpaceSettingsClick(space.space_uuid, space.space_name)}
                    className="bg-[#1E242E] rounded-xl p-6 cursor-pointer hover:bg-[#2A3142] transition-colors border border-gray-700 hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-white">{space.space_name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {space.description || "No description available"}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400 mt-1" size={20} />
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400">
                      <Users size={16} className="mr-1" />
                      <span>{space.members?.length || 0} members</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Configure learning spaces, permissions, and collaboration features</span>
                        <SettingsIcon size={16} className="text-blue-400" />
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => navigate('/spaces')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          Configure Spaces →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-[#1E242E] rounded-xl p-8 max-w-md mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <Plus size={24} className="text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Spaces Found</h3>
                  <p className="text-gray-400 mb-6">
                    You haven't created or joined any spaces yet. Create your first space to get started!
                  </p>
                  <button
                    onClick={() => navigate('/space/create')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Space
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default SpaceSettingsPage;
