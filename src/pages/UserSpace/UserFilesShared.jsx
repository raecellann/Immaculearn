import React from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { FiFileText } from "react-icons/fi";

const UserFilesShared = () => {
  const navigate = useNavigate(); // ✅ REQUIRED

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* COVER / HEADER */}
        <div className="relative mb-6">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            alt="Space Cover"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl"
          />

          <div className="absolute top-0 z-10">
            <div className="bg-black px-10 py-3 rounded-b-[1rem] text-2xl font-extrabold">
              Zeldrick’s Space
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-[120px] border-b border-gray-700 pb-4 mb-6">
          <button 
            className="text-gray-400 hover:text-white text-xl transition bg-transparent"
            onClick={() => navigate("/user-space-zj")}
          >
            Stream
          </button>

          <button
            className="text-gray-400 text-xl hover:text-white transition bg-transparent"
            onClick={() => navigate("/user-space-zj/tasks")}
          >
            Tasks
          </button>

          <button
            className="text-white font-semibold border-b-2 border-white pb-2 text-xl bg-transparent"
            onClick={() => navigate("/user-space-zj/files-shared")}
          >
            Files Shared
          </button>

          <button
            className="text-gray-400 text-xl hover:text-white transition bg-transparent"
            onClick={() => navigate("/user-space-zj/people")}
          >
            People
          </button>
        </div>

        {/* FILES TABLE */}
        <div className="bg-[#0F1115] rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-4 text-sm text-gray-400 pb-3 border-b border-gray-700">
            <div>File Name</div>
            <div>Date Posted</div>
            <div>Posted By</div>
            <div>Folder Saved</div>
          </div>

          {[
            {
              name: "Calculus: Lecture 3",
              date: "October 8, 2025",
              by: "Zeldrick",
              folder: "Math",
            },
            {
              name: "Biology: Lecture 1",
              date: "October 8, 2025",
              by: "Nathaniel",
              folder: "Science",
            },
            {
              name: "Fallacies: Lecture 4",
              date: "October 8, 2025",
              by: "Raecell",
              folder: "Law",
            },
          ].map((file, index) => (
            <div
              key={index}
              className="grid grid-cols-4 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#23272F] p-2 rounded-md">
                  <FiFileText />
                </div>
                <span>{file.name}</span>
              </div>
              <div>{file.date}</div>
              <div>{file.by}</div>
              <div>{file.folder}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFilesShared;
