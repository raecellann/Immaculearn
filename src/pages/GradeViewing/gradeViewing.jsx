import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const GradeViewing = () => {
  const { courseSpaces, one_student_remarks, oneremarksLoading, setCurrentSpace } = useSpace();
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

  const handleViewGrades = async (space) => {
    console.log(space);
    setCurrentSpace(space);
    setSelectedSubject(space);
    setStudentGrades([]);
  };

  useEffect(() => {
    if (!selectedSubject) return;
    if (oneremarksLoading) return;
    setStudentGrades(Array.isArray(one_student_remarks) ? one_student_remarks : []);
  }, [one_student_remarks, oneremarksLoading, selectedSubject]);

  // Get grade color based on value
  const getGradeColor = (grade) => {
    if (!grade || grade === "-" || grade === "N/A") return currentColors.text;
    const numGrade = parseInt(grade);
    if (numGrade >= 75) return "#10b981"; // green
    return "#ef4444"; // red
  };

  // Get display value for grade with N/A logic
  const getGradeDisplay = (grades, currentPeriod) => {
    // Check if any period has a grade
    const hasAnyGrade = grades.prelim || grades.midterm || grades.prefinals;

    if (!hasAnyGrade) return "-";

    // If current period has a grade, show it
    if (grades[currentPeriod]) return grades[currentPeriod];

    // If another period has a grade but current doesn't, show N/A
    return "N/A";
  };

  // Format name to show surname first
  const formatName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return fullName;
    const surname = parts[parts.length - 1];
    const givenNames = parts.slice(0, -1).join(" ");
    return `${surname}, ${givenNames}`;
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
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
      <div className="flex-1 flex flex-col">
        {/* Mobile / Tablet Sticky Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">Grades Viewing</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          {/* Desktop Header */}
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Grades Viewing
          </h1>

          {/* Folder View */}
          {!selectedSubject && (
            <div className="mb-12 mt-8">
              <h2 className="text-xl font-semibold mb-4">Course Space</h2>

              {courseSpaces.filter((space) =>
                space.members?.some(
                  (member) =>
                    member.account_id === user?.id &&
                    member.role !== "Professor",
                ),
              ).length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: currentColors.border,
                  }}
                >
                  <span className="text-4xl mb-4 block">📚</span>
                  <p className="text-lg font-medium mb-2">
                    No Course Spaces Yet
                  </p>
                  <p className="text-sm">
                    You haven't joined any course spaces. Contact your professor
                    to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {courseSpaces
                    .filter((space) =>
                      space.members?.some(
                        (member) =>
                          member.account_id === user?.id &&
                          member.role !== "Professor",
                      ),
                    )
                    .map((space, index) => (
                      <div
                        key={`course-space-${index}`}
                        className="border rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                          color: currentColors.text,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            currentColors.hover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            currentColors.surface)
                        }
                        onClick={() => handleViewGrades(space)}
                      >
                        <span className="text-xl">📊</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg truncate overflow-hidden whitespace-nowrap">
                            {space.space_name}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: currentColors.textSecondary }}
                          >
                            View Grades
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
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
                >
                  <span className="text-xl">←</span>
                  <span>Back</span>
                </button>
              </div>

              <h2 className="text-xl font-semibold mb-4">
                {selectedSubject.space_name}
              </h2>

              {/* Mobile Cards Only */}
              <div className="sm:hidden space-y-4">
                {studentGrades.map((student, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                    }}
                  >
                    <p className="font-semibold mb-3">
                      {formatName(student.fullname)}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#1F242D" : "#f8fafc",
                        }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Prelim
                        </p>
                        <p
                          className="font-bold"
                          style={{
                            color: getGradeColor(
                              getGradeDisplay(student?.grades, "prelim"),
                            ),
                          }}
                        >
                          {getGradeDisplay(student?.grades, "prelim")}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#1F242D" : "#f8fafc",
                        }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Midterm
                        </p>
                        <p
                          className="font-bold"
                          style={{
                            color: getGradeColor(
                              getGradeDisplay(student?.grades, "midterm"),
                            ),
                          }}
                        >
                          {getGradeDisplay(student?.grades, "midterm")}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#1F242D" : "#f8fafc",
                        }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Pre-Final
                        </p>
                        <p
                          className="font-bold"
                          style={{
                            color: getGradeColor(
                              getGradeDisplay(student?.grades, "prefinals"),
                            ),
                          }}
                        >
                          {getGradeDisplay(student?.grades, "prefinals")}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode ? "#1F242D" : "#f8fafc",
                        }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Final
                        </p>
                        <p
                          className="font-bold"
                          style={{
                            color: getGradeColor(
                              getGradeDisplay(student?.grades, "final"),
                            ),
                          }}
                        >
                          {getGradeDisplay(student?.grades, "final")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet & Desktop Table */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div
                      className="overflow-hidden shadow-sm rounded-lg border"
                      style={{ borderColor: currentColors.border }}
                    >
                      <table
                        className="min-w-full divide-y"
                        style={{ borderColor: currentColors.border }}
                      >
                        <thead
                          style={{
                            backgroundColor: currentColors.surface,
                            borderBottom: `2px solid ${currentColors.border}`,
                          }}
                        >
                          <tr>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold border-r"
                              style={{
                                color: currentColors.text,
                                borderColor: currentColors.border,
                              }}
                            >
                              Name
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold border-r"
                              style={{
                                color: currentColors.text,
                                borderColor: currentColors.border,
                              }}
                            >
                              Prelim
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold border-r"
                              style={{
                                color: currentColors.text,
                                borderColor: currentColors.border,
                              }}
                            >
                              Midterm
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold border-r"
                              style={{
                                color: currentColors.text,
                                borderColor: currentColors.border,
                              }}
                            >
                              Pre-Final
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold"
                              style={{
                                color: currentColors.text,
                              }}
                            >
                              Final
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className="divide-y"
                          style={{ borderColor: currentColors.border }}
                        >
                          {studentGrades.map((student, index) => (
                            <tr
                              key={index}
                              style={{
                                backgroundColor:
                                  index % 2 === 0
                                    ? currentColors.background
                                    : currentColors.hover,
                                transition: "background-color 0.2s ease",
                              }}
                            >
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm border-r font-semibold"
                                style={{
                                  color: currentColors.text,
                                  borderColor: currentColors.border,
                                }}
                              >
                                {formatName(student.fullname)}
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                style={{
                                  borderColor: currentColors.border,
                                  color: getGradeColor(
                                    getGradeDisplay(student?.grades, "prelim"),
                                  ),
                                }}
                              >
                                {getGradeDisplay(student?.grades, "prelim")}
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                style={{
                                  borderColor: currentColors.border,
                                  color: getGradeColor(
                                    getGradeDisplay(student?.grades, "midterm"),
                                  ),
                                }}
                              >
                                {getGradeDisplay(student?.grades, "midterm")}
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                style={{
                                  borderColor: currentColors.border,
                                  color: getGradeColor(
                                    getGradeDisplay(
                                      student?.grades,
                                      "prefinals",
                                    ),
                                  ),
                                }}
                              >
                                {getGradeDisplay(student?.grades, "prefinals")}
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center font-medium"
                                style={{
                                  color: getGradeColor(
                                    getGradeDisplay(student?.grades, "final"),
                                  ),
                                }}
                              >
                                {getGradeDisplay(student?.grades, "final")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeViewing;
