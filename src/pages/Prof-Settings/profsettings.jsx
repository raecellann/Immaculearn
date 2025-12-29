import React, { useState } from "react";
import Sidebar from "../component/profsidebar";

const ProfSettingsPage = () => {
  const [activeAccount, setActiveAccount] = useState("Jober Reyes");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const accounts = [
    {
      name: "Jober Reyes",
      status: "Signed In",
      role: "Professor",
      avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/jober_gp01iv.jpg",
    },
    {
      name: "Aldrich Bernardo",
      status: "",
      role: "Professor",
      avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766991223/sir_y8aru3.png",
    },
  ];

  return (
    <div className="flex font-grotesque min-h-screen bg-[#161A20] text-white">
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
            <h1 className="ml-4 text-lg font-bold truncate">Settings</h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-10 pt-10">
          <h1 className="text-4xl font-bold text-center mb-2">Settings</h1>
          <p className="text-gray-300 mb-8 text-center">
            Manage your professor profile, course settings, and account preferences.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10">
          <div className="max-w-5xl mx-auto mt-6 lg:mt-10">
            {/* Profile Account */}
            <div className="bg-[#1E222A] rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 border border-white shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Professor Profile</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <button className="px-4 py-2 bg-transparent rounded-lg border border-white text-white hover:bg-[#3A7BFF] hover:border-[#3A7BFF] transition-all">
                  Edit Professor Profile
                </button>
                <button className="px-4 py-2 bg-transparent text-red-400 border border-red-500 rounded-lg hover:bg-red-600 hover:text-white hover:border-transparent transition-all">
                  Delete Professor Account
                </button>
              </div>
            </div>

            {/* Switch Account Section */}
            <div className="bg-[#1E222A] rounded-2xl p-4 sm:p-6 border border-white shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Switch Professor Account</h2>
              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div
                    key={acc.name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt="avatar"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{acc.name}</p>
                        <p className="text-gray-400 text-xs">
                          {acc.role} {acc.status && `• ${acc.status}`}
                        </p>
                      </div>
                    </div>
                    {activeAccount !== acc.name ? (
                      <button
                        onClick={() => setActiveAccount(acc.name)}
                        className="px-3 py-1 bg-transparent border border-gray-400 text-gray-300 text-sm rounded-lg hover:bg-[#3A7BFF] hover:border-[#3A7BFF] hover:text-white transition-all self-start sm:self-auto"
                      >
                        Switch Account
                      </button>
                    ) : (
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    )}
                  </div>
                ))}
                {/* Add Account */}
                <button className="mt-2 flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-400 text-gray-300 rounded-lg hover:bg-[#3A7BFF] hover:border-[#3A7BFF] hover:text-white transition-all w-full justify-center">
                  <span className="text-2xl">+</span> Add Other Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfSettingsPage;
