import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiMenu, FiX, FiChevronLeft } from "react-icons/fi";
import Logout from "../component/logout";
import DeleteButton from "../component/DeleteButton";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfPeoplePage = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { space_uuid } = useParams();

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
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
      <div className="flex items-center justify-center min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
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

  // Check if current user is the creator/owner of the space
  const isOwner = creator.account_id === user.id;

  console.log(activeSpace)

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveWarning(true);
  };
  
  const confirmRemoveMember = () => {
    // TODO: Implement actual remove member API call
    console.log(`Removing member: ${memberToRemove.full_name}`);
    setShowRemoveWarning(false);
    setMemberToRemove(null);
  };
  
  const cancelRemoveMember = () => {
    setShowRemoveWarning(false);
    setMemberToRemove(null);
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">People – {activeSpace.space_name}</h1>
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
              className="flex items-center gap-2 transition"
              style={{ color: currentColors.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.color = currentColors.text;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = currentColors.textSecondary;
              }}
            >
              <FiChevronLeft />
              Back
            </button>
          </div>

          {/* CREATOR / ADMIN SECTION */}
          {creator && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Adviser</h2>
              <div className="border-t pt-4" style={{ borderColor: currentColors.border }}>
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
            <div className="border-t pt-4 space-y-4" style={{ borderColor: currentColors.border }}>
              {otherMembers.length > 0 ? (
                otherMembers.map((member) => (
                  <div key={member.account_id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={member.profile_pic || "/src/assets/default-avatar.jpg"}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{member.account_id !== user.id ? member.full_name : "You"}</span>
                    </div>
                    {isOwner && member.account_id !== user.id && (
                      <DeleteButton onClick={() => handleRemoveMember(member)} />
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: currentColors.textSecondary }}>No members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      
      {/* REMOVE MEMBER WARNING MODAL */}
      {showRemoveWarning && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: currentColors.surface }}>
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to remove <span className="font-medium" style={{ color: currentColors.text }}>{memberToRemove.full_name}</span> from this space? 
              They will lose access to all content and resources in this space.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRemoveMember}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfPeoplePage;