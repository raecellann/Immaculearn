import React, { useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";

const SpaceCreationPage = () => {
  const [spaceName, setSpaceName] = useState("");
  const [next, setnext] = useState("");
  const [skip, setskip] = useState("");

  return (
    <div className="font-sans min-h-screen relative overflow-hidden overflow-x-hidden bg-[#FDFBEE]">
      {/* Navbar */}
      <header className="relative z-10 flex justify-between items-center py-6 text-white">
        {/* Background wave — trimmed height */}
        <div className="absolute top-0 left-0 w-full overflow-hidden">
          <img
            className="w-full"
            src="./src/assets/space-creation/header-wave.png"
            alt="header-wave"
          />
        </div>

        {/* Logo */}
        <div className="flex relative z-10 items-center gap-2 px-8 mt-4">
          <img
            src="./src/assets/book.png"
            alt="ImmacuLearn"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-white drop-shadow-lg font-grotesque">
            ImmacuLearn
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row items-center justify-between px-8 lg:px-20 mt-10 relative z-10">
        {/* Left Content */}
        <div className="w-full md:w-1/2 max-w-xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black font-grotesque text-center">
            It all starts with <span className="text-green-600"> Space!</span>
          </h1>

        <p className="text-black text-lg font-grotesque font-bold text-center leading-[1.2]">
            Space is a fun and inspiring place where students come together to
            share ideas, learn from each other, and work on cool projects. It’s
            all about teamwork, creativity, and making things happen while
            having a great time!
          </p>

          {/* Input Field */}
          <div className="space-y-4">
            <label
              htmlFor="spaceName"
              className="block text-gray-900 font-semibold"
            >
              Enter Space Name:
            </label>
            <InputField
              type="text"
              id="spaceName"
              name="spaceName"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="Ex. Yesh Space"
              className="w-[60%]"
            />

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => window.location.href = "/initial-invite"}
                style={{
                  background:
                    "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
                  borderRadius: "8px",
                  padding: "0.50rem 1.5rem",
                    fontFamily: '"Darker Grotesque", sans-serif',
                    fontSize: "1rem",

                }}
              >
                Next
              </Button>
              
              <Button
                onClick={() => setskip(true)}
                style={{
                  background: "#e5e7eb",
                  color: "#000",
                  borderRadius: "8px",
                  padding: "0.50rem 1.5rem",
                    fontFamily: '"Darker Grotesque", sans-serif',
                    fontSize: "1rem",


                }}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0 relative">
          {/* Optional blue shape behind the laptop */}
          <div className="absolute -top-10 right-20 w-[300px] h-[300px] bg-blue-300 rounded-full opacity-40 blur-3xl"></div>

          {/* Laptop image */}
          <img
            src="./src/assets/space-creation/right-image.png"
            alt="Laptop Preview"
            className="relative z-10 max-w-full"
            style={{ width: "420px", height: "auto" }}
          />
        </div>
      </main>
    </div>
  );
};

export default SpaceCreationPage;
