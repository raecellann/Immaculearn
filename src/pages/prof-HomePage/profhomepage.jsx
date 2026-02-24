import React, { useState, useEffect, useRef } from "react";
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
import { DeleteConfirmationDialog } from "../component/SweetAlert";

const ProfHomePage = () => {
  const { user } = useUser();
  const { userSpaces = [], courseSpaces = [], deleteSpace } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const navigate = useNavigate();

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

  const handleArchiveSpace = (spaceId) => {
    // TODO: Add API call to archive space
    console.log("Archive space:", spaceId);
    setShowArchiveConfirm(null);
    setShowMenu(null);
  };

  // const [currentDate, setCurrentDate] = useState('');
  // const [greeting, setGreeting] = useState('');
  // const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // const [today, setToday] = useState(new Date());
  const [slideIndexYourSpace, setSlideIndexYourSpace] = useState(0);
  const [slideIndexSpaces, setSlideIndexSpaces] = useState(0);
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
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
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const userSpaceUUIDs = new Set(userSpaces.map((s) => s.space_uuid));
  const sharedSpaces = courseSpaces.filter((s) => !userSpaceUUIDs.has(s.space_uuid));

  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(window.innerWidth >= 1024 ? 3 : 4); // 3 on laptop (lg+), 4 on tablet (md)
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const yourSlideCount = Math.max(1, Math.ceil(userSpaces.length / cardsPerView));
  const friendSlideCount = Math.max(1, Math.ceil(sharedSpaces.length / cardsPerView));

  return (
    <div className="flex font-sans min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* ================= Desktop Sidebar (Laptop+) ================= */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
          color: currentColors.text
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: isDarkMode ? '#161A20' : currentColors.background }}>
        {/* ================= Header (Mobile + Tablet) ================= */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text
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
              <h2 className="text-xl sm:text-2xl font-bold text-white font-grotesque" style={{ color: isDarkMode ? 'white' : 'black' }}>
                Get Productive Today!
              </h2>
              <p className="text-xs sm:text-sm font-inter" style={{ color: isDarkMode ? '#9ca3af' : 'black' }}>{formatFullDate()}</p>
            </div>

            {/* Welcome Card */}
            <div className="rounded-xl p-6 mb-10 flex items-center justify-between" style={{ 
              backgroundColor: currentColors.surface,
              border: isDarkMode ? 'none' : '1px solid black'
            }}>
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: isDarkMode ? '#B0C4FF' : '#1e3a8a' }}>
                    {getGreeting()}, {prefixName(capitalizeWords(user?.name?.split(" ")[0]), user?.gender) || "Professor"}
                  </h1>
                  <p className="mb-1" style={{ color: isDarkMode ? currentColors.textSecondary : '#333333' }}>Manage your classes and collaborate with students.</p>
                  <p className="mb-5" style={{ color: isDarkMode ? currentColors.textSecondary : '#666666' }}>Create spaces or join existing ones.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => navigate('/prof/space/create')} className="bg-[#007AFF] hover:bg-blue-700 text-white text-sm py-2 px-4">
                      Create Space
                    </Button>
                  </div>
                </div>
                <img
                  src="/src/assets/HomePage/book-pen.svg"
                  alt="Book & Pen"
                  className="w-32 h-32 object-contain hidden sm:block self-center"
                />
              </div>
            </div>

            {/* Task Deployed Section (Mobile/Tablet/Small Laptop Only) */}
            <div className="xl:hidden mb-8 mt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: isDarkMode ? 'white' : 'black' }}>Task Deployed</h2>
              <div className="rounded-xl p-4 sm:p-6" style={{ 
                backgroundColor: currentColors.surface,
                border: isDarkMode ? 'none' : '1px solid black'
              }}>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: isDarkMode ? '#9ca3af' : currentColors.textSecondary }} />
                  <p className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : 'black' }}>
                    No tasks created yet
                  </p>
                  <p className="text-xs mt-2" style={{ color: isDarkMode ? '#9ca3af' : 'black' }}>
                    Go to your calendar to create tasks and set reminders
                  </p>
                  <div className="mt-6">
                    <Button2 
                      text="Go to Calendar"
                      onClick={() => navigate('/prof/calendar')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Your Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: isDarkMode ? 'white' : 'black' }}>Your Space</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexYourSpace(Math.max(0, slideIndexYourSpace - 1))}
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? '#9ca3af' : 'black' }}
                    disabled={slideIndexYourSpace === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexYourSpace(Math.min(yourSlideCount - 1, slideIndexYourSpace + 1))}
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? '#9ca3af' : 'black' }}
                    disabled={slideIndexYourSpace >= yourSlideCount - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline hover:underline text-sm ml-2 bg-transparent" style={{ color: isDarkMode ? '#60A5FA' : 'black' }}>View All</button>
                </div>
              </div>

              {userSpaces.length === 0 ? (
                <div className="rounded-xl p-10 text-center border border-dashed" style={{ 
                  backgroundColor: currentColors.surface, 
                  color: currentColors.textSecondary,
                  borderColor: isDarkMode ? currentColors.border : 'black'
                }}>
                  No spaces yet — create one to get started!
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${slideIndexYourSpace * 100}%)` }}
                  >
                    {Array.from({ length: yourSlideCount }).map((_, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full h-full">
                        {userSpaces.slice(idx * cardsPerView, (idx + 1) * cardsPerView).map((space) => (
                          <div
                            key={space.space_uuid}
                            className="rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group relative"
                            style={{ 
                              backgroundColor: currentColors.surface,
                              border: isDarkMode ? 'none' : '1px solid black'
                            }}
                          >
                            <div
                              onClick={() => navigate(`/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`)}
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
                                <p className="text-gray-500 text-xs mt-1">Last active • just now</p>
                              </div>
                            </div>
                            {/* Three dots menu */}
                            <div className="absolute top-2 right-2 menu-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMenu(showMenu === space.space_uuid ? null : space.space_uuid);
                                }}
                                className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {showMenu === space.space_uuid && (
                                <div className="absolute top-8 right-0 rounded-lg shadow-lg z-10 min-w-[140px]" style={{ 
                                  backgroundColor: currentColors.surface, 
                                  border: `1px solid ${currentColors.border}` 
                                }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowArchiveConfirm(space.space_uuid);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-[#60A5FA] hover:bg-[#3B4457] rounded-t-lg"
                                  >
                                    Archive Space
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteConfirm(space.space_uuid);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-b-lg border-t border-[#3B4457]"
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

            {/* Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: isDarkMode ? currentColors.text : 'black' }}>Course Spaces</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexSpaces(Math.max(0, slideIndexSpaces - 1))}
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? currentColors.textSecondary : 'black' }}
                    disabled={slideIndexSpaces === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexSpaces(Math.min(Math.ceil(sharedSpaces.length / 3) - 1, slideIndexSpaces + 1))}
                    className="text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    style={{ color: isDarkMode ? currentColors.textSecondary : 'black' }}
                    disabled={slideIndexSpaces >= Math.ceil(sharedSpaces.length / 3) - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline hover:underline text-sm ml-2 bg-transparent" style={{ color: isDarkMode ? currentColors.textSecondary : 'black' }}>View All</button>
                </div>
              </div>

              {sharedSpaces.length === 0 ? (
                <div className="rounded-xl p-10 text-center border border-dashed" style={{ 
                  backgroundColor: currentColors.surface, 
                  color: currentColors.textSecondary,
                  borderColor: isDarkMode ? currentColors.border : 'black'
                }}>
                  No Course spaces yet
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${slideIndexSpaces * 100}%)` }}
                  >
                    {Array.from({ length: friendSlideCount }).map((_, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 min-w-full">
                        {sharedSpaces.slice(idx * cardsPerView, (idx + 1) * cardsPerView).map((space) => (
                          <div
                            key={space.space_uuid}
                            className="rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group relative"
                            style={{ 
                              backgroundColor: currentColors.surface,
                              border: isDarkMode ? 'none' : '1px solid black'
                            }}
                          >
                            <div
                              onClick={() => navigate(`/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`)}
                              className="cursor-pointer"
                            >
                              <SpaceCover
                                image={space.background_img || space.image}
                                name={space.space_name}
                                className="w-full flex-shrink-0 aspect-[3/2]"
                              />
                              <div className="p-4 flex flex-col justify-between flex-grow">
                                <h3 className="font-medium truncate">
                                  {capitalizeWords(space.space_name)}'s Space
                                </h3>
                                <p className="text-gray-400 text-xs mt-1">
                                  {(space.members?.length -1) || 0} Students
                                </p>
                                <p className="text-gray-500 text-xs mt-1">Opened just now</p>
                              </div>
                            </div>
                            {/* Three dots menu */}
                            <div className="absolute top-2 right-2 menu-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMenu(showMenu === `course-${space.space_uuid}` ? null : `course-${space.space_uuid}`);
                                }}
                                className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {showMenu === `course-${space.space_uuid}` && (
                                <div className="absolute top-8 right-0 rounded-lg shadow-lg z-10 min-w-[140px]" style={{ 
                                  backgroundColor: currentColors.surface, 
                                  border: `1px solid ${currentColors.border}` 
                                }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowArchiveConfirm(`course-${space.space_uuid}`);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-[#60A5FA] hover:bg-[#3B4457] rounded-t-lg"
                                  >
                                    Archive Space
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowLeaveConfirm(`course-${space.space_uuid}`);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3B4457] rounded-b-lg border-t border-[#3B4457]"
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

            {/* Articles Section */}
            <ArticlesScrape />
          </div>

          {/* RIGHT CONTENT - Task Deployed (Desktop Only - Sticky Sidebar) */}
          <div className="hidden xl:block w-80 rounded-xl p-6 mr-6 my-6 flex-shrink-0 self-start sticky top-4" style={{ 
            backgroundColor: currentColors.surface,
            border: isDarkMode ? 'none' : '1px solid black'
          }}>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: isDarkMode ? 'white' : 'black' }}>Task Deployed:</h4>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: isDarkMode ? '#9ca3af' : currentColors.textSecondary }} />
                <p className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : 'black' }}>
                  No tasks created yet
                </p>
                <p className="text-xs mt-2" style={{ color: isDarkMode ? '#9ca3af' : 'black' }}>
                  Go to your calendar to create tasks and set reminders
                </p>
                <div className="mt-6">
                  <Button2 
                    text="Go to Calendar"
                    onClick={() => navigate('/prof/calendar')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Space Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={!!showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(null)}
            onConfirm={handleDeleteSpace}
            space={userSpaces.find(s => s.space_uuid === showDeleteConfirm) || courseSpaces.find(s => s.space_uuid === showDeleteConfirm)}
          />

          {/* Leave Space Confirmation Dialog */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
              <div className="rounded-xl p-6 max-w-sm w-full" style={{ 
                backgroundColor: currentColors.surface, 
                border: `1px solid ${currentColors.border}` 
              }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? 'white' : 'black' }}>Leave Space</h3>
                <p className="text-sm mb-6" style={{ color: isDarkMode ? currentColors.textSecondary : 'black' }}>
                  Are you sure you want to leave this space? You'll need to be re-invited to join again.
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
                      console.log('Space left:', showLeaveConfirm);
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
              <div className="rounded-xl p-6 max-w-sm w-full" style={{ 
                backgroundColor: currentColors.surface, 
                border: `1px solid ${currentColors.border}` 
              }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? 'white' : 'black' }}>Archive Space</h3>
                <p className="text-sm mb-6" style={{ color: isDarkMode ? currentColors.textSecondary : 'black' }}>
                  Are you sure you want to archive this space? It will be
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
                    onClick={() => handleArchiveSpace(showArchiveConfirm)}
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