import React from "react";
import AdminDashboard from "../pages/admin-dashboard/admindashboard.jsx";
import AdminStudents from "../pages/admin-students/adminstudents.jsx";
import AdminTeachers from "../pages/admin-teachers/adminteachers.jsx";
import AdminAnnouncement from "../pages/admin-announcement/adminannouncement.jsx";
import AdminAcademicTerm from "../pages/admin-academic-term/adminaccademicterm.jsx";
import { AdminProvider } from "../contexts/admin/adminContextProvider.tsx";
import AdminProtectedRoute from "../components/AdminProtectedRoute.jsx";
import AdminLogin from "../pages/admin-login/adminlogin.jsx";

export const AdminDataRoutes = [
  {
    key: "/admin-dashboard",
    path: "/admin/dashboard",
    element: (
      <AdminProvider>
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      </AdminProvider>
    ),
  },

  {
    key: "/admin-students",
    path: "/admin/students",
    element: (
      <AdminProvider>
        <AdminProtectedRoute>
          <AdminStudents />
        </AdminProtectedRoute>
      </AdminProvider>
    ),
  },

  {
    key: "/admin-teachers",
    path: "/admin/teachers",
    element: (
      <AdminProvider>
        <AdminProtectedRoute>
          <AdminTeachers />
        </AdminProtectedRoute>
      </AdminProvider>
    ),
  },
  {
    key: "/admin-announcement",
    path: "/admin/announcement",
    element: (
      <AdminProvider>
        <AdminProtectedRoute>
          <AdminAnnouncement />
        </AdminProtectedRoute>
      </AdminProvider>
    ),
  },
  {
    key: "/admin-academic-term",
    path: "/admin/academic-term",
    // element: <AdminAcademicTerm />,
    element: (
      <AdminProvider>
        <AdminProtectedRoute>
          <AdminAcademicTerm />
        </AdminProtectedRoute>
      </AdminProvider>
    ),
  },
  {
    key: "/admin-login",
    path: "/admin/login",
    element:( 
    <AdminProvider>
      <AdminLogin />
      </AdminProvider>
    ),
  },
];
