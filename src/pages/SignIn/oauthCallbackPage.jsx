// OAuthCallback.jsx
import { useEffect } from "react";

const OAuthCallback = () => {
    useEffect(() => {
    // Inform opener window
    if (window.opener) {
      const urlParams = new URLSearchParams(window.location.search);
      const needsOnboarding = urlParams.get("needsOnboarding");

    //   console.log(needsOnboarding)
      const role = urlParams.get("role");

      console.log("ROLEEE:", role)

      window.opener.postMessage(
        { success: true, needsOnboarding, role },
        window.location.origin
      );

      window.close();
    }
  }, []);

  return <p>Logging you in...</p>;
};

export default OAuthCallback;
