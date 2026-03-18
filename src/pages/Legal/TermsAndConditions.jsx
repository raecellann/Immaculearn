import { useState } from "react";
import React from "react";
import { Link } from "react-router";
import Button from "@/pages/component/Button";

const LAST_UPDATED = "March 19, 2025";
const APP_NAME = "ImmacuLearn";
const CONTACT_EMAIL = "immaculern@gmail.com";

const Section = ({ number, title, children }) => (
  <div className="bg-[#E8F1FA] p-6 rounded-lg shadow mb-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-[#1D4ED8] text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0">
        {number}
      </div>
      <h2 className="text-base sm:text-lg font-bold text-[#1D4ED8]">{title}</h2>
    </div>
    <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-2 ml-11">
      {children}
    </div>
  </div>
);

const TermsAndConditions = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="font-sans min-h-screen relative overflow-hidden bg-[#FDFBEE]">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <div className="w-full text-white py-4 px-4 sm:px-10 relative overflow-hidden z-10">
        <header className="flex justify-between items-center w-full relative z-20">
          <Link to="/" className="flex items-center gap-2 mt-2">
            <img
              src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
              alt="Logo"
              className="w-[60px] h-[45px] sm:w-[80px] sm:h-[60px]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 sm:gap-10 font-medium text-white absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="text-white hover:text-blue-200 transition">Home</Link>
            <Link to="/privacy-policy" className="text-white hover:text-blue-200 transition">Privacy Policy</Link>
            <Link to="/terms" className="text-white border-b-2 border-white transition">Terms</Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl focus:outline-none z-50 relative"
          >
            <div className="w-6 h-5 flex flex-col justify-center items-center">
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>

          {/* Desktop Login */}
          <Link to="/login" className="hidden md:block">
            <Button
              className="px-4 sm:px-5 py-2 text-white"
              style={{
                background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: "10px",
                fontSize: "14px",
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

      {/* ── MOBILE MENU ────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1D4ED8] bg-opacity-95 backdrop-blur-sm z-50 animate-slide-down-menu">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <img
              src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
              alt="Logo"
              className="w-[60px] h-[45px]"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-2xl focus:outline-none hover:text-blue-200"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col py-4 px-4 space-y-3">
            <Link to="/" className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/privacy-policy" className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item" onClick={() => setMobileMenuOpen(false)}>
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white font-semibold py-2 animate-slide-up-item" onClick={() => setMobileMenuOpen(false)}>
              Terms &amp; Conditions
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                className="px-4 py-2 w-full animate-slide-up-item"
                style={{
                  background: "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
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

      {/* ── HERO BANNER ────────────────────────────────────────────────────── */}
      <div className="w-full relative">
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1769180611/Group_124_u66wsj.png"
          alt="Banner"
          className="w-full h-[160px] sm:h-[200px] md:h-[220px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Terms and Conditions
          </h1>
          <p className="text-white text-sm sm:text-base mt-1 opacity-90">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* ── MARQUEE ────────────────────────────────────────────────────────── */}
      <div className="w-full h-8 sm:h-10 bg-[#4D9BEF] flex items-center justify-center overflow-hidden relative">
        <div className="absolute whitespace-nowrap animate-marquee">
          {Array(10)
            .fill(null)
            .map((_, i) => (
              <React.Fragment key={i}>
                <span className="text-white text-sm sm:text-base font-bold mx-2 sm:mx-4">
                  Please read our terms carefully!
                </span>
                <span className="text-white font-bold mx-2">•</span>
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#FDFBEE] px-4 sm:px-10 lg:px-28 py-10 sm:py-14">

        {/* Yellow label */}
        <div className="mb-8">
          <div className="bg-[#FFE486] px-6 py-2 rounded-full shadow-md border-2 border-black inline-block max-w-full">
            <h2 className="text-base sm:text-lg md:text-xl font-bold font-grotesque text-black whitespace-normal break-words">
              Rules and guidelines for using {APP_NAME}
            </h2>
          </div>
        </div>

        <p className="text-gray-700 mb-8 text-sm sm:text-base leading-relaxed max-w-3xl">
          Please read these Terms and Conditions carefully before using{" "}
          <strong>{APP_NAME}</strong>. By accessing or using our platform, you agree to be
          bound by these terms. If you do not agree with any part of these terms, you may
          not use {APP_NAME}.
        </p>

        <div className="max-w-4xl">
          <Section number={1} title="Acceptance of Terms">
            <p>
              By creating an account or using {APP_NAME}, you confirm that you have read,
              understood, and agree to these Terms and Conditions, as well as our{" "}
              <Link to="/privacy-policy" className="text-[#1D4ED8] hover:underline font-medium">
                Privacy Policy
              </Link>
              . These terms apply to all users — students, educators, and administrators.
            </p>
          </Section>

          <Section number={2} title="Description of Service">
            <p>
              {APP_NAME} is a collaborative educational platform designed to facilitate
              learning between students and educators. The platform provides tools for:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Real-time collaborative document editing.</li>
              <li>Task and activity management (quizzes, group activities, exams).</li>
              <li>File sharing and classroom organization.</li>
              <li>Grade tracking and progress monitoring.</li>
              <li>Communication tools between students and educators.</li>
            </ul>
          </Section>

          <Section number={3} title="User Accounts">
            <p>
              To access {APP_NAME}, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Providing accurate and complete registration information.</li>
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activity that occurs under your account.</li>
              <li>Notifying us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts that violate these terms
              or that have been inactive for an extended period.
            </p>
          </Section>

          <Section number={4} title="Acceptable Use">
            <p>You agree to use {APP_NAME} only for lawful, educational purposes. You must not:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Upload or share content that is illegal, offensive, or infringes on intellectual property rights.</li>
              <li>Harass, bully, or intimidate other users.</li>
              <li>Attempt to gain unauthorized access to other accounts or platform systems.</li>
              <li>Use the platform to distribute spam, malware, or disruptive content.</li>
              <li>Engage in academic dishonesty, including cheating or plagiarism.</li>
              <li>Scrape, copy, or redistribute platform content without permission.</li>
              <li>Interfere with the proper functioning of the platform.</li>
            </ul>
          </Section>

          <Section number={5} title="User Content">
            <p>
              You retain ownership of the content (documents, assignments, files) you create
              on {APP_NAME}. By posting content, you grant {APP_NAME} a limited, non-exclusive
              license to store, display, and share your content within your classroom space
              as necessary to provide the service.
            </p>
            <p className="mt-2">
              You are solely responsible for the content you post. We reserve the right to
              remove content that violates these terms.
            </p>
          </Section>

          <Section number={6} title="Educator and Administrator Responsibilities">
            <p>Educators and administrators using {APP_NAME} agree to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Use the platform responsibly in an educational context.</li>
              <li>Ensure that student data handled through the platform complies with applicable student privacy laws.</li>
              <li>Not share student account information with unauthorized parties.</li>
              <li>Use grading and activity features fairly and in accordance with institutional standards.</li>
            </ul>
          </Section>

          <Section number={7} title="Intellectual Property">
            <p>
              {APP_NAME} and its original content, features, and functionality are owned by
              the {APP_NAME} development team and are protected by applicable intellectual
              property laws. You may not copy, reproduce, or distribute {APP_NAME}'s platform
              code, design, or branding without explicit written permission.
            </p>
          </Section>

          <Section number={8} title="Availability and Modifications">
            <p>We reserve the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Modify, suspend, or discontinue any part of the platform at any time.</li>
              <li>Update these Terms and Conditions with reasonable notice to users.</li>
              <li>Perform scheduled maintenance that may temporarily limit access.</li>
            </ul>
          </Section>

          <Section number={9} title="Disclaimer of Warranties">
            <p>
              {APP_NAME} is provided on an <strong>"as is"</strong> and{" "}
              <strong>"as available"</strong> basis without warranties of any kind. We do not
              warrant that the platform will be error-free, uninterrupted, or free from
              harmful components.
            </p>
          </Section>

          <Section number={10} title="Limitation of Liability">
            <p>
              To the fullest extent permitted by law, {APP_NAME} and its developers shall
              not be liable for any indirect, incidental, or consequential damages arising
              from your use of the platform, including loss of data, grades, or academic
              materials.
            </p>
          </Section>

          <Section number={11} title="Termination">
            <p>
              We reserve the right to terminate or suspend your account at our discretion
              for conduct that violates these Terms or is harmful to other users, the
              platform, or third parties.
            </p>
          </Section>

          <Section number={12} title="Governing Law">
            <p>
              These Terms and Conditions are governed by the laws of the Republic of the
              Philippines. Any disputes arising from these terms shall be subject to the
              exclusive jurisdiction of Philippine courts.
            </p>
          </Section>

          <Section number={13} title="Contact Us">
            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
            <div className="mt-3 p-4 rounded-lg bg-white border border-blue-200">
              <p className="font-semibold text-[#1D4ED8]">{APP_NAME} Support</p>
              <p className="mt-1 text-sm">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1D4ED8] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </Section>

          
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div className="w-full mt-10 sm:mt-16 relative">
        <img
          src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766380309/schoolfooter_f2viek.png"
          className="w-full h-[180px] sm:h-auto object-cover"
          alt="Footer Background"
        />
        <div className="absolute top-0 left-0 w-full h-full z-20 px-4 py-6 flex items-center">
          <div className="flex w-full max-w-[900px] gap-6 lg:gap-10 text-white">
            <div className="flex flex-col items-center lg:items-start sm:ml-10 md:ml-10 lg:ml-10 w-full lg:w-auto lg:mr-10">
              <img
                src="https://res.cloudinary.com/diws5bcu6/image/upload/v1766379259/LOGO_ozziow.png"
                className="w-[90px] sm:w-[120px] mx-auto lg:mx-0"
                alt="Logo"
              />
            </div>
            <div className="flex flex-col items-center w-full lg:w-auto lg:items-start">
              <h4 className="font-bold text-lg mb-2 text-black">Links</h4>
              <ul className="space-y-1 text-[10px] sm:text-sm lg:text-base text-center lg:text-left">
                <li><Link to="/" className="hover:underline text-black">Home</Link></li>
                <li><Link to="/login" className="hover:underline text-black">Log in</Link></li>
                <li><Link to="/privacy-policy" className="hover:underline text-black">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline text-black font-semibold">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center w-full lg:w-auto lg:items-start">
              <h4 className="font-bold text-lg mb-2 text-black">GitHub</h4>
              <ul className="space-y-1 text-[10px] sm:text-sm lg:text-base text-center lg:text-left">
                {["Wesmabe1129", "raecellann", "zjdelossantos", "nathanielfaborada"].map((u) => (
                  <li key={u}>
                    <a href={`https://github.com/${u}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-black">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-down-menu {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-up-item {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down-menu {
          animation: slide-down-menu 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .animate-slide-up-item {
          animation: slide-up-item 0.4s cubic-bezier(0.4,0,0.2,1) 0.3s forwards;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TermsAndConditions;
