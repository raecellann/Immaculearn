import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import Logout from "../component/logout";
import Button from "../component/Button";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { SpaceCover } from "../component/spaceCover";

const SpacePage = () => {
  const { user } = useUser();
  const { userSpaces, friendSpaces, joinSpace } = useSpace();

  console.log("userspaces:", userSpaces)

  const [showMenu, setShowMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Hide-on-scroll header
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

  // Join Space Functionality (from sample)
  const handleJoinRequestSubmit = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid join code");
      return;
    }

    setLoading(true);

    try {
      const res = await joinSpace(joinCode);
      console.log(res);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter shared spaces (same logic as sample)
  const userSpaceUUIDs = new Set(
    (userSpaces || []).map(space => space.space_uuid)
  );

  const sharedSpaces = (friendSpaces || []).filter(
    space => !userSpaceUUIDs.has(space.space_uuid)
  );

  // Courses Spaces (static – kept from original design)
  const [enrolledClassSlideIndex, setEnrolledClassSlideIndex] = useState(0);

  const enrolledClasses = [
    {
      id: 9,
      title: "Thesis and Research",
      image: "/src/assets/SpacesCover/thesis.jpg",
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
      members: 40,
      yearLevel: "3rd Year",
      instructor: "Prof. Johnson",
      schedule: "TTH 2:00-3:30 PM",
      description: "Operating system concepts and implementation"
    }
  ];

  const handleClassClick = (classItem) => {
    const routeMap = {
      "Thesis and Research": "/user-prof-space/thesis",
      "Operating System": "/user-prof-space/os"
    };

    const route = routeMap[classItem.title];
    if (route) navigate(route);
  };

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      <div className="flex-1 flex flex-col">
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
          <h1 className="text-xl font-bold">Spaces</h1>
        </div>

        <div className="lg:hidden h-16"></div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="hidden md:flex items-center justify-center mb-8">
            <h1 className="text-4xl font-bold">Spaces</h1>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#0F172A] rounded-xl p-6 mb-8 border border-[#3B4457]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-[#60A5FA] mb-2">
                  Good Morning, {user && user.name}
                </h2>
                <p className="text-gray-300 text-sm mb-4">
                  Join space or create your own.
                </p>

                <Button onClick={() => navigate("/space/create")}>
                  Create Space
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Enter Code to Join Space
                </h3>
                <div className="bg-[#1E242E] rounded-lg p-4 border border-[#3B4457]">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter join code..."
                    className="w-full bg-transparent border-b border-[#3B4457] text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-[#0EA5E9]"
                  />

                  <div className="mt-6">
                    <Button disabled={loading} onClick={handleJoinRequestSubmit}>
                      {loading ? "Joining..." : "Join Space"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YOUR SPACES - Dynamic */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Your Spaces</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {userSpaces && userSpaces.length > 0 ? (
                userSpaces.map((space, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/space/${space?.space_uuid}/${space.space_name}`)}
                    className="bg-[#1E242E] rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    <div className="relative overflow-hidden h-40 bg-gray-800">
                      <SpaceCover
                        image={space.image}
                        name={space.space_name}
                        className="w-full h-full"
                      />

                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === `your-${i}` ? null : `your-${i}`);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                        >
                          <span className="text-lg font-bold">...</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {capitalizeWords(space.space_name) + "'s Space"}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {space.members != null
                          ? `${space?.members?.length} Members`
                          : "No members"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                  No space found
                </div>
              )}
            </div>
          </div>

          {/* Courses Spaces (Design Kept) */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Courses Spaces</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457]"
                >
                  <div className="relative h-48 bg-gray-800">
                    <img
                      src={classItem.image}
                      alt={classItem.title}
                      className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {classItem.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-1">
                      {classItem.instructor} • {classItem.members} Students
                    </p>
                    <p className="text-gray-500 text-xs mb-2">{classItem.schedule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FRIENDS SPACES - Dynamic */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Friends Space</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedSpaces.length > 0 ? (
                sharedSpaces.map((space, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/space/${space?.space_uuid}/${space.space_name}`)}
                    className="bg-[#1E242E] rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457]"
                  >
                    <div className="relative h-40 bg-gray-800">
                      <SpaceCover
                        image={space.image}
                        name={space.space_name}
                        className="w-full h-full"
                      />

                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === `friend-${i}` ? null : `friend-${i}`);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                        >
                          <span className="text-lg font-bold">...</span>
                        </button>

                        {showMenu === `friend-${i}` && (
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
                        {capitalizeWords(space.space_name) + "'s Space"}
                      </h3>
                      <p className="text-gray-400 text-xs mb-1">
                        {space.members != null
                          ? `${space?.members?.length} Members`
                          : "No members"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 bg-[#1E242E] rounded-lg border border-[#3B4457] text-center text-gray-400">
                  No friends space found
                </div>
              )}
            </div>
          </div>

          
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default SpacePage;
