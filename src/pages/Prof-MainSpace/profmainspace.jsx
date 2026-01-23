import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";

const ProfSpacePage = () => {
  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("All");
  const [showLogout, setShowLogout] = useState(false);

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

  const spaces = [
    {
      id: 1,
      title: "My Space Board",
      image: "/src/assets/SpacesCover/spaceboard.jpg",
      category: "Your Space",
      members: Math.floor(Math.random() * 10) + 1,
    },
    {
      id: 2,
      title: "Lectures",
      image: "/src/assets/SpacesCover/lecture.jpg",
      category: "Your Space",
      members: Math.floor(Math.random() * 10) + 1,
    },
    {
      id: 3,
      title: "Subject Grades",
      image: "/src/assets/SpacesCover/grades.jpg",
      category: "Your Space",
      members: Math.floor(Math.random() * 10) + 1,
    },
    {
      id: 4,
      title: "List of Activities",
      image: "/src/assets/SpacesCover/listactivity.jpg",
      category: "Your Space",
      members: Math.floor(Math.random() * 10) + 1,
    },
    {
      id: 5,
      title: "Thesis and Research",
      image: "/src/assets/SpacesCover/thesis.jpg",
      category: "Classroom Space",
      members: 32,
      yearLevel: "4th Year",
    },
    {
      id: 6,
      title: "Operating System",
      image: "/src/assets/SpacesCover/os.jpg",
      category: "Classroom Space",
      members: 40,
      yearLevel: "3rd Year",
    },
    {
      id: 7,
      title: "CS-ELEC 2",
      image: "/src/assets/SpacesCover/code.jpg",
      category: "Classroom Space",
      members: 28,
      yearLevel: "3rd Year",
    },
    {
      id: 8,
      title: "Businteg",
      image: "/src/assets/SpacesCover/businteg.jpg",
      category: "Classroom Space",
      members: 35,
      yearLevel: "4th Year",
    },
    {
      id: 9,
      title: "Modtech",
      image: "/src/assets/SpacesCover/modtech.jpg",
      category: "Classroom Space",
      members: 30,
      yearLevel: "4th Year",
    },
    {
      id: 10,
      title: "MMW",
      image: "/src/assets/SpacesCover/mmw.jpg",
      category: "Classroom Space",
      members: 28,
      yearLevel: "1st Year",
    },
    {
      id: 11,
      title: "Data Structure",
      image: "/src/assets/SpacesCover/datastructure.jpg",
      category: "Classroom Space",
      members: 41,
      yearLevel: "1st Year",
    },
    {
      id: 12,
      title: "Physical Education 2",
      image: "/src/assets/SpacesCover/pe.jpg",
      category: "Classroom Space",
      members: 45,
      yearLevel: "2nd Year",
    },
    {
      id: 13,
      title: "Understanding the Self",
      image: "/src/assets/SpacesCover/uts.jpg",
      category: "Classroom Space",
      members: 52,
      yearLevel: "2nd Year",
    },
  ];

  const yourSpaces = spaces.filter((s) => s.category === "Your Space");
  const classroomSpaces = spaces.filter(
    (s) =>
      s.category === "Classroom Space" &&
      (yearFilter === "All" || s.yearLevel === yearFilter)
  );

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 STICKY MOBILE / TABLET HEADER */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457] px-4 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center h-14 pt-[env(safe-area-inset-top)] gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">Spaces</h1>
          </div>
        </div>

        {/* 🔹 Spacer */}
        <div className="lg:hidden h-16" />

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Desktop Title */}
          <div className="hidden md:flex justify-center mb-8">
            <h1 className="text-4xl font-bold">Spaces</h1>
          </div>

          {/* Welcome */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-10 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  Good Morning, Sir Jober
                </h2>
                <p className="text-gray-300 text-sm">
                  Meet your students and collaborate with them.
                </p>
                <p className="text-gray-300 text-sm">
                  Create and manage your classroom spaces.
                </p>
              </div>
              <div className="flex md:justify-end">
                <button className="px-6 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg font-medium text-sm transition w-full md:w-auto">
                  Create Space
                </button>
              </div>
            </div>
          </div>

          {/* Your Space */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Space</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {yourSpaces.map((space) => (
                <div
                  key={space.id}
                  className="group bg-[#1E242E] rounded-lg overflow-hidden border border-[#3B4457] hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative h-40 bg-gray-800 overflow-hidden">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() => setShowMenu(showMenu === `your-${space.id}` ? null : `your-${space.id}`)}
                        className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                      >
                        <span className="text-lg font-bold">...</span>
                      </button>
                      {showMenu === `your-${space.id}` && (
                        <div className="absolute top-10 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => setShowDeleteConfirm(`your-${space.id}`)}
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
                    <h3 className="font-semibold text-white text-sm truncate">
                      {space.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {space.members} Members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classroom Spaces */}
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-2xl font-bold">Classroom Spaces</h2>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Year Level:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-[#1E242E] border border-[#3B4457] text-sm text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                >
                  <option value="All">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classroomSpaces.map((space) => (
                <div
                  key={space.id}
                  className="group bg-[#1E242E] rounded-xl overflow-hidden border border-[#3B4457] hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative h-40 bg-gray-800 overflow-hidden">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() => setShowMenu(showMenu === space.id ? null : space.id)}
                        className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                      >
                        <span className="text-lg font-bold">...</span>
                      </button>
                      {showMenu === space.id && (
                        <div className="absolute top-10 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => setShowLeaveConfirm(space.id)}
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
                    <h3 className="font-semibold text-white text-sm">
                      {space.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {space.members} Students
                    </p>
                  </div>
                </div>
              ))}
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

export default ProfSpacePage;
