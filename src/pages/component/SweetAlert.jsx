import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

// Delete Button Component using consistent design
const DeleteButton = ({ onClick }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const buttonStyle = {
    cursor: "pointer",
    padding: "0.5em 1em",
    fontSize: "0.9em",
    width: "auto",
    height: "auto",
    color: isDarkMode ? "#ef4444" : "#dc2626", // Red for delete (lighter in light mode)
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
    fill: isDarkMode ? "#ef4444" : "#dc2626",
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
        e.target.style.color = isDarkMode ? "#ef4444" : "#dc2626";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = isDarkMode ? "#ef4444" : "#dc2626";
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </span>
      Delete
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
        const color = "rgba(107, 114, 128, 0.5)"; // Gray hover
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
        e.target.style.color = "#6b7280";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "#6b7280";
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </span>
      Cancel
    </button>
  );
};

// Delete confirmation dialog component
export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  space = {
    space_name: "Unknown Space",
    members: [],
    files: [],
    tasks: [],
  },
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const isValid = confirmationText === space.space_name;
  const isDarkMode = document.documentElement.classList.contains('dark');

  // console.log("DeleteConfirmationDialog received space:", space);

  // Calculate counts
  const filesCount = space.files?.length || 0;
  const tasksCount = space.tasks?.length || 0;
  const peopleCount = space.members?.length || 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto sm:overflow-hidden pt-8 sm:pt-auto">
        <DialogPanel className={`w-full max-w-lg sm:max-w-2xl rounded-2xl shadow-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 space-y-4 sm:space-y-6 my-4 sm:my-8 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <DialogTitle className={`text-base sm:text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Space
            </DialogTitle>

            <button
              onClick={onClose}
              className={`transition text-lg sm:text-xl ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✕
            </button>
          </div>

          <p className={`text-sm sm:text-base ${
  isDarkMode ? 'text-gray-300' : 'text-gray-600'
}`}>
            Are you sure you want to delete the following workspace?
          </p>

          {/* Warning Box */}
          <div className={`flex gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 ${
            isDarkMode 
              ? 'bg-red-900/20 border border-red-800/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="w-1 bg-red-500 rounded-full" />
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Warning:</span> This
              action <span className="font-semibold">cannot be undone</span>.
              Deleting a space will remove all its associated data. Any files,
              tasks, configurations, and more will be{" "}
              <span className="font-semibold">permanently lost</span>.
            </div>
          </div>

          {/* Workspace Card */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl p-3 sm:p-4 ${
            isDarkMode 
              ? 'border border-gray-700 bg-gray-800' 
              : 'border border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                ✓
              </div>
              <div>
                <div className={`font-medium text-sm sm:text-base ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {space.space_name}
                </div>
                <div className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filesCount} Files, {tasksCount} tasks, {peopleCount} people
                </div>
              </div>
            </div>

            <button className={`text-xs sm:text-sm border px-2 sm:px-3 py-1.5 rounded-lg hover transition mt-3 sm:mt-0 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}>
              Go to Home
            </button>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <p className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              To delete, type the workspace name{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {space.space_name}
              </span>{" "}
              below
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Enter ${space.space_name}`}
              className={`w-full rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 placeholder-gray-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-600 text-white focus:ring-red-500' 
                  : 'bg-white border border-gray-300 text-gray-900 focus:ring-red-500'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4">
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
              onClick={onConfirm}
              disabled={!isValid}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base text-white transition order-1 sm:order-2 ${
                isValid
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-800 cursor-not-allowed"
              }`}
            >
              Yes, Delete Space
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// Success notification dialog
export function SuccessDialog({
  isOpen,
  onClose,
  title = "Deleted!",
  message = "Your file has been deleted.",
}) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-green-500/20"
          >
            <DialogTitle
              as="h3"
              className="text-base/7 font-medium text-green-400 flex items-center justify-between"
            >
              {title}
              <button
                onClick={onClose}
                className="text-green-400/70 hover:text-green-400 transition-colors p-1 rounded-md hover:bg-green-400/10"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50 text-center">
              {message}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-green-600/20 focus:outline-none hover:bg-green-700 transition-colors"
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

// Cancel notification dialog
export function CancelledDialog({
  isOpen,
  onClose,
  title = "Cancelled",
  message = "Your imaginary file is safe :)",
}) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-gray-500/20"
          >
            <DialogTitle
              as="h3"
              className="text-base/7 font-medium text-gray-400 flex items-center justify-between"
            >
              {title}
              <button
                onClick={onClose}
                className="text-gray-400/70 hover:text-gray-400 transition-colors p-1 rounded-md hover:bg-gray-400/10"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50 text-center">
              {message}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 transition-colors"
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
