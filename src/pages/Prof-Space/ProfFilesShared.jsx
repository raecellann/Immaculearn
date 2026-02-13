import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiFileText, FiMenu, FiX, FiUpload, FiCopy } from "react-icons/fi";
import Logout from "../component/logout";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";

const ProfFilesShared = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();

  // Custom hooks
  const { user, isLoading: userLoading } = useUser();
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

  // Loading state
  if (userLoading || spaceLoading) {
    return <div className="flex h-screen justify-center items-center">Loading...</div>;
  }

  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return <div className="flex h-screen justify-center items-center text-white">Space not found</div>;
  }

  // Invite member
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!currentSpace) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${currentSpace.space_name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      alert(`Space "${currentSpace.space_name}" deleted successfully.`);
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

  const files = [
    {
      name: "Calculus: Lecture 3",
      date: "October 8, 2025",
      by: "Zeldrick",
      folder: "Math",
    },
    {
      name: "IAS : Lecture 1",
      date: "October 8, 2025",
      by: "Nathaniel",
      folder: "IAS",
    },
    {
      name: "CS Thesis 2 : Lecture 4",
      date: "October 8, 2025",
      by: "Raeccell",
      folder: "Thesis",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
              <span className="text-xs text-gray-400">({currentSpace?.space_type === "course" ? (currentSpace?.members?.length - 1) + " student(s)": (currentSpace?.members?.length) + " member(s)" || 0})</span>
              {isOwnerSpace && (
                <>
                  <button 
                    onClick={handleInviteMember} 
                    className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition"
                  >
                    Add Member
                  </button>
                  <button 
                    onClick={() => setShowPendingInvitations(true)} 
                    className="px-3 py-1 text-xs bg-blue-600 rounded-md hover:bg-blue-500 transition"
                  >
                    Pending Invites
                  </button>
                  <button
                    onClick={handleDeleteRoom}
                    className="px-3 py-1 text-xs bg-red-600 rounded-md hover:bg-red-500 transition"
                  >
                    Delete Room
                  </button>
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
              <div className="flex justify-center space-x-12"> {/* Changed from flex space-x-... to justify-center space-x-12 */}
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}`)} 
                  className="text-gray-400 hover:text-white transition"
                >
                  Stream
                </button>
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}/tasks`)}
                  className="text-gray-400 hover:text-white transition"
                >
                  Tasks
                </button>
                <button className="text-white font-semibold border-b-2 border-white pb-2">
                  Files
                </button>
                <button 
                  onClick={() => navigate(`/prof/space/${space_uuid}/${space_name}/people`)}
                  className="text-gray-400 hover:text-white transition"
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <button 
                onClick={handleInviteMember} 
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition text-sm"
              >
                Add Member
              </button>
              <button 
                onClick={() => setShowPendingInvitations(true)} 
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition text-sm"
              >
                Pending Invites
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500 transition text-sm"
              >
                Delete Room
              </button>
            </div>
          )}

          {/* ================= FILES ================= */}
          <div className="max-w-5xl mx-auto">
            {/* BUTTON */}
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setShowCreateUploadModal(true)}
              >
                <FiFileText size={16} />
                Create or Upload File
              </button>
            </div>

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
                  className="grid grid-cols-4 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4"
                >
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <span>{file.name}</span>
                  </div>
                  <div>{file.date}</div>
                  <div>{file.by}</div>
                </div>
              ))}
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="md:hidden space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <p className="font-semibold">{file.name}</p>
                  </div>

                  <p className="text-sm text-gray-400">
                    Date: <span className="text-white">{file.date}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Posted by: <span className="text-white">{file.by}</span>
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
                onClick={() => {
                  navigate("/create-document");
                  setShowCreateUploadModal(false);
                }}
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

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfFilesShared;