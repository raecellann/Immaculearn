import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { SpaceCover } from "../component/spaceCover";

const SpacePage = () => {
  const { user } = useUser();
  const { userSpaces, friendSpaces, joinSpace } = useSpace();
  const [showMenu, setShowMenu] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 ADDED: mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleJoinRequestSubmit = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid join code");
      return;
    }


    setLoading(true)

    try {
      const res = await joinSpace(joinCode);

      console.log(res)
    } finally {

    }

    // alert(`joining in link: ${joinCode}, ${spaceuuid}`)
    setLoading(false)
    // try {
    //   setLoading(true);

    // } catch (error) {
    //   alert(error.message);
    // } finally {
    //   setLoading(false);
    // }
  };




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

  const userSpaceUUIDs = new Set(
    (userSpaces || []).map(space => space.space_uuid)
  );

  const sharedSpaces = (friendSpaces || []).filter(
    space => !userSpaceUUIDs.has(space.space_uuid)
  );


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
        <div className="lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Spaces</h1>
        </div>

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
                  onClick={() => navigate("/space/create")} 
                  className="px-6 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg font-medium text-sm transition">
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
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter join code..."
                    className="w-full bg-transparent border-b border-[#3B4457] text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-[#0EA5E9]"
                  />
                  <button 
                  disabled={loading}
                  onClick={handleJoinRequestSubmit} 
                  className="mt-4 w-full px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg font-medium text-sm transition">
                    {loading ? "Joining..." : "Join Space"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Your Space Section ================= */}
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
                    // onKeyPress={(e) => e.key === "Enter" && navigate(`/space/${space.space_uuid}`)}
                    className="bg-[#1E242E] rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    {/* Card Image */}
                    <div className="relative overflow-hidden h-40 bg-gray-800">
                      {/* <img
                        src={space.image || "/src/assets/HomePage/spaces-cover/default.jpg"}
                        alt={space.space_name || "Space Image"}
                        className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                      /> */}

                      <SpaceCover 
                        image={space.image}
                        name={space.space_name}
                        className="w-full h-full"
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigating when menu clicked
                            setShowMenu(showMenu === `your-${i}` ? null : `your-${i}`);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                        >
                          <span className="text-lg font-bold">...</span>
                        </button>

                        {showMenu === `your-${i}` && (
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

                    {/* Card Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {capitalizeWords(space.space_name) + "'s Space"}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {space.members != null ? `${space?.members?.length} Members` : "No members"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {space.time || "Opened just now"}
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



          {/* ================= Friends Space Section ================= */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Shared Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {sharedSpaces.length > 0 ? (
                sharedSpaces.map((space, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/space/${space?.space_uuid}/${space.space_name}`)}
                    // onKeyPress={(e) => e.key === "Enter" && navigate(`/space/${space.space_uuid}`)}
                    className="bg-[#1E242E] rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer border border-[#3B4457] relative"
                  >
                    {/* Card Image */}
                    <div className="relative overflow-hidden h-40 bg-gray-800">
                      {/* <img
                        src={space.image || "/src/assets/HomePage/spaces-cover/default.jpg"}
                        alt={space.space_name || "Space Image"}
                        className="w-full h-full object-cover group-hover:brightness-75 transition duration-300"
                      /> */}

                      <SpaceCover 
                        image={space.image}
                        name={space.space_name}
                        className="w-full h-full"
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigating when menu clicked
                            setShowMenu(showMenu === `your-${i}` ? null : `your-${i}`);
                          }}
                          className="bg-black/60 hover:bg-black text-white w-8 h-8 flex items-center justify-center rounded-md transition"
                        >
                          <span className="text-lg font-bold">...</span>
                        </button>

                        {showMenu === `your-${i}` && (
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

                    {/* Card Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {capitalizeWords(space.space_name) + "'s Space"}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {space.members != null ? `${space?.members?.length} Members` : "No members"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {space.time || "Opened just now"}
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

        </div>
      </div>
    </div>
  );
};

export default SpacePage;
  