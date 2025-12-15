import React, { useState, useRef } from "react";
import Sidebar from "../component/sidebar";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
} from "react-icons/fi";

const UserPage = () => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);

  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <Sidebar />

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

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* REMINDERS */}
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
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Individual Activity
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
              </div>

              {/* CHAT */}
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-black border border-gray-700 hover:bg-gray-900">
                <FiMessageCircle />
                Enter Chat
              </button>
            </div>

            {/* ACTIVITY */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#1B1F26] p-5 rounded-xl border border-gray-700 flex justify-between items-center">
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

              <div className="bg-[#1B1F26] p-5 rounded-xl border border-gray-700 flex justify-between items-center">
                <div className="flex gap-4">
                  <FiCheckCircle className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick assigned task with you
                    </p>
                    <p className="text-sm text-gray-400">
                      Thesis • Survey Revision
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline">
                  See Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Post something to your space";
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
};

export default UserPage;
