import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import ProfSidebar from "../component/profsidebar";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import Logout from "../component/logout";

const IndividualSpaceSettings = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces, updateSpace } = useSpace();
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

  // Find the current space from userSpaces or courseSpaces
  const currentSpace =
    userSpaces?.find((space) => space.space_uuid === spaceUuid) ||
    courseSpaces?.find((space) => space.space_uuid === spaceUuid);

  // Determine if this is a course space
  const isCourseSpace = courseSpaces?.some(
    (space) => space.space_uuid === spaceUuid,
  );

  const [spaceSettings, setSpaceSettings] = useState({
    spaceName: currentSpace?.space_name || "",
    spaceDescription:
      currentSpace?.space_description || currentSpace?.description || "",
    spaceDay: currentSpace?.space_day || "",
    spaceTimeStart: currentSpace?.space_time_start || "",
    spaceTimeEnd: currentSpace?.space_time_end || "",
    spaceYearLevel: currentSpace?.space_yr_lvl || "",
  });

  // Update settings when current space changes
  useEffect(() => {
    if (currentSpace) {
      setSpaceSettings((prev) => ({
        ...prev,
        spaceName: currentSpace.space_name,
        spaceDescription:
          currentSpace.space_description || currentSpace.description || "",
        spaceDay: currentSpace.space_day || "",
        spaceTimeStart: currentSpace.space_time_start || "",
        spaceTimeEnd: currentSpace.space_time_end || "",
        spaceYearLevel: currentSpace.space_yr_lvl || "",
      }));
    }
  }, [currentSpace]);

  const handleSettingChange = (field, value) => {
    setSpaceSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Prepare the data object based on space type
      let updateData;

      if (isCourseSpace) {
        updateData = {
          space_name: spaceSettings.spaceName,
          space_description: spaceSettings.spaceDescription,
          space_day: spaceSettings.spaceDay,
          space_time_start: spaceSettings.spaceTimeStart,
          space_time_end: spaceSettings.spaceTimeEnd,
          space_yr_lvl: spaceSettings.spaceYearLevel,
        };
      } else {
        updateData = {
          space_name: spaceSettings.spaceName,
          space_description: spaceSettings.spaceDescription,
        };
      }

      const result = await updateSpace(spaceUuid, updateData);

      alert("Space settings saved successfully!");
    } catch (error) {
      console.error("Error saving space settings:", error);
      alert("Failed to save space settings. Please try again.");
    }
  };

  const handleBackToSpaces = () => {
    navigate("/space-settings");
  };

  const ActiveSidebar = user?.role === "professor" ? ProfSidebar : Sidebar;

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!currentSpace) {
    return (
      <div
        className="flex min-h-screen"
        style={{
          backgroundColor: isDarkMode ? "#161A20" : "#ffffff",
          color: currentColors.text,
        }}
      >
        <div className="hidden lg:block">
          <ActiveSidebar onLogoutClick={() => setShowLogout(true)} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Space Not Found</h2>
            <p style={{ color: currentColors.textSecondary }} className="mb-4">
              The space you're looking for doesn't exist or you don't have
              access to it.
            </p>
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
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : "#ffffff",
        color: currentColors.text,
      }}
    >
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
          color: currentColors.text,
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
            color: currentColors.text,
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
              <p
                style={{ color: currentColors.textSecondary }}
                className="mb-8 text-center"
              >
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
            <div
              className="rounded-lg p-4 inline-block mb-2"
              style={{ backgroundColor: currentColors.surface }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: "#3b82f6" }}
              >
                {currentSpace.space_name}
              </h2>
              <p
                className="text-sm"
                style={{ color: currentColors.textSecondary }}
              >
                {currentSpace.space_name}
              </p>
            </div>

            {/* SPACE SETTINGS FORM */}
            <div
              className="rounded-xl p-6 sm:p-8"
              style={{ backgroundColor: currentColors.surface }}
            >
              {/* Basic Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                  <SettingsIcon size={20} className="mr-2" />
                  Basic Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Space Name
                    </label>
                    <input
                      type="text"
                      value={spaceSettings.spaceName}
                      onChange={(e) =>
                        handleSettingChange("spaceName", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      style={{
                        backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                        borderColor: currentColors.border,
                        color: currentColors.text,
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Space Description
                    </label>
                    <textarea
                      value={spaceSettings.spaceDescription}
                      onChange={(e) =>
                        handleSettingChange("spaceDescription", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      style={{
                        backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                        borderColor: currentColors.border,
                        color: currentColors.text,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Course Settings - Only for course spaces and professors */}
              {isCourseSpace && user?.role === "professor" && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <SettingsIcon size={20} className="mr-2" />
                    Course Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Course Day
                        </label>
                        <select
                          value={spaceSettings.spaceDay}
                          onChange={(e) =>
                            handleSettingChange("spaceDay", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          style={{
                            backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                            borderColor: currentColors.border,
                            color: currentColors.text,
                          }}
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Year Level
                        </label>
                        <select
                          value={spaceSettings.spaceYearLevel}
                          onChange={(e) =>
                            handleSettingChange(
                              "spaceYearLevel",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          style={{
                            backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                            borderColor: currentColors.border,
                            color: currentColors.text,
                          }}
                        >
                          <option value="">Select Year Level</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                          <option value="5">5th Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={spaceSettings.spaceTimeStart}
                          onChange={(e) =>
                            handleSettingChange(
                              "spaceTimeStart",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          style={{
                            backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                            borderColor: currentColors.border,
                            color: currentColors.text,
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={spaceSettings.spaceTimeEnd}
                          onChange={(e) =>
                            handleSettingChange("spaceTimeEnd", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                          style={{
                            backgroundColor: isDarkMode ? "#2A3142" : "#ffffff",
                            borderColor: currentColors.border,
                            color: currentColors.text,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Course Info Display - Only for course spaces and students */}
              {isCourseSpace && user?.role !== "professor" && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <SettingsIcon size={20} className="mr-2" />
                    Course Information
                  </h2>

                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentColors.input }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Course Day
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.text }}
                        >
                          {currentSpace?.space_day || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Schedule
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.text }}
                        >
                          {currentSpace?.space_time_start &&
                          currentSpace?.space_time_end
                            ? `${formatTime(currentSpace.space_time_start)} - ${formatTime(currentSpace.space_time_end)}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Year Level
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.text }}
                        >
                          {currentSpace?.space_yr_lvl
                            ? `${currentSpace.space_yr_lvl}th Year`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
