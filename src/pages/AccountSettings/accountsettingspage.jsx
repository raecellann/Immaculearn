import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../component/sidebar";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import { departmentOptions, genderOptions } from "../component/enumOptions";

const ProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const departmentFullName =
  departmentOptions.find(
    (dept) => dept.code === user?.course
  )?.name || '';

  const genderFullName =
  genderOptions.find(
    (gender) => gender.code === user?.gender
  )?.name || '';


  // Calculate School Year (SY) based on current date
  const getCurrentSchoolYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // School year typically starts in June (month 5)
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

  useEffect(() => {
    if (!isAuthenticated) return navigate('/login')
  }, [isAuthenticated]);

  return (
    <div className="flex font-grotesque min-h-screen bg-[#161A20] text-white leading-[1.2] font-semibold">

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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">

        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-gray-700 flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
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
            View  your information here
          </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-6">

              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-3 sm:p-4 lg:p-6 w-full xl:w-72 2xl:w-80 mx-auto xl:mx-0 text-center shadow-lg border border-white h-fit">
                

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
                    <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xs">Upload Image</p>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-3 lg:mt-4">
                  {profileName}
                </h2>
                <p className="text-[#3A7BFF] mt-1 text-sm font-medium">
                  {user && user.role}
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-3 sm:p-4 lg:p-6 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={(user?.name?.split(' ')[0] || '')}
                        placeholder="First Name"
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={(user?.name?.split(' ')[1] || '')}
                        placeholder="Last Name"
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                      
                      <input
                        type="text"
                        
                        value={departmentFullName}
                        placeholder="Department"
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full text-sm"
                      />
                      

                    </div>
                  
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">School Year (SY)</label>
                      <input
                        type="text"
                        value={schoolYear}
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full opacity-60 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">Automatically calculated</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Google Mail</label>
                      <input
                        type="email"
                        value={(user?.email || '')}
                        placeholder="your.email@gmail.com"
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                      <input
                        type="text"
                        value={genderFullName}
                        readOnly
                        className="bg-[#2A2E36] p-1.5 sm:p-2 rounded-md border border-white outline-none text-white w-full text-sm"
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

export default ProfilePage;
