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

const UserThesisSpace = () => {
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
  const [pendingInvitations, setPendingInvitations] = useState([
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
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      console.log("Inviting:", inviteEmail);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  const applyFormat = (format) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        document.execCommand(format, false, null);
      }
    }
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
          <h1 className="text-xl font-bold">Thesis and Research</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* COVER */}
        <div className="relative">
          <img
            src="/src/assets/SpacesCover/thesis.jpg"
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
            <h1 className="text-2xl md:text-3xl font-bold">Thesis and Research</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">(32 Students)</span>
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
                  onClick={() => navigate("/user-prof-space-thesis/tasks")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis/files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/user-prof-space-thesis/people")}
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
            className={`bg-white rounded-xl border cursor-text transition
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
                className="editor w-full min-h-[40px] bg-white text-black text-sm pl-14 pr-4 py-2 outline-none"
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INVITE POPUP */}
      {showInvitePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90%]">
            <h2 className="text-xl font-bold mb-4 text-black">Invite Member</h2>
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInvitePopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90%] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Pending Invitations</h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={invite.userAvatar}
                    alt={invite.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-black">{invite.userName}</p>
                    <p className="text-sm text-gray-600">{invite.userEmail}</p>
                    <p className="text-xs text-gray-500">{invite.message}</p>
                  </div>
                  <div className="text-right">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserThesisSpace;
