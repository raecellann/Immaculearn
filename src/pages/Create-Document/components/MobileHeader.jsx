import React from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

const MobileHeader = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const { isDarkMode, colors } = useTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <div className="lg:hidden px-4 py-3 border-b flex items-center justify-between" style={{ 
      backgroundColor: currentColors.background, 
      borderColor: currentColors.border 
    }}>
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="p-2 rounded transition-colors"
        style={{ color: currentColors.textSecondary }}
      >
        {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <h1 className="text-lg font-semibold" style={{ color: currentColors.text }}>Document Editor</h1>
    </div>
  );
};

export default MobileHeader;