import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { Menu, ArrowLeft, Users, Settings as SettingsIcon, Link, Trash2, UserX } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import Logout from "../component/logout";

const IndividualSpaceSettings = () => {
  const { user } = useUser();
  const { userSpaces } = useSpace();
  const { spaceUuid, spaceName } = useParams();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  if (!currentSpace) {
    return (
      <div className="flex min-h-screen bg-[#161A20] text-white">
        <div className="hidden lg:block">
          <Sidebar onLogoutClick={() => setShowLogout(true)} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Space Not Found</h2>
            <p className="text-gray-400 mb-4">The space you're looking for doesn't exist or you don't have access to it.</p>
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
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden">
        {/* MOBILE HEADER */}
        <div
          className={`sticky top-0 z-30 bg-[#1a73da] text-white p-4 flex items-center justify-between transition-transform duration-300 md:hidden ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-3"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={handleBackToSpaces}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-3"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">Space Settings</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* DESKTOP HEADER SPACER */}
        <div className="hidden md:block h-16" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* PAGE HEADER */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <button
                  onClick={handleBackToSpaces}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-3"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Space Settings</h1>
                  <p className="text-gray-400">Configure your learning space preferences and permissions</p>
                </div>
              </div>
              <div className="bg-[#1E242E] rounded-lg p-4 inline-block">
                <h2 className="text-lg font-semibold text-blue-400">{currentSpace.space_name}</h2>
                <p className="text-sm text-gray-400">{currentSpace.members?.length || 0} members</p>
              </div>
            </div>

            {/* SPACE SETTINGS FORM */}
            <div className="bg-[#1E242E] rounded-xl p-6 sm:p-8">
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
                      className="w-full px-4 py-2 bg-[#2E3440] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Space Description</label>
                    <textarea
                      value={spaceSettings.spaceDescription}
                      onChange={(e) => handleSettingChange('spaceDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-[#2E3440] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
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
                
                <div className="bg-[#2E3440] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-gray-400 mb-1">Share this code with others to join your space:</p>
                      <p className="text-sm text-blue-400 font-mono">{getSpaceLink()}</p>
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
                      className="bg-[#2E3440] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{member.full_name}</h4>
                          <p className="text-sm text-gray-400">
                            {member.role} • {member.course} • {member.year_level}
                          </p>
                        </div>
                      </div>
                      
                      {member.role !== "Professor" && member.account_id !== user?.account_id && (
                        <button
                          onClick={() => handleKickMember(member.account_id, member.full_name)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
