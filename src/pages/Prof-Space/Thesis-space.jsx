import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
} from "react-icons/fi";

const ThesisSpace = () => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* PROFESSOR SIDEBAR */}
      <ProfSidebar />

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">
        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Cover"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* SEARCH */}
          <div className="absolute top-4 right-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Professor Susan's Space</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(5 Members)</span>
              <button className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition">
                Manage Class
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex justify-center gap-[120px] border-b border-gray-700 pb-4 mb-6">
            <button className="text-white text-xl font-semibold border-b-2 border-white pb-2">
              Stream
            </button>
            <button
              className="text-gray-400 text-xl hover:text-white transition"
              onClick={() => navigate("/prof-space-susan/tasks")}
            >
              Tasks
            </button>
            <button
              className="text-gray-400 text-xl hover:text-white transition"
              onClick={() => navigate("/prof-space-susan/files-shared")}
            >
              Files Shared
            </button>
            <button
              className="text-gray-400 text-xl hover:text-white transition"
              onClick={() => navigate("/prof-space-susan/people")}
            >
              People
            </button>
          </div>

          {/* POST BOX */}
          <div
            className={`
              bg-white rounded-xl border cursor-text transition
              ${isFocused ? "border-black" : "border-transparent"}
              hover:border-black
            `}
            onClick={() => editorRef.current?.focus()}
          >
            <div className="relative p-6">
              {/* AVATAR */}
              <img
                src="/src/assets/HomePage/frieren-avatar.jpg"
                alt="Avatar"
                className="absolute left-6 top-6 w-10 h-10 rounded-full"
              />

              {/* EDITOR */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (editorRef.current.innerText.trim() === "") {
                    setIsFocused(false);
                  }
                }}
                className="
                  editor
                  w-full
                  min-h-[40px]
                  bg-white
                  text-black
                  text-sm
                  pl-14
                  pr-4
                  py-2
                  outline-none
                "
                data-placeholder="Announce something to your class..."
              />

              {/* ACTIONS */}
              {isFocused && (
                <>
                  {/* FORMAT */}
                  <div className="flex gap-8 mt-4 text-black">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("bold");
                      }}
                      className="font-bold text-lg bg-white"
                    >
                      B
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("italic");
                      }}
                      className="italic text-lg bg-white"
                    >
                      I
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("underline");
                      }}
                      className="underline text-lg bg-white"
                    >
                      U
                    </button>
                  </div>

                  <div className="mt-4 border-t border-gray-300" />

                  {/* FOOTER */}
                  <div className="mt-4 flex justify-between items-center pr-4">
                    <div className="flex gap-8 text-sm text-gray-600">
                      <button className="flex items-center gap-2 bg-white hover:text-black">
                        <FiFileText />
                        Add File
                      </button>
                      <button className="flex items-center gap-2 bg-white hover:text-black">
                        <FiLink />
                        Add Link
                      </button>
                      <button className="flex items-center gap-2 bg-white hover:text-black">
                        <FiCheckCircle />
                        Create Assignment
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsFocused(false);
                          editorRef.current.innerHTML = "";
                        }}
                        className="px-4 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                        Post
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
            {/* Announcement cards would be mapped here */}
            <div className="bg-[#1B1F26] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/src/assets/HomePage/frieren-avatar.jpg"
                  alt="Professor Susan"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">Professor Susan</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Don't forget to submit your research proposals by Friday. Make sure to include your methodology and expected outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesisSpace;
