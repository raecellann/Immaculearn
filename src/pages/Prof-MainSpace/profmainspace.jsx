import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";
import Button from "../component/Button";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { prefixName } from "../../utils/prefixNameFormat";
import { formatFullDate } from "../../utils/formatTime";
import { getGreeting } from "../../utils/greetings";
import { MoreVertical } from "lucide-react";

import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { SpaceCover } from "../component/spaceCover";
import { DeleteConfirmationDialog } from "../component/SweetAlert";
import { toast } from "react-toastify";

const ProfSpacePage = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces, deleteSpace, setArchive } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  console.log(courseSpaces);

  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("All");
  const [showLogout, setShowLogout] = useState(false);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [spaceCoverPhotos, setSpaceCoverPhotos] = useState({});

  // Inject CSS animations for SSR compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes riseUp {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-8px);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .group:hover .transform-hover {
          transform: scale(1.02);
          transition: transform 0.3s ease;
        }
        
        .group:hover .shadow-hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          transition: box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          border-color: #6366F1;
          transition: transform 0.6s ease-out, box-shadow 0.6s ease-out, border-color 0.6s ease-out;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        // Cleanup style element on unmount
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);

  // Filter course spaces by year level
  const spaceDescriptions = useMemo(() => {
    const descriptions = {};

    const getDescription = (spaceName) => {
      const name = spaceName.toLowerCase();

      // Check for keywords in space name
      if (name.includes("personal") || name.includes("my"))
        return "Your personal workspace for organizing notes, tasks, and study materials.";
      if (name.includes("study") || name.includes("learn"))
        return "Collaborative study space for group projects and shared learning resources.";
      if (name.includes("research") || name.includes("thesis"))
        return "Research workspace for academic papers, sources, and bibliography management.";
      if (name.includes("project") || name.includes("assignment"))
        return "Project management space for tracking assignments and deadlines.";
      if (
        name.includes("math") ||
        name.includes("calculus") ||
        name.includes("algebra")
      )
        return "Mathematics course space for problem sets, formulas, and mathematical discussions.";
      if (
        name.includes("science") ||
        name.includes("lab") ||
        name.includes("chemistry")
      )
        return "Science laboratory space for experiments, lab reports, and scientific research.";
      if (
        name.includes("literature") ||
        name.includes("english") ||
        name.includes("writing")
      )
        return "Literature discussion space for book analysis, essays, and creative writing.";
      if (name.includes("history") || name.includes("historical"))
        return "History study space for timelines, historical documents, and discussions.";
      if (
        name.includes("programming") ||
        name.includes("code") ||
        name.includes("computer")
      )
        return "Programming workspace for code sharing, debugging, and software development.";
      if (name.includes("shared") || name.includes("collaborative"))
        return "Shared workspace for collaborative projects and peer-to-peer learning.";
      if (name.includes("group") || name.includes("team"))
        return "Group study space for exam preparation and knowledge sharing.";
      if (name.includes("discussion") || name.includes("debate"))
        return "Discussion forum for academic debates and intellectual exchange.";
      if (name.includes("review") || name.includes("feedback"))
        return "Peer review space for feedback and improvement of assignments.";

      // Create unique descriptions based on specific names
      if (name.includes("flins"))
        return "Flins's personal study space for organizing coursework and collaborative projects.";
      if (name.includes("sample"))
        return "Sample workspace for testing features and demonstrating platform capabilities.";
      if (name.includes("sienna"))
        return "Sienna's creative space for sharing ideas and working on group assignments.";
      if (name.includes("alex"))
        return "Alex's productivity hub for managing tasks and academic resources.";
      if (name.includes("jordan"))
        return "Jordan's collaborative workspace for team projects and study sessions.";
      if (name.includes("taylor"))
        return "Taylor's research area for academic papers and knowledge sharing.";
      if (name.includes("morgan"))
        return "Morgan's innovation space for creative projects and brainstorming.";
      if (name.includes("casey"))
        return "Casey's learning environment for skill development and peer collaboration.";
      if (name.includes("riley"))
        return "Riley's academic hub for organizing study materials and group discussions.";
      if (name.includes("quinn"))
        return "Quinn's knowledge center for research, writing, and intellectual exploration.";

      // Generate varied descriptions based on name patterns
      if (name.includes("space")) {
        if (name.includes("1") || name.includes("one"))
          return "Primary workspace for main projects and important tasks.";
        if (name.includes("2") || name.includes("two"))
          return "Secondary space for collaborative work and group activities.";
        if (name.includes("3") || name.includes("three"))
          return "Tertiary workspace for creative projects and brainstorming sessions.";
      }

      // Different descriptions based on name length and characteristics
      if (name.length <= 4)
        return "Compact workspace for focused study and quick collaboration.";
      if (name.length >= 8)
        return "Comprehensive workspace for extensive projects and detailed research.";

      // Time-based descriptions
      const hour = new Date().getHours();
      if (hour < 12)
        return "Morning workspace for productive study and early collaboration.";
      if (hour < 17)
        return "Afternoon workspace for focused work and team projects.";
      return "Evening workspace for relaxed study and creative thinking.";
    };

    // Pre-compute descriptions for all spaces
    [...(userSpaces || []), ...(courseSpaces || [])].forEach((space) => {
      if (space && space.space_name) {
        descriptions[space.space_uuid] = getDescription(space.space_name);
      }
    });

    return descriptions;
  }, [userSpaces, courseSpaces]);

  // Helper function to get space description (now just a lookup)
  const getSpaceDescription = (spaceUuid, spaceName) => {
    return (
      spaceDescriptions[spaceUuid] ||
      "A collaborative workspace for learning and sharing knowledge."
    );
  };

  // Load cover photos from localStorage
  useEffect(() => {
    const loadCoverPhotos = () => {
      const allSpaces = [...(userSpaces || []), ...(courseSpaces || [])];
      const coverPhotos = {};
      allSpaces.forEach((space) => {
        if (space.space_uuid) {
          const saved = localStorage.getItem(`coverPhoto_${space.space_uuid}`);
          if (saved) coverPhotos[space.space_uuid] = saved;
        }
      });
      setSpaceCoverPhotos(coverPhotos);
    };
    loadCoverPhotos();
    const handleStorage = (e) =>
      e.key?.startsWith("coverPhoto_") && loadCoverPhotos();
    const handleUpdate = () => loadCoverPhotos();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("coverPhotoUpdated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("coverPhotoUpdated", handleUpdate);
    };
  }, [userSpaces, courseSpaces]);

  // Handle mouse move for tooltip positioning
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* 🔹 ADDED — STICKY HEADER LOGIC */
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

  // Handle hash navigation for smooth scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#course-spaces") {
      const element = document.getElementById("course-spaces");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  // Filter course spaces by year level
  const filterCourseSpacesByYear = (spaces, filter) => {
    if (!spaces || filter === "All") return spaces;
    return spaces.filter((space) => space.space_yr_lvl === parseInt(filter));
  };

  const handleDeleteSpace = async () => {
    try {
      const spaceUuid = showDeleteConfirm;
      await deleteSpace(spaceUuid);
      setShowDeleteConfirm(null);
      setShowMenu(null);
    } catch (error) {
      console.error("Failed to delete space:", error);
    }
  };

  const handleArchiveSpace = async (space_uuid) => {
    try {
      await setArchive(space_uuid);
      toast.success("Successfully Archive ");
    } catch (err) {
      toast.error("Error for Archiving Course Space");
    }
    setShowArchiveConfirm(null);
    setShowMenu(null);
  };

  return (
    <div
      className="flex font-sans min-h-screen"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        }}
      >
        {/* ================= Header (Mobile + Tablet) ================= */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Spaces</h1>
        </div>

        {/* ================= Spacer for fixed header ================= */}
        <div className="lg:hidden h-16"></div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Desktop Title */}
          <div className="hidden lg:flex justify-center mb-8">
            <h1
              className="text-4xl font-bold"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Spaces
            </h1>
          </div>

          {/* Welcome */}
          <div
            className="rounded-xl p-6 mb-10"
            style={{
              background:
                "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
              border: isDarkMode ? "1px solid #3B4457" : "1px solid black",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "white" }}
                >
                  {getGreeting()},{" "}
                  {prefixName(
                    capitalizeWords(user?.first_name),
                    user?.gender,
                  ) || "Professor"}
                </h2>
                <p className="text-sm" style={{ color: "white" }}>
                  Meet your students and collaborate with them.
                </p>
                <p className="text-sm" style={{ color: "white" }}>
                  Create and manage your classroom spaces.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Button
                  onClick={() => navigate("/prof/space/create")}
                  style={{ border: isDarkMode ? "1px solid black" : "1px solid white" }}
                >
                  Create Space
                </Button>
              </div>
            </div>
          </div>

          {/* Your Space */}
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Your Space
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userSpaces && userSpaces.length > 0 ? (
                userSpaces?.map((space, index) => (
                  <div
                    key={space.space_id}
                    className="group rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative hover-lift"
                    style={{
                      backgroundColor: isDarkMode
                        ? "#1E242E"
                        : currentColors.surface,
                      border: isDarkMode
                        ? "1px solid #3B4457"
                        : "1px solid black",
                      animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <div
                      onClick={() =>
                        navigate(
                          `/prof/space/${space?.space_uuid}/${space.space_name}`,
                        )
                      }
                      onMouseEnter={() =>
                        setHoveredSpace({
                          uuid: space.space_uuid,
                          name: space.space_name,
                        })
                      }
                      onMouseLeave={() => setHoveredSpace(null)}
                    >
                      <div className="relative h-40 bg-gray-800 overflow-hidden transform-hover shadow-hover">
                        <SpaceCover
                          image={
                            spaceCoverPhotos[space.space_uuid] ||
                            space.space_cover
                          }
                          name={space.space_name}
                          className="w-full h-full object-cover transition duration-300"
                        />
                        {/* Description Overlay - shown on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-white text-sm font-medium leading-relaxed">
                            {getSpaceDescription(
                              space.space_uuid,
                              space.space_name,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          {space.space_name}
                        </h3>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#9ca3af" : "#666666" }}
                        >
                          {space.members.length} Members
                        </p>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            showMenu === `your-${space.space_id}`
                              ? null
                              : `your-${space.space_id}`,
                          );
                        }}
                        className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMenu === `your-${space.space_id}` && (
                        <div
                          className="absolute top-8 right-0 rounded-lg shadow-lg z-10 min-w-[120px]"
                          style={{
                            backgroundColor: currentColors.surface,
                            border: `1px solid ${currentColors.border}`,
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(space.space_uuid);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-lg"
                          >
                            Delete Space
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="col-span-full p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: isDarkMode
                      ? "#1E242E"
                      : currentColors.surface,
                    border: isDarkMode
                      ? "1px solid #3B4457"
                      : "1px solid black",
                    color: currentColors.textSecondary,
                  }}
                >
                  No spaces yet — create one to get started!
                </div>
              )}
            </div>
          </div>

          {/* Course Spaces */}
          <div id="course-spaces">
            <div className="mb-4 flex flex-col gap-3">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Course Spaces
              </h2>

              <div className="flex flex-wrap items-start gap-2 sm:gap-3 justify-end">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span
                    className="text-xs sm:text-sm whitespace-nowrap"
                    style={{ color: isDarkMode ? "#9ca3af" : "#666666" }}
                  >
                    Year Level:
                  </span>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="rounded-md px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] text-xs sm:text-sm"
                    style={{
                      backgroundColor: isDarkMode
                        ? "#1E242E"
                        : currentColors.surface,
                      borderColor: isDarkMode ? "#3B4457" : "black",
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    <option value="All">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <Button
                  onClick={() => navigate("/prof/spaces/classroom/create")}
                  className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
                  style={{ border: isDarkMode ? "1px solid black" : "1px solid white" }}
                >
                  Create Space
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseSpaces && courseSpaces.length > 0 ? (
                filterCourseSpacesByYear(courseSpaces, yearFilter)?.length >
                0 ? (
                  filterCourseSpacesByYear(courseSpaces, yearFilter)?.map(
                    (space, index) => (
                      <div
                        key={index}
                        className="group rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative hover-lift"
                        style={{
                          backgroundColor: isDarkMode
                            ? "#1E242E"
                            : currentColors.surface,
                          border: isDarkMode
                            ? "1px solid #3B4457"
                            : "1px solid black",
                          animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
                          opacity: 0,
                        }}
                      >
                        <div
                          onClick={() =>
                            navigate(
                              `/prof/space/${space?.space_uuid}/${space.space_name}`,
                            )
                          }
                          onMouseEnter={() =>
                            setHoveredSpace({
                              uuid: space.space_uuid,
                              name: space.space_name,
                            })
                          }
                          onMouseLeave={() => setHoveredSpace(null)}
                        >
                          <div className="relative h-40 bg-gray-800 overflow-hidden transform-hover shadow-hover">
                            <SpaceCover
                              image={
                                spaceCoverPhotos[space.space_uuid] ||
                                space.space_cover
                              }
                              name={space.space_name}
                              className="w-full h-full object-cover transition duration-300"
                            />
                            {/* Description Overlay - shown on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <p className="text-white text-sm font-medium leading-relaxed">
                                {getSpaceDescription(
                                  space.space_uuid,
                                  space.space_name,
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3
                              className="font-semibold text-sm"
                              style={{ color: isDarkMode ? "white" : "black" }}
                            >
                              {space.space_name}
                            </h3>
                            <p
                              className="text-xs"
                              style={{
                                color: isDarkMode ? "#9ca3af" : "#666666",
                              }}
                            >
                              {space.members?.length || 0}{" "}
                              {space.members?.length > 1
                                ? "Students"
                                : "Student"}
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
                              className="absolute top-8 right-0 rounded-lg shadow-lg z-10 min-w-[140px]"
                              style={{
                                backgroundColor: currentColors.surface,
                                border: `1px solid ${currentColors.border}`,
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowArchiveConfirm(space.space_uuid);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[#60A5FA] hover:bg-[#3B4457] rounded-t-lg"
                              >
                                Archive Space
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div
                    className="col-span-full p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: isDarkMode
                        ? "#1E242E"
                        : currentColors.surface,
                      border: isDarkMode
                        ? "1px solid #3B4457"
                        : "1px solid black",
                      color: currentColors.textSecondary,
                    }}
                  >
                    No Course Spaces found for{" "}
                    {yearFilter === "All"
                      ? "any year level"
                      : `${yearFilter}${yearFilter === "1" ? "st" : yearFilter === "2" ? "nd" : yearFilter === "3" ? "rd" : "th"} year`}
                  </div>
                )
              ) : (
                <div
                  className="col-span-full p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: isDarkMode
                      ? "#1E242E"
                      : currentColors.surface,
                    border: isDarkMode
                      ? "1px solid #3B4457"
                      : "1px solid black",
                    color: currentColors.textSecondary,
                  }}
                >
                  No Course Space Yet!
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={!!showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(null)}
            onConfirm={handleDeleteSpace}
            space={userSpaces.find(s => s.space_uuid === showDeleteConfirm) || { space_name: "Unknown Space", members: [], files: [], tasks: [] }}
          />

          {/* Leave Space Confirmation Dialog */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
              <div
                className="rounded-xl p-6 max-w-sm w-full"
                style={{
                  backgroundColor: currentColors.surface,
                  border: `1px solid ${currentColors.border}`,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: isDarkMode ? "white" : "black" }}
                >
                  Delete Space
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{
                    color: isDarkMode ? currentColors.textSecondary : "black",
                  }}
                >
                  Are you sure you want to delete this space? This action cannot
                  be undone.
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
                      // Handle leave action here
                      console.log("Space left:", showLeaveConfirm);
                      setShowLeaveConfirm(null);
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

          {/* Archive Course Space Confirmation Dialog */}
          {showArchiveConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
              <div
                className="rounded-xl p-6 max-w-sm w-full"
                style={{
                  backgroundColor: currentColors.surface,
                  border: `1px solid ${currentColors.border}`,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: isDarkMode ? "white" : "black" }}
                >
                  Archive Space
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{
                    color: isDarkMode ? currentColors.textSecondary : "black",
                  }}
                >
                  Are you sure you want to archive this course space? It will be
                  moved to your Archived Classes and can be restored anytime.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowArchiveConfirm(null);
                      setShowMenu(null);
                    }}
                    className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () =>
                      await handleArchiveSpace(showArchiveConfirm)
                    }
                    className="px-5 py-2 rounded-lg bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-sm"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfSpacePage;
