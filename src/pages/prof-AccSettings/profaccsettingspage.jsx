import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import { departmentOptions, genderOptions } from "../component/enumOptions";

const ProfProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
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
    <div className="flex min-h-screen bg-[#161A20] text-white font-grotesque">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
            bg-[#1E222A]
            px-4
            pt-[env(safe-area-inset-top)]
            border-b border-[#3B4457]
          "
        >
          <div className="flex items-center h-14">
            {/* Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-2xl bg-transparent p-0 border-none focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
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
              <div className="bg-[#1E222A] rounded-2xl p-3 sm:p-4 lg:p-6 w-full xl:w-72 2xl:w-80 mx-auto xl:mx-0 text-center shadow-lg border border-white h-fit">
                
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
                    <div className="w-36 h-36 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      Upload Image
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-4">{profileName}</h2>
                <p className="text-[#3A7BFF] mt-1 text-sm font-medium">
                  {user?.role || 'Professor'}
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
                        placeholder="Gender"
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
    </div>
  );
};

export default ProfProfilePage;
