import React from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiChevronLeft } from "react-icons/fi";

const ProfFilesShared = () => {
  const navigate = useNavigate();

  const files = [
    {
      name: "Calculus: Lecture 3",
      date: "October 8, 2025",
      by: "Zeldrick",
      folder: "Math",
    },
    {
      name: "IAS : Lecture 1",
      date: "October 8, 2025",
      by: "Nathaniel",
      folder: "IAS",
    },
    {
      name: "CS Thesis 2 : Lecture 4",
      date: "October 8, 2025",
      by: "Raeccell",
      folder: "Thesis",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <ProfSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER / BANNER (MATCHES PEOPLE PAGE) */}
        <div className="relative mb-6">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Space Banner"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl rounded-t-none"
          />

          {/* SPACE NAME */}
          <div className="absolute top-0 z-10">
            <div className="bg-black text-white px-10 py-3 rounded-b-[1rem] rounded-t-none shadow-lg text-2xl font-extrabold text-left">
              CS Thesis 2 Space
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-[120px] border-b border-white/10 mb-6 text-xl">
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-thesis")}
          >
            Stream
          </button>
          <button
            className="pb-3 border-b-2 border-white font-medium"
            onClick={() => navigate("/prof-space-thesis/tasks")}
          >
            Tasks
          </button>
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-thesis/files-shared")}
          >
            Files Shared
          </button>
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-thesis/people")}
          >
            People
          </button>
        </div>

        {/* FILES SHARED BODY */}
        <div className="px-10 mt-6">
          {/* ACTION BUTTONS */}
          <div className="flex justify-end items-center gap-4 mb-4">
            <button className="text-sm text-gray-300 hover:text-white">
              Create Folder
            </button>

            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Create New File
            </button>

            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Upload New File
            </button>
          </div>

          {/* HEADER ROW */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-sm text-gray-400 pb-2 border-b border-white/10">
            <span>File Name</span>
            <span>Date Posted</span>
            <span>Posted By</span>
            <span>Folder Saved</span>
          </div>

          {/* FILE LIST */}
          <div className="space-y-4 mt-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center bg-[#1B1F26] rounded-xl px-6 py-4 hover:bg-[#22262E] transition"
              >
                {/* FILE NAME */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-bold">📄</span>
                  </div>
                  <span className="font-medium">{file.name}</span>
                </div>

                {/* DATE */}
                <span className="text-sm text-gray-300">{file.date}</span>

                {/* POSTED BY */}
                <span className="text-sm text-gray-300">{file.by}</span>

                {/* FOLDER */}
                <span className="text-sm text-gray-300">{file.folder}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfFilesShared;
