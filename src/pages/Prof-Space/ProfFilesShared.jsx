import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import AddMember from "../component/AddMember";
import { FiFileText, FiMenu, FiX, FiUpload, FiCopy } from "react-icons/fi";
import Logout from "../component/logout";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { useFileManager } from "../../hooks/useFileManager.js";
import Button from "../component/button_2";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfFilesShared = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();

  // Custom hooks

  const { user, isLoading: userLoading } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    useJoinRequests,
    isLoading: spaceLoading,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace
  } = useSpace();



  // Join requests
  const { data: joinRequestsData = [], isLoading: joinRequestsLoading } = useJoinRequests(space_uuid || "");
  // UUID validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Find current space
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find(space => space.space_uuid === space_uuid);

  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;
  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const { list, create } = useFileManager(currentSpace?.space_id || null);
  const files = list?.data || [];

  /* ================= HEADER + SIDEBAR ================= */

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const lastScrollY = useRef(0);

  // File upload states

  const [showCreateUploadModal, setShowCreateUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      if (uploadedFiles.length >= 5) {
        alert('Maximum 5 files allowed');
        return;
      }
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
      if (uploadedFiles.length >= 5) {
        alert('Maximum 5 files allowed');
        return;
      }
      const newFile = {
        id: Date.now(),
        name: e.target.files[0].name,
        size: e.target.files[0].size,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const handleUploadFile = (file) => {
    // Here you would implement the actual file upload logic
    // For now, we'll just show an alert
    alert(`Uploading file: ${file.name}`);
    // You can add the actual upload functionality here
    // For example, using the create.mutate function or an upload API
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
  if (userLoading || spaceLoading) {
    return <div className="flex h-screen justify-center items-center">Loading...</div>;
  }
  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return <div className="flex h-screen justify-center items-center" style={{ color: currentColors.text }}>Space not found</div>;
  }

  // Invite member
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    console.log("handleDeleteRoom called, currentSpace:", currentSpace);
    if (!currentSpace) return;
    setShowDeleteDialog(true);
  };

  const confirmDeleteRoom = async () => {
    if (!currentSpace) return;
    setShowDeleteDialog(false);
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
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

  const handleOpenFile = (file) => {
    const url = `/prof/space/${space_uuid}/${space_name}/files/${file.fuuid}/${file.filename}`;
    navigate(url);
  };

  const handleCreateFile = () => {
    if (!fileName.trim()) {
      alert("File title is required");
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
          alert(`File "${fileName}" created successfully!`);
          const url = `/prof/space/${space_uuid}/${space_name}/files/${newFile.fuuid}/${newFile.title}`;
          navigate(url);
          setFileName("");
          setIsCreatingFile(false);
        },
        onError: (err) => {
          console.error(err);
          alert(err?.message || "Failed to create file");
        },
      }
    );
  };

    const formatFileTitle = (filename) => {
  if (!filename) return "";

  const decodedFileName = decodeURIComponent(filename);
  const nameWithoutExtension = decodedFileName.split(".")[0];
  const cleanTitle = nameWithoutExtension.split("_")[0];

  return cleanTitle;
};


  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        {/* <ProfSidebar onLogoutClick={() => setShowLogout(true)} /> */}
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>


      {/* ================= MAIN ================= */}

      <div className="flex-1 flex flex-col w-full" style={{ backgroundColor: currentColors.surface }}>
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
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
              <span className="text-xs" style={{ color: currentColors.textSecondary }}>({currentSpace?.space_type === "course" ? (currentSpace?.members?.length - 1) + " student(s)": (currentSpace?.members?.length) + " member(s)" || 0})</span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div onClick={() => setShowPendingInvitations(true)}>
                    <Button text="Pending Invites" />
                  </div>

                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
              )}
              {isFriendSpace && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: currentColors.surface }}>
                    <span className="text-xs break-all" style={{ color: currentColors.accent }}>
                      {currentSpace?.space_link || 'Loading...'}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="p-1 rounded transition-colors"
                      style={{
                        color: currentColors.textSecondary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.color = currentColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = currentColors.textSecondary;
                      }}
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
          <div className="w-full overflow-x-auto no-scrollbar border-b pb-4 mb-6" style={{ borderColor: currentColors.border }}>
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12"> 
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}`)} 
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  Stream
                </button>
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}/tasks`)}
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  Tasks
                </button>
                <button className="font-semibold border-b-2 pb-2" style={{ borderColor: currentColors.text }}>
                  Files
                </button>
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}/people`)}
                  className="transition"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.target.style.color = currentColors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = currentColors.textSecondary;
                  }}
                >
                  People
                </button>
              </div>
            </div>
          </div>


          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <div onClick={handleInviteMember}>
                <Button text="Add Member" />
              </div>

              <div onClick={() => setShowPendingInvitations(true)}>
                <Button text="Pending Invites" />
              </div>
              <div onClick={handleDeleteRoom}>
                <Button text="Delete Room" />
              </div>
            </div>
          )}

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* BUTTON */}
            <div className="flex justify-end mb-4">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onClick={() => setShowCreateUploadModal(true)}
              >
                <FiFileText size={16} />
                Upload Resources
              </button>
            </div>


            {/* DESKTOP TABLE */}
            <div className="hidden md:block rounded-xl p-6" style={{ backgroundColor: currentColors.surface }}>
              <div className="grid grid-cols-4 text-sm pb-3 border-b" style={{ color: currentColors.textSecondary, borderColor: currentColors.border }}>
                <div className="col-span-2">File Name</div>
                <div>Date Posted</div>
                <div>Posted By</div>
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center rounded-lg px-4 py-3 mt-4"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border
                  }}
                >
                  <div className="flex items-center gap-3 col-span-2 cursor-pointer" onClick={() => handleOpenFile(file)}>
                    <div className="p-2 rounded-md" style={{ backgroundColor: currentColors.surface }}>
                      <FiFileText />
                    </div>
                    <span>{formatFileTitle(file.filename)}</span>
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
                  className="border rounded-xl p-4 cursor-pointer"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border
                  }}
                  onClick={() => handleOpenFile(file)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md" style={{ backgroundColor: currentColors.surface }}>
                      <FiFileText />
                    </div>
                    <p className="font-semibold">{formatFileTitle(file.filename)}</p>
                  </div>

                  <p className="text-sm text-gray-400">
                    Date: <span style={{ color: currentColors.text }}>{new Date(file.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
                    Posted by: <span style={{ color: currentColors.text }}>{file.owner_id === user.id ? "You" : currentSpace.members.find(
                      member => member.account_id === file.owner_id
                    )?.full_name}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" style={{ backgroundColor: currentColors.surface }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: currentColors.border }}>
              <h2 className="text-lg font-semibold" style={{ color: currentColors.text }}>Pending Invitations</h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="p-1 bg-transparent transition-colors"
                style={{ color: currentColors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentColors.text;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentColors.textSecondary;
                }}
              >
                <FiX size={24} />
              </button>
            </div>


            {/* Invitations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p className="text-center py-4" style={{ color: currentColors.textSecondary }}>No pending invitations</p>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div key={invitation.account_id} className="rounded-lg p-4" style={{ backgroundColor: currentColors.background }}>
                    <div className="flex items-start gap-3">
                      <img
                        src={invitation.profile_pic}
                        alt={invitation.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.fullname}</h3>
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>{invitation.email}</p>
                        <p className="text-sm mt-1">{invitation.message || "Hello world"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs" style={{ color: currentColors.textSecondary }}>{invitation.added_at}</span>
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


      {/* ADD MEMBER POPUP */}
      <AddMember
        currentSpace={currentSpace}
        onInviteMember={sendInvite}
        showInvitePopup={showInvitePopup}
        setShowInvitePopup={setShowInvitePopup}
      />


      {/* CREATE/UPLOAD POPUP MODAL */}
      {showCreateUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative" style={{ backgroundColor: currentColors.surface }}>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowCreateUploadModal(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-1 transition-colors"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.textSecondary
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentColors.hover;
                e.target.style.color = currentColors.text;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentColors.background;
                e.target.style.color = currentColors.textSecondary;
              }}
            >
              <FiX size={24} />
            </button>

            {/* CONTENT */}
            <div className="p-8 pt-12">
              {/* TITLE */}
              <h2 className="text-xl font-semibold mb-6" style={{ color: currentColors.text }}>
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
                    : ""
                }`}
                style={{
                  borderColor: dragActive ? '#3b82f6' : currentColors.border,
                  backgroundColor: dragActive ? '#eff6ff' : currentColors.background
                }}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <FiUpload size={40} className="mx-auto mb-3" style={{ color: currentColors.textSecondary }} />
                <p className="font-medium text-sm" style={{ color: currentColors.text }}>
                  Choose a file or drag & drop it here.
                </p>
                <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
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


              {/* UPLOADED FILES LIST */}
              {uploadedFiles.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: currentColors.border }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: currentColors.text }}>
                    Uploaded Files ({uploadedFiles.length}/5)
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: currentColors.background,
                          borderColor: currentColors.border
                        }}
                      >
                        {/* FILE HEADER */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="text-2xl">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: currentColors.text }}>
                                {file.name.toUpperCase()}
                              </p>
                              <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                                {(file.size / 1024).toFixed(0)}KB
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* UPLOAD BUTTON */}
                        <button
                          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1d4ed8';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                          }}
                          onClick={() => handleUploadFile(file)}
                        >
                          Upload File
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  onClick={() => setIsCreatingFile(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

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
                  onClick={() => setIsCreatingFile(false)}
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
      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteRoom}
        space={currentSpace || {
          space_name: "Unknown Space",
          members: [],
          files: [],
          tasks: []
        }}
      />
    </div>
  );
};
export default ProfFilesShared;