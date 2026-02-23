import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const ProfGradeRecordPage = () => {
  const { courseSpaces } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    prelim: '',
    midterm: '',
    preFinal: '',
    final: ''
  });

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const handleEditGrade = (student) => {
    setEditingStudent(student.accountId);
    setEditForm({
      prelim: student.prelim || '',
      midterm: student.midterm || '',
      preFinal: student.preFinal || '',
      final: student.final || ''
    });
  };

  const handleSaveGrade = () => {
    setStudentGrades(prevGrades =>
      prevGrades.map(student =>
        student.accountId === editingStudent
          ? { ...student, ...editForm }
          : student
      )
    );
    setEditingStudent(null);
    setEditForm({ prelim: '', midterm: '', preFinal: '', final: '' });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditForm({ prelim: '', midterm: '', preFinal: '', final: '' });
  };

  const handleInputChange = (field, value) => {
    if (value === '' || /^\d*$/.test(value)) {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

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
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

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
          color: currentColors.text
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
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: currentColors.text }}
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
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Course Space
              </h2>

              {courseSpaces.length === 0 ? (
                <div className="rounded-xl p-10 text-center border border-dashed" style={{ 
                  backgroundColor: currentColors.surface, 
                  color: currentColors.textSecondary,
                  borderColor: currentColors.border
                }}>
                  <span className="text-4xl mb-4 block">📚</span>
                  <p className="text-lg font-medium mb-2">No Course Spaces Yet</p>
                  <p className="text-sm">You haven't created any course spaces. Create your first course space to start managing grades!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {courseSpaces.map((space, index) => {
                    // ✅ FIX: Only count members whose role is strictly "Student"
                    const studentMembers = (space.members || []).filter(
                      (member) => member.role === "Student"
                    );

                    return (
                      <div
                        key={`course-space-${index}`}
                        className="rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                        style={{
                          backgroundColor: currentColors.surface,
                          border: `1px solid ${currentColors.border}`
                        }}
                        onClick={() => {
                          setSelectedSubject(space);
                          // ✅ FIX: Only initialize grades for actual students
                          const grades = studentMembers.map((member) => ({
                            name: member.full_name,
                            accountId: member.account_id,
                            prelim: '',
                            midterm: '',
                            preFinal: '',
                            final: ''
                          }));
                          setStudentGrades(grades);
                        }}
                      >
                        <span className="text-xl">📊</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg truncate overflow-hidden whitespace-nowrap">
                            {space.space_name}
                          </p>
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                            {studentMembers.length} Student{studentMembers.length !== 1 ? 's' : ''}
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

              {/* No students state */}
              {studentGrades.length === 0 ? (
                <div className="rounded-xl p-10 text-center border border-dashed" style={{ 
                  backgroundColor: currentColors.surface, 
                  color: currentColors.textSecondary,
                  borderColor: currentColors.border
                }}>
                  <span className="text-4xl mb-4 block">🎓</span>
                  <p className="text-lg font-medium mb-2">No Students Yet</p>
                  <p className="text-sm">No students have joined this course space yet.</p>
                </div>
              ) : (
                <>
                  {/* Mobile / Tablet Cards */}
                  <div className="lg:hidden space-y-4">
                    {studentGrades.map((student, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border
                        }}
                      >
                        <p className="font-semibold mb-1">{student.name}</p>
                        {editingStudent === student.accountId ? (
                          <div className="space-y-2">
                            {['prelim', 'midterm', 'preFinal', 'final'].map((field) => (
                              <div key={field} className="flex items-center gap-2">
                                <label className="text-xs w-16 capitalize" style={{ color: currentColors.textSecondary }}>{field}:</label>
                                <input
                                  type="text"
                                  value={editForm[field]}
                                  onChange={(e) => handleInputChange(field, e.target.value)}
                                  className="flex-1 rounded px-2 py-1 text-sm focus:outline-none"
                                  style={{
                                    backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc',
                                    border: `1px solid ${currentColors.border}`,
                                    color: currentColors.text
                                  }}
                                  placeholder="0-100"
                                />
                              </div>
                            ))}
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
                            <div className="text-sm space-y-1" style={{ color: currentColors.textSecondary }}>
                              <p>Prelim: {student.prelim || '-'}</p>
                              <p>Midterm: {student.midterm || '-'}</p>
                              <p>Pre-Final: {student.preFinal || '-'}</p>
                              <p>Final: {student.final || '-'}</p>
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

                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <table className="w-full border-collapse text-center text-sm">
                      <thead>
                        <tr className="border-b" style={{ color: currentColors.textSecondary }}>
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4">Prelim</th>
                          <th className="py-3 px-4">Midterm</th>
                          <th className="py-3 px-4">Pre-Final</th>
                          <th className="py-3 px-4">Final</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.map((student, index) => (
                          <tr
                            key={index}
                            className="border-b transition"
                            style={{
                              borderColor: currentColors.border
                            }}
                          >
                            <td className="py-2 px-4 text-left">{student.name}</td>
                            {editingStudent === student.accountId ? (
                              <>
                                {['prelim', 'midterm', 'preFinal', 'final'].map((field) => (
                                  <td key={field} className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={editForm[field]}
                                      onChange={(e) => handleInputChange(field, e.target.value)}
                                      className="w-16 rounded px-2 py-1 text-sm focus:outline-none text-center"
                                      style={{
                                        backgroundColor: isDarkMode ? '#1F242D' : '#f8fafc',
                                        border: `1px solid ${currentColors.border}`,
                                        color: currentColors.text
                                      }}
                                      placeholder="0-100"
                                    />
                                  </td>
                                ))}
                                <td className="py-2 px-4">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={handleSaveGrade}
                                      className="text-sm bg-transparent border-none p-0"
                                      style={{ color: isDarkMode ? '#10b981' : '#059669' }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="text-sm bg-transparent border-none p-0"
                                      style={{ color: currentColors.textSecondary }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{student.prelim || '-'}</td>
                                <td>{student.midterm || '-'}</td>
                                <td>{student.preFinal || '-'}</td>
                                <td>{student.final || '-'}</td>
                                <td>
                                  <button
                                    onClick={() => handleEditGrade(student)}
                                    className="text-sm bg-transparent border-none p-0"
                                    style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}
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