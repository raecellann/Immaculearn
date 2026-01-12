import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";

const SpacePage = () => {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();

  // 🔹 ADDED: mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 🔹 ADDED: hide-on-scroll state
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

  // Space data structure matching homepage
  const spaces = [
    {
      id: 1,
      title: "My Space Board",
      image: "/src/assets/HomePage/spaces-cover/space-board.jpg",
      time: "Opened 1 min ago",
      category: "Your Space",
      members: 3,
      description: "Manage your personal space and board",
    },
    {
      id: 2,
      title: "Lectures",
      image: "/src/assets/HomePage/spaces-cover/lectures.jpg",
      time: "Opened 1 min ago",
      category: "Your Space",
      members: 5,
      description: "View and organize lecture materials",
    },
    {
      id: 3,
      title: "Subject Grades",
      image: "/src/assets/HomePage/spaces-cover/grades.jpg",
      time: "Opened 10 mins ago",
      category: "Your Space",
      members: 4,
      description: "Track your grades by subject",
    },
    {
      id: 4,
      title: "Todo List",
      image: "/src/assets/HomePage/spaces-cover/cover1.jpg",
      time: "Opened 5 min ago",
      category: "Your Space",
      members: 2,
      description: "Manage your daily tasks",
    },
    {
      id: 5,
      title: "Todo List",
      image: "/src/assets/HomePage/spaces-cover/cover2.jpg",
      time: "Opened 5 min ago",
      category: "Your Space",
      members: 2,
      description: "Additional task management",
    },
    {
      id: 6,
      title: "Zeldrick's Spaces",
      image: "/src/assets/HomePage/spaces-cover/cover1.jpg",
      time: "Opened just now",
      category: "Friends Space",
      members: 3,
      description: "Collaborate with Zeldrick",
    },
    {
      id: 7,
      title: "Wilson Space",
      image: "/src/assets/HomePage/spaces-cover/cover2.jpg",
      time: "Opened 1 min ago",
      category: "Friends Space",
      members: 4,
      description: "Collaborate with Wilson",
    },
    {
      id: 8,
      title: "Nath Space",
      image: "/src/assets/HomePage/spaces-cover/cover3.jpg",
      time: "Opened 5 min ago",
      category: "Friends Space",
      members: 5,
      description: "Collaborate with Nath",
    },
  ];

  const yourSpaces = spaces.filter((s) => s.category === "Your Space");
  const friendsSpaces = spaces.filter((s) => s.category === "Friends Space");

  // Navigation handler for enrolled classes
  const handleClassClick = (classItem) => {
    // Map class titles to user-accessible professor space routes
    const routeMap = {
      "Thesis and Research": "/user-prof-space/thesis",
      "Operating System": "/user-prof-space/os",
      "CS-ELEC 2": "/user-prof-space/cselec2",
      "Businteg": "/user-prof-space/businteg",
      "Modtech": "/user-prof-space/modtech",
      "Data Structure": "/user-prof-space/datastructure",
      "Physical Education 2": "/user-prof-space/pe2",
      "Understanding the Self": "/user-prof-space/uts",
      "MMW": "/user-prof-space/mmw"
    };
    
    const route = routeMap[classItem.title];
    if (route) {
      navigate(route);
    }
  };

  // Slider state for enrolled classes
  const [enrolledClassSlideIndex, setEnrolledClassSlideIndex] = useState(0);

  // User's enrolled classes (from professor space subjects)
  const enrolledClasses = [
    {
      id: 9,
      title: "Thesis and Research",
      image: "/src/assets/SpacesCover/thesis.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 32,
      yearLevel: "4th Year",
      instructor: "Prof. Smith",
      schedule: "MWF 10:00-11:30 AM",
      description: "Advanced research methodology and thesis writing"
    },
    {
      id: 10,
      title: "Operating System",
      image: "/src/assets/SpacesCover/os.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 40,
      yearLevel: "3rd Year",
      instructor: "Prof. Johnson",
      schedule: "TTH 2:00-3:30 PM",
      description: "Operating system concepts and implementation"
    },
    {
      id: 11,
      title: "CS-ELEC 2",
      image: "/src/assets/SpacesCover/code.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 28,
      yearLevel: "3rd Year",
      instructor: "Prof. Davis",
      schedule: "MWF 8:00-9:30 AM",
      description: "Advanced programming concepts"
    },
    {
      id: 12,
      title: "Businteg",
      image: "/src/assets/SpacesCover/businteg.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 35,
      yearLevel: "4th Year",
      instructor: "Prof. Wilson",
      schedule: "TTH 10:00-11:30 AM",
      description: "Business integration and systems analysis"
    },
    {
      id: 13,
      title: "Modtech",
      image: "/src/assets/SpacesCover/modtech.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 30,
      yearLevel: "4th Year",
      instructor: "Prof. Brown",
      schedule: "MWF 2:00-3:30 PM",
      description: "Modern technology and innovation"
    },
    {
      id: 14,
      title: "Data Structure",
      image: "/src/assets/SpacesCover/datastructure.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 41,
      yearLevel: "1st Year",
      instructor: "Prof. Miller",
      schedule: "TTH 8:00-9:30 AM",
      description: "Data structures and algorithms"
    },
    {
      id: 15,
      title: "Physical Education 2",
      image: "/src/assets/SpacesCover/pe.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 45,
      yearLevel: "2nd Year",
      instructor: "Prof. Garcia",
      schedule: "WF 1:00-2:30 PM",
      description: "Physical fitness and sports activities"
    },
    {
      id: 16,
      title: "Understanding the Self",
      image: "/src/assets/SpacesCover/uts.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 52,
      yearLevel: "2nd Year",
      instructor: "Prof. Martinez",
      schedule: "MWF 11:00-12:30 PM",
      description: "Personal development and self-awareness"
    },
    {
      id: 17,
      title: "MMW",
      image: "/src/assets/SpacesCover/mmw.jpg",
      time: "Class in progress",
      category: "Enrolled Classes",
      members: 28,
      yearLevel: "1st Year",
      instructor: "Prof. Anderson",
      schedule: "TTH 3:00-4:30 PM",
      description: "Mathematics in the modern world"
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
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= Tablet Sidebar ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar />
      </div>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col">
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
          <h1 className="text-xl font-bold">Spaces</h1>
        </div>

        {/* ================= Spacer for fixed header ================= */}
        <div className="lg:hidden h-16"></div>

        {/* ================= Page Content ================= */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Header (Desktop only – original) */}
          <div className="hidden md:flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">Spaces</h1>
            </div>
          </div>

          {/* ================= Welcome Section ================= */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-8 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side */}
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  Good Morning, {user && user.name}
                </h2>
                <p className="text-gray-300 text-sm mb-1">
                  Meet your classmates and collaborate with them
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  Join space or create your own.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/create-space-admin")}
                    className="px-6 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg font-medium text-sm transition"
                  >
                    Create Space
                  </button>
                </div>
              </div>

              {/* Right side */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Enter Code to Join Space
                </h3>
                <div className="bg-[#1E242E] rounded-lg p-4 border border-[#3B4457]">
                  <input
                    type="text"
                    placeholder="Enter join code..."
                    className="w-full bg-transparent border-b border-[#3B4457] text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-[#0EA5E9]"
                  />
                  <button
                    onClick={() => alert("Join Space Click!")}
                    className="mt-4 w-full px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg font-medium text-sm transition"
                  >
                    Join Space
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Your Space Section ================= */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Space</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {yourSpaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-[#1E242E] rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                >
                  <div className="relative overflow-hidden h-40 bg-gray-800">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />

                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() =>
                          setShowMenu(
                            showMenu === `your-${space.id}`
                              ? null
                              : `your-${space.id}`
                          )
                        }
                        className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                      >
                        <span className="text-lg font-bold">...</span>
                      </button>

                      {showMenu === `your-${space.id}` && (
                        <div className="absolute top-10 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                          <div className="flex flex-col gap-2">
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-[#3B4457] text-white text-sm">
                              View Details
                            </button>
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm">
                              Leave Space
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
                    <p className="text-gray-500 text-xs mt-1">{space.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= Friends Space Section ================= */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Friends Space</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsSpaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457]"
                >
                  <div className="relative h-40 bg-gray-800">
                    <img
                      src={space.image}
                      alt={space.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />

                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() =>
                          setShowMenu(showMenu === space.id ? null : space.id)
                        }
                        className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                      >
                        <span className="text-lg font-bold">...</span>
                      </button>

                      {showMenu === space.id && (
                        <div className="absolute top-10 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                          <div className="flex flex-col gap-2">
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-[#3B4457] text-white text-sm">
                              View Details
                            </button>
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm">
                              Leave Space
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {space.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-1">
                      {space.members} Members
                    </p>
                    <p className="text-gray-500 text-xs">{space.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= Enrolled Classes Section ================= */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Enrolled Classes</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEnrolledClassSlideIndex(Math.max(0, enrolledClassSlideIndex - 1))}
                  disabled={enrolledClassSlideIndex === 0}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  onClick={() => setEnrolledClassSlideIndex(Math.min(Math.ceil(enrolledClasses.length / 6) - 1, enrolledClassSlideIndex + 1))}
                  disabled={enrolledClassSlideIndex >= Math.ceil(enrolledClasses.length / 6) - 1}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledClasses.slice(enrolledClassSlideIndex * 6, (enrolledClassSlideIndex + 1) * 6).map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457]"
                >
                  <div className="relative h-40 bg-gray-800">
                    <img
                      src={classItem.image}
                      alt={classItem.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />

                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() =>
                          setShowMenu(showMenu === `class-${classItem.id}` ? null : `class-${classItem.id}`)
                        }
                        className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                      >
                        <span className="text-lg font-bold">...</span>
                      </button>

                      {showMenu === `class-${classItem.id}` && (
                        <div className="absolute top-10 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                          <div className="flex flex-col gap-2">
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-[#3B4457] text-white text-sm">
                              View Details
                            </button>
                            <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm">
                              Drop Class
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Year Level Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {classItem.yearLevel}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {classItem.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-1">
                      {classItem.instructor} • {classItem.members} Students
                    </p>
                    <p className="text-gray-500 text-xs mb-2">{classItem.schedule}</p>
                    <p className="text-gray-400 text-xs line-clamp-2">{classItem.description}</p>
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

export default SpacePage;
