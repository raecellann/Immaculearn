import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router"; // Add useParams
import ProfSidebar from "../component/profsidebar";
import { FiCopy, FiFileText, FiMenu, FiX, FiUpload } from "react-icons/fi";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import Button from "../component/button_2";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { useFileManager } from "../../hooks/useFileManager.js";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { toast } from "react-toastify";

const UserFilesShared = () => {

  const [showPendingInvitations, setShowPendingInvitations] = useState(false)
  const [showInvitePopup, setShowInvitePopup] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [copyFeedback, setCopyFeedback] = useState("")
  const [joinRequestsData, setJoinRequestsData] = useState([])
  const [spaceLoading, setSpaceLoading] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const lastScrollY = useRef(0);

  // File upload states
  const [showCreateUploadModal, setShowCreateUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams(); // Get params from URL

  const { user, isLoading } = useUser();
  const { userSpaces, friendSpaces, deleteSpace, acceptJoinRequest, declineJoinRequest } = useSpace();

  /* ================= SPACE & OWNER LOGIC ================= */
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid
  );

  
  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;

  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  const isFriendSpace = !isOwnerSpace;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = {
        id: Date.now(),
        name: e.dataTransfer.files[0].name,
        size: e.dataTransfer.files[0].size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = {
        id: Date.now(),
        name: e.target.files[0].name,
        size: e.target.files[0].size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };


  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowFileOptions(true);
  };

  const handleOpenFile = (file) => {
    const url = `/space/${space_uuid}/${space_name}/files/${file.fuuid}/${file.filename}`;
    navigate(url);
    setShowFileOptions(false);
  };

  const handleDeleteFile = (file) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`);
    if (confirmDelete) {
      // Add delete logic here
      alert(`File "${file.filename}" deleted successfully!`);
      setShowFileOptions(false);
    }
  };

  const handleCreateFile = () => {
    if (!fileName.trim()) {
      toast.error("File title is required");
      return;
    }

    create.mutate(
      {
        title: fileName,
        space_id: currentSpace?.space_id ?? null,
        owner_id: user?.id ?? null, 
        content: "",
      },
      {
        onSuccess: (newFile) => {
          toast.success(`File "${fileName}" created successfully!`, {
            duration: 3000,
            position: 'top-center',
          });

          const url = `/space/${space_uuid}/${space_name}/files/${newFile.fuuid}/${newFile.title}`;
          navigate(url);

          setFileName("");
          setIsCreatingFile(false);
          setShowCreateUploadModal(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(err?.message || "Failed to create file");
        },
      }
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { list , create} = useFileManager(currentSpace?.space_id || null);

  const files = list?.data || [];



  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!currentSpace) return;
    
    // Show delete confirmation dialog
    setDialogMessage(currentSpace.space_name);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    // Prevent multiple executions
    if (!currentSpace || !showDeleteDialog) return;
    
    setShowDeleteDialog(false);
    
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      
      // Navigate immediately after successful deletion
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Handle join requests
  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to accept join request:", error);
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to decline join request:", error);
    }
  };

  // Send invite
  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  // Copy link
  const handleCopyLink = (space_link) => {
    navigator.clipboard.writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457]
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">({(currentSpace?.members?.length) || 0} member(s))</span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div onClick={() => setShowPendingInvitations(true)} className="relative">
                    <Button text="Pending Invites" />
                    {joinRequestsData.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {joinRequestsData.length}
                      </span>
                    )}
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
              )}
              {isFriendSpace && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md">
                    <span className="text-xs text-blue-400 break-all">
                      {currentSpace?.space_link || 'Loading...'}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}>
                 
                  Stream
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/tasks`)
                  }
                >
                
                  Tasks
                </button>
                <button className="font-semibold border-b-2 border-white pb-2">
                  
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/people`)
                  }
                >
                  People
                </button>
              </div>
            </div>
          </div>
          
          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <Button onClick={handleInviteMember} text="Add Member" />
              <Button onClick={() => setShowPendingInvitations(true)} text="Pending Invites" className="relative">
                {joinRequestsData.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {joinRequestsData.length}
                  </span>
                )}
              </Button>
              <Button onClick={handleDeleteRoom} text="Delete Room" />
            </div>
          )}


          {/* Action Ribbon */}
          {activeFile && (
            <div className="sticky top-0 z-20 mb-6 bg-[#1E222A] border border-gray-700 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FiFileText />
              <span key={activeFile.file_id} className="font-semibold truncate max-w-[220px]">
                {activeFile.filename}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `/space/${space_uuid}/${space_name}/files/${activeFile.file_uuid}/${activeFile.filename}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Open
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
              >
                Share
              </button>

              <button className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">
                Upload Version
              </button>

              <button
                onClick={() => setActiveFile(null)}
                className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
          )}


          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* BUTTON */}
            {isOwnerSpace && (
              <div className="flex justify-end mb-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  onClick={() => setShowCreateUploadModal(true)}
                >
                  <FiFileText size={16} />
                  Create or Upload File
                </button>
              </div>
            )}

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-[#0F1115] rounded-xl p-6">
              <div className="grid grid-cols-4 text-sm text-gray-400 pb-3 border-b border-gray-700">
                <div className="col-span-2">File Name</div>
                <div>Date Posted</div>
                <div>Posted By</div>
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  className="grid grid-cols-4 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4"
                >
                  <div className="flex items-center gap-3 col-span-2 cursor-pointer">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <span>{file.filename}</span>
                  </div>
                  
                  <div>
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                  <div>{file.owner_id === user.id ? "You" : currentSpace.members.find(
                      member => member.account_id === file.owner_id
                    )?.full_name}
                  </div>

                </div>
              ))}
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="md:hidden space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <p className="font-semibold">{file.filename}</p>
                  </div>

                  <p className="text-sm text-gray-400">
                    Date: <span className="text-white">{new Date(file.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Posted by: <span className="text-white">{file.owner_id === user.id ? "You" : currentSpace.members.find(
                      member => member.account_id === file.owner_id
                    )?.full_name}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE/UPLOAD POPUP MODAL */}
      {showCreateUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowCreateUploadModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <FiX size={24} />
            </button>

            {/* CONTENT */}
            <div className="p-8 pt-12">
              {/* TITLE */}
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create file or Upload files here.
              </h2>

              {/* UPLOAD SECTION */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition relative ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />

                <FiUpload size={40} className="mx-auto mb-3 text-gray-400" />

                <p className="text-gray-900 font-medium text-sm">
                  Choose a file or drag & drop it here.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  DOCS, PDF, PPT AND EXCEL, UP TO 50 MB
                </p>
              </div>

              {/* BROWSE BUTTON */}
              <button
                onClick={() => document.getElementById("file-upload").click()}
                className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition mb-4 bg-white"
              >
                Browse Files
              </button>

              {/* DIVIDER */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">Or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* CREATE FILE BUTTON */}
              <button


                // Kapag clinick ito lalabas yung set filename sa ibaba
                onClick={() => setIsCreatingFile(true)}
                className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center space-x-2 bg-white mb-6"
              >
                <FiFileText size={20} />
                <span>Create File</span>
              </button>

              {/* UPLOADED FILES LIST */}
              {uploadedFiles.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* FILE HEADER */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="text-2xl">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {file.name.toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(file.size / 1024).toFixed(0)}KB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FILE OPTIONS MODAL */}
      {showFileOptions && selectedFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">File Options</h2>
                <button
                  onClick={() => setShowFileOptions(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white mb-4">
                What would you like to do with "<span className="font-semibold">{selectedFile.filename}</span>"?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={() => setShowFileOptions(false)}
                >
                  Cancel
                </button>
                {selectedFile?.owner_id === user?.id && (
                <button 
                  onClick={() => handleDeleteFile(selectedFile)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
                <button 
                  onClick={() => handleOpenFile(selectedFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILE TITLE MODAL */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">File Title</h2>
                <button
                  onClick={() => {
                    setFileName("");
                    setIsCreatingFile(false);
                  }}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="font-semibold text-white mb-3 block">
                File Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-[#23272F] text-white rounded-lg px-4 py-2 mb-6 outline-none border border-[#23272F] focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter file title"
                autoFocus
              />

              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={() => {
                    setFileName("");
                    setIsCreatingFile(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Invitations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No pending invitations</p>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div key={invitation.account_id} className="bg-[#2A2F3A] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={invitation.profile_pic}
                        alt={invitation.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.fullname}</h3>
                        <p className="text-sm text-gray-400">{invitation.email}</p>
                        <p className="text-sm mt-1">{invitation.message || "Hello world"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{invitation.added_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        disabled={spaceLoading}
                        onClick={() => handleDeclineJoinRequest(invitation.account_id)}
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition"
                      >
                        Decline
                      </button>
                      <button
                        disabled={spaceLoading}
                        onClick={() => handleAcceptJoinRequest(invitation.account_id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* INVITE POPUP */}
      {showInvitePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#E6E6E6] rounded-2xl w-[420px] max-w-[90vw] p-6 shadow-xl">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Add Member</h2>
              <button
                onClick={() => setShowInvitePopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* INVITATION LINK */}
            <div className="mb-4">
              <p className="text-sm font-medium text-black mb-1">
                Invitation Link
              </p>
              <div className="flex items-center justify-between bg-white px-3 py-1 rounded-md border border-gray-300">
                <span className="text-xs text-gray-600 truncate flex-1">
                  {currentSpace?.space_link}
                </span>
                <button 
                  onClick={() => handleCopyLink(currentSpace?.space_link)} 
                  className={`text-sm ml-2 px-2 py-1 rounded transition-colors ${
                    copyFeedback 
                      ? copyFeedback === "Copied!" 
                        ? "text-green-600 bg-green-50" 
                        : "text-red-600 bg-red-50"
                      : "text-gray-500 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  {copyFeedback || "Copy Link"}
                </button>
              </div>
            </div>

            {/* INPUT */}
            <div className="mb-4">
              <p className="text-sm font-medium text-black mb-1">
                Type username or email
              </p>
              <input
                type="text"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-md
                  border
                  border-purple-500
                  bg-white
                  text-black
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                "
              />
            </div>

            {/* SUGGESTED USERS */}
            <div>
              <p className="text-sm font-medium text-black mb-2">
                Suggested Users
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: "Raecell Ann Galvez",
                    email: "raecellanngalvez@gmail.com",
                    avatar: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
                  },
                  {
                    name: "Nathaniel Faborada",
                    email: "faboradanathaniel@gmail.com",
                    avatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
                  },
                  {
                    name: "Wilson Esmabe",
                    email: "wilsonesmabe2003@gmail.com",
                    avatar: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/wilson_fw2qoz.jpg",
                  },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-transparent hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-black">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}





      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={dialogMessage}
      />
    </div>
  );
};

export default UserFilesShared;