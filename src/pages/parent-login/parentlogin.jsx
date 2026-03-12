import React, { useState } from "react";

const ParentLogin = () => {
  const [studentNumber, setStudentNumber] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#161A20] text-white font-inter px-6">
      <div className="bg-[#1E242E] p-8 rounded-xl shadow-lg w-full max-w-md">
        
        <h1 className="text-2xl font-bold mb-6 text-center">Parent Access</h1>

        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your child’s student number to view their grades.
        </p>

        <input
          type="text"
          placeholder="Enter Student Number (ex. 22-1241)"
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#2E3440] text-sm outline-none mb-5"
        />

        <button
          className="w-full py-3 bg-[#007AFF] hover:bg-[#0063d3] rounded-lg font-semibold transition"
        >
          Login
        </button>

      </div>
    </div>
  );
};

export default ParentLogin;
