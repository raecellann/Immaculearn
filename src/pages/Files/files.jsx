import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useFileManager } from "../../hooks/useFileManager";

const FilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);


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
    { name: "ZJ’s Space" },
    { name: "Wilson’s Space" },
    { name: "Nath’s Space" },
    { name: "Raecell’s Space" },
  ];

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

        {/* Mobile + Tablet Header */}
        <div className="lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Files
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {uniqueSpaces.map((space, index) => (
              <div
                key={index}
                className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                onClick={() => navigate(`/files/${space.space_name}/${space.space_uuid}`)}
              >
                <span className="text-xl">📁</span>
                <p className="text-lg">{space.space_name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilePage;
