import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";

const GradeViewing = () => {
  const { courseSpaces } = useSpace();
  const { user } = useUser();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);

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

  const handleViewGrades = (space) => {
    setSelectedSubject(space);
    // For student view, we'll simulate getting the student's grades
    // In a real app, this would come from an API
    const mockGrades = {
      prelim: '85',
      midterm: '88',
      preFinal: '90',
      final: '92'
    };
    setStudentGrades([mockGrades]);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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
          <h1 className="text-xl font-bold flex-1">Grades Viewing</h1>
        </div>

        {/* 🔹 Spacer */}
        <div className="lg:hidden h-16" />

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6 relative">
          <h1 className="text-4xl font-bold text-center flex-1">Grades Viewing</h1>
        </div>

        {/* Folder View */}
        {!selectedSubject && (
          <>
            <div className="mb-12 mt-8">
              <h2 className="text-xl font-semibold mb-4 text-white pb-2">
                Course Space
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
              {courseSpaces
                .filter(space => 
                  space.members?.some(member => 
                    member.account_id === user?.id && member.role !== "Professor"
                  )
                ).length === 0 ? (
                <div className="col-span-full bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                  <span className="text-4xl mb-4 block">📚</span>
                  <p className="text-lg font-medium mb-2">No Course Spaces Yet</p>
                  <p className="text-sm">You haven't joined any course spaces. Contact your professor to get started!</p>
                </div>
              ) : (
                courseSpaces
                  .filter(space => 
                    space.members?.some(member => 
                      member.account_id === user?.id && member.role !== "Professor"
                    )
                  )
                  .map((space, index) => (
                    <div
                      key={`course-space-${index}`}
                      className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                      onClick={() => handleViewGrades(space)}
                    >
                      <span className="text-xl">📊</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg truncate overflow-hidden whitespace-nowrap">
                          {space.space_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          View Grades
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}

        {/* Grades View */}
        {selectedSubject && (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-2 px-4 py-2 bg-transparent border-none text-white hover:text-gray-300 transition"
              >
                <span className="text-xl">←</span>
                <span>Back</span>
              </button>
            </div>

            {/* Subject Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedSubject.space_name}
              </h2>
              <p className="text-gray-400">
                Professor: {selectedSubject.members?.find(m => m.role === "Professor")?.full_name || 'N/A'}
              </p>
            </div>

            {/* Mobile / Tablet View */}
            <div className="lg:hidden space-y-4">
              {studentGrades.map((grades, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E222A] p-4 rounded-lg border border-gray-700"
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#1F242D] p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Prelim</p>
                      <p className="font-bold">{grades.prelim || '-'}</p>
                    </div>
                    <div className="bg-[#1F242D] p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Midterm</p>
                      <p className="font-bold">{grades.midterm || '-'}</p>
                    </div>
                    <div className="bg-[#1F242D] p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Pre-Final</p>
                      <p className="font-bold">{grades.preFinal || '-'}</p>
                    </div>
                    <div className="bg-[#1F242D] p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Final</p>
                      <p className="font-bold">{grades.final || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-300">
                    <th className="py-3 px-4 text-left">Period</th>
                    <th className="py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((grades, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 text-left font-semibold">Prelim</td>
                        <td className="py-3 px-4">{grades.prelim || '-'}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 text-left font-semibold">Midterm</td>
                        <td className="py-3 px-4">{grades.midterm || '-'}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 text-left font-semibold">Pre-Final</td>
                        <td className="py-3 px-4">{grades.preFinal || '-'}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 text-left font-semibold">Final</td>
                        <td className="py-3 px-4">{grades.final || '-'}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradeViewing;
