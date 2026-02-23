// Routes.admin.tsx
import AdminDashboard from "../pages/admin-dashboard/admindashboard";
import AdminStudents from "../pages/admin-students/adminstudents";
import AdminTeachers from "../pages/admin-teachers/adminteachers";

export const AdminRoutes = [
  {
    key: "admin-dashboard",
    path: "/admin-dashboard",
    element: <AdminDashboard />,
  },
  {
    key: "admin-teachers",
    path: "/admin-teachers",
    element: <AdminTeachers />,
  },
  {
    key: "admin-student",
    path: "/admin-student",
    element: <AdminStudents />,
  },
];
