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
    allUploadedTasks = [],
    allUploadedTasksLoading = false,
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
                background: isDarkMode
                  ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
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
                    {greeting}, {user?.first_name || "Student"}
                  </h1>
                  <p
                    className="mb-1"
                    style={{
                      color: "white",
                    }}
                  >
                    Meet your classmates and collaborate with them.
                  </p>
                  <p
                    className="mb-5"
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Join a space or create your own.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="border bg-white hover:bg-gray-100 text-sm py-2 px-4"
                      style={{
                        borderColor: "white",
                        color: "white",
                      }}
                      onClick={() => navigate("/space/create")}
                    >
                      Create Space
                    </Button>
                    <Button
                      className="border text-sm py-2 px-4"
                      style={{
                        borderColor: "white",
                        color: "white",
                      }}
                      onClick={() => navigate("/space")}
                    >
                      Join Space
                    </Button>
                  </div>
                </div>
              </div>
              <img
                src={
                  user?.gender === "F"
                    ? "https://res.cloudinary.com/diws5bcu6/image/upload/v1772464536/girl-student_y97ybd.png"
                    : "https://res.cloudinary.com/diws5bcu6/image/upload/v1772464537/boy-student_gzqw2n.png"
                }
                alt="Student Icon"
                className="absolute top-1 right-1 w-48 h-48 object-contain hidden sm:block"
              />
            </div>

            {/* Reminders (Mobile/Tablet only) */}
            <div className="xl:hidden mb-8">
              <div
                className="rounded-xl p-4 sm:p-6"
                style={{
                  background: isDarkMode
                    ? currentColors.surface
                    : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                  border: isDarkMode ? "none" : "none",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: isDarkMode ? "#60A5FA" : "white" }}
                  />
                  <h2
                    className="font-semibold text-base sm:text-lg"
                    style={{ color: "white" }}
                  >
                    Reminders
                  </h2>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {allUploadedTasksLoading ? (
                    <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <div>
                          <p 
                            className="text-sm font-medium mb-1"
                            style={{ color: isDarkMode ? "white" : "black" }}
                          >
                            Loading tasks...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : allUploadedTasks.length === 0 ? (
                    <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                      <div className="flex flex-col items-center gap-3">
                        <Calendar size={32} style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }} />
                        <div>
                          <p 
                            className="text-sm font-medium mb-1"
                            style={{ color: isDarkMode ? "white" : "black" }}
                          >
                            No tasks created yet
                          </p>
                          <p 
                            className="text-xs"
                            style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }}
                          >
                            Go to your calendar to create tasks and set reminders
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button2
                          text="Go to Calendar"
                          onClick={() => navigate("/calendar")}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {allUploadedTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.task_id}
                          className="mt-3 p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            backgroundColor: isDarkMode
                              ? "rgba(30, 36, 46, 0.9)"
                              : "rgba(255, 255, 255, 0.95)",
                            borderColor: isDarkMode ? currentColors.border : "rgb(229, 231, 235)",
                            borderWidth: "1px",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className={`w-2 h-2 rounded-full ${
                                    task.task_status === "completed"
                                      ? "bg-green-500"
                                      : task.task_status === "in_progress"
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                  }`}
                                ></div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: currentColors.text }}
                                >
                                  {task.task_title || "Untitled Task"}
                                </p>
                              </div>
                              <p
                                className="text-sm leading-relaxed mb-3"
                                style={{
                                  color: currentColors.textSecondary,
                                  lineHeight: "1.5",
                                }}
                              >
                                {task.task_description || "No description"}
                              </p>
                              <div className="flex items-center gap-4">
                                {task.due_date && (
                                  <div className="flex items-center gap-2">
                                    <svg 
                                      className="w-4 h-4" 
                                      style={{ color: currentColors.textSecondary }}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                      />
                                    </svg>
                                    <p
                                      className="text-xs font-medium"
                                      style={{
                                        color: currentColors.textSecondary,
                                      }}
                                    >
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    task.task_status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : task.task_status === "in_progress"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {task.task_status?.replace("_", " ") || "pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* View All button */}
                {allUploadedTasks.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => navigate("/task")}
                      className="text-sm font-medium hover:underline transition-colors"
                      style={{ color: isDarkMode ? "#60A5FA" : "white" }}
                    >
                      View All Tasks →
                    </button>
                  </div>
                )}
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
                    onClick={() => navigate("/space#your-spaces")}
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
                          .map((space, spaceIndex) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full hover-lift"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                                animation: `fadeIn 0.6s ease-out ${(idx * cardsPerView + spaceIndex) * 0.1}s forwards`,
                                opacity: 0,
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
                          .map((course, spaceIndex) => (
                            <div
                              key={course.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full hover-lift"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                                animation: `fadeIn 0.6s ease-out ${(idx * cardsPerView + spaceIndex) * 0.1}s forwards`,
                                opacity: 0,
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
                                      {getSpaceDescription(
                                        course.space_uuid,
                                        course.space_name,
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(course.space_name)}'s Space
                                  </h3>
                                  <p className="text-gray-400 text-xs mt-1">
                                    <span>
                                      {course.professor?.name &&
                                        `Prof. ${capitalizeWords(course.professor?.name.split(" ")[0])}`}
                                    </span>
                                    <br></br>•{" "}
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
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full"
                      >
                        {sharedSpaces
                          .slice(idx * cardsPerView, (idx + 1) * cardsPerView)
                          .map((space, spaceIndex) => (
                            <div
                              key={space.space_uuid}
                              className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative h-full hover-lift"
                              style={{
                                backgroundColor: isDarkMode
                                  ? "rgb(27, 31, 38)"
                                  : "white",
                                border: isDarkMode ? "none" : "1px solid black",
                                animation: `fadeIn 0.6s ease-out ${(idx * cardsPerView + spaceIndex) * 0.1}s forwards`,
                                opacity: 0,
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
                background: isDarkMode
                  ? currentColors.surface
                  : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                border: isDarkMode ? "none" : "none",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: isDarkMode ? "#60A5FA" : "white" }}
                />
                <h4
                  className="font-semibold text-base"
                  style={{ color: "white" }}
                >
                  Reminders
                </h4>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {allUploadedTasksLoading ? (
                  <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <div>
                        <p 
                          className="text-sm font-medium mb-1"
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          Loading tasks...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : allUploadedTasks.length === 0 ? (
                  <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                    <div className="flex flex-col items-center gap-3">
                      <Calendar size={32} style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }} />
                      <div>
                        <p 
                          className="text-sm font-medium mb-1"
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          No tasks created yet
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }}
                        >
                          Go to your calendar to create tasks and set reminders
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button2
                        text="Go to Calendar"
                        onClick={() => navigate("/calendar")}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {allUploadedTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.task_id}
                        className="mt-3 p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(30, 36, 46, 0.9)"
                            : "rgba(255, 255, 255, 0.95)",
                          borderColor: isDarkMode ? currentColors.border : "rgb(229, 231, 235)",
                          borderWidth: "1px",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  task.task_status === "completed"
                                    ? "bg-green-500"
                                    : task.task_status === "in_progress"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: currentColors.text }}
                              >
                                {task.task_title || "Untitled Task"}
                              </p>
                            </div>
                            <p
                              className="text-sm leading-relaxed mb-3"
                              style={{
                                color: currentColors.textSecondary,
                                lineHeight: "1.5",
                              }}
                            >
                              {task.task_instruction || "No description"}
                            </p>
                            <div className="flex items-center gap-4">
                              {task.due_date && (
                                <div className="flex items-center gap-2">
                                  <svg 
                                    className="w-4 h-4" 
                                    style={{ color: currentColors.textSecondary }}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={2} 
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                    />
                                  </svg>
                                  <p
                                    className="text-xs font-medium"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {/* <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  task.task_status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : task.task_status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {task.task_status?.replace("_", " ") || "pending"}
                              </span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* View All button */}
              {allUploadedTasks.length > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => navigate("/task")}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: isDarkMode ? "#60A5FA" : "white" }}
                  >
                    View All Tasks →
                  </button>
                </div>
              )}
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
