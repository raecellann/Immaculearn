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

import { Link, useLocation } from "react-router";

import Logout from "./logout";
import logo from "../../assets/HomePage/logo.png";
import profAvatar from "../../assets/HomePage/jober.jpg";
import { useUser } from "../../contexts/user/useUser";

const ProfSidebar = () => {
  const { user } = useUser();
  const [showLogout, setShowLogout] = useState(false);

  const location = useLocation();

  const menuItems = [
    { icon: <Home size={20} />, label: "Home", path: "/prof/home" },
    { icon: <Users size={20} />, label: "Spaces", path: "/prof/spaces" },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      path: "/prof/notification",
    },
    {
      icon: <Calendar size={20} />,
      label: "List of Activities",
      path: "/prof/list-activity",
    },
    { icon: <Folder size={20} />, label: "Files", path: "/prof/files" },
  ];

  const privateItems = [
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      path: "/prof/calendar",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Grade Viewing",
      path: "/prof/grade-viewing",
    },
    { icon: <MessageCircle size={20} />, label: "Chats", path: "/prof/chats" },
  ];

  const accountItems = [
    { icon: <User size={20} />, label: "Account", path: "/prof/account" },
    { icon: <Settings size={20} />, label: "Settings", path: "/prof/settings" },
  ];

  return (
    <div
      className="h-screen w-60 text-white flex flex-col font-inter sticky top-0 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #6cadf3ff, #2c81e1, #2c81e1, #1a73da, #0066d2)",
      }}
    >
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="ImmacuLearn Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold">ImmacuLearn</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <div 
        className="flex-1 pl-8 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',  /* Firefox */
          msOverflowStyle: 'none',  /* IE and Edge */
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, Opera */
          }
        `}</style>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* Private Section */}
        <div className="mt-4">
          <h2 className="text-sm font-semibold mb-3 text-blue-100">Private</h2>
          <nav className="space-y-1">
            {privateItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>

        {/* Account Section */}
        <div className="mt-4 space-y-1">
          {accountItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
          
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log Out Account"
            onClick={() => setShowLogout(true)}
          />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="px-6 py-2 pt-3 border-t border-blue-500">
        <div className="flex items-center gap-3">
          <img
            src={user?.profile_pic || profAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">{user?.name || "Jober Reyes"}</span>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50">
          <Logout onClose={() => setShowLogout(false)} />
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, path, onClick, active }) => {
  const Component = path ? Link : "div";

  return (
    <Component
      to={path}
      onClick={onClick}
      className={`
        relative flex items-center space-x-3 py-3 text-xs font-medium
        rounded-l-full cursor-pointer overflow-hidden
        transition-all duration-1000

        before:absolute before:inset-0
        before:bg-[rgba(255,255,255,0.05)]
        before:origin-right before:scale-x-0
        before:transition-transform before:duration-1000 

        hover:before:scale-x-100

        ${active 
          ? "bg-[#161A20] text-white shadow-lg" 
          : "text-blue-100 hover:bg-[#161A20] hover:text-white before:hover:scale-x-100"
        }
      `}
      style={{ paddingLeft: '1.25rem' }}
    >
      <div className="relative z-10 flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
    </Component>
  );
};

export default ProfSidebar;