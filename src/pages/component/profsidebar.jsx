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
      className="h-screen w-60 text-white flex flex-col justify-between font-inter sticky top-0"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #4d9bef, #3d8ee8, #2c81e1, #1a73da, #0066d2)",
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
      <div className="flex-1 pl-8 overflow-hidden">
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
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
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
        flex items-center space-x-3 py-3 text-xs font-medium
        rounded-l-full cursor-pointer transition-all duration-200
        ${active 
          ? "bg-[#161A20] text-white" 
          : "text-blue-100 hover:bg-[#161A20] hover:text-white"
        }
      `}
      style={{ paddingLeft: '1.25rem' }}
    >
      {icon}
      <span>{label}</span>
    </Component>
  );
};

export default ProfSidebar;