import React, { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  LogOut,
  Home,
  Bell,
  Calendar,
  Folder,
  ClipboardList,
  MessageCircle,
  User,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import Logout from "./logout";
import logo from "../../assets/HomePage/logo.png";
import frierenAvatar from "../../assets/HomePage/frieren-avatar.jpg";
import { useUser } from "../../contexts/user/useUser";

const AdminSidebar = () => {
  const { user, logout } = useUser();
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin-dashboard" },
    { icon: <GraduationCap size={20} />, label: "Teachers", path: "/admin-teachers" },
    { icon: <Users size={20} />, label: "Students", path: "/admin-students" },
    { icon: <Calendar size={20} />, label: "Tasks", path: "/admintaskpage" },
    { icon: <Folder size={20} />, label: "Files", path: "/admin-files" },
  ];

  const privateItems = [
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      path: "/calendar",
    },
    { icon: <ClipboardList size={20} />, label: "Grade Viewing", path: "/grade-viewing" },
    { icon: <MessageCircle size={20} />, label: "Chats", path: "/chatlist" },
  ];

  const accountItems = [
    { icon: <User size={20} />, label: "Account", path: "/accsettings" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
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
            src={user ? user.profile_pic : frierenAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">{user?.name || "Admin"}</span>
        </div>
      </div>

      {/* LOGOUT MODAL */}
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

export default AdminSidebar;
