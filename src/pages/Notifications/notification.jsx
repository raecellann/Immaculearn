import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";

const NotificationPage = ({ notifications = [] }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // 🔹 ADDED: hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  // Default notifications for demo
  const defaultNotifications = [
    { id: 1, type: "invite", sender: "Zeldrick", message: "Zeldrick invited you to join their space" },
    { id: 2, type: "file", sender: "Nathaniel", message: "Nathaniel shared a file with you" },
    { id: 3, type: "task", sender: "Wilson", message: "Wilson assigned you a task in their space" },
    { id: 4, type: "comment", sender: "Raecell", message: "Raecell commented on your activity" },
    { id: 5, type: "invite", sender: "Zeldrick", message: "Zeldrick invited you to join their space" },
    { id: 6, type: "file", sender: "Nathaniel", message: "Nathaniel shared a file with you" },
    { id: 7, type: "comment", sender: "John", message: "John commented on your post" },
    { id: 8, type: "task", sender: "Wilson", message: "Wilson assigned you a task in their space" },
  ];

  const notificationList = notifications.length > 0 ? notifications : defaultNotifications;

  const getIconEmoji = (type) => {
    switch (type) {
      case "invite": return "👥";
      case "file": return "📁";
      case "task": return "📋";
      case "comment": return "💬";
      default: return "🔔";
    }
  };

  const handleAcceptInvitation = (id) => console.log("Accepted", id);
  const handleDecline = (id) => console.log("Declined", id);
  const handleOpenFile = (id) => console.log("Opened file", id);
  const handleOpenTask = (id) => console.log("Opened task", id);
  const handleViewComment = (id) => console.log("Viewed comment", id);

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          {/* Desktop Header */}
          <h1 className="hidden lg:block text-4xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
            Notifications
          </h1>

          <div className="w-full max-w-3xl mx-auto space-y-4">
            {notificationList.map((notif) => (
              <div
                key={notif.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1E242E] p-4 rounded-lg gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getIconEmoji(notif.type)}</span>
                  <span className="text-base sm:text-lg font-medium">{notif.message}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {notif.type === "invite" ? (
                    <>
                      <button
                        className="text-red-500 bg-transparent border border-transparent hover:border-red-500 hover:text-red-400 px-3 py-1 rounded-md transition text-sm whitespace-nowrap"
                        onClick={() => handleDecline(notif.id)}
                      >
                        Decline
                      </button>
                      <button
                        className="text-green-400 bg-transparent border border-transparent hover:border-green-400 hover:text-green-300 px-3 py-1 rounded-md transition text-sm whitespace-nowrap"
                        onClick={() => handleAcceptInvitation(notif.id)}
                      >
                        Accept Invitation
                      </button>
                    </>
                  ) : notif.type === "file" ? (
                    <button
                      className="text-green-400 hover:underline bg-transparent text-sm whitespace-nowrap"
                      onClick={() => handleOpenFile(notif.id)}
                    >
                      Open file
                    </button>
                  ) : notif.type === "task" ? (
                    <button
                      className="text-green-400 hover:underline bg-transparent text-sm whitespace-nowrap"
                      onClick={() => handleOpenTask(notif.id)}
                    >
                      View Task
                    </button>
                  ) : notif.type === "comment" ? (
                    <button
                      className="text-blue-400 hover:underline bg-transparent text-sm whitespace-nowrap"
                      onClick={() => handleViewComment(notif.id)}
                    >
                      View Comment
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default NotificationPage;