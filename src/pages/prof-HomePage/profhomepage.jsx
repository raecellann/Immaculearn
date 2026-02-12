import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import Button from "../component/Button";
import {
  BookOpen,
  User,
  GraduationCap,
  FileText,
  Calendar,
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { prefixName } from "../../utils/prefixNameFormat";
import { formatFullDate } from "../../utils/formatTime";
import { getGreeting } from "../../utils/greetings";
import { SpaceCover } from "../component/spaceCover";
import Logout from "../component/logout";
import ArticlesScrape from "../component/articles_scrape";

const ProfHomePage = () => {
  const { user } = useUser();
  const { userSpaces = [], courseSpaces = [] } = useSpace();
  const navigate = useNavigate();

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



  const userSpaceUUIDs = new Set(userSpaces.map((s) => s.space_uuid));
  const sharedSpaces = courseSpaces.filter((s) => !userSpaceUUIDs.has(s.space_uuid));

  const cardsPerView = 3;
  const yourSlideCount = Math.max(1, Math.ceil(userSpaces.length / cardsPerView));
  const friendSlideCount = Math.max(1, Math.ceil(sharedSpaces.length / cardsPerView));

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ================= Header (Mobile + Tablet) ================= */}
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

        {/* ================= Spacer for fixed header ================= */}
        <div className="lg:hidden h-16"></div>

        {/* ================= Page Content Wrapper ================= */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 md:p-6 lg:p-8">
          {/* CENTER COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Title and Date ABOVE the card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-grotesque">
                Get Productive Today!
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-inter">{formatFullDate()}</p>
            </div>

            {/* Welcome Card */}
            <div className="bg-[#1E242E] rounded-2xl p-6 mb-10">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-[#B0C4FF] mb-2">
                    {getGreeting()}, {prefixName(capitalizeWords(user?.name?.split(" ")[0]), user?.gender) || "Professor"}
                  </h1>
                  <p className="text-gray-300 mb-1">Manage your classes and collaborate with students.</p>
                  <p className="text-gray-400 mb-5">Create spaces or join existing ones.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => navigator('/prof/spaces')} className="bg-[#007AFF] hover:bg-blue-700 text-white text-sm py-2 px-4">Create Space</Button>
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
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Task Deployed</h2>
              <div className="bg-[#1E242E] rounded-xl p-4 sm:p-6">
                <ul className="space-y-3 text-sm">
                  <li className="bg-[#2E3440] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-blue-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Week 7 Reflection Paper</p>
                        <p className="text-gray-400 text-xs">Operating System – Oct 15</p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-[#2E3440] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="text-green-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Week 8 Individual Activity</p>
                        <p className="text-gray-400 text-xs">Data Communications – Oct 24</p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-[#2E3440] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-orange-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Chapter 1 Thesis Paper</p>
                        <p className="text-gray-400 text-xs">Thesis – Oct 28</p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-[#2E3440] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-purple-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Midterm Exam Review</p>
                        <p className="text-gray-400 text-xs">Mathematics – Nov 5</p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-[#2E3440] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-red-400 w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Group Project Meeting</p>
                        <p className="text-gray-400 text-xs">Software Engineering – Nov 10</p>
                      </div>
                    </div>
                  </li>
                </ul>
                <button className="mt-4 text-[#007AFF] hover:underline text-sm bg-transparent">See All</button>
              </div>
            </div>

            {/* Your Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold">Your Space</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexYourSpace(Math.max(0, slideIndexYourSpace - 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexYourSpace === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexYourSpace(Math.min(yourSlideCount - 1, slideIndexYourSpace + 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexYourSpace >= yourSlideCount - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
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
                    style={{ transform: `translateX(-${slideIndexYourSpace * 100}%)` }}
                  >
                    {Array.from({ length: yourSlideCount }).map((_, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 min-w-full flex-shrink-0">
                        {userSpaces.slice(idx * cardsPerView, (idx + 1) * cardsPerView).map((space) => (
                          <div
                            key={space.space_uuid}
                            onClick={() => navigate(`/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`)}
                            className="bg-[#1E242E] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group"
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
                <h2 className="text-lg sm:text-xl font-semibold">Course Spaces</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexSpaces(Math.max(0, slideIndexSpaces - 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSpaces === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexSpaces(Math.min(Math.ceil(sharedSpaces.length / 3) - 1, slideIndexSpaces + 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSpaces >= Math.ceil(sharedSpaces.length / 3) - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
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
                    style={{ transform: `translateX(-${slideIndexSpaces * 100}%)` }}
                  >
                    {Array.from({ length: friendSlideCount }).map((_, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 min-w-full">
                        {sharedSpaces.slice(idx * cardsPerView, (idx + 1) * cardsPerView).map((space) => (
                          <div
                            key={space.space_uuid}
                            onClick={() => navigate(`/prof/space/${space.space_uuid}/${encodeURIComponent(space.space_name)}`)}
                            className="bg-[#1E242E] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer group"
                          >
                            <SpaceCover
                              image={space.background_img || space.image}
                              name={space.space_name}
                              className="w-full flex-shrink-0"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMenu(`friend-${space.space_uuid}`);
                                }}
                                className="bg-black/70 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                              >
                                …
                              </button>
                            </div>

                            {showMenu === `friend-${space.space_uuid}` && (
                              <div className="absolute top-12 right-3 bg-[#242B38] rounded-lg shadow-xl p-2 z-20 border border-[#3B4457] min-w-40">
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded text-sm">
                                  View Details
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded text-sm"
                                  onClick={() => setShowLeaveConfirm(`friend-${space.space_uuid}`)}
                                >
                                  Leave Space
                                </button>
                              </div>
                            )}

                            <div className="p-4">
                              <h3 className="font-medium truncate">
                                {capitalizeWords(space.space_name)}'s Space
                              </h3>
                              <p className="text-gray-400 text-xs mt-1">
                                {(space.members?.length -1) || 0} Students
                              </p>
                              <p className="text-gray-500 text-xs mt-1">Opened just now</p>
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
          <div className="hidden xl:block w-80 bg-[#1E242E] rounded-xl p-6 mr-6 my-6 flex-shrink-0 self-start sticky top-4">
            <div>
              <h4 className="font-semibold mb-3">Task Deployed:</h4>
              <ul className="space-y-3 text-sm">
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-400 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Week 7 Reflection Paper</p>
                      <p className="text-gray-400 text-xs">Operating System – Oct 15</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="text-green-400 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Week 8 Individual Activity</p>
                      <p className="text-gray-400 text-xs">Data Communications – Oct 24</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-orange-400 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Chapter 1 Thesis Paper</p>
                      <p className="text-gray-400 text-xs">Thesis – Oct 28</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-purple-400 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Midterm Exam Review</p>
                      <p className="text-gray-400 text-xs">Mathematics – Nov 5</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-red-400 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Group Project Meeting</p>
                      <p className="text-gray-400 text-xs">Software Engineering – Nov 10</p>
                    </div>
                  </div>
                </li>
              </ul>
              <button className="mt-4 text-[#007AFF] hover:underline text-sm bg-transparent">See All</button>
            </div>
          </div>

          {/* Delete Space Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm mx-4 border border-[#3B4457]">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Space</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to delete this space? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle delete action here
                      console.log('Space deleted:', showDeleteConfirm);
                      setShowDeleteConfirm(null);
                      setShowMenu(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leave Space Confirmation Dialog */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-[#1E242E] rounded-xl p-6 max-w-sm mx-4 border border-[#3B4457]">
                <h3 className="text-lg font-semibold text-white mb-2">Leave Space</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to leave this space? You'll need to be re-invited to join again.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowLeaveConfirm(null)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
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
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                  >
                    Leave
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