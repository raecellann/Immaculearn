import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAdmin } from "../contexts/admin/useAdmin";
import MainLoading from "./LoadingComponents/mainLoading";

const AdminProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAdmin();
  const location = useLocation();
  const hasMounted = useRef(false);

  // Prevent redirect on initial mount
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Show loading during auth check or before component mounts
  if (isLoading || !hasMounted.current) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Only redirect if user is not authenticated and component has mounted
  if (!isAuthenticated) {
    console.log("AdminProtectedRoute: Redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  console.log("AdminProtectedRoute: Authenticated, rendering children");
  return children;
};

export default AdminProtectedRoute;
