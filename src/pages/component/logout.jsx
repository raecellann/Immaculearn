import React from "react";
import { createPortal } from "react-dom";

const Logout = ({ onClose, onLogOut }) => {
  console.log("Logout modal rendering"); // Debug log
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-60" style={{ zIndex: 999999 }}>
      <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl text-center w-[350px] animate-fadeIn relative" style={{ zIndex: 1000000 }}>
        <h1 className="text-xl font-semibold mb-6 text-white">
          Are you sure you want to Logout?
        </h1>

        <div className="flex justify-between gap-4">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 border border-gray-500 rounded-full text-white font-semibold shadow-md hover:bg-neutral-700 transition-colors"
          >
            No
          </button>

          {/* Confirm Logout Button */}
          <button 
            onClick={onLogOut}
            className="flex-1 px-6 py-2 bg-red-600 rounded-full text-white font-semibold shadow-md hover:bg-red-700 transition-colors"
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