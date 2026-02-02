import React from "react";
import { FiArrowLeft, FiSave, FiCheck, FiDownload } from "react-icons/fi";

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
  // Build active editors directly from Yjs connected users
  const activeEditors = connectedUsers.map((user, index) => ({
    id: user.id || index,
    name: user.name || `User ${index + 1}`,
    image: user.avatar
  }));


  return (
    <div className="hidden lg:block bg-white px-8 py-5 border-b">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          <span>Back</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === "saving" && (
              <>
                <FiSave className="text-blue-500 animate-spin" />
                <span className="text-gray-600">Saving...</span>
              </>
            )}

            {saveStatus === "saved" && (
              <>
                <FiCheck className="text-green-500" />
                <span className="text-gray-600">
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
                <span className="text-gray-500">Unsaved changes</span>
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
                <span className="text-xs text-gray-500">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            )}
          </div>

          {/* Download */}
          <div className="relative">
            <button
              className="px-6 py-2 rounded-full bg-[#3B82F6] text-white font-medium"
              onClick={() =>
                setIsDownloadDropdownOpen(!isDownloadDropdownOpen)
              }
            >
              Download
            </button>

            {isDownloadDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-40">
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => downloadDocument("html")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">Word (.docx)</span>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => downloadDocument("pdf")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">PDF</span>
                </div>

                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => downloadDocument("txt")}
                >
                  <FiDownload size={16} />
                  <span className="text-sm">Text (.txt)</span>
                </div>
              </div>
            )}
          </div>

          <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-600 font-medium">
            Cancel
          </button>
        </div>
      </div>

      {/* Title */}
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

      {/* Active Editors */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Active editors:</span>

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

        <span className="text-sm text-gray-500">
          {activeEditors.length} people editing
        </span>
      </div>
    </div>
  );
};

export default EditorHeader;
