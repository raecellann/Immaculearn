import React, { useState } from "react";
import Sidebar from "../component/sidebar";

const ProfilePage = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const profileName = "Zeldrick Jesus"; // fixed name

  // Upload profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex font-grotesque min-h-screen bg-[#161A20] text-white leading-[1.2] font-semibold">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 md:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#1E222A] p-4 border-b border-gray-700 flex items-center gap-4">
          {/* Hamburger Button (NO white background) */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Your Profile</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">
            {/* Title (Desktop only) */}
            <div className="hidden md:block mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Profile</h1>
              <p className="text-gray-300">
                View and edit all your information here
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-4 md:p-6 w-full lg:w-80 xl:w-96 mx-auto lg:mx-0 text-center shadow-lg border border-white">
                <input
                  type="file"
                  id="upload-img"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div
                  className="mt-2 md:mt-4 cursor-pointer group"
                  onClick={() =>
                    document.getElementById("upload-img").click()
                  }
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      Upload Image
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-3 md:mt-4">
                  {profileName}
                </h2>
                <p className="text-[#3A7BFF] mt-1 text-sm font-medium">
                  Student
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-4 md:p-6 lg:p-8 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  <button className="text-xs bg-[#3A7BFF] px-3 py-2 rounded-md font-semibold hover:bg-[#5592ff] transition">
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="sm:col-span-2 bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
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
    </div>
  );
};

export default ProfilePage;
