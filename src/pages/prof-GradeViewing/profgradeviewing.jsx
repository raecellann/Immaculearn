import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";

const ProfGradeRecordPage = () => {
  const [yearLevel, setYearLevel] = useState("1ST YEAR");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const subjectsByYear = {
    "1ST YEAR": [
      "BIOLOGY-1SY2025-2026",
      "MMW (2025-2026)",
      "INTRO TO PROGRAMMING (2025-2026)",
    ],
    "2ND YEAR": [
      "DATAStruct (2025-2026)",
      "OOP (2025-2026)",
      "DISCRETE MATH (2025-2026)",
    ],
    "3RD YEAR": [
      "CS ELEC1 - 1SY2025-2026",
      "OPERATING SYSTEMS (2025-2026)",
      "BUSINTEG-1SY2025-2026",
    ],
    "4TH YEAR": [
      "THESIS 1 (2025-2026)",
      "CAPSTONE (2025-2026)",
      "IT PRACTICUM (2025-2026)",
    ],
  };

  const studentGrades = [
    { name: "Abesamis, Aaron", prelim: 90, midterm: 89, preFinal: 85, final: 90 },
    { name: "Adriano, Mary Ann", prelim: 85, midterm: 87, preFinal: 80, final: 90 },
    { name: "Abesamis, Aaron", prelim: 90, midterm: 89, preFinal: 85, final: 90 },
    { name: "Adriano, Mary Ann", prelim: 85, midterm: 87, preFinal: 80, final: 90 },
  ];

  /* 🔹 ADDED — STICKY + HIDE ON SCROLL */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile / Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile / Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-8">

        {/* 🔹 MOBILE / TABLET STICKY HEADER */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold flex-1">Grade Record</h1>
        </div>

        {/* 🔹 Spacer */}
        <div className="lg:hidden h-16" />

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6 relative">
          <h1 className="text-4xl font-bold text-center flex-1">Grade Record</h1>
        </div>

        {/* Year Level & Back */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            {selectedSubject && (
              <button
                onClick={() => setSelectedSubject(null)}
                className="text-gray-300 text-sm flex items-center gap-1 hover:text-white transition bg-transparent border-none"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Year Level:</label>
            <select
              value={yearLevel}
              onChange={(e) => {
                setYearLevel(e.target.value);
                setSelectedSubject(null);
              }}
              className="bg-[#1F242D] border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-white appearance-none"
            >
              <option>1ST YEAR</option>
              <option>2ND YEAR</option>
              <option>3RD YEAR</option>
              <option>4TH YEAR</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-700 mb-6"></div>

        {/* Folder View */}
        {!selectedSubject && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-center">
            {subjectsByYear[yearLevel].map((subject, index) => (
              <button
                key={index}
                onClick={() => setSelectedSubject(subject)}
                className="w-full bg-[#1F242D] hover:bg-[#2A2E36] text-left px-4 py-3 rounded-md flex items-center gap-3 transition-all shadow-md"
              >
                <span className="text-yellow-400 text-xl">📁</span>
                <span className="font-semibold text-sm">{subject}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grades */}
        {selectedSubject && (
          <>
            {/* Mobile / Tablet Cards */}
            <div className="lg:hidden space-y-4">
              {studentGrades.map((student, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E222A] p-4 rounded-lg border border-gray-700"
                >
                  <p className="font-semibold mb-1">{student.name}</p>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Prelim: {student.prelim}</p>
                    <p>Midterm: {student.midterm}</p>
                    <p>Pre-Final: {student.preFinal}</p>
                    <p>Final: {student.final}</p>
                  </div>
                  <button className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-md text-sm">
                    Edit Grade
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-300">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4">Prelim</th>
                    <th className="py-3 px-4">Midterm</th>
                    <th className="py-3 px-4">Pre-Final</th>
                    <th className="py-3 px-4">Final</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#1F242D] transition"
                    >
                      <td className="py-2 px-4 text-left">{student.name}</td>
                      <td>{student.prelim}</td>
                      <td>{student.midterm}</td>
                      <td>{student.preFinal}</td>
                      <td>{student.final}</td>
                      <td>
                        <button className="text-blue-400 hover:text-blue-300 text-sm bg-transparent border-none p-0">
                          Edit Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfGradeRecordPage;
