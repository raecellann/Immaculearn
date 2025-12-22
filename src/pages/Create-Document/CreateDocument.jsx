import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import {
  FiArrowLeft,
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiChevronDown,
  FiImage,
  FiFileText,
  FiList,
} from "react-icons/fi";

const CreateDocumentPage = () => {
  const [title, setTitle] = useState("Thesis Chapter 2 Participation");
  const [isAlignmentDropdownOpen, setIsAlignmentDropdownOpen] = useState(false);
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("black");
  const [selectedHighlightColor, setSelectedHighlightColor] =
    useState("transparent");

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
          <div className="relative">
            <div
              className="flex items-center gap-1 text-lg cursor-pointer"
              onClick={() =>
                setIsAlignmentDropdownOpen(!isAlignmentDropdownOpen)
              }
            >
              {selectedAlignment === "left" && <FiAlignLeft />}
              {selectedAlignment === "center" && <FiAlignCenter />}
              {selectedAlignment === "right" && <FiAlignRight />}
              {selectedAlignment === "justify" && <FiAlignJustify />}
              <FiChevronDown className="text-sm" />
            </div>
            {isAlignmentDropdownOpen && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedAlignment("left");
                    setIsAlignmentDropdownOpen(false);
                  }}
                >
                  <FiAlignLeft />
                  <span className="text-sm">Left</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedAlignment("center");
                    setIsAlignmentDropdownOpen(false);
                  }}
                >
                  <FiAlignCenter />
                  <span className="text-sm">Center</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedAlignment("right");
                    setIsAlignmentDropdownOpen(false);
                  }}
                >
                  <FiAlignRight />
                  <span className="text-sm">Right</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedAlignment("justify");
                    setIsAlignmentDropdownOpen(false);
                  }}
                >
                  <FiAlignJustify />
                  <span className="text-sm">Justify</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* COLOR & HIGHLIGHT */}
          <div className="relative">
            <div
              className="flex items-center gap-1 text-lg cursor-pointer"
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
            >
              <span className="font-bold" style={{ color: selectedTextColor }}>
                A
              </span>
              <FiChevronDown className="text-sm" />
            </div>

            {isColorDropdownOpen && (
              <div className="absolute top-full mt-2 bg-white border rounded-xl shadow-lg z-20 p-3 w-[300px]">
                {/* TEXT COLOR */}
                <div className="text-xs font-semibold mb-2 text-gray-700">
                  Text Color
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {[
                    "black",
                    "green",
                    "red",
                    "blue",
                    "gold",
                    "orange",
                    "purple",
                    "pink",
                    "brown",
                    "teal",
                    "navy",
                    "gray",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 flex items-center justify-center rounded border border-black bg-white hover:bg-gray-100"
                      onClick={() => setSelectedTextColor(color)}
                    >
                      <span className="font-bold" style={{ color }}>
                        A
                      </span>
                    </button>
                  ))}
                </div>

                {/* HIGHLIGHT COLOR */}
                <div className="text-xs font-semibold mb-2 text-gray-700">
                  Highlight
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "transparent",
                    "yellow",
                    "lime",
                    "cyan",
                    "pink",
                    "orange",
                    "purple",
                    "red",
                    "blue",
                    "green",
                    "gold",
                    "gray",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-100"
                      style={{
                        backgroundColor:
                          color === "transparent" ? "white" : color,
                      }}
                      onClick={() => {
                        setSelectedHighlightColor(color);
                        setIsColorDropdownOpen(false);
                      }}
                    >
                      <span className="font-bold text-black">A</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          <div
            className="flex-1 bg-white rounded-lg shadow p-10 min-h-[500px] text-black"
            contentEditable
            style={{
              textAlign: selectedAlignment,
              color: selectedTextColor,
              backgroundColor:
                selectedHighlightColor === "transparent"
                  ? "transparent"
                  : selectedHighlightColor,
            }}
            suppressContentEditableWarning={true}
          >
            <div style={{ textAlign: selectedAlignment }}>
              Nathaniel: DFD & Database
            </div>
            <br />
            <div style={{ textAlign: selectedAlignment }}>
              Zeldrick: Papers and Front-End
            </div>
            <br />
            <div style={{ textAlign: selectedAlignment }}>
              Wilson: DFD & Back-End
            </div>
            <br />
            <div style={{ textAlign: selectedAlignment }}>
              Raecell: Survey & Prototype
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[260px]">
            <h3 className="font-semibold mb-4 text-black">Editors:</h3>

            <div className="flex items-center gap-3 mb-3 text-black">
              <img
                src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/zj_ouikks.jpg"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>Zeldrick Jesus</span>
            </div>

            <div className="flex items-center gap-3 text-black">
              <img
                src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/nath_tzkpl5.jpg"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>Nathaniel</span>
            </div>

            <h3 className="font-semibold mt-8 mb-3 text-black">Comments:</h3>

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
