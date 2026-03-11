import React, { useEffect, useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/user/useUser";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import config from "../../config";

// ─── Validation helpers ────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLoginForm = (email, password) => {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email address is required";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  }
  return errors;
};

// ─── Inline field error component ─────────────────────────────────────────────
const FieldError = ({ message }) =>
  message ? (
    <div className="flex items-center gap-1.5 mt-1">
      <AlertCircle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
      <p className="text-red-500 text-xs">{message}</p>
    </div>
  ) : null;

// ─── Main component ────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { isAuthenticated, user, isLoading, checkAuth, login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Single error state for form validation
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();


  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLoginForm(email, password);

    if (Object.keys(errors).length > 0) {
      // Set single form error message
      setFormError("Invalid email or password");
      toast.error(Object.values(errors)[0]);
      return;
    }

    // Clear form error on successful validation
    setFormError("");

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
      toast.error("Login failed. Please check your credentials and try again.");
    }
  };

  // ── Gmail OAuth ──
  const handleGmailLogin = async () => {
    const baseUrl =
      config.VITE_ENV === "production"
        ? `${config.API_URL}/account/oauth/google/redirect`
        : "http://localhost:3000/v1/account/oauth/google/redirect";

    const popup = window.open(
      baseUrl,
      "oauthPopup",
      `width=500,height=600,top=${(screen.height - 600) / 2},left=${(screen.width - 500) / 2},resizable=yes,scrollbars=yes`,
    );

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_SUCCESS") {
        const { role, needsOnboarding, token } = event.data;

        if (needsOnboarding && token) {
          sessionStorage.setItem("tempToken", token);
          navigate(`/onboarding?role=${role}`);
        } else {
          await checkAuth();
          if (role === "student") {
            navigate(`/home?role=${role}`);
          } else if (role === "professor") {
            navigate(`/prof/home?role=${role}`);
          } else if (role === "admin") {
            navigate(`/admin-dashboard?role=${role}`);
          } else {
            navigate("/");
          }
        }
      } else if (event.data.type === "OAUTH_ERROR") {
        console.error("OAuth error:", event.data.error);
        toast.error("Failed to sign in with Google. Please try again.");
      }
    };

    window.addEventListener("message", messageHandler);

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener("message", messageHandler);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleMessage = (event) => {
      if (
        event.origin !== "https://localhost:5173" &&
        event.origin !== config.APP_URL
      )
        return;

      if (!event.data.success) {
        setError(event.data.error);
      }
      if (event.data.success) {
        if (event.data.needsOnboarding) {
          navigate(`/onboarding?role=${event.data.role}`);
        } else {
          if (event.data.role === "student") {
            navigate(`/home?role=${event.data.role}`);
          } else {
            navigate(`/prof/home?role=${event.data.role}`);
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
      toast.error("Google account is not registered!");
    } else if (error === "oauth_failed") {
      toast.error("Google login failed. Please try again.");
    }
  }, [error]);

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
          <span className="font-bold" style={{ color: "#1D4ED8" }}>ImmacuLearn</span> Today!
        </h2>
        <p className="text-gray-800 text-sm md:text-base mt-2 font-medium">
          Experience a smarter way to learn and achieve your goals effortlessly.
        </p>
      </div>

      {/* Login Form Box */}
      <div className="bg-white shadow-lg rounded-lg p-8 md:p-10 w-full max-w-md relative z-10 border border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold" style={{ color: "#1D4ED8" }}>ImmacuLearn</h3>
            <p className="text-gray-600 text-sm">Log in to continue</p>
          </div>
          <img
            src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1768808239/book-pen_nb81th.svg"
            alt="ImmacuLearn Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email field */}
          <div>
            <InputField
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
              }}
            />
          </div>

          {/* Password field */}
          <div>
            <div className="relative">
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  paddingRight: "2.5rem",
                }}
              />
              <div
                className="absolute text-gray-500 top-1/2 right-3 -translate-y-1/2 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
            </div>
            {/* Single error message under password field */}
            {formError && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                <p className="text-red-500 text-xs">{formError}</p>
              </div>
            )}
          </div>

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
          >
            {isLoading ? "Logging in…" : "Log in"}
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
          <Mail size={20} style={{ color: "#ef4444" }} />
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
