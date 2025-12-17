import React, { useState } from "react";
import { encryptData, decryptData } from "../../hooks/useLocalStorage";
import Button from "@/pages/component/Button";
import InputField from "../component/InputField";
import { Link } from "react-router";

const LandingPage = () => {
  const [showMainPage, setShowMainPage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardsData = [
    {
      front: "Real-time Collaboration",
      back: "Collaborate instantly with peers on notes, tasks, and projects.",
      icon: "/src/assets/LandingPage/Calendar.png",
    },
    {
      front: "Organized Learning",
      back: "Manage deadlines, courses, and learning materials all in one place.",
      icon: "/src/assets/LandingPage/file.png",
    },
    {
      front: "Progress Tracking",
      back: "Track your learning journey and stay motivated with visual tools.",
      icon: "/src/assets/LandingPage/LOGO.png",
    },
  ];

  const run = async () => {
    const encrypted = await encryptData({ hello: "world" });
    const decrypted = await decryptData(encrypted);
    console.log({ encrypted, decrypted });
  };

  run();

  return (
    <div className="font-sans min-h-screen relative overflow-hidden bg-[#FDFBEE]">
      {/* NAVBAR */}
      <div className="w-full text-white py-4 px-10 relative overflow-hidden z-10">
        <header className="flex justify-between items-center w-full relative z-20">
          <div className="flex items-center gap-2 mt-2">
            <img
              src="/src/assets/LandingPage/LOGO.png"
              alt="Logo"
              className="w-[80px] h-[60px]"
            />
          </div>

          <nav className="hidden md:flex gap-10 font-medium text-white absolute left-1/2 transform -translate-x-1/2">
            <a href="#about">About</a>
            <a href="#feature">Feature</a>
            <a href="#contact">Contact Us</a>
          </nav>


          <Link to="login">
            <Button
              className="px-5 py-2"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "15px",
              }}
            >
              Log In
            </Button>
          </Link>
        </header>

        <img
          src="/src/assets/LandingPage/header wave.png"
          alt="Header Wave"
          className="absolute bottom-[1px] left-0 w-full z-10 h-full"
        />
      </div>

      {/* HERO SECTION */}
      <main className="flex flex-col md:flex-row justify-between items-center px-10 lg:px-28 mt-2 relative z-20">
        <div className="w-full md:w-1/2 max-w-[550px]">
          <h1 className="text-5xl md:text-4xl font-extrabold leading-tight">
            <span className="text-[#1D4ED8]">Wherever</span>
            <span className="text-black"> you are,</span>
            <br />
            <span className="text-[#3B82F6]">Learn Together!</span>
          </h1>

          <p className="mt-6 text-gray-800 text-lg leading-relaxed">
            ImmacuLearn transforms the way you experience education by offering
            a seamless, engaging, and collaborative platform designed for both
            students and educators.
          </p>

          <div className="mt-6">
            <Button
              onClick={() => setShowMainPage(true)}
              className="px-7 py-3 shadow-lg"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "1.1rem",
              }}
            >
              Explore Now
            </Button>
          </div>
        </div>

        <div className="relative w-full md:w-1/2 flex justify-end mt-5 md:mt-0">
          <img
            src="/src/assets/LandingPage/sample.svg"
            alt="Students"
            className="relative w-[600px] z-10"
          />
        </div>
      </main>

      {/* SCHOOL SECTION */}
      <div className="w-full mt-5 relative">
        <img
          src="/src/assets/LandingPage/school.svg"
          alt="School"
          className="w-full h-auto object-cover"
        />

        <div className="absolute top-10 ml-10 text-left font-grotesque">
          <h2 className="text-3xl md:text-4xl text-white leading-tight">
            Improve your <span className="font-bold">study habit</span> with us!
          </h2>
          <p className="mt-2 text-lg md:text-xl text-white">
            Connect with your classmates and teachers!
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 border-2 border-white text-white font-bold text-[18px] rounded-lg cursor-pointer hover:bg-white hover:text-black transition duration-300">
            Create account now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION */}
      <section
        className="w-full bg-[#FDFBEE] py-16 px-10 lg:px-28 flex flex-col md:flex-row items-start gap-10 font-grotesque relative"
        id="feature"
      >
        <img
          src="/src/assets/LandingPage/asterisk.png"
          className="absolute left-[-10px] top-[350px] w-[180px] z-0"
          alt="asterisk"
        />

        <img
          src="/src/assets/LandingPage/arrow.png"
          className="absolute left-[200px] top-[360px] w-[120px] z-20"
          alt="arrow"
        />

        {/* LEFT TEXT */}
        <div className="md:w-1/2 text-left relative z-30">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1D4ED8]">
            Make your teamwork more organized with us.
          </h2>

          <p className="text-black mt-4 text-sm font-inter">
            Designed to enhance your learning experience through intuitive and
            collaborative tools. Learn faster, collaborate smarter, and stay
            organized effortlessly.
          </p>

          <Button
            className="mt-6 px-7 py-3 shadow-lg"
            style={{
              background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
              borderRadius: "10px",
              fontSize: "1.1rem",
            }}
          >
            Learn More
          </Button>
        </div>

        {/* RIGHT SIDE – STACKED CARDS */}
        <div className="md:w-1/2 flex justify-center items-center relative h-64 z-20">
          {/* Left Arrow */}
          <button
            onClick={() =>
              setActiveIndex(
                (prev) => (prev - 1 + cardsData.length) % cardsData.length
              )
            }
            className="absolute left-0 z-40 p-2 rounded-full shadow-md
             bg-black text-white 
             hover:bg-[#1D4ED8] transition"
          >
            &#8592;
          </button>

          {/* Cards */}
          {cardsData.map((card, index) => {
            const isActive = index === activeIndex;
            const isNext = index > activeIndex;
            const isPrev = index < activeIndex;

            return (
              <div
                key={index}
                className={`absolute w-80 h-52 rounded-xl shadow-lg border-2 flex flex-row items-center justify-between p-6 cursor-pointer transition-all duration-500
            ${
              isActive
                ? "z-30 bg-[#1D4ED8] text-white scale-100 translate-y-0 rotate-0"
                : "bg-white text-black"
            }
            ${
              isNext
                ? "z-20 translate-x-12 translate-y-4 rotate-3 scale-95"
                : ""
            }
            ${
              isPrev
                ? "z-10 -translate-x-12 -translate-y-4 -rotate-3 scale-95 opacity-50"
                : ""
            }
          `}
              >
                <div>
                  <h3
                    className={`font-bold text-xl ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  >
                    {card.front}
                  </h3>
                  <p
                    className={`text-base ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {card.back}
                  </p>
                </div>
                <img src={card.icon} alt={card.front} className="w-20 h-20" />
              </div>
            );
          })}

          {/* Right Arrow */}
          <button
            onClick={() =>
              setActiveIndex((prev) => (prev + 1) % cardsData.length)
            }
            className="absolute right-0 z-40 p-2 rounded-full shadow-md
             bg-black text-white 
             hover:bg-[#1D4ED8] transition"
          >
            &#8594;
          </button>
        </div>
      </section>

      {/* BLUE MARQUEE */}
      <div className="relative w-full mt-16">
        <img
          src="/src/assets/LandingPage/violet.svg"
          alt="Background Accent"
          className="absolute right-0 w-[200px] opacity-80 z-10 hidden lg:block"
        />

        <div className="w-full h-12 bg-[#4D9BEF] flex items-center justify-center overflow-hidden relative z-40">
          <div className="absolute whitespace-nowrap animate-marquee">
            {Array(10)
              .fill(
                <>
                  <span className="text-white text-xl font-bold mx-4">
                    Create your account for free!
                  </span>
                  <span className="text-white text-xl font-bold mx-2">•</span>
                </>
              )
              .map((el, i) => (
                <React.Fragment key={i}>{el}</React.Fragment>
              ))}
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
      `}
      </style>

      {/* BENEFITS SECTION */}
      <section className="w-full bg-[#FDFBEE] py-8 px-10 lg:px-24 relative">
        <div className="mb-10 w-max">
          <div className="bg-[#FFE486] px-8 py-3 rounded-full shadow-md text-left border-2 border-black">
            <h2 className="text-xl md:text-2xl font-bold font-grotesque text-black">
              Benefits of using the website
            </h2>
          </div>
        </div>

        <img
          src="/src/assets/LandingPage/green.svg"
          alt="Green Accent"
          className="absolute left-0 bottom-0 w-48 z-0 hidden lg:block"
        />

        <div className="flex flex-col lg:flex-row justify-start items-start gap-10 relative z-10">
          {/* LEFT COLUMN */}
          <div className="grid grid-cols-1 gap-5">
            {[
              {
                title: "Easy Communication",
                desc: "Allows students to chat and share updates quickly.",
                icon: "/src/assets/LandingPage/comms.svg",
              },
              {
                title: "Organized Files",
                desc: "Upload and access important school documents efficiently.",
                icon: "/src/assets/LandingPage/files.svg",
              },
              {
                title: "Task Tracking",
                desc: "Track all requirements and stay updated on deadlines.",
                icon: "/src/assets/LandingPage/tasks.svg",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#E8F1FA] p-6 rounded-lg shadow hover:scale-105 transition flex gap-4 items-start relative z-20"
              >
                <div className="bg-[#1D4ED8] text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-black">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="grid grid-cols-1 gap-5">
            {[
              {
                title: "Time Management",
                desc: "Helps students prioritize their tasks effectively.",
                icon: "/src/assets/LandingPage/time.svg",
              },
              {
                title: "Improved Productivity",
                desc: "Encourages collaborative work for better output.",
                icon: "/src/assets/LandingPage/productivity.svg",
              },
              {
                title: "Better Teamwork",
                desc: "Allows group sharing and syncing progress.",
                icon: "/src/assets/LandingPage/teamwork.svg",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#E8F1FA] p-6 rounded-lg shadow hover:scale-105 transition flex gap-4 items-start"
              >
                <div className="bg-[#1D4ED8] text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
                  {index + 4}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-black">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* LAPTOP MOCKUP */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="absolute -top-14 -left-10 w-48 h-48 bg-[#4D9BEF] rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-10 -right-8 w-40 h-40 bg-[#7FB3FF] rounded-full blur-3xl opacity-70"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#9EC9FF] rounded-full blur-2xl opacity-50"></div>

            <img
              src="/src/assets/LandingPage/laptop.svg"
              alt="Laptop Preview"
              className="w-[380px] relative z-10"
            />
          </div>
        </div>

        <div className="absolute right-10 bottom-4 hidden lg:block text-xs text-gray-600">
          Scroll down for more information ↻
        </div>
      </section>

      {/* ====================== SIGN-UP SECTION (above footer) ====================== */}
      <section className="w-full bg-[#FDFBEE] py-16 px-10 lg:px-20 flex justify-center">
        <div className=" p-10 max-w-3xl w-full text-center">
          <h2 className="text-3xl font-bold text-black">
            GET STARTED WITH <span className="text-[#1D4ED8]">IMMACULEARN</span>{" "}
            TODAY
          </h2>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <InputField
              placeholder="Email"
              className="w-full md:w-[450px] h-12 bg-white border-2 border-black rounded-lg px-4"
            />

            <Button
              className="px-8 py-3 font-semibold shadow"
              style={{
                background: "#4D9BEF",
                color: "white",
                borderRadius: "10px",
              }}
            >
              Sign-up for free!
            </Button>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER SECTION ====================== */}
      <div className="w-full mt-20 relative">
        {/* Background Image */}
        <img
          src="/src/assets/LandingPage/school-footer.svg"
          className="w-full h-auto object-cover"
          alt="Footer Background"
        />

        {/* Footer Content */}
        <div className="absolute top-0 left-0 w-full h-full px-10 lg:px-20 py-16 flex flex-col lg:flex-row justify-between text-black">
          {/* LOGO + BRAND */}
          <div className="flex flex-col items-start">
            <img
              src="/src/assets/LandingPage/LOGO.png"
              className="w-[120px]"
              alt="Logo"
            />
            <h3 className="font-bold text-lg mt-2">IMMACULEARN</h3>
          </div>

          {/* LINKS + RESOURCES */}
          <div className="flex gap-20 mt-8 lg:mt-0">
            {/* LINKS */}
            <div>
              <h4 className="font-bold text-lg mb-2">Links</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="#home" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:underline">
                    About the system
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="hover:underline">
                    Benefits
                  </a>
                </li>
                <li>
                  <a href="#signup" className="hover:underline">
                    Sign-up
                  </a>
                </li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div>
              <h4 className="font-bold text-lg mb-2">Resources</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Source Code
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Paper
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="mt-8 lg:mt-0">
            <h4 className="font-bold text-lg mb-2">Get in touch</h4>

            <InputField
              placeholder="Enter your message here"
              className="w-[280px] h-12 bg-white border-2 border-black rounded-lg px-4"
            />

            <Button
              className="mt-3 px-5 py-2 font-semibold shadow"
              style={{
                background: "#1D4ED8",
                color: "white",
                borderRadius: "10px",
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
