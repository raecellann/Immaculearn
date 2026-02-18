import React, { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";
import { FiUsers } from "react-icons/fi";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import MainLoading from "../../components/LoadingComponents/mainLoading";

const ProfNotificationPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { user, isLoading: userLoading } = useUser();
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    useJoinRequests,
    acceptJoinRequest,
    declineJoinRequest,
    isLoading: spaceLoading
  } = useSpace();

  /* =========================
     GET ALL OWNED SPACES
  ========================= */
  const ownedSpaces = useMemo(() => {
    const allSpaces = [
      ...(userSpaces || []),
      ...(courseSpaces || []),
      ...(friendSpaces || [])
    ];

    return allSpaces.filter(space => space.creator === user?.id);
  }, [userSpaces, courseSpaces, friendSpaces, user]);

  /* =========================
     FETCH JOIN REQUESTS PER SPACE
  ========================= */
  const allJoinRequests = ownedSpaces.flatMap(space => {
    const { data = [] } = useJoinRequests(space.space_uuid);
    return data.map(request => ({
      ...request,
      space_uuid: space.space_uuid,
      space_name: space.space_name
    }));
  });

  const pendingInvitesCount = allJoinRequests.length;

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

  if (userLoading || spaceLoading) {
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

          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1E242E] p-5 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiUsers size={22} />
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
                allJoinRequests.map(invite => (
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
                        <p className="text-sm text-gray-400">
                          {invite.email}
                        </p>
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

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfNotificationPage;
