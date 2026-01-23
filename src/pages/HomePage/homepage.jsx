import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";
import { BookOpen, User, GraduationCap, FileText, Calendar } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";

const HomePage1 = () => {
  const { user } = useUser();

  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [today, setToday] = useState(new Date());
  const [slideIndexYourSpace, setSlideIndexYourSpace] = useState(0);
  const [slideIndexSpaces, setSlideIndexSpaces] = useState(0);
  const [slideIndexSchoolSpace, setSlideIndexSchoolSpace] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get("role");

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

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    const weekday = now.toLocaleString('default', { weekday: 'long' });
    setCurrentDate(`${month} ${day}, ${year} (${weekday})`);

    const hour = now.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setToday(now);
  }, []);

  const yourSpaceData = [
    { title: "Lectures", members: "3 Members", image: "/src/assets/HomePage/spaces-cover/lectures.jpg" },
    { title: "Todo-Lists", members: "1 Member", image: "/src/assets/HomePage/spaces-cover/space-board.jpg" },
    { title: "Subject Grades", members: "5 Members", image: "/src/assets/HomePage/spaces-cover/grades.jpg" },
    { title: "Notes", members: "2 Members", image: "/src/assets/HomePage/spaces-cover/cover1.jpg" },
    { title: "Projects", members: "4 Members", image: "/src/assets/HomePage/spaces-cover/cover2.jpg" }
  ];

  const spacesData = [
    { title: "Zeldrick's Spaces", members: "3 Members", image: "/src/assets/HomePage/spaces-cover/cover1.jpg" },
    { title: "Wilson Space", members: "4 Members", image: "/src/assets/HomePage/spaces-cover/cover2.jpg" },
    { title: "Nath Space", members: "5 Members", image: "/src/assets/HomePage/spaces-cover/cover3.jpg" },
  ];

  const schoolSpaceData = [
    { 
      title: "Thesis and Research", 
      members: "32 Students", 
      image: "/src/assets/SpacesCover/thesis.jpg",
      route: "/user-prof-space-thesis"
    },
    { 
      title: "Operating System", 
      members: "40 Students", 
      image: "/src/assets/SpacesCover/os.jpg",
      route: "/user-prof-space-os"
    },
    { 
      title: "CS-ELEC 2", 
      members: "28 Students", 
      image: "/src/assets/SpacesCover/code.jpg",
      route: "/user-prof-space-cselec2"
    },
    { 
      title: "Businteg", 
      members: "35 Students", 
      image: "/src/assets/SpacesCover/businteg.jpg",
      route: "/user-prof-space-businteg"
    },
    { 
      title: "Modtech", 
      members: "30 Students", 
      image: "/src/assets/SpacesCover/modtech.jpg",
      route: "/user-prof-space-modtech"
    },
    { 
      title: "Data Structure", 
      members: "41 Students", 
      image: "/src/assets/SpacesCover/datastructure.jpg",
      route: "/user-prof-space-datastructure"
    },
    { 
      title: "Physical Education 2", 
      members: "45 Students", 
      image: "/src/assets/SpacesCover/pe.jpg",
      route: "/user-prof-space-pe2"
    },
    { 
      title: "Understanding the Self", 
      members: "52 Students", 
      image: "/src/assets/SpacesCover/uts.jpg",
      route: "/user-prof-space-uts"
    },
    { 
      title: "MMW", 
      members: "28 Students", 
      image: "/src/assets/SpacesCover/mmw.jpg",
      route: "/user-prof-space-mmw"
    }
  ];

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* ================= Desktop Sidebar (Laptop+) ================= */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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
        <div className="flex-1 flex flex-col xl:flex-row gap-6 overflow-y-auto">
          {/* CENTER CONTENT */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
            {/* Title and Date ABOVE the card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-grotesque">
                Get Productive Today!
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-inter">{currentDate}</p>
            </div>

            {/* Header Card */}
            <div className="bg-[#1E242E] rounded-xl p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-[#B0C4FF] mb-1">
                    {greeting}, {user && user.name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Meet your classmates and collaborate with them.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Join space or create your own.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button className="text-sm py-1.5 px-4 w-full sm:w-auto">Create Space</Button>
                    <Button className="text-sm py-1.5 px-4 w-full sm:w-auto">Join Space</Button>
                  </div>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <img
                    src="/src/assets/HomePage/book-pen.svg"
                    alt="Book and Pen"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Reminders Section (Mobile/Tablet/Small Laptop Only) */}
            <div className="xl:hidden mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Reminders</h2>
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
                    onClick={() => setSlideIndexYourSpace(Math.min(Math.ceil(yourSpaceData.length / 3) - 1, slideIndexYourSpace + 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexYourSpace >= Math.ceil(yourSpaceData.length / 3) - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {yourSpaceData.slice(slideIndexYourSpace * 3, (slideIndexYourSpace + 1) * 3).map((space, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-xl overflow-hidden transition hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="relative">
                      <img
                        src={space.image}
                        alt={space.title}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => setShowMenu(showMenu === `your-${i}` ? null : `your-${i}`)}
                          className="bg-black/60 hover:bg-black text-white w-6 h-6 flex items-center justify-center rounded-md"
                        >
                          ...
                        </button>
                        {showMenu === `your-${i}` && (
                          <div className="absolute top-8 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setShowDeleteConfirm(`your-${i}`)}
                                className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm"
                              >
                                Delete Space
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm">{space.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{space.members}</p>
                      <p className="text-gray-500 text-xs mt-1">{space.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Space Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold">Course Space</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexSchoolSpace(Math.max(0, slideIndexSchoolSpace - 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSchoolSpace === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexSchoolSpace(Math.min(Math.ceil(schoolSpaceData.length / 3) - 1, slideIndexSchoolSpace + 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSchoolSpace >= Math.ceil(schoolSpaceData.length / 3) - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolSpaceData.slice(slideIndexSchoolSpace * 3, (slideIndexSchoolSpace + 1) * 3).map((space, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-xl overflow-hidden transition hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    onClick={() => window.location.href = space.route}
                  >
                    <div className="relative">
                      <img
                        src={space.image}
                        alt={space.title}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === `school-${i}` ? null : `school-${i}`);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-6 h-6 flex items-center justify-center rounded-md"
                        >
                          ...
                        </button>
                        {showMenu === `school-${i}` && (
                          <div className="absolute top-8 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setShowLeaveConfirm(`school-${i}`)}
                                className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm"
                              >
                                Leave Space
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm">{space.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{space.members}</p>
                      <p className="text-gray-500 text-xs mt-1">{space.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spaces Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold">Friends Space</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSlideIndexSpaces(Math.max(0, slideIndexSpaces - 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSpaces === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSlideIndexSpaces(Math.min(Math.ceil(spacesData.length / 3) - 1, slideIndexSpaces + 1))}
                    className="text-gray-400 hover:text-white text-lg px-2 py-1 rounded bg-transparent disabled:opacity-30"
                    disabled={slideIndexSpaces >= Math.ceil(spacesData.length / 3) - 1}
                  >
                    ›
                  </button>
                  <button className="hidden sm:inline text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spacesData.slice(slideIndexSpaces * 3, (slideIndexSpaces + 1) * 3).map((space, i) => (
                  <div
                    key={i}
                    className="bg-[#1E242E] rounded-xl overflow-hidden transition hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    onClick={() => {
                      if (space.title === "Zeldrick's Spaces") {
                        window.location.href = "/user-space-zj";
                      }
                    }}
                  >
                    <div className="relative">
                      <img
                        src={space.image}
                        alt={space.title}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === i ? null : i);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-6 h-6 flex items-center justify-center rounded-md"
                        >
                          ...
                        </button>
                        {showMenu === i && (
                          <div className="absolute top-8 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowLeaveConfirm(i);
                                }}
                                className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm"
                              >
                                Leave Space
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm">{space.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">{space.members}</p>
                      <p className="text-gray-500 text-xs mt-1">{space.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Articles Section */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#1E242E] h-32 rounded-lg hover:bg-[#242B38] transition"></div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT - Reminders (Desktop Only - Sticky Sidebar) */}
          <div className="hidden xl:block w-80 bg-[#1E242E] rounded-xl p-6 mr-6 my-6 flex-shrink-0 self-start sticky top-6">
            <div>
              <h4 className="font-semibold mb-3">Reminders</h4>
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
  );
};

export default HomePage1;
