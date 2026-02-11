import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";

const FilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const lastScroll = useRef(0);

  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 🔹 Hide-on-scroll header
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (headerRef.current) {
        if (currentScroll > lastScroll.current) {
          headerRef.current.classList.add('hidden');
          headerRef.current.style.transform = "translateY(-100%)";
        } else {
          headerRef.current.style.transform = "translateY(0)";
        }
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const { userSpaces, friendSpaces } = useSpace();
  // const { space_uuid, space_name } = useParams();

  
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  // Remove duplicates by space_id
  const uniqueSpaces = allSpaces.filter(
    (space, index, self) =>
      index === self.findIndex(s => s.space_id === space.space_id)
  );
  // const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);

  console.log(uniqueSpaces);


  // const { list } = useFileManager(currentSpace?.space_id);
  // const files = list.data || [];

  const spaces = [
    { name: "Your Space", category: "your-space" },
    { name: "Thesis and Research", category: "course-space" },
    { name: "Operating System", category: "course-space" },
    { name: "CS-ELEC 2", category: "course-space" },
    { name: "ZJ's Space", category: "friends-space" },
    { name: "Wilson's Space", category: "friends-space" },
    { name: "Nath's Space", category: "friends-space" },
    { name: "Raecell's Space", category: "friends-space" },
  ];

  const spacesByCategory = spaces.reduce((acc, space) => {
    if (!acc[space.category]) {
      acc[space.category] = [];
    }
    acc[space.category].push(space);
    return acc;
  }, {});

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
          ref={headerRef}
          className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300"
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
          {spacesByCategory['your-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Your Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['your-space'].map((space, index) => (
                  <div
                    key={`your-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/files/${space.name}/${space.space_uuid || ''}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Course Space Files */}
          {spacesByCategory['course-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Course Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['course-space'].map((space, index) => (
                  <div
                    key={`course-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/files/${space.name}/${space.space_uuid || ''}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Friends Space Files */}
          {spacesByCategory['friends-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Friends Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['friends-space'].map((space, index) => (
                  <div
                    key={`friends-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/files/${space.name}/${space.space_uuid || ''}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FilePage;
