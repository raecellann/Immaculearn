import React, { useState, useEffect } from "react";
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
  FiFileText,
  FiList,
  FiCrop,
  FiRotateCw,
  FiFile,
  FiColumns,
} from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

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

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const handleDropdownToggle = (dropdownName, isOpen) => {
    // Close all other dropdowns when opening a new one
    if (isOpen) {
      setIsAlignmentDropdownOpen(false);
      setIsColorDropdownOpen(false);
      setIsFontSizeDropdownOpen(false);
      setIsImageDropdownOpen(false);
      setIsPaperSizeDropdownOpen(false);
      setIsMarginDropdownOpen(false);
      setIsFontDropdownOpen(false);
      setIsListDropdownOpen(false);
    }

    // Set the specific dropdown state
    switch (dropdownName) {
      case "alignment":
        setIsAlignmentDropdownOpen(isOpen);
        break;
      case "color":
        setIsColorDropdownOpen(isOpen);
        break;
      case "fontSize":
        setIsFontSizeDropdownOpen(isOpen);
        break;
      case "image":
        setIsImageDropdownOpen(isOpen);
        break;
      case "paperSize":
        setIsPaperSizeDropdownOpen(isOpen);
        break;
      case "margin":
        setIsMarginDropdownOpen(isOpen);
        break;
      case "font":
        setIsFontDropdownOpen(isOpen);
        break;
      case "list":
        setIsListDropdownOpen(isOpen);
        break;
    }
  };

  // Paper sizes configuration
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

  // Margin options configuration
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

  // Apply formatting using execCommand
  const applyFormatting = (command, value = null) => {
    if (!isClient || !editorRef?.current) return;

    editorRef.current.focus();

    // Special handling for font size
    if (command === "fontSize") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedContents = range.cloneContents();

        if (
          selectedContents.textContent.trim() ||
          selectedContents.children.length > 0
        ) {
          const span = document.createElement("span");
          span.style.fontSize = value;
          span.style.fontFamily = selectedFont;

          try {
            span.appendChild(selectedContents);
            range.deleteContents();
            range.insertNode(span);

            range.setStartAfter(span);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            // Trigger format change callback
            onFormatChange?.({ type: "fontSize", value });
          } catch (e) {
            document.execCommand(command, false, value);
          }
        } else {
          try {
            const tempSpan = document.createElement("span");
            tempSpan.style.fontSize = value;
            tempSpan.style.fontFamily = selectedFont;
            tempSpan.style.display = "inline";
            tempSpan.innerHTML = "&#8203;";

            range.insertNode(tempSpan);
            range.setStartAfter(tempSpan);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            setTimeout(() => {
              if (tempSpan.parentNode) {
                const textNode = document.createTextNode("");
                tempSpan.parentNode.replaceChild(textNode, tempSpan);
                range.setStart(textNode, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }, 0);

            onFormatChange?.({ type: "fontSize", value });
          } catch (e) {
            document.execCommand(command, false, value);
          }
        }
      } else {
        document.execCommand(command, false, value);
      }
    } else {
      document.execCommand(command, false, value);
      onFormatChange?.({ type: command, value });
    }
  };

  // Handle mouse down to prevent focus loss
  const handleMouseDown = (e, callback) => {
    e.preventDefault();
    callback();
  };

  const updateActiveFormats = () => {
    if (!isClient) return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  // Text formatting functions
  const applyBold = () => {
    applyFormatting("bold");
    updateActiveFormats();
  };

  const applyItalic = () => {
    applyFormatting("italic");
    updateActiveFormats();
  };

  const applyUnderline = () => {
    applyFormatting("underline");
    updateActiveFormats();
  };

  const applyAlignment = (alignment) => {
    if (selectedAlignment === alignment) {
      applyFormatting("justifyLeft");
      setSelectedAlignment("left");
    } else {
      applyFormatting(
        `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`,
      );
      setSelectedAlignment(alignment);
    }
    setIsAlignmentDropdownOpen(false);
  };

  const applyTextColor = (color) => {
    const actualColor =
      color === "default" ? (isDarkMode ? "white" : "black") : color;

    if (selectedTextColor === color) {
      applyFormatting("foreColor", isDarkMode ? "white" : "black");
      setSelectedTextColor("default");
    } else {
      applyFormatting("foreColor", actualColor);
      setSelectedTextColor(color);
    }
    setIsColorDropdownOpen(false);
  };

  const applyHighlightColor = (color) => {
    if (selectedHighlightColor === color) {
      applyFormatting("backColor", "transparent");
      setSelectedHighlightColor("transparent");
    } else {
      applyFormatting("backColor", color);
      setSelectedHighlightColor(color);
    }
    setIsColorDropdownOpen(false);
  };

  const applyFontSize = (size) => {
    if (selectedFontSize === size) {
      applyFormatting("fontSize", "16px");
      setSelectedFontSize(16);
    } else {
      const fontSizeValue = `${size}px`;
      applyFormatting("fontSize", fontSizeValue);
      setSelectedFontSize(size);
    }
    setIsFontSizeDropdownOpen(false);
  };

  const applyPaperSize = (size) => {
    if (selectedPaperSize === size) {
      const defaultSize = paperSizes["A4"];
      onPaperSizeChange?.(defaultSize);
      setSelectedPaperSize("A4");
    } else {
      onPaperSizeChange?.(paperSizes[size]);
      setSelectedPaperSize(size);
    }
    setIsPaperSizeDropdownOpen(false);
  };

  const applyMargin = (margin) => {
    if (selectedMargin === margin) {
      const defaultMargins = marginOptions["Normal"];
      onMarginChange?.(defaultMargins);
      setSelectedMargin("Normal");
    } else {
      onMarginChange?.(marginOptions[margin]);
      setSelectedMargin(margin);
    }
    setIsMarginDropdownOpen(false);
  };

  const applyFontFamily = (font) => {
    if (selectedFont === font) {
      applyFormatting("fontName", "Inter");
      setSelectedFont("Inter");
    } else {
      applyFormatting("fontName", font);
      setSelectedFont(font);
    }
    setIsFontDropdownOpen(false);
    onFontChange?.(font);
  };

  const applyList = (listType, style = null) => {
    if (!isClient || !editorRef?.current) return;

    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (listType === "none") {
      try {
        document.execCommand("formatBlock", false, "p");
        document.execCommand("removeFormat", false, null);
        document.execCommand("outdent", false, null);
      } catch (e) {
        throw e;
      }
    } else if (listType === "bullet") {
      try {
        document.execCommand("insertUnorderedList", false, null);
        const ulElements = editorRef.current?.querySelectorAll("ul");
        ulElements?.forEach((ul) => {
          ul.style.listStyleType = "disc";
          ul.style.marginLeft = "20px";
        });
      } catch (e) {
        throw e;
      }
    } else if (listType === "number") {
      try {
        document.execCommand("insertOrderedList", false, null);
        const olElements = editorRef.current?.querySelectorAll("ol");
        olElements?.forEach((ol) => {
          if (style) {
            ol.style.listStyleType = style;
          }
          ol.style.marginLeft = "20px";
        });
      } catch (e) {
        throw e;
      }
    }

    setTimeout(() => {
      editorRef.current?.focus();
      setIsListDropdownOpen(false);
    }, 10);
  };

  // Image actions placeholder
  const handleImageAction = (action) => {
    setIsImageDropdownOpen(false);
  };

  // Font options
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

  // Color options
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

  // Font sizes
  const fontSizeOptions = [
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
  ];

  return (
    <div
      className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 border-b"
      style={{
        backgroundColor: currentColors.background,
        borderColor: currentColors.border,
        color: currentColors.text,
      }}
    >
      {/* TEXT STYLE */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-lg sm:text-xl md:text-lg lg:text-lg">
        {/* Bold */}
        <FiBold
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors`}
          onMouseDown={(e) => handleMouseDown(e, applyBold)}
          title="Bold"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
          style={{
            color: activeFormats.bold ? "#3b82f6" : currentColors.text,
          }}
        />

        {/* Italic */}
        <FiItalic
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors`}
          onMouseDown={(e) => handleMouseDown(e, applyItalic)}
          title="Italic"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
          style={{
            color: activeFormats.italic ? "#3b82f6" : currentColors.text,
          }}
        />

        {/* Underline */}
        <FiUnderline
          className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors`}
          onMouseDown={(e) => handleMouseDown(e, applyUnderline)}
          title="Underline"
          size={windowWidth < 640 ? 32 : windowWidth < 768 ? 28 : 24}
          style={{
            color: activeFormats.underline ? "#3b82f6" : currentColors.text,
          }}
        />

        {/* Font Size Dropdown */}
        <div className="relative">
          <div
            className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
            style={{ color: currentColors.text }}
            onClick={() =>
              handleDropdownToggle("fontSize", !isFontSizeDropdownOpen)
            }
          >
            <span className="text-xs sm:text-sm md:text-sm lg:text-sm font-medium">
              {selectedFontSize}
            </span>
            <FiChevronDown
              className="text-xs sm:text-sm"
              size={windowWidth < 640 ? 14 : 16}
            />
          </div>

          {isFontSizeDropdownOpen && (
            <div
              className="absolute top-full mt-1 rounded shadow-lg z-10 w-48 sm:w-56"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
                border: `1px solid ${currentColors.border}`,
              }}
            >
              {fontSizeOptions.map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 cursor-pointer transition-colors rounded"
                  style={{ color: currentColors.text }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => {
                      applyFontSize(size);
                      setIsFontSizeDropdownOpen(false);
                    })
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      currentColors.background)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
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
                  <span
                    className="text-xs sm:text-sm"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {size}px
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="h-6 w-px"
        style={{ backgroundColor: currentColors.border }}
      />

      {/* ALIGNMENT */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() =>
            handleDropdownToggle("alignment", !isAlignmentDropdownOpen)
          }
        >
          {selectedAlignment === "left" && (
            <FiAlignLeft
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
          )}
          {selectedAlignment === "center" && (
            <FiAlignCenter
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
          )}
          {selectedAlignment === "right" && (
            <FiAlignRight
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
          )}
          {selectedAlignment === "justify" && (
            <FiAlignJustify
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
          )}
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isAlignmentDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {[
              ["left", <FiAlignLeft />, "Left"],
              ["center", <FiAlignCenter />, "Center"],
              ["right", <FiAlignRight />, "Right"],
              ["justify", <FiAlignJustify />, "Justify"],
            ].map(([align, icon, label]) => (
              <div
                key={align}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => {
                    applyAlignment(align);
                    setSelectedAlignment(align);
                    setIsAlignmentDropdownOpen(false);
                  })
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
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
          className="flex items-center gap-2 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() => handleDropdownToggle("color", !isColorDropdownOpen)}
          title="Text Color"
        >
          <div
            className="w-4 h-4 sm:w-4 sm:h-4 rounded border border-gray-400"
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
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isColorDropdownOpen && (
          <div
            className={`absolute top-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-lg z-20 p-3 ${
              windowWidth < 640
                ? "w-[280px] left-1/2 transform -translate-x-1/2"
                : windowWidth < 768
                  ? "w-[300px] left-1/2 transform -translate-x-1/2"
                  : "w-[320px] right-0"
            }`}
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <div className="text-xs font-semibold mb-2 text-gray-300">
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
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded border transition-opacity ${
                    windowWidth < 640 ? "text-xs" : "text-sm sm:text-base"
                  }`}
                  style={{
                    backgroundColor:
                      color === "default"
                        ? isDarkMode
                          ? "white"
                          : "black"
                        : color === "transparent"
                          ? "white"
                          : color,
                    borderColor:
                      color === "white" || color === "default"
                        ? currentColors.border
                        : currentColors.border,
                  }}
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => applyTextColor(color))
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span
                    className="font-bold text-xs"
                    style={{
                      color:
                        color === "transparent" ||
                        color === "white" ||
                        (color === "default" && isDarkMode)
                          ? "black"
                          : "white",
                    }}
                  >
                    {color === "default" ? "D" : "A"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="h-6 w-px"
        style={{ backgroundColor: currentColors.border }}
      />

      {/* IMAGE */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() => handleDropdownToggle("image", !isImageDropdownOpen)}
          title="Crop and Rotate"
        >
          <FiImage
            size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
          />
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isImageDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
              style={{ color: currentColors.text }}
              onMouseDown={(e) =>
                handleMouseDown(e, () => handleImageAction("crop"))
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  currentColors.background)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <FiCrop size={16} />
              <span className="text-sm">Crop</span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
              style={{ color: currentColors.text }}
              onMouseDown={(e) =>
                handleMouseDown(e, () => handleImageAction("rotate"))
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  currentColors.background)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
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
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() =>
            handleDropdownToggle("paperSize", !isPaperSizeDropdownOpen)
          }
          title="Paper Size"
        >
          <FiFile
            className="text-sm"
            size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
          />
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isPaperSizeDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {Object.entries(paperSizes).map(([name, { width, height }]) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyPaperSize(name))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
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

      {/* MARGINS */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() => handleDropdownToggle("margin", !isMarginDropdownOpen)}
          title="Margins"
        >
          <FiColumns
            className="text-sm"
            size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
          />
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isMarginDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {Object.entries(marginOptions).map(([name, margins]) => (
              <div
                key={name}
                className="flex flex-col px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) => handleMouseDown(e, () => applyMargin(name))}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">{name}</span>
                <span
                  className="text-xs"
                  style={{ color: currentColors.textSecondary }}
                >
                  {margins.top} / {margins.right} / {margins.bottom} /{" "}
                  {margins.left}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="h-6 w-px"
        style={{ backgroundColor: currentColors.border }}
      />

      {/* FONT FAMILY */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() => handleDropdownToggle("font", !isFontDropdownOpen)}
          title="Font Family"
        >
          <span
            className="text-xs sm:text-sm font-medium"
            style={{ fontFamily: selectedFont }}
          >
            {selectedFont}
          </span>
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isFontDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10 w-48"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {fontOptions.map((font) => (
              <div
                key={font}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyFontFamily(font))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
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

      <div
        className="h-6 w-px"
        style={{ backgroundColor: currentColors.border }}
      />

      {/* LIST */}
      <div className="relative">
        <div
          className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded transition-colors"
          style={{ color: currentColors.text }}
          onClick={() => handleDropdownToggle("list", !isListDropdownOpen)}
          title="Lists"
        >
          <FiList size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />
          <FiChevronDown
            className="text-xs sm:text-sm"
            size={windowWidth < 640 ? 14 : 16}
          />
        </div>

        {isListDropdownOpen && (
          <div
            className="absolute top-full mt-1 rounded shadow-lg z-10 w-56"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {/* Bulleted Lists */}
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
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("bullet"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">• Bulleted List</span>
              </div>
            </div>

            {/* Numbered Lists */}
            <div>
              <div
                className="px-3 py-1 text-xs font-semibold"
                style={{ color: currentColors.textSecondary }}
              >
                NUMBERED
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("number", "decimal"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">1. Numbered List</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("number", "upper-roman"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">I. Roman Numerals (Upper)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("number", "lower-alpha"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">a. Alphabetical (Lower)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("number", "upper-alpha"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">A. Alphabetical (Upper)</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) =>
                  handleMouseDown(e, () => applyList("number", "lower-roman"))
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm">i. Roman Numerals (Lower)</span>
              </div>
            </div>

            {/* None Option */}
            <div
              className="border-t pt-1 mt-1"
              style={{ borderColor: currentColors.border }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded"
                style={{ color: currentColors.text }}
                onMouseDown={(e) => handleMouseDown(e, () => applyList("none"))}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    currentColors.background)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-sm" style={{ color: currentColors.text }}>
                  None
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
