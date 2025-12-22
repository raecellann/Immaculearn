import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import {
  FiArrowLeft,
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiChevronDown,
  FiImage,
  FiFileText,
  FiList,
} from "react-icons/fi";

const CreateDocumentPage = () => {
  const [title, setTitle] = useState("Thesis Chapter 2 Participation");

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />

      <div className="flex-1">
        {/* ================= HEADER ================= */}
        <div className="bg-white px-8 py-5 border-b">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <FiArrowLeft />
              <span>Back</span>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-2 rounded-full bg-[#3B82F6] text-white font-medium">
                Save changes
              </button>
              <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-600 font-medium">
                Cancel
              </button>
            </div>
          </div>

          {/* Document title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Document Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full max-w-3xl px-5 py-3 border-2 rounded-xl text-lg font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ================= RIBBON / TOOLBAR ================= */}
        <div className="bg-[#EFEFEF] px-8 py-3 flex items-center gap-6 border-b text-gray-800">
          {/* TEXT STYLE */}
          <div className="flex items-center gap-4 text-lg">
            <FiBold />
            <FiItalic />
            <span className="font-semibold">T</span>
            <FiUnderline />
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* ALIGNMENT */}
          <div className="flex items-center gap-1 text-lg cursor-pointer">
            <FiAlignLeft />
            <FiChevronDown className="text-sm" />
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* COLOR */}
          <div className="flex items-center gap-1 text-lg cursor-pointer">
            <span className="font-semibold">A</span>
            <FiChevronDown className="text-sm" />
          </div>

          {/* HIGHLIGHT */}
          <div className="flex items-center gap-1 text-lg cursor-pointer">
            <span className="font-semibold">🖍</span>
            <FiChevronDown className="text-sm" />
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* INSERT IMAGE */}
          <div className="flex items-center gap-1 text-lg cursor-pointer">
            <FiImage />
            <FiChevronDown className="text-sm" />
          </div>

          {/* PAPER / PAGE */}
          <div className="flex items-center gap-1 text-lg cursor-pointer">
            <FiFileText />
            <FiChevronDown className="text-sm" />
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* LIST */}
          <FiList className="text-lg cursor-pointer" />

          {/* FONT FAMILY */}
          <div className="ml-auto flex items-center gap-2 text-sm font-medium cursor-pointer">
            Inter
            <FiChevronDown />
          </div>
        </div>

        {/* ================= CONTENT AREA ================= */}
        <div className="flex gap-6 p-8">
          {/* DOCUMENT */}
          <div className="flex-1 bg-white rounded-lg shadow p-10 min-h-[500px]">
            <p className="text-xl font-semibold mb-8">
              Nathaniel: DFD & Database
            </p>
            <p className="text-xl font-semibold mb-8">
              Zeldrick: Papers and Front-End
            </p>
            <p className="text-xl font-semibold mb-8">Wilson: DFD & Back-End</p>
            <p className="text-xl font-semibold">Raecell: Survey & Prototype</p>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[260px]">
            <h3 className="font-semibold mb-4">Editors:</h3>

            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://via.placeholder.com/36"
                className="rounded-full"
              />
              <span>Zeldrick Jesus</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src="https://via.placeholder.com/36"
                className="rounded-full"
              />
              <span>Nathaniel</span>
            </div>

            <h3 className="font-semibold mt-8 mb-3">Comments:</h3>

            <div className="bg-white border rounded-lg p-3 h-32 mb-3" />

            <div className="flex gap-2">
              <input
                placeholder="Enter comment"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar button style */}
      <style>
        {`
          .toolbar-btn {
            padding: 6px;
            font-size: 18px;
            border-radius: 6px;
          }
          .toolbar-btn:hover {
            background: #E5E7EB;
          }
        `}
      </style>
    </div>
  );
};

export default CreateDocumentPage;
