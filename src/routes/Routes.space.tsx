// Routes.space.tsx
import { Route } from "react-router";
import UserPage from "../pages/UserSpace/zj-space.jsx";
import UserTaskPage from "../pages/UserSpace/UserTaskPage.jsx";
import UserFilesShared from "../pages/UserSpace/UserFilesShared.jsx";

import { SpaceProvider } from "../contexts/space/spaceContextProvider.js";
import { FileProvider } from "../contexts/file/fileContextProvider.js";
import UserPeoplePage from "../pages/UserSpace/UserPeoplePage.jsx";
// import AdminTaskPage from "../pages/UserSpace/AdminSpacePages/AdminTaskPage.jsx";
import FormBuilderPage from "../pages/UserSpace/AdminSpacePages/FormBuilderPage.jsx";
import SpacePage from "../pages/Space/SpacePage.jsx";
import CreateSpaceAdmin from "../pages/CreateSpace-Admin/CreateSpace-Admin.jsx";
// import CreateDocumentPage from "../pages/Create-Document/CreateDocumentWithHistory.jsx";
import CreateDocumentPage from "../pages/Create-Document/CreateDocument-old.jsx";
import SpaceSettingsPage from "../pages/SpaceSettings/spacesettingspage.jsx";
import IndividualSpaceSettings from "../pages/SpaceSettings/individualspacesettings.jsx";
import TaskBuilder from "../pages/EXAMPLE_PAGE/builder.jsx";
import TaskPreview from "../pages/EXAMPLE_PAGE/preview.jsx";
// import { ThemeProvider } from "../pages/Create-Document/contexts/ThemeContext.jsx";
import { ThemeProvider } from "../pages/Create-Document/contexts-old/ThemeContext.jsx";
// import EditorPage from "../pages/tiptapEditor/EditorPage.jsx";
export const SpaceRoutes = [
  {
    key: "/space",
    path: "/space",
    element: <SpacePage />,
  },
  {
    key: "/space/create",
    path: "/space/create",
    element: <CreateSpaceAdmin />,
  },
  {
    key: "/create-document",
    path: "/create-document",
    element: (
      <ThemeProvider>
        <CreateDocumentPage />
      </ThemeProvider>
    ),
  },
  {
    key: "/document/:space_uuid/:space_name/:task_name/:task_id/:group_name/:group_id",
    path: "/document/:space_uuid/:space_name/:task_name/:task_id/:group_name/:group_id",
    element: (
      <ThemeProvider>
        <CreateDocumentPage />
      </ThemeProvider>
    ),
  },
  {
    key: "/space-settings",
    path: "/space-settings",
    element: <SpaceSettingsPage />,
  },
  {
    key: "/space-settings-individual",
    path: "/space-settings/:spaceUuid/:spaceName",
    element: <IndividualSpaceSettings />,
  },
  {
    key: "/user-page",
    path: "/space/:space_uuid/:space_name",
    element: <UserPage />,
  },
  {
    key: "/tasks",
    path: "/space/:space_uuid/:space_name/tasks",
    element: <UserTaskPage />,
  },
  // {
  //   key: "/admin-tasks",
  //   path: "/space/:space_uuid/:space_name/admin-tasks",
  //   element: <AdminTaskPage />,
  // },
  {
    key: "/essay-form",
    path: "/space/:space_uuid/:space_name/essay-form",
    element: <div>Essay Form Creation Page (Coming Soon)</div>,
  },
  {
    key: "/create-document",
    path: "/space/:space_uuid/:space_name/create-document",
    element: (
      <ThemeProvider>
        <CreateDocumentPage />
      </ThemeProvider>
    ),
  },
  {
    key: "/form-builder",
    path: "/space/:space_uuid/:space_name/form-builder",
    element: <FormBuilderPage />,
  },
  {
    key: "/files",
    path: "/space/:space_uuid/:space_name/files",
    element: (
      <SpaceProvider>
        <FileProvider>
          <UserFilesShared />
        </FileProvider>
      </SpaceProvider>
    ),
  },
  {
    key: "/people",
    path: "/space/:space_uuid/:space_name/people",
    element: <UserPeoplePage />,
  },
  {
    key: "/task-builder",
    path: "/space/task-builder",
    element: <TaskBuilder />,
  },
  {
    key: "/task-builder-preview",
    path: "/space/task-builder/preview",
    element: <TaskPreview />,
  },
  
];
