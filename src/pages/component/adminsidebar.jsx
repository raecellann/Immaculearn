import React, { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import Logout from "./logout";

const AdminSidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const location = useLocation();

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/admin-dashboard",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Teachers",
      path: "/admin-teachers",
    },
    {
      icon: <Users size={20} />,
      label: "Students",
      path: "/admin-students",
    },
  ];

  return (
    <div
      className="h-screen w-60 text-white flex flex-col justify-between font-inter overflow-hidden z-50 fixed top-0 left-0"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #4d9bef, #3d8ee8, #2c81e1, #1a73da, #0066d2)",
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* TOP SECTION */}
      <div className="flex-1 flex flex-col items-start p-5 overflow-y-hidden overflow-x-hidden">
        {/* TITLE */}
        <h1 className="font-bold text-lg flex items-center space-x-2 mb-6 flex-shrink-0">
          <img
            src="/src/assets/HomePage/logo.png"
            alt="ImmacuLearn Logo"
            className="w-5 h-5 inline-block"
          />
          <span>ImmacuLearn</span>
        </h1>

        {/* MAIN MENU */}
        <nav className="w-full space-y-1 mb-5 overflow-y-hidden overflow-x-hidden">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              isHovered={hoveredItem === item.label}
              onHover={() => setHoveredItem(item.label)}
            />
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="w-full border-t border-blue-300/40 pt-3 space-y-1 overflow-y-hidden overflow-x-hidden">
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log Out"
            onClick={() => setShowLogout(true)}
            isHovered={hoveredItem === "Log Out"}
            onHover={() => setHoveredItem("Log Out")}
          />
        </div>
      </div>

      {/* PROFILE */}
      <div className="p-4 border-t border-blue-300/40 flex items-center space-x-3 flex-shrink-0 overflow-y-hidden overflow-x-hidden">
        <img
          src="/src/assets/HomePage/frieren-avatar.jpg"
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover border border-white/20"
        />
        <span className="text-sm font-semibold">Admin Account</span>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  path,
  onClick,
  active,
  isHovered,
  onHover,
}) => {
  const Component = path ? Link : "div";

  return (
    <Component
      to={path}
      onClick={onClick}
      onMouseEnter={onHover}
      className={`relative flex items-center space-x-3 px-5 py-2.5 text-xs font-medium
        transition-all duration-150 rounded-md cursor-pointer
        text-white hover:text-white
        ${isHovered ? "bg-black" : ""}
        ${active ? "bg-black/25" : ""}
      `}
    >
      <div className="relative flex items-center space-x-3 z-10">
        {icon}
        <span>{label}</span>
      </div>
    </Component>
  );
};

export default AdminSidebar;
