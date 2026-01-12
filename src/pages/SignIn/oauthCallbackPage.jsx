import { useEffect } from "react";
import { toast } from "react-toastify";

const OAuthCallback = () => {
  useEffect(() => {
    const handleOAuthCallback = () => {
      // If this is not in a popup, redirect to login
      if (!window.opener) {
        window.location.href = '/login';
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      const needsOnboarding = urlParams.get("needsOnboarding") === 'true';
      const role = urlParams.get("role")?.toLowerCase();

      if (error) {
        console.error("OAuth error:", error);
        window.opener.postMessage({
          type: 'OAUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (!role) {
        console.error("No role provided in OAuth callback");
        window.opener.postMessage({
          type: 'OAUTH_ERROR',
          error: 'No role information received'
        }, window.location.origin);
        window.close();
        return;
      }

      // Send success message to parent window
      window.opener.postMessage({
        type: 'OAUTH_SUCCESS',
        role: role,
        needsOnboarding: needsOnboarding
      }, window.location.origin);

      // Close the popup
      window.close();
    };

    handleOAuthCallback();
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
