import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiMenu, FiX, FiChevronLeft } from "react-icons/fi";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";

const ProfPeoplePage = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces } = useSpace();
  const navigate = useNavigate();
  const { space_uuid } = useParams();

  /* ================= HEADER + SIDEBAR ================= */
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

  // Combine user and friend spaces
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || [])];
  const activeSpace = allSpaces.find((s) => s.space_uuid === space_uuid);

  // Handle not found
  if (!activeSpace) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-[#161A20]">
        <p className="text-xl">Space not found.</p>
      </div>
    );
  }

  // Separate creator/admin and other members
  const creator = activeSpace.members.find((m) => m.role === "creator") || {
    account_id: user.id,
    full_name: "You",
    profile_pic: user.profile_pic,
    role: "creator"
  };
  const otherMembers = activeSpace.members.filter((m) => m.role !== "creator");

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
          <h1 className="text-xl font-bold">{activeSpace.space_name}</h1>
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


        {/* PAGE HEADER */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              People – {activeSpace.space_name}
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <FiChevronLeft />
              Back
            </button>
          </div>

          {/* CREATOR / ADMIN SECTION */}
          {creator && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Adviser</h2>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={creator.profile_pic || "/src/assets/default-avatar.jpg"}
                    alt={creator.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{creator.full_name}</span>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Students</h2>
            <div className="border-t border-gray-600 pt-4 space-y-4">
              {otherMembers.length > 0 ? (
                otherMembers.map((member) => (
                  <div key={member.account_id} className="flex items-center gap-4">
                    <img
                      src={member.profile_pic || "/src/assets/default-avatar.jpg"}
                      alt={member.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{member.account_id !== user.id ? member.full_name : "You"}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfPeoplePage;