import React from "react";

const Logout = ({ onClose }) => {
  return (
    <>
      {/* Backdrop - Lower z-index */}
      <div 
        className="fixed inset-0 z-[9999998] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
      </div>
      
      {/* Modal - Higher z-index */}
      <div className="fixed inset-0 z-[9999999] flex items-center justify-center px-4">
        <div className="bg-neutral-800 p-6 sm:p-8 rounded-2xl shadow-xl text-center w-full max-w-[350px]">
          <h1 className="text-lg sm:text-xl font-semibold mb-6 text-white">
            Are you sure you want to Logout?
          </h1>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-transparent border border-gray-500 rounded-full text-white font-semibold hover:bg-neutral-700/40"
            >
              No
            </button>

            <button className="flex-1 px-6 py-2 bg-red-600 rounded-full text-white font-semibold hover:bg-red-700">
              Yes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Logout;
