import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { Menu, Bell, Lock, Globe, Users, FileText, Settings as SettingsIcon } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import Logout from "../component/logout";

const SpaceSettingsPage = () => {
  const { user } = useUser();
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

  const [spaceSettings, setSpaceSettings] = useState({
    spaceName: "My Learning Space",
    spaceDescription: "A collaborative learning environment",
    allowGuestAccess: false,
    requireApproval: true,
    maxMembers: 50,
    enableNotifications: true,
    enableFileSharing: true,
    enableChat: true,
    defaultLanguage: "English",
    timezone: "Asia/Manila",
    theme: "light",
  });

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
          <div className="max-w-4xl mx-auto">
            {/* PAGE HEADER */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Space Settings</h1>
              <p className="text-gray-400">Configure your learning space preferences and permissions</p>
            </div>

            {/* SPACE SETTINGS FORM */}
            <div className="bg-[#1E242E] rounded-xl p-6 sm:p-8">
              {/* General Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <SettingsIcon size={20} className="mr-2" />
                  General Settings
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Default Language</label>
                      <select
                        value={spaceSettings.defaultLanguage}
                        onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                        className="w-full px-4 py-2 bg-[#2E3440] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      >
                        <option value="English">English</option>
                        <option value="Filipino">Filipino</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Timezone</label>
                      <select
                        value={spaceSettings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="w-full px-4 py-2 bg-[#2E3440] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      >
                        <option value="Asia/Manila">Asia/Manila</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <Lock size={20} className="mr-2" />
                  Access Control
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Allow Guest Access</label>
                      <p className="text-xs text-gray-400">Allow users to join without invitation</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('allowGuestAccess', !spaceSettings.allowGuestAccess)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spaceSettings.allowGuestAccess ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spaceSettings.allowGuestAccess ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Require Approval</label>
                      <p className="text-xs text-gray-400">Admin approval required for new members</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('requireApproval', !spaceSettings.requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spaceSettings.requireApproval ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spaceSettings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Members</label>
                    <input
                      type="number"
                      value={spaceSettings.maxMembers}
                      onChange={(e) => handleSettingChange('maxMembers', parseInt(e.target.value))}
                      min="1"
                      max="1000"
                      className="w-full px-4 py-2 bg-[#2E3440] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <FileText size={20} className="mr-2" />
                  Features
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Notifications</label>
                      <p className="text-xs text-gray-400">Send notifications for space activities</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('enableNotifications', !spaceSettings.enableNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spaceSettings.enableNotifications ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spaceSettings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable File Sharing</label>
                      <p className="text-xs text-gray-400">Allow members to share files</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('enableFileSharing', !spaceSettings.enableFileSharing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spaceSettings.enableFileSharing ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spaceSettings.enableFileSharing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Chat</label>
                      <p className="text-xs text-gray-400">Allow real-time communication</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('enableChat', !spaceSettings.enableChat)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        spaceSettings.enableChat ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          spaceSettings.enableChat ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
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

export default SpaceSettingsPage;
