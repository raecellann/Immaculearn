import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router";

const APIKEY = import.meta.env.VITE_APIKEY;

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        // 1️⃣ Try profile - handle 304 as success
        const profileResponse = await axios.get("http://localhost:3000/v1/auth/profile", {
          headers: { 
            Authorization: `Bearer ${APIKEY}`,
            'Cache-Control': 'no-cache', // Prevent caching
          },
          withCredentials: true,
          validateStatus: function (status) {
            // Treat 304 as success since it means we're authenticated
            return (status >= 200 && status < 300) || status === 304;
          }
        });

        // If we got here, we're authenticated (200 or 304)
        console.log("Profile check successful, status:", profileResponse.status);
        setIsAuth(true);

      } catch (error) {
        console.log("Auth error:", error.response?.status || error.message);
        
        // 2️⃣ Profile failed → try refresh if 401
        if (error.response?.status === 401 || error.response?.status === 403) {
          try {
            const refreshResponse = await axios.post(
              "http://localhost:3000/v1/auth/refresh",
              {},
              {
                headers: { Authorization: `Bearer ${APIKEY}` },
                withCredentials: true,
              }
            );
            
            // Check if refresh was successful
            if (refreshResponse.data.success === true) {
              console.log("Refresh successful, retrying profile...");
              
              // Retry profile after successful refresh
              const retryProfile = await axios.get("http://localhost:3000/v1/auth/profile", {
                headers: { 
                  Authorization: `Bearer ${APIKEY}`,
                  'Cache-Control': 'no-cache',
                },
                withCredentials: true,
                validateStatus: (status) => status === 200 || status === 304
              });
              
              setIsAuth(true);
            } else {
              setIsAuth(false);
            }
            
          } catch (refreshError) {
            console.log("Refresh failed:", refreshError.response?.status || refreshError.message);
            setIsAuth(false);
          }
        } else {
          // Other errors (network, server error, etc.)
          setIsAuth(false);
        }
      } finally {
        setIsLoading(false);
        isCheckingRef.current = false;
      }
    };

    checkAuth();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;