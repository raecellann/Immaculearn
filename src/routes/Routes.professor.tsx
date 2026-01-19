import React from "react";
import { Routes, Route } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import ProfHomePage from "../pages/prof-HomePage/profhomepage.jsx";
import ProfChatsPage from "../pages/prof-Chats/profchats.jsx";
import ProfProfilePage from "../pages/prof-AccSettings/profaccsettingspage.jsx";
import ProfFilesBySubject from "../pages/prof-Files/ProfFilesBySubject";
import ThesisSpace from "../pages/Prof-Space/Thesis-space.jsx";
import ProfTaskPage from "../pages/Prof-Space/ProfTaskPage";
import ProfFilesShared from "../pages/Prof-Space/ProfFilesShared";
import ProfPeoplePage from "../pages/Prof-Space/ProfPeoplePage";
import { SpaceProvider } from "../contexts/space/spaceContextProvider";
import { useUser } from "../contexts/user/useUser";

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
      <Route path="acc-settings" element={<ProfProfilePage />} />
      <Route path="files-by-subject" element={<ProfFilesBySubject />} />
      {/* <Route path="files-by-subject" element={<ProfMain />} /> */}

      <Route
        path="chats"
        element={
            <ProfChatsPage />
        }
      />
      <Route
        path="space-thesis"
        element={
          <SpaceProvider>
              <ThesisSpace />
          </SpaceProvider>
        }
      />
      <Route
        path="space-thesis/tasks"
        element={
          <SpaceProvider>
              <ProfTaskPage />
          </SpaceProvider>
        }
      />
      <Route
        path="space-thesis/files"
        element={
          <SpaceProvider>
              <ProfFilesShared />
          </SpaceProvider>
        }
      />
      <Route
        path="space-thesis/people"
        element={
          <SpaceProvider>
              <ProfPeoplePage />
          </SpaceProvider>
        }
      />
    </Routes>
  );
};
