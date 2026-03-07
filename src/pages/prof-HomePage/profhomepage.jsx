import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import Button from "../component/Button";
import Button2 from "../component/button_2";
import {
  BookOpen,
  User,
  GraduationCap,
  FileText,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { prefixName } from "../../utils/prefixNameFormat";
import { formatFullDate } from "../../utils/formatTime";
import { getGreeting } from "../../utils/greetings";
import { SpaceCover } from "../component/spaceCover";
import Logout from "../component/logout";
import ArticlesScrape from "../component/articles_scrape";
import AnnouncementByAdmin from "./components/profannouncementbyadmin";
import { DeleteConfirmationDialog } from "../component/SweetAlert";
import { toast } from "react-toastify";
import { departmentOptions } from "../component/enumOptions";

// Helper function to get course name from code
const getCourseName = (courseCode) => {
  if (!courseCode || courseCode === undefined || courseCode === null) {
    return "";
  }
  const course = departmentOptions.find(option => option.code === courseCode);
  return course ? course.name : courseCode; // Return the code itself if not found in options
};

const ProfHomePage = () => {
  const { user } = useUser();
  const {
    userSpaces = [],
    courseSpaces = [],
    deleteSpace,
    setArchive,
  } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const navigate = useNavigate();

  // Cover photos state
  const [spaceCoverPhotos, setSpaceCoverPhotos] = useState({});
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Memoized space descriptions for better performance
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

  // Load cover photos from localStorage for all spaces
  useEffect(() => {
    const loadCoverPhotos = () => {
      const allSpaces = [...(userSpaces || []), ...(courseSpaces || [])];
      
      // Debug: Log course spaces data structure
      if (courseSpaces && courseSpaces.length > 0) {
        console.log("Course space structure:", Object.keys(courseSpaces[0]));
        console.log("Course space data:", courseSpaces[0]);
      }

      const coverPhotos = {};
      allSpaces.forEach((space) => {
        if (space && space.space_uuid) {
          const storedCover = localStorage.getItem(`coverPhoto_${space.space_uuid}`);
          if (storedCover) {
            coverPhotos[space.space_uuid] = storedCover;
          }
        }
      });

      setSpaceCoverPhotos(coverPhotos);
    };

    loadCoverPhotos();

    const handleStorageChange = () => {
      loadCoverPhotos();
    };

    const handleCoverPhotoUpdate = (event) => {
      const { space_uuid, coverPhoto } = event.detail;
      setSpaceCoverPhotos((prev) => ({
        ...prev,
        [space_uuid]: coverPhoto,
      }));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("coverPhotoUpdated", handleCoverPhotoUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("coverPhotoUpdated", handleCoverPhotoUpdate);
    };
  }, [userSpaces, courseSpaces]);

  // Handle delete space

  const [slideIndexYourSpace, setSlideIndexYourSpace] = useState(0);
  const [slideIndexSpaces, setSlideIndexSpaces] = useState(0);
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  
  // Sidebar minimization state
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  // Handle mouse move for tooltip positioning
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Inject CSS animations for staggered transitions
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
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);

  const userSpaceUUIDs = new Set(userSpaces.map((s) => s.space_uuid));
  const sharedSpaces = courseSpaces.filter(
    (s) => !userSpaceUUIDs.has(s.space_uuid),
  );

  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(window.innerWidth >= 1024 ? 3 : 4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const yourSlideCount = Math.max(
    1,
    Math.ceil(userSpaces.length / cardsPerView),
  );
  const friendSlideCount = Math.max(
    1,
    Math.ceil(sharedSpaces.length / cardsPerView),
  );

  return (
    <div
      className="flex font-sans min-h-screen"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* ================= Desktop Sidebar (Laptop+) ================= */}
      <div className="hidden lg:block">
        <ProfSidebar 
          isMinimized={isSidebarMinimized} 
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          onLogoutClick={() => setShowLogout(true)} 
        />
      </div>

      {/* ================= Mobile + Tablet Overlay ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= Mobile/Tablet Sidebar ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <ProfSidebar 
          isMinimized={isSidebarMinimized} 
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          onLogoutClick={() => setShowLogout(true)} 
        />
      </div>

      {/* ================= Main Content ================= */}
      <div
        className="flex-1 flex flex-col min-w-0"
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
          <h1 className="text-xl font-bold">Home</h1>
        </div>

        {/* ================= Spacer for fixed header ================= */}
        <div className="lg:hidden h-16"></div>

        {/* ================= Page Content Wrapper ================= */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 md:p-6 lg:p-8">
          {/* CENTER COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Title and Date ABOVE the card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2
                className="text-xl sm:text-2xl font-bold text-white font-grotesque"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Get Productive Today!
              </h2>
              <p
                className="text-xs sm:text-sm font-inter"
                style={{ color: isDarkMode ? "#9ca3af" : "black" }}
              >
                {formatFullDate()}
              </p>
            </div>

            {/* Welcome Card */}
            <div
              className="rounded-xl p-6 mb-10 relative"
              style={{
                background: isDarkMode
                  ? currentColors.surface
                  : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                border: isDarkMode ? "none" : "none",
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1
                    className="text-lg sm:text-xl font-semibold mb-2"
                    style={{ color: "white" }}
                  >
                    {getGreeting()},{" "}
                    {prefixName(
                      capitalizeWords(user?.first_name),
                      user?.gender,
                    ) || "Professor"}
                  </h1>
                  <p className="mb-1" style={{ color: "white" }}>
                    Manage your classes and collaborate with students.
                  </p>
                  <p
                    className="mb-5"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Create spaces or join existing ones.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => navigate("/prof/space/create")}
                      className="border bg-white hover:bg-gray-100 text-sm py-2 px-4"
                      style={{
                        borderColor: "white",
                        color: "white",
                      }}
                    >
                      Create Space
                    </Button>
                  </div>
                </div>
              </div>
              <img
                src={
                  user?.gender === "F"
                    ? "https://res.cloudinary.com/diws5bcu6/image/upload/v1772464537/ma_am-icon_sjowcg.png"
                    : "https://res.cloudinary.com/diws5bcu6/image/upload/v1772464537/sir-icon_lqifeh.png"
                }
                alt="Professor Icon"
                className="absolute top-1 right-1 w-48 h-48 object-contain hidden sm:block"
              />
            </div>

            {/* Task Deployed Section (Mobile/Tablet/Small Laptop Only) */}
            <div className="xl:hidden mb-8 mt-6">
              <h2
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Task Deployed
              </h2>
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  background: isDarkMode
                    ? currentColors.surface
                    : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                  border: isDarkMode ? "none" : "none",
                }}
              >
                <div className="text-center py-8">
                  <Calendar
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: isDarkMode ? "#9ca3af" : "white" }}
                  />
                  <p className="text-sm" style={{ color: "white" }}>
                    No student activities
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Check your calendar to monitor student task submissions and progress
                  </p>
                  <div className="mt-6">
                    <Button2
                      text="Go to Calendar"
                      onClick={() => navigate("/prof/calendar")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements by Admin (Mobile/Tablet/Small Laptop Only) */}
            <div className="xl:hidden mb-8">
              <AnnouncementByAdmin />
            </div>

            {/* Your Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2
                  className="text-lg sm:text-xl font-semibold"
                  style={{ color: isDarkMode ? "white" : "black" }}
                >
                  Your Space
                </h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      setSlideIndexYourSpace(
                        Math.max(0, slideIndexYourSpace - 1),
                      )
                    }
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                    disabled={slideIndexYourSpace === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setSlideIndexYourSpace(
                        Math.min(yourSlideCount - 1, slideIndexYourSpace + 1),
                      )
                    }
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                    disabled={slideIndexYourSpace >= yourSlideCount - 1}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => navigate("/prof/spaces")}
                    className="hidden sm:inline hover:underline text-sm ml-2 bg-transparent"
                    style={{ color: isDarkMode ? "#60A5FA" : "black" }}
                  >
                    View All
                  </button>
                </div>
              </div>

              {userSpaces.length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  No spaces yet — create one to get started!
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${slideIndexYourSpace * 100}%)`,
                    }}
                  >
                    {Array.from({ length: yourSlideCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full h-full"
                      >
                        {userSpaces
                          .slice(idx * cardsPerView, (idx + 1) * cardsPerView)
                          .map((space, spaceIndex) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative hover-lift"
                              style={{
                                backgroundColor: currentColors.surface,
                                border: isDarkMode ? "none" : "1px solid black",
                                animation: `fadeIn 0.6s ease-out ${(idx * cardsPerView + spaceIndex) * 0.1}s forwards`,
                                opacity: 0,
                              }}
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
                                  )
                                }
                                className="cursor-pointer relative"
                                onMouseEnter={() =>
                                  setHoveredSpace({
                                    uuid: space.space_uuid,
                                    name: space.space_name,
                                  })
                                }
                                onMouseLeave={() => setHoveredSpace(null)}
                              >
                                <div className="relative overflow-hidden">
                                  <SpaceCover
                                    image={
                                      spaceCoverPhotos[space.space_uuid] ||
                                      space.image
                                    }
                                    name={space.space_name}
                                    className="w-full flex-shrink-0 aspect-[3/2] object-cover transition duration-300"
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
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}'s Space
                                  </h3>
                                  
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
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2
                  className="text-lg sm:text-xl font-semibold"
                  style={{ color: isDarkMode ? currentColors.text : "black" }}
                >
                  Course Spaces
                </h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      setSlideIndexSpaces(Math.max(0, slideIndexSpaces - 1))
                    }
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                    disabled={slideIndexSpaces === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setSlideIndexSpaces(
                        Math.min(
                          Math.ceil(sharedSpaces.length / 3) - 1,
                          slideIndexSpaces + 1,
                        ),
                      )
                    }
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                    disabled={
                      slideIndexSpaces >= Math.ceil(sharedSpaces.length / 3) - 1
                    }
                  >
                    ›
                  </button>
                  <button
                    onClick={() => navigate("/prof/spaces#course-spaces")}
                    className="hidden sm:inline hover:underline text-sm ml-2 bg-transparent"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>

              {sharedSpaces.length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  No Course spaces yet
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${slideIndexSpaces * 100}%)`,
                    }}
                  >
                    {Array.from({ length: friendSlideCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full"
                      >
                        {sharedSpaces
                          .slice(idx * cardsPerView, (idx + 1) * cardsPerView)
                          .map((space, spaceIndex) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative hover-lift"
                              style={{
                                backgroundColor: currentColors.surface,
                                border: isDarkMode ? "none" : "1px solid black",
                                animation: `fadeIn 0.6s ease-out ${(idx * cardsPerView + spaceIndex) * 0.1}s forwards`,
                                opacity: 0,
                              }}
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
                                  )
                                }
                                className="cursor-pointer relative"
                                onMouseEnter={() =>
                                  setHoveredSpace({
                                    uuid: space.space_uuid,
                                    name: space.space_name,
                                  })
                                }
                                onMouseLeave={() => setHoveredSpace(null)}
                              >
                                <div className="relative overflow-hidden">
                                  <SpaceCover
                                    image={
                                      spaceCoverPhotos[space.space_uuid] ||
                                      space.background_img ||
                                      space.image
                                    }
                                    name={space.space_name}
                                    className="w-full flex-shrink-0 aspect-[3/2] object-cover transition duration-300"
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
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}
                                  </h3>
                                  <p
                                    className="text-xs mt-1"
                                    style={{
                                      color: isDarkMode ? "#9ca3af" : "#666666",
                                    }}
                                  >
                                    Prof.{" "}
                                    {capitalizeWords(
                                      space.professor?.name.split(" ")[0],
                                    ) || "Unknown"}{" "}
                                    • {space.members?.length > 0 ? space.members.length - 1 : 0} Students
                                  </p>
                                  <p
                                    className="text-xs mt-1"
                                    style={{
                                      color: isDarkMode ? "#9ca3af" : "#666666",
                                    }}
                                  >
                                    {space.space_day || "TBD"} (
                                    {new Date(
                                      `2000-01-01T${space.space_time_start}`,
                                    ).toLocaleTimeString([], {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}{" "}
                                    -{" "}
                                    {new Date(
                                      `2000-01-01T${space.space_time_end}`,
                                    ).toLocaleTimeString([], {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                    )
                                  </p>
                                  <p
                                    className="text-xs mt-1"
                                    style={{
                                      color: isDarkMode ? "#9ca3af" : "#666666",
                                    }}
                                  >
                                    {space.space_course ? getCourseName(space.space_course) : (space.course || space.department || space.space_department || "")}
                                  </p>
                                </div>
                              </div>
                              {/* Three dots menu */}
                              <div className="absolute top-2 right-2 menu-container">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(
                                      showMenu === `course-${space.space_uuid}`
                                        ? null
                                        : `course-${space.space_uuid}`,
                                    );
                                  }}
                                  className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {showMenu === `course-${space.space_uuid}` && (
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
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Articles Section */}
            <ArticlesScrape />
          </div>

          {/* RIGHT CONTENT - Task Deployed + Announcements (Desktop Only - Sticky Sidebar) */}
          <div className="hidden xl:flex xl:flex-col w-80 gap-4 mr-6 my-6 flex-shrink-0 self-start sticky top-4">
            {/* Task Deployed */}
            <div
              className="rounded-xl p-6"
              style={{
                background: isDarkMode
                  ? currentColors.surface
                  : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                border: isDarkMode ? "none" : "none",
              }}
            >
              <h4 className="font-semibold mb-3" style={{ color: "white" }}>
                Task Deployed:
              </h4>
              <div className="text-center py-8">
                <Calendar
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: isDarkMode ? "#9ca3af" : "white" }}
                />
                <p className="text-sm" style={{ color: "white" }}>
                  No student activities
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Check your calendar to monitor student task submissions and progress
                </p>
                <div className="mt-6">
                  <Button2
                    text="Go to Calendar"
                    onClick={() => navigate("/prof/calendar")}
                  />
                </div>
              </div>
            </div>

            {/* Announcements by Admin */}
            <AnnouncementByAdmin />
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
                  Leave Space
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{
                    color: isDarkMode ? currentColors.textSecondary : "black",
                  }}
                >
                  Are you sure you want to leave this space? You'll need to be
                  re-invited to join again.
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
                      console.log("Space left:", showLeaveConfirm);
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

          {/* Archive Space Confirmation Dialog */}
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
                  Are you sure you want to archive this space? It will be moved
                  to your Archived Classes and can be restored anytime.
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

export default ProfHomePage;
