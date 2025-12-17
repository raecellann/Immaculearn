import React, { useEffect, useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";
import { Mail } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // ✅ track selected role

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "not_registered") {
      toast.error("Google account is not registered!");
    }

    if (error === "oauth_failed") {
      toast.error("Google login failed. Please try again.");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select whether you are a Student or a Professor.");
      return;
    }
    alert(`Logging in as ${role}`);
  };

  const handleGmailLogin = async() => {
    if (!role) {
      alert("Please select whether you are a Student or a Professor.");
      return;
    }
    // Redirect to Gmail login or OAuth flow
    // window.location.href = `http://localhost:3000/v1/account/oauth/google/redirect?role=${role}`;  

    window.open(
      `http://localhost:3000/v1/account/oauth/google/redirect?role=${role}`,
      "_blank",
      "width=500,height=600,top=100,left=100,resizable=yes,scrollbars=yes"
    );
    // const response = await axios.post(`http://localhost:3000/v1/account/oauth/google/redirect?role=${role}`);

    // if (!response.data.success) {
    //   navigate(response.data.redirectTo);
    //   return;
    // }

    // navigate(response.data.redirectTo)
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:5173") return;
      if (event.data.success) {
        if (event.data.needsOnboarding) {
          navigate(`/onboarding?role=${event.data.role}`)
        } else {
          navigate("/home"); // or onboarding
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);


  // const [role, setRole] = useState('');
  
  // const handleRoleSelect = selectedRole => {
  //   setRole(selectedRole);

  //   // Redirect to backend Google OAuth endpoint with role query
  //   window.location.href = `http://localhost:3000/v1/account/oauth/google/redirect?role=${selectedRole}`;
  // };

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

          {/* ✅ Checkbox Section */}
          <div className="flex justify-center gap-6 mt-2 w-full">
            <label className="flex items-center gap-2 text-gray-800 font-medium">
              <input
                type="radio"
                name="role"
                value="Student"
                checked={role === "Student"}
                onChange={(e) => setRole(e.target.value)}
              />
              Student
            </label>

            <label className="flex items-center gap-2 text-gray-800 font-medium">
              <input
                type="radio"
                name="role"
                value="Professor"
                checked={role === "Professor"}
                onChange={(e) => setRole(e.target.value)}
              />
              Professor
            </label>
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
          Check your email inbox for log in credentials.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
