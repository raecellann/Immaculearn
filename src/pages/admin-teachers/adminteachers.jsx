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
    setTeachers([
      { id: 1, name: "Jober Reyes", email: "joberreyes@gmail.com" },
      { id: 2, name: "Nathaniel Cruz", email: "nathanielcruz@gmail.com" },
      { id: 3, name: "Wilson James", email: "wilsonjames@gmail.com" },
      { id: 4, name: "Shiela Sta. Maria", email: "shengstamaria@gmail.com" },
      { id: 5, name: "Cecilia Cruz", email: "ceciliacruz@gmail.com" },
      { id: 6, name: "Juan Dela Cruz", email: "juandelacruz@gmail.com" },
    ]);
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

  const handleImportTeachers = () => {
    setTeachers([...teachers, ...importPreview]);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= ADD TEACHER ================= */

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewTeacher((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) return;

    setTeachers([
      ...teachers,
      { id: teachers.length + 1, ...newTeacher },
    ]);

    setNewTeacher({ name: "", email: "", verified: true });
    setShowAddModal(false);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E242E] p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Add Teacher</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X />
              </button>
            </div>

            <input
              name="name"
              value={newTeacher.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="w-full mb-3 p-2 bg-[#242B38]"
            />
            <input
              name="email"
              value={newTeacher.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full mb-4 p-2 bg-[#242B38]"
            />

            <button
              onClick={handleAddTeacher}
              className="bg-green-600 w-full py-2 rounded"
            >
              Add Teacher
            </button>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E242E] p-6 rounded-xl w-full max-w-2xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Import Teachers</h2>
              <button onClick={() => setShowImportModal(false)}>
                <X />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />

            <button
              onClick={handleImportTeachers}
              className="bg-blue-600 px-4 py-2 mt-4 rounded"
            >
              Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
