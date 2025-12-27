import React, { useState } from "react";
import Sidebar from "../component/sidebar";

const NotificationPage = ({ notifications = [] }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Default notifications for demo
  const defaultNotifications = [
    { id: 1, type: "invite", sender: "Zeldrick", message: "Zeldrick invited you to join their space" },
    { id: 2, type: "file", sender: "Nathaniel", message: "Nathaniel shared a file with you" },
    { id: 3, type: "task", sender: "Wilson", message: "Wilson assigned you a task in their space" },
    { id: 4, type: "invite", sender: "Zeldrick", message: "Zeldrick invited you to join their space" },
    { id: 5, type: "file", sender: "Nathaniel", message: "Nathaniel shared a file with you" },
    { id: 6, type: "task", sender: "Wilson", message: "Wilson assigned you a task in their space" },
  ];

  const notificationList = notifications.length > 0 ? notifications : defaultNotifications;

  const getIconEmoji = (type) => {
    switch (type) {
      case "invite": return "👥";
      case "file": return "📁";
      case "task": return "📋";
      default: return "🔔";
    }
  };

  const handleAcceptInvitation = (id) => console.log("Accepted", id);
  const handleDecline = (id) => console.log("Declined", id);
  const handleOpenFile = (id) => console.log("Opened file", id);
  const handleOpenTask = (id) => console.log("Opened task", id);

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header */}
        <div className="lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
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
                  <span className="text-sm sm:text-base">{notif.message}</span>
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
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationPage;
