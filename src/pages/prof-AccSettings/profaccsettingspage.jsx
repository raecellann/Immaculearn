import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import { departmentOptions, genderOptions } from "../component/enumOptions";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const departmentFullName =
    departmentOptions.find(
      (dept) => dept.code === user?.department
    )?.name || '';
  
  const genderFullName =
  genderOptions.find(
    (gender) => gender.code === user?.gender
  )?.name || '';

  const getCurrentSchoolYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const schoolYear = getCurrentSchoolYear();

  const profileName = user?.name || '';

  useEffect(() => {
    if (user?.profile_pic) {
      setProfileImage(user.profile_pic);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return navigate('/login')
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ MOBILE / TABLET HEADER */}
        <div
          className="
            lg:hidden
            sticky top-0 z-30
            px-4
            pt-[env(safe-area-inset-top)]
            border-b
          "
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text
          }}
        >
          <div className="flex items-center h-14">
            {/* Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-2xl bg-transparent p-0 border-none focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent", color: currentColors.text }}
            >
              ☰
            </button>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold">Your Profile</h1>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-10 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">

            {/* Title (Laptop & Desktop only) */}
            <div className="hidden lg:block mb-8 text-center">
          <h1 className="text-4xl font-bold text-center mb-2">
            Your Profile
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            View and edit all your information here
          </p>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-6">
              {/* Profile Card */}
              <div className="rounded-2xl p-3 sm:p-4 lg:p-6 w-full xl:w-72 2xl:w-80 mx-auto xl:mx-0 text-center shadow-lg border h-fit" style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border
              }}>
                
                <div
                  className="mt-4 cursor-pointer group"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-36 h-36 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-36 h-36 mx-auto rounded-xl border-4 border-dashed flex items-center justify-center text-sm group-hover:text-white transition" style={{
                      borderColor: '#3A7BFF',
                      color: currentColors.textSecondary
                    }}>
                      Upload Image
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-4" style={{ color: currentColors.text }}>{profileName}</h2>
                <p className="mt-1 text-sm font-medium" style={{ color: '#3A7BFF' }}>
                  {user?.role || 'Professor'}
                </p>
              </div>

              {/* Personal Details */}
              <div className="rounded-2xl flex-1 p-3 sm:p-4 lg:p-6 border shadow-lg" style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border
              }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>First Name</label>
                      <input
                        type="text"
                        value={(user?.name?.split(' ')[0] || '')}
                        placeholder="First Name"
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>Last Name</label>
                      <input
                        type="text"
                        value={(user?.name?.split(' ')[1] || '')}
                        placeholder="Last Name"
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>Department</label>
                      <input
                        type="text"                        
                        value={departmentFullName}
                        placeholder="Department"
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>School Year (SY)</label>
                      <input
                        type="text"
                        value={schoolYear}
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text,
                          opacity: 0.6
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>Automatically calculated</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>Google Mail</label>
                      <input
                        type="email"
                        value={(user?.email || '')}
                        placeholder="your.email@gmail.com"
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: currentColors.textSecondary }}>Gender</label>
                      <input
                        type="text"
                        
                        value={genderFullName}
                        placeholder="Gender"
                        readOnly
                        className="p-1.5 sm:p-2 rounded-md border outline-none text-sm w-full"
                        style={{
                          backgroundColor: isDarkMode ? '#2A2E36' : '#f8fafc',
                          borderColor: currentColors.border,
                          color: currentColors.text
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfProfilePage;
