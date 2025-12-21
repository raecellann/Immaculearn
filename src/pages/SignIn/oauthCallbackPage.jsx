import { useEffect } from "react";

const OAuthCallback = () => {
  useEffect(() => {
    if (window.opener && !window.opener.closed) {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");

    //   console.log("Error:", error)

      const message = error
        ? { success: false, error }
        : {
            success: true,
            needsOnboarding: urlParams.get("needsOnboarding"),
            role: urlParams.get("role"),
          };

      window.opener.postMessage(message, window.location.origin);
      window.close();
    }
  }, []);

  return <p>Logging you in...</p>;
};


export default OAuthCallback;