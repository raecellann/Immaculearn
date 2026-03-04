import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { useUser } from "../contexts/user/useUser";
import MainLoading from "./LoadingComponents/mainLoading";
// import { useUser } from "../contexts/user/userContextProvider";

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated, checkAuth } = useUser();
  const location = useLocation();

  // Prevent redirect loops and ensure auth state is stable
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Double-check auth before redirecting
      checkAuth();
    }
  }, [isLoading, isAuthenticated, checkAuth]);

  // Show loading during initial auth check or token refresh
  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }

  // Only redirect if definitively not authenticated after all checks
  if (!isAuthenticated) {
    // Preserve the intended destination for after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
