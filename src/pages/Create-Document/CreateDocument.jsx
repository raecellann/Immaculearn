import React, { useState, useRef } from "react";
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
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState(16);

  const editorRef = useRef(null);

  const applyFormatting = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const handleMouseDown = (e, callback) => {
    e.preventDefault(); // 
    callback();
  };

  const applyBold = () => applyFormatting("bold");
  const applyItalic = () => applyFormatting("italic");
  const applyUnderline = () => applyFormatting("underline");

  const applyAlignment = (alignment) => {
    if (alignment === "left") applyFormatting("justifyLeft");
    else if (alignment === "center") applyFormatting("justifyCenter");
    else if (alignment === "right") applyFormatting("justifyRight");
    else if (alignment === "justify") applyFormatting("justifyFull");
  };

  const applyTextColor = (color) => {
    setSelectedTextColor(color);
    applyFormatting("foreColor", color);
  };

  const applyHighlight = (color) => {
    setSelectedHighlightColor(color);
    applyFormatting("hiliteColor", color === "transparent" ? "white" : color);
  };

  const applyFontSize = (size) => {
    setSelectedFontSize(size);
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const clonedContents = range.cloneContents();
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        span.appendChild(clonedContents);
        range.deleteContents();
        range.insertNode(span);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />

      <div className="flex-1">
        {/* ================= HEADER ================= */}
        <div className="bg-white px-8 py-5 border-b">
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

        {/* ================= TOOLBAR ================= */}
        <div className="bg-[#EFEFEF] px-8 py-3 flex items-center gap-6 border-b text-gray-800">
          {/* TEXT STYLE */}
          <div className="flex items-center gap-4 text-lg">
            <FiBold
              className="cursor-pointer"
              onMouseDown={(e) => handleMouseDown(e, applyBold)}
            />
            <FiItalic
              className="cursor-pointer"
              onMouseDown={(e) => handleMouseDown(e, applyItalic)}
            />
            <div className="relative">
              <div
                className="flex items-center gap-1 text-lg cursor-pointer"
                onClick={() =>
                  setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)
                }
              >
                <span className="font-semibold">T</span>
                <FiChevronDown className="text-sm" />
              </div>

              {isFontSizeDropdownOpen && (
                <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                  {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72].map(
                    (size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={(e) =>
                          handleMouseDown(e, () => {
                            applyFontSize(size);
                            setIsFontSizeDropdownOpen(false);
                          })
                        }
                      >
                        <span
                          className="text-sm"
                          style={{ fontSize: `${size}px` }}
                        >
                          T
                        </span>
                        <span className="text-sm">{size}px</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            <FiUnderline
              className="cursor-pointer"
              onMouseDown={(e) => handleMouseDown(e, applyUnderline)}
            />
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
                {[
                  ["left", <FiAlignLeft />, "Left"],
                  ["center", <FiAlignCenter />, "Center"],
                  ["right", <FiAlignRight />, "Right"],
                  ["justify", <FiAlignJustify />, "Justify"],
                ].map(([align, icon, label]) => (
                  <div
                    key={align}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => {
                        applyAlignment(align);
                        setSelectedAlignment(align);
                        setIsAlignmentDropdownOpen(false);
                      })
                    }
                  >
                    {icon}
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-400" />

          {/* COLOR */}
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
                      className="w-8 h-8 rounded border border-black bg-white"
                      onMouseDown={(e) =>
                        handleMouseDown(e, () => applyTextColor(color))
                      }
                    >
                      <span className="font-bold" style={{ color }}>
                        A
                      </span>
                    </button>
                  ))}
                </div>

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
                      className="w-8 h-8 rounded border"
                      style={{
                        backgroundColor:
                          color === "transparent" ? "white" : color,
                      }}
                      onMouseDown={(e) =>
                        handleMouseDown(e, () => applyHighlight(color))
                      }
                    >
                      <span className="font-bold text-black">A</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-400" />

          <FiImage className="text-lg cursor-pointer" />
          <FiFileText className="text-lg cursor-pointer" />
          <FiList className="text-lg cursor-pointer" />

          <div className="ml-auto flex items-center gap-2 text-sm font-medium cursor-pointer">
            Inter
            <FiChevronDown />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex gap-6 p-8">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 bg-white rounded-lg shadow p-10 min-h-[500px] text-black focus:outline-none"
          >
            <div>Nathaniel: DFD & Database</div>
            <br />
            <div>Zeldrick: Papers and Front-End</div>
            <br />
            <div>Wilson: DFD & Back-End</div>
            <br />
            <div>Raecell: Survey & Prototype</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDocumentPage;
