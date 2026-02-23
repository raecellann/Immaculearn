import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Lock, Globe, Users, FileText, Settings as SettingsIcon, ChevronRight, Plus } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import ProfSidebar from "../component/profsidebar";

const SpaceSettingsPage = () => {
  const { user } = useUser();
  const { userSpaces, isLoading } = useSpace();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
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
  
  const ActiveSidebar = user?.role === "professor" ? ProfSidebar : Sidebar;

  // Debug logging
  console.log("Space Settings Debug:", { 
    user: user ? `authenticated (id: ${user.account_id}, role: ${user.role})` : 'not authenticated',
    userSpaces: userSpaces,
    isLoading: isLoading,
    userSpacesLength: userSpaces?.length || 0,
    route: window.location.pathname
  });


  const handleBackToSpaces = () => {
    console.log("Navigating back to spaces list");
    navigate('/space-settings');
  };


  const handleSpaceSettingsClick = (spaceUuid, spaceName) => {
    console.log("Navigating to space settings:", { spaceUuid, spaceName });
    navigate(`/space-settings/${spaceUuid}/${encodeURIComponent(spaceName)}`);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: isDarkMode ? '#161A20' : '#ffffff', color: currentColors.text }}>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed left-0 top-0 h-full w-64 transform transition-transform duration-300 z-50 md:block lg:hidden ${
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
          <h1 className="text-xl font-bold">Space Settings</h1>
        </div>

        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10 pt-20 lg:pt-10">
          <div className="max-w-6xl mx-auto">
            {/* Desktop Header */}
            <div className="hidden lg:block px-10 pt-10">
              <h1 className="text-4xl font-bold text-center mb-2">
                Space Settings
              </h1>
              <p style={{ color: currentColors.textSecondary }} className="mb-8 text-center">
                Select a space to configure its settings and preferences
              </p>
            </div>
            
            {/* Back Button */}
            <div className="mb-4 flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-transparent border-none p-2 text-sm font-medium transition-colors"
                style={{ color: currentColors.textSecondary }}
              >
                ← Back
              </button>
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
                    className="rounded-xl p-6 cursor-pointer transition-all duration-200 border"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#2A3142' : '#f8f9fa';
                      e.currentTarget.style.borderColor = isDarkMode ? '#3b82f6' : '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = currentColors.surface;
                      e.currentTarget.style.borderColor = currentColors.border;
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: currentColors.text }}>{space.space_name}</h3>
                        <p className="text-sm line-clamp-2" style={{ color: currentColors.textSecondary }}>
                          {space.description || "No description available"}
                        </p>
                      </div>
                      <ChevronRight className="mt-1" size={20} style={{ color: currentColors.textSecondary }} />
                    </div>
                    
                    <div className="flex items-center text-sm" style={{ color: currentColors.textSecondary }}>
                      <Users size={16} className="mr-1" />
                      <span>{space.members?.length || 0} members</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: currentColors.border }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: currentColors.textSecondary }}>Configure learning spaces, permissions, and collaboration features</span>
                        <SettingsIcon size={16} style={{ color: '#3b82f6' }} />
                      </div>
                      <div className="mt-2">
                        <button
                        key={space.space_uuid}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpaceSettingsClick(space.space_uuid, space.space_name);
                        }}
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
                <div className="rounded-xl p-8 max-w-md mx-auto" style={{ backgroundColor: currentColors.surface }}>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <Plus size={24} className="text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Spaces Found</h3>
                  <p style={{ color: currentColors.textSecondary }} className="mb-6">
                    You haven't created or joined any spaces yet. Create your first space to get started!
                  </p>
                  <button
                    onClick={() => navigate('/prof/space/create')}
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
