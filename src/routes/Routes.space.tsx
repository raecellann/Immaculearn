// Routes.space.tsx
import { Route } from "react-router";
import UserPage from "../pages/UserSpace/zj-space.jsx";
import UserTaskPage from "../pages/UserSpace/UserTaskPage.jsx";
import UserFilesShared from "../pages/UserSpace/UserFilesShared.jsx";
import UserPeoplePage from "../pages/UserSpace/UserPeoplePage.jsx";
import AdminTaskPage from "../pages/UserSpace/AdminSpacePages/AdminTaskPage.jsx";
import AdminCreateActivityPage from "../pages/UserSpace/AdminSpacePages/AdminCreateActivityPage.jsx";
import FormBuilderPage from "../pages/UserSpace/AdminSpacePages/FormBuilderPage.jsx";
import SpacePage from "../pages/Space/SpacePage.jsx";
import CreateSpaceAdmin from "../pages/CreateSpace-Admin/CreateSpace-Admin.jsx";
import CreateDocumentPage from "../pages/Create-Document/CreateDocument.jsx";
import SpaceSettingsPage from "../pages/SpaceSettings/spacesettingspage.jsx";
import IndividualSpaceSettings from "../pages/SpaceSettings/individualspacesettings.jsx";

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
  {
    key: "/admin-tasks",
    path: "/space/:space_uuid/:space_name/admin-tasks",
    element: <AdminTaskPage />,
  },
  {
    key: "/create-activity",
    path: "/space/:space_uuid/:space_name/create-activity",
    element: <AdminCreateActivityPage />,
  },
  {
    key: "/form-builder",
    path: "/space/:space_uuid/:space_name/form-builder",
    element: <FormBuilderPage />,
  },
  {
    key: "/files",
    path: "/space/:space_uuid/:space_name/files",
    element: <UserFilesShared />,
  },
  {
    key: "/files",
    path: "/space/:space_uuid/:space_name/files/:file_uuid/:file_name",
    element: <CreateDocumentPage />,
  },
  {
    key: "/people",
    path: "/space/:space_uuid/:space_name/people",
    element: <UserPeoplePage />,
  },
];
