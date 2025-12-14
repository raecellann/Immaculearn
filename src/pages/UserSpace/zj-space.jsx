import React, { useState, useRef } from "react";
import Sidebar from "../component/sidebar";
import { FiSearch, FiFileText, FiCheckCircle, FiLink } from "react-icons/fi";

const UserPage = () => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);

  // Apply formatting ONLY when text is selected inside the editor
  const applyFormat = (command) => {
    editorRef.current?.focus(); // Ensure the editor is focused first
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;

    document.execCommand(command, false, null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Cover"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

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
            <h1 className="text-3xl font-bold">Zeldrick’s Space</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(3 Members)</span>
              <button className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition">
                Add Member
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex justify-center gap-[120px] border-b border-gray-700 pb-4 mb-6">
            <button className="text-white text-xl font-semibold border-b-2 border-white pb-2">
              Stream
            </button>
            <button className="text-gray-400 text-xl hover:text-white transition">
              Tasks
            </button>
            <button className="text-gray-400 text-xl hover:text-white transition">
              Files Shared
            </button>
            <button className="text-gray-400 text-xl hover:text-white transition">
              People
            </button>
          </div>

          {/* POST SECTION */}
          <div
            className={`
              bg-white
              rounded-xl
              border
              transition
              cursor-text
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

              {/* RICH TEXT EDITOR */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // If editor is empty, remove focus state
                  if (editorRef.current.innerText.trim() === "") {
                    setIsFocused(false);
                  }
                }}
                className="
                  w-full
                  min-h-[40px]
                  bg-white
                  text-black
                  text-sm
                  pl-14
                  pr-4
                  py-2
                  outline-none
                  cursor-text
                "
              >
                {!isFocused && editorRef.current?.innerText.trim() === "" && (
                  <span className="text-gray-400 pointer-events-none">
                    Post something to your space
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              {isFocused && (
                <>
                  {/* FORMAT BUTTONS */}
                  <div className="flex gap-8 mt-4 text-black">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("bold");
                      }}
                      className="font-bold text-lg hover:underline bg-white "
                    >
                      B
                    </button>

                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("italic");
                      }}
                      className="italic text-lg hover:underline bg-white "
                    >
                      I
                    </button>

                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("underline");
                      }}
                      className="underline text-lg hover:opacity-70 bg-white "
                    >
                      U
                    </button>
                  </div>

                  {/* DIVIDER */}
                  <div className="mt-4">
                    <div className="border-t border-gray-300" />
                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 pr-4 flex justify-between items-center">
                    <div className="flex gap-8 text-sm text-gray-600">
                      <button className="flex items-center gap-2 hover:text-black bg-white ">
                        <FiFileText />
                        Add File
                      </button>
                      <button className="flex items-center gap-2 hover:text-black bg-white ">
                        <FiLink />
                        Add Link
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsFocused(false);
                          editorRef.current.innerHTML = "";
                        }}
                        className="px-4 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
                        Post
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-black border border-gray-700 rounded-xl p-5">
              <h2 className="font-bold mb-4">Reminders</h2>
              <div className="space-y-3">
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Reflection Paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#1B1F26] p-5 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <FiFileText className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick shared a file with you
                    </p>
                    <p className="text-sm text-gray-400">
                      OS • Week 7 Lecture
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline">
                  See File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
