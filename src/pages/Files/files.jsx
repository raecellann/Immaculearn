import React, { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";

/**
 * Convert space name → safe folder name
 * Example: "ZJ’s Space" → "zjs-space"
 */
const toFolderName = (name) =>
  name
    .toLowerCase()
    .replace(/’/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, "-");

const FilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { userSpaces } = useSpace();

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <div className="lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-white text-2xl"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            Files
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {userSpaces?.map((space, index) => {
              const folderName = toFolderName(space.space_name);

              return (
                <div
                  key={index}
                  className="bg-[#1F242D] border border-gray-600 rounded-lg
                             px-5 py-4 flex items-center gap-3
                             hover:bg-[#252B34] transition cursor-pointer"
                  onClick={() => navigate("/view-files")}
                >
                  <span className="text-xl">📁</span>
                  <p className="text-lg">{space.space_name}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilePage;
