import React, { useState, useEffect, useRef } from "react";
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
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { SpaceCover } from "../component/spaceCover";
import ArticlesScrape from "../component/articles_scrape";
import { DeleteConfirmationDialog } from "../component/SweetAlert";

const HomePage1 = () => {
  const { user } = useUser();
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
        {
          weekday: "long",
        },
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

  // Handle delete space
  const handleDeleteSpace = async () => {
    try {
      // Get the space UUID from showDeleteConfirm
      const spaceUuid = showDeleteConfirm;
      await deleteSpace(spaceUuid);
      setShowDeleteConfirm(null);
      setShowMenu(null);
    } catch (error) {
      console.error("Failed to delete space:", error);
      // You could add a toast notification here if you have one
    }
  };

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
  // const sharedSpaces = friendSpaces.filter((s) => !allSpaces.has(s.space_uuid));

  const courseSpaceData = [
    {
      title: "Thesis and Research",
      members: "32 Students",
      image: "src/assets/SpacesCover/thesis.jpg",
      route: "/user-prof-space-thesis",
    },
    {
      title: "Operating System",
      members: "40 Students",
      image: "src/assets/SpacesCover/os.jpg",
      route: "/user-prof-space-os",
    },
    {
      title: "CS-ELEC 2",
      members: "28 Students",
      image: "src/assets/SpacesCover/code.jpg",
      route: "/user-prof-space-cselec2",
    },
    {
      title: "Businteg",
      members: "35 Students",
      image: "src/assets/SpacesCover/businteg.jpg",
      route: "/user-prof-space-businteg",
    },
    {
      title: "Modtech",
      members: "30 Students",
      image: "src/assets/SpacesCover/modtech.jpg",
      route: "/user-prof-space-modtech",
    },
    {
      title: "Data Structure",
      members: "41 Students",
      image: "src/assets/SpacesCover/datastructure.jpg",
      route: "/user-prof-space-datastructure",
    },
    {
      title: "Physical Education 2",
      members: "45 Students",
      image: "src/assets/SpacesCover/pe.jpg",
      route: "/user-prof-space-pe2",
    },
    {
      title: "Understanding the Self",
      members: "52 Students",
      image: "src/assets/SpacesCover/uts.jpg",
      route: "/user-prof-space-uts",
    },
    {
      title: "MMW",
      members: "28 Students",
      image: "src/assets/SpacesCover/mmw.jpg",
      route: "/user-prof-space-mmw",
    },
  ];

  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(window.innerWidth >= 1024 ? 3 : 4); // 3 on laptop (lg+), 4 on tablet (md)
    };

    handleResize(); // Initial check
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
    Math.ceil(courseSpaceData.length / cardsPerView),
  );

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      {/* {showLogout && (
        
      )} */}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
          <h1 className="text-xl font-bold">Home</h1>
        </div>
        <div className="lg:hidden h-16" /> {/* spacer */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 md:p-6 lg:p-8">
          {/* CENTER COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Title and Date ABOVE the card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-grotesque">
                Get Productive Today!
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-inter">
                {currentDate}
              </p>
            </div>

            {/* Welcome Card */}
            <div className="bg-[#1E242E] rounded-2xl p-6 mb-10">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-[#B0C4FF] mb-2">
                    {greeting}, {user?.name || "Student"}
                  </h1>
                  <p className="text-gray-300 mb-1">
                    Meet your classmates and collaborate with them.
                  </p>
                  <p className="text-gray-400 mb-5">
                    Join a space or create your own.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="bg-[#007AFF] hover:bg-blue-700 text-white text-sm py-2 px-4"
                      onClick={() => navigate("/space/create")}
                    >
                      Create Space
                    </Button>
                    <Button
                      className="border border-gray-600 hover:bg-gray-800 text-sm py-2 px-4"
                      onClick={() => navigate("/space")}
                    >
                      Join Space
                    </Button>
                  </div>
                </div>
                <img
                  src="src/assets/HomePage/book-pen.svg"
                  alt="Book & Pen"
                  className="w-32 h-32 object-contain hidden sm:block self-center"
                />
              </div>
            </div>

            <div className="xl:hidden mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                Reminders
              </h2>
              <div className="bg-[#1E242E] rounded-xl p-4 sm:p-6">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">No tasks created yet</p>
                  <p className="text-gray-500 text-xs mt-2">
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
                  >
                    ›
                  </button>
                  <button className="hidden sm:block text-[#60A5FA] hover:underline text-sm">
                    View All
                  </button>
                </div>
              </div>

              {userSpaces.length === 0 ? (
                <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
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
                              className="bg-[#1E242E] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform group relative h-full"
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <SpaceCover
                                  image={space.image}
                                  name={space.space_name}
                                  className="w-full flex-shrink-0 aspect-[3/2]"
                                />
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}'s Space
                                  </h3>
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
                  >
                    ›
                  </button>
                  <button className="hidden sm:block text-[#60A5FA] hover:underline text-sm">
                    View All
                  </button>
                </div>
              </div>

              {courseSpaces?.length === 0 ? (
                <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
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
                              className="bg-[#1E242E] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform group relative h-full"
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${course.space_uuid}/${encodeURIComponent(course.space_name)}`,
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <div className="relative">
                                  <SpaceCover
                                    image={course.image}
                                    name={course.space_name}
                                    className="w-full flex-shrink-0 aspect-[3/2]"
                                  />
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
                                  <p className="text-gray-500 text-xs mt-1">
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
                  >
                    ›
                  </button>
                  <button className="hidden sm:block text-[#60A5FA] hover:underline text-sm">
                    View All
                  </button>
                </div>
              </div>

              {sharedSpaces.length === 0 ? (
                <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
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
                              className="bg-[#1E242E] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform group relative h-full"
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    `/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`,
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <SpaceCover
                                  image={space.background_img || space.image}
                                  name={space.space_name}
                                  className="w-full flex-shrink-0 aspect-[3/2]"
                                />
                                <div className="p-4">
                                  <h3 className="font-medium truncate">
                                    {capitalizeWords(space.space_name)}'s Space
                                  </h3>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {space.members?.length || 0} Members
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
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
          {/* RIGHT CONTENT - Reminders (Desktop Only - Sticky Sidebar) */}
          <div className="hidden xl:block w-80 bg-[#1E242E] rounded-xl p-6 mr-6 my-6 flex-shrink-0 self-start sticky top-6">
            <div>
              <h4 className="font-semibold mb-3">Reminders</h4>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No tasks created yet</p>
                <p className="text-gray-500 text-xs mt-2">
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
        {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      </div>
    </div>
  );
};

export default HomePage1;
