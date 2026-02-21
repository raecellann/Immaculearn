import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

// Delete Button Component using consistent design
const DeleteButton = ({ onClick }) => {
  const buttonStyle = {
    cursor: "pointer",
    padding: "0.5em 1em",
    fontSize: "0.9em",
    width: "auto",
    height: "auto",
    color: "#ef4444", // Red for delete
    background: "transparent",
    borderRadius: "0.25em",
    border: "none",
    boxShadow: "none",
    transition: "all 0.3s ease-in-out",
    outline: "0.1em solid #cc1515ff",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5em",
  };

  const iconStyle = {
    fill: "#ef4444",
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
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 0 1em 0.45em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0 0.5em";
        e.target.style.color = "white";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "white";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "#212121";
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 0 1em 1em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0";
        e.target.style.color = "#ef4444";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "#ef4444";
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
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 0 1em 0.45em rgba(0, 0, 0, 0.1)";
        e.target.style.margin = "0 0.5em";
        e.target.style.color = "white";
        const svg = e.target.querySelector("svg");
        if (svg) svg.style.fill = "white";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "#212121";
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

  // console.log("DeleteConfirmationDialog received space:", space);

  // Calculate counts
  const filesCount = space.files?.length || 0;
  const tasksCount = space.tasks?.length || 0;
  const peopleCount = space.members?.length || 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg font-semibold text-white">
              Delete Space
            </DialogTitle>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-300 text-base">
            Are you sure you want to delete the following workspace?
          </p>

          {/* Warning Box */}
          <div className="flex gap-3 bg-red-900/20 border border-red-800/50 rounded-xl p-4">
            <div className="w-1 bg-red-500 rounded-full" />
            <div className="text-sm text-gray-300">
              <span className="font-semibold text-white">Warning:</span> This
              action <span className="font-semibold">cannot be undone</span>.
              Deleting a space will remove all its associated data. Any files,
              tasks, configurations, and more will be{" "}
              <span className="font-semibold">permanently lost</span>.
            </div>
          </div>

          {/* Workspace Card */}
          <div className="flex items-center justify-between border border-gray-700 rounded-xl p-4 bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div>
                <div className="font-medium text-white text-base">
                  {space.space_name}
                </div>
                <div className="text-sm text-gray-400">
                  {filesCount} Files, {tasksCount} tasks, {peopleCount} people
                </div>
              </div>
            </div>

            <button className="text-sm border border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition text-gray-300">
              Go to Home
            </button>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              To delete, type the workspace name{" "}
              <span className="font-semibold text-white">
                {space.space_name}
              </span>{" "}
              below
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Enter ${space.space_name}`}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-base text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-base text-gray-300 hover:bg-gray-800 transition border border-gray-600"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={!isValid}
              className={`px-4 py-2 rounded-lg text-base text-white transition ${
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
