import React, { useEffect, useState, useRef, useCallback } from "react";

const EditorContent = ({
  isClient,
  windowWidth,
  selectedPaperSize,
  selectedMargin,
  selectedFont,
  paperSizes,
  marginOptions,
  handleContentChange,
  showCustomSizeDialog,
  showCustomMarginDialog,
  customPaperSize,
  setCustomPaperSize,
  customMargins,
  setCustomMargins,
  applyCustomPaperSize,
  applyCustomMargins,
  setShowCustomSizeDialog,
  setShowCustomMarginDialog,
}) => {
  const [pages, setPages] = useState([{ id: 1, content: "<p><br></p>" }]);
  const pageRefs = useRef([]);

  // Handle content change for a single page
  const handlePageInput = (index, e) => {
    const newContent = e.currentTarget.innerHTML;
    const updatedPages = [...pages];
    updatedPages[index].content = newContent;
    setPages(updatedPages);

    // Combine all content for parent
    const allContent = updatedPages.map(p => p.content).join("");
    handleContentChange(allContent);

    // Check if we need a new page
    const pageEl = pageRefs.current[index];
    if (pageEl) {
      const { scrollHeight, offsetHeight } = pageEl;
      // If user reaches near bottom of page, add new page
      if (scrollHeight > offsetHeight) {
        setPages(prev => [...prev, { id: prev.length + 1, content: "<p><br></p>" }]);
      }
    }
  };

  // Auto-focus new page
  useEffect(() => {
    const lastIndex = pages.length - 1;
    const lastPage = pageRefs.current[lastIndex];
    if (lastPage) {
      lastPage.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(lastPage, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [pages.length]);

  // Page style
  const getPageStyle = () => ({
    width: isClient && windowWidth < 768 ? "95vw" : paperSizes[selectedPaperSize].width,
    height: paperSizes[selectedPaperSize].height,
    maxWidth: "100%",
    overflowY: "auto",
    lineHeight: "1.6",
    margin: "0 auto 24px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    fontSize: "16px",
    fontFamily: selectedFont,
    padding: `${marginOptions[selectedMargin].top} ${marginOptions[selectedMargin].right} ${marginOptions[selectedMargin].bottom} ${marginOptions[selectedMargin].left}`,
    backgroundColor: "white",
    outline: "none",
    cursor: "text",
    color: "#000",
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Custom Paper Size Dialog */}
      {showCustomSizeDialog && (
        <CustomSizeDialog
          customPaperSize={customPaperSize}
          setCustomPaperSize={setCustomPaperSize}
          applyCustomPaperSize={applyCustomPaperSize}
          setShowCustomSizeDialog={setShowCustomSizeDialog}
        />
      )}

      {/* Custom Margin Dialog */}
      {showCustomMarginDialog && (
        <CustomMarginDialog
          customMargins={customMargins}
          setCustomMargins={setCustomMargins}
          applyCustomMargins={applyCustomMargins}
          setShowCustomMarginDialog={setShowCustomMarginDialog}
        />
      )}

      {/* Pages */}
      <div className="flex flex-col items-center">
        {pages.map((page, index) => (
          <div key={page.id} className="relative w-full max-w-4xl">
            {/* Page number */}
            <div className="absolute -top-6 left-0 right-0 text-center text-gray-400 text-sm">
              Page {index + 1}
            </div>

            <div
              ref={el => pageRefs.current[index] = el}
              contentEditable
              suppressContentEditableWarning
              className="rounded-md"
              style={getPageStyle()}
              onInput={e => handlePageInput(index, e)}
              spellCheck="true"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        ))}
      </div>

      {/* Page count indicator */}
      {pages.length > 1 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm text-gray-600">
          {pages.length} {pages.length === 1 ? "page" : "pages"}
        </div>
      )}
    </div>
  );
};

// Dialog Components (unchanged)
const CustomSizeDialog = ({
  customPaperSize,
  setCustomPaperSize,
  applyCustomPaperSize,
  setShowCustomSizeDialog,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-4 sm:p-6 w-96 sm:w-full max-w-[90vw]">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Custom Paper Size (cm)
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (cm)
          </label>
          <input
            type="number"
            value={customPaperSize.width}
            onChange={(e) =>
              setCustomPaperSize({ ...customPaperSize, width: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="1"
            max="100"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            value={customPaperSize.height}
            onChange={(e) =>
              setCustomPaperSize({ ...customPaperSize, height: e.target.value })
            }
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
);

const CustomMarginDialog = ({
  customMargins,
  setCustomMargins,
  applyCustomMargins,
  setShowCustomMarginDialog,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-4 sm:p-6 w-96 sm:w-full max-w-[90vw]">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Custom Margins (cm)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Top (cm)
          </label>
          <input
            type="number"
            value={customMargins.top}
            onChange={(e) =>
              setCustomMargins({ ...customMargins, top: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            max="10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Right (cm)
          </label>
          <input
            type="number"
            value={customMargins.right}
            onChange={(e) =>
              setCustomMargins({ ...customMargins, right: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            max="10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bottom (cm)
          </label>
          <input
            type="number"
            value={customMargins.bottom}
            onChange={(e) =>
              setCustomMargins({ ...customMargins, bottom: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            max="10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Left (cm)
          </label>
          <input
            type="number"
            value={customMargins.left}
            onChange={(e) =>
              setCustomMargins({ ...customMargins, left: e.target.value })
            }
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
);

export default EditorContent;
