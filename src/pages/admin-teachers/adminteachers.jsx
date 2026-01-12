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
    <div className="flex min-h-screen bg-[#161A20] text-white relative">

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="fixed top-0 left-0 h-full z-40 lg:static">
        <AdminSidebar />
      </div>

      <div className="flex-1 ml-60 flex flex-col">

        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] transition-transform ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center px-4 h-14">
            <button onClick={() => setMobileSidebarOpen(true)}>
              <Menu />
            </button>
            <h1 className="ml-4 font-semibold">Teachers</h1>
          </div>
        </div>

        <div className="lg:hidden h-16" />

        <div className="flex-1 p-6">

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

          {/* MOBILE BUTTONS */}
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

          <div className="bg-[#1E242E] rounded-xl p-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="flex justify-between py-3 border-b border-gray-700"
              >
                <span>{t.name}</span>
                <span>{t.email}</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle size={14} /> Verified
                </span>
              </div>
            ))}
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
