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
import frierenAvatar from "../../assets/HomePage/frieren-avatar.jpg";
import { useUser } from "../../contexts/user/useUser";

const Sidebar = () => {
  const { user, logout } = useUser();
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={20} />, label: "Home", path: "/home" },
    { icon: <Users size={20} />, label: "Spaces", path: "/space" },
    { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
    { icon: <Calendar size={20} />, label: "Tasks", path: "/task" },
    { icon: <Folder size={20} />, label: "Files", path: "/files" },
  ];

  const privateItems = [
    { icon: <ClipboardList size={20} />, label: "Grade Viewing", path: "/grade-viewing" },
    { icon: <MessageCircle size={20} />, label: "Chats", path: "/chatlist" },
  ];

  const accountItems = [
    { icon: <User size={20} />, label: "Account", path: "/accsettings" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];


  return (
    <div
      className="h-screen w-60 text-white flex flex-col justify-between font-inter sticky top-0"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #4d9bef, #3d8ee8, #2c81e1, #1a73da, #0066d2)",
      }}
    >
      <div className="flex-1 flex flex-col items-start p-5 overflow-y-auto">
        <h1 className="font-bold text-lg flex items-center space-x-2 mb-6">
          <img src={logo} alt="ImmacuLearn Logo" className="w-5 h-5" />
          <span>ImmacuLearn</span>
        </h1>

        <nav className="w-full space-y-1 mb-5">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="w-full border-t border-blue-300/40 pt-3 mb-5">
          <p className="text-[11px] uppercase tracking-wide mb-2 font-semibold">
            Private
          </p>
          {privateItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.path}
            />
          ))}
        </div>

        <div className="w-full border-t border-blue-300/40 pt-3 space-y-1">
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

      <div className="p-4 border-t border-blue-300/40 flex items-center space-x-3">
        <img
          src={user ? user.profile_pic : frierenAvatar}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover border border-white/20"
        />
        <span className="text-sm font-semibold">{user?.name}</span>
      </div>

      {showLogout && (
        <Logout
          onClose={() => setShowLogout(false)}
          onLogOut={() => logout(user?.id)}
        />
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
        flex items-center space-x-3 px-5 py-2.5 text-xs font-medium
        rounded-md cursor-pointer transition-all duration-150
        text-white
        hover:bg-black
        ${active ? "bg-black/25" : ""}
      `}
    >
      {icon}
      <span>{label}</span>
    </Component>
  );
};

export default Sidebar;
