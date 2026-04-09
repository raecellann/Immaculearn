import React, { useState } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import { FiFileText, FiX, FiAlertTriangle } from "react-icons/fi";
import { DeleteConfirmationDialog } from "../../component/SweetAlert";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminFilesSharedPage = () => {
  const navigate = useNavigate(); // ✅ REQUIRED
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // State variables
  const [showPendingInvites, setShowPendingInvites] = useState(false);
  const [showDeleteRoom, setShowDeleteRoom] = useState(false);
  
  // Mock space data (in real app, this would come from props or context)
  const currentSpace = {
    space_name: "Zeldrick's Space",
    files: 3,
    members: 2
  };
  
  // Handler functions
  const handlePendingInvites = () => {
    setShowPendingInvites(true);
  };
  
  const handleDeleteRoom = () => {
    setShowDeleteRoom(true);
  };
  
  const confirmDeleteRoom = () => {
    toast.success(`Room "${currentSpace?.space_name}" has been deleted.`);
    setShowDeleteRoom(false);
    navigate('/spaces');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* COVER / HEADER */}
        <div className="relative mb-6">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            alt="Space Cover"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl"
          />

          <div className="absolute top-0 z-10">
            <div className="bg-black px-10 py-3 rounded-b-[1rem] text-2xl font-extrabold">
              Zeldrick's Space
            </div>
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              onClick={handlePendingInvites}
            >
              Pending Invites
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              onClick={handleDeleteRoom}
            >
              Delete Room
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-[120px] border-b border-gray-700 pb-4 mb-6">
          <button
            className="text-gray-400 text-xl hover:text-white transition"
            onClick={() => navigate("/user-space-zj")}
          >
            Stream
          </button>

          <button
            className="text-gray-400 text-xl hover:text-white transition"
            onClick={() => navigate("/admintaskpage")}
          >
            Tasks
          </button>

          <button className="text-white text-xl font-semibold border-b-2 border-white pb-2">
            Files
          </button>

          <button
            className="text-gray-400 text-xl hover:text-white transition"
            onClick={() => navigate("/user-space-zj/people")}
          >
            People
          </button>
        </div>

        {/* FILES TABLE */}
        <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: isDarkMode ? "#0F1115" : currentColors.surface }}>
          {/* BUTTONS */}
          <div className="flex gap-4 mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => navigate("/create-file-admin")}
            >
              Create File
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={() => navigate("/upload-file-admin")}
            >
              Upload File
            </button>
          </div>

          <div className="grid grid-cols-4 text-sm text-gray-400 pb-3 border-b border-gray-700">
            <div>File Name</div>
            <div>Date Posted</div>
            <div>Posted By</div>
            <div>Folder Saved</div>
          </div>

          {[
            {
              name: "Calculus: Lecture 3",
              date: "October 8, 2025",
              by: "Admin",
              folder: "Math",
            },
            {
              name: "Biology: Lecture 1",
              date: "October 8, 2025",
              by: "Admin",
              folder: "Science",
            },
            {
              name: "Fallacies: Lecture 4",
              date: "October 8, 2025",
              by: "Admin",
              folder: "Law",
            },
          ].map((file, index) => (
            <div
              key={index}
              className="grid grid-cols-4 items-center rounded-lg px-4 py-3 mt-4" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.surface }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md" style={{ backgroundColor: isDarkMode ? "#23272F" : currentColors.surface }}>
                  <FiFileText />
                </div>
                <span>{file.name}</span>
              </div>
              <div>{file.date}</div>
              <div>{file.by}</div>
              <div>{file.folder}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* PENDING INVITES MODAL */}
      {showPendingInvites && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-xl shadow-2xl max-w-md w-full border" style={{ backgroundColor: isDarkMode ? "#1E222A" : currentColors.surface, borderColor: isDarkMode ? "#374151" : currentColors.border }}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Pending Invites</h3>
              <button
                onClick={() => setShowPendingInvites(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">No pending invitations at the moment.</p>
              <div className="text-sm text-gray-500">
                Invited members will appear here once they haven't accepted your invitation yet.
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-700">
              <button
                onClick={() => setShowPendingInvites(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* DELETE ROOM MODAL */}
      <DeleteConfirmationDialog
        isOpen={showDeleteRoom}
        onClose={() => setShowDeleteRoom(false)}
        onConfirm={confirmDeleteRoom}
        space={{
          space_name: currentSpace?.space_name || "Unknown Space",
          members: [{}, {}], // Mock members array
          files: [{}, {}, {}], // Mock files array
          tasks: [] // Mock tasks array
        }}
      />
    </div>
  );
};

export default AdminFilesSharedPage;
