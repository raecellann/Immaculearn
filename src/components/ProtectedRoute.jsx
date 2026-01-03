import { useEffect } from "react";
import { Navigate } from "react-router";
import { useUser } from "../contexts/user/useUser";
import MainLoading from "./LoadingComponents/mainLoading";
// import { useUser } from "../contexts/user/userContextProvider";

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useUser();

  console.log(isLoading, isAuthenticated)

  // No need for separate auth check here since UserProvider already does it
  // The UserProvider will have already checked auth on mount

  // console.log(isLoading, isAuthenticated)

  if (isLoading) return <div className="flex h-screen justify-center items-center"><MainLoading /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;