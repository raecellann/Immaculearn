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

const ProfNotificationPage = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(location.state?.filter || "all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
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

  const pendingInvitesCount = joinRequestsByLink?.length;

  // Mock school announcements data - replace with actual data source
  const schoolAnnouncements = [
    {
      id: 1,
      title: "Faculty Meeting Notice",
      message: "Monthly faculty meeting scheduled for Friday at 3 PM.",
      date: "2024-02-20",
      priority: "high",
    },
    {
      id: 2,
      title: "New Course Materials",
      message:
        "Updated course materials are now available in the faculty portal.",
      date: "2024-02-19",
      priority: "medium",
    },
    {
      id: 3,
      title: "Research Grant Deadline",
      message: "Reminder: Research grant applications are due next Monday. Submit your proposals early.",
      date: "2024-02-18",
      priority: "high",
    },
    {
      id: 4,
      title: "Professional Development Workshop",
      message: "Free workshop on innovative teaching methods will be held this Thursday.",
      date: "2024-02-17",
      priority: "medium",
    },
    {
      id: 5,
      title: "Faculty Lounge Renovation",
      message: "Faculty lounge will be renovated next week. Temporary lounge available in Room 205.",
      date: "2024-02-16",
      priority: "low",
    },
    {
      id: 6,
      title: "New Academic Calendar",
      message: "Updated academic calendar for next semester has been published. Please review important dates.",
      date: "2024-02-15",
      priority: "high",
    },
    {
      id: 7,
      title: "Student Advisory Meeting",
      message: "Monthly student advisory committee meeting scheduled for next Tuesday at 2 PM.",
      date: "2024-02-14",
      priority: "medium",
    },
  ];

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

  if (userLoading || spaceLoading || joinRequestsByLinkLoading) {
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
                <div className="flex items-center gap-3 mb-4">
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
                      No space invitations available
                    </p>
                  </div>
                </div>

                <p
                  className="text-sm text-center py-4"
                  style={{
                    color: isDarkMode ? currentColors.textSecondary : "#666666",
                  }}
                >
                  Professors typically create their own spaces rather than
                  receiving invitations.
                </p>
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
                {schoolAnnouncements.length === 0 ? (
                  <div className="mt-3 p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
                    <div className="flex flex-col items-center gap-3">
                      <FiBell size={32} className="text-gray-400" />
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
                        key={announcement.id}
                        className="mt-3 p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(31, 41, 55, 0.5)"
                            : currentColors.surface,
                          backdropFilter: isDarkMode ? "blur(10px)" : "none",
                          borderColor: isDarkMode
                            ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                            : "black",
                        }}
                        onClick={() => setSelectedAnnouncement(announcement)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p 
                              className="text-sm font-medium"
                              style={{ color: isDarkMode ? "white" : "black" }}
                            >
                              {announcement.title}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{
                                color: isDarkMode
                                  ? currentColors.textSecondary
                                  : "#666666",
                              }}
                            >
                              {announcement.message}
                            </p>
                            <p
                              className="text-xs mt-2"
                              style={{
                                color: isDarkMode
                                  ? currentColors.textSecondary
                                  : "#666666",
                              }}
                            >
                              {announcement.date}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              announcement.priority === "high"
                                ? "bg-red-600 text-white"
                                : "bg-yellow-600 text-white"
                            }`}
                          >
                            {announcement.priority}
                          </span>
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
              className="p-4 border-b"
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
                className="text-2xl"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            style={{ 
              backgroundColor: isDarkMode
                ? "rgba(45, 55, 72, 0.5)"
                : currentColors.surface,
              backdropFilter: isDarkMode ? "blur(10px)" : "none",
            }}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                {selectedAnnouncement.title}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedAnnouncement.priority === "high"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {selectedAnnouncement.priority.toUpperCase()}
                  </span>
                  <p
                    className="text-sm"
                    style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }}
                  >
                    {selectedAnnouncement.date}
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg border"
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
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: isDarkMode ? "white" : "black" }}
                  >
                    {selectedAnnouncement.message}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-4 border-t flex justify-end"
              style={{ borderColor: currentColors.border }}
            >
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfNotificationPage;
