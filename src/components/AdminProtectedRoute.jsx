import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAdmin } from "../contexts/admin/useAdmin";
import MainLoading from "./LoadingComponents/mainLoading";

const AdminProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAdmin();
  const location = useLocation();
  const [shouldWait, setShouldWait] = useState(true);

  // Wait a bit for auth check to complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldWait(false);
    }, 1000); // Wait 1 second

    return () => clearTimeout(timer);
  }, []);

  // Show loading during initial auth check or waiting period
  if (isLoading || shouldWait) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Only redirect if not authenticated
  if (!isAuthenticated) {
    console.log("AdminProtectedRoute: Redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  console.log("AdminProtectedRoute: Authenticated, rendering children");
  return children;
};

export default AdminProtectedRoute;
