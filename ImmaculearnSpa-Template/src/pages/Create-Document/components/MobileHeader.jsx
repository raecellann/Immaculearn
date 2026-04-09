import React from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

const MobileHeader = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <div
      className="lg:hidden px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center"
      style={{
        backgroundColor: currentColors.background,
        borderColor: currentColors.border,
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 sm:p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{
            color: currentColors.textSecondary,
            focusRingColor: currentColors.accent,
          }}
          aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
        >
          {mobileSidebarOpen ? (
            <FiX size={22} className="sm:w-6 sm:h-6" />
          ) : (
            <FiMenu size={22} className="sm:w-6 sm:h-6" />
          )}
        </button>
        <h1
          className="text-base sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-xs"
          style={{ color: currentColors.text }}
        >
          Document Editor
        </h1>
      </div>
    </div>
  );
};

export default MobileHeader;