import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import { departmentOptions, genderOptions } from "../component/enumOptions";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import Logout from "../component/logout";

const ProfProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // 🔹 ADDED: hide-on-scroll header
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(null);
  
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

  // 🔹 ADDED: hide-on-scroll header
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

  useEffect(() => {
    if (!isAuthenticated) return navigate('/login')
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex font-grotesque min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Your Profile</h1>
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
            View your information here
          </p>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-6">
              {/* Profile Card */}
              <div className="rounded-2xl p-3 sm:p-4 lg:p-6 w-full xl:w-72 2xl:w-80 mx-auto xl:mx-0 text-center shadow-lg border h-fit" style={{
                backgroundColor: currentColors.surface,
                borderColor: isDarkMode ? 'white' : currentColors.border
              }}>
                
                <div
                  className="mt-2 lg:mt-4 cursor-pointer group relative"
                >
                  {profileImage ? (
                    <div className="relative inline-block">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                      />
                      
                    </div>
                  ) : (
                    <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-sm group-hover:text-white transition" style={{
                      color: currentColors.textSecondary
                    }}>
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xs">Upload Image</p>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-3 lg:mt-4" style={{ color: currentColors.text }}>{profileName}</h2>
                <p className="mt-1 text-sm font-medium" style={{ color: '#3A7BFF' }}>
                  {user?.role || 'Professor'}
                </p>
              </div>

              {/* Personal Details */}
              <div className="rounded-2xl flex-1 p-3 sm:p-4 lg:p-6 border shadow-lg" style={{
                backgroundColor: currentColors.surface,
                borderColor: isDarkMode ? 'white' : currentColors.border
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

      
      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfProfilePage;
