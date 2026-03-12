import React, { useState } from "react";
import useSocket from "@/hooks/useSocket.js";
import ChatList from "../User_chats/user_chats";

const TopFeatures = () => {
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
      <main className="flex flex-col md:flex-row items-start justify-center px-8 lg:px-20 mt-20 gap-28">
        <div className="flex flex-col">
            
            <h1 className="text-3xl font-bold text-green-600 mb-4 text-center">TOP FEATURES</h1>
            <div class="flex items-center justify-center text-center m-4">
                <div class="max-w-[48rem]">
                    <span>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Fusce pellentesque erat nec ex dignissim, at accumsan tellus luctus.
                    Etiam eros est, sagittis a condimentum vel, pellentesque eget lacus.
                    </span>
                </div>
            </div>

            <div className="flex">
                <div className="flex gap-12">
                    {/* <h1 className="text-3xl font-bold text-green-600 mb-4">GOALS</h1> */}
                    <div
                    className="flex flex-col justify-center items-center text-center bg-white rounded-lg p-6 w-[12rem] h-[18rem]
                    border-[3px] border-black shadow-[6px_6px_0_0_#000]
                    leading-relaxed"
                    >
                        <img className="w-[8rem] h-[8rem]" src="./src/assets/TopFeatures/calendar.png" alt="" />
                        <span>Task Scheduler</span>
                    </div>
                    <div
                    className="flex flex-col justify-center items-center text-center bg-white rounded-lg p-6 w-[12rem] h-[18rem]
                    border-[3px] border-black shadow-[6px_6px_0_0_#000]
                    leading-relaxed"
                    >
                        <img className="w-[8rem] h-[8rem]" src="./src/assets/TopFeatures/document.png" alt="" />
                        <span>Document Sharing</span>
                    </div>
                    <div
                    className="flex flex-col justify-center items-center text-center bg-white rounded-lg p-6 w-[12rem] h-[18rem]
                    border-[3px] border-black shadow-[6px_6px_0_0_#000]
                    leading-relaxed"
                    >
                        <img className="w-[8rem] h-[8rem]" src="./src/assets/TopFeatures/slider.png" alt="" />
                        <span>Grade Viewing</span>
                    </div>
                    <div
                    className="flex flex-col justify-center items-center text-center bg-white rounded-lg p-6 w-[12rem] h-[18rem]
                    border-[3px] border-black shadow-[6px_6px_0_0_#000]
                    leading-relaxed"
                    >
                        <img className="w-[8rem] h-[8rem]" src="./src/assets/TopFeatures/upload.png" alt="" />
                        <span>File Upload</span>
                    </div>
                </div>

                {/* <div className="flex flex-col items-center text-center w-[28rem]">
                    <div
                    className="flex flex-col justify-center bg-white rounded-lg p-6 h-[14rem]
                    border-[3px] border-black shadow-[6px_6px_0_0_#000]
                    leading-relaxed text-left"
                    >
                    </div>
                </div> */}
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

export default TopFeatures;
