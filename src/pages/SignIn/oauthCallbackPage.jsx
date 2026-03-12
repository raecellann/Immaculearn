import { useEffect } from "react";
import { toast } from "react-toastify";

const OAuthCallback = () => {
  useEffect(() => {
    // This component is only opened in popup
    if (!window.opener) {
      window.location.href = "/login";
      return;
    }

    const handleMessage = (event) => {
      // Only accept messages from your backend
      const allowedOrigin =
        process.env.VITE_ENV === "production"
          ? "https://immaculearn.up.railway.app"
          : "http://localhost:3000";

      if (event.origin !== allowedOrigin) return;

      const data = event.data;

      if (data.type === "OAUTH_SUCCESS") {
        const { role, needsOnboarding, token } = data;

        if (needsOnboarding && token) {
          sessionStorage.setItem("tempToken", token);
          window.location.href = `/onboarding?role=${role}`;
        } else {
          // Optionally, call your checkAuth to refresh main window
          window.location.href =
            role === "student"
              ? `/home?role=${role}`
              : role === "professor"
                ? `/prof/home?role=${role}`
                : role === "admin"
                  ? `/admin-dashboard?role=${role}`
                  : "/";
        }
      } else if (data.type === "OAUTH_ERROR") {
        toast.error(`OAuth failed: ${data.error}`);
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up if user closes popup
    const checkClosed = setInterval(() => {
      if (window.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(checkClosed);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
