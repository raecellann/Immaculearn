import React from "react";
import { Routes, Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import ProfHomePage from "../pages/prof-HomePage/profhomepage.jsx";
import ProfChatsPage from "../pages/prof-Chats/profchats.jsx";
import ProfProfilePage from "../pages/prof-AccSettings/profaccsettingspage.jsx";
import ProfFilesBySubject from "../pages/prof-Files/ProfFilesBySubject";
// import ThesisSpace from "../pages/Prof-Space/Thesis-space.jsx";
import ProfStreamPage from "../pages/Prof-Space/ProfStreamPage.jsx";
import ProfTaskPage from "../pages/Prof-Space/ProfTaskPage";
import ProfFilesShared from "../pages/Prof-Space/ProfFilesShared";
import ProfPeoplePage from "../pages/Prof-Space/ProfPeoplePage";
import { SpaceProvider } from "../contexts/space/spaceContextProvider";
import ViewFilePage from "../pages/Files/components/ViewFile.jsx";

import ProfCreateSpace from "../pages/Prof-MainSpace/components/prof-create-space.jsx";
import { useUser } from "../contexts/user/useUser";
import ProfSpacePage from "../pages/Prof-MainSpace/profmainspace.jsx";
import ProfCreateClassroomSpace from "../pages/Prof-MainSpace/components/prof-create-classroom-space.jsx";
import ProfNotificationPage from "../pages/prof-Notifications/profnotification.jsx";

import ProfListActivityPage from "../pages/prof-ListActivities/proflistactivitypage.jsx";
import ProfViewAllActivityPage from "../pages/prof-ListActivities/components/ProfViewAllActivities.jsx";
import ProfViewActivityPage from "../pages/prof-ListActivities/components/ProfViewActivity.jsx";

import ProfFilePage from "../pages/prof-Files/proffiles.jsx";
import ProfViewFiles from "../pages/prof-Files/components/ProfViewAllFiles.jsx";
import ProfCalendarPage from "../pages/Prof-Calendar/ProfCalendar.jsx";
import ProfGradeRecordPage from "../pages/prof-GradeViewing/profgradeviewing.jsx";
import ProfArchiveClass from "../pages/prof-Archiveclass/ProfArchiveClass.jsx";
import ProfSettingsPage from "../pages/Prof-Settings/profsettings.jsx";
import ProfilePage from "../pages/AccountSettings/accountsettingspage.jsx";
import SettingsSelectionPage from "../pages/SettingsSelection/settingsselectionpage.jsx";
import SpaceSettingsPage from "../pages/SpaceSettings/spacesettingspage.jsx";
import IndividualSpaceSettings from "../pages/SpaceSettings/individualspacesettings.jsx";
import CreateDocumentPage from "../pages/Create-Document/CreateDocument.jsx";
export const ProfRoutes = () => {
  const { user } = useUser();
  if (!user) return null; // Or a loading spinner

  const spaceUuid = "example-uuid"; // You can replace with real dynamic value

  return (
    <Routes>
      <Route
        path="home"
        element={
          <ProtectedRoute>
            <ProfHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="spaces"
        element={
          <ProtectedRoute>
            <ProfSpacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create/space"
        element={
          <ProtectedRoute>
            <ProfCreateSpace />
          </ProtectedRoute>
        }
      />
      <Route
        path="spaces/classroom/create"
        element={
          <ProtectedRoute>
            <ProfCreateClassroomSpace />
          </ProtectedRoute>
        }
      />
      
      <Route path="acc-settings" element={<ProfProfilePage />} />
      <Route path="files" element={<ProfFilePage />} />

      
      <Route path="files-by-subject" element={<ProfFilesBySubject />} />

      {/* <Route path="files-by-subject" element={<ProfMain />} /> */}

      <Route
        path="chats"
        element={
            <ProfChatsPage />
        }
      />

      <Route
        path="notification"
        element={
            <ProfNotificationPage />
        }
      />
      
      <Route
        path="list-activity"
        element={
            <ProfListActivityPage />
        }
      />
      <Route
        path="list-activity/:space_uuid/:space_name"
        element={
            <ProfViewAllActivityPage />
        }
      />
      <Route
        path="list-activity/:space_uuid/:space_name/:task_id/:task_name"
        element={
            <ProfViewActivityPage />
        }
      />
      
      <Route
        path="notification"
        element={
            <ProfNotificationPage />
        }
      />

      <Route 
        

        path="/files/:space_name/:space_uuid/:file_name/:file_uuid"
        element={
          <ProtectedRoute>
            <ViewFilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 

        path="files/:space_name/:space_uuid"
        element={
          <ProtectedRoute>
            <ProfViewFiles />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="calendar"
        element={
            <ProfCalendarPage />
        }
      />
      
      <Route
        path="grade-viewing"
        element={
            <ProfGradeRecordPage />
        }
      />
      
      <Route
        path="archived-classes"
        element={
            <ProfArchiveClass />
        }
      />

      <Route
        path="account"
        element={
            <ProfProfilePage />
        }
      />
      
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <SettingsSelectionPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="prof-settings"
        element={
            <ProfSettingsPage />
        }
      />
      
      <Route
        path="/space-settings"
        element={
          <ProtectedRoute>
            <SpaceSettingsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/space-settings/:spaceUuid/:spaceName"
        element={
          <ProtectedRoute>
            <IndividualSpaceSettings />
          </ProtectedRoute>
        }
      />


      <Route
        path="/space/create"
        element={
          <ProtectedRoute>
            <ProfCreateSpace />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/space/:space_uuid/:space_name"
        element={
          <SpaceProvider>
              <ProfStreamPage />
          </SpaceProvider>
        }
      />
      <Route
        path="/space/:space_uuid/:space_name/tasks"
        element={
          <SpaceProvider>
              <ProfTaskPage />
          </SpaceProvider>
        }
      />
      <Route
      
        path="/space/:space_uuid/:space_name/files"
        element={
          <SpaceProvider>
              <ProfFilesShared />
          </SpaceProvider>
        }
      />
      <Route
        path="/space/:space_uuid/:space_name/people"
        element={
          <SpaceProvider>
              <ProfPeoplePage />
          </SpaceProvider>
        }
      />
      <Route
        path="/space/:space_uuid/:space_name/files/:file_uuid/:file_name"
        element={
          <SpaceProvider>
              <CreateDocumentPage />
          </SpaceProvider>
        }
      />

      
    </Routes>
  );
};
