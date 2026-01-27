import React, { useState, useRef, useEffect } from "react";
import { encryptData, decryptData } from "../../hooks/useLocalStorage";
import Button from "@/pages/component/Button";
import InputField from "../component/InputField";
import { Link } from "react-router";

const LandingPage = () => {
  const [showMainPage, setShowMainPage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cardsData = [
    {
      front: "Real-time Collaboration",
      back: "Collaborate instantly with peers on notes, tasks, and projects.",
      icon: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766507073/Calendar_tuswog.png",
    },
    {
      front: "Organized Learning",
      back: "Manage deadlines, courses, and learning materials all in one place.",
      icon: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766507073/file_cbwt9s.png",
    },
    {
      front: "Progress Tracking",
      back: "Track your learning journey and stay motivated with visual tools.",
      icon: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766507073/Calendar_tuswog.png",
    },
  ];

  const run = async () => {
    const encrypted = await encryptData({ hello: "world" });
    const decrypted = await decryptData(encrypted);
    console.log({ encrypted, decrypted });
  };

  run();

  // Animation states for sections
  const [heroVisible, setHeroVisible] = useState(
    typeof window === "undefined" ? true : false,
  );
  const [heroImgVisible, setHeroImgVisible] = useState(
    typeof window === "undefined" ? true : false,
  );
  const [featureTextVisible, setFeatureTextVisible] = useState(
    typeof window === "undefined" ? true : false,
  );
  const [featureCardsVisible, setFeatureCardsVisible] = useState(
    typeof window === "undefined" ? true : false,
  );
  const heroRef = useRef();
  const heroImgRef = useRef();
  const featureTextRef = useRef();
  const featureCardsRef = useRef();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setHeroVisible(true);
      setHeroImgVisible(true);
      setFeatureTextVisible(true);
      setFeatureCardsVisible(true);
      return;
    }

    const handleObserver = (entries, observer, setVisible) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    };

    const heroObs = new window.IntersectionObserver(
      (e, o) => handleObserver(e, o, setHeroVisible),
      { threshold: 0.3 },
    );
    const heroImgObs = new window.IntersectionObserver(
      (e, o) => handleObserver(e, o, setHeroImgVisible),
      { threshold: 0.3 },
    );
    const featureTextObs = new window.IntersectionObserver(
      (e, o) => handleObserver(e, o, setFeatureTextVisible),
      { threshold: 0.3 },
    );
    const featureCardsObs = new window.IntersectionObserver(
      (e, o) => handleObserver(e, o, setFeatureCardsVisible),
      { threshold: 0.3 },
    );

    if (heroRef.current) heroObs.observe(heroRef.current);
    if (heroImgRef.current) heroImgObs.observe(heroImgRef.current);
    if (featureTextRef.current) featureTextObs.observe(featureTextRef.current);
    if (featureCardsRef.current)
      featureCardsObs.observe(featureCardsRef.current);

    return () => {
      heroObs.disconnect();
      heroImgObs.disconnect();
      featureTextObs.disconnect();
      featureCardsObs.disconnect();
    };
  }, []);

  return (
    <div className="font-sans min-h-screen relative overflow-hidden bg-[#FDFBEE]">
      {/* NAVBAR */}
      <div className="w-full text-white py-4 px-4 sm:px-10 relative overflow-hidden z-10">
        <header className="flex justify-between items-center w-full relative z-20">
          <div className="flex items-center gap-2 mt-2">
            <img
              src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
              alt="Logo"
              className="w-[60px] h-[45px] sm:w-[80px] sm:h-[60px]"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 sm:gap-10 font-medium text-white absolute left-1/2 transform -translate-x-1/2">
            <a
              href="#about"
              className="text-white hover:text-blue-200 transition"
            >
              About
            </a>
            <a
              href="#feature"
              className="text-white hover:text-blue-200 transition"
            >
              Feature
            </a>
            <a
              href="#contact"
              className="text-white hover:text-blue-200 transition"
            >
              Contact Us
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl focus:outline-none z-50 relative transition-transform duration-300 ease-in-out"
          >
            <div className="w-6 h-5 flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ease-in-out ${mobileMenuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
              ></span>
            </div>
          </button>

          {/* Desktop Login Button */}
          <Link to="login" className="hidden md:block">
            <Button
              className="px-4 sm:px-5 py-2 text-white"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "14px sm:15px",
                color: "white",
              }}
            >
              Log In
            </Button>
          </Link>
        </header>

        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379306/header_wave_o6yymb.png"
          alt="Header Wave"
          className="absolute bottom-[1px] left-0 w-full z-10 h-full"
        />
      </div>

      {/* Mobile Navigation Menu - Moved outside navbar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1D4ED8] bg-opacity-95 backdrop-blur-sm z-50 animate-slide-down-menu">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
                alt="Logo"
                className="w-[60px] h-[45px]"
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-2xl focus:outline-none hover:text-blue-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col py-4 px-4 space-y-3">
            <a
              href="#about"
              className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#feature"
              className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Feature
            </a>
            <a
              href="#contact"
              className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </a>
            <Link to="login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                className="px-4 py-2 w-full animate-slide-up-item"
                style={{
                  background:
                    "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: "10px",
                  fontSize: "14px",
                }}
              >
                Log In
              </Button>
            </Link>
          </nav>
        </div>
      )}

      {/* HERO SECTION */}
      <main className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-10 lg:px-28 mt-2 relative z-20 text-center md:text-left">
        <div
          ref={heroRef}
          className={`w-full md:w-1/2 max-w-[550px] mx-auto md:mx-0 transition-transform duration-500 ${heroVisible ? "animate-landing-left" : "opacity-0 translate-x-[-60px]"}`}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
            <span className="text-[#1D4ED8]">Wherever</span>
            <span className="text-black"> you are,</span>
            <br />
            <span className="text-[#3B82F6]">Learn Together!</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-gray-800 text-sm sm:text-base leading-relaxed">
            ImmacuLearn transforms the way you experience education by offering
            a seamless, engaging, and collaborative platform designed for both
            students and educators.
          </p>

          <div className="mt-4 sm:mt-6 flex justify-center md:justify-start">
            <Button
              onClick={() => setShowMainPage(true)}
              className="px-5 sm:px-6 py-3 shadow-lg text-sm sm:text-base"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "0.9rem sm:1rem",
              }}
            >
              Explore Now
            </Button>
          </div>
        </div>

        <div
          ref={heroImgRef}
          className={`relative w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0 transition-transform duration-500 ${heroImgVisible ? "animate-landing-right" : "opacity-0 translate-x-[60px]"}`}
        >
          <img
            src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379654/sample_lwkfab.svg"
            alt="Students"
            className="relative w-full max-w-[350px] sm:max-w-[450px] md:max-w-[600px] z-10 h-auto mx-auto md:mx-0"
          />
        </div>
      </main>

      {/* SCHOOL SECTION */}
      <div className="w-full mt-5 relative">
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1769180611/Group_124_u66wsj.png"
          alt="School"
          className="w-full h-[200px] sm:h-[300px] md:h-auto object-cover"
        />

        <div className="absolute top-4 sm:top-6 md:top-8 lg:top-10 left-2 sm:left-6 md:left-8 lg:left-10 text-left font-grotesque max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-md mt-4 sm:mt-0 md:mt-4 lg:mt-0">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white leading-tight text-left">
            Improve your <span className="font-bold">study habit</span> with us!
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg text-white text-left">
            Connect with your classmates and teachers!
          </p>

          <div className="mt-4 flex justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-2 border-2 border-white text-white font-bold text-[12px] sm:text-[12px] md:text-[14px] rounded-lg cursor-pointer hover:bg-white hover:text-black transition duration-300">
              <span className="inline">Create account now</span>{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 w-4 md:h-5 sm:w-5"
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
      </div>

      {/* FEATURE SECTION */}
      <section
        className="w-full bg-[#FDFBEE] py-12 sm:py-16 px-4 sm:px-10 lg:px-28 flex flex-col lg:flex-row items-center gap-6 sm:gap-10 font-grotesque relative"
        id="feature"
      >
        {/* Decorative Images - Hidden on mobile */}
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380042/Asterisk_itnvzs.png"
          className="hidden md:block absolute left-[-10px] top-[350px] w-[180px] z-0"
          alt="asterisk"
        />

        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380049/arrow_q9xp1c.png"
          className="hidden md:block absolute left-[200px] top-[360px] w-[120px] z-20"
          alt="arrow"
        />

        {/* LEFT TEXT */}
        <div
          ref={featureTextRef}
          className={`w-full lg:w-1/2 text-center lg:text-left relative z-30 mb-8 lg:mb-0 transition-transform duration-500 ${featureTextVisible ? "animate-landing-left" : "opacity-0 translate-x-[-60px]"}`}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1D4ED8]">
            Make your teamwork more organized with us.
          </h2>

          <p className="text-black mt-4 text-sm sm:text-base font-inter">
            Designed to enhance your learning experience through intuitive and
            collaborative tools. Learn faster, collaborate smarter, and stay
            organized effortlessly.
          </p>

          <div className="mt-6 flex justify-center lg:justify-start">
            <Button
              className="px-5 sm:px-6 py-3 shadow-lg text-sm sm:text-base"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "0.9rem sm:1rem",
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE – STACKED CARDS */}
        <div
          ref={featureCardsRef}
          className={`w-full lg:w-1/2 flex justify-center items-center relative h-48 sm:h-64 md:h-80 z-20 transition-transform duration-500 ${featureCardsVisible ? "animate-landing-right" : "opacity-0 translate-x-[60px]"}`}
        >
          {/* Left Arrow */}
          <button
            onClick={() =>
              setActiveIndex(
                (prev) => (prev - 1 + cardsData.length) % cardsData.length,
              )
            }
            className="absolute left-0 z-40 p-1 sm:p-2 rounded-full shadow-md
             bg-black text-white 
             hover:bg-[#1D4ED8] transition text-xs sm:text-base"
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
                className={`card-landing-anim absolute w-48 sm:w-56 md:w-64 lg:w-72 h-32 sm:h-40 md:h-44 lg:h-48 rounded-xl shadow-lg border-2 flex flex-row items-center justify-between p-3 sm:p-4 md:p-6 cursor-pointer transition-all duration-500
            ${
              isActive
                ? "z-30 bg-[#1D4ED8] text-white scale-100 translate-y-0 rotate-0"
                : "bg-white text-black"
            }
            ${
              isNext
                ? "z-20 translate-x-4 sm:translate-x-6 md:translate-x-8 lg:translate-x-12 translate-y-1 sm:translate-y-2 md:translate-y-3 lg:translate-y-4 rotate-1 sm:rotate-2 md:rotate-2 lg:rotate-3 scale-90 sm:scale-92 md:scale-95 lg:scale-95"
                : ""
            }
            ${
              isPrev
                ? "z-10 -translate-x-4 sm:-translate-x-6 md:-translate-x-8 lg:-translate-x-12 -translate-y-1 sm:-translate-y-2 md:-translate-y-3 lg:-translate-y-4 -rotate-1 sm:-rotate-2 md:-rotate-2 lg:-rotate-3 scale-90 sm:scale-92 md:scale-95 lg:scale-95 opacity-50"
                : ""
            }
          `}
              >
                <div>
                  <h3
                    className={`font-bold text-xs sm:text-sm md:text-base lg:text-lg ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  >
                    {card.front}
                  </h3>
                  <p
                    className={`text-xs sm:text-xs md:text-sm ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {card.back}
                  </p>
                </div>
                <img
                  src={card.icon}
                  alt={card.front}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
                />
              </div>
            );
          })}

          {/* Right Arrow */}
          <button
            onClick={() =>
              setActiveIndex((prev) => (prev + 1) % cardsData.length)
            }
            className="absolute right-0 z-40 p-1 sm:p-2 rounded-full shadow-md
             bg-black text-white 
             hover:bg-[#1D4ED8] transition text-xs sm:text-base"
          >
            &#8594;
          </button>
        </div>
      </section>

      {/* BLUE MARQUEE */}
      <div className="relative w-full mt-8 sm:mt-16">
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380095/violet_z9udug.svg"
          alt="Background Accent"
          className="absolute right-0 w-[120px] sm:w-[150px] md:w-[200px] opacity-80 z-10 hidden lg:block"
        />

        <div className="w-full h-8 sm:h-10 md:h-12 bg-[#4D9BEF] flex items-center justify-center overflow-hidden relative z-40">
          <div className="absolute whitespace-nowrap animate-marquee">
            {Array(10)
              .fill(
                <>
                  <span className="text-white text-sm sm:text-base md:text-lg font-bold mx-2 sm:mx-4">
                    Create your account for free!
                  </span>
                  <span className="text-white text-sm sm:text-base md:text-lg font-bold mx-1 sm:mx-2">
                    •
                  </span>
                </>,
              )
              .map((el, i) => (
                <React.Fragment key={i}>{el}</React.Fragment>
              ))}
          </div>
        </div>
      </div>

      <style>
        {`
        .animate-landing-left {
          animation: landing-left 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-landing-right {
          animation: landing-right 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes landing-left {
          0% { transform: translateX(-60px); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes landing-right {
          0% { transform: translateX(60px); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 1; }
        }
        /* Optionally, you can add a slight transition to the cards for a more fluid effect */
        .card-landing-anim {
          transition: transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1);
        }
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
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380124/green_ybz4wq.svg"
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
          <div
            className={`hidden lg:flex justify-center items-center relative transition-transform duration-500 animate-landing-right`}
          >
            <div className="absolute -top-14 -left-10 w-48 h-48 bg-[#4D9BEF] rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-10 -right-8 w-40 h-40 bg-[#7FB3FF] rounded-full blur-3xl opacity-70"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#9EC9FF] rounded-full blur-2xl opacity-50"></div>

            <img
              src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380239/laptop_xt0qjg.svg"
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
      <section className="w-full bg-[#FDFBEE] py-8 sm:py-12 lg:py-16 px-4 sm:px-10 lg:px-20 flex justify-center">
        <div className="p-6 sm:p-8 lg:p-10 max-w-2xl lg:max-w-3xl w-full text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
            GET STARTED WITH <span className="text-[#1D4ED8]">IMMACULEARN</span>{" "}
            TODAY
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6">
            <InputField
              placeholder="Email"
              className="w-full sm:w-80 md:w-96 lg:w-[450px] h-10 sm:h-12 bg-white border-2 border-black rounded-lg px-3 sm:px-4 text-sm sm:text-base"
            />

            <Button
              className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 font-semibold shadow text-xs sm:text-sm"
              style={{
                background: "#4D9BEF",
                color: "white",
                borderRadius: "8px",
                minWidth: "120px",
                fontSize: "0.85rem",
              }}
            >
              Create account for free!
            </Button>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER SECTION ====================== */}
      <div className="w-full mt-10 sm:mt-16 lg:mt-20 relative">
        {/* Background Image */}
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380309/schoolfooter_f2viek.png"
          className="w-full h-[180px] sm:h-auto object-cover"
          alt="Footer Background"
        />

        {/* Footer Content - Responsive and always visible */}
        <div className="absolute top-0 left-0 w-full h-full z-20 px-4 py-6 flex items-center justify-right">
          {/* Mobile: Vertical stack | Desktop: Horizontal row */}
          <div className="flex w-full max-w-[900px] gap-6 lg:gap-10 text-white">
            {/* LOGO + BRAND */}
            <div className="flex flex-col items-center lg:items-start sm:ml-10 md:ml-10 lg:ml-10 w-full lg:w-auto lg:mr-10">
              <img
                src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
                className="w-[90px] sm:w-[120px] mx-auto lg:mx-0"
                alt="Logo"
              />
            </div>

            {/* LINKS */}
            <div className="flex flex-col items-center w-full lg:w-auto lg:items-start">
              <h4 className="font-bold text-lg mb-2 text-black">Links</h4>

              <ul className=" space-y-1 text-[10px] sm:text-sm lg:text-base text-center lg:text-left">
                {" "}
                <li>
                  <a href="#home" className="hover:underline text-black">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#feature" className="hover:underline text-black">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="hover:underline text-black">
                    Benefits
                  </a>
                </li>
                <li>
                  <a href="#signup" className="hover:underline text-black">
                    Sign-up
                  </a>
                </li>
              </ul>
            </div>
            {/* GITHUB USERNAMES */}
            <div className="flex flex-col items-center w-full lg:w-auto lg:items-start">
              <h4 className="font-bold text-lg mb-2 text-black">GitHub</h4>
              <ul className=" space-y-1 text-[10px] sm:text-sm lg:text-base text-center lg:text-left">
                <li>
                  <a
                    href="https://github.com/username1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-black"
                  >
                    username1
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/username2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-black"
                  >
                    username2
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/username3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-black"
                  >
                    username3
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

<style jsx>{`
  @keyframes slide-down-menu {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-up-item {
    0% {
      transform: translateY(30px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-down-menu {
    animation: slide-down-menu 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .animate-slide-up-item {
    animation: slide-up-item 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
  }

  .animate-landing-left {
    animation: landing-left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1 !important;
    transform: translateX(0) !important;
  }
  .animate-landing-right {
    animation: landing-right 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1 !important;
    transform: translateX(0) !important;
  }
  @keyframes landing-left {
    0% {
      transform: translateX(-60px);
      opacity: 0.7;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes landing-right {
    0% {
      transform: translateX(60px);
      opacity: 0.7;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
`}</style>;

export default LandingPage;
