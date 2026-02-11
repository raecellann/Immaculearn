import React, { useEffect, useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/user/useUser";
import MainLoading from "../../components/LoadingComponents/mainLoading";

const LoginPage = () => {
  const {isAuthenticated, user, isLoading, checkAuth , login} = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await login(email, password);

      if (data.needsOnboarding) {
        sessionStorage.setItem("tempToken", data.tempToken);
        navigate(`/onboarding?role=${data.role}`);
        return;
      }

      if (data.role === "student") {
        navigate(`/home`);
      } else if (data.role === "professor") {
        navigate(`/prof/home`);
      } else if (data.role === "admin") {
        navigate(`/admin-dashboard`);
      } 

    } catch (err) {
      toast.error("Login failed");
    }
  };

  const handleGmailLogin = async () => {
    const popup = window.open(
      `http://localhost:3000/v1/account/oauth/google/redirect`,
      "oauthPopup",
      `width=500,height=600,top=${(screen.height-600)/2},left=${(screen.width-500)/2},resizable=yes,scrollbars=yes`
    );

    // Set up message listener for the popup
    const messageHandler = async (event) => {
      // Verify the message is from our domain
      if (event.origin !== window.location.origin) return;

      await checkAuth();
      if (event.data.type === 'OAUTH_SUCCESS') {
        const { role, needsOnboarding, token } = event.data;

        if (needsOnboarding && token) {
          // 🔐 store tempToken for onboarding
          sessionStorage.setItem("tempToken", token);
          navigate(`/onboarding?role=${role}`);
        } else {
          if (role === 'student') {
            navigate(`/home?role=${role}`);
          } else if (role === 'professor') {
            navigate(`/prof/home?role=${role}`);
          } else if (role === 'admin') {
            navigate(`/admin-dashboard?role=${role}`);
          } else {
            navigate('/');
          }
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error:', event.data.error);
        toast.error('Failed to sign in with Google. Please try again.');
      }
    };

    // Add event listener for messages
    window.addEventListener('message', messageHandler);

    // Clean up the event listener when component unmounts or popup is closed
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:5173") return;

      if (!event.data.success) {
        setError(event.data.error)
      }
      if (event.data.success) {

        console.log(event.data)
        if (event.data.needsOnboarding) {
          navigate(`/onboarding?role=${event.data.role}`)
        } else {

          // console.log(event.data.role)
          if (event.data.role === "student") {
            navigate(`/home?role=${event.data.role}`); // or onboarding
          } else {
            navigate(`/prof/home?role=${event.data.role}`); // or onboarding
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!error) return;

    if (error === "not_registered") {
      toast.error("Google account is not register!");
    } else if (error === "oauth_failed") {
      toast.error("Google login failed. Please try again.");
    }
  }, [error]); // run only when `error` changes


  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;

    if (user.role === "student") {
      navigate(`/home?role=${user.role}`);
    } else if (user.role === "professor") {
      navigate(`/prof/home?role=${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <MainLoading />
      </div>
    );
  }



  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans relative overflow-hidden px-4"
      style={{ backgroundColor: "#FDFBEE" }}
    >
      {/* Decorative Background Images */}
      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577252/freepik__background__93517_1_ww82rt.png"
        alt="Left Illustration"
        className="absolute bottom-0 left-4 w-100 md:w-100"
      />
      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577536/download_1_t1ahpa.png"
        alt="Right Illustration"
        className="absolute bottom-0 right-4 w-100 md:w-100"
      />

      {/* Center Content */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mt-8">
          Log in with{" "}
          <span className="text-green-600 font-bold">ImmacuLearn</span> Today!
        </h2>
        <p className="text-gray-800 text-sm md:text-base mt-2 font-medium">
          Experience a smarter way to learn and achieve your goals effortlessly.
        </p>
      </div>

      {/* Login Form Box */}
      <div className="bg-white shadow-lg rounded-lg p-8 md:p-10 w-full max-w-md relative z-10 border border-gray-200">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-2xl font-bold text-green-700">ImmacuLearn</h3>
          <p className="text-gray-600 text-sm">Log in to continue</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <InputField
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />

          <InputField
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />

          
          {/* Log in Button */}
          <Button
            type="submit"
            style={{
              width: "50%",
              background: "#0066D2",
              padding: "10px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              marginTop: "8px",
              margin: "0 auto",
            }}
            onClick={handleSubmit}
          >
            Log in
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Gmail Login Button */}
        <button
          onClick={handleGmailLogin}
          style={{
            width: "80%",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            border: "2px solid #e5e7eb",
            backgroundColor: "#ffffff",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
            margin: "0 auto",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <Mail
            size={20}
            className="text-red-500"
            style={{ color: "#ef4444" }}
          />
          Continue with Gmail
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Need access? Reach out to your administrator for login details.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
