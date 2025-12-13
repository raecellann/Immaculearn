import React from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";

const FilePage = () => {
  const navigate = useNavigate();
  const spaces = [
    { name: "ZJ’s Space" },
    { name: "Wilson’s Space" },
    { name: "Nath’s Space" },
    { name: "Raecell’s Space" },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Page */}
      <div className="flex-1 p-10">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Files</h1>

        {/* Space Cards */}
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {spaces.map((space, index) => (
            <div
              key={index}
              className="bg-[#1F242D] border border-gray-600 rounded-lg px-5 py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
              onClick={() => {
                if (space.name === "ZJ’s Space") navigate("/view-all-files");
                if (space.name === "Raecell’s Space")
                  navigate("/create-file-admin");
              }}
            >
              <span className="text-xl">📁</span>
              <p className="text-lg">{space.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilePage;
