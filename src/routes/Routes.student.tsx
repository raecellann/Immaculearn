import React from "react";
import { Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import HomePage from "../pages/HomePage/homepage.jsx";
import ProfilePage from "../pages/AccountSettings/accountsettingspage.jsx";
import GradeViewing from "../pages/GradeViewing/gradeViewing.jsx";

import TaskPage from "../pages/Task/task.jsx";
import ViewAllTaskPage from "../pages/Task/components/ViewAllTaskPage.jsx";
import TaskViewPage from "../pages/Task/components/TaskViewPage.jsx";

import NotificationPage from "../pages/Notifications/notification.jsx";
import FilePage from "../pages/Files/files.jsx";
import ViewFilePage from "../pages/Files/ViewFiles.jsx";
import ViewAllFilesPage from "../pages/ViewAllFiles/view-all-files";

import ChatList from "../pages/User_chats/user_chats";
import Calendar from "../pages/Calendar/Calendar.jsx";
import Setting from "../pages/Settings/settings.jsx";
import SettingsSelectionPage from "../pages/SettingsSelection/settingsselectionpage.jsx";
import SpaceSettingsPage from "../pages/SpaceSettings/spacesettingspage.jsx";
import IndividualSpaceSettings from "../pages/SpaceSettings/individualspacesettings.jsx";
import CreateDocumentPage from "../pages/Create-Document/CreateDocument.jsx";

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

    key: "/task",
    path: "/task/:space_uuid/:space_name",
    element: <ViewAllTaskPage />,
  },
  {
    key: "/task-view",
    path: "/task-view/:space_uuid/:space_name/:task_name",
    element: <TaskViewPage />,
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
    key: "/files",
    path: "/files",
    element: <FilePage />,
  },

  {
    key: "/files/:space_name/:space_uuid",
    path: "/files/:space_name/:space_uuid",
    element: <ViewAllFilesPage />,
  },
  {
    key: "/files/:space_name/:space_uuid/:file_name/:file_uuid",
    path: "/files/:space_name/:space_uuid/:file_name/:file_uuid",
    element: <ViewFilePage />,
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
    key: "/space-settings",
    path: "/space-settings",
    element: (
      <ProtectedRoute>
        <SpaceSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    key: "/space-settings-individual",
    path: "/space-settings/:spaceUuid/:spaceName",
    element: (
      <ProtectedRoute>
        <IndividualSpaceSettings />
      </ProtectedRoute>
    ),
  },

  {
    key: "open-document",
    path: "/space/:space_uuid/:space_name/:task_id/:task_title/:file_uuid/:file_name",
    element: (
      <ProtectedRoute>
        <CreateDocumentPage />
      </ProtectedRoute>
    ),
  },
];
