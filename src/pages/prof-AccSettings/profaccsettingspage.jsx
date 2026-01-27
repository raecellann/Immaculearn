import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import Logout from "../component/logout";

const ProfProfilePage = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const profileName = "Jober Reyes";

  const headerRef = useRef(null);
  const lastScroll = useRef(0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // 🔹 Hide-on-scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (headerRef.current) {
        if (currentScroll > lastScroll.current) {
          // scroll down → hide
          headerRef.current.style.transform = "translateY(-100%)";
        } else {
          // scroll up → show
          headerRef.current.style.transform = "translateY(0)";
        }
      }
      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ MOBILE / TABLET HEADER */}
        <div
          ref={headerRef}
          className="
            lg:hidden
            sticky top-0 z-30
            bg-[#1E222A]
            px-4
            pt-[env(safe-area-inset-top)]
            border-b border-[#3B4457]
            transition-transform duration-300
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
            <h1 className="ml-4 text-xl sm:text-2xl font-bold truncate">
              Your Profile
            </h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-10 pt-10">
          <h1 className="text-4xl font-bold text-center mb-6 lg:mb-10 font-grotesque">
            Your Profile
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            View and edit all your information here
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10">
          <div className="max-w-5xl mx-auto mt-6 lg:mt-10">
            <div className="flex flex-col lg:flex-row gap-8 justify-center">
              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-6 w-full sm:w-80 text-center shadow-lg border border-white mx-auto lg:mx-0">
                <input
                  type="file"
                  id="upload-img"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div
                  className="mt-4 cursor-pointer group"
                  onClick={() =>
                    document.getElementById("upload-img").click()
                  }
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
                  Teacher
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-6 sm:p-8 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  <Button className="text-xs px-3 py-1">Edit Profile</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="bg-[#2A2E36] p-2 rounded-md outline-none text-white border border-white"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-[#2A2E36] p-2 rounded-md outline-none text-white border border-white"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="bg-[#2A2E36] p-2 rounded-md col-span-1 sm:col-span-2 outline-none text-white border border-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="gender"
                      className="accent-[#3A7BFF]"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="gender"
                      defaultChecked
                      className="accent-[#3A7BFF]"
                    />
                    Female
                  </label>
                </div>

                <textarea
                  placeholder='“ A good teacher can inspire hope, ignite the imagination, and instill a love of learning. ”'
                  className="bg-[#2A2E36] p-3 rounded-md w-full h-24 outline-none text-white resize-none border border-white"
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

export default ProfProfilePage;
