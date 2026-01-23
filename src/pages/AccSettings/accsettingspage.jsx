import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../component/sidebar";
import { useUser } from "../../contexts/user/useUser";
import Logout from "../component/logout";

const ProfilePage = () => {
  const { user } = useUser();
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const profileName = user && user.name; // fixed name

  // Upload profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

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

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white leading-[1.2] font-semibold">

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
        <div className="flex-1 p-4 lg:p-6 xl:p-10 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">

            {/* Title (Laptop & Desktop only) */}
            <div className="hidden lg:block mb-8 text-center">
              <h1 className="hidden lg:block text-4xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
                Your Profile
              </h1>
              <p className="text-gray-300">
                View and edit all your information here
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">

              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-4 lg:p-6 w-full xl:w-80 2xl:w-96 mx-auto xl:mx-0 text-center shadow-lg border border-white">
                <input
                  type="file"
                  id="upload-img"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div
                  className="mt-2 lg:mt-4 cursor-pointer group"
                  onClick={() =>
                    document.getElementById("upload-img").click()
                  }
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      Upload Image
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
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-4 lg:p-6 xl:p-8 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  <button className="text-xs bg-[#3A7BFF] px-3 py-2 rounded-md font-semibold hover:bg-[#5592ff] transition">
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={user && user.name}
                    placeholder="First Name"
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
                  />
                  <input
                    type="text"
                    value={user && user.name}
                    placeholder="Last Name"
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
                  />
                </div>

                <textarea
                  placeholder="If coding is for everyone, then I'm not everyone."
                  className="bg-[#2A2E36] p-3 rounded-md w-full h-24 border border-white outline-none resize-none text-white"
                />
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
