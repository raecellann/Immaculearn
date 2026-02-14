import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiCopy,
  FiUpload,
  FiRefreshCw
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { useQueryClient } from "@tanstack/react-query";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import PageNotFound from "../PageNotFound/pageNotFound";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";

const UserPage = () => {
  const { space_uuid, space_name } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State hooks - MUST BE AT THE TOP
  const [isFocused, setIsFocused] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, completed, error
  const [uploadError, setUploadError] = useState(null);
  const [backgroundUpload, setBackgroundUpload] = useState(false);
  const [showUploadNotification, setShowUploadNotification] = useState(false);
  
  // Refs - MUST BE AT THE TOP
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);

  // Custom hooks - MUST BE AT THE TOP
  const { user, isLoading: userLoading } = useUser();
  const { addNotification, showGlobalNotification } = useNotification();
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

  // Join requests - MUST BE AT THE TOP (unconditionally)
  const { data: joinRequestsData = [], isLoading: joinRequestsLoading, refetch: refetchJoinRequests } = useJoinRequests(space_uuid || "");

  // Calculate pending invites count
  const pendingInvitesCount = joinRequestsData?.length || 0;

  // Scroll handler
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

  // UUID validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Find current space
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || []), ...(friendSpaces || [])];

  const currentSpace = allSpaces.find(space => space.space_uuid === space_uuid);

  
  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;

  const isFriendSpace = !isOwnerSpace;

  // Loading state
  if (userLoading || spaceLoading) {
    return <div className="flex h-screen justify-center items-center"><MainLoading /></div>;
  }

  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return <PageNotFound />;
  }

  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // Text formatting
  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

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
      addNotification({
        type: 'success',
        title: 'Space Deleted',
        message: `"${currentSpace.space_name}" has been deleted successfully.`,
        duration: 3000
      });
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete space. Please try again.',
        duration: 5000
      });
    }
  };

  // Handle join requests
  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
      addNotification({
        type: 'success',
        title: 'Request Accepted',
        message: 'Member has been added to the space successfully.',
        duration: 3000
      });
      // Immediately refetch to update the UI
      refetchJoinRequests();
    } catch (error) {
      console.error("Failed to accept join request:", error);
      addNotification({
        type: 'error',
        title: 'Accept Failed',
        message: 'Failed to accept join request. Please try again.',
        duration: 5000
      });
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
      addNotification({
        type: 'info',
        title: 'Request Declined',
        message: 'Join request has been declined.',
        duration: 3000
      });
      // Immediately refetch to update the UI
      refetchJoinRequests();
    } catch (error) {
      console.error("Failed to decline join request:", error);
      addNotification({
        type: 'error',
        title: 'Decline Failed',
        message: 'Failed to decline join request. Please try again.',
        duration: 5000
      });
    }
  };

  // Send invite
  const sendInvite = () => {
    if (inviteEmail.trim()) {
      addNotification({
        type: 'success',
        title: 'Invitation Sent',
        message: `Invitation has been sent to ${inviteEmail}`,
        duration: 3000
      });
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

  // File validation
  const validateFile = (file) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    return isValidType || isValidExtension;
  };

  // Parse CSV/Excel file
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let data = [];
          let headers = [];
          
          if (file.name.toLowerCase().endsWith('.csv')) {
            // Handle CSV files
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            data = lines.slice(1).map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              return {
                id: `member-${index}`,
                email: values[0] || '',
                name: values[1] || '',
                status: 'pending'
              };
            });
          } else {
            // Handle Excel files (XLS/XLSX)
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            headers = jsonData[0].map(h => String(h).trim().toLowerCase());
            
            data = jsonData.slice(1).map((row, index) => {
              return {
                id: `member-${index}`,
                email: row[0] ? String(row[0]).trim() : '',
                name: row[1] ? String(row[1]).trim() : '',
                status: 'pending'
              };
            });
          }
          
          // Find email column index
          const emailColumnIndex = headers.findIndex(header => 
            header === 'email' || header === 'emails'
          );
          
          if (emailColumnIndex === -1) {
            reject(new Error('No "email" or "emails" header found in the file. Please ensure your file has a header row with "email" or "emails" column.'));
            return;
          }
          
          // Find name column index (optional)
          const nameColumnIndex = headers.findIndex(header => 
            header === 'name' || header === 'fullname' || header === 'full_name'
          );
          
          // Re-process data with correct column mapping
          if (file.name.toLowerCase().endsWith('.csv')) {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            
            data = lines.slice(1).map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              return {
                id: `member-${index}`,
                email: values[emailColumnIndex] || '',
                name: nameColumnIndex !== -1 ? (values[nameColumnIndex] || '') : '',
                status: 'pending'
              };
            });
          } else {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            data = jsonData.slice(1).map((row, index) => {
              return {
                id: `member-${index}`,
                email: row[emailColumnIndex] ? String(row[emailColumnIndex]).trim() : '',
                name: nameColumnIndex !== -1 ? (row[nameColumnIndex] ? String(row[nameColumnIndex]).trim() : '') : '',
                status: 'pending'
              };
            });
          }
          
          // Filter for Gmail addresses only and valid emails
          const gmailOnlyMembers = data.filter(member => {
            const email = member.email.toLowerCase();
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            return gmailRegex.test(email);
          });
          
          if (gmailOnlyMembers.length === 0) {
            reject(new Error('No valid Gmail addresses found in the file. Please ensure emails are in format: username@gmail.com'));
            return;
          }
          
          if (gmailOnlyMembers.length < data.length) {
            const nonGmailCount = data.length - gmailOnlyMembers.length;
            console.log(`Filtered out ${nonGmailCount} non-Gmail addresses`);
          }
          
          resolve(gmailOnlyMembers);
        } catch (error) {
          reject(new Error('Failed to parse file: ' + error.message));
        }
      };
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  // Process upload queue
  const processUploadQueue = async () => {
    setUploadStatus('uploading');
    setUploadError(null);
    setBackgroundUpload(true);
    setShowUploadModal(false);
    setShowUploadNotification(true);
    
    const updatedQueue = [...uploadQueue];
    
    for (let i = 0; i < updatedQueue.length; i++) {
      const member = updatedQueue[i];
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simulate random success/failure (90% success rate)
        if (Math.random() > 0.1) {
          updatedQueue[i] = { ...member, status: 'completed' };
        } else {
          updatedQueue[i] = { ...member, status: 'error', error: 'Failed to send invitation' };
        }
        
        setUploadQueue([...updatedQueue]);
        setUploadProgress(prev => ({ ...prev, [member.id]: i + 1 }));
      } catch (error) {
        updatedQueue[i] = { ...member, status: 'error', error: error.message };
        setUploadQueue([...updatedQueue]);
      }
    }
    
    const hasErrors = updatedQueue.some(m => m.status === 'error');
    setUploadStatus(hasErrors ? 'error' : 'completed');
    
    // Show completion notification
    setTimeout(() => {
      if (!hasErrors) {
        addNotification({
          type: 'success',
          title: 'All Invitations Sent',
          message: `Successfully invited ${updatedQueue.length} members!`,
          duration: 5000
        });
        resetUploadState();
      } else {
        const successCount = updatedQueue.filter(m => m.status === 'completed').length;
        const errorCount = updatedQueue.filter(m => m.status === 'error').length;
        addNotification({
          type: 'warning',
          title: 'Upload Completed with Issues',
          message: `${successCount} successful, ${errorCount} failed. Check upload status for details.`,
          duration: 7000
        });
      }
    }, 500);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!validateFile(file)) {
      addNotification({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload a valid CSV or Excel file',
        duration: 5000
      });
      return;
    }
    
    try {
      const members = await parseFile(file);
      
      if (members.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Members Found',
          message: 'No valid members found in file',
          duration: 5000
        });
        return;
      }
      
      // Show info about Gmail filtering
      const totalParsed = members.length;
      addNotification({
        type: 'info',
        title: 'File Processed',
        message: `Found ${totalParsed} valid Gmail address(es). Non-Gmail addresses have been filtered out.`,
        duration: 5000
      });
      
      setUploadQueue(members);
      setShowUploadModal(true);
      setUploadStatus('idle');
      setShowInvitePopup(false);
      // Reset file input
      event.target.value = '';
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Parse Error',
        message: 'Error parsing file: ' + error.message,
        duration: 5000
      });
    }
  };

  // Retry failed uploads
  const retryFailedUploads = () => {
    const failedMembers = uploadQueue.filter(m => m.status === 'error');
    const updatedQueue = uploadQueue.map(m => 
      m.status === 'error' ? { ...m, status: 'pending', error: null } : m
    );
    
    setUploadQueue(updatedQueue);
    setUploadStatus('uploading');
    setUploadError(null);
    
    // Process only failed members
    processUploadQueue();
  };

  // Reset upload state
  const resetUploadState = () => {
    setUploadQueue([]);
    setUploadProgress({});
    setUploadStatus('idle');
    setUploadError(null);
    setBackgroundUpload(false);
    setShowUploadNotification(false);
  };

  // Remove member from upload queue
  const removeMemberFromQueue = (memberId) => {
    const updatedQueue = uploadQueue.filter(member => member.id !== memberId);
    setUploadQueue(updatedQueue);
    
    if (updatedQueue.length === 0) {
      setShowUploadModal(false);
      resetUploadState();
    }
  };

  // Close upload modal
  const closeUploadModal = () => {
    if (uploadStatus === 'uploading') {
      if (!confirm('Start upload in background and continue?')) {
        return;
      }
    }
    setShowUploadModal(false);
  };

  // Show upload status modal
  const showUploadStatusModal = () => {
    setShowUploadModal(true);
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
                  <button 
                    onClick={handleInviteMember} 
                    className="px-3 py-1 text-xs bg-gray-600 rounded-md hover:bg-gray-500 transition"
                  >
                    Add Member
                  </button>
                  <button 
                    onClick={() => setShowPendingInvitations(true)} 
                    className="px-3 py-1 text-xs bg-blue-600 rounded-md hover:bg-blue-500 transition relative"
                  >
                    Pending Invites
                    {pendingInvitesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingInvitesCount}
                      </span>
                    )}
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
              <div className="flex justify-center space-x-12">
                <button className="font-semibold border-b-2 border-white pb-2">
                  Stream
                </button>
                <button
                 onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}>
                  Tasks
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/files`)
                  }
                >
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
              <button 
                onClick={handleInviteMember} 
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition text-sm"
              >
                Add Member
              </button>
              <button 
                onClick={() => setShowPendingInvitations(true)} 
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition text-sm relative"
              >
                Pending Invites
                {pendingInvitesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingInvitesCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500 transition text-sm"
              >
                Delete Room
              </button>
            </div>
          )}

          {/* POST BOX */}
          <div
            className={`
              bg-white rounded-xl border cursor-text transition
              ${isFocused ? "border-black" : "border-transparent"}
              hover:border-black
            `}
            onClick={() => editorRef.current?.focus()}
          >
            <div className="relative p-6">
              {/* AVATAR */}
              <img
                src={user?.profile_pic || "/src/assets/HomePage/frieren-avatar.jpg"}
                alt="Avatar"
                className="absolute left-6 top-6 w-10 h-10 rounded-full"
              />

              {/* EDITOR */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  if (editorRef.current.innerText.trim() === "") {
                    setIsFocused(false);
                  }
                }}
                className="
                  editor
                  w-full
                  min-h-[40px]
                  bg-white
                  text-black
                  text-sm
                  pl-14
                  pr-4
                  py-2
                  outline-none
                "
              />

              {/* ACTIONS */}
              {isFocused && (
                <>
                  {/* FORMAT */}
                  <div className="flex gap-8 mt-4 text-black">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("bold");
                      }}
                      className="font-bold text-lg bg-white"
                    >
                      B
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("italic");
                      }}
                      className="italic text-lg bg-white"
                    >
                      I
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat("underline");
                      }}
                      className="underline text-lg bg-white"
                    >
                      U
                    </button>
                  </div>

                  <div className="mt-4 border-t border-gray-300" />

                  {/* FOOTER */}
                  <div className="mt-4 flex justify-end">
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
                      <button
                        onClick={() => {
                          setIsFocused(false);
                          editorRef.current.innerHTML = "";
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 whitespace-nowrap"
                      >
                        Cancel
                      </button>
                      <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">
                        Post
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
            {/* REMINDERS */}
            <div className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 md:p-5">
              <h2 className="font-bold mb-4">Reminders</h2>
              <div className="space-y-3">
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Reflection Paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
                <div className="bg-[#141820] p-3 rounded-lg">
                  <p className="font-semibold text-sm">
                    Week 7 Individual Activity
                  </p>
                  <p className="text-xs text-gray-400">
                    Operating System • Oct 15
                  </p>
                </div>
              </div>

              {/* CHAT */}
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-black border border-gray-700 hover:bg-gray-900">
                <FiMessageCircle />
                Enter Chat
              </button>
            </div>

            {/* ACTIVITY */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiFileText className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick shared a file with you
                    </p>
                    <p className="text-sm text-gray-400">OS • Week 7 Lecture</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See File
                </button>
              </div>

              <div className="bg-[#1B1F26] p-4 md:p-5 rounded-xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-4">
                  <FiCheckCircle className="text-blue-400" size={24} />
                  <div>
                    <p className="font-semibold">
                      Zeldrick assigned task with you
                    </p>
                    <p className="text-sm text-gray-400">
                      Thesis • Survey Revision
                    </p>
                  </div>
                </div>
                <button className="text-blue-400 hover:underline bg-transparent">
                  See Task
                </button>
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

              {/* CSV/EXCEL UPLOAD */}
              <div className="mb-4">
                <p className="text-sm font-medium text-black mb-2">
                  Or upload CSV/Excel file (Gmail only)
                </p>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> CSV/Excel file
                      </p>
                      <p className="text-xs text-gray-500">Gmail addresses only (CSV, XLS, XLSX)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Format: Must include header row with "email" or "emails" column. Optional: "name", "fullname", or "full_name" column
                </p>
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

        {/* BACKGROUND UPLOAD NOTIFICATION */}
        {showUploadNotification && (
          <div className="fixed bottom-4 right-4 bg-[#1E222A] border border-gray-700 rounded-lg p-4 shadow-xl z-40 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">Inviting Members</h3>
              <button
                onClick={showUploadStatusModal}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Details
              </button>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Progress</span>
                <span className="text-gray-300">
                  {Object.keys(uploadProgress).length} / {uploadQueue.length}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Object.keys(uploadProgress).length / uploadQueue.length) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Upload continues in background. You can continue using the application.
            </p>
          </div>
        )}

        {/* UPLOAD STATUS MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {backgroundUpload ? 'Upload Status' :
                   uploadStatus === 'idle' ? 'Review Members' : 
                   uploadStatus === 'uploading' ? 'Inviting Members...' :
                   uploadStatus === 'completed' ? 'Upload Completed' : 'Upload Issues'}
                </h2>
                <button
                  onClick={backgroundUpload ? showUploadStatusModal : closeUploadModal}
                  className="text-gray-400 hover:text-white p-1 bg-transparent"
                  disabled={uploadStatus === 'uploading' && !backgroundUpload}
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {uploadStatus === 'idle' && (
                  <div>
                    <p className="text-sm text-gray-300 mb-4">
                      Found {uploadQueue.length} member(s) to invite. Review and remove any you don't want to include.
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadQueue.map((member) => (
                        <div key={member.id} className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white">{member.name || 'No name'}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                          </div>
                          <button
                            onClick={() => removeMemberFromQueue(member.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                            title="Remove member"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-gray-300">
                          {Object.keys(uploadProgress).length} / {uploadQueue.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(Object.keys(uploadProgress).length / uploadQueue.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadQueue.map((member) => (
                        <div key={member.id} className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{member.name || 'No name'}</p>
                            <p className="text-sm text-gray-400">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.status === 'pending' && (
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
                            )}
                            {member.status === 'completed' && (
                              <span className="text-green-400 text-xs">✓ Sent</span>
                            )}
                            {member.status === 'error' && (
                              <span className="text-red-400 text-xs">✗ Failed</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(uploadStatus === 'completed' || uploadStatus === 'error') && (
                  <div>
                    <div className="mb-4 p-4 bg-[#2A2F3A] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-medium">
                          ✓ {uploadQueue.filter(m => m.status === 'completed').length} invitations sent
                        </span>
                        {uploadQueue.some(m => m.status === 'error') && (
                          <span className="text-red-400 font-medium">
                            ✗ {uploadQueue.filter(m => m.status === 'error').length} failed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {uploadQueue.some(m => m.status === 'error') && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-300 mb-2">Failed invitations:</p>
                        {uploadQueue.filter(m => m.status === 'error').map((member) => (
                          <div key={member.id} className="bg-[#2A2F3A] rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{member.name || 'No name'}</p>
                              <p className="text-sm text-gray-400">{member.email}</p>
                              <p className="text-xs text-red-400 mt-1">{member.error}</p>
                            </div>
                            <span className="text-red-400 text-xs">✗ Failed</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                {uploadStatus === 'idle' && !backgroundUpload && (
                  <>
                    <button
                      onClick={closeUploadModal}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processUploadQueue}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                      disabled={uploadQueue.length === 0}
                    >
                      Invite {uploadQueue.length} Member(s)
                    </button>
                  </>
                )}
                
                {uploadStatus === 'uploading' && backgroundUpload && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">
                      Processing in background...
                    </span>
                    <button
                      onClick={() => setShowUploadNotification(false)}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Hide
                    </button>
                  </div>
                )}
                
                {uploadStatus === 'uploading' && !backgroundUpload && (
                  <button
                    disabled
                    className="px-4 py-2 text-sm bg-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                  >
                    Processing...
                  </button>
                )}
                
                {uploadStatus === 'completed' && (
                  <button
                    onClick={resetUploadState}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                  >
                    Done
                  </button>
                )}
                
                {uploadStatus === 'error' && (
                  <>
                    <button
                      onClick={resetUploadState}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={retryFailedUploads}
                      className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 rounded-md transition text-white flex items-center gap-2"
                    >
                      <FiRefreshCw size={16} />
                      Retry Failed
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PLACEHOLDER STYLE */}
      <style>
        {`
          .editor:empty:before {
            content: "Post something to your space";
            color: #9ca3af;
            pointer-events: none;
          }
        `}
      </style>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default UserPage;