import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import Logout from "../component/logout";
import Button from "../component/Button";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { prefixName } from "../../utils/prefixNameFormat";
import { SpaceCover } from "../component/spaceCover";
import { DeleteConfirmationDialog } from "../component/SweetAlert";
import { toast } from "react-toastify";

const SpacePage = () => {
  const { user } = useUser();
  const {
    userSpaces,
    friendSpaces,
    courseSpaces,
    joinSpace,
    deleteSpace,
    leaveSpace,
  } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Cover photos state
  const [spaceCoverPhotos, setSpaceCoverPhotos] = useState({});

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide-on-scroll header
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  const handleLeaveSpace = async () => {
    try {
      const spaceUuid = showLeaveConfirm;
      await leaveSpace(spaceUuid);
      setShowLeaveConfirm(null);
      setShowMenu(null);
    } catch (error) {
      console.error("Failed to delete space:", error);
    }
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

  // Handle hash navigation for smooth scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#your-spaces") {
      const element = document.getElementById("your-spaces");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

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

  // Join Space Functionality
  const handleJoinRequestSubmit = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid join code");
      return;
    }

    setLoading(true);

    try {
      const result = await joinSpace(joinCode);

      if (result.success) {
        // alert("Successfully joined the space!");
        toast.success("Successfully joined the space!");
        setJoinCode("");
      } else {
        // alert(result.message || "Failed to join space");
        toast.error(result.message || "Failed to join space");
      }
    } catch (error) {
      console.error("Error joining space:", error);
      alert(error.message || "An error occurred while joining the space");
    } finally {
      setLoading(false);
    }
  };

  // Filter shared spaces
  const allSpaces = new Set([
    ...(userSpaces || []).map((space) => space.space_uuid),
    ...(courseSpaces || []).map((space) => space.space_uuid),
  ]);

  const sharedSpaces = (friendSpaces || []).filter(
    (space) =>
      !allSpaces.has(space.space_uuid) &&
      space.members?.some((member) => member.account_id === user?.id),
  );

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

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode
              ? "rgb(22, 26, 32)"
              : currentColors.surface,
            borderColor: isDarkMode ? "rgb(55, 65, 81)" : currentColors.border,
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
            Spaces
          </h1>
        </div>

        <div className="lg:hidden h-16"></div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="hidden md:flex items-center justify-center mb-8">
            <h1
              className="text-4xl font-bold"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Spaces
            </h1>
          </div>

          {/* Welcome Section */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{
              background:
                "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
              border: isDarkMode ? "1px solid #3B4457" : "1px solid black",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "white" }}
                >
                  Good Morning, {user && user.first_name}
                </h2>
                <p className="text-sm mb-4" style={{ color: "white" }}>
                  Join space or create your own.
                </p>

                <Button
                  onClick={() => navigate("/space/create")}
                  style={{ border: "1px solid black" }}
                >
                  Create Space
                </Button>
              </div>

              <div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "white" }}
                >
                  Enter Code to Join Space
                </h3>
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: isDarkMode
                      ? "#1E242E"
                      : currentColors.surface,
                    border: isDarkMode
                      ? "1px solid #3B4457"
                      : "1px solid black",
                  }}
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter join code..."
                    className="w-full bg-transparent border-b pb-2 focus:outline-none placeholder-gray-500"
                    style={{
                      borderColor: isDarkMode ? "#3B4457" : "black",
                      color: isDarkMode ? "white" : "black",
                    }}
                  />

                  <div className="mt-6">
                    <Button
                      disabled={loading}
                      onClick={handleJoinRequestSubmit}
                      style={{ border: "1px solid black" }}
                    >
                      {loading ? "Joining..." : "Join Space"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YOUR SPACES */}
          <div id="your-spaces" className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Your Spaces
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userSpaces && userSpaces.length > 0 ? (
                userSpaces.map((space, index) => (
                  <div
                    key={space.space_uuid}
                    className="group rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer relative hover-lift"
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
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/space/${space?.space_uuid}/${space.space_name}`,
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
                      <div
                        className="relative overflow-hidden h-40"
                        style={{
                          backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
                        }}
                      >
                        <SpaceCover
                          image={
                            spaceCoverPhotos[space.space_uuid] || space.image
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
                          {capitalizeWords(space.space_name) + "'s Space"}
                        </h3>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#9ca3af" : "#666666" }}
                        >
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

          {/* COURSE SPACES */}
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Courses Spaces
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseSpaces && courseSpaces.length > 0 ? (
                courseSpaces.map((course, index) => (
                  <div
                    key={course.space_uuid}
                    className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative hover-lift"
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
                      <div
                        className="relative h-40 overflow-hidden"
                        style={{
                          backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
                        }}
                      >
                        <SpaceCover
                          image={
                            spaceCoverPhotos[course.space_uuid] ||
                            course.background_img ||
                            course.image
                          }
                          name={course.space_name}
                          className="w-full h-full object-cover transition duration-300"
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
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          {capitalizeWords(course.space_name)}'s Space
                        </h3>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#9ca3af" : "#666666" }}
                        >
                          <span>
                            {course.professor &&
                              `Prof. ${capitalizeWords(course.professor?.name.split(" ")[0])}`}
                          </span>
                          <br></br>•{" "}
                          {course.space_type === "course"
                            ? course.members?.length - 1
                            : course.members?.length || 0}{" "}
                          Students
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#6b7280" : "#4b5563" }}
                        >
                          {course.space_day} (
                          {`${formatTime(course.space_time_start)} - ${formatTime(course.space_time_end)}`}
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

          {/* FRIENDS SPACES */}
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: isDarkMode ? "white" : "black" }}
            >
              Friends Space
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedSpaces.length > 0 ? (
                sharedSpaces.map((space, index) => (
                  <div
                    key={space.space_uuid}
                    className="group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer relative hover-lift"
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
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/space/${space?.space_uuid}/${space.space_name}`,
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
                      <div
                        className="relative h-40 overflow-hidden"
                        style={{
                          backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
                        }}
                      >
                        <SpaceCover
                          image={
                            spaceCoverPhotos[space.space_uuid] || space.image
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
                          {capitalizeWords(space.space_name) + "'s Space"}
                        </h3>
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#9ca3af" : "#666666" }}
                        >
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
                  No friends space found
                </div>
              )}
            </div>
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
                re-invited to rejoin.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLeaveConfirm(null)}
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveSpace}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
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

export default SpacePage;
