import { Route } from "react-router";
import AdminDashboard from "../pages/admin-dashboard/admindashboard.jsx";
import AdminStudents from "../pages/admin-students/adminstudents.jsx";
import AdminTeachers from "../pages/admin-teachers/adminteachers.jsx";
import AdminLogin from "../pages/admin-login/adminlogin.jsx";
import AdminAnnouncement from "../pages/admin-announcement/adminannouncement.jsx";
import AdminAcademicTerm from "../pages/admin-academic-term/adminaccademicterm.jsx";
import { AdminProvider } from "../contexts/admin/adminContextProvider.tsx";
import { UserProvider } from "../contexts/user/userContextProvider.tsx";


export const AdminDataRoutes = [

  {
    key: "/admin-dashboard",
    path: "/admin/dashboard",
    element: (<UserProvider><AdminDashboard /></UserProvider>),
  },

  {
    key: "/admin-students",
    path: "/admin/students",
    element: (<UserProvider><AdminStudents /></UserProvider>),
  },

  {
    key: "/admin-teachers",
    path: "/admin/teachers",
    element: (<UserProvider><AdminTeachers /></UserProvider>),
  },
  {
    key: "/admin-announcement",
    path: "/admin/announcement",
    element: (<UserProvider>
      <AdminAnnouncement />
    </UserProvider>),
  },
  {
    key: "/admin-academic-term",
    path: "/admin/academic-term",
    element: <AdminAcademicTerm />,
  },
  {
    key: "/admin-login",
    path: "/admin/login",
    element: <AdminLogin />,
  },

];