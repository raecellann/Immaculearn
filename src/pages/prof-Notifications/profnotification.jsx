import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";

const ProfNotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const notifications = [
    {
      id: 1,
      name: "Zeldrick Jesus Delos Santos",
      comment: "Okay na po, Sir Jober",
      activity: "Week 8 Activity in Operating System Space",
      date: "Oct 20",
      unread: true,
      image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    {
      id: 2,
      name: "Raecell Ann Galvez",
      comment: "Okay na po, Sir Jober",
      activity: "Week 8 Activity in CS Thesis 2 Space",
      date: "Oct 20",
      unread: false,
      image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    {
      id: 3,
      name: "Wilson ESmabe",
      comment: "Okay na po, Maam Susan",
      activity: "Week 2 Activity in MODTECH Space",
      date: "Oct 20",
      unread: true,
      image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    {
      id: 4,
      name: "Wilson ESmabe",
      comment: "Okay na po, Maam Susan",
      activity: "Week 2 Activity in MODTECH Space",
      date: "Oct 20",
      unread: false,
      image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    {
      id: 5,
      name: "Wilson ESmabe",
      comment: "Okay na po, Maam Susan",
      activity: "Week 2 Activity in MODTECH Space",
      date: "Oct 20",
      unread: true,
      image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
  ];

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => n.unread)
      : notifications;

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457] transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0"
            >
              ☰
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
          </div>
        </div>

        {/* 🔽 Added proper spacing so sticky header doesn’t cover tabs on tablets/mobile */}
        <div className="flex-1 p-4 md:p-15 pt-[5.5rem] lg:pt-10 overflow-y-auto">
          {/* Desktop Header */}
          <h1 className="hidden lg:block text-4xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
            Notifications
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 border-b border-gray-600 pb-3 mb-6 text-gray-300 text-xs sm:text-sm">
            <button
              className={`${
                activeTab === "all" ? "text-white font-semibold" : ""
              } bg-transparent hover:text-white`}
              onClick={() => setActiveTab("all")}
            >
              All Notifications
            </button>
            <button
              className={`${
                activeTab === "unread" ? "text-white font-semibold" : ""
              } bg-transparent hover:text-white`}
              onClick={() => setActiveTab("unread")}
            >
              Unread Notifications
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-gray-700 pb-4 gap-3"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={notif.image}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                      <span className="font-semibold">{notif.name}</span>{" "}
                      commented in{" "}
                      <span className="font-semibold text-white">
                        {notif.activity}
                      </span>
                    </p>
                    <p className="text-gray-300 text-sm sm:text-base mt-1">
                      {notif.comment}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-[13px] md:text-sm sm:self-start">
                  <span>{notif.date}</span>
                  {notif.unread && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfNotificationPage;
