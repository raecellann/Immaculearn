import React, { useState, useRef, useEffect } from "react";
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
  FiCrop,
  FiRotateCw,
  FiFile,
  FiColumns,
  FiDownload,
  FiSave,
  FiCheck,
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
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [isPaperSizeDropdownOpen, setIsPaperSizeDropdownOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState("A4");
  const [isMarginDropdownOpen, setIsMarginDropdownOpen] = useState(false);
  const [selectedMargin, setSelectedMargin] = useState("Normal");
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

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
  };

  const marginOptions = {
    Normal: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    Narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    Moderate: { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" },
    Wide: { top: "1in", right: "2in", bottom: "1in", left: "2in" },
    Mirrored: { top: "1in", right: "1.25in", bottom: "1in", left: "1.25in" },
  };

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const applyFormatting = (command, value = null) => {
    if (!isClient) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const handleMouseDown = (e, callback) => {
    e.preventDefault(); // 
    callback();
  };

  const applyBold = () => {
    if (isClient && document.queryCommandState('bold')) {
      applyFormatting('bold'); // Toggle off
    } else {
      applyFormatting('bold'); // Toggle on
    }
  };

  const applyItalic = () => {
    if (isClient && document.queryCommandState('italic')) {
      applyFormatting('italic'); // Toggle off
    } else {
      applyFormatting('italic'); // Toggle on
    }
  };

  const applyUnderline = () => {
    if (isClient && document.queryCommandState('underline')) {
      applyFormatting('underline'); // Toggle off
    } else {
      applyFormatting('underline'); // Toggle on
    }
  };

  const applyAlignment = (alignment) => {
    if (selectedAlignment === alignment) {
      // If clicking the same alignment, reset to left
      applyFormatting('justifyLeft');
      setSelectedAlignment('left');
    } else {
      applyFormatting(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
      setSelectedAlignment(alignment);
    }
  };

  const applyTextColor = (color) => {
    if (selectedTextColor === color) {
      // If clicking the same color, reset to black
      applyFormatting('foreColor', 'black');
      setSelectedTextColor('black');
    } else {
      applyFormatting('foreColor', color);
      setSelectedTextColor(color);
    }
    setIsColorDropdownOpen(false);
  };

  const applyHighlightColor = (color) => {
    if (selectedHighlightColor === color) {
      // If clicking the same color, reset to transparent
      applyFormatting('backColor', 'transparent');
      setSelectedHighlightColor('transparent');
    } else {
      applyFormatting('backColor', color);
      setSelectedHighlightColor(color);
    }
    setIsColorDropdownOpen(false);
  };

  const applyFontSize = (size) => {
    if (selectedFontSize === size) {
      // If clicking the same size, reset to default
      applyFormatting('fontSize', '16px');
      setSelectedFontSize(16);
    } else {
      applyFormatting('fontSize', `${size}px`);
      setSelectedFontSize(size);
    }
  };

  const handleImageAction = (action) => {
    // Placeholder for image manipulation functions
    console.log(`Image action: ${action}`);
    setIsImageDropdownOpen(false);
  };

  const applyPaperSize = (size) => {
    if (selectedPaperSize === size) {
      // If clicking the same size, reset to default
      const defaultSize = paperSizes['A4'];
      if (editorRef.current) {
        editorRef.current.style.width = defaultSize.width;
        editorRef.current.style.height = defaultSize.height;
      }
      setSelectedPaperSize('A4');
    } else {
      if (editorRef.current) {
        editorRef.current.style.width = paperSizes[size].width;
        editorRef.current.style.height = paperSizes[size].height;
      }
      setSelectedPaperSize(size);
    }
    setIsPaperSizeDropdownOpen(false);
  };

  const applyMargin = (margin) => {
    if (selectedMargin === margin) {
      // If clicking the same margin, reset to default
      const defaultMargins = marginOptions['Normal'];
      if (editorRef.current) {
        editorRef.current.style.padding = `${defaultMargins.top} ${defaultMargins.right} ${defaultMargins.bottom} ${defaultMargins.left}`;
      }
      setSelectedMargin('Normal');
    } else {
      if (editorRef.current) {
        const margins = marginOptions[margin];
        editorRef.current.style.padding = `${margins.top} ${margins.right} ${margins.bottom} ${margins.left}`;
      }
      setSelectedMargin(margin);
    }
    setIsMarginDropdownOpen(false);
  };

  const applyFontFamily = (font) => {
    if (selectedFont === font) {
      // If clicking the same font, reset to default
      applyFormatting('fontName', 'Inter');
      setSelectedFont('Inter');
    } else {
      applyFormatting('fontName', font);
      setSelectedFont(font);
    }
    setIsFontDropdownOpen(false);
  };

  const applyList = (listType, style = null) => {
    if (!isClient) return;
    // Ensure editor has focus
    editorRef.current?.focus();
    
    // Get current selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    if (listType === "none") {
      // Remove list formatting
      try {
        document.execCommand('formatBlock', false, 'p');
        document.execCommand('removeFormat', false, null);
        document.execCommand('outdent', false, null);
      } catch (e) {
        console.log('Error removing list:', e);
      }
    } else if (listType === "bullet") {
      // Create or toggle bullet list
      try {
        document.execCommand('insertUnorderedList', false, null);
        // Apply bullet style to all ul elements in the editor
        const ulElements = editorRef.current?.querySelectorAll('ul');
        ulElements?.forEach(ul => {
          ul.style.listStyleType = 'disc';
          ul.style.marginLeft = '20px';
        });
      } catch (e) {
        console.log('Error creating bullet list:', e);
      }
    } else if (listType === "number") {
      // Create or toggle numbered list
      try {
        document.execCommand('insertOrderedList', false, null);
        // Apply numbering style to all ol elements in the editor
        const olElements = editorRef.current?.querySelectorAll('ol');
        olElements?.forEach(ol => {
          if (style) {
            ol.style.listStyleType = style;
          }
          ol.style.marginLeft = '20px';
        });
      } catch (e) {
        console.log('Error creating numbered list:', e);
      }
    }
    
    // Maintain focus and close dropdown
    setTimeout(() => {
      editorRef.current?.focus();
      setIsListDropdownOpen(false);
    }, 10);
  };

  const downloadDocument = (format) => {
    const content = editorRef.current?.innerText || '';
    const title = title || 'Document';
    
    if (format === 'txt') {
      // Download as text file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: ${selectedFont}, Arial, sans-serif; line-height: 1.5; }
            @page { size: ${paperSizes[selectedPaperSize].width} ${paperSizes[selectedPaperSize].height}; margin: ${marginOptions[selectedMargin].top} ${marginOptions[selectedMargin].right} ${marginOptions[selectedMargin].bottom} ${marginOptions[selectedMargin].left}; }
          </style>
        </head>
        <body>
          ${editorRef.current?.innerHTML || ''}
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll use window.print() as a fallback
      // In a real app, you'd use a library like jsPDF or puppeteer
      window.print();
    }
    
    setIsDownloadDropdownOpen(false);
  };

  const autoSave = () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    // Simulate save process
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 1000);
  };

  const handleContentChange = () => {
    if (!isClient) return;
    setSaveStatus('unsaved');
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

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

            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <FiSave className="text-blue-500 animate-spin" />
                    <span className="text-gray-600">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <FiCheck className="text-green-500" />
                    <span className="text-gray-600">
                      {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Saved'}
                    </span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <FiSave className="text-gray-400" />
                    <span className="text-gray-500">Unsaved changes</span>
                  </>
                )}
              </div>
              
              <div className="relative">
                <button
                  className="px-6 py-2 rounded-full bg-[#3B82F6] text-white font-medium"
                  onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                >
                  Download
                </button>

                {isDownloadDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-40">
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => downloadDocument('html')}
                    >
                      <FiDownload size={16} className="text-gray-800" />
                      <span className="text-sm text-gray-800">Word (.docx)</span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => downloadDocument('pdf')}
                    >
                      <FiDownload size={16} className="text-gray-800" />
                      <span className="text-sm text-gray-800">PDF</span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => downloadDocument('txt')}
                    >
                      <FiDownload size={16} className="text-gray-800" />
                      <span className="text-sm text-gray-800">Text (.txt)</span>
                    </div>
                  </div>
                )}
              </div>
              <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-600 font-medium">
                Cancel
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Document Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full max-w-3xl px-5 py-3 border-2 rounded-xl text-lg font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Active Editors - Google Docs Style */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Active editors:</span>
            <div className="flex items-center -space-x-2">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/zj_ouikks.jpg"
                  className="w-7 h-7 rounded-full object-cover border-2 border-white"
                  title="Zeldrick Jesus"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/nath_tzkpl5.jpg"
                  className="w-7 h-7 rounded-full object-cover border-2 border-white"
                  title="Nathaniel"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 people editing</span>
          </div>
        </div>

        {/* ================= TOOLBAR ================= */}
        <div className="bg-[#EFEFEF] px-8 py-3 flex items-center gap-6 border-b text-gray-800">
          {/* TEXT STYLE */}
          <div className="flex items-center gap-4 text-lg">
            <FiBold
              className={`cursor-pointer ${isClient && document.queryCommandState('bold') ? 'text-blue-500 bg-blue-100 rounded' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyBold)}
              title="Bold"
            />
            <FiItalic
              className={`cursor-pointer ${isClient && document.queryCommandState('italic') ? 'text-blue-500 bg-blue-100 rounded' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyItalic)}
              title="Italic"
            />
            <FiUnderline
              className={`cursor-pointer ${isClient && document.queryCommandState('underline') ? 'text-blue-500 bg-blue-100 rounded' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyUnderline)}
              title="Underline"
            />
            <div className="relative">
              <div
                className="flex items-center gap-1 text-lg cursor-pointer"
                onClick={() =>
                  setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)
                }
              >
                <span className="text-sm">{selectedFontSize}</span>
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
              className={`flex items-center gap-2 text-lg cursor-pointer ${selectedTextColor !== 'black' ? 'text-blue-500 bg-blue-100 rounded px-2 py-1' : ''}`}
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
              title="Text Color"
            >
              <div
                className="w-4 h-4 rounded border border-gray-400"
                style={{ backgroundColor: selectedTextColor }}
              />
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

          {/* IMAGE */}
          <div className="relative">
            <div
              className="flex items-center gap-1 text-lg cursor-pointer"
              onClick={() => setIsImageDropdownOpen(!isImageDropdownOpen)}
              title="Crop and Rotate"
            >
              <FiImage />
              <FiChevronDown className="text-sm" />
            </div>

            {isImageDropdownOpen && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => handleImageAction("crop"))
                  }
                >
                  <FiCrop size={16} />
                  <span className="text-sm">Crop</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={(e) =>
                    handleMouseDown(e, () => handleImageAction("rotate"))
                  }
                >
                  <FiRotateCw size={16} />
                  <span className="text-sm">Rotate</span>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <div
              className={`flex items-center gap-1 text-lg cursor-pointer ${selectedPaperSize !== 'A4' ? 'text-blue-500 bg-blue-100 rounded px-2 py-1' : ''}`}
              onClick={() => setIsPaperSizeDropdownOpen(!isPaperSizeDropdownOpen)}
              title="Paper Size"
            >
              <FiFile className="text-sm" />
              <FiChevronDown className="text-sm" />
            </div>

            {isPaperSizeDropdownOpen && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
                {Object.entries(paperSizes).map(([name, { width, height }]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyPaperSize(name))
                    }
                  >
                    <span className="text-sm">{name}</span>
                    <span className="text-xs text-gray-500">{width} × {height}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <div
              className={`flex items-center gap-1 text-lg cursor-pointer ${selectedMargin !== 'Normal' ? 'text-blue-500 bg-blue-100 rounded px-2 py-1' : ''}`}
              onClick={() => setIsMarginDropdownOpen(!isMarginDropdownOpen)}
              title="Margins"
            >
              <FiColumns className="text-sm" />
              <FiChevronDown className="text-sm" />
            </div>

            {isMarginDropdownOpen && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
                {Object.entries(marginOptions).map(([name, margins]) => (
                  <div
                    key={name}
                    className="flex flex-col px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyMargin(name))
                    }
                  >
                    <span className="text-sm font-medium">{name}</span>
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
              className={`flex items-center gap-1 text-lg cursor-pointer ${selectedFont !== 'Inter' ? 'text-blue-500 bg-blue-100 rounded px-2 py-1' : ''}`}
              onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
              title="Font Family"
            >
              <span className="text-sm" style={{ fontFamily: selectedFont }}>
                {selectedFont}
              </span>
              <FiChevronDown className="text-sm" />
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
                  "Trebuchet MS"
                ].map((font) => (
                  <div
                    key={font}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyFontFamily(font))
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
              className="flex items-center gap-1 text-lg cursor-pointer"
              onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
              title="Lists"
            >
              <FiList />
              <FiChevronDown className="text-sm" />
            </div>

            {isListDropdownOpen && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-56">
                {/* Bulleted Lists */}
                <div className="border-b border-gray-200 pb-1 mb-1">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">BULLETED</div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("bullet"))
                    }
                  >
                    <span className="text-sm">• Bulleted List</span>
                  </div>
                </div>
                
                {/* Numbered Lists */}
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">NUMBERED</div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", "decimal"))
                    }
                  >
                    <span className="text-sm">1. Numbered List</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", "upper-roman"))
                    }
                  >
                    <span className="text-sm">I. Roman Numerals (Upper)</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", "lower-alpha"))
                    }
                  >
                    <span className="text-sm">a. Alphabetical (Lower)</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", "upper-alpha"))
                    }
                  >
                    <span className="text-sm">A. Alphabetical (Upper)</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("number", "lower-roman"))
                    }
                  >
                    <span className="text-sm">i. Roman Numerals (Lower)</span>
                  </div>
                </div>
                
                {/* None Option */}
                <div className="border-t border-gray-200 pt-1 mt-1">
                  <div
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={(e) =>
                      handleMouseDown(e, () => applyList("none"))
                    }
                  >
                    <span className="text-sm">None</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto"></div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-8 overflow-x-auto">
          <div className="flex justify-center">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="bg-white rounded-lg shadow min-h-[500px] text-black focus:outline-none transition-all duration-200"
              onInput={handleContentChange}
              style={{
                width: paperSizes[selectedPaperSize].width,
                height: paperSizes[selectedPaperSize].height,
                maxWidth: '100%',
                overflow: 'auto',
                padding: `${marginOptions[selectedMargin].top} ${marginOptions[selectedMargin].right} ${marginOptions[selectedMargin].bottom} ${marginOptions[selectedMargin].left}`,
                lineHeight: '1.5'
              }}
            >
              <div>Nathaniel: DFD & Database</div>
              <br />
              <div>Zeldrick: Papers and Front-End</div>
              <br />
              <div>Wilson: DFD & Back-End</div>
              <br />
              <div>Raecell: Survey & Prototype</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDocumentPage;
