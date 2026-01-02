import React, { useState } from "react";
import Sidebar from "../component/profsidebar";

const ProfSpacePage = () => {
  const [showMenu, setShowMenu] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("All");

  const spaces = [
    {
      id: 1,
      title: "My Space Board",
      image: "/src/assets/SpacesCover/spaceboard.jpg",
      time: "Opened 1 min ago",
      category: "Your Space",
    },
    {
      id: 2,
      title: "Lectures",
      image: "/src/assets/SpacesCover/lecture.jpg",
      time: "Opened 5 mins ago",
      category: "Your Space",
    },
    {
      id: 3,
      title: "Subject Grades",
      image: "/src/assets/SpacesCover/grades.jpg",
      time: "Opened 10 mins ago",
      category: "Your Space",
    },
    {
      id: 4,
      title: "List of Activities",
      image: "/src/assets/SpacesCover/listactivity.jpg",
      time: "Opened just now",
      category: "Your Space",
    },

    /* Classroom Spaces */
    {
      id: 5,
      title: "Thesis and Research",
      image: "/src/assets/SpacesCover/thesis.jpg",
      time: "Opened 1 min ago",
      category: "Classroom Space",
      members: 32,
      yearLevel: "4th Year",
    },
    {
      id: 6,
      title: "Operating System",
      image: "/src/assets/SpacesCover/os.jpg",
      time: "Opened 3 mins ago",
      category: "Classroom Space",
      members: 40,
      yearLevel: "3rd Year",
    },
    {
      id: 7,
      title: "CS-ELEC 2",
      image: "/src/assets/SpacesCover/code.jpg",
      time: "Opened 5 mins ago",
      category: "Classroom Space",
      members: 28,
      yearLevel: "3rd Year",
    },
    {
      id: 8,
      title: "Businteg",
      image: "/src/assets/SpacesCover/businteg.jpg",
      time: "Opened just now",
      category: "Classroom Space",
      members: 35,
      yearLevel: "4th Year",
    },
    {
      id: 9,
      title: "Modtech",
      image: "/src/assets/SpacesCover/modtech.jpg",
      time: "Opened just now",
      category: "Classroom Space",
      members: 30,
      yearLevel: "4th Year",
    },
    {
      id: 10,
      title: "MMW",
      image: "/src/assets/SpacesCover/mmw.jpg",
      time: "Opened 2 days ago",
      category: "Classroom Space",
      members: 28,
      yearLevel: "1st Year",
    },
    {
      id: 11,
      title: "Data Structure",
      image: "/src/assets/SpacesCover/datastructure.jpg",
      time: "Opened 5 days ago",
      category: "Classroom Space",
      members: 41,
      yearLevel: "1st Year",
    },
    {
      id: 12,
      title: "Physical Education 2",
      image: "/src/assets/SpacesCover/pe.jpg",
      time: "Opened 1 week ago",
      category: "Classroom Space",
      members: 45,
      yearLevel: "2nd Year",
    },
    {
      id: 13,
      title: "Understanding the Self",
      image: "/src/assets/SpacesCover/uts.jpg",
      time: "Opened 4 weeks ago",
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
        <Sidebar />
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
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="lg:hidden p-4 border-b border-[#3B4457] flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold">Spaces</h1>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Title */}
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {space.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">{space.time}</p>
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm">
                      {space.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {space.members} Students
                    </p>
                    <p className="text-gray-500 text-xs">{space.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfSpacePage;
