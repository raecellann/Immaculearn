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
  FiMenu,
  FiX,
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
  const [customPaperSize, setCustomPaperSize] = useState({ width: '21', height: '29.7' });
  const [customMargins, setCustomMargins] = useState({ top: '2.54', right: '2.54', bottom: '2.54', left: '2.54' });
  const [showCustomSizeDialog, setShowCustomSizeDialog] = useState(false);
  const [showCustomMarginDialog, setShowCustomMarginDialog] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

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
    Custom: { width: "21cm", height: "29.7cm" }, // Default A4 in cm
  };

  const marginOptions = {
    Normal: { top: "1in", right: "1in", bottom: "1in", left: "1in" },
    Narrow: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    Moderate: { top: "1in", right: "0.75in", bottom: "1in", left: "0.75in" },
    Wide: { top: "1in", right: "2in", bottom: "1in", left: "2in" },
    Mirrored: { top: "1in", right: "1.25in", bottom: "1in", left: "1.25in" },
    Custom: { top: "2.54cm", right: "2.54cm", bottom: "2.54cm", left: "2.54cm" }, // Default 1 inch in cm
  };

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const applyFormatting = (command, value = null) => {
    if (!isClient) return;
    editorRef.current?.focus();
    
    // Special handling for font size to ensure it works properly
    if (command === 'fontSize') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedContents = range.cloneContents();
        
        if (selectedContents.textContent.trim() || selectedContents.children.length > 0) {
          // Create a span element with the desired font size
          const span = document.createElement('span');
          span.style.fontSize = value;
          span.style.fontFamily = selectedFont;
          
          try {
            // Preserve the original HTML structure including spacing
            span.appendChild(selectedContents);
            
            // Extract the selected content and replace with styled span
            range.deleteContents();
            range.insertNode(span);
            
            // Move cursor after the span
            range.setStartAfter(span);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // Fallback to execCommand if manual approach fails
            document.execCommand(command, false, value);
          }
        } else {
          // For cursor position (no selection), set the font for future typing
          try {
            // Create a temporary span to set the font style
            const tempSpan = document.createElement('span');
            tempSpan.style.fontSize = value;
            tempSpan.style.fontFamily = selectedFont;
            tempSpan.style.display = 'inline';
            tempSpan.innerHTML = '&#8203;'; // Zero-width space
            
            // Insert the temporary span
            range.insertNode(tempSpan);
            
            // Move cursor after the temp span
            range.setStartAfter(tempSpan);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Remove the temp span but keep the styling
            setTimeout(() => {
              if (tempSpan.parentNode) {
                const textNode = document.createTextNode('');
                tempSpan.parentNode.replaceChild(textNode, tempSpan);
                range.setStart(textNode, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }, 0);
          } catch (e) {
            // Fallback to execCommand
            document.execCommand(command, false, value);
          }
        }
      } else {
        // No selection, use execCommand
        document.execCommand(command, false, value);
      }
    } else {
      // For other commands, use execCommand
      document.execCommand(command, false, value);
    }
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
      // Apply the font size with proper formatting
      const fontSizeValue = `${size}px`;
      applyFormatting('fontSize', fontSizeValue);
      setSelectedFontSize(size);
      
      // Force a content change to trigger auto-save
      setTimeout(() => {
        if (editorRef.current) {
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
      }, 10);
    }
  };

  const handleImageAction = (action) => {
    // Placeholder for image manipulation functions
    console.log(`Image action: ${action}`);
    setIsImageDropdownOpen(false);
  };

  const applyPaperSize = (size) => {
    if (size === 'Custom') {
      setShowCustomSizeDialog(true);
      return;
    }
    
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

  const applyCustomPaperSize = () => {
    const widthInCm = `${customPaperSize.width}cm`;
    const heightInCm = `${customPaperSize.height}cm`;
    
    if (editorRef.current) {
      editorRef.current.style.width = widthInCm;
      editorRef.current.style.height = heightInCm;
    }
    
    // Update the paperSizes object with custom values
    paperSizes.Custom = { width: widthInCm, height: heightInCm };
    setSelectedPaperSize('Custom');
    setShowCustomSizeDialog(false);
    setIsPaperSizeDropdownOpen(false);
  };

  const applyMargin = (margin) => {
    if (margin === 'Custom') {
      setShowCustomMarginDialog(true);
      return;
    }
    
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

  const applyCustomMargins = () => {
    const topCm = `${customMargins.top}cm`;
    const rightCm = `${customMargins.right}cm`;
    const bottomCm = `${customMargins.bottom}cm`;
    const leftCm = `${customMargins.left}cm`;
    
    if (editorRef.current) {
      editorRef.current.style.padding = `${topCm} ${rightCm} ${bottomCm} ${leftCm}`;
    }
    
    // Update the marginOptions object with custom values
    marginOptions.Custom = { top: topCm, right: rightCm, bottom: bottomCm, left: leftCm };
    setSelectedMargin('Custom');
    setShowCustomMarginDialog(false);
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

  // Set client-side flag and window width
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={"fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 " + 
        (mobileSidebarOpen ? "translate-x-0" : "-translate-x-full") + 
        " md:block lg:hidden"}
      >
        <Sidebar />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white px-4 py-3 border-b flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Document Editor</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white px-8 py-5 border-b">
        {/* ================= HEADER ================= */}
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

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Document Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full sm:max-w-3xl px-3 sm:px-5 py-3 border-2 rounded-xl text-base sm:text-lg font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Active Editors - Google Docs Style */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-gray-600">Active editors:</span>
            <div className="flex items-center -space-x-1 sm:-space-x-2">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/zj_ouikks.jpg"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-white"
                  title="Zeldrick Jesus"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/nath_tzkpl5.jpg"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-2 border-white"
                  title="Nathaniel"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              </div>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">2 people editing</span>
          </div>
        </div>

        {/* ================= TOOLBAR ================= */}
        <div className="bg-[#EFEFEF] px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 border-b text-gray-800">
          {/* TEXT STYLE */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-lg sm:text-xl md:text-lg lg:text-lg">
            <FiBold
              className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${isClient && document.queryCommandState('bold') ? 'text-blue-500 bg-blue-100' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyBold)}
              title="Bold"
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
            <FiItalic
              className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${isClient && document.queryCommandState('italic') ? 'text-blue-500 bg-blue-100' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyItalic)}
              title="Italic"
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
            <FiUnderline
              className={`cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${isClient && document.queryCommandState('underline') ? 'text-blue-500 bg-blue-100' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, applyUnderline)}
              title="Underline"
              size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16}
            />
            <div className="relative">
              <div
                className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
                onClick={() =>
                  setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)
                }
              >
                <span className="text-xs sm:text-sm md:text-sm lg:text-sm font-medium">{selectedFontSize}</span>
                <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
              </div>

              {isFontSizeDropdownOpen && (
                <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 w-48 sm:w-56">
                  {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72].map(
                    (size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 px-2 sm:px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={(e) =>
                          handleMouseDown(e, () => {
                            applyFontSize(size);
                            setIsFontSizeDropdownOpen(false);
                          })
                        }
                      >
                        <span
                          className="text-xs sm:text-sm font-medium"
                          style={{ 
                            fontSize: `${Math.max(size, 12)}px`,
                            minWidth: '16px',
                            display: 'inline-block'
                          }}
                        >
                          T
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">{size}px</span>
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
              onClick={() =>
                setIsAlignmentDropdownOpen(!isAlignmentDropdownOpen)
              }
            >
              {selectedAlignment === "left" && <FiAlignLeft size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />}
              {selectedAlignment === "center" && <FiAlignCenter size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />}
              {selectedAlignment === "right" && <FiAlignRight size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />}
              {selectedAlignment === "justify" && <FiAlignJustify size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />}
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
              className={`flex items-center gap-2 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${selectedTextColor !== 'black' ? 'text-blue-500 bg-blue-100' : ''}`}
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
              title="Text Color"
            >
              <div
                className="w-4 h-4 sm:w-4 sm:h-4 rounded border border-gray-400"
                style={{ backgroundColor: selectedTextColor }}
              />
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
            </div>

            {isColorDropdownOpen && (
              <div className={`absolute top-full mt-2 bg-white border rounded-xl shadow-lg z-20 p-3 ${
                windowWidth < 640 ? 'w-[280px] left-1/2 transform -translate-x-1/2' : 
                windowWidth < 768 ? 'w-[300px] left-1/2 transform -translate-x-1/2' : 
                'w-[320px] right-0'
              }`}>
                <div className="text-xs font-semibold mb-2 text-gray-700">
                  Text Color
                </div>

                <div className={`grid gap-2 ${
                  windowWidth < 640 ? 'grid-cols-3' : 
                  windowWidth < 768 ? 'grid-cols-4' : 
                  'grid-cols-6'
                }`}>
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
                        windowWidth < 640 ? 'text-xs' : 'text-sm sm:text-base'
                      }`}
                      style={{
                        backgroundColor: color === "transparent" ? "white" : color,
                      }}
                      onMouseDown={(e) =>
                        handleMouseDown(e, () => applyTextColor(color))
                      }
                    >
                      <span className="font-bold" style={{ color: color === "transparent" ? "black" : "white" }}>
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
              <FiImage size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
              className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${selectedPaperSize !== 'A4' ? 'text-blue-500 bg-blue-100' : ''}`}
              onClick={() => setIsPaperSizeDropdownOpen(!isPaperSizeDropdownOpen)}
              title="Paper Size"
            >
              <FiFile className="text-sm" size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
              className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${selectedMargin !== 'Normal' ? 'text-blue-500 bg-blue-100' : ''}`}
              onClick={() => setIsMarginDropdownOpen(!isMarginDropdownOpen)}
              title="Margins"
            >
              <FiColumns className="text-sm" size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
              className={`flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors ${selectedFont !== 'Inter' ? 'text-blue-500 bg-blue-100' : ''}`}
              onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
              title="Font Family"
            >
              <span className="text-xs sm:text-sm font-medium" style={{ fontFamily: selectedFont }}>
                {selectedFont}
              </span>
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
              className="flex items-center gap-1 text-lg cursor-pointer p-2 sm:p-2 md:p-2 lg:p-1 sm:p-2 rounded hover:bg-gray-200 transition-colors"
              onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
              title="Lists"
            >
              <FiList size={windowWidth < 640 ? 18 : windowWidth < 768 ? 20 : 16} />
              <FiChevronDown className="text-xs sm:text-sm" size={windowWidth < 640 ? 14 : 16} />
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
        <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
          {/* Custom Paper Size Dialog */}
          {showCustomSizeDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-96 sm:w-full max-w-[90vw]">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Custom Paper Size (cm)</h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      value={customPaperSize.width}
                      onChange={(e) => setCustomPaperSize({...customPaperSize, width: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={customPaperSize.height}
                      onChange={(e) => setCustomPaperSize({...customPaperSize, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 justify-end">
                  <button
                    onClick={() => setShowCustomSizeDialog(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyCustomPaperSize}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Margin Dialog */}
          {showCustomMarginDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-96 sm:w-full max-w-[90vw]">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Custom Margins (cm)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top (cm)</label>
                    <input
                      type="number"
                      value={customMargins.top}
                      onChange={(e) => setCustomMargins({...customMargins, top: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Right (cm)</label>
                    <input
                      type="number"
                      value={customMargins.right}
                      onChange={(e) => setCustomMargins({...customMargins, right: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bottom (cm)</label>
                    <input
                      type="number"
                      value={customMargins.bottom}
                      onChange={(e) => setCustomMargins({...customMargins, bottom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Left (cm)</label>
                    <input
                      type="number"
                      value={customMargins.left}
                      onChange={(e) => setCustomMargins({...customMargins, left: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 justify-end">
                  <button
                    onClick={() => setShowCustomMarginDialog(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyCustomMargins}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CENTERED EDITOR CONTAINER */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="bg-white rounded-lg shadow-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 p-6 sm:p-8"
              onInput={handleContentChange}
              style={{
                width: isClient && windowWidth < 768 ? '95vw' : paperSizes[selectedPaperSize].width,
                height: isClient && windowWidth < 768 ? '60vh' : paperSizes[selectedPaperSize].height,
                maxWidth: '100%',
                overflow: 'auto',
                lineHeight: '1.6',
                minHeight: isClient && windowWidth < 768 ? '400px' : 'auto',
                margin: '0 auto',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                fontSize: '16px',
                fontFamily: selectedFont
              }}
            >
              <h1 className="text-3xl font-bold mb-6 text-center">
                Thesis Chapter 2 Participation
              </h1>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">N</div>
                    <div>
                      <strong>Nathaniel:</strong> DFD & Database
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">Z</div>
                    <div>
                      <strong>Zeldrick:</strong> Papers and Front-End
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">W</div>
                    <div>
                      <strong>Wilson:</strong> DFD & Back-End
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">R</div>
                    <div>
                      <strong>Raecell:</strong> Survey & Prototype
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
                <p className="mb-4">
                  This document outlines the participation and responsibilities of each team member in the development of our thesis project. Each member brings unique skills and expertise to ensure the successful completion of our research and implementation.
                </p>
                
                <h3 className="text-lg font-medium mb-3">Key Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Database Design and Implementation</li>
                  <li>Front-End Development and User Interface</li>
                  <li>Back-End Development and System Architecture</li>
                  <li>Survey Design and Prototype Development</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-3">Timeline and Milestones</h3>
                <p>
                  The project is divided into several phases, with each team member contributing to different aspects of the development process. Regular meetings and progress reviews ensure that we stay on track and meet our deadlines.
                </p>
              </div>
              
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                <p>
                  Our technical approach involves modern web development technologies, database management systems, and user-centered design principles. The implementation focuses on scalability, performance, and user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDocumentPage;
