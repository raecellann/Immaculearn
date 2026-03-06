import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Menu, Upload, X, FileText, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import { adminDashboardService } from "../../adminServices/adminDashboard";
import { toast } from "react-toastify";
import { genderOptions, departmentOptions } from "../component/enumOptions";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ email: "" });
  const [emailError, setEmailError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to get gender display name
  const getGenderName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const gender = genderOptions.find(option => option.code === code);
    return gender ? gender.name : '-';
  };

  const getDepartmentName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const department = departmentOptions.find(option => option.code === code);
    return department ? department.name : '-';
  };

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* ================= FETCH TEACHERS ================= */

  /* NAVIGATION FUNCTIONS */
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const navigateToStudents = () => {
    navigate('/admin/students');
  };

  useEffect(() => {
  const fetchTeachers = async () => {
    const res = await adminDashboardService.getAllProfEmails();

    if (res.success && res.data?.emails) {
      setTeachers(
        res.data.emails.map((teacher, index) => ({
          id: teacher.email ?? `temp-${index}`,
          firstName: teacher.prof_fn || '-',
          lastName: teacher.prof_ln || '-',
          name: `${teacher.prof_fn || ''} ${teacher.prof_ln || ''}`.trim() || teacher.email.split('@')[0],
          email: teacher.email || '-',
          gender: getGenderName(teacher.prof_gender) || '-',
          department: getDepartmentName(teacher.prof_department) || '-'
        }))
      );
    } else {
      console.error(res.message);
    }
  };

  fetchTeachers();
}, []);

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

  /* ================= SEARCH & FILTER ================= */

  // Get unique departments from departmentOptions
  const uniqueDepartments = departmentOptions.map(dept => dept.name).sort();

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || teacher.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Sorting logic
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    // Check for missing or empty data and push to end
    const aHasMissingData = !a.lastName || a.lastName === '-' || !a.firstName || a.firstName === '-' || !a.gender || a.gender === '-' || !a.department || a.department === '-';
    const bHasMissingData = !b.lastName || b.lastName === '-' || !b.firstName || b.firstName === '-' || !b.gender || b.gender === '-' || !b.department || b.department === '-';
    
    // If both have missing data or both have complete data, sort normally
    if (aHasMissingData === bHasMissingData) {
      if (sortBy === "lastName") {
        // Handle missing names in sorting
        const aName = a.lastName === '-' ? '' : a.lastName;
        const bName = b.lastName === '-' ? '' : b.lastName;
        return sortOrder === "asc" 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else if (sortBy === "department") {
        const aDept = a.department === '-' ? '' : a.department;
        const bDept = b.department === '-' ? '' : b.department;
        return sortOrder === "asc"
          ? aDept.localeCompare(bDept)
          : bDept.localeCompare(aDept);
      } else if (sortBy === "gender") {
        const aGender = a.gender === '-' ? '' : a.gender;
        const bGender = b.gender === '-' ? '' : b.gender;
        return sortOrder === "asc"
          ? aGender.localeCompare(bGender)
          : bGender.localeCompare(aGender);
      }
      return 0;
    }
    
    // If one has missing data, put it at the end
    return aHasMissingData ? 1 : -1;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTeachers.length / itemsPerPage);
  const paginatedTeachers = viewAll ? sortedTeachers : sortedTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewAll = () => {
    setViewAll(true);
  };

  const handleBackToPagination = () => {
    setViewAll(false);
    setCurrentPage(1);
  };

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
    setViewAll(false);
  }, [searchQuery, selectedDepartment, sortBy, sortOrder]);

  /* ================= ADD TEACHER ================= */

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddTeacher = async () => {
  if (!newTeacher.email) {
    toast.error("Email is required");
    return;
  }

  if (!validateEmail(newTeacher.email)) {
    toast.error("Please enter a valid email address");
    setEmailError(true);
    return;
  }

  try {
    const res = await adminDashboardService.registerProfEmail({
      email: newTeacher.email,
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setNewTeacher({ email: "" });
    setEmailError(false);
    setShowAddModal(false);
    toast.success("Teacher added successfully");
    
    // Refresh data after adding
    const refreshRes = await adminDashboardService.getAllProfEmails();
    if (refreshRes.success && refreshRes.data?.emails) {
      setTeachers(
        refreshRes.data.emails.map((teacher, index) => ({
          id: teacher.email ?? `temp-${index}`,
          firstName: teacher.prof_fn || '-',
          lastName: teacher.prof_ln || '-',
          name: `${teacher.prof_fn || ''} ${teacher.prof_ln || ''}`.trim() || teacher.email.split('@')[0],
          email: teacher.email || '-',
          gender: getGenderName(teacher.prof_gender) || '-',
          department: getDepartmentName(teacher.prof_department) || '-'
        }))
      );
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
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

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewTeacher({ email: "" });
    setEmailError(false);
  };

  /* ================= DELETE ================= */

  const handleDeleteTeacher = async (teacherEmail) => {
    try {
      const res = await adminDashboardService.deleteProfessor(teacherEmail);
      
      if (res.success) {
        // Refresh data after deletion
        const refreshRes = await adminDashboardService.getAllProfEmails();
        if (refreshRes.success && refreshRes.data?.emails) {
          setTeachers(
            refreshRes.data.emails.map((teacher, index) => ({
              id: teacher.email ?? `temp-${index}`,
              firstName: teacher.prof_fn,
              lastName: teacher.prof_ln,
              name: `${teacher.prof_fn || ''} ${teacher.prof_ln || ''}`.trim() || teacher.email.split('@')[0],
              email: teacher.email,
              gender: getGenderName(teacher.prof_gender),
              department: getDepartmentName(teacher.prof_department)
            }))
          );
        }
        toast.success("Teacher deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setShowDeleteConfirm(null);
  };

  /* ================= IMPORT ================= */

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      setImportPreview(
        data.map((row) => ({
          id: row.Email || row.email,
          email: row.Email || row.email,
        }))
      );
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportTeachers = async () => {
  if (!importFile) {
    toast.error("Please upload a file");
    return;
  }

  try {
    const res = await adminDashboardService.bulkRegisterProfFile(importFile);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Teachers imported successfully");
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Refresh data after import
    const refreshRes = await adminDashboardService.getAllProfEmails();
    if (refreshRes.success && refreshRes.data?.emails) {
      setTeachers(
        refreshRes.data.emails.map((teacher, index) => ({
          id: teacher.email ?? `temp-${index}`,
          firstName: teacher.prof_fn,
          lastName: teacher.prof_ln,
          name: `${teacher.prof_fn || ''} ${teacher.prof_ln || ''}`.trim() || teacher.email.split('@')[0],
          email: teacher.email,
          gender: getGenderName(teacher.prof_gender),
          department: getDepartmentName(teacher.prof_department)
        }))
      );
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to import teachers");
  }
};

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

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
          className={`lg:hidden bg-white p-4 border-b border-gray-200 flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-gray-900 text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Teachers</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Teachers List
          </h1>
          
          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div className="flex gap-3 items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
              </div>
              <div className="relative w-32">
                <select
                  value={selectedDepartment} 
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-8 text-sm truncate"
                >
                  <option value="">All Depts.</option>
                  {uniqueDepartments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                <span className="absolute right-2 top-2.5 text-gray-500 pointer-events-none text-xs">▼</span>
              </div>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="lastName-asc">Name A-Z</option>
                  <option value="lastName-desc">Name Z-A</option>
                  <option value="department-asc">Dept A-Z</option>
                  <option value="department-desc">Dept Z-A</option>
                  <option value="gender-asc">Gender F-M</option>
                  <option value="gender-desc">Gender M-F</option>
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">▼</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Teacher
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
            </div>
          </div>

          {/* MOBILE LARGE TO TABLET: SEARCH AND BUTTONS ALIGNED */}
          <div className="hidden md:flex lg:hidden flex-col gap-4 mb-6">
            <div className="flex gap-3 items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
              </div>
                <div className="relative w-32">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-8 text-sm truncate"
                  >
                    <option value="">All Depts.</option>
                    {uniqueDepartments.map(department => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                <span className="absolute right-2 top-2.5 text-gray-500 pointer-events-none text-xs">▼</span>
              </div>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="lastName-asc">Name A-Z</option>
                  <option value="lastName-desc">Name Z-A</option>
                  <option value="department-asc">Dept A-Z</option>
                  <option value="department-desc">Dept Z-A</option>
                  <option value="gender-asc">Gender F-M</option>
                  <option value="gender-desc">Gender M-F</option>
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">▼</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Teacher
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
            </div>
          </div>

          {/* MOBILE SMALL: BUTTONS FIRST, SEARCH BELOW */}
          <div className="md:hidden">
            {/* MOBILE IMPORT BUTTON */}
            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex-1 justify-center"
              >
                <UserPlus className="w-4 h-4" />
                Add Teacher
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-1 justify-center"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
            </div>

            {/* MOBILE SEARCH AND FILTER */}
            <div className="mb-4 space-y-3">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  placeholder="Search teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
              </div>
              <div className="relative max-w-sm">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">▼</span>
              </div>
              <div className="relative max-w-sm">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="lastName-asc">Last Name A-Z</option>
                  <option value="lastName-desc">Last Name Z-A</option>
                  <option value="department-asc">Department A-Z</option>
                  <option value="department-desc">Department Z-A</option>
                  <option value="gender-asc">Gender (Female-Male)</option>
                  <option value="gender-desc">Gender (Male-Female)</option>
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">▼</span>
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET */}
          <div className="flex flex-col gap-4 lg:hidden">
            {(viewAll ? sortedTeachers : sortedTeachers.slice(0, itemsPerPage)).map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white p-5 rounded-xl border border-gray-200"
              >
                <h2 className="font-semibold text-base mb-1 text-gray-900">
                  {teacher.name}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  {teacher.email}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {teacher.gender}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {teacher.department}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(teacher.email)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {/* Mobile Pagination */}
            {sortedTeachers.length > itemsPerPage && !viewAll && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing 1-{Math.min(itemsPerPage, sortedTeachers.length)} of {sortedTeachers.length} teachers
                </div>
                <button
                  onClick={handleViewAll}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  View All Teachers
                </button>
              </div>
            )}
            {viewAll && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleBackToPagination}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Back to Paginated View
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-white p-6 rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b-2" style={{ borderColor: '#22282fff' }}>
                  <th className="py-3">Last Name</th>
                  <th className="py-3">First Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Gender</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b hover:bg-gray-50" style={{ borderColor: '#22282fff' }}
                  >
                    <td className="py-4 text-sm">{teacher.lastName}</td>
                    <td className="py-4 text-sm">{teacher.firstName}</td>
                    <td className="py-4 text-sm">{teacher.email}</td>
                    <td className="py-4 text-sm">{teacher.gender}</td>
                    <td className="py-4 text-sm">{teacher.department}</td>
                    <td className="py-4">
                      <button
                        onClick={() => setShowDeleteConfirm(teacher.email)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {sortedTeachers.length > itemsPerPage && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {viewAll ? sortedTeachers.length : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, sortedTeachers.length)}`} of {sortedTeachers.length} teachers
                </div>
                <div className="flex items-center gap-2">
                  {!viewAll ? (
                    <>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                      <button
                        onClick={handleViewAll}
                        className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        View All Teachers
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleBackToPagination}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Back to Paginated View
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ADD TEACHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Teacher</h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Teacher Form */}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newTeacher.email}
                  onChange={(e) => {
                    setNewTeacher({ email: e.target.value });
                    // Clear error when user starts typing again
                    if (emailError) {
                      setEmailError(false);
                    }
                  }}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="teacher@gmail.com"
                  style={{
                    WebkitTextFillColor: 'gray-900',
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    transition: 'background-color 0s',
                  }}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                )}
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
                onClick={handleAddTeacher}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Import Teachers from Excel</h2>
              <button
                onClick={handleCancelImport}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <div
                className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">
                  Click to upload CSV or Excel file or drag and drop
                </p>
                <p className="text-gray-600 text-sm">
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
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-900 font-medium">{importFile.name}</p>
                    <p className="text-gray-600 text-sm">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {importPreview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview ({importPreview.length} Teachers found)
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-600 border-b-2 border-gray-800">
                        <th className="py-2 text-sm">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((teacher, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="py-2 text-sm">{teacher.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <p className="text-gray-600 text-sm mt-2 text-center">
                      ... and {importPreview.length - 5} more Teachers
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Excel Format Instructions */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-900 font-medium mb-2">Excel Format Required:</h3>
              <p className="text-gray-700 text-sm mb-2">
                Your Excel / CSV file should have the following column in the first row:
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Gmail (Gmail only — must end with <b>@gmail.com</b>)</li>
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
                onClick={handleImportTeachers}
                disabled={importPreview.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {importPreview.length} Teachers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Teacher Account</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this teacher account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTeacher(showDeleteConfirm)}
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

export default AdminTeachers;