// Routes.admin.tsx
import { Route } from "react-router";
import AdminTaskPage from "../pages/UserSpace/AdminSpacePages/AdminTaskPage.jsx";
import AdminCreateActivityPage from "../pages/UserSpace/AdminSpacePages/AdminCreateActivityPage.jsx";
import AdminFilesSharedPage from "../pages/UserSpace/AdminSpacePages/AdminFilesSharedPage.jsx";
import TaskViewPage from "../pages/Task/components/TaskViewPage.jsx";
import TaskViewPageAdmin from "../pages/Task-view Admin/Task-View-Admin.jsx";
import TaskViewAll from "../pages/Task-view Admin/Task-View-All.jsx";
import CreateFileAdmin from "../pages/CreateFile-Admin/createfile.jsx";
import CreateDocumentPage from "../pages/Create-Document/CreateDocument.jsx";

export const AdminRoutes = [
  <Route key="admintask" path="/admintaskpage" element={<AdminTaskPage />} />,
  <Route key="create-activity" path="/admin-create-activity-page" element={<AdminCreateActivityPage />} />,
  <Route key="files" path="/admin-files" element={<AdminFilesSharedPage />} />,
  <Route key="task-view" path="/task-view" element={<TaskViewPage />} />,
  <Route key="task-view-admin" path="/task-view-admin" element={<TaskViewPageAdmin />} />,
  <Route key="task-view-all" path="/task-view-all" element={<TaskViewAll />} />,
  <Route key="create-file" path="/create-file-admin" element={<CreateFileAdmin />} />, 
  <Route key="create-document" path="/create-document-admin" element={<CreateDocumentPage />} />, 
];
