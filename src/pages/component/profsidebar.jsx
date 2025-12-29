import React, { useState } from "react";
import {
  Home,
  Users,
  Bell,
  Calendar,
  Folder,
  ClipboardList,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Logout from "./logout";

const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [
    { icon: <Home size={20} />, label: "Home" },
    { icon: <Users size={20} />, label: "Spaces" },
    { icon: <Bell size={20} />, label: "Notifications" },
    { icon: <Calendar size={20} />, label: "List of Activities" },
    { icon: <Folder size={20} />, label: "Files" },
  ];

  return (
    <div
      className="h-screen w-60 text-white flex flex-col justify-between font-inter sticky top-0"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #4d9bef, #3d8ee8, #2c81e1, #1a73da, #0066d2)",
      }}
    >
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          display: none;
        }
        .sidebar-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      {/* Top Logo and Menu - Scrollable */}
      <div className="flex-1 flex flex-col items-start p-5 overflow-y-auto sidebar-scroll">
        <h1 className="font-bold text-lg flex items-center space-x-2 mb-6">
          <img
            src="src/assets/HomePage/logo.png"
            alt="ImmacuLearn Logo"
            className="w-5 h-5 inline-block"
          />
          <span>ImmacuLearn</span>
        </h1>

        {/* Main Menu */}
        <nav className="w-full space-y-1 mb-5">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </nav>

        {/* Private Section */}
        <div className="w-full border-t border-blue-300/40 pt-3 mb-5">
          <p className="text-[11px] uppercase text-gray-100 tracking-wide mb-2 font-semibold">
            Private
          </p>

          <SidebarItem
            icon={<ClipboardList size={20} />}
            label="Grade Viewing"
            isActive={activeItem === "Grade Viewing"}
            onClick={() => setActiveItem("Grade Viewing")}
          />
          <SidebarItem
            icon={<MessageCircle size={20} />}
            label="Chats"
            isActive={activeItem === "Chats"}
            onClick={() => setActiveItem("Chats")}
          />
        </div>

        {/* Account Section */}
        <div className="w-full border-t border-blue-300/40 pt-3 space-y-1">
          <SidebarItem
            icon={<User size={20} />}
            label="Account"
            isActive={activeItem === "Account"}
            onClick={() => setActiveItem("Account")}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            isActive={activeItem === "Settings"}
            onClick={() => setActiveItem("Settings")}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log Out Account"
            isActive={activeItem === "Log Out Account"}
            onClick={() => setShowLogout(true)}
          />
        </div>
      </div>

      {/* Profile Account */}
      <div className="p-4 border-t border-blue-300/40 flex items-center space-x-3 flex-shrink-0">
        <img
          src="/src/assets/HomePage/jober.jpg"
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover border border-white/20"
        />
        <span className="text-sm font-semibold">Jober Reyes</span>
      </div>

      {/* Logout Modal */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

const SidebarItem = ({ icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`relative flex items-center space-x-3 px-5 py-2.5 text-xs font-medium cursor-pointer transition-all duration-150 rounded-md ${
      isActive ? "text-white" : "text-white/90"
    }`}
  >
    {/* Active Background */}
    <div
      className={`absolute left-3 top-0 bottom-0 w-[88%] rounded-full transition-all duration-200 ${
        isActive ? "bg-black" : ""
      }`}
    ></div>

    <div className="relative flex items-center space-x-3 z-10">
      {icon}
      <span>{label}</span>
    </div>
  </div>
);

export default Sidebar;
