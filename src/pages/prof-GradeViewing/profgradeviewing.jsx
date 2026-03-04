import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { toast } from "react-toastify";

const ProfGradeRecordPage = () => {
  const { courseSpaces, student_remarks, setCurrentSpace, updateStudentGrades } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    prelim: "",
    midterm: "",
    preFinal: "",
    final: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const handleEditGrade = (student) => {
    setEditingStudent(student.account_id);
    setEditForm({
      prelim: student?.grades.prelim || "",
      midterm: student?.grades.midterm || "",
      preFinal: student?.grades.preFinal || "",
    });
  };

  const handleSaveGrade = () => {
    // Validate grades before saving
    const isValid = Object.values(editForm).every((value) => {
      if (value === "") return true; // Allow empty values
      const numValue = parseInt(value);
      return numValue >= 30 && numValue <= 100;
    });

    if (!isValid) {
      toast.error("Grades must be between 30 and 100");
      return;
    }

    // Prepare grades data for mutation
    const gradesData = {
      student_id: editingStudent,
      space_uuid: selectedSubject.space_uuid,
      prelim: editForm.prelim ? parseInt(editForm.prelim) : 0,
      midterm: editForm.midterm ? parseInt(editForm.midterm) : 0,
      prefinals: editForm.preFinal ? parseInt(editForm.preFinal) : 0,
    };

    try {
      updateStudentGrades.mutate(gradesData);
      setEditingStudent(null);
      setEditForm({ prelim: "", midterm: "", preFinal: "", final: "" });

    } catch(err) {
      throw err
    } finally {
      toast.success("Successfully Update Students Grade")
    }

  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditForm({ prelim: "", midterm: "", preFinal: "", final: "" });
  };

  const handleInputChange = (field, value) => {
    if (value === "" || /^\d*$/.test(value)) {
      // Allow empty value or any number, but validate on save
      setEditForm((prev) => ({ ...prev, [field]: value }));
    }
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

    const hasAnyGrade = grades.prelim || grades.midterm || grades.prefinal;

    if (!hasAnyGrade) return "-";

    // If current period has a grade, show it
    if (grades[currentPeriod]) return grades[currentPeriod];

    // If another period has a grade but current doesn't, show N/A
    return "N/A";
  };

  // Filter students based on search query
  const filteredStudents = student_remarks.filter((student) =>
    student.fullname.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
            <h1 className="text-lg font-bold">Grade Record</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          {/* Desktop Header */}
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Grade Record
          </h1>

          {/* Folder View */}
          {!selectedSubject && (
            <div className="mb-8 mt-16 sm:mt-20 lg:mt-24">
              <h2 className="text-xl font-semibold mb-4">Course Space</h2>

              {courseSpaces.length === 0 ? (
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
                    You haven't created any course spaces. Create your first
                    course space to start managing grades!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {courseSpaces.map((space, index) => {
                    // ✅ FIX: Only count members whose role is strictly "Student"
                    const studentMembers = (space.members || []).filter(
                      (member) => member.role === "student",
                    );

                    return (
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
                        onClick={() => {
                          setSelectedSubject(space);
                          setCurrentSpace(space);
                          // ✅ FIX: Only initialize grades for actual students
                          const grades = studentMembers.map((member) => ({
                            name: member.full_name,
                            accountId: member.account_id,
                            prelim: "",
                            midterm: "",
                            preFinal: "",
                            final: "",
                          }));
                          setStudentGrades(grades);
                        }}
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
                            {studentMembers.length} Student
                            {studentMembers.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: currentColors.surface,
                      border: `1px solid ${isDarkMode ? "#3B4457" : "black"}`,
                      color: currentColors.text,
                    }}
                  />
                  <span
                    className="absolute left-3 top-2.5"
                    style={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    🔍
                  </span>
                </div>
              </div>

              {/* No students state */}
              {filteredStudents.length === 0 ? (
                <div
                  className="rounded-xl p-10 text-center border border-dashed"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: currentColors.border,
                  }}
                >
                  <span className="text-4xl mb-4 block">🎓</span>
                  <p className="text-lg font-medium mb-2">No Students Yet</p>
                  <p className="text-sm">
                    No students have joined this course space yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards Only */}
                  <div className="sm:hidden space-y-4">
                    {student_remarks?.map((student, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                        }}
                      >
                        <p className="font-semibold mb-1">
                          {formatName(student.fullname)}
                        </p>
                        {editingStudent === student.account_id ? (
                          <div className="space-y-2">
                            {["prelim", "midterm", "preFinal", "final"].map(
                              (field) => (
                                <div
                                  key={field}
                                  className="flex items-center gap-2"
                                >
                                  <label
                                    className="text-xs w-16 capitalize"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    {field}:
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm[field]}
                                    onChange={(e) =>
                                      handleInputChange(field, e.target.value)
                                    }
                                    className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
                                    style={{
                                      backgroundColor: isDarkMode
                                        ? "#1F242D"
                                        : "#f8fafc",
                                      border: `1px solid ${currentColors.border}`,
                                      color: currentColors.text,
                                    }}
                                    placeholder="0-100"
                                  />
                                </div>
                              ),
                            )}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleSaveGrade}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-md text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded-md text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="text-sm space-y-1"
                              style={{ color: currentColors.textSecondary }}
                            >
                              <p
                                style={{
                                  color: getGradeColor(
                                    getGradeDisplay(student?.grades, "prelim"),
                                  ),
                                }}
                              >
                                Prelim:{" "}
                                {getGradeDisplay(student?.grades, "prelim")}
                              </p>
                              <p
                                style={{
                                  color: getGradeColor(
                                    getGradeDisplay(student?.grades, "midterm"),
                                  ),
                                }}
                              >
                                Midterm:{" "}
                                {getGradeDisplay(student?.grades, "midterm")}
                              </p>
                              <p
                                style={{
                                  color: getGradeColor(
                                    getGradeDisplay(
                                      student?.grades,
                                      "prefinal",
                                    ),
                                  ),
                                }}
                              >
                                Pre-Final:{" "}
                                {getGradeDisplay(student?.grades, "prefinals")}
                              </p>
                            </div>
                            <button
                              onClick={() => handleEditGrade(student)}
                              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-md text-sm"
                            >
                              Edit Grade
                            </button>
                          </>
                        )}
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
                                  className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold border-r"
                                  style={{
                                    color: currentColors.text,
                                    borderColor: currentColors.border,
                                  }}
                                >
                                  Final
                                </th>
                                <th
                                  className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold"
                                  style={{
                                    color: currentColors.text,
                                  }}
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody
                              className="divide-y"
                              style={{ borderColor: currentColors.border }}
                            >
                              {student_remarks?.map((student, index) => (
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
                                    className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm border-r"
                                    style={{
                                      color: currentColors.text,
                                      borderColor: currentColors.border,
                                    }}
                                  >
                                    {formatName(student.fullname)}
                                  </td>
                                  {editingStudent === student.account_id ? (
                                    <>
                                      {["prelim", "midterm", "preFinal", "final"].map((field) => (
                                        <td
                                          key={field}
                                          className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap border-r text-center"
                                          style={{
                                            borderColor: currentColors.border,
                                          }}
                                        >
                                          <input
                                            type="text"
                                            value={editForm[field]}
                                            onChange={(e) =>
                                              handleInputChange(
                                                field,
                                                e.target.value,
                                              )
                                            }
                                            className="w-16 sm:w-20 rounded px-2 py-1 text-sm focus:outline-none text-center mx-auto"
                                            style={{
                                              backgroundColor: isDarkMode
                                                ? "#1F242D"
                                                : "#f8fafc",
                                              border: `1px solid ${currentColors.border}`,
                                              color: currentColors.text,
                                            }}
                                            placeholder="30-100"
                                          />
                                        </td>
                                      ))}
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                        <div className="flex gap-2 justify-center">
                                          <button
                                            onClick={handleSaveGrade}
                                            className="text-xs sm:text-sm bg-transparent border-none p-1 font-medium transition-colors"
                                            style={{
                                              color: isDarkMode
                                                ? "#10b981"
                                                : "#059669",
                                            }}
                                            onMouseEnter={(e) =>
                                              (e.currentTarget.style.opacity =
                                                "0.8")
                                            }
                                            onMouseLeave={(e) =>
                                              (e.currentTarget.style.opacity =
                                                "1")
                                            }
                                          >
                                            Save
                                          </button>
                                          <span
                                            style={{
                                              color:
                                                currentColors.textSecondary,
                                            }}
                                          >
                                            |
                                          </span>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="text-xs sm:text-sm bg-transparent border-none p-1 font-medium transition-colors"
                                            style={{
                                              color:
                                                currentColors.textSecondary,
                                            }}
                                            onMouseEnter={(e) =>
                                              (e.currentTarget.style.opacity =
                                                "0.8")
                                            }
                                            onMouseLeave={(e) =>
                                              (e.currentTarget.style.opacity =
                                                "1")
                                            }
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td
                                        className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                        style={{
                                          borderColor: currentColors.border,
                                          color: getGradeColor(
                                            getGradeDisplay(
                                              student?.grades,
                                              "prelim",
                                            ),
                                          ),
                                        }}
                                      >
                                        {getGradeDisplay(
                                          student?.grades,
                                          "prelim",
                                        )}
                                      </td>
                                      <td
                                        className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                        style={{
                                          borderColor: currentColors.border,
                                          color: getGradeColor(
                                            getGradeDisplay(
                                              student?.grades,
                                              "midterm",
                                            ),
                                          ),
                                        }}
                                      >
                                        {getGradeDisplay(
                                          student?.grades,
                                          "midterm",
                                        )}
                                      </td>
                                      <td
                                        className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                        style={{
                                          borderColor: currentColors.border,
                                          color: getGradeColor(
                                            getGradeDisplay(
                                              student,
                                              "preFinal",
                                            ),
                                          ),
                                        }}
                                      >
                                        {getGradeDisplay(
                                          student?.grades,
                                          "preFinal",
                                        )}
                                      </td>
                                      <td
                                        className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center border-r font-medium"
                                        style={{
                                          borderColor: currentColors.border,
                                          color: getGradeColor(
                                            getGradeDisplay(
                                              student?.grades,
                                              "final",
                                            ),
                                          ),
                                        }}
                                      >
                                        {getGradeDisplay(
                                          student?.grades,
                                          "final",
                                        )}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                                        <button
                                          onClick={() =>
                                            handleEditGrade(student)
                                          }
                                          className="text-xs sm:text-sm bg-transparent border-none p-1 font-medium transition-colors"
                                          style={{
                                            color: isDarkMode
                                              ? "#60a5fa"
                                              : "#2563eb",
                                          }}
                                          onMouseEnter={(e) =>
                                            (e.currentTarget.style.opacity =
                                              "0.8")
                                          }
                                          onMouseLeave={(e) =>
                                            (e.currentTarget.style.opacity =
                                              "1")
                                          }
                                        >
                                          Edit Grade
                                        </button>
                                      </td>
                                    </>
                                  )}
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
            </>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfGradeRecordPage;
