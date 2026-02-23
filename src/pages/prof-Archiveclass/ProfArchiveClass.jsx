import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { Archive, MoreVertical } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import Logout from "../component/logout";
import { SpaceCover } from "../component/spaceCover";

const ProfArchiveClass = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [yearFilter, setYearFilter] = useState("All");

  // Sticky header state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Mock archived classes data - ready for backend integration
  const [archivedClasses] = useState([
    {
      id: 1,
      space_id: 1,
      space_uuid: "abc-123",
      space_name: "Advanced Mathematics 101",
      space_cover: null,
      space_yr_lvl: 1,
      archivedDate: "2024-01-15",
      members: Array(26).fill(null),
      description: "Calculus and linear algebra fundamentals",
    },
    {
      id: 2,
      space_id: 2,
      space_uuid: "def-456",
      space_name: "Physics for Engineers",
      space_cover: null,
      space_yr_lvl: 2,
      archivedDate: "2024-02-20",
      members: Array(31).fill(null),
      description: "Classical mechanics and thermodynamics",
    },
  ]);

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

  // Filter archived classes by year level
  const filterByYear = (spaces, filter) => {
    if (!spaces || filter === "All") return spaces;
    return spaces.filter((space) => space.space_yr_lvl === parseInt(filter));
  };

  const handleRestoreClass = (classId) => {
    // TODO: Add API call to restore class
    console.log("Restore class:", classId);
    setShowRestoreConfirm(null);
    setShowMenu(null);
  };

  const handleDeleteClass = (classId) => {
    // TODO: Add API call to permanently delete class
    console.log("Permanently delete class:", classId);
    setShowDeleteConfirm(null);
    setShowMenu(null);
  };

  const filteredClasses = filterByYear(archivedClasses, yearFilter);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* 🔹 STICKY MOBILE / TABLET HEADER */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457] px-4 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center h-14 pt-[env(safe-area-inset-top)] gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">Archived Classes</h1>
          </div>
        </div>

        {/* 🔹 Spacer */}
        <div className="lg:hidden h-16" />

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Desktop Title */}
          <div className="hidden md:flex justify-center mb-8">
            <h1 className="text-4xl font-bold">Archived Classes</h1>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-10 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  Archived Course Space
                </h2>
                <p className="text-gray-300 text-sm">
                  View and manage your archived classes.
                </p>
                <p className="text-gray-300 text-sm">
                  Restore classes when needed or keep them for your records.
                </p>
              </div>
              <div className="flex md:justify-end">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {archivedClasses.length}
                  </p>
                  <p className="text-sm text-gray-300">
                    {archivedClasses.length === 1
                      ? "Class Archived"
                      : "Classes Archived"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Spaces Section */}
          <div>
            <div className="mb-4 flex flex-col gap-3">
              <h2 className="text-2xl font-bold">Course Spaces</h2>

              <div className="flex flex-wrap items-start gap-2 sm:gap-3 justify-end">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                    Year Level:
                  </span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="bg-[#1E242E] border border-[#3B4457] text-xs sm:text-sm text-white rounded-md px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  >
                    <option value="All">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedClasses.length > 0 ? (
                filteredClasses?.length > 0 ? (
                  filteredClasses.map((space) => (
                    <div
                      key={space.space_id}
                      className="group bg-[#1E242E] rounded-xl overflow-hidden border border-[#3B4457] hover:shadow-lg transition cursor-pointer relative"
                    >
                      <div className="cursor-pointer">
                        <div className="relative h-40 bg-gray-800 overflow-hidden">
                          <SpaceCover
                            image={space.space_cover}
                            name={space.space_name}
                            className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white text-sm">
                            {space.space_name}
                          </h3>
                          <p className="text-gray-400 text-xs mt-1">
                            {space.members?.length - 1 || 0} Students
                          </p>
                        </div>
                      </div>

                      {/* Three dots menu */}
                      <div className="absolute top-2 right-2 menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(
                              showMenu === space.space_id
                                ? null
                                : space.space_id
                            );
                          }}
                          className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu === space.space_id && (
                          <div className="absolute top-8 right-0 bg-[#2C3038] border border-[#3B4457] rounded-lg shadow-lg z-10 min-w-[160px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRestoreConfirm(space.space_id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-[#60A5FA] hover:bg-[#3B4457] rounded-t-lg"
                            >
                              Restore Space
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(space.space_id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-b-lg border-t border-[#3B4457]"
                            >
                              Delete Permanently
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                    No archived classes found for{" "}
                    {yearFilter === "All"
                      ? "any year level"
                      : `${yearFilter}${
                          yearFilter === "1"
                            ? "st"
                            : yearFilter === "2"
                            ? "nd"
                            : yearFilter === "3"
                            ? "rd"
                            : "th"
                        } year`}
                  </div>
                )
              ) : (
                // Empty State
                <div className="col-span-full flex flex-col items-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E222A] rounded-full mb-4">
                    <Archive size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    No archived classes yet
                  </h3>
                  <p className="text-gray-400 max-w-md text-center">
                    When you archive classes, they will appear here. You can
                    restore them anytime or keep them for your records.
                  </p>
                  <button
                    onClick={() => navigate("/prof/spaces")}
                    className="mt-6 px-4 py-2 bg-[#60A5FA] text-white rounded-lg hover:bg-[#3B82F6] transition-colors"
                  >
                    Go to Active Classes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Restore Confirmation Dialog */}
          {showRestoreConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
              <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm w-full border border-[#3B4457]">
                <h3 className="text-lg font-semibold mb-3">Restore Space</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to restore this space? It will be moved
                  back to your active Course Spaces and be visible to students
                  again.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRestoreConfirm(null);
                      setShowMenu(null);
                    }}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRestoreClass(showRestoreConfirm)}
                    className="px-5 py-2 rounded-lg bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-sm"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Permanently Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
              <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm w-full border border-[#3B4457]">
                <h3 className="text-lg font-semibold mb-3 text-red-400">
                  Delete Permanently
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to permanently delete this space? This
                  action{" "}
                  <span className="text-red-400 font-medium">
                    cannot be undone
                  </span>{" "}
                  and all data including activities, files, and student records
                  will be lost forever.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(null);
                      setShowMenu(null);
                    }}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteClass(showDeleteConfirm)}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogout && (
        <Logout
          onClose={() => setShowLogout(false)}
          onLogOut={() => user?.id}
        />
      )}
    </div>
  );
};

export default ProfArchiveClass;