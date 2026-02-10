// Routes.student.tsx
import React from "react";
import { Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import HomePage from "../pages/HomePage/homepage.jsx";
import ProfilePage from "../pages/AccountSettings/accountsettingspage.jsx";
import GradeViewing from "../pages/GradeViewing/gradeViewing.jsx";
import TaskPage from "../pages/Task/task.jsx";
import NotificationPage from "../pages/Notifications/notification.jsx";
import FilePage from "../pages/Files/files.jsx";
import ChatList from "../pages/User_chats/user_chats";
import ViewFilePage from "../pages/ViewFiles/ViewFiles.jsx";
import Calendar from "../pages/Calendar/Calendar.jsx";
import Setting from "../pages/Settings/settings.jsx";
import SettingsSelectionPage from "../pages/SettingsSelection/settingsselectionpage.jsx";
import SpaceSettingsPage from "../pages/SpaceSettings/spacesettingspage.jsx";

const ChatRouteWrapper = () => {

  return (
      <ChatList />
  );
};

export const StudentRoutes = [

  {
    key: "/home",
    path: "/home",
    element: <HomePage />,
  },
  {
    key: "/accsettings",
    path: "/accsettings",
    element: <ProfilePage />,
  },
  {
    key: "/calendar",
    path: "/calendar",
    element: <Calendar />,
  },
  {
    key: "/grade-viewing",
    path: "/grade-viewing",
    element: <GradeViewing />,
  },
  {
    key: "/task",
    path: "/task",
    element: <TaskPage />,
  },
  {
    key: "/notifications",
    path: "/notifications",
    element: <NotificationPage />,
  },
  
  {
    key: "/chatlist",
    path: "/chatlist",
    element: <ChatRouteWrapper />,
  },
  {
    key: "/settings",
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    key: "/spacesettings",
    path: "/spacesettings",
    element: (
      <ProtectedRoute>
        <SpaceSettingsPage />
      </ProtectedRoute>
    ),
  },
  
];
