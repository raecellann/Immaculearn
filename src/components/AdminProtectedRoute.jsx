import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAdmin } from "../contexts/admin/useAdmin";
import MainLoading from "./LoadingComponents/mainLoading";

const AdminProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAdmin();
  const location = useLocation();
  const hasCheckedAuth = useRef(false);

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Mark that auth check has completed
  if (!hasCheckedAuth.current) {
    hasCheckedAuth.current = true;
  }

  // Only redirect if auth check is complete and user is not authenticated
  if (hasCheckedAuth.current && !isAuthenticated) {
    console.log("AdminProtectedRoute: Redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  console.log("AdminProtectedRoute: Authenticated, rendering children");
  return children;
};

export default AdminProtectedRoute;
