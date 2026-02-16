import React from "react";
import { FiArrowLeft, FiSave, FiCheck, FiDownload, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

const EditorHeader = ({
  navigate,
  saveStatus,
  lastSaved,
  title,
  setTitle,
  isDownloadDropdownOpen,
  setIsDownloadDropdownOpen,
  downloadDocument,
  connectedUsers = [],
  isOnline = false,
}) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Build active editors directly from Yjs connected users
  const activeEditors = connectedUsers.map((user, index) => ({
    id: user.id || index,
    name: user.name || `User ${index + 1}`,
    image: user.avatar
  }));


  return (
    <div className="hidden lg:block px-8 py-5 border-b" style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}>
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-colors"
          style={{ color: currentColors.textSecondary }}
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          <span>Back</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: currentColors.surface,
              color: currentColors.text,
              border: `1px solid ${currentColors.border}`
            }}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Save status */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === "saving" && (
              <>
                <FiSave className="text-blue-500 animate-spin" />
                <span style={{ color: currentColors.textSecondary }}>Saving...</span>
              </>
            )}

            {saveStatus === "saved" && (
              <>
                <FiCheck className="text-green-500" />
                <span style={{ color: currentColors.textSecondary }}>
                  {lastSaved ? `Saved at ${new Date(lastSaved).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}` : "Saved"}
                </span>
              </>
            )}

            {saveStatus === "unsaved" && (
              <>
                <FiSave className="text-gray-400" />
                <span style={{ color: currentColors.textSecondary }}>Unsaved changes</span>
              </>
            )}

            {/* Connection indicator */}
            {connectedUsers.length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            )}
          </div>

          {/* Download */}
          <div className="relative">
            <button
              className="px-6 py-2 rounded-full font-medium"
              style={{ 
                backgroundColor: currentColors.accent,
                color: 'white'
              }}
              onClick={() =>
                setIsDownloadDropdownOpen(!isDownloadDropdownOpen)
              }
            >
              Download
            </button>

            {isDownloadDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 border rounded-lg shadow-lg z-10 w-40" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:opacity-80"
                  style={{ color: currentColors.text }}
                  onClick={() => downloadDocument("html")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">Word (.docx)</span>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:opacity-80"
                  style={{ color: currentColors.text }}
                  onClick={() => downloadDocument("pdf")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">PDF</span>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:opacity-80"
                  style={{ color: currentColors.text }}
                  onClick={() => downloadDocument("txt")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">Text (.txt)</span>
                </div>
              </div>
            )}
          </div>

          <button className="px-6 py-2 rounded-full font-medium" style={{ backgroundColor: currentColors.surface, color: currentColors.text }}>
            Cancel
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
        <label className="text-sm font-medium" style={{ color: currentColors.textSecondary }}>
          Document Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full sm:max-w-3xl px-3 sm:px-5 py-3 border-2 rounded-xl text-base sm:text-lg font-semibold focus:outline-none"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text,
            placeholderColor: currentColors.textSecondary
          }}
          placeholder="Enter document title..."
        />
      </div>

      {/* Active Editors */}
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: currentColors.textSecondary }}>Active editors:</span>

        <div className="flex items-center -space-x-2">
          {activeEditors.map((editor) => (
            <div key={editor.id} className="relative" title={editor.name}>
              <img
                src={editor.image}
                alt={editor.name}
                className="w-7 h-7 rounded-full border-2 border-white"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
            </div>
          ))}
        </div>

        <span className="text-sm" style={{ color: currentColors.textSecondary }}>
          {activeEditors.length} people editing
        </span>
      </div>
    </div>
  );
};

export default EditorHeader;
