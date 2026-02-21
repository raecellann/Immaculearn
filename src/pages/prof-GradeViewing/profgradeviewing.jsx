import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";

const ProfGradeRecordPage = () => {
  const { courseSpaces } = useSpace();
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

  /* 🔹 ADDED — STICKY + HIDE ON SCROLL */
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
    // Only allow numbers and empty string
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
    <div className="flex min-h-screen bg-[#161A20] text-white">

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

        {/* Folder View */}
        {!selectedSubject && (
          <>
            <div className="mb-12 mt-8">
              <h2 className="text-xl font-semibold mb-4 text-white pb-2">
                Course Space
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
              {courseSpaces.length === 0 ? (
                <div className="col-span-full bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                  <span className="text-4xl mb-4 block">📚</span>
                  <p className="text-lg font-medium mb-2">No Course Spaces Yet</p>
                  <p className="text-sm">You haven't created any course spaces. Create your first course space to start managing grades!</p>
                </div>
              ) : (
                courseSpaces.map((space, index) => (
                  <div
                    key={`course-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => {
                      setSelectedSubject(space);
                      // Initialize student grades for this course space
                      const grades = space.members
                        .filter(member => member.role !== "Professor")
                        .map(member => ({
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
                      <p className="text-sm text-gray-400">
                        {space.members?.filter(m => m.role !== "Professor").length || 0} Students
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Grades */}
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
            {/* Mobile / Tablet Cards */}
            <div className="lg:hidden space-y-4">
              {studentGrades.map((student, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E222A] p-4 rounded-lg border border-gray-700"
                >
                  <p className="font-semibold mb-1">{student.name}</p>
                  {editingStudent === student.accountId ? (
                    <div className="space-y-2">
                      {['prelim', 'midterm', 'preFinal', 'final'].map((field) => (
                        <div key={field} className="flex items-center gap-2">
                          <label className="text-xs text-gray-400 w-16 capitalize">{field}:</label>
                          <input
                            type="text"
                            value={editForm[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="flex-1 bg-[#1F242D] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
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
                      <div className="text-sm text-gray-300 space-y-1">
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
                  <tr className="border-b border-gray-600 text-gray-300">
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
                      className="border-b border-gray-700 hover:bg-[#1F242D] transition"
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
                                className="w-16 bg-[#1F242D] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                                placeholder="0-100"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={handleSaveGrade}
                                className="text-green-400 hover:text-green-300 text-sm bg-transparent border-none p-0"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-gray-300 text-sm bg-transparent border-none p-0"
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
                              className="text-blue-400 hover:text-blue-300 text-sm bg-transparent border-none p-0"
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
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfGradeRecordPage;