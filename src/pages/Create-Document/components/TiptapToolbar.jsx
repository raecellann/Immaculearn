// src/components/TipTapToolbar.jsx
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

const TipTapToolbar = ({
  editor,
  windowWidth,
  selectedAlignment,
  selectedTextColor,
  selectedHighlightColor,
  selectedFont,
  selectedFontSize,
  selectedPaperSize,
  selectedMargin,
  isAlignmentDropdownOpen,
  isColorDropdownOpen,
  isFontDropdownOpen,
  isFontSizeDropdownOpen,
  isImageDropdownOpen,
  isListDropdownOpen,
  setIsAlignmentDropdownOpen,
  setIsColorDropdownOpen,
  setIsFontDropdownOpen,
  setIsFontSizeDropdownOpen,
  setIsImageDropdownOpen,
  setIsListDropdownOpen,
  handleImageAction,
  paperSizes,
  marginOptions,
}) => {
  if (!editor) return null;

  const iconSize = windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16;
  const chevronSize = windowWidth < 640 ? 14 : 16;

  const applyBold = () => editor.chain().focus().toggleBold().run();
  const applyItalic = () => editor.chain().focus().toggleItalic().run();
  const applyUnderline = () => editor.chain().focus().toggleUnderline().run();
  const applyAlignment = (alignment) =>
    editor.chain().focus().setTextAlign(alignment).run();
  const applyFontSize = (size) =>
    editor.chain().focus().setFontSize(size).run();
  const applyFontFamily = (font) =>
    editor.chain().focus().setFontFamily(font).run();
  const applyTextColor = (color) =>
    editor.chain().focus().setColor(color).run();
  const applyHighlightColor = (color) =>
    editor.chain().focus().setHighlight({ color }).run();
  const applyList = (type, style) => {
    if (type === "bullet") editor.chain().focus().toggleBulletList().run();
    else if (type === "number")
      editor.chain().focus().toggleOrderedList({ order: style || "decimal" }).run();
    else if (type === "none") editor.chain().focus().clearNodes().run();
  };

  return (
    <div className="bg-[#EFEFEF] px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 border-b text-gray-800">
      {/* TEXT STYLE */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-lg sm:text-xl md:text-lg lg:text-lg">
        <FiBold
          className={`cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold") ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={applyBold}
          title="Bold"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        <FiItalic
          className={`cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic") ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={applyItalic}
          title="Italic"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        <FiUnderline
          className={`cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("underline") ? "text-blue-500 bg-blue-100" : ""
          }`}
          onClick={applyUnderline}
          title="Underline"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
        />
        {/* Font Size Dropdown */}
        <div className="relative">
          <div
            className="flex items-center gap-1 text-lg cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors"
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
                    onClick={() => {
                      applyFontSize(size);
                      setIsFontSizeDropdownOpen(false);
                    }}
                  >
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{ fontSize: `${Math.max(size, 12)}px` }}
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
          className="flex items-center gap-1 text-lg cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors"
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
            {["left", "center", "right", "justify"].map((align) => (
              <div
                key={align}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  applyAlignment(align);
                  setIsAlignmentDropdownOpen(false);
                }}
              >
                {align === "left" && <FiAlignLeft />}
                {align === "center" && <FiAlignCenter />}
                {align === "right" && <FiAlignRight />}
                {align === "justify" && <FiAlignJustify />}
                <span className="text-sm">{align}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-400" />

      {/* TEXT COLOR */}
      <div className="relative">
        <div
          className="flex items-center gap-2 text-lg cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
        >
          <div
            className="w-4 h-4 rounded border border-gray-400"
            style={{ backgroundColor: selectedTextColor }}
          />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>
        {isColorDropdownOpen && (
          <div className="absolute top-full mt-2 bg-white border rounded-xl shadow-lg z-20 p-3 grid grid-cols-6 gap-2">
            {["black","green","red","blue","gold","orange","purple","pink","brown","teal","navy","gray"].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-black"
                style={{ backgroundColor: color }}
                onClick={() => {
                  applyTextColor(color);
                  setIsColorDropdownOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
        >
          <FiList size={iconSize} />
          <FiChevronDown className="text-xs sm:text-sm" size={chevronSize} />
        </div>
        {isListDropdownOpen && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-56">
            {["bullet","number","none"].map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  applyList(type);
                  setIsListDropdownOpen(false);
                }}
              >
                <span>{type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TipTapToolbar;
