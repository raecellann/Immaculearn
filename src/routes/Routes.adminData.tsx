// Routes.admin.tsx
import { Route } from "react-router";
import AdminDashboard from "../pages/admin-dashboard/admindashboard.jsx";
import AdminStudents from "../pages/admin-students/adminstudents.jsx";
import AdminTeachers from "../pages/admin-teachers/adminteachers.jsx";


export const AdminDataRoutes = [

  {
    key: "/admin-dashboard",
    path: "/admin-dashboard",
    element: <AdminDashboard />,
  },

  {
    key: "/admin-students",
    path: "/admin-students",
    element: <AdminStudents />,
  },

  {
    key: "/admin-teachers",
    path: "/admin-teachers",
    element: <AdminTeachers />,
  },

];