import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Upload, X, FileText, UserPlus } from "lucide-react";
import * as XLSX from "xlsx";
import Logout from "../component/logout";
import { adminDashboardService } from "../../adminServices/adminDashboard";
import { toast } from "react-toastify";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ email: "" });

  const fileInputRef = useRef(null);

  /* ================= FETCH TEACHERS ================= */

  useEffect(() => {
    const fetchTeachers = async () => {
      const res = await adminDashboardService.getAllProfEmails();

      if (res.success && res.data) {
        setTeachers(
          res.data.emails.map((email) => ({
            id: email,
            name: email.split("@")[0],
            email,
          }))
        );
      }
    };

    fetchTeachers();
  }, []);

  /* ================= SEARCH ================= */

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= ADD TEACHER ================= */

  const handleAddTeacher = async () => {
    if (!newTeacher.email) {
      toast.error("Email is required");
      return;
    }

    const res = await adminDashboardService.registerProfEmail({
      email: newTeacher.email,
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setTeachers((prev) => [
      ...prev,
      {
        id: newTeacher.email,
        name: newTeacher.email.split("@")[0],
        email: newTeacher.email,
      },
    ]);

    toast.success("Teacher added successfully");
    setNewTeacher({ email: "" });
    setShowAddModal(false);
  };


  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteTeacher = (teacherId) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
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

    const res = await adminDashboardService.bulkRegisterProfFile(importFile);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Teachers imported successfully");
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
  };

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      <AdminSidebar onLogoutClick={() => setShowLogout(true)} />

      <div className="flex-1 p-8">

        <h1 className="text-2xl font-bold mb-6">Teachers List</h1>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242B38] rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <UserPlus size={18} />
              Add Teacher
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Upload size={18} />
              Import Teacher
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#1E242E] p-6 rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Course</th>
                <th className="py-3">Year</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-800">
                  <td className="py-4">{teacher.name}</td>
                  <td className="py-4">{teacher.email}</td>
                  <td className="py-4">
                    <button
                      onClick={() => setShowDeleteConfirm(teacher.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-sm rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeachers.length === 0 && (
            <p className="text-gray-400 text-center mt-4">
              No teachers found
            </p>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#1E242E] p-6 rounded-xl w-96">
            <h2 className="text-xl mb-4">Add Teacher</h2>

            <input
              type="email"
              value={newTeacher.email}
              onChange={(e) =>
                setNewTeacher({ email: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#242B38] rounded-lg mb-4"
              placeholder="teacher@gmail.com"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeacher}
                className="px-4 py-2 bg-green-600 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#1E242E] p-6 rounded-xl w-[500px]">
            <h2 className="text-xl mb-4">Import Teachers</h2>

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
                  Preview ({importPreview.length} Teachers found)
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="py-2 text-sm">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((student, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 text-sm">{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <p className="text-gray-400 text-sm mt-2 text-center">
                      ... and {importPreview.length - 5} more Teachers
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Excel Format Instructions */}
            <div className="mb-6 p-4 bg-[#242B38] rounded-lg">
              <h3 className="text-white font-medium mb-2">Excel Format Required:</h3>
              <p className="text-gray-300 text-sm mb-2">
                Your Excel / CSV file should have the following column in the first row:
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
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

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminTeachers;
