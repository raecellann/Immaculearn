import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Menu, CheckCircle, Upload, X, FileText, UserPlus } from "lucide-react";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router";
import Logout from "../component/logout";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Manual student entry form state
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: ''
  });

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* NAVIGATION FUNCTIONS */
  const navigateToDashboard = () => {
    navigate('/admin-dashboard');
  };

  const navigateToTeachers = () => {
    navigate('/admin-teachers');
  };

  useEffect(() => {
    setStudents([
      { 
        id: 1, 
        name: "Raecell Ann Galvez", 
        studentNumber: "2021-001",
        email: "raecell@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
      { 
        id: 2, 
        name: "Zeldrick Jesus Delos Santos", 
        studentNumber: "2021-002",
        email: "zeldrickjesus@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
      { 
        id: 3, 
        name: "Wilson Esmabe", 
        studentNumber: "2021-003",
        email: "wesmabe1920@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
      { 
        id: 4, 
        name: "Nathaniel Faburada", 
        studentNumber: "2021-004",
        email: "faburadanathaniel@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
      { 
        id: 5, 
        name: "Christian Joy Bedana", 
        studentNumber: "2021-005",
        email: "gimple20@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
      { 
        id: 6, 
        name: "Keziah Tangco", 
        studentNumber: "2021-006",
        email: "keziahtangco@gmail.com",
        yearLevel: "4th Year",
        course: "BS Computer Science",
        verified: true
      },
    ]);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      parseFile(file);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    
    reader.onload = (e) => {
      try {
        let data = [];
        
        if (fileName.endsWith('.csv')) {
          // Handle CSV files
          const text = e.target.result;
          data = parseCSV(text);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          // Handle Excel files
          const binaryData = new Uint8Array(e.target.result);
          const workbook = XLSX.read(binaryData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
        }
        
        // Map data to student structure
        const mappedData = data.map((row, index) => ({
          id: students.length + index + 1,
          name: row.Name || row.name || '',
          studentNumber: row['Student Number'] || row.studentNumber || row['Student Num'] || '',
          email: row.Email || row.email || '',
          yearLevel: row['Year Level'] || row.yearLevel || row.Year || '',
          course: row.Course || row.course || '',
          verified: row.Verified === 'Yes' || row.verified === true || row.Enrolled === 'Yes'
        }));
        
        setImportPreview(mappedData);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the file format.');
      }
    };
    
    if (fileName.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const handleImportStudents = () => {
    if (importPreview.length > 0) {
      setStudents([...students, ...importPreview]);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert(`Successfully imported ${importPreview.length} students!`);
    }
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manual student entry functions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddStudent = () => {
    // Validate required fields
    if (!newStudent.name || !newStudent.email) {
      alert('Please fill in all required fields (Name and Email)');
      return;
    }

    // Add new student to the list
    const studentToAdd = {
      id: students.length + 1,
      ...newStudent,
      studentNumber: 'N/A',
      yearLevel: 'N/A',
      course: 'N/A',
      verified: true
    };

    setStudents([...students, studentToAdd]);
    
    // Reset form and close modal
    setNewStudent({
      name: '',
      email: ''
    });
    setShowAddModal(false);
    
    alert('Student added successfully!');
  };

  const handleDeleteStudent = (studentId) => {
    setStudents(students.filter(student => student.id !== studentId));
    setShowDeleteConfirm(null);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewStudent({
      name: '',
      email: ''
    });
  };

  /* 🔹 SCROLL BEHAVIOR */
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

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 lg:hidden overflow-hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Students</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Students List
          </h1>
          
          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div></div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
            </div>
          </div>

          {/* MOBILE IMPORT BUTTON */}
          <div className="lg:hidden mb-4 flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex-1 justify-center"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-1 justify-center"
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
          </div>

          {/* MOBILE / TABLET */}
          <div className="flex flex-col gap-4 lg:hidden">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#1E242E] p-5 rounded-xl border border-white/10"
              >
                <h2 className="font-semibold text-base mb-1">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-400 mb-1">
                  {student.studentNumber}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  {student.email}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  {student.course}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {student.yearLevel}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(student.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-[#1E242E] p-6 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-3">Name</th>
                  <th className="py-3">Student Number</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Course</th>
                  <th className="py-3">Year Level</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-800 hover:bg-[#242B38]"
                  >
                    <td className="py-4">{student.name}</td>
                    <td className="py-4">{student.studentNumber}</td>
                    <td className="py-4 text-sm">{student.email}</td>
                    <td className="py-4">{student.course}</td>
                    <td className="py-4">{student.yearLevel}</td>
                    <td className="py-4">
                      <button
                        onClick={() => setShowDeleteConfirm(student.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E242E] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Import Students from Excel</h2>
              <button
                onClick={handleCancelImport}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  Click to upload CSV or Excel file or drag and drop
                </p>
                <p className="text-gray-500 text-sm">
                  Supported formats: .csv, .xlsx, .xls
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* File Info */}
            {importFile && (
              <div className="mb-6 p-4 bg-[#242B38] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{importFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {importPreview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Preview ({importPreview.length} students found)
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="py-2 text-sm">Name</th>
                        <th className="py-2 text-sm">Student Number</th>
                        <th className="py-2 text-sm">Email</th>
                        <th className="py-2 text-sm">Course</th>
                        <th className="py-2 text-sm">Year</th>
                        <th className="py-2 text-sm">Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((student, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 text-sm">{student.name}</td>
                          <td className="py-2 text-sm">{student.studentNumber}</td>
                          <td className="py-2 text-sm">{student.email}</td>
                          <td className="py-2 text-sm">{student.course}</td>
                          <td className="py-2 text-sm">{student.yearLevel}</td>
                          <td className="py-2 text-sm">
                            {student.verified ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <p className="text-gray-400 text-sm mt-2 text-center">
                      ... and {importPreview.length - 5} more students
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Excel Format Instructions */}
            <div className="mb-6 p-4 bg-[#242B38] rounded-lg">
              <h3 className="text-white font-medium mb-2">Excel Format Required:</h3>
              <p className="text-gray-300 text-sm mb-2">
                Your Excel file should have the following columns in the first row:
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Name (Student's full name)</li>
                <li>• Student Number (Unique ID)</li>
                <li>• Email (Email address)</li>
                <li>• Course (Program/Department)</li>
                <li>• Year Level (1st Year, 2nd Year, etc.)</li>
                <li>• Verified (Yes/No or true/false)</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelImport}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportStudents}
                disabled={importPreview.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {importPreview.length} Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E242E] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Student</h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Student Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#242B38] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter student's full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#242B38] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E242E] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Delete Student Account</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this student account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminStudents;
