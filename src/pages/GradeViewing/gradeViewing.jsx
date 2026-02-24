import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const GradeViewing = () => {
  const { courseSpaces } = useSpace();
  const { user } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
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
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-8">

        {/* 🔹 MOBILE / TABLET STICKY HEADER */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            ☰
          </button>
          <h1 className="text-xl font-bold flex-1" style={{ color: isDarkMode ? "white" : currentColors.text }}>Grades Viewing</h1>
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
              <h2 className="text-xl font-semibold mb-4 pb-2" style={{ color: currentColors.text }}>
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
                <div className="col-span-full rounded-xl p-10 text-center border border-dashed" style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                  color: currentColors.textSecondary
                }}>
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
                      className="border rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                        color: currentColors.text
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentColors.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentColors.surface}
                      onClick={() => handleViewGrades(space)}
                    >
                      <span className="text-xl">📊</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg truncate overflow-hidden whitespace-nowrap">
                          {space.space_name}
                        </p>
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>
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
                className="flex items-center gap-2 px-4 py-2 bg-transparent border-none transition"
                style={{ color: currentColors.text }}
                onMouseEnter={(e) => e.currentTarget.style.color = currentColors.textSecondary}
                onMouseLeave={(e) => e.currentTarget.style.color = currentColors.text}
              >
                <span className="text-xl">←</span>
                <span>Back</span>
              </button>
            </div>

            {/* Subject Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: currentColors.text }}>
                {selectedSubject.space_name}
              </h2>
              <p style={{ color: currentColors.textSecondary }}>
                Professor: {selectedSubject.members?.find(m => m.role === "Professor")?.full_name || 'N/A'}
              </p>
            </div>

            {/* Mobile / Tablet View */}
            <div className="lg:hidden space-y-4">
              {studentGrades.map((grades, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc' }}>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>Prelim</p>
                      <p className="font-bold" style={{ color: currentColors.text }}>{grades.prelim || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc' }}>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>Midterm</p>
                      <p className="font-bold" style={{ color: currentColors.text }}>{grades.midterm || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc' }}>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>Pre-Final</p>
                      <p className="font-bold" style={{ color: currentColors.text }}>{grades.preFinal || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc' }}>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>Final</p>
                      <p className="font-bold" style={{ color: currentColors.text }}>{grades.final || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-center text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: currentColors.border }}>
                    <th className="py-3 px-4 text-left" style={{ color: currentColors.textSecondary }}>Period</th>
                    <th className="py-3 px-4" style={{ color: currentColors.textSecondary }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((grades, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <td className="py-3 px-4 text-left font-semibold" style={{ color: currentColors.text }}>Prelim</td>
                        <td className="py-3 px-4" style={{ color: currentColors.text }}>{grades.prelim || '-'}</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <td className="py-3 px-4 text-left font-semibold" style={{ color: currentColors.text }}>Midterm</td>
                        <td className="py-3 px-4" style={{ color: currentColors.text }}>{grades.midterm || '-'}</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <td className="py-3 px-4 text-left font-semibold" style={{ color: currentColors.text }}>Pre-Final</td>
                        <td className="py-3 px-4" style={{ color: currentColors.text }}>{grades.preFinal || '-'}</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: currentColors.border }}>
                        <td className="py-3 px-4 text-left font-semibold" style={{ color: currentColors.text }}>Final</td>
                        <td className="py-3 px-4" style={{ color: currentColors.text }}>{grades.final || '-'}</td>
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
