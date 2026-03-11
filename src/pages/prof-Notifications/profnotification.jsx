import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router";
import Sidebar from "../component/profsidebar";
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

const ProfNotificationPage = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [ShowPendingSpaceInvitation, setShowPendingSpaceInvitation] =
    useState(false);
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
  } = useNotificationCount('PROFESSOR');
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const { user, isLoading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    joinRequestsByLink,
    joinRequestsByLinkLoading,

    // joinRequestsByLink,
    pendingSpaceInvitation,

    acceptJoinRequest,
    declineJoinRequest,
    acceptSpaceInvitation,
    declineSpaceInvitation,
    isLoading: spaceLoading,
  } = useSpace();

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("space_invitation_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("join_space_by_link", () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
    });

    socket.on("decline_space_invitation", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
    });

    socket.on("accept_space_invitation", () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSpaceInvitation"] });
      queryClient.invalidateQueries({ queryKey: ["userSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["friendSpaces"] });
      queryClient.invalidateQueries({ queryKey: ["courseSpaces"] });
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket for professor notifications");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, queryClient]);

  /* =========================
     GET ALL OWNED SPACES
  ========================= */
  const ownedSpaces = useMemo(() => {
    const allSpaces = [
      ...(userSpaces || []),
      ...(courseSpaces || []),
      ...(friendSpaces || []),
    ];

    return allSpaces.filter((space) => space.creator === user?.id);
  }, [userSpaces, courseSpaces, friendSpaces, user]);

  /* =========================
     FETCH JOIN REQUESTS PER SPACE
  ========================= */
  const allJoinRequests = useMemo(() => {
    const ownedSpaceIds = new Set(ownedSpaces.map((space) => space.space_uuid));
    const requests = joinRequestsByLink || [];
    return requests
      .filter((request) => ownedSpaceIds.has(request.space_uuid))
      .map((request) => {
        const space = ownedSpaces.find(
          (s) => s.space_uuid === request.space_uuid,
        );
        return {
          ...request,
          space_name: space?.space_name || "Unknown Space",
        };
      });
  }, [joinRequestsByLink, ownedSpaces]);

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    markAnnouncementAsViewed(announcement.announce_id);
  };

  const pendingInvitesCount = joinRequestsByLink?.length;

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

  if (userLoading || spaceLoading || isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

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

  return (
    <div
      className="flex font-sans min-h-screen"
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
      <div className="flex-1 flex flex-col">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            ☰
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: isDarkMode ? "white" : "black" }}
          >
            Notifications
          </h1>
        </div>

        {/* ✅ CONTENT */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Notifications
          </h1>

          {/* Filter Section */}
          <div className="max-w-3xl mx-auto mb-6">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(45, 55, 72, 0.5)"
                  : currentColors.surface,
                backdropFilter: isDarkMode ? "blur(10px)" : "none",
                borderColor: isDarkMode
                  ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                  : "black",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FiFilter className="text-blue-400" />
                <span
                  className="font-medium"
                  style={{ color: isDarkMode ? "white" : "black" }}
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
                    ? "rgba(31, 41, 55, 0.5)"
                    : currentColors.surface,
                  backdropFilter: isDarkMode ? "blur(10px)" : "none",
                  borderColor: isDarkMode
                    ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                    : "black",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-blue-500" />
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: isDarkMode ? "white" : "black" }}
                      >
                        Pending Join Requests
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? currentColors.textSecondary
                            : "#666666",
                        }}
                      >
                        {joinRequestsByLink?.length} request(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingInvitations(true)}
                    className="text-blue-400 hover:underline"
                    style={{ color: isDarkMode ? "#60A5FA" : "#007AFF" }}
                  >
                    View
                  </button>
                </div>

                {/* Preview of recent join requests */}
                {joinRequestsByLink.slice(0, 2).map((invite) => (
                  <div
                    key={`${invite.space_uuid || invite.c_space_uuid}-${invite.account_id}`}
                    className="mt-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : currentColors.surface,
                      backdropFilter: isDarkMode ? "blur(10px)" : "none",
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
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          {invite.fullname}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? currentColors.textSecondary
                              : "#666666",
                          }}
                        >
                          wants to join {invite.space_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {joinRequestsByLink?.length > 2 && (
                  <p
                    className="text-xs mt-2 text-center"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#666666",
                    }}
                  >
                    And {joinRequestsByLink?.length - 2} more...
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
                    ? "rgba(31, 41, 55, 0.5)"
                    : currentColors.surface,
                  backdropFilter: isDarkMode ? "blur(10px)" : "none",
                  borderColor: isDarkMode
                    ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                    : "black",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiUsers size={22} className="text-green-500" />
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: isDarkMode ? "white" : "black" }}
                      >
                        Space Invitations
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? currentColors.textSecondary
                            : "#666666",
                        }}
                      >
                        {pendingSpaceInvitation?.length || 0} invitation(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingSpaceInvitation(true)}
                    className="text-blue-400 hover:underline"
                    style={{ color: isDarkMode ? "#60A5FA" : "#007AFF" }}
                  >
                    View
                  </button>
                </div>

                {/* Preview of recent space invitations */}
                {pendingSpaceInvitation?.slice(0, 2).map((invite) => (
                  <div
                    key={`${invite.space_uuid || invite.c_space_uuid}-${invite.account_id}`}
                    className="mt-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : currentColors.surface,
                      backdropFilter: isDarkMode ? "blur(10px)" : "none",
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
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          {capitalizeWords(
                            invite.space_name || invite.c_space_name,
                          )}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? currentColors.textSecondary
                              : "#666666",
                          }}
                        >
                          from {capitalizeWords(invite.owner_fullname)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingSpaceInvitation?.length > 2 && (
                  <p
                    className="text-xs mt-2 text-center"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#666666",
                    }}
                  >
                    And {pendingSpaceInvitation?.length - 2} more...
                  </p>
                )}
                {(!pendingSpaceInvitation || pendingSpaceInvitation.length === 0) && (
                  <p
                    className="text-sm text-center py-4"
                    style={{
                      color: isDarkMode ? currentColors.textSecondary : "#666666",
                    }}
                  >
                    No space invitations available
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
                    ? "rgba(31, 41, 55, 0.5)"
                    : currentColors.surface,
                  backdropFilter: isDarkMode ? "blur(10px)" : "none",
                  borderColor: isDarkMode
                    ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                    : "black",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiBell size={22} className="text-yellow-500" />
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: isDarkMode ? "white" : "black" }}
                    >
                      School Announcements
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? currentColors.textSecondary
                          : "#666666",
                      }}
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
                          style={{ color: isDarkMode ? "white" : "black" }}
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
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          No announcements yet
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }}
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
                            ? "rgba(31, 41, 55, 0.8)"
                            : "rgba(255, 255, 255, 0.9)",
                          backdropFilter: isDarkMode ? "blur(10px)" : "none",
                          borderColor: isDarkMode
                            ? "rgb(75, 85, 99)"
                            : "rgb(229, 231, 235)",
                          borderWidth: "1px",
                        }}
                        onClick={() => handleAnnouncementClick(announcement)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {!viewedAnnouncements.has(announcement.announce_id) && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB" }}></div>
                              )}
                              <p
                                className="text-sm font-semibold"
                                style={{ color: isDarkMode ? "white" : "#1F2937" }}
                              >
                                {announcement.title}
                              </p>
                            </div>
                            <p
                              className="text-sm leading-relaxed mb-3"
                              style={{
                                color: isDarkMode
                                  ? "rgba(229, 231, 235, 0.9)"
                                  : "#4B5563",
                                lineHeight: "1.5",
                              }}
                            >
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2">
                              <svg 
                                className="w-4 h-4" 
                                style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
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
                                  color: isDarkMode
                                    ? "#9CA3AF"
                                    : "#6B7280",
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
            style={{
              backgroundColor: isDarkMode
                ? "rgba(45, 55, 72, 0.5)"
                : currentColors.surface,
              backdropFilter: isDarkMode ? "blur(10px)" : "none",
            }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Pending Join Request
              </h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-2xl hover:opacity-80"
                style={{
                  color: isDarkMode ? currentColors.textSecondary : "black",
                }}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsByLink.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: currentColors.textSecondary }}
                >
                  No pending Join Request
                </p>
              ) : (
                joinRequestsByLink?.map((invite) => (
                  <div
                    key={`${invite.space_uuid}-${invite.account_id}`}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(45, 55, 72, 0.3)"
                        : currentColors.surface,
                      backdropFilter: isDarkMode ? "blur(10px)" : "none",
                      borderColor: isDarkMode
                        ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                        : "black",
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
                          style={{ color: isDarkMode ? "white" : "black" }}
                        >
                          {invite.fullname}
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? currentColors.textSecondary
                              : "#666666",
                          }}
                        >
                          {invite.email}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: isDarkMode
                              ? currentColors.textSecondary
                              : "#666666",
                          }}
                        >
                          Space: {invite.space_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleDecline(invite.account_id, invite.c_space_uuid)
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
                          handleAccept(invite.account_id, invite.c_space_uuid)
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
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.95)"
                : "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid",
              borderColor: isDarkMode ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)",
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex justify-between items-start"
              style={{ borderColor: isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)" }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB" }}></div>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: isDarkMode ? "white" : "#1F2937" }}
                  >
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4" 
                    style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
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
                    style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
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
                style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
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
                  borderColor: isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)",
                  fontSize: "16px",
                  lineHeight: "1.7",
                }}
              >
                <p
                  className="text-base"
                  style={{ color: isDarkMode ? "rgba(229, 231, 235, 0.95)" : "#374151" }}
                >
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t"
              style={{ borderColor: isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)" }}
            >
            </div>
          </div>
        </div>
      )}

      {ShowPendingSpaceInvitation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(45, 55, 72, 0.5)"
                : currentColors.surface,
              backdropFilter: isDarkMode ? "blur(10px)" : "none",
            }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? "white" : "black" }}
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
              {pendingSpaceInvitation?.length === 0 ? (
                <p
                  className="text-center py-4"
                  style={{ color: currentColors.textSecondary }}
                >
                  No pending invitations
                </p>
              ) : (
                pendingSpaceInvitation?.map((invite) => (
                  <div
                    key={`${invite.space_uuid || invite.c_space_uuid}-${invite.account_id}`}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(45, 55, 72, 0.3)"
                        : currentColors.surface,
                      backdropFilter: isDarkMode ? "blur(10px)" : "none",
                      borderColor: isDarkMode
                        ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                        : "black",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <SpaceCover
                          image={invite.image}
                          name={invite.space_name || invite.c_space_name}
                          members={invite.members || []}
                          className="rounded-lg border-2 border-white h-10 w-10"
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-medium"
                          style={{ color: isDarkMode ? "white" : "black" }}
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
    </div>
  );
};

export default ProfNotificationPage;
