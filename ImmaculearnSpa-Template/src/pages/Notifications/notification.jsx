import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import { FiUsers, FiBell, FiFilter } from "react-icons/fi";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import { GroupCover } from "../component/groupCover";
import { SpaceCover } from "../component/spaceCover";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import Button from "../component/button_2";
import { announcementService } from "../../services/userAnnounceservice";
import { useNotificationCount } from "../../hooks/useNotificationCount";
import { ImageIcon } from "lucide-react";

const NotificationPage = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [ShowPendingSpaceInvitation, setShowPendingSpaceInvitation] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(location.state?.filter || "all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  
  // Use global notification count hook
  const { 
    unreadNotificationsCount, 
    schoolAnnouncements, 
    viewedAnnouncements, 
    markAnnouncementAsViewed,
    isLoading 
  } = useNotificationCount('STUDENT');

  const { user, isLoading: userLoading } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
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

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    markAnnouncementAsViewed(announcement.announce_id);
  };

  const allJoinRequests = joinRequestsByLink || [];
  const allPendingSpaceInvitation = pendingSpaceInvitation || [];

  // console.log(allJoinRequests);

  const pendingInvitesCount = allJoinRequests.length;
  const pendingSpaceInvitationCount = allPendingSpaceInvitation.length;
  const announcementsCount = schoolAnnouncements.length;

  // Filter logic
  const filteredSections = useMemo(() => {
    switch (selectedFilter) {
      case "join-requests":
        return {
          showJoinRequests: true,
          showSpaceInvitations: false,
          showAnnouncements: false,
        };
      case "space-invitations":
        return {
          showJoinRequests: false,
          showSpaceInvitations: true,
          showAnnouncements: false,
        };
      case "announcements":
        return {
          showJoinRequests: false,
          showSpaceInvitations: false,
          showAnnouncements: true,
        };
      default:
        return {
          showJoinRequests: true,
          showSpaceInvitations: true,
          showAnnouncements: true,
        };
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
    isLoading
  ) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  return (
    <div
      className="flex font-sans min-h-screen w-full"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar 
          onLogoutClick={() => setShowLogout(true)} 
        />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar 
          onLogoutClick={() => setShowLogout(true)} 
        />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode
              ? "rgb(22, 26, 32)"
              : currentColors.surface,
            borderColor: isDarkMode ? "rgb(55, 65, 81)" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1
              className="text-lg font-bold"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              Notifications
            </h1>
          </div>
        </div>

        {/* ✅ CONTENT */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto w-full">
          <h1
            className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10"
            style={{ color: currentColors.text }}
          >
            Notifications
          </h1>

          {/* Filter Section */}
          <div className="max-w-3xl mx-auto mb-6">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: isDarkMode
                  ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                  : "white",
                borderColor: isDarkMode ? currentColors.border : "black",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FiFilter className="text-blue-400" />
                <span
                  className="font-medium"
                  style={{ color: currentColors.text }}
                >
                  Filter by Category:
                </span>
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
              <div
                className="p-5 rounded-lg border"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                    : "white",
                  borderColor: isDarkMode ? currentColors.border : "black",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-blue-500" />
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: currentColors.text }}
                      >
                        Pending Join Requests
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: currentColors.textSecondary }}
                      >
                        {pendingInvitesCount} request(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingInvitations(true)}
                    className="hover:underline"
                    style={{ color: "#60A5FA" }}
                  >
                    View
                  </button>
                </div>

                {/* Preview of recent join requests */}
                {joinRequestsByLink.slice(0, 2).map((invite) => (
                  <div
                    key={`${invite.space_uuid}-${invite.account_id}`}
                    className="mt-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                        : "white",
                      borderColor: isDarkMode ? currentColors.border : "black",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={invite.profile_pic}
                        alt={invite.fullname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: currentColors.text }}
                        >
                          {invite.fullname}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          wants to join {invite.space_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {joinRequestsByLink.length > 2 && (
                  <p
                    className="text-xs mt-2 text-center"
                    style={{ color: currentColors.textSecondary }}
                  >
                    And {joinRequestsByLink.length - 2} more...
                  </p>
                )}
              </div>
            )}

            {/* Space Invitations Section */}
            {filteredSections.showSpaceInvitations && (
              <div
                className="p-5 rounded-lg border"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                    : "white",
                  borderColor: isDarkMode ? currentColors.border : "black",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-green-500" />
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: currentColors.text }}
                      >
                        Space Invitations
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: currentColors.textSecondary }}
                      >
                        {pendingSpaceInvitationCount} invitation(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingSpaceInvitation(true)}
                    className="hover:underline"
                    style={{ color: "#60A5FA" }}
                  >
                    View
                  </button>
                </div>

                {/* Preview of recent space invitations */}
                {pendingSpaceInvitation.slice(0, 2).map((invite) => (
                  <div
                    key={`${invite.space_uuid || invite.c_space_uuid}-${invite.account_id}`}
                    className="mt-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                        : "white",
                      borderColor: isDarkMode ? currentColors.border : "black",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <SpaceCover
                          image={invite.image}
                          name={invite.space_name || invite.c_space_name}
                          members={invite.members || []}
                          className="rounded-lg border-2 border-white h-8 w-8"
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: currentColors.text }}
                        >
                          {capitalizeWords(
                            invite.space_name || invite.c_space_name,
                          )}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          from {capitalizeWords(invite.owner_fullname)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingSpaceInvitation.length > 2 && (
                  <p
                    className="text-xs mt-2 text-center"
                    style={{ color: currentColors.textSecondary }}
                  >
                    And {pendingSpaceInvitation.length - 2} more...
                  </p>
                )}
              </div>
            )}

            {/* School Announcements Section */}
            {filteredSections.showAnnouncements && (
              <div
                className="p-5 rounded-lg border"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                    : "white",
                  borderColor: isDarkMode ? currentColors.border : "black",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiBell size={22} className="text-yellow-500" />
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: currentColors.text }}
                    >
                      School Announcements
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: currentColors.textSecondary }}
                    >
                      {announcementsCount} announcement(s)
                    </p>
                  </div>
                </div>

                {/* Display announcements */}
                {isLoading ? (
                  <div className="mt-3 p-8 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                    <div className="flex flex-col items-center gap-3">
                      <FiBell size={40} className="text-gray-400" />
                      <div>
                        <p 
                          className="text-sm font-medium mb-1"
                          style={{ color: currentColors.text }}
                        >
                          Loading announcements...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : schoolAnnouncements.length === 0 ? (
                  <div className="mt-3 p-8 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                    <div className="flex flex-col items-center gap-3">
                      <FiBell size={40} className="text-gray-400" />
                      <div>
                        <p 
                          className="text-sm font-medium mb-1"
                          style={{ color: currentColors.text }}
                        >
                          No announcements yet
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Admin hasn't posted any announcements at the moment
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {schoolAnnouncements.slice(0, selectedFilter === "announcements" ? schoolAnnouncements.length : 3).map((announcement) => (
                      <div
                        key={announcement.announce_id}
                        className="mt-3 p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(30, 36, 46, 0.9)"
                            : "rgba(255, 255, 255, 0.95)",
                          borderColor: isDarkMode ? currentColors.border : "rgb(229, 231, 235)",
                          borderWidth: "1px",
                        }}
                        onClick={() => handleAnnouncementClick(announcement)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {!viewedAnnouncements.has(announcement.announce_id) && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3B82F6" }}></div>
                              )}
                              <p
                                className="text-sm font-semibold break-words overflow-wrap-anywhere"
                                style={{ color: currentColors.text }}
                              >
                                {announcement.title}
                              </p>
                            </div>
                            <p
                              className="text-sm leading-relaxed mb-3 break-words overflow-wrap-anywhere"
                              style={{
                                color: currentColors.textSecondary,
                                lineHeight: "1.5",
                              }}
                            >
                              {announcement.content}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <svg 
                                className="w-4 h-4" 
                                style={{ color: currentColors.textSecondary }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <p
                                className="text-xs font-medium"
                                style={{
                                  color: currentColors.textSecondary,
                                }}
                              >
                                {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {schoolAnnouncements.length > 3 && selectedFilter !== "announcements" && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setSelectedFilter("announcements")}
                          className="px-4 py-2 text-sm hover:underline transition-colors"
                          style={{ color: isDarkMode ? "#60A5FA" : "#007AFF" }}
                        >
                          View All Announcements
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: currentColors.surface }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: currentColors.text }}
              >
                Pending Invitations
              </h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-2xl hover:opacity-80"
                style={{ color: currentColors.textSecondary }}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allJoinRequests.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: currentColors.textSecondary }}
                >
                  No pending invitations
                </p>
              ) : (
                allJoinRequests.map((invite) => (
                  <div
                    key={`${invite.space_uuid}-${invite.account_id}`}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={invite.profile_pic}
                        alt={invite.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3
                          className="font-medium"
                          style={{ color: currentColors.text }}
                        >
                          {invite.fullname}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.textSecondary }}
                        >
                          {invite.email}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Space: {invite.space_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleDecline(invite.account_id, invite.space_uuid)
                        }
                        className="px-3 py-1.5 text-sm rounded-md"
                        style={{
                          backgroundColor: isDarkMode ? "#4B5563" : "#E5E7EB",
                          color: isDarkMode ? "white" : "black",
                        }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          handleAccept(invite.account_id, invite.space_uuid)
                        }
                        className="px-3 py-1.5 text-sm rounded-md text-white"
                        style={{
                          backgroundColor: isDarkMode ? "#2563EB" : "#3B82F6",
                        }}
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
          <div
            className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: currentColors.surface }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: currentColors.text }}
              >
                Pending Space Invitation(s)
              </h2>
              <button
                onClick={() => setShowPendingSpaceInvitation(false)}
                className="text-2xl hover:opacity-80"
                style={{ color: currentColors.textSecondary }}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pendingSpaceInvitation.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: currentColors.textSecondary }}
                >
                  No pending invitations
                </p>
              ) : (
                pendingSpaceInvitation.map((invite) => (
                  <div
                    key={`${invite.space_uuid || invite.c_space_uuid}-${invite.account_id}`}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                    }}
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
                          name={invite.space_name || invite.c_space_name}
                          members={invite.members || []} // default to empty array if undefined
                          className="rounded-lg border-2 border-white h-10 w-10"
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-medium"
                          style={{ color: currentColors.text }}
                        >
                          {capitalizeWords(
                            invite.space_name || invite.c_space_name,
                          )}
                          's space
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Space Owner: {capitalizeWords(invite.owner_fullname)}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: currentColors.textSecondary }}
                        >
                          {/* Space: {invite.space_name} */}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleSpaceDecline(
                            invite.space_uuid || invite.c_space_uuid,
                          )
                        }
                        className="px-3 py-1.5 text-sm rounded-md"
                        style={{
                          backgroundColor: isDarkMode ? "#4B5563" : "#E5E7EB",
                          color: isDarkMode ? "white" : "black",
                        }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          handleSpaceAccept(
                            invite.space_uuid || invite.c_space_uuid,
                          )
                        }
                        className="px-3 py-1.5 text-sm rounded-md text-white"
                        style={{
                          backgroundColor: isDarkMode ? "#2563EB" : "#3B82F6",
                        }}
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

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            style={{
              backgroundColor: currentColors.surface,
              backdropFilter: "blur(20px)",
              border: "1px solid",
              borderColor: currentColors.border,
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex justify-between items-start"
              style={{ borderColor: currentColors.border }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3B82F6" }}></div>
                  <h2
                    className="text-xl font-bold break-words overflow-wrap-anywhere"
                    style={{ color: isDarkMode ? "white" : "#1F2937" }}
                  >
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4" 
                    style={{ color: currentColors.textSecondary }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p
                    className="text-sm font-medium"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                style={{ color: currentColors.textSecondary }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="p-6 rounded-xl leading-relaxed"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(17, 24, 39, 0.5)"
                    : "rgba(249, 250, 251, 0.8)",
                  border: "1px solid",
                  borderColor: currentColors.border,
                  fontSize: "16px",
                  lineHeight: "1.7",
                }}
              >
                <p
                  className="text-base break-words overflow-wrap-anywhere"
                  style={{ color: currentColors.text }}
                >
                  {selectedAnnouncement.content}
                </p>

                {/* Display images if available */}
                {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
                            <ImageIcon className="w-5 h-5" />
                            Images
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedAnnouncement.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                  <img
                                    src={image}
                                    alt={`Announcement image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onClick={() => window.open(image, "_blank")}
                                    style={{ cursor: "pointer" }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
              </div>

              
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t"
              style={{ borderColor: currentColors.border }}
            >
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
