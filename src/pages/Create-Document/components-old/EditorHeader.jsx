import {
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiDownload,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { useTheme } from "../contexts-old/ThemeContext";

const EditorHeader = ({
  saveStatus,
  lastSaved,
  title,
  connectedUsers = [],
  isOnline = false,
  collaborationEnabled = false,
  onDownload,
}) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Build active editors directly from Yjs connected users
  const activeEditors = connectedUsers.map((user, index) => ({
    id: user.id || index,
    name: user.name || `User ${index + 1}`,
    image: user.avatar,
  }));

  return (
    <div
      className="px-4 xl:px-8 py-3 xl:py-5 border-b relative"
      style={{
        backgroundColor: currentColors.background,
        borderColor: currentColors.border,
        zIndex: 30,
      }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-3 xl:mb-4 gap-2 flex-wrap">
        {/* Back button */}
        <div
          className="flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 transition-colors shrink-0"
          style={{ color: currentColors.textSecondary }}
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft size={14} />
          <span>Back</span>
        </div>

        <div className="flex items-center gap-2 xl:gap-3 flex-wrap justify-end">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 xl:p-2 rounded-full transition-colors shrink-0"
            style={{
              backgroundColor: currentColors.surface,
              color: currentColors.text,
              border: `1px solid ${currentColors.border}`,
            }}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {/* Save status */}
          <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm">
            {saveStatus === "saving" && (
              <>
                <FiSave className="text-blue-500 animate-spin" size={14} />
                <span style={{ color: currentColors.textSecondary }}>
                  Saving...
                </span>
              </>
            )}

            {saveStatus === "saved" && (
              <>
                <FiCheck className="text-green-500" size={14} />
                <span style={{ color: currentColors.textSecondary }}>
                  {lastSaved
                    ? `Saved at ${new Date(lastSaved).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Saved"}
                </span>
              </>
            )}

            {saveStatus === "unsaved" && (
              <>
                <FiSave className="text-gray-400" size={14} />
                <span style={{ color: currentColors.textSecondary }}>
                  Unsaved changes
                </span>
              </>
            )}

            {/* Connection indicator */}
            <div className="flex items-center gap-1 ml-1 xl:ml-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <button
            onClick={onDownload}
            className="px-4 xl:px-6 py-1.5 xl:py-2 rounded-full font-medium text-sm xl:text-base shrink-0"
            style={{ backgroundColor: "#2c81e1", color: "white" }}
          >
            Download
          </button>

          
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 xl:gap-4 mb-3 xl:mb-4">
        <label
          className="text-xs xl:text-sm font-medium whitespace-nowrap shrink-0"
          style={{ color: currentColors.textSecondary }}
        >
          Document Title
        </label>
        <p
          className="text-base xl:text-lg font-semibold"
          style={{ color: currentColors.text }}
        >
          {title || "Untitled Document"}
        </p>
      </div>

      {/* Active Editors */}
      <div className="flex items-center gap-2 xl:gap-3 flex-wrap">
        <span
          className="text-xs xl:text-sm"
          style={{ color: currentColors.textSecondary }}
        >
          Active editors:
        </span>

        <div className="flex items-center -space-x-2">
          {activeEditors.map((editor) => (
            <div key={editor.id} className="relative" title={editor.name}>
              <img
                src={editor.image}
                alt={editor.name}
                className="w-6 h-6 xl:w-7 xl:h-7 rounded-full border-2 border-white"
              />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 xl:w-2 xl:h-2 bg-green-500 rounded-full border border-white" />
            </div>
          ))}
        </div>

        <span
          className="text-xs xl:text-sm"
          style={{ color: currentColors.textSecondary }}
        >
          {activeEditors.length}{" "}
          {activeEditors.length === 1 ? "person" : "people"} editing
        </span>
      </div>
    </div>
  );
};

export default EditorHeader;
