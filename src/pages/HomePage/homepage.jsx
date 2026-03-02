import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";
import Button2 from "../component/button_2";
import Logout from "../component/logout";
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
import { SpaceCover } from "../component/spaceCover";
import ArticlesScrape from "../component/articles_scrape";
import { DeleteConfirmationDialog } from "../component/SweetAlert";
import StudentAnnouncementByAdmin from "./components/studentannouncementbyadmin";

const HomePage1 = () => {
  const { user } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const {
    userSpaces = [],
    friendSpaces = [],
    courseSpaces = [],
    deleteSpace,
  } = useSpace();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [today, setToday] = useState(new Date());

  const [slideIndexYourSpace, setSlideIndexYourSpace] = useState(0);
  const [slideIndexFriendsSpace, setSlideIndexFriendsSpace] = useState(0);
  const [slideIndexCourseSpace, setSlideIndexCourseSpace] = useState(0);

  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Cover photos state
  const [spaceCoverPhotos, setSpaceCoverPhotos] = useState({});

  // Data
  const allSpaces = new Set([
    ...(userSpaces || []).map((space) => space.space_uuid),
    ...(courseSpaces || []).map((space) => space.space_uuid),
  ]);

  const sharedSpaces = (friendSpaces || []).filter(
    (space) =>
      !allSpaces.has(space.space_uuid) &&
      space.members?.some((member) => member.account_id === user?.id),
  );

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
    [
      ...(userSpaces || []),
      ...(courseSpaces || []),
      ...(sharedSpaces || []),
    ].forEach((space) => {
      if (space && space.space_name) {
        descriptions[space.space_uuid] = getDescription(space.space_name);
      }
    });

    return descriptions;
  }, [userSpaces, courseSpaces, sharedSpaces]);

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
      const allSpaces = [
        ...(userSpaces || []),
        ...(friendSpaces || []),
        ...(courseSpaces || []),
      ];

      const coverPhotos = {};
      allSpaces.forEach((space) => {
        if (space.space_uuid) {
          const savedCoverPhoto = localStorage.getItem(
            `coverPhoto_${space.space_uuid}`,
          );
          if (savedCoverPhoto) {
            coverPhotos[space.space_uuid] = savedCoverPhoto;
          }
        }
      });

      setSpaceCoverPhotos(coverPhotos);
    };

    loadCoverPhotos();

    // Listen for storage changes to update cover photos in real-time
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith("coverPhoto_")) {
        loadCoverPhotos();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleCoverPhotoUpdate = () => {
      loadCoverPhotos();
    };

    window.addEventListener("coverPhotoUpdated", handleCoverPhotoUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("coverPhotoUpdated", handleCoverPhotoUpdate);
    };
  }, [userSpaces, friendSpaces, courseSpaces]);

  // Mobile sidebar & logout
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide header on scroll down
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setShowHeader(current <= lastScrollY.current || current < 60);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      `${now.toLocaleString("default", { month: "long" })} ${now
        .getDate()
        .toString()
        .padStart(2, "0")}, ${now.getFullYear()} (${now.toLocaleString(
        "default",
        { weekday: "long" },
      )})`,
    );

    const h = now.getHours();
    setGreeting(
      h < 5
        ? "Good Night"
        : h < 12
          ? "Good Morning"
          : h < 17
            ? "Good Afternoon"
            : "Good Evening",
    );

    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setToday(now);
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

  // Handle delete space
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
  const courseSlideCount = Math.max(
    1,
    Math.ceil(courseSpaces.length / cardsPerView),
  );

  return (
    <div
      className="flex font-sans min-h-screen"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
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
          <h1
            className="text-xl font-bold"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            Home
          </h1>
        </div>
        <div className="lg:hidden h-16" />

        <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 md:p-6 lg:p-8">
          {/* CENTER COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Title and Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2
                className="text-xl sm:text-2xl font-bold font-grotesque"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Get Productive Today!
              </h2>
              <p
                className="text-xs sm:text-sm font-inter"
                style={{ color: isDarkMode ? "#9ca3af" : "black" }}
              >
                {currentDate}
              </p>
            </div>

            {/* Welcome Card */}
            <div
              className="rounded-xl p-6 mb-10 relative"
              style={{
                backgroundColor: isDarkMode
                  ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                  : "white",
                border: isDarkMode ? "none" : "1px solid black",
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1
                    className="text-lg sm:text-xl font-semibold mb-2"
                    style={{ color: isDarkMode ? "#B0C4FF" : "#1e3a8a" }}
                  >
                    {greeting}, {user?.name || "Student"}
                  </h1>
                  <p
                    className="mb-1"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#333333",
                    }}
                  >
                    Meet your classmates and collaborate with them.
                  </p>
                  <p
                    className="mb-5"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#666666",
                    }}
                  >
                    Join a space or create your own.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="border bg-[#007AFF] hover:bg-blue-700 text-sm py-2 px-4"
                      style={{
                        borderColor: isDarkMode ? "#4a5568" : "black",
                        color: isDarkMode ? "white" : "black",
                      }}
                      onClick={() => navigate("/space/create")}
                    >
                      Create Space
                    </Button>
                    <Button
                      className="border text-sm py-2 px-4"
                      style={{
                        borderColor: isDarkMode ? "#4a5568" : "black",
                        color: isDarkMode ? "white" : "black",
                      }}
                      onClick={() => navigate("/space")}
                    >
                      Join Space
                    </Button>
                  </div>
                </div>
              </div>
              <img
                src="src/assets/HomePage/book-pen.svg"
                alt="Book & Pen"
                className="absolute top-6 right-6 w-24 h-24 object-contain hidden sm:block"
              />
            </div>

            {/* Reminders (Mobile/Tablet only) */}
            <div className="xl:hidden mb-8">
              <h2
                className="text-lg sm:text-xl font-semibold mb-3"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Reminders
              </h2>
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                    : "white",
                  border: isDarkMode ? "none" : "1px solid black",
                }}
              >
                <div className="text-center py-8">
                  <Calendar
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: currentColors.textSecondary }}
                  />
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                  >
                    No tasks created yet
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                  >
                    Go to your calendar to create tasks and set reminders
                  </p>
                  <div className="mt-6">
                    <Button2
                      text="Go to Calendar"
                      onClick={() => navigate("/calendar")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements by Admin (Mobile/Tablet only) */}
            <div className="xl:hidden mb-8">
              <StudentAnnouncementByAdmin />
            </div>

            {/* Your Spaces */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold">
                  Your Spaces
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    disabled={slideIndexYourSpace === 0}
                    onClick={() =>
                      setSlideIndexYourSpace((p) => Math.max(0, p - 1))
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ‹
                  </button>
                  <button
                    disabled={slideIndexYourSpace >= yourSlideCount - 1}
                    onClick={() =>
                      setSlideIndexYourSpace((p) =>
                        Math.min(yourSlideCount - 1, p + 1),
                      )
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ›
                  </button>
                  <button
                    className="hidden sm:block hover:underline text-sm"
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
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : "white",
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
                          .map((space) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                              }}
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
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
                                    description={space.space_description}
                                    className="w-full flex-shrink-0 aspect-[3/2] object-cover transition duration-300"
                                  />
                                  {/* Description Overlay - shown on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white text-sm font-medium leading-relaxed">
                                      {getSpaceDescription(space.space_uuid, space.space_name)}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}'s Space
                                  </h3>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {space.members?.length || 0} Members
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    Last active • just now
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
            </section>

            {/* Course Spaces */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold">
                  Course Spaces
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    disabled={slideIndexCourseSpace === 0}
                    onClick={() =>
                      setSlideIndexCourseSpace((p) => Math.max(0, p - 1))
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ‹
                  </button>
                  <button
                    disabled={slideIndexCourseSpace >= courseSlideCount - 1}
                    onClick={() =>
                      setSlideIndexCourseSpace((p) =>
                        Math.min(courseSlideCount - 1, p + 1),
                      )
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ›
                  </button>
                  <button
                    className="hidden sm:block hover:underline text-sm"
                    style={{ color: isDarkMode ? "#60A5FA" : "black" }}
                  >
                    View All
                  </button>
                </div>
              </div>

              {courseSpaces?.length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : "white",
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  No Course Space Yet!
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${slideIndexCourseSpace * 100}%)`,
                    }}
                  >
                    {Array.from({ length: courseSlideCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full h-full"
                      >
                        {courseSpaces
                          ?.slice(idx * cardsPerView, (idx + 1) * cardsPerView)
                          .map((course, i) => (
                            <div
                              key={i}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                              }}
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${course.space_uuid}/${encodeURIComponent(course.space_name)}`,
                                  )
                                }
                                className="cursor-pointer relative"
                                onMouseEnter={() =>
                                  setHoveredSpace({
                                    uuid: course.space_uuid,
                                    name: course.space_name,
                                  })
                                }
                                onMouseLeave={() => setHoveredSpace(null)}
                              >
                                <div className="relative overflow-hidden">
                                  <SpaceCover
                                    image={
                                      spaceCoverPhotos[course.space_uuid] ||
                                      course.image
                                    }
                                    name={course.space_name}
                                    description={course.space_description}
                                    className="w-full flex-shrink-0 aspect-[3/2] object-cover transition duration-300"
                                  />
                                  {/* Description Overlay - shown on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white text-sm font-medium leading-relaxed">
                                      {getSpaceDescription(course.space_uuid, course.space_name)}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(course.space_name)}'s Space
                                  </h3>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {course.members
                                      ?.filter((m) => m.role === "creator")
                                      .map((m) => (
                                        <span key={m.account_id}>
                                          {m.account_id === user?.id
                                            ? `You • ` +
                                              (course.members?.length - 1) +
                                              " Students"
                                            : `Prof. ${capitalizeWords(m.full_name?.split(" ")[0])} • ` +
                                              (course.members?.length - 1) +
                                              " Students"}
                                        </span>
                                      ))}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {course.space_day} (
                                    {`${course.space_time_start} - ${course.space_time_end}`}
                                    )
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
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Friends Spaces */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold">
                  Friends Spaces
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    disabled={slideIndexFriendsSpace === 0}
                    onClick={() =>
                      setSlideIndexFriendsSpace((p) => Math.max(0, p - 1))
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ‹
                  </button>
                  <button
                    disabled={slideIndexFriendsSpace >= friendSlideCount - 1}
                    onClick={() =>
                      setSlideIndexFriendsSpace((p) =>
                        Math.min(friendSlideCount - 1, p + 1),
                      )
                    }
                    className="text-gray-400 hover:text-white disabled:opacity-40 text-2xl px-2"
                    style={{ color: isDarkMode ? "#9ca3af" : "black" }}
                  >
                    ›
                  </button>
                  <button
                    className="hidden sm:block hover:underline text-sm"
                    style={{ color: isDarkMode ? "#60A5FA" : "black" }}
                  >
                    View All
                  </button>
                </div>
              </div>

              {sharedSpaces.length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : "white",
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  No shared spaces yet
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${slideIndexFriendsSpace * 100}%)`,
                    }}
                  >
                    {Array.from({ length: friendSlideCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full flex-shrink-0 h-full"
                      >
                        {sharedSpaces
                          .slice(idx * cardsPerView, (idx + 1) * cardsPerView)
                          .map((space) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                              }}
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
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
                                      {getSpaceDescription(space.space_uuid, space.space_name)}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}'s Space
                                  </h3>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {space.members?.length || 0} Members
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
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Articles Section */}
            <ArticlesScrape />
          </div>

          {/* RIGHT SIDEBAR – visible on xl+ */}
          <div className="hidden xl:block w-80 mr-6 flex-shrink-0 self-start sticky top-6 flex flex-col gap-6">
            {/* Reminders */}
            <div
              className="rounded-xl p-6 flex-1"
              style={{
                backgroundColor: isDarkMode
                  ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                  : "white",
                border: isDarkMode ? "none" : "1px solid black",
              }}
            >
              <div>
                <h4
                  className="font-semibold mb-3"
                  style={{ color: isDarkMode ? "white" : "black" }}
                >
                  Reminders
                </h4>
                <div className="text-center py-8">
                  <Calendar
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: currentColors.textSecondary }}
                  />
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                  >
                    No tasks created yet
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "black",
                    }}
                  >
                    Go to your calendar to create tasks and set reminders
                  </p>
                  <div className="mt-6">
                    <Button2
                      text="Go to Calendar"
                      onClick={() => navigate("/calendar")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements by Admin */}
            <StudentAnnouncementByAdmin />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationDialog
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={handleDeleteSpace}
          space={
            userSpaces.find((s) => s.space_uuid === showDeleteConfirm) ||
            friendSpaces.find((s) => s.space_uuid === showDeleteConfirm)
          }
        />

        {/* Leave Confirmation Modal */}
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
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                  style={{ color: "white" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("Leaving:", showLeaveConfirm);
                    setShowLeaveConfirm(null);
                    setShowMenu(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
                  style={{ color: "white" }}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      </div>
    </div>
  );
};

export default HomePage1;
