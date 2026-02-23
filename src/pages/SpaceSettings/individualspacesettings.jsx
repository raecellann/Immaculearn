import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import ProfSidebar from "../component/profsidebar";
import { ArrowLeft, Users, Settings as SettingsIcon, Link, Trash2, UserX } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import Logout from "../component/logout";

const IndividualSpaceSettings = () => {
  const { user } = useUser();
  const { userSpaces } = useSpace();
  const { spaceUuid, spaceName } = useParams();
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

  // Find the current space from userSpaces
  const currentSpace = userSpaces?.find(space => space.space_uuid === spaceUuid);

  const [spaceSettings, setSpaceSettings] = useState({
    spaceName: currentSpace?.space_name || "",
    spaceDescription: currentSpace?.description || "",
  });

  // Update settings when current space changes
  useEffect(() => {
    if (currentSpace) {
      setSpaceSettings(prev => ({
        ...prev,
        spaceName: currentSpace.space_name,
        spaceDescription: currentSpace.description || "",
      }));
    }
  }, [currentSpace]);


  const handleSettingChange = (field, value) => {
    setSpaceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log("Saving space settings:", spaceSettings);
    alert("Space settings saved successfully!");
  };

  const handleKickMember = (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this space?`)) {
      console.log(`Kicking member ${memberId} from space ${spaceUuid}`);
      alert(`${memberName} has been removed from the space.`);
      // In a real implementation, you would call an API here
      // and update the members list
    }
  };

  const getSpaceLink = () => {
    return currentSpace?.space_uuid || spaceUuid;
  };

  const copySpaceLink = () => {
    const link = getSpaceLink();
    navigator.clipboard.writeText(link);
    alert('Space code copied to clipboard!');
  };

  const handleBackToSpaces = () => {
    navigate('/space-settings');
  };


  
  const ActiveSidebar =
    user?.role === "professor" ? ProfSidebar : Sidebar;


  if (!currentSpace) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: isDarkMode ? '#161A20' : '#ffffff', color: currentColors.text }}>
        <div className="hidden lg:block">
          <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Space Not Found</h2>
            <p style={{ color: currentColors.textSecondary }} className="mb-4">The space you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={handleBackToSpaces}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Spaces
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10 pt-20 lg:pt-10 relative">
          {/* Back Button - Mobile/Tablet Only */}
          <div className="absolute top-4 left-4 z-20 lg:hidden">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-sm font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
             ← Back
            </button>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Desktop Header */}
            <div className="hidden lg:block px-10 pt-10">
              <h1 className="text-4xl font-bold text-center mb-2">
                Space Settings
              </h1>
              <p style={{ color: currentColors.textSecondary }} className="mb-8 text-center">
                Configure your learning space preferences and permissions
              </p>
            </div> 
                        {/* Back Button - Desktop */}
            <div className="hidden lg:block mb-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-transparent border-none p-2 text-sm font-medium transition-colors"
                style={{ color: currentColors.textSecondary }}
              >
               ← Back
              </button>
            </div>
              <div className="rounded-lg p-4 inline-block mb-2" style={{ backgroundColor: currentColors.surface }}>
                <h2 className="text-lg font-semibold" style={{ color: '#3b82f6' }}>{currentSpace.space_name}</h2>
                <p className="text-sm" style={{ color: currentColors.textSecondary }}>{currentSpace.members?.length || 0} members</p>
              </div>



            {/* SPACE SETTINGS FORM */}
            <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: currentColors.surface }}>
              {/* Basic Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <SettingsIcon size={20} className="mr-2" />
                  Basic Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Space Name</label>
                    <input
                      type="text"
                      value={spaceSettings.spaceName}
                      onChange={(e) => handleSettingChange('spaceName', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      style={{
                        backgroundColor: currentColors.input,
                        borderColor: currentColors.border,
                        color: currentColors.text
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Space Description</label>
                    <textarea
                      value={spaceSettings.spaceDescription}
                      onChange={(e) => handleSettingChange('spaceDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      style={{
                        backgroundColor: currentColors.input,
                        borderColor: currentColors.border,
                        color: currentColors.text
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Space Code */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <Link size={20} className="mr-2" />
                  Space Code
                </h2>
                
                <div className="rounded-lg p-4" style={{ backgroundColor: currentColors.input }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Share this code with others to join your space:</p>
                      <p className="text-sm font-mono" style={{ color: '#3b82f6' }}>{getSpaceLink()}</p>
                    </div>
                    <button
                      onClick={copySpaceLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <Users size={20} className="mr-2" />
                  Members ({currentSpace.members?.length || 0})
                </h2>
                
                <div className="space-y-3">
                  {currentSpace.members?.map((member) => (
                    <div
                      key={member.account_id}
                      className="rounded-lg p-4 flex items-center justify-between"
                      style={{
                        backgroundColor: currentColors.input
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium" style={{ color: currentColors.text }}>{member.full_name}</h4>
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                            {member.role} • {member.course} • {member.year_level}
                          </p>
                        </div>
                      </div>
                      
                      {member.role !== "Professor" && member.account_id !== user?.account_id && (
                        <button
                          onClick={() => handleKickMember(member.account_id, member.full_name)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: '#ef4444'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Remove member"
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Settings
                </button>
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

export default IndividualSpaceSettings;
