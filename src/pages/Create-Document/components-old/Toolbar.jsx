import React, { useState } from "react";
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
  FiList,
  FiCrop,
  FiRotateCw,
  FiFile,
  FiColumns,
} from "react-icons/fi";
import { useTheme } from "../contexts-old/ThemeContext";

const Toolbar = ({
  editorRef,
  paperSize,
  margins,
  fontFamily,
  onFormatChange,
  onPaperSizeChange,
  onMarginChange,
  onFontChange,
  isClient = true,
  windowWidth = 1024,
}) => {
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [isAlignmentDropdownOpen, setIsAlignmentDropdownOpen] = useState(false);
  const [selectedAlignment, setSelectedAlignment] = useState("left");
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("default");
  const [selectedHighlightColor, setSelectedHighlightColor] =
    useState("transparent");
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [isPaperSizeDropdownOpen, setIsPaperSizeDropdownOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState("A4");
  const [isMarginDropdownOpen, setIsMarginDropdownOpen] = useState(false);
  const [selectedMargin, setSelectedMargin] = useState("Normal");
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);

  // B/I/U icons are intentionally bigger so they're clearly visible vs other controls
  const BIU_ICON = 22; // bold / italic / underline
  const ICON = 18; // all other icons
  const CHEVRON = 14;

  // ── Close all, open the named one ────────────────────────────────────────
  const handleDropdownToggle = (name, open) => {
    setIsAlignmentDropdownOpen(false);
    setIsColorDropdownOpen(false);
    setIsFontSizeDropdownOpen(false);
    setIsImageDropdownOpen(false);
    setIsPaperSizeDropdownOpen(false);
    setIsMarginDropdownOpen(false);
    setIsFontDropdownOpen(false);
    setIsListDropdownOpen(false);
    if (!open) return;
    switch (name) {
      case "alignment":
        setIsAlignmentDropdownOpen(true);
        break;
      case "color":
        setIsColorDropdownOpen(true);
        break;
      case "fontSize":
        setIsFontSizeDropdownOpen(true);
        break;
      case "image":
        setIsImageDropdownOpen(true);
        break;
      case "paperSize":
        setIsPaperSizeDropdownOpen(true);
        break;
      case "margin":
        setIsMarginDropdownOpen(true);
        break;
      case "font":
        setIsFontDropdownOpen(true);
        break;
      case "list":
        setIsListDropdownOpen(true);
        break;
    }
  };

  // ── Config ────────────────────────────────────────────────────────────────
  const paperSizes = {
    Letter: { width: "8.5in", height: "11in" },
    Tabloid: { width: "11in", height: "17in" },
    Legal: { width: "8.5in", height: "14in" },
    Statement: { width: "5.5in", height: "8.5in" },
    Executive: { width: "7.25in", height: "10.5in" },
    A3: { width: "11.69in", height: "16.53in" },
    A4: { width: "8.27in", height: "11.69in" },
    A5: { width: "5.83in", height: "8.27in" },
    "B4 (JIS)": { width: "10.12in", height: "14.33in" },
    "B5 (JIS)": { width: "7.16in", height: "10.12in" },
    Custom: { width: "21cm", height: "29.7cm" },
  };

  const marginOptions = {
    Normal: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    Narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    Moderate: { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" },
    Wide: { top: "1in", right: "2in", bottom: "1in", left: "2in" },
    Mirrored: { top: "1in", right: "1.25in", bottom: "1in", left: "1.25in" },
    Custom: {
      top: "2.54cm",
      right: "2.54cm",
      bottom: "2.54cm",
      left: "2.54cm",
    },
  };

  const fontOptions = [
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
  ];

  const fontSizeOptions = [
    10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72,
  ];

  const colorOptions = [
    "default",
    "black",
    "white",
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
  ];

  // ── Formatting helpers ────────────────────────────────────────────────────
  const applyFormatting = (command, value = null) => {
    if (!isClient || !editorRef?.current) return;
    editorRef.current.focus();

    if (command === "fontSize") {
      const selection = window.getSelection();
      if (selection?.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const contents = range.cloneContents();
        try {
          const span = document.createElement("span");
          span.style.fontSize = value;
          span.style.fontFamily = selectedFont;
          if (contents.textContent.trim() || contents.children.length > 0) {
            span.appendChild(contents);
            range.deleteContents();
            range.insertNode(span);
          } else {
            span.innerHTML = "&#8203;";
            range.insertNode(span);
          }
          range.setStartAfter(span);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          onFormatChange?.({ type: "fontSize", value });
        } catch {
          document.execCommand(command, false, value);
        }
      } else {
        document.execCommand(command, false, value);
      }
    } else {
      document.execCommand(command, false, value);
      onFormatChange?.({ type: command, value });
    }
  };

  const handleMouseDown = (e, cb) => {
    e.preventDefault();
    cb();
  };

  const applyBold = () => applyFormatting("bold");
  const applyItalic = () => applyFormatting("italic");
  const applyUnderline = () => applyFormatting("underline");

  const applyAlignment = (alignment) => {
    applyFormatting(
      `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
    );
    setSelectedAlignment(alignment);
    setIsAlignmentDropdownOpen(false);
  };

  const applyTextColor = (color) => {
    const actual =
      color === "default" ? (isDarkMode ? "white" : "black") : color;
    applyFormatting("foreColor", actual);
    setSelectedTextColor(color);
    setIsColorDropdownOpen(false);
  };

  const applyFontSize = (size) => {
    applyFormatting("fontSize", `${size}px`);
    setSelectedFontSize(size);
    setIsFontSizeDropdownOpen(false);
  };

  const applyPaperSize = (name) => {
    onPaperSizeChange?.(paperSizes[name]);
    setSelectedPaperSize(name);
    setIsPaperSizeDropdownOpen(false);
  };

  const applyMargin = (name) => {
    onMarginChange?.(marginOptions[name]);
    setSelectedMargin(name);
    setIsMarginDropdownOpen(false);
  };

  const applyFontFamily = (font) => {
    applyFormatting("fontName", font);
    setSelectedFont(font);
    setIsFontDropdownOpen(false);
    onFontChange?.(font);
  };

  const applyList = (listType, style = null) => {
    if (!isClient || !editorRef?.current) return;
    editorRef.current.focus();
    if (!window.getSelection()?.rangeCount) return;

    if (listType === "none") {
      document.execCommand("formatBlock", false, "p");
      document.execCommand("removeFormat", false, null);
      document.execCommand("outdent", false, null);
    } else if (listType === "bullet") {
      document.execCommand("insertUnorderedList", false, null);
      editorRef.current.querySelectorAll("ul").forEach((ul) => {
        ul.style.listStyleType = "disc";
        ul.style.marginLeft = "20px";
      });
    } else if (listType === "number") {
      document.execCommand("insertOrderedList", false, null);
      editorRef.current.querySelectorAll("ol").forEach((ol) => {
        if (style) ol.style.listStyleType = style;
        ol.style.marginLeft = "20px";
      });
    }
    setTimeout(() => {
      editorRef.current?.focus();
      setIsListDropdownOpen(false);
    }, 10);
  };

  const handleImageAction = (action) => {
    console.log(`Image action: ${action}`);
    setIsImageDropdownOpen(false);
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const dropdownStyle = {
    backgroundColor: currentColors.surface,
    border: `1px solid ${currentColors.border}`,
  };
  const hoverOn = (e) => {
    e.currentTarget.style.backgroundColor = currentColors.background;
  };
  const hoverOff = (e) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  // B/I/U: larger icon + bigger padding so they stand out among other controls
  const biuStyle = {
    cursor: "pointer",
    padding: "10px", // ~p-2.5 equivalent in px
    borderRadius: "6px",
    flexShrink: 0,
    transition: "background-color 0.15s",
    color: currentColors.text,
  };

  // Standard dropdown trigger
  const triggerCls =
    "flex-shrink-0 flex items-center gap-1 cursor-pointer p-2 rounded transition-colors";

  const Divider = () => (
    <div
      className="h-6 w-px flex-shrink-0"
      style={{ backgroundColor: currentColors.border }}
    />
  );

  return (
    /* Full-width, scrollable on small screens, items always centred */
    <div
      className="w-full border-b overflow-x-auto relative"
      style={{
        backgroundColor: currentColors.background,
        borderColor: currentColors.border,
        zIndex: 20,
      }}
    >
      <div className="flex flex-nowrap items-center justify-center gap-2 px-4 py-2 min-w-max mx-auto">
        {/* ── BOLD / ITALIC / UNDERLINE ── visually larger than the rest ── */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            style={biuStyle}
            onMouseDown={(e) => handleMouseDown(e, applyBold)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Bold"
          >
            <FiBold size={BIU_ICON} />
          </button>
          <button
            style={biuStyle}
            onMouseDown={(e) => handleMouseDown(e, applyItalic)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Italic"
          >
            <FiItalic size={BIU_ICON} />
          </button>
          <button
            style={biuStyle}
            onMouseDown={(e) => handleMouseDown(e, applyUnderline)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Underline"
          >
            <FiUnderline size={BIU_ICON} />
          </button>
        </div>

        <Divider />

        {/* ── FONT SIZE ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() =>
              handleDropdownToggle("fontSize", !isFontSizeDropdownOpen)
            }
          >
            <span className="text-sm font-medium min-w-[28px] text-center">
              {selectedFontSize}
            </span>
            <FiChevronDown size={CHEVRON} />
          </div>

          {isFontSizeDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-44 max-h-52 overflow-y-auto"
              style={dropdownStyle}
            >
              {fontSizeOptions.map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyFontSize(size))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span
                    style={{
                      fontSize: `${Math.min(Math.max(size, 12), 20)}px`,
                      minWidth: 16,
                    }}
                  >
                    T
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {size}px
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── ALIGNMENT ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() =>
              handleDropdownToggle("alignment", !isAlignmentDropdownOpen)
            }
          >
            {selectedAlignment === "left" && <FiAlignLeft size={ICON} />}
            {selectedAlignment === "center" && <FiAlignCenter size={ICON} />}
            {selectedAlignment === "right" && <FiAlignRight size={ICON} />}
            {selectedAlignment === "justify" && <FiAlignJustify size={ICON} />}
            <FiChevronDown size={CHEVRON} />
          </div>

          {isAlignmentDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 min-w-[140px]"
              style={dropdownStyle}
            >
              {[
                ["left", <FiAlignLeft size={14} />, "Left"],
                ["center", <FiAlignCenter size={14} />, "Center"],
                ["right", <FiAlignRight size={14} />, "Right"],
                ["justify", <FiAlignJustify size={14} />, "Justify"],
              ].map(([align, icon, label]) => (
                <div
                  key={align}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyAlignment(align))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
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
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() => handleDropdownToggle("color", !isColorDropdownOpen)}
            title="Text Color"
          >
            <div
              className="w-5 h-5 rounded border"
              style={{
                backgroundColor:
                  selectedTextColor === "default"
                    ? isDarkMode
                      ? "white"
                      : "black"
                    : selectedTextColor,
                borderColor: currentColors.border,
              }}
            />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isColorDropdownOpen && (
            <div
              className="absolute top-full mt-2 rounded-xl shadow-lg z-20 p-4"
              style={{ ...dropdownStyle, minWidth: "200px" }}
            >
              <div
                className="text-xs font-semibold mb-3"
                style={{ color: currentColors.textSecondary }}
              >
                Text Color
              </div>
              <div className="grid grid-cols-4 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    title={color === "default" ? "Default" : color}
                    className="w-8 h-8 rounded-md border-2 transition-all hover:scale-110 hover:shadow-md"
                    style={{
                      backgroundColor:
                        color === "default"
                          ? isDarkMode
                            ? "white"
                            : "black"
                          : color,
                      borderColor:
                        selectedTextColor === color
                          ? "#3b82f6"
                          : currentColors.border,
                      outline:
                        selectedTextColor === color
                          ? "2px solid #3b82f6"
                          : "none",
                      outlineOffset: "2px",
                    }}
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyTextColor(color))
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* ── IMAGE ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() => handleDropdownToggle("image", !isImageDropdownOpen)}
            title="Crop and Rotate"
          >
            <FiImage size={ICON} />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isImageDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 min-w-[120px]"
              style={dropdownStyle}
            >
              {[
                ["crop", <FiCrop size={14} />, "Crop"],
                ["rotate", <FiRotateCw size={14} />, "Rotate"],
              ].map(([action, icon, label]) => (
                <div
                  key={action}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => handleImageAction(action))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PAPER SIZE ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() =>
              handleDropdownToggle("paperSize", !isPaperSizeDropdownOpen)
            }
            title="Paper Size"
          >
            <FiFile size={ICON} />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isPaperSizeDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
              style={dropdownStyle}
            >
              {Object.entries(paperSizes).map(([name, { width, height }]) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyPaperSize(name))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span className="text-sm">{name}</span>
                  <span
                    className="text-xs"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {width} × {height}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MARGINS ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() =>
              handleDropdownToggle("margin", !isMarginDropdownOpen)
            }
            title="Margins"
          >
            <FiColumns size={ICON} />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isMarginDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
              style={dropdownStyle}
            >
              {Object.entries(marginOptions).map(([name, m]) => (
                <div
                  key={name}
                  className="flex flex-col px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyMargin(name))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span className="text-sm">{name}</span>
                  <span
                    className="text-xs"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {m.top} / {m.right} / {m.bottom} / {m.left}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── FONT FAMILY ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() => handleDropdownToggle("font", !isFontDropdownOpen)}
            title="Font Family"
          >
            <span
              className="text-sm font-medium max-w-[80px] truncate"
              style={{ fontFamily: selectedFont }}
            >
              {selectedFont}
            </span>
            <FiChevronDown size={CHEVRON} />
          </div>

          {isFontDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
              style={dropdownStyle}
            >
              {fontOptions.map((font) => (
                <div
                  key={font}
                  className="flex items-center px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyFontFamily(font))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span className="text-sm" style={{ fontFamily: font }}>
                    {font}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* ── LIST ── */}
        <div className="relative flex-shrink-0">
          <div
            className={triggerCls}
            style={{ color: currentColors.text }}
            onClick={() => handleDropdownToggle("list", !isListDropdownOpen)}
            title="Lists"
          >
            <FiList size={ICON} />
            <FiChevronDown size={CHEVRON} />
          </div>

          {isListDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-52"
              style={dropdownStyle}
            >
              <div
                className="border-b pb-1 mb-1"
                style={{ borderColor: currentColors.border }}
              >
                <div
                  className="px-3 py-1 text-xs font-semibold"
                  style={{ color: currentColors.textSecondary }}
                >
                  BULLETED
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyList("bullet"))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span className="text-sm">• Bulleted List</span>
                </div>
              </div>

              <div>
                <div
                  className="px-3 py-1 text-xs font-semibold"
                  style={{ color: currentColors.textSecondary }}
                >
                  NUMBERED
                </div>
                {[
                  ["decimal", "1. Numbered List"],
                  ["upper-roman", "I. Roman Numerals (Upper)"],
                  ["lower-alpha", "a. Alphabetical (Lower)"],
                  ["upper-alpha", "A. Alphabetical (Upper)"],
                  ["lower-roman", "i. Roman Numerals (Lower)"],
                ].map(([style, label]) => (
                  <div
                    key={style}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                    style={{ color: currentColors.text }}
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", style))
                    }
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>

              <div
                className="border-t pt-1 mt-1"
                style={{ borderColor: currentColors.border }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyList("none"))
                  }
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <span className="text-sm">None</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
