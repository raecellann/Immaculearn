// components/TiptapToolbar.jsx
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
  FiList,
} from "react-icons/fi";

const TiptapToolbar = ({
  editor,
  selectedAlignment,
  selectedTextColor,
  selectedHighlightColor,
  selectedFont,
  selectedFontSize,
  applyAlignment,
  applyTextColor,
  applyHighlightColor,
  applyFontFamily,
  applyFontSize,
  applyBold,
  applyItalic,
  applyUnderline,
  applyList,
  isAlignmentDropdownOpen,
  isColorDropdownOpen,
  isFontDropdownOpen,
  isFontSizeDropdownOpen,
  isListDropdownOpen,
  setIsAlignmentDropdownOpen,
  setIsColorDropdownOpen,
  setIsFontDropdownOpen,
  setIsFontSizeDropdownOpen,
  setIsListDropdownOpen,
}) => {
  if (!editor) {
    return (
      <div className="bg-[#EFEFEF] px-3 py-2 text-sm text-center">
        Loading toolbar...
      </div>
    );
  }

  const isEditorActive = (format) => {
    try {
      return typeof editor.isActive === "function" ? editor.isActive(format) : false;
    } catch {
      return false;
    }
  };

  // B/I/U are intentionally LARGER than the rest so they're clearly visible
  const BIU_ICON = 22;
  const ICON     = 18;
  const CHEVRON  = 14;

  // B/I/U button — bigger icon + bigger padding to match visual weight of other buttons
  const biuCls = (active = false) =>
    `flex-shrink-0 cursor-pointer p-2.5 rounded-md hover:bg-gray-200 transition-colors ${
      active ? "text-blue-500 bg-blue-100" : "text-gray-800"
    }`;

  // Standard toolbar trigger button
  const btnCls =
    "flex-shrink-0 flex items-center gap-1 cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors text-gray-800";

  const Divider = () => <div className="h-6 w-px bg-gray-400 flex-shrink-0" />;

  return (
    /* Full-width bar, scrollable on small screens, content always centred */
    <div className="bg-[#EFEFEF] w-full border-b overflow-x-auto">
      <div className="flex flex-nowrap items-center justify-center gap-2 px-4 py-2 min-w-max mx-auto">

        {/* ── BOLD / ITALIC / UNDERLINE ── bigger icons, bigger padding ── */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <FiBold
            className={biuCls(isEditorActive("bold"))}
            onClick={applyBold}
            title="Bold"
            size={BIU_ICON}
          />
          <FiItalic
            className={biuCls(isEditorActive("italic"))}
            onClick={applyItalic}
            title="Italic"
            size={BIU_ICON}
          />
          <FiUnderline
            className={biuCls(isEditorActive("underline"))}
            onClick={applyUnderline}
            title="Underline"
            size={BIU_ICON}
          />
        </div>

        <Divider />

        {/* ── FONT SIZE ── */}
        <div className="relative flex-shrink-0">
          <div
            className={btnCls}
            onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
          >
            <span className="text-sm font-medium min-w-[28px] text-center">
              {selectedFontSize}
            </span>
            <FiChevronDown size={CHEVRON} />
          </div>

          {isFontSizeDropdownOpen && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-44 max-h-52 overflow-y-auto">
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72].map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => { applyFontSize(size); setIsFontSizeDropdownOpen(false); }}
                >
                  <span className="font-medium w-4" style={{ fontSize: `${Math.min(Math.max(size, 12), 20)}px` }}>
                    T
                  </span>
                  <span className="text-sm text-gray-600">{size}px</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── ALIGNMENT ── */}
        <div className="relative flex-shrink-0">
          <div
            className={btnCls}
            onClick={() => setIsAlignmentDropdownOpen(!isAlignmentDropdownOpen)}
          >
            {selectedAlignment === "left"    && <FiAlignLeft    size={ICON} />}
            {selectedAlignment === "center"  && <FiAlignCenter  size={ICON} />}
            {selectedAlignment === "right"   && <FiAlignRight   size={ICON} />}
            {selectedAlignment === "justify" && <FiAlignJustify size={ICON} />}
            <FiChevronDown size={CHEVRON} />
          </div>

          {isAlignmentDropdownOpen && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[140px]">
              {[
                ["left",    <FiAlignLeft size={14} />,    "Left"],
                ["center",  <FiAlignCenter size={14} />,  "Center"],
                ["right",   <FiAlignRight size={14} />,   "Right"],
                ["justify", <FiAlignJustify size={14} />, "Justify"],
              ].map(([align, icon, label]) => (
                <div
                  key={align}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => { applyAlignment(align); setIsAlignmentDropdownOpen(false); }}
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── TEXT COLOR ── */}
        <div className="relative flex-shrink-0">
          <div
            className={btnCls}
            onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
            title="Text Color"
          >
            {/* Colour swatch sized to match BIU visually */}
            <div
              className="w-5 h-5 rounded border border-gray-400"
              style={{ backgroundColor: selectedTextColor }}
            />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isColorDropdownOpen && (
            <div
              className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4"
              style={{ minWidth: "196px" }}
            >
              <div className="text-xs font-semibold text-gray-500 mb-3">Text Color</div>
              <div className="grid grid-cols-4 gap-4">
                {["black","green","red","blue","gold","orange","purple","pink","brown","teal","navy","gray"].map((color) => (
                  <button
                    key={color}
                    title={color}
                    className="w-8 h-8 rounded-md border-2 border-gray-300 transition-all hover:scale-110 hover:shadow-md"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedTextColor === color ? "#3b82f6" : "#d1d5db",
                      outline: selectedTextColor === color ? "2px solid #3b82f6" : "none",
                      outlineOffset: "2px",
                    }}
                    onClick={() => { applyTextColor(color); setIsColorDropdownOpen(false); }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* ── LIST ── */}
        <div className="relative flex-shrink-0">
          <div
            className={btnCls}
            onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
            title="Lists"
          >
            <FiList size={ICON} />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isListDropdownOpen && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-52">
              {["bullet", "number", "none"].map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => { applyList(type); setIsListDropdownOpen(false); }}
                >
                  <span className="text-sm capitalize">{type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TiptapToolbar;