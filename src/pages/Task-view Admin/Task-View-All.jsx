import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { Edit } from "lucide-react";
import Logout from "../component/logout";

const TaskViewAll = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [members, setMembers] = useState([
    { name: "Abesamis, Aaron", file: "Answers.pdf", grade: "15/20", isEditing: false },
    { name: "Adriano, Mary Ann", file: "Answers.pdf", grade: "19/20", isEditing: false },
    { name: "Adriano, Mary Ann", file: "Answers.pdf", grade: "20/20", isEditing: false },
  ]);

  // 🔹 ADDED: hide-on-scroll state
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

  const handleEditGrade = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].isEditing = !updatedMembers[index].isEditing;
    setMembers(updatedMembers);
  };

  const handleGradeChange = (index, newGrade) => {
    const updatedMembers = [...members];
    updatedMembers[index].grade = newGrade;
    setMembers(updatedMembers);
  };

  const handleGradeBlur = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].isEditing = false;
    setMembers(updatedMembers);
  };

  const handleGradeKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleGradeBlur(index);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile + Tablet Header with hide-on-scroll */}
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
          <h1 className="text-xl font-bold">Task</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            Task
          </h1>

          <div className="max-w-5xl mx-auto">
            {/* Task Info Container */}
            <div className="p-4 lg:p-8 rounded-2xl shadow-lg mt-4 lg:mt-8">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 font-inter">
                Task Information:
              </h2>
              <hr className="border-gray-700 mb-4" />

              {/* Task Title */}
              <div className="mb-10">
                <p className="font-semibold font-inter text-xl lg:text-3xl">
                  Week 8 Individual Activity
                </p>

                <p className="text-sm opacity-70 mt-2 flex gap-10">
                  Due Date:{" "}
                  <span className="opacity-100">November 20, 2025</span>
                </p>

                <p className="text-sm opacity-70 mt-2 flex gap-5">
                  Assigned By:{" "}
                  <span className="opacity-100">Zeldrick Delos Santos</span>
                </p>
              </div>

              {/* Members Attachments */}
              <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 font-inter">
                Members Attachments:
              </h3>
              <hr className="border-gray-700 mb-4" />

              {/* ================= MOBILE + TABLET (CARD VIEW) ================= */}
              <div className="flex flex-col gap-4 lg:hidden">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="bg-[#1E222A] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-sm text-gray-300 mt-1">{member.file}</p>
                      </div>
                      {member.isEditing ? (
                        <input
                          type="text"
                          value={member.grade}
                          onChange={(e) => handleGradeChange(index, e.target.value)}
                          onBlur={() => handleGradeBlur(index)}
                          onKeyPress={(e) => handleGradeKeyPress(e, index)}
                          className="bg-[#2A2A2A] text-white px-2 py-1 rounded w-16 text-sm"
                          autoFocus
                        />
                      ) : (
                        <p className="font-bold text-sm">{member.grade}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditGrade(index)}
                      className="text-blue-400 hover:underline flex items-center gap-1 text-sm px-2 py-1 w-fit justify-self-start"
                    >
                      <Edit className="w-3 h-3" />
                      Edit Grade
                    </button>
                  </div>
                ))}
              </div>

              {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-4 mb-3 opacity-70 text-sm">
                  <p>Name</p>
                  <p>File Uploaded</p>
                  <p>Grade</p>
                  <p></p>
                </div>

                {/* Members Rows */}
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 mb-4 border-b border-gray-800 text-sm"
                  >
                    <p>{member.name}</p>
                    <p>{member.file}</p>
                    {member.isEditing ? (
                      <input
                        type="text"
                        value={member.grade}
                        onChange={(e) => handleGradeChange(index, e.target.value)}
                        onBlur={() => handleGradeBlur(index)}
                        onKeyPress={(e) => handleGradeKeyPress(e, index)}
                        className="bg-[#2A2A2A] text-white px-2 py-1 rounded w-20"
                        autoFocus
                      />
                    ) : (
                      <p>{member.grade}</p>
                    )}

                    <button
                      onClick={() => handleEditGrade(index)}
                      className="text-blue-400 hover:underline flex items-center gap-1 text-sm px-2 py-1 w-fit justify-self-end"
                    >
                      <Edit className="w-3 h-3" />
                      Edit Grade
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default TaskViewAll;
