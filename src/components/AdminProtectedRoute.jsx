import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { useAdmin } from "../contexts/admin/useAdmin";
import MainLoading from "./LoadingComponents/mainLoading";

const AdminProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAdmin();
  const location = useLocation();

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Only redirect if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return children;
};

export default AdminProtectedRoute;
