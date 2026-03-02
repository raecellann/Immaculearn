import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { Archive, MoreVertical } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import Logout from "../component/logout";
import { SpaceCover } from "../component/spaceCover";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useSpace } from "../../contexts/space/useSpace";
import { toast } from "react-toastify";

const ProfArchiveClass = () => {
  const { user } = useUser();
  const { archivedSpaces, archivedSpacesLoading, setArchive } = useSpace();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

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

  // const handleRestoreClass = (classId) => {
  //   // TODO: Add API call to restore class
  //   console.log("Restore class:", classId);
  //   setShowRestoreConfirm(null);
  //   setShowMenu(null);
  // };

  const handleRestoreClass = async (space_uuid) => {
    // TODO: Add API call to archive space
    // console.log("Archive space:", space_uuid);
    try {
      await setArchive(space_uuid);
      toast.success("Successfully Archive ");
    } catch (err) {
      toast.error("Error for Archiving Course Space");
    }
    setShowRestoreConfirm(null);
    setShowMenu(null);
  };

  const handleDeleteClass = (classId) => {
    // TODO: Add API call to permanently delete class
    console.log("Permanently delete class:", classId);
    setShowDeleteConfirm(null);
    setShowMenu(null);
  };

  const filteredClasses = filterByYear(archivedSpaces, yearFilter);

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* 🔹 STICKY MOBILE / TABLET HEADER */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 px-4 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          } border-b`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: "#000000",
            color: currentColors.text,
          }}
        >
          <div className="flex items-center h-14 pt-[env(safe-area-inset-top)] gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0 focus:outline-none"
              style={{ color: currentColors.text }}
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
          <div className="hidden lg:flex justify-center mb-8">
            <h1 className="text-4xl font-bold">Archived Classes</h1>
          </div>

          {/* Welcome Section */}
          <div
            className="rounded-xl p-6 mb-10 border"
            style={{
              background: isDarkMode
                ? "linear-gradient(to right, #1e3a8a, #0f172a)"
                : "linear-gradient(to right, #3b82f6, #1e40af)",
              borderColor: currentColors.border,
            }}
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "#60A5FA" }}
                >
                  Archived Course Space
                </h2>
                <p className="text-sm" style={{ color: "#e2e8f0" }}>
                  View and manage your archived classes.
                </p>
                <p className="text-sm" style={{ color: "#e2e8f0" }}>
                  Restore classes when needed or keep them for your records.
                </p>
              </div>
              <div className="flex items-center gap-2 md:self-end">
                <p className="text-sm" style={{ color: "#e2e8f0" }}>
                  {archivedSpaces?.length === 1
                    ? "Class Archived"
                    : "Classes Archived"}
                </p>
                <p className="text-2xl font-bold text-white">
                  {archivedSpaces?.length}
                </p>
              </div>
            </div>
          </div>

          {/* Course Spaces Section */}
          <div>
            <div className="mb-4 flex flex-col gap-3">
              <h2 className="text-2xl font-bold">Course Spaces</h2>

              <div className="flex flex-wrap items-start gap-2 sm:gap-3 justify-end">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span
                    className="text-xs sm:text-sm whitespace-nowrap"
                    style={{ color: currentColors.text }}
                  >
                    Year Level:
                  </span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="text-xs sm:text-sm rounded-md px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-1 border"
                    style={{
                      backgroundColor: isDarkMode ? "#1e242e" : "#f1f5f9",
                      borderColor: currentColors.border,
                      color: isDarkMode ? "#ffffff" : "#1e293b",
                    }}
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
              {archivedSpaces.length > 0 ? (
                filteredClasses?.length > 0 ? (
                  filteredClasses.map((space) => (
                    <div
                      key={space.space_id}
                      className="group rounded-xl overflow-hidden border hover:shadow-lg transition cursor-pointer relative"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                    >
                      <div className="cursor-pointer">
                        <div
                          className="relative h-40 overflow-hidden"
                          style={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#6b7280",
                          }}
                        >
                          <SpaceCover
                            image={space.space_cover}
                            name={space.space_name}
                            className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3
                            className="font-semibold text-sm"
                            style={{ color: currentColors.text }}
                          >
                            {space.space_name}
                          </h3>
                          <p
                            className="text-xs mt-1"
                            style={{ color: currentColors.textSecondary }}
                          >
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
                                : space.space_id,
                            );
                          }}
                          className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu === space.space_id && (
                          <div
                            className="absolute top-8 right-0 rounded-lg shadow-lg z-10 min-w-[160px]"
                            style={{
                              backgroundColor: currentColors.surface,
                              borderColor: currentColors.border,
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRestoreConfirm(space.space_uuid);
                              }}
                              className="w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors border-t"
                              style={{
                                color: "#60A5FA",
                                backgroundColor: "transparent",
                                borderColor: isDarkMode
                                  ? "#3B4457"
                                  : currentColors.border,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#3B4457";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              Restore Space
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(space.space_id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm rounded-b-lg border-t transition-colors"
                              style={{
                                color: "#ef4444",
                                backgroundColor: "transparent",
                                borderColor: isDarkMode
                                  ? "#3B4457"
                                  : currentColors.border,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#3B4457";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              Delete Permanently
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="col-span-full p-4 rounded-lg border text-center"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                      color: currentColors.textSecondary,
                    }}
                  >
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
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{
                      backgroundColor: currentColors.surface,
                    }}
                  >
                    <Archive
                      size={32}
                      style={{ color: currentColors.textSecondary }}
                    />
                  </div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: currentColors.text }}
                  >
                    No archived classes yet
                  </h3>
                  <p
                    className="max-w-md text-center"
                    style={{ color: currentColors.textSecondary }}
                  >
                    When you archive classes, they will appear here. You can
                    restore them anytime or keep them for your records.
                  </p>
                  <button
                    onClick={() => navigate("/prof/spaces")}
                    className="mt-6 px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: "#60A5FA",
                      color: "white",
                    }}
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
              <div
                className="rounded-xl p-6 max-w-sm w-full border"
                style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: currentColors.text }}
                >
                  Restore Space
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: currentColors.textSecondary }}
                >
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
                    className="px-5 py-2 rounded-lg text-white text-sm transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? "#4b5563" : "#6b7280",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRestoreClass(showRestoreConfirm)}
                    className="px-5 py-2 rounded-lg text-white text-sm transition-colors"
                    style={{
                      backgroundColor: "#60A5FA",
                    }}
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
              <div
                className="rounded-xl p-6 max-w-sm w-full border"
                style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "#ef4444" }}
                >
                  Delete Permanently
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: currentColors.textSecondary }}
                >
                  Are you sure you want to permanently delete this space? This
                  action{" "}
                  <span className="font-medium" style={{ color: "#ef4444" }}>
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
                    className="px-5 py-2 rounded-lg text-white text-sm transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? "#4b5563" : "#6b7280",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteClass(showDeleteConfirm)}
                    className="px-5 py-2 rounded-lg text-white text-sm transition-colors"
                    style={{
                      backgroundColor: "#dc2626",
                    }}
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
