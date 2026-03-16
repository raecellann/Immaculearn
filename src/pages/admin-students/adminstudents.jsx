import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import {
  Menu,
  CheckCircle,
  Upload,
  X,
  FileText,
  UserPlus,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router";

import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import Logout from "../component/logout";
import { adminDashboardService } from "../../adminServices/adminDashboard";
import { toast } from "react-toastify";
import {
  genderOptions,
  yearLevelOptions,
  departmentOptions,
} from "../component/enumOptions";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Helper functions to get display names
  const getGenderName = (code) => {
    if (code === null || code === undefined) {
      return "-";
    }
    const gender = genderOptions.find((option) => option.code === code);
    return gender ? gender.name : "-";
  };

  const getYearLevelName = (code) => {
    if (code === null || code === undefined) {
      return "-";
    }
    // Convert to string to ensure proper comparison
    const codeStr = String(code);
    const yearLevel = yearLevelOptions.find(
      (option) => option.code === codeStr,
    );
    return yearLevel ? yearLevel.name : "-"; // Return '-' if not found
  };

  // Manual student entry form state
  const [newStudent, setNewStudent] = useState({
    email: "",
  });
  const [emailError, setEmailError] = useState(false);

  /* 🔹 STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* NAVIGATION FUNCTIONS */
  const navigateToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const navigateToTeachers = () => {
    navigate("/admin/teachers");
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await adminDashboardService.getAllStudentEmails();

      if (res.success && res.data?.students) {
        setStudents(
          res.data.students.map((student, index) => ({
            id: student.student_id ?? `temp-${index}`,
            firstName: capitalizeWords(student.student_fn) || "-",
            lastName: capitalizeWords(student.student_ln) || "-",
            email: student.email || "-",
            gender: getGenderName(student.student_gender) || "-",
            course: student.student_course || "-",
            yearLevel: getYearLevelName(student.student_yr_lvl) || "-",
          })),
        );
      } else {
        console.error(res.message);
      }
    };

    fetchStudents();
  }, []);

  /* ================= SEARCH & FILTER ================= */

  // Get unique courses from departmentOptions
  const uniqueCourses = departmentOptions.map((dept) => dept.code).sort();

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCourse = !selectedCourse || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Sorting logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    // Check for missing or empty data and push to end
    const aHasMissingData =
      !a.lastName ||
      a.lastName === "-" ||
      !a.firstName ||
      a.firstName === "-" ||
      !a.gender ||
      a.gender === "-" ||
      !a.course ||
      a.course === "-" ||
      !a.yearLevel ||
      a.yearLevel === "-";
    const bHasMissingData =
      !b.lastName ||
      b.lastName === "-" ||
      !b.firstName ||
      b.firstName === "-" ||
      !b.gender ||
      b.gender === "-" ||
      !b.course ||
      b.course === "-" ||
      !b.yearLevel ||
      b.yearLevel === "-";

    // If both have missing data or both have complete data, sort normally
    if (aHasMissingData === bHasMissingData) {
      if (sortBy === "lastName") {
        // Handle missing names in sorting
        const aName = a.lastName && a.lastName !== "-" ? a.lastName : "";
        const bName = b.lastName && b.lastName !== "-" ? b.lastName : "";
        return sortOrder === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else if (sortBy === "yearLevel") {
        const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
        const aIndex =
          a.yearLevel === "-" ? -1 : yearOrder.indexOf(a.yearLevel);
        const bIndex =
          b.yearLevel === "-" ? -1 : yearOrder.indexOf(b.yearLevel);
        return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
      } else if (sortBy === "gender") {
        const aGender = a.gender && a.gender !== "-" ? a.gender : "";
        const bGender = b.gender && b.gender !== "-" ? b.gender : "";
        return sortOrder === "asc"
          ? aGender.localeCompare(bGender)
          : bGender.localeCompare(aGender);
      } else if (sortBy === "course") {
        const aCourse = a.course && a.course !== "-" ? a.course : "";
        const bCourse = b.course && b.course !== "-" ? b.course : "";
        return sortOrder === "asc"
          ? aCourse.localeCompare(bCourse)
          : bCourse.localeCompare(aCourse);
      }
      return 0;
    }

    // If one has missing data, put it at the end
    return aHasMissingData ? 1 : -1;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const paginatedStudents = viewAll
    ? sortedStudents
    : sortedStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
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
  }, [searchQuery, selectedCourse, sortBy, sortOrder]);

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

        if (fileName.endsWith(".csv")) {
          // Handle CSV files
          const text = e.target.result;
          data = parseCSV(text);
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          // Handle Excel files
          const binaryData = new Uint8Array(e.target.result);
          const workbook = XLSX.read(binaryData, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
        }

        // Process the parsed data to extract Gmail addresses

        const mappedData = data
          .map((row) => {
            // Look through all values in the row to find any @gmail.com email
            let gmailEmail = "";
            Object.values(row).forEach((value) => {
              const strValue = String(value).trim();
              if (strValue.endsWith("@gmail.com")) {
                gmailEmail = strValue;
              }
            });

            return {
              email: gmailEmail,
            };
          })
          .filter((item) => {
            const isValid = item.email && item.email.endsWith("@gmail.com");
            return isValid;
          });

        setImportPreview(mappedData);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error parsing file. Please check the file format.");
      }
    };

    if (fileName.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length >= headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleImportStudents = async () => {
    if (!importFile) {
      toast.error("CSV or Excel file is required");
      return;
    }

    try {
      const res =
        await adminDashboardService.bulkRegisterStudentFile(importFile);

      if (!res.success) {
        alert(res.message);
        return;
      }

      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast.success(`Successfully imported ${res.data.total} students!`);

      // Refresh data after import
      const refreshRes = await adminDashboardService.getAllStudentEmails();
      if (refreshRes.success && refreshRes.data?.students) {
        setStudents(
          refreshRes.data.students.map((student, index) => ({
            id: student.student_id ?? `temp-${index}`,
            firstName: student.student_fn,
            lastName: student.student_ln,
            email: student.email,
            gender: getGenderName(student.student_gender),
            course: student.student_course,
            yearLevel: getYearLevelName(student.student_yr_lvl),
          })),
        );
      }
    } catch (err) {
      console.error(err);
      toast.err("Failed to import students");
    }
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Manual student entry functions
  const validateEmail = (email) => {
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing again
    if (name === "email" && emailError) {
      setEmailError(false);
    }
  };

  const handleAddStudent = async () => {
    if (isAddingStudent) return; // Prevent multiple clicks

    if (!newStudent.email) {
      toast.error("Email is required");
      return;
    }

    // Split emails by comma and trim whitespace
    const emails = newStudent.email
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    // Remove duplicates while preserving order
    const uniqueEmails = [...new Set(emails)];

    // Validate each email
    const invalidEmails = uniqueEmails.filter((email) => !validateEmail(email));
    const validEmails = uniqueEmails.filter((email) => validateEmail(email));

    if (invalidEmails.length > 0) {
      toast.error(
        `Only Gmail addresses are allowed. Invalid: ${invalidEmails.join(", ")}`,
      );
      setEmailError(true);
      return;
    }

    setIsAddingStudent(true); // Set loading state

    try {
      const res = await adminDashboardService.registerStudentEmail({
        email: validEmails.join(", "), // Send only valid emails as comma-separated string
      });

      if (!res.success) {
        toast.error(res.message);
        setIsAddingStudent(false); // Reset loading state
        return;
      }

      setNewStudent({ email: "" });
      setEmailError(false);
      setShowAddModal(false);
      toast.success(
        `Successfully added ${validEmails.length} student${validEmails.length > 1 ? "s" : ""}`,
      );

      // Refresh data after adding
      const refreshRes = await adminDashboardService.getAllStudentEmails();
      if (refreshRes.success && refreshRes.data?.students) {
        setStudents(
          refreshRes.data.students.map((student, index) => ({
            id: student.student_id ?? `temp-${index}`,
            firstName: capitalizeWords(student.student_fn) || "-",
            lastName: capitalizeWords(student.student_ln) || "-",
            email: student.email || "-",
            gender: getGenderName(student.student_gender) || "-",
            course: student.student_course || "-",
            yearLevel: getYearLevelName(student.student_yr_lvl) || "-",
          })),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsAddingStudent(false); // Reset loading state
    }
  };

  // Function to get and validate emails for preview
  const getEmailPreview = () => {
    if (!newStudent.email) return [];

    const emails = newStudent.email
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    // Remove duplicates while preserving order
    const uniqueEmails = [...new Set(emails)];

    const validEmails = uniqueEmails.filter((email) => validateEmail(email));
    const invalidEmails = uniqueEmails.filter((email) => !validateEmail(email));

    return {
      validEmails,
      invalidEmails,
      totalEmails: uniqueEmails,
      duplicatesRemoved: emails.length - uniqueEmails.length,
    };
  };

  const handleDeleteStudent = async (studentEmail) => {
    try {
      const res = await adminDashboardService.deleteStudent(studentEmail);

      if (res.success) {
        // Refresh data after deletion
        const refreshRes = await adminDashboardService.getAllStudentEmails();
        if (refreshRes.success && refreshRes.data?.students) {
          setStudents(
            refreshRes.data.students.map((student, index) => ({
              id: student.student_id ?? `temp-${index}`,
              firstName: student.student_fn,
              lastName: student.student_ln,
              email: student.email,
              gender: getGenderName(student.student_gender),
              course: student.student_course,
              yearLevel: getYearLevelName(student.student_yr_lvl),
            })),
          );
        }
        toast.success("Student deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete student");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong");
    }
    setShowDeleteConfirm(null);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewStudent({
      name: "",
      email: "",
    });
    setEmailError(false);
  };

  /* ================= EXPORT ================= */

  const handleExportStudents = () => {
    try {
      // Create data for export - only include emails
      const exportData = filteredStudents.map((student, index) => ({
        "No.": index + 1,
        Email: student.email,
        Name: `${student.firstName} ${student.lastName}`.trim(),
        Course: student.course,
        "Year Level": student.yearLevel,
        Gender: student.gender,
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students Email List");

      // Generate filename with current date
      const date = new Date().toISOString().split("T")[0];
      const filename = `students_email_list_${date}.xlsx`;

      // Download the file
      XLSX.writeFile(wb, filename);
      toast.success("Students email list exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export students email list");
    }
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
            <div className="flex gap-3 items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">
                  🔍
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className=" text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
              <button
                onClick={handleExportStudents}
                className="text-white flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Emails
              </button>
            </div>
          </div>
          <div className="hidden lg:flex gap-3 items-center mb-6">
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                ▼
              </span>
            </div>
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split("-");
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                disabled={!selectedCourse}
                className={`px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10 ${
                  !selectedCourse
                    ? "opacity-50 cursor-not-allowed bg-gray-100"
                    : ""
                }`}
              >
                <option value="lastName-asc">Ascending A-Z</option>
                <option value="lastName-desc">Descending Z-A</option>
                <option value="yearLevel-asc">Year 1-4</option>
                <option value="yearLevel-desc">Year 4-1</option>
                <option value="gender-asc">Gender F-M</option>
                <option value="gender-desc">Gender M-F</option>
              </select>
              <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                ▼
              </span>
            </div>
          </div>

          {/* MOBILE LARGE TO TABLET: SEARCH AND BUTTONS ALIGNED */}
          <div className="hidden md:flex lg:hidden flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    🔍
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Excel
                </button>
                <button
                  onClick={handleExportStudents}
                  className="text-white flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Emails
                </button>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                  ▼
                </span>
              </div>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  disabled={!selectedCourse}
                  className={`px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10 ${
                    !selectedCourse
                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                      : ""
                  }`}
                >
                  <option value="lastName-asc">Ascending A-Z</option>
                  <option value="lastName-desc">Descending Z-A</option>
                  <option value="yearLevel-asc">Year 1-4</option>
                  <option value="yearLevel-desc">Year 4-1</option>
                  <option value="gender-asc">Gender F-M</option>
                  <option value="gender-desc">Gender M-F</option>
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* MOBILE SMALL: BUTTONS FIRST, SEARCH BELOW */}
          <div className="md:hidden">
            {/* MOBILE IMPORT BUTTON */}
            <div className="mb-4 flex gap-3 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex-1 justify-center min-w-[120px]"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-white flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-1 justify-center min-w-[120px]"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
              <button
                onClick={handleExportStudents}
                className="text-white flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex-1 justify-center min-w-[120px]"
              >
                <Download className="w-4 h-4" />
                Export Emails
              </button>
            </div>

            {/* MOBILE SEARCH AND FILTER */}
            <div className="mb-4 space-y-3">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500">
                  🔍
                </span>
              </div>
              <div className="relative max-w-sm">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                  ▼
                </span>
              </div>
              <div className="relative max-w-sm">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  disabled={!selectedCourse}
                  className={`w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none pr-10 ${
                    !selectedCourse
                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                      : ""
                  }`}
                >
                  <option value="lastName-asc">Ascending A-Z</option>
                  <option value="lastName-desc">Descending Z-A</option>
                  <option value="yearLevel-asc">Year 1-4</option>
                  <option value="yearLevel-desc">Year 4-1</option>
                  <option value="gender-asc">Gender F-M</option>
                  <option value="gender-desc">Gender M-F</option>
                </select>
                <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET */}
          <div className="flex flex-col gap-4 lg:hidden">
            {(viewAll
              ? sortedStudents
              : sortedStudents.slice(0, itemsPerPage)
            ).map((student) => (
              <div
                key={student.id}
                className="bg-white p-5 rounded-xl border border-gray-200"
              >
                <h2 className="font-semibold text-base mb-1 text-gray-900">
                  {capitalizeWords(student.firstName)}{" "}
                  {capitalizeWords(student.lastName)}
                </h2>
                <p className="text-sm text-gray-600 mb-1">{student.email}</p>
                <p className="text-sm text-gray-600 mb-1">{student.gender}</p>
                <p className="text-sm text-gray-600 mb-1">{student.course}</p>
                <p className="text-sm text-gray-600 mb-3">
                  {student.yearLevel}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(student.email)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {/* Mobile Pagination */}
            {sortedStudents.length > itemsPerPage && !viewAll && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing 1-{Math.min(itemsPerPage, sortedStudents.length)} of{" "}
                  {sortedStudents.length} students
                </div>
                <button
                  onClick={handleViewAll}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  View All Students
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
                <tr
                  className="text-gray-600 border-b-2"
                  style={{ borderColor: "#22282fff" }}
                >
                  <th className="py-3">Last Name</th>
                  <th className="py-3">First Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Gender</th>
                  <th className="py-3">Course</th>
                  <th className="py-3">Year Level</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-gray-50"
                    style={{ borderColor: "#22282fff" }}
                  >
                    <td className="py-4 text-sm">
                      {capitalizeWords(student.lastName)}
                    </td>
                    <td className="py-4 text-sm">
                      {capitalizeWords(student.firstName)}
                    </td>
                    <td className="py-4 text-sm">{student.email}</td>
                    <td className="py-4 text-sm">{student.gender}</td>
                    <td className="py-4 text-sm">{student.course}</td>
                    <td className="py-4 text-sm">{student.yearLevel}</td>

                    <td className="py-4">
                      <button
                        onClick={() => setShowDeleteConfirm(student.email)}
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
            {sortedStudents.length > itemsPerPage && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  {viewAll
                    ? sortedStudents.length
                    : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, sortedStudents.length)}`}{" "}
                  of {sortedStudents.length} students
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
                        View All Students
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

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Import Students from Excel
              </h2>
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
                    <p className="text-gray-900 font-medium">
                      {importFile.name}
                    </p>
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
                  Preview ({importPreview.length} students found)
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-600 border-b-2 border-gray-800">
                        <th className="py-2 text-sm">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((student, index) => (
                        <tr key={index} className="border-b border-gray-300">
                          <td className="py-2 text-sm">{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <p className="text-gray-600 text-sm mt-2 text-center">
                      ... and {importPreview.length - 5} more students
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Excel Format Instructions */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-gray-900 font-medium mb-2">
                Excel Format Required:
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Your Excel / CSV file should have the following column in the
                first row:
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>
                  • Gmail (Gmail only — must end with <b>@gmail.com</b>)
                </li>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Student
              </h2>
              <button
                onClick={handleCancelAdd}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Student Form */}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="student@gmail.com, student2@gmail.com, student3@gmail.com"
                  style={{
                    WebkitTextFillColor: "gray-900",
                    WebkitBoxShadow: "0 0 0 1000px white inset",
                    transition: "background-color 0s",
                  }}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">
                    Only Gmail addresses are allowed (@gmail.com)
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Enter multiple Gmail addresses separated by commas
                </p>
              </div>

              {/* Email Preview */}
              {newStudent.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Preview
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {(() => {
                      const {
                        validEmails,
                        invalidEmails,
                        totalEmails,
                        duplicatesRemoved,
                      } = getEmailPreview();
                      return (
                        <div className="space-y-2">
                          {totalEmails.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">
                                Total: {totalEmails.length} email
                                {totalEmails.length > 1 ? "s" : ""}
                              </span>
                              {duplicatesRemoved > 0 && (
                                <span className="text-orange-600 ml-2">
                                  (Removed {duplicatesRemoved} duplicate
                                  {duplicatesRemoved > 1 ? "s" : ""})
                                </span>
                              )}
                            </div>
                          )}

                          {validEmails.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-green-700 mb-1">
                                Valid ({validEmails.length}):
                              </div>
                              <div className="space-y-1">
                                {validEmails.map((email, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded"
                                  >
                                    {email}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {invalidEmails.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-red-700 mb-1">
                                Invalid ({invalidEmails.length}):
                              </div>
                              <div className="space-y-1">
                                {invalidEmails.map((email, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded"
                                  >
                                    {email}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
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
                disabled={isAddingStudent}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isAddingStudent
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isAddingStudent ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Student Account
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this student account? This action
              cannot be undone.
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
