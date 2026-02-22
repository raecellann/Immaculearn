import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import { FiUsers, FiBell, FiFilter } from "react-icons/fi";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import { GroupCover } from "../component/groupCover";
import { SpaceCover } from "../component/spaceCover";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import Button from "../component/button_2";

const NotificationPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [ShowPendingSpaceInvitation, setShowPendingSpaceInvitation] =
    useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { user, isLoading: userLoading } = useUser();
  const {
    joinRequestsByLink,
    joinRequestsByLinkLoading,
    pendingSpaceInvitation,
    pendingSpaceInvitationLoading,
    acceptJoinRequest,
    declineJoinRequest,
    acceptSpaceInvitation,
    declineSpaceInvitation,
    isLoading: spaceLoading,
  } = useSpace();

  const allJoinRequests = joinRequestsByLink || [];
  const allPendingSpaceInvitation = pendingSpaceInvitation || [];

  // Mock school announcements data - replace with actual data source
  const schoolAnnouncements = [
    {
      id: 1,
      title: "School Holiday Notice",
      message: "School will be closed on Monday for maintenance.",
      date: "2024-02-20",
      priority: "high"
    },
    {
      id: 2,
      title: "Exam Schedule Released",
      message: "Final exam schedule has been posted. Check your student portal.",
      date: "2024-02-19",
      priority: "medium"
    }
  ];

  console.log(allJoinRequests);

  const pendingInvitesCount = allJoinRequests.length;
  const pendingSpaceInvitationCount = allPendingSpaceInvitation.length;
  const announcementsCount = schoolAnnouncements.length;

  // Filter logic
  const filteredSections = useMemo(() => {
    switch (selectedFilter) {
      case "join-requests":
        return { showJoinRequests: true, showSpaceInvitations: false, showAnnouncements: false };
      case "space-invitations":
        return { showJoinRequests: false, showSpaceInvitations: true, showAnnouncements: false };
      case "announcements":
        return { showJoinRequests: false, showSpaceInvitations: false, showAnnouncements: true };
      default:
        return { showJoinRequests: true, showSpaceInvitations: true, showAnnouncements: true };
    }
  }, [selectedFilter]);

  /* =========================
     SCROLL HIDE HEADER
  ========================= */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleAccept = async (accountId, spaceUuid) => {
    try {
      await acceptJoinRequest(accountId, spaceUuid);
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  const handleDecline = async (accountId, spaceUuid) => {
    try {
      await declineJoinRequest(accountId, spaceUuid);
    } catch (err) {
      console.error("Decline failed:", err);
    }
  };

  const handleSpaceAccept = async (spaceUuid) => {
    try {
      await acceptSpaceInvitation(spaceUuid);
    } catch (err) {
      console.error("Accept failed:", err);
    }
  };

  const handleSpaceDecline = async (spaceUuid) => {
    try {
      await declineSpaceInvitation(spaceUuid);
    } catch (err) {
      console.error("Decline failed:", err);
    }
  };

  if (
    userLoading ||
    spaceLoading ||
    joinRequestsByLinkLoading ||
    pendingSpaceInvitationLoading
  ) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">Notifications</h1>
          </div>
        </div>

        {/* ✅ CONTENT */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Notifications
          </h1>

          {/* Filter Section */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-[#1E242E] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiFilter className="text-blue-400" />
                <span className="font-medium">Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  text="All Notifications" 
                  onClick={() => setSelectedFilter("all")}
                />
                <Button 
                  text="Pending Join Requests" 
                  onClick={() => setSelectedFilter("join-requests")}
                />
                <Button 
                  text="Space Invitations" 
                  onClick={() => setSelectedFilter("space-invitations")}
                />
                <Button 
                  text="School Announcements" 
                  onClick={() => setSelectedFilter("announcements")}
                />
              </div>
            </div>
          </div>

          {/* Notification Sections */}
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {/* Pending Join Requests Section */}
            {filteredSections.showJoinRequests && (
              <div className="bg-[#1E242E] p-5 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-blue-500" />
                    <div>
                      <p className="font-semibold">Pending Join Requests</p>
                      <p className="text-sm text-gray-400">
                        {pendingInvitesCount} request(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingInvitations(true)}
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </div>
                
                {/* Preview of recent join requests */}
                {allJoinRequests.slice(0, 2).map((invite) => (
                  <div key={`${invite.space_uuid}-${invite.account_id}`} className="mt-3 p-3 bg-[#2A2F3A] rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={invite.profile_pic}
                        alt={invite.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{invite.fullname}</p>
                        <p className="text-xs text-gray-400">wants to join {invite.space_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {allJoinRequests.length > 2 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    And {allJoinRequests.length - 2} more...
                  </p>
                )}
              </div>
            )}

            {/* Space Invitations Section */}
            {filteredSections.showSpaceInvitations && (
              <div className="bg-[#1E242E] p-5 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-green-500" />
                    <div>
                      <p className="font-semibold">Space Invitations</p>
                      <p className="text-sm text-gray-400">
                        {pendingSpaceInvitationCount} invitation(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingSpaceInvitation(true)}
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </div>
                
                {/* Preview of recent space invitations */}
                {allPendingSpaceInvitation.slice(0, 2).map((invite) => (
                  <div key={`${invite.space_uuid}-${invite.account_id}`} className="mt-3 p-3 bg-[#2A2F3A] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <SpaceCover
                          image={invite.image}
                          name={invite.space_name}
                          members={invite.members || []}
                          className="rounded-lg border-2 border-white h-8 w-8"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{capitalizeWords(invite.space_name)}</p>
                        <p className="text-xs text-gray-400">from {capitalizeWords(invite.owner_fullname)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {allPendingSpaceInvitation.length > 2 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    And {allPendingSpaceInvitation.length - 2} more...
                  </p>
                )}
              </div>
            )}

            {/* School Announcements Section */}
            {filteredSections.showAnnouncements && (
              <div className="bg-[#1E242E] p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FiBell size={22} className="text-yellow-500" />
                  <div>
                    <p className="font-semibold">School Announcements</p>
                    <p className="text-sm text-gray-400">
                      {announcementsCount} announcement(s)
                    </p>
                  </div>
                </div>
                
                {/* Display announcements */}
                {schoolAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="mt-3 p-3 bg-[#2A2F3A] rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{announcement.title}</p>
                        <p className="text-xs text-gray-300 mt-1">{announcement.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{announcement.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        announcement.priority === 'high' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {announcement.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allJoinRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No pending invitations
                </p>
              ) : (
                allJoinRequests.map((invite) => (
                  <div
                    key={`${invite.space_uuid}-${invite.account_id}`}
                    className="bg-[#2A2F3A] rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={invite.profile_pic}
                        alt={invite.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{invite.fullname}</h3>
                        <p className="text-sm text-gray-400">{invite.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Space: {invite.space_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleDecline(invite.account_id, invite.space_uuid)
                        }
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          handleAccept(invite.account_id, invite.space_uuid)
                        }
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md"
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

      {ShowPendingSpaceInvitation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Pending Space Invitation(s)
              </h2>
              <button
                onClick={() => setShowPendingSpaceInvitation(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allPendingSpaceInvitation.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No pending invitations
                </p>
              ) : (
                allPendingSpaceInvitation.map((invite) => (
                  <div
                    key={`${invite.space_uuid}-${invite.account_id}`}
                    className="bg-[#2A2F3A] rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* <img
                        src={invite.owner_profile_pic}
                        alt={invite.owner_fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      /> */}

                      <div className="relative">
                        <SpaceCover
                          image={invite.image}
                          name={invite.space_name}
                          members={invite.members || []} // default to empty array if undefined
                          className="rounded-lg border-2 border-white h-10 w-10"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {capitalizeWords(invite.space_name)}'s space
                        </h3>
                        <p className="text-sm text-gray-400">
                          Space Owner: {capitalizeWords(invite.owner_fullname)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {/* Space: {invite.space_name} */}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() => handleSpaceDecline(invite.space_uuid)}
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleSpaceAccept(invite.space_uuid)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md"
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

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default NotificationPage;
