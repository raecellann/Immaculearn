import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Menu, CheckCircle, Upload, X, FileText, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";

const AdminTeachers = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const fileInputRef = useRef(null);
  


  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    verified: true,
  });

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
  const fetchProf = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/v1/register_prof/all_emails_prof"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch professor emails");
      }

      const data = await res.json();

      const mappedTeachers = data.emails.map((email, index) => ({
        id: index + 1,
        name: null,
        email,
        verified: false,
      }));

      setTeachers(mappedTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  fetchProf();
}, []);

  /* ================= FILE IMPORT ================= */

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();

    reader.onload = (e) => {
      let data = [];

      if (fileName.endsWith(".csv")) {
        const lines = e.target.result.split("\n").filter(Boolean);
        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
          const row = {};
          lines[i].split(",").forEach((val, idx) => {
            row[headers[idx]] = val;
          });
          data.push(row);
        }
      } else {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);
      }

      setImportPreview(
        data.map((row, index) => ({
          id: teachers.length + index + 1,
          name: row.Name || row.name || "",
          email: row.Email || row.email || "",
          verified:
            row.Verified === "Yes" ||
            row.verified === true ||
            row.Enrolled === "Yes",
        }))
      );
    };

    fileName.endsWith(".csv")
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file);
  };

  const handleImportTeachers = async () => {
  if (!importFile) return;

  const formData = new FormData();
  formData.append("file", importFile);

  try {
    const res = await fetch(
      "http://localhost:3000/v1/register_prof/bulk_email",
      {
        method: "POST",
        body: formData, // ⚠️ no Content-Type header
      }
    );

    if (!res.ok) {
      throw new Error("Bulk import failed");
    }

    // Optional: backend response
    const data = await res.json();
    console.log(data);

    // Refresh list from backend (source of truth)
    const refreshed = await fetch(
      "http://localhost:3000/v1/register_prof/all_emails_prof"
    );
    const refreshedData = await refreshed.json();

    setTeachers(
      refreshedData.emails.map((email, index) => ({
        id: index + 1,
        name: null,
        email,
        verified: false,
      }))
    );

    // Reset UI
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Import error:", error);
    alert("Failed to import teachers");
  }
};


  /* ================= ADD TEACHER ================= */

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewTeacher((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTeacher = async () => {
  if (!newTeacher.email) return;

  try {
    const res = await fetch(
      "http://localhost:3000/v1/register_prof/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newTeacher.email,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to add teacher");
    }

    // OPTIONAL: backend response
    // const data = await res.json();

    // Update UI only after success
    setTeachers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newTeacher.name || null,
        email: newTeacher.email,
        verified: false,
      },
    ]);

    setNewTeacher({ name: "", email: "", verified: true });
    setShowAddModal(false);
  } catch (error) {
    console.error("Error adding teacher:", error);
    alert("Failed to add teacher email");
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


  /* ================= SCROLL HEADER ================= */

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setShowHeader(!(current > lastScrollY.current && current > 50));
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= RENDER ================= */

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar />
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
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* MOBILE HEADER */}
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
          <h1 className="text-xl font-bold">Teachers</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Teachers List
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
                Add Teacher
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

          {/* MOBILE / TABLET */}
          <div className="lg:hidden mb-4 flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex-1 justify-center"
            >
              <UserPlus className="w-4 h-4" />
              Add Teacher
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-1 justify-center"
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="flex flex-col gap-4 lg:hidden">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-[#1E242E] border border-gray-700 rounded-xl p-4"
              >
                <p className="text-base font-semibold mb-1">
                  {teacher.name}
                </p>

                <p className="text-gray-400 text-sm mb-3">
                  {teacher.email}
                </p>

                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified
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
                  <th className="py-3">Email</th>
                  <th className="py-3">Verified</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-gray-800 hover:bg-[#242B38]"
                  >
                    <td className="py-4">{teacher.name}</td>
                    <td className="py-4">{teacher.email}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E242E] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Teacher</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Teacher Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newTeacher.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#242B38] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter teacher's full name"
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
                  value={newTeacher.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#242B38] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="teacher@example.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
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
          <div className="bg-[#1E242E] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Import Teacher from Excel</h2>
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
                Import {importPreview.length} Teacher Email
              </button>
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
};

export default AdminTeachers;
