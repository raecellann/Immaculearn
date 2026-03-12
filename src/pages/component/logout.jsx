import React from "react";
import { createPortal } from "react-dom";

const Logout = ({ onClose, onLogOut }) => {
  console.log("Logout modal rendering"); // Debug log
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60 p-4" style={{ zIndex: 999999 }}>
      <div className="bg-neutral-800 p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl shadow-xl text-left w-[240px] sm:w-[260px] md:w-[300px] lg:w-[340px] animate-fadeIn relative" style={{ zIndex: 1000000 }}>
        <h1 className="text-base font-semibold mb-1 text-white sm:text-lg md:text-xl lg:text-2xl">
          Log Out?
        </h1>
        <p className="text-xs text-gray-400 mb-3 sm:text-sm md:text-base lg:text-lg">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-between gap-2">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 bg-red-600 rounded-full text-white text-xs font-medium hover:bg-red-700 transition-colors sm:text-sm md:text-base lg:text-lg"
          >
            No
          </button>

          {/* Confirm Logout Button */}
          <button 
            onClick={onLogOut}
            className="flex-1 px-3 py-1.5 border border-gray-500 rounded-full text-white text-xs font-medium hover:bg-neutral-700 transition-colors sm:text-sm md:text-base lg:text-lg"
          >
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Logout;