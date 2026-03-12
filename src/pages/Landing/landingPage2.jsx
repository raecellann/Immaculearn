import React, { useState } from "react";
import useSocket from "@/hooks/useSocket.js";
import ChatList from "../User_chats/user_chats";

const LandingPage2 = () => {
  const [showMainPage, setShowMainPage] = useState(false);

  return (
    <div className="max-w-full font-sans bg-gradient-to-r from-white to-[#fef6ff] min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center py-6 text-white">
        <div className="absolute z-0 mt-32 w-full">
          <img
            className="w-full"
            src="./src/assets/Page2/header-wave.png"
            alt="header-wave"
          />
        </div>

        <div className="flex relative z-2 items-center gap-2 px-8 mt-4">
          <img src="./src/assets/book.png" alt="ImmacuLearn" className="w-8 h-8" />
          <span className="text-xl font-bold">ImmacuLearn</span>
        </div>

        <nav className="flex relative gap-48 text-lg font-medium">
          <a href="#about" className="text-white hover:text-blue-800">About</a>
          <a href="#feature" className="text-white hover:text-blue-800">Feature</a>
          <a href="#contact" className="text-white hover:text-blue-800">Contact Us</a>
        </nav>

        <a href="#login" className="relative z-10 mr-8 text-white font-medium hover:underline">
          Log In
        </a>
      </header>

      {/* Main Section */}
      <main className="flex flex-col md:flex-row items-start justify-center px-8 lg:px-20 mt-40 gap-28">
        {/* GOALS Card */}
        <div className="flex flex-col items-center text-center w-[28rem]">
            <h1 className="text-3xl font-bold text-green-600 mb-4">GOALS</h1>
            <div
            className="flex flex-col justify-center bg-white rounded-lg p-6 h-[14rem]
            border-[3px] border-black shadow-[6px_6px_0_0_#000]
            leading-relaxed text-justify"
            >
            <p>
                The Collaborative Application System is a platform made to help
                students work together easily. It allows users to share files,
                manage tasks, and communicate in real time. The system aims to
                make group projects more organized, efficient, and accessible
                anytime and anywhere.
            </p>
            </div>
        </div>

        {/* OBJECTIVES Card */}
        <div className="flex flex-col items-center text-center w-[28rem]">
            <h1 className="text-3xl font-bold text-green-600 mb-4">OBJECTIVES</h1>
            <div
            className="flex flex-col justify-center bg-white rounded-lg p-6 h-[14rem]
            border-[3px] border-black shadow-[6px_6px_0_0_#000]
            leading-relaxed text-left"
            >
            <ol className="list-decimal list-outside space-y-2">
                <li>To create an easy-to-use app for student collaboration.</li>
                <li>To let users share files and track tasks in one place.</li>
                <li>To improve communication and teamwork among students.</li>
                <li>To help students manage deadlines and schedules.</li>
                <li>To make academic work faster and more organized.</li>
            </ol>
            </div>
        </div>
      </main>


      {/* Popups */}
      {showMainPage && (
        <div className="fixed inset-0 z-50 bg-white">
          <ChatList />
        </div>
      )}
    </div>
  );
};

export default LandingPage2;
