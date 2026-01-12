import React from "react";
import { useNavigate } from "react-router";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-7xl font-extrabold text-indigo-600 mb-4 animate-bounce-slow">
          404
        </h1>

        <p className="text-gray-600 text-lg mb-8 animate-slide-up">
          Oops! That page wandered off somewhere.
        </p>

        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium shadow-md transition transform hover:scale-105 active:scale-95 hover:bg-indigo-700"
        >
          Take me home
        </button>
      </div>
    </div>
  );
}
