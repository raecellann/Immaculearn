// Routes.space.tsx
import { Route } from "react-router";
import UserPage from "../pages/UserSpace/zj-space.jsx";
import UserTaskPage from "../pages/UserSpace/UserTaskPage.jsx";
import UserFilesShared from "../pages/UserSpace/UserFilesShared.jsx";
import UserPeoplePage from "../pages/UserSpace/UserPeoplePage.jsx";
import SpacePage from "../pages/Space/SpacePage.jsx";
import CreateSpaceAdmin from "../pages/CreateSpace-Admin/CreateSpace-Admin.jsx";

export const SpaceRoutes = [

  {
    key: "/space",
    path: "/space",
    element: <SpacePage />,
  },
  {
    key: "/space-create",
    path: "/space-create",
    element: <CreateSpaceAdmin />,
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
    key: "/files-shared",
    path: "/space/:space_uuid/:space_name/files-shared",
    element: <UserFilesShared />,
  },
  {
    key: "/people",
    path: "/space/:space_uuid/:space_name/people",
    element: <UserPeoplePage />,
  },
  

];
