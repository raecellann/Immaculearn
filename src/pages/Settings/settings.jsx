import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";

const SettingsPage = () => {
  const [activeAccount, setActiveAccount] = useState("Raecell Ann");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const accounts = [
    {
      name: "Raecell Ann Galvez",
      status: "Signed In",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990458/55516289_871534966513522_1623869577760866304_n_wh48kr.jpg",
    },
    {
      name: "Zeldrick Jesus Delos Santos",
      status: "",
      avatar:
        "https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg",
    },
  ];

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
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
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
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-10 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-5xl">

            {/* Title (Laptop & Desktop only) */}
            <h1 className="hidden lg:block text-4xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
              Settings
            </h1>
            <p className="text-gray-300 mb-6 lg:mb-10 text-center text-sm lg:text-base">
              Manage your profile, account preferences, and other options below.
            </p>

            {/* Profile Account */}
            <div className="bg-[#1E222A] rounded-2xl p-4 lg:p-6 mb-8 lg:mb-10 border border-white shadow-lg">
              <h2 className="text-lg lg:text-xl font-bold mb-4">
                Profile Account
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                <button className="px-4 py-2 bg-transparent rounded-lg border border-white text-white hover:bg-[#3A7BFF] hover:border-[#3A7BFF] transition-all">
                  Edit Profile
                </button>

                <button className="px-4 py-2 bg-transparent text-red-400 border border-red-500 rounded-lg hover:bg-red-600 hover:text-white hover:border-transparent transition-all">
                  Delete Account
                </button>
              </div>
            </div>

            {/* Switch Account */}
            <div className="bg-[#1E222A] rounded-2xl p-4 lg:p-6 border border-white shadow-lg">
              <h2 className="text-lg lg:text-xl font-bold mb-4">
                Switch Account
              </h2>

              <div className="space-y-4">
                {accounts.map((acc) => (
                  <div
                    key={acc.name}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-semibold">{acc.name}</p>
                        <p className="text-gray-400 text-xs">
                          {acc.status}
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
                      <span className="text-green-400 text-sm font-medium">
                        Active
                      </span>
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

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default SettingsPage;