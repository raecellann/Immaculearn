// Routes.space.tsx
import { Route } from "react-router";
import ViewAllFilesPage from "../pages/ViewAllFiles/view-all-files";
import ViewFilePage from "../pages/ViewFiles/ViewFiles";
import FilePage from "../pages/Files/files";


export const FileRoutes = [
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

  

];
