import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import Logout from "../component/logout";
import Button from "../component/Button";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { prefixName } from "../../utils/prefixNameFormat";
import { SpaceCover } from "../component/spaceCover";

const SpacePage = () => {
  const { user } = useUser();
  const { userSpaces, friendSpaces, courseSpaces, joinSpace } = useSpace();

  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide-on-scroll header
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(".menu-container")) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Join Space Functionality (from sample)
  const handleJoinRequestSubmit = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid join code");
      return;
    }

    setLoading(true);

    try {
      const result = await joinSpace(joinCode);

      if (result.success) {
        alert("Successfully joined the space!");
        setJoinCode("");
      } else {
        alert(result.message || "Failed to join space");
      }
    } catch (error) {
      console.error("Error joining space:", error);
      alert(error.message || "An error occurred while joining the space");
    } finally {
      setLoading(false);
    }
  };

  // Filter shared spaces (same logic as sample)
  const allSpaces = new Set([
    ...(userSpaces || []).map((space) => space.space_uuid),
    ...(courseSpaces || []).map((space) => space.space_uuid),
  ]);

  const sharedSpaces = (friendSpaces || []).filter(
    (space) =>
      !allSpaces.has(space.space_uuid) &&
      space.members?.some((member) => member.account_id === user?.id),
  );

  // Course Spaces Data (from homepage logic)
  // const courseSpaces = courseSpaces?.filter((s) => !allSpaces.has(s.space_uuid));

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
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
          <h1 className="text-xl font-bold">Spaces</h1>
        </div>

        <div className="lg:hidden h-16"></div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="hidden md:flex items-center justify-center mb-8">
            <h1 className="text-4xl font-bold">Spaces</h1>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-8 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  Good Morning, {user && user.name}
                </h2>
                <p className="text-gray-300 text-sm mb-4">
                  Join space or create your own.
                </p>

                <Button onClick={() => navigate("/space/create")}>
                  Create Space
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Enter Code to Join Space
                </h3>
                <div className="bg-[#1E242E] rounded-lg p-4 border border-[#3B4457]">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter join code..."
                    className="w-full bg-transparent border-b border-[#3B4457] text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-[#0EA5E9]"
                  />

                  <div className="mt-6">
                    <Button
                      disabled={loading}
                      onClick={handleJoinRequestSubmit}
                    >
                      {loading ? "Joining..." : "Join Space"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YOUR SPACES - Dynamic */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Spaces</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userSpaces && userSpaces.length > 0 ? (
                userSpaces.map((space, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/space/${space?.space_uuid}/${space.space_name}`,
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="relative overflow-hidden h-40 bg-gray-800">
                        <SpaceCover
                          image={space.image}
                          name={space.space_name}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {capitalizeWords(space.space_name) + "'s Space"}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {space.members != null
                            ? `${space?.members?.length} Members`
                            : "No members"}
                        </p>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            showMenu === space.space_uuid
                              ? null
                              : space.space_uuid,
                          );
                        }}
                        className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMenu === space.space_uuid && (
                        <div className="absolute top-8 right-0 bg-[#2C3038] border border-[#3B4457] rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(space.space_uuid);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-t-lg"
                          >
                            Delete Space
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                  No spaces yet — create one to get started!
                </div>
              )}
            </div>
          </div>

          {/* Course Spaces - Dynamic Data */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Courses Spaces</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseSpaces && courseSpaces.length > 0 ? (
                courseSpaces.map((course, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    <div
                      onClick={() =>
                        navigate(
                          `/space/${course.space_uuid}/${encodeURIComponent(course.space_name)}`,
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="relative h-48 bg-gray-800">
                        <SpaceCover
                          image={course.background_img || course.image}
                          name={course.space_name}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm mb-1 truncate">
                          {capitalizeWords(course.space_name)}'s Space
                        </h3>
                        <p className="text-gray-400 text-xs mb-1">
                          {course.members
                            ?.filter((m) => m.role === "creator")
                            .map((m) => (
                              <span key={m.account_id}>
                                {m.account_id === user?.id
                                  ? `You`
                                  : `Prof. ${capitalizeWords(m.full_name?.split(" ")[0])}`}
                              </span>
                            ))}{" "}
                          •{" "}
                          {course.space_type === "course"
                            ? course.members?.length - 1
                            : course.members?.length || 0}{" "}
                          Students
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {course.space_day} (
                          {`${course.space_time_start} - ${course.space_time_end}`}
                          )
                        </p>
                        <p className="text-gray-500 text-xs mb-2">
                          Opened just now
                        </p>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            showMenu === course.space_uuid
                              ? null
                              : course.space_uuid,
                          );
                        }}
                        className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMenu === course.space_uuid && (
                        <div className="absolute top-8 right-0 bg-[#2C3038] border border-[#3B4457] rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLeaveConfirm(course.space_uuid);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-t-lg"
                          >
                            Leave Space
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                  No Course Space Yet!
                </div>
              )}
            </div>
          </div>

          {/* FRIENDS SPACES - Dynamic */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Friends Space</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedSpaces.length > 0 ? (
                sharedSpaces.map((space, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/space/${space?.space_uuid}/${space.space_name}`,
                        )
                      }
                      className="cursor-pointer"
                    >
                      <div className="relative h-40 bg-gray-800">
                        <SpaceCover
                          image={space.image}
                          name={space.space_name}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm mb-1 truncate">
                          {capitalizeWords(space.space_name) + "'s Space"}
                        </h3>
                        <p className="text-gray-400 text-xs mb-1">
                          {space.members != null
                            ? `${space?.members?.length} Members`
                            : "No members"}
                        </p>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            showMenu === space.space_uuid
                              ? null
                              : space.space_uuid,
                          );
                        }}
                        className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMenu === space.space_uuid && (
                        <div className="absolute top-8 right-0 bg-[#2C3038] border border-[#3B4457] rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLeaveConfirm(space.space_uuid);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-t-lg"
                          >
                            Leave Space
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                  No friends space found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm w-full border border-[#3B4457]">
              <h3 className="text-lg font-semibold mb-3">Delete Space</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this space? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: implement actual delete logic
                    console.log("Deleting:", showDeleteConfirm);
                    setShowDeleteConfirm(null);
                    setShowMenu(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Confirmation Modal */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm w-full border border-[#3B4457]">
              <h3 className="text-lg font-semibold mb-3">Leave Space</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to leave this space? You'll need to be
                re-invited to rejoin.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLeaveConfirm(null)}
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: implement actual leave logic
                    console.log("Leaving:", showLeaveConfirm);
                    setShowLeaveConfirm(null);
                    setShowMenu(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default SpacePage;
