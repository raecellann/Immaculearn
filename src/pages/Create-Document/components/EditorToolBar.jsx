import React from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiChevronDown,
  FiImage,
  FiCrop,
  FiRotateCw,
  FiFile,
  FiColumns,
  FiList,
} from "react-icons/fi";

const EditorToolbar = ({
  isClient,
  windowWidth,
  selectedAlignment,
  selectedTextColor,
  selectedPaperSize,
  selectedMargin,
  selectedFont,
  selectedFontSize,
  isAlignmentDropdownOpen,
  isColorDropdownOpen,
  isPaperSizeDropdownOpen,
  isMarginDropdownOpen,
  isFontDropdownOpen,
  isFontSizeDropdownOpen,
  isImageDropdownOpen,
  isListDropdownOpen,
  onMouseDown,
  applyBold,
  applyItalic,
  applyUnderline,
  applyAlignment,
  applyTextColor,
  applyPaperSize,
  applyMargin,
  applyFontFamily,
  applyFontSize,
  handleImageAction,
  applyList,
  paperSizes,
  marginOptions,
  setIsAlignmentDropdownOpen,
  setIsColorDropdownOpen,
  setIsPaperSizeDropdownOpen,
  setIsMarginDropdownOpen,
  setIsFontDropdownOpen,
  setIsFontSizeDropdownOpen,
  setIsImageDropdownOpen,
  setIsListDropdownOpen,
}) => {
  const iconSize = windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16;
  const chevronSize = windowWidth < 640 ? 14 : 16;

  return (
    <div className="bg-[#EFEFEF] px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 border-b text-gray-800">
      {/* TEXT STYLE */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-lg sm:text-xl md:text-lg lg:text-lg">
        <FiBold
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            isClient && document.queryCommandState("bold")
              ? "text-blue-500 bg-blue-100"
              : ""
          }`}
          onMouseDown={(e) => onMouseDown(e, applyBold)}
          title="Bold"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        <FiItalic
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            isClient && document.queryCommandState("italic")
              ? "text-blue-500 bg-blue-100"
              : ""
          }`}
          onMouseDown={(e) => onMouseDown(e, applyItalic)}
          title="Italic"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        <FiUnderline
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            isClient && document.queryCommandState("underline")
              ? "text-blue-500 bg-blue-100"
              : ""
          }`}
          onMouseDown={(e) => onMouseDown(e, applyUnderline)}
          title="Underline"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        <div className="relative">
          <div
            className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
            onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
          >
            <span className="text-xs sm:text-sm md:text-sm lg:text-sm font-medium">
              {selectedFontSize}
            </span>
            <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
          </div>

          {isFontSizeDropdownOpen && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48 sm:w-56">
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72].map(
                (size) => (
                  <div
                    key={size}
                    className="flex items-center gap-2 px-2 sm:px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      onMouseDown(e, () => {
                        applyFontSize(size);
                        setIsFontSizeDropdownOpen(false);
                      })
                    }
                  >
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{
                        fontSize: `${Math.max(size, 12)}px`,
                        minWidth: "16px",
                        display: "inline-block",
                      }}
                    >
                      T
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {size}px
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-6 w-px bg-gray-400" />

      {/* ALIGNMENT */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsAlignmentDropdownOpen(!isAlignmentDropdownOpen)}
        >
          {selectedAlignment === "left" && <FiAlignLeft size={iconSize} />}
          {selectedAlignment === "center" && <FiAlignCenter size={iconSize} />}
          {selectedAlignment === "right" && <FiAlignRight size={iconSize} />}
          {selectedAlignment === "justify" && <FiAlignJustify size={iconSize} />}
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
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
                  onMouseDown(e, () => {
                    applyAlignment(align);
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
          className={`flex items-center gap-2 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            selectedTextColor !== "black" ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
          title="Text Color"
        >
          <div
            className="w-4 h-4 sm:w-4 sm:h-4 rounded border border-gray-400"
            style={{ backgroundColor: selectedTextColor }}
          />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isColorDropdownOpen && (
          <div
            className={`absolute top-full mt-2 bg-white border rounded-xl shadow-lg z-20 p-3 ${
              windowWidth < 640
                ? "w-[280px] left-1/2 transform -translate-x-1/2"
                : windowWidth < 768
                ? "w-[300px] left-1/2 transform -translate-x-1/2"
                : "w-[320px] right-0"
            }`}
          >
            <div className="text-xs font-semibold mb-2 text-gray-700">
              Text Color
            </div>

            <div
              className={`grid gap-2 ${
                windowWidth < 640
                  ? "grid-cols-3"
                  : windowWidth < 768
                  ? "grid-cols-4"
                  : "grid-cols-6"
              }`}
            >
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
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded border border-black bg-white ${
                    windowWidth < 640 ? "text-xs" : "text-sm sm:text-base"
                  }`}
                  style={{
                    backgroundColor:
                      color === "transparent" ? "white" : color,
                  }}
                  onMouseDown={(e) =>
                    onMouseDown(e, () => applyTextColor(color))
                  }
                >
                  <span
                    className="font-bold"
                    style={{
                      color: color === "transparent" ? "black" : "white",
                    }}
                  >
                    A
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-400" />

      {/* IMAGE */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsImageDropdownOpen(!isImageDropdownOpen)}
          title="Crop and Rotate"
        >
          <FiImage size={iconSize} />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isImageDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={(e) =>
                onMouseDown(e, () => handleImageAction("crop"))
              }
            >
              <FiCrop size={16} />
              <span className="text-sm">Crop</span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={(e) =>
                onMouseDown(e, () => handleImageAction("rotate"))
              }
            >
              <FiRotateCw size={16} />
              <span className="text-sm">Rotate</span>
            </div>
          </div>
        )}
      </div>

      {/* PAPER SIZE */}
      <div className="relative">
        <div
          className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            selectedPaperSize !== "A4" ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={() => setIsPaperSizeDropdownOpen(!isPaperSizeDropdownOpen)}
          title="Paper Size"
        >
          <FiFile className="text-sm" size={iconSize} />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isPaperSizeDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
            {Object.entries(paperSizes).map(([name, { width, height }]) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyPaperSize(name))
                }
              >
                <span className="text-sm">{name}</span>
                <span className="text-xs text-gray-500">
                  {width} × {height}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MARGINS */}
      <div className="relative">
        <div
          className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            selectedMargin !== "Normal" ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={() => setIsMarginDropdownOpen(!isMarginDropdownOpen)}
          title="Margins"
        >
          <FiColumns className="text-sm" size={iconSize} />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isMarginDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
            {Object.entries(marginOptions).map(([name, margins]) => (
              <div
                key={name}
                className="flex flex-col px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) => onMouseDown(e, () => applyMargin(name))}
              >
                <span className="text-sm">{name}</span>
                <span className="text-xs text-gray-500">
                  {margins.top} / {margins.right} / {margins.bottom} / {margins.left}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-400" />

      {/* FONT FAMILY */}
      <div className="relative">
        <div
          className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${
            selectedFont !== "Inter" ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
          title="Font Family"
        >
          <span
            className="text-xs sm:text-sm font-medium"
            style={{ fontFamily: selectedFont }}
          >
            {selectedFont}
          </span>
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isFontDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
            {[
              "Inter",
              "Arial",
              "Times New Roman",
              "Calibri",
              "Verdana",
              "Georgia",
              "Courier New",
              "Helvetica",
              "Tahoma",
              "Trebuchet MS",
            ].map((font) => (
              <div
                key={font}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyFontFamily(font))
                }
              >
                <span className="text-sm" style={{ fontFamily: font }}>
                  {font}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-400" />

      {/* LIST */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
          title="Lists"
        >
          <FiList size={iconSize} />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>

        {isListDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-56">
            {/* Bulleted Lists */}
            <div className="border-b border-gray-200 pb-1 mb-1">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                BULLETED
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) => onMouseDown(e, () => applyList("bullet"))}
              >
                <span className="text-sm">• Bulleted List</span>
              </div>
            </div>

            {/* Numbered Lists */}
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                NUMBERED
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyList("number", "decimal"))
                }
              >
                <span className="text-sm">1. Numbered List</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyList("number", "upper-roman"))
                }
              >
                <span className="text-sm">I. Roman Numerals (Upper)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyList("number", "lower-alpha"))
                }
              >
                <span className="text-sm">a. Alphabetical (Lower)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyList("number", "upper-alpha"))
                }
              >
                <span className="text-sm">A. Alphabetical (Upper)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) =>
                  onMouseDown(e, () => applyList("number", "lower-roman"))
                }
              >
                <span className="text-sm">i. Roman Numerals (Lower)</span>
              </div>
            </div>

            {/* None Option */}
            <div className="border-t border-gray-200 pt-1 mt-1">
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) => onMouseDown(e, () => applyList("none"))}
              >
                <span className="text-sm">None</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto"></div>
    </div>
  );
};

export default EditorToolbar;