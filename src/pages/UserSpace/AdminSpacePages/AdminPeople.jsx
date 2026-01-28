import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import { FiMenu, FiX, FiChevronLeft } from "react-icons/fi";

const AdminPeoplePage = () => {
  const navigate = useNavigate();

  /* ================= HEADER + SIDEBAR (MATCHED) ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
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
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE / TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457]
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <h1 className="text-xl font-bold">Admin Space</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            alt="cover"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= TITLE + BACK ================= */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold underline underline-offset-4">
                People – Admin Space
              </h1>


              <button
                onClick={() => navigate("/admin-stream")}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition bg-transparent"
              >
                <FiChevronLeft />
                Back
              </button>

            </div>
          </div>

          {/* ================= PEOPLE CONTENT ================= */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* ADMIN */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Admin</h2>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/src/assets/SpacePeoplePage/zj.jpg"
                    alt="Admin"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">
                    Zeldrick Jesus Delos Santos
                  </span>
                </div>
              </div>
            </div>

            {/* MEMBERS */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="border-t border-gray-700 pt-4 space-y-4">
                {[
                  {
                    name: "Raecell Ann Galvez",
                    img: "/src/assets/SpacePeoplePage/raecell.jpg",
                  },
                  {
                    name: "Nathaniel Fabordada",
                    img: "/src/assets/SpacePeoplePage/nath.jpg",
                  },
                  {
                    name: "Wilson Esmabe",
                    img: "/src/assets/SpacePeoplePage/wilson.jpg",
                  },
                ].map((member, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{member.name}</span>
                  </div>
                ))}
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

export default AdminPeoplePage;