import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

// Archive Button Component using consistent design
const ArchiveButton = ({ onClick }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const buttonStyle = {
    cursor: "pointer",
    padding: "0.5em 1em",
    fontSize: "0.9em",
    width: "auto",
    height: "auto",
    color: isDarkMode ? "#f59e0b" : "#d97706", // Orange for archive
    background: "transparent",
    borderRadius: "0.25em",
    border: "none",
    boxShadow: "none",
    transition: "all 0.3s ease-in-out",
    outline: `0.1em solid ${isDarkMode ? "#cc1515ff" : "#b91c1c"}`,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5em",
  };

  const iconStyle = {
    fill: isDarkMode ? "#f59e0b" : "#d97706",
    width: "1em",
    height: "1em",
    marginRight: "0.5em",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={(e) => {
        const color = "rgba(245, 158, 11, 0.5)"; // Orange hover
        const bgColor = isDarkMode ? "#212121" : "#f3f4f6";
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, ${bgColor} 70%)`;
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 0 1em 0.45em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0 0.5em";
        e.target.style.color = "white";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "white";
      }}
      onMouseLeave={(e) => {
        const bgColor = isDarkMode ? "#212121" : "#f3f4f6";
        e.target.style.background = bgColor;
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 0 1em 1em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0";
        e.target.style.color = isDarkMode ? "#f59e0b" : "#d97706";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = isDarkMode ? "#f59e0b" : "#d97706";
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 4h4v3H5V4zm7 0h4v3h-4V4zm-7 6h4v6H5v-6zm7 0h4v6h-4v-6zM3 19h18v2H3v-2z" />
        </svg>
      </span>
      Archive
    </button>
  );
};

// Cancel Button Component using consistent design
const CancelButton = ({ onClick }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const buttonStyle = {
    cursor: "pointer",
    padding: "0.5em 1em",
    fontSize: "0.9em",
    width: "auto",
    height: "auto",
    color: "#f4f4f4ff", // Gray for cancel
    background: "transparent",
    borderRadius: "0.25em",
    border: "none",
    boxShadow: "none",
    transition: "all 0.3s ease-in-out",
    outline: "0.1em solid #ffffffff",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5em",
  };

  const iconStyle = {
    fill: "#ffffffff",
    width: "1em",
    height: "1em",
    marginRight: "0.5em",
    display: "inline-block",
    verticalAlign: "middle",
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={(e) => {
        const color = "rgba(239, 68, 68, 0.5)"; // Red hover
        const bgColor = isDarkMode ? "#212121" : "#f3f4f6";
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, ${bgColor} 70%)`;
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 0 1em 0.45em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0 0.5em";
        e.target.style.color = "white";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "white";
      }}
      onMouseLeave={(e) => {
        const bgColor = isDarkMode ? "#212121" : "#f3f4f6";
        e.target.style.background = bgColor;
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 0 1em 1em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0";
        e.target.style.color = "#f4f4f4ff";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "#ffffffff";
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </span>
      Cancel
    </button>
  );
};

// Archive Class Confirmation Dialog Component
const ArchiveClassAlert = ({ isOpen, onClose, onConfirm, space }) => {
  const [confirmationText, setConfirmationText] = useState("");
  const isValid = confirmationText === space.space_name;
  const isDarkMode = document.documentElement.classList.contains('dark');

  // console.log("ArchiveClassAlert received space:", space);

  // Calculate counts
  const filesCount = space.files?.length || 0;
  const tasksCount = space.tasks?.length || 0;
  const peopleCount = space.members?.length || 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-start sm:items-center justify-center p-4 sm:p-8 overflow-y-auto sm:overflow-hidden pt-8 sm:pt-auto">      
          <DialogPanel
            className={`w-full max-w-2xl rounded-2xl shadow-2xl px-6 py-5 space-y-4 ${
              isDarkMode
                ? "bg-gray-900"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="relative flex items-start justify-between">
              <DialogTitle
                className={`text-lg font-semibold text-left ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Archive Class
              </DialogTitle>

              <button
                onClick={onClose}
                className={`text-xl transition ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

          <p className={`text-sm sm:text-base ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Are you sure you want to archive the following class?
          </p>

          {/* Warning Box */}
        <div
          className={`flex gap-3 sm:gap-4 rounded-xl px-3 sm:px-4 lg:px-5 py-3 sm:py-4 ${
            isDarkMode
              ? "bg-blue-900/20 border border-blue-800"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex-shrink-0">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-blue-800" : "bg-blue-200"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <p
              className={`text-xs sm:text-sm font-semibold ${
                isDarkMode ? "text-blue-300" : "text-blue-800"
              }`}
            >
              Archiving this class will:
            </p>

            <ul
              className={`text-xs sm:text-sm mt-2 space-y-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <li>• Remove the class from your active classes list</li>
              <li>• Preserve all student data and assignments</li>
              <li>• Allow you to restore the class later if needed</li>
              <li>• Students will no longer be able to access this class</li>
            </ul>
          </div>
        </div>


          {/* Confirmation Input */}
          <div className="space-y-1">
            <p className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              To archive, type the class name{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                "{space.space_name}"
              </span>{" "}
              below:
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Enter "${space.space_name}"`}
              className={`w-full rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 placeholder-gray-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-500'
              } ${
                confirmationText && !isValid 
                  ? 'border-red-500 focus:ring-red-500' 
                  : ''
              }`}
            />
            
            {confirmationText && !isValid && (
              <p className="text-xs sm:text-sm text-red-500">
                Space Name do not match
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base transition border order-2 sm:order-1 ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800 border-gray-600' 
                  : 'text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
            >
              Cancel
            </button>

            <button
              onClick={() => isValid && onConfirm()}
              disabled={!isValid}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base text-white transition order-1 sm:order-2 ${
                isValid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-800 cursor-not-allowed"
              }`}
            >
              Yes, Archive Class
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ArchiveClassAlert;
