import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiLink,
  FiMessageCircle,
  FiMenu,
  FiX,
  FiChevronLeft
} from "react-icons/fi";

const UserPage = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // Mock pending invitations data
  const pendingInvitations = [
    {
      id: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      userAvatar: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
      message: "John Doe wants to join your space",
      date: "2024-01-15",
      timeJoined: "10:30 AM"
    },
    {
      id: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      userAvatar: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
      message: "Jane Smith wants to join your space",
      date: "2024-01-14",
      timeJoined: "2:45 PM"
    },
  ];

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

  const applyFormat = (command) => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") return;
    document.execCommand(command, false, null);
  };

  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  const sendInvite = () => {
    if (inviteEmail.trim()) {
      // Here you would typically send an invitation via API
      console.log(`Inviting member: ${inviteEmail}`);
      // For demo purposes, we'll just show a success message
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  const handleAcceptInvitation = (invitationId) => {
    console.log(`Accepting invitation: ${invitationId}`);
    // Here you would typically accept the invitation via API
    alert("Invitation accepted!");
    // Remove from pending invitations
    // In real app, this would update the state or refetch data
  };

  const handleDeclineInvitation = (invitationId) => {
    console.log(`Declining invitation: ${invitationId}`);
    // Here you would typically decline the invitation via API
    alert("Invitation declined!");
    // Remove from pending invitations
    // In real app, this would update the state or refetch data
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar (Laptop+) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header (Mobile + Tablet) */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">Zeldrick's Space</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>
        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Cover"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* SEARCH - Desktop */}
          <div className="hidden md:block absolute top-4 right-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          {/* SEARCH - Mobile */}
          <div className="md:hidden absolute bottom-4 left-4 right-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* HEADER */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Zeldrick's Space</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(3 Members)</span>
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
            </div>
          </div>

          {/* TABS */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button className="text-white text-base sm:text-lg md:text-xl font-semibold border-b-2 border-white pb-2 px-1 whitespace-nowrap bg-transparent">
                  Stream
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-space-zj/tasks")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-space-zj/files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-space-zj/people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>
          
          {/* Add Member Button - Mobile */}
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
          </div>

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
                src="/src/assets/HomePage/frieren-avatar.jpg"
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
                  <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600">
                      <button className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0">
                        <FiFileText className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add File</span>
                      </button>
                      <button className="flex items-center gap-1.5 sm:gap-2 bg-white hover:text-black px-2 py-1.5 sm:px-0 sm:py-0">
                        <FiLink className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Add Link</span>
                      </button>
                    </div>

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
            immaculearn.collab.app/spaces/sample92629
          </span>
          <button className="text-gray-500 hover:text-black text-sm ml-2">
            Copy Link
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

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-w-[90%] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Pending Invitations</h3>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-white hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {pendingInvitations.length > 0 ? (
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={invitation.userAvatar}
                        alt={invitation.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{invitation.userName}</h4>
                        <p className="text-sm text-gray-600">{invitation.userEmail}</p>
                        <p className="text-xs text-gray-500">Joined: {invitation.date} at {invitation.timeJoined}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{invitation.message}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending invitations</p>
              </div>
            )}
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
    </div>
  );
};

export default UserPage;
