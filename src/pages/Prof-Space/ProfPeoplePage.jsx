import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiMenu, FiX, FiChevronLeft } from "react-icons/fi";

const ProfPeoplePage = () => {
  const navigate = useNavigate();

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // Admin info
  const admin = {
    name: "Joseph Bernard Reyes",
    src: "/src/assets/HomePage/jober.jpg",
  };

  // Members with individual profile pictures
  const initialMembers = [
    { name: "Zeldrick Jesus Delos Santos", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg" },
    { name: "Raecell Ann Galvez", src: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg" },
    { name: "Nathaniel Faborada", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg" },
    { name: "Wilson Esmobe", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990149/wilson_gjdkdm.jpg" },
  ];

  const [members] = useState(initialMembers);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <ProfSidebar />
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
          <h1 className="text-xl font-bold">CS Thesis 2 Space</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= TITLE + BACK ================= */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold underline underline-offset-4">
                People – CS Thesis 2 Space
              </h1>

              <button
                onClick={() => navigate(-1)}
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
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Admin</h2>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={admin.src}
                    alt={admin.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium">{admin.name}</span>
                </div>
              </div>
            </div>

            {/* MEMBERS */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Members</h2>
              <div className="border-t border-gray-700 pt-4 space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={member.src}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm sm:text-base">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfPeoplePage;
