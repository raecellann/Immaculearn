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
    { icon: <Home size={20} />, label: "Dashboard", path: "/home" },
    { icon: <Users size={20} />, label: "Students", path: "/space" },
    { icon: <GraduationCap size={20} />, label: "Teachers", path: "/files" },
  ];

  const privateItems = [];
  const accountItems = [];

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
            src={user ? user.profile_pic : frierenAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">{user?.name || "User"}</span>
        </div>
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
        relative flex items-center space-x-3 py-3 text-xs font-medium
        rounded-l-full cursor-pointer overflow-hidden
        transition-all duration-1000

        before:absolute before:inset-0
        before:bg-[#161A20]
        before:origin-right before:scale-x-0
        before:transition-transform before:duration-1000

        hover:before:scale-x-100

        ${active 
          ? "bg-[#161A20] text-white shadow-lg" 
          : "text-blue-100 hover:bg-[#161A20] hover:text-white hover:shadow-md"
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

export default Sidebar;
