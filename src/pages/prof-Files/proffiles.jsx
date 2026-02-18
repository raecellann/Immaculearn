import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/profsidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";

const ProfFilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { isAuthenticated, user } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 🔹 Hide-on-scroll header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


  const { userSpaces, courseSpaces, friendSpaces } = useSpace();
  // const { space_uuid, space_name } = useParams();

  
  // const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];

  const allSpaces = new Set([
    ...(userSpaces || []).map(space => space.space_uuid), ...(courseSpaces || []).map(space => space.space_uuid)]
  );

  const sharedSpaces = (friendSpaces || []).filter(space =>
    !allSpaces.has(space.space_uuid) &&
    space.members?.some(member => member.account_id === user?.id)
  );
  // Remove duplicates by space_id
  // const uniqueSpaces = allSpaces.filter(
  //   (space, index, self) =>
  //     index === self.findIndex(s => s.space_id === space.space_id)
  // );
  // // const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);

  // console.log(uniqueSpaces);


  // const { list } = useFileManager(currentSpace?.space_id);
  // const files = list.data || [];

  // Use actual space data instead of hardcoded array
  const spaces = [
    // Your spaces
    ...(userSpaces || []).map(space => ({ 
      name: space.space_name, 
      category: "your-space",
      space_uuid: space.space_uuid 
    })),
    // Course spaces
    ...(courseSpaces || []).map(space => ({ 
      name: space.space_name, 
      category: "course-space",
      space_uuid: space.space_uuid 
    })),
    // Friend spaces (excluding user's own spaces)
    ...(friendSpaces || [])
      .filter(space => !userSpaces?.some(userSpace => userSpace.space_id === space.space_id))
      .map(space => ({ 
        name: space.space_name, 
        category: "friends-space",
        space_uuid: space.space_uuid 
      }))
  ];

  const spacesByCategory = spaces.reduce((acc, space) => {
    if (!acc[space.category]) {
      acc[space.category] = [];
    }
    acc[space.category].push(space);
    return acc;
  }, {
    'your-space': [],
    'course-space': [],
    'friends-space': []
  });

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">Files</h1>
          </div>
        </div>

        {/* ✅ CONTENT (FOLDER-LIKE DISPLAY) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Files
          </h1>

          {/* Your Space Files */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Your Space</h2>
            {spacesByCategory['your-space']?.length === 0 ? (
              <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                No space files yet
              </div>
            ) : spacesByCategory['your-space']?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['your-space'].map((space, index) => (
                  <div
                    key={`your-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/prof/files/${encodeURIComponent(space.name)}/${space.space_uuid}`)}

                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>

          {/* Course Space Files */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Course Space</h2>
            {spacesByCategory['course-space']?.length === 0 ? (
              <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                No course space files yet
              </div>
            ) : spacesByCategory['course-space']?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['course-space'].map((space, index) => (
                  <div
                    key={`course-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/prof/files/${encodeURIComponent(space.name)}/${space.space_uuid || ''}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>

          {/* Friends Space Files */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Friends Space</h2>
            {sharedSpaces?.length === 0 ? (
              <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                No friends space files yet
              </div>
            ) : sharedSpaces?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {sharedSpaces.map((space, index) => (
                  <div
                    key={`friends-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/prof/files/${encodeURIComponent(space.name)}/${space.space_uuid || ''}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.space_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfFilePage;
