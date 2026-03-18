import React, { useState } from "react";
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

const PrivacyPolicy = () => {
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
            <Link to="/privacy-policy" className="text-white border-b-2 border-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-white hover:text-blue-200 transition">Terms</Link>
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
            <Link to="/privacy-policy" className="text-white font-semibold py-2 animate-slide-up-item" onClick={() => setMobileMenuOpen(false)}>
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white hover:text-blue-200 transition py-2 animate-slide-up-item" onClick={() => setMobileMenuOpen(false)}>
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
            Privacy Policy
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
                  Your privacy matters to us!
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
              How we handle your information
            </h2>
          </div>
        </div>

        <p className="text-gray-700 mb-8 text-sm sm:text-base leading-relaxed max-w-3xl">
          Welcome to <strong>{APP_NAME}</strong>. We are committed to protecting your personal
          information and your right to privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform.
        </p>

        <div className="max-w-4xl">
          <Section number={1} title="Information We Collect">
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Full name, email address, and password when you register an account.</li>
              <li>Profile picture and other optional profile information.</li>
              <li>Documents, notes, tasks, and other content you create or upload.</li>
              <li>Communications and messages exchanged within the platform.</li>
              <li>Academic information such as class membership and grades.</li>
            </ul>
            <p className="mt-2">
              We also automatically collect certain technical information when you use {APP_NAME},
              including IP address, browser type, device identifiers, and usage logs.
            </p>
          </Section>

          <Section number={2} title="How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Provide, operate, and maintain the {APP_NAME} platform.</li>
              <li>Enable real-time collaboration features between students and educators.</li>
              <li>Manage user accounts, authentication, and access control.</li>
              <li>Send important service and account-related notifications.</li>
              <li>Track and display academic progress, tasks, and grades.</li>
              <li>Improve platform performance, features, and user experience.</li>
              <li>Comply with legal obligations and resolve disputes.</li>
            </ul>
          </Section>

          <Section number={3} title="Sharing of Information">
            <p>
              We do <strong>not</strong> sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Within your academic space:</strong> Educators and enrolled students in
                the same classroom space can see each other's names, profile pictures, and
                activity-related data.
              </li>
              <li>
                <strong>Service providers:</strong> Trusted third-party services that assist
                in operating the platform under strict confidentiality agreements.
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law, court order, or
                to protect the rights and safety of users.
              </li>
            </ul>
          </Section>

          <Section number={4} title="Data Storage and Security">
            <p>
              Your data is stored on secure servers. We implement industry-standard security
              measures including encryption in transit (HTTPS/TLS) and access controls to
              protect your personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
            <p className="mt-2">
              However, no method of transmission over the Internet is 100% secure. While we
              strive to protect your data, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section number={5} title="Cookies and Tracking">
            <p>
              {APP_NAME} uses session cookies and local storage to maintain your login session
              and remember your preferences. These are essential for the platform to function
              correctly. We do not use third-party advertising cookies.
            </p>
          </Section>

          <Section number={6} title="Children's Privacy">
            <p>
              {APP_NAME} may be used by students who are minors. We collect only the minimum
              information necessary for the educational purpose of the platform. Student
              accounts in school settings require educator or administrator registration.
              We do not knowingly collect personal information from children under 13 outside
              of a school-managed context.
            </p>
          </Section>

          <Section number={7} title="Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access and review the personal information we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1D4ED8] hover:underline font-medium">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

          <Section number={8} title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify users of
              significant changes by posting a notice on the platform or via email. Continued
              use of {APP_NAME} after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section number={9} title="Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
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
                <li><Link to="/privacy-policy" className="hover:underline text-black font-semibold">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline text-black">Terms &amp; Conditions</Link></li>
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

export default PrivacyPolicy;
