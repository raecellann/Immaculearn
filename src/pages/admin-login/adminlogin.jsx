import React, { useEffect, useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/user/useUser";
import MainLoading from "../../components/LoadingComponents/mainLoading";

const AdminLogin = () => {
  const { isAuthenticated, user, isLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      toast.error("Email is required");
      setEmailError(true);
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      setEmailError(true);
      return;
    }
    
    // Add admin-specific login logic here
    alert(`Logging in as Admin`);
  };

  const handleGmailLogin = async () => {
    const popup = window.open(
      `http://localhost:3000/v1/account/oauth/google/redirect`,
      "oauthPopup",
      `width=500,height=600,top=${(screen.height-600)/2},left=${(screen.width-500)/2},resizable=yes,scrollbars=yes`
    );

    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'OAUTH_SUCCESS') {
        const { role, needsOnboarding, token } = event.data;
        if (role !== 'admin') {
          toast.error('Only admins can log in here.');
          return;
        }

        navigate(`/admin-dashboard`);
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error:', event.data.error);
        toast.error('Failed to sign in with Google. Please try again.');
      }
    };

    window.addEventListener('message', messageHandler);

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    navigate('/admin-dashboard');
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
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans relative overflow-hidden"
      style={{ backgroundColor: "#FDFBEE" }}
    >
      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1770907737/137629793_10353052_t3herh.png"
        alt="Left Illustration"
        className="absolute bottom-0 left-0 w-80 md:w-96 lg:w-[400px] h-auto max-h-[60vh] object-contain opacity-90"
      />

      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1770907737/151093308_10499104_nrnnwi.png"
        alt="Right Illustration"
        className="absolute bottom-0 right-0 w-80 md:w-96 lg:w-[400px] h-auto max-h-[60vh] object-contain opacity-90"
      />

      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mt-8">
          Admin Login to <span className="text-green-600 font-bold">ImmacuLearn</span>
        </h2>
        <p className="text-gray-800 text-sm md:text-base mt-2 font-medium">
          Access the admin dashboard to manage the platform.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 md:p-10 w-full max-w-md relative z-10 border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-2xl font-bold text-green-700">ImmacuLearn Admin</h3>
          <p className="text-gray-600 text-sm">Log in to continue</p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div>
            <InputField
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error when user starts typing again
                if (emailError) {
                  setEmailError(false);
                }
              }}
              style={{
                width: "100%",
                borderColor: emailError ? "#ef4444" : "#000",
                boxShadow: emailError
                  ? "2.5px 3px 0 #ef4444"
                  : "2.5px 3px 0 #000"
              }}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>

          <InputField
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />

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

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">Or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

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
          <Mail size={20} style={{ color: "#ef4444" }} />
          Continue with Gmail
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Contact your system administrator for access.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;