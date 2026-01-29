import React from "react";
import { FiMenu, FiX } from "react-icons/fi";

const MobileHeader = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  return (
    <div className="lg:hidden bg-white px-4 py-3 border-b flex items-center justify-between">
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Document Editor</h1>
    </div>
  );
};

export default MobileHeader;