import React, { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  LogOut,
  Bell,
  School,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router";
import Logout from "./logout";
import logo from "../../assets/HomePage/logo.png";
import frierenAvatar from "../../assets/HomePage/frieren-avatar.jpg";
import { useAdmin } from "../../contexts/admin/useAdmin";

const AdminSidebar = ({ isMinimized = false, onToggleMinimize }) => {
  const { admin, logout } = useAdmin();
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  // Load minimize state from localStorage on mount
  const [localMinimized, setLocalMinimized] = useState(false);

  // Update localStorage when minimize state changes
  const handleToggleMinimize = () => {
    const newState = !localMinimized;
    setLocalMinimized(newState);
    // localStorage.setItem('adminSidebarMinimized', JSON.stringify(newState));
    if (onToggleMinimize) {
      onToggleMinimize();
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <Users size={20} />, label: "Students", path: "/admin/students" },
    { icon: <GraduationCap size={20} />, label: "Teachers", path: "/admin/teachers" },
    { icon: <Bell size={20} />, label: "Announcement", path: "/admin/announcement" },
    { icon: <School size={20} />, label: "Academic Term", path: "/admin/academic-term" },
  ];

  const privateItems = [];
  const accountItems = [];

  return (
    <div
      className={`
        h-screen text-white flex flex-col font-inter
        sticky top-0 overflow-hidden transition-all duration-300
        bg-gradient-to-b from-[#6cadf3] via-[#2c81e1] to-[#0066d2]
        ${localMinimized ? "lg:w-20" : "w-64 lg:w-60"}
      `}
    >
      {/* Logo and Minimize Button */}
      <div className="p-6 flex items-center justify-between">
        <div className={`flex items-center space-x-2 ${localMinimized ? "hidden lg:hidden" : ""}`}>
          <img src={logo} alt="ImmacuLearn Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold">ImmacuLearn</h1>
        </div>
        <button
          onClick={handleToggleMinimize}
          className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {localMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div
        className="flex-1 pl-5 overflow-y-auto"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE & Edge
        }}
      >
        {/* Hide scrollbar for Chrome/Safari/Edge */}
        <style>
          {`
            .sidebar-scroll::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        <div className="sidebar-scroll">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={location.pathname === item.path}
                isMinimized={localMinimized}
              />
            ))}
          </nav>

          {/* Private */}
          <div className={`mt-4 ${localMinimized ? "hidden" : ""}`}>
            <h2 className="text-sm font-semibold mb-3 text-blue-100">
              Private
            </h2>
            <nav className="space-y-1">
              {privateItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  active={location.pathname === item.path}
                  isMinimized={localMinimized}
                />
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="mt-4 space-y-1">
            {accountItems.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={location.pathname === item.path}
                isMinimized={localMinimized}
              />
            ))}

            <SidebarItem
              icon={<LogOut size={20} />}
              label="Log Out Account"
              onClick={() => setShowLogout(true)}
              isMinimized={localMinimized}
            />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className={`px-6 py-2 pt-3 border-t border-blue-500 ${localMinimized ? "lg:text-center" : ""}`}>
        <div className={`flex items-center gap-3 ${localMinimized ? "lg:flex-col" : ""}`}>
          <img
            src={frierenAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          
          <div className={`flex flex-col ${localMinimized ? "hidden lg:hidden" : ""}`}>
            <span className="text-sm font-medium">
              {admin?.fullname || "Admin"}
            </span>
            <span className="text-xs text-gray-400">
              {admin?.role || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {showLogout && (
        <Logout
          onClose={() => setShowLogout(false)}
          onLogOut={() => logout()}
        />
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, path, onClick, active, isMinimized }) => {
  const Component = path ? Link : "div";

  return (
    <Component
      to={path}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 py-3 text-xs font-medium
        rounded-l-full cursor-pointer overflow-hidden
        transition-all duration-700 group

        before:absolute before:inset-0
        before:bg-[rgba(255,255,255,0.05)]
        before:origin-right before:scale-x-0
        before:transition-transform before:duration-700

        hover:before:scale-x-100

        ${
          active
            ? "bg-gray-50 text-gray-900 shadow-lg"
            : "text-blue-100 hover:text-white hover:shadow-md before:hover:scale-x-100"
        }
        ${isMinimized ? "lg:px-2 lg:justify-center" : "pl-5"}
      `}
      title={isMinimized ? label : ""}
    >
      <div className="relative z-10 flex items-center gap-3">
        {icon}
        <span className={`${isMinimized ? "hidden lg:hidden" : ""}`}>{label}</span>
      </div>
      
      {/* Tooltip for minimized state */}
      {isMinimized && (
        <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Component>
  );
};

export default AdminSidebar;
