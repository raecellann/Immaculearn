// Routes.student.tsx
import React from "react";
import { Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import HomePage from "../pages/HomePage/homepage.jsx";
import ProfilePage from "../pages/AccSettings/accsettingspage.jsx";
import GradeViewing from "../pages/GradeViewing/gradeViewing.jsx";
import TaskPage from "../pages/Task/task.jsx";
import NotificationPage from "../pages/Notifications/notification.jsx";
import FilePage from "../pages/Files/files.jsx";
import ChatList from "../pages/User_chats/user_chats";
import ViewFilePage from "../pages/ViewFiles/ViewFiles.jsx";

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
    key: "/files",
    path: "/files",
    element: <FilePage />,
  },
  {
    key: "/chatlist",
    path: "/chatlist",
    element: <ChatList />,
  },
  {
    key: "/view-files",
    path: "/view-files",
    element: <ViewFilePage />,
  },
  
];
