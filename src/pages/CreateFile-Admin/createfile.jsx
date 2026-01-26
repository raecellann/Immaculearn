import React, { useState, useEffect, useRef } from "react";
import { Upload, ChevronDown, X, FileText, Trash2 } from "lucide-react";
import AdminSidebar from "../component/sidebar";
import Logout from "../component/logout";

const CreateFileAdmin = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [files, setFiles] = useState([
    {
      status: "Posted",
      name: "LPS CS Thesis 1 - Week 6",
      datePosted: "July 24",
      spaceName: "Zjs Space",
      isNew: true,
    },
    {
      status: "Posted",
      name: "MOOTECH-LECTURE",
      datePosted: "Oct 30",
      spaceName: "Zjs Space",
      isNew: false,
    },
    {
      status: "Posted",
      name: "Basic File and Access Concepts-2021",
      datePosted: "Oct 10",
      spaceName: "Zjs Space",
      isNew: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /* 🔹 ADDED — SAME STICKY HEADER LOGIC */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileObject = {
        id: Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
      };
      setUploadedFiles((prev) => [...prev, fileObject]);

      // Simulate upload progress
      simulateUpload(fileObject.id);
    }
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "uploaded" } : f
          )
        );
        clearInterval(interval);
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 500);
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDone = () => {
    // Add uploaded files to the main files table
    const newFiles = uploadedFiles
      .filter((f) => f.status === "uploaded")
      .map((f) => ({
        status: "Posted",
        name: f.name,
        datePosted: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        spaceName: "Zjs Space",
        isNew: true,
      }));

    setFiles((prev) => [...newFiles, ...prev]);
    setUploadedFiles([]);
    setShowModal(false);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "🎯";
    return "📎";
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE + TABLET OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE + TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* 🔹 MOBILE + TABLET STICKY HEADER */}
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
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        {/* 🔹 Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center mb-6 lg:mb-8 relative">
              <h1 className="hidden lg:block text-4xl font-bold text-center mb-4 lg:mb-0">Files</h1>
              <button
                onClick={() => setShowModal(true)}
                className="lg:absolute lg:right-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs lg:text-sm font-medium rounded-lg transition"
              >
                <span>Create or Upload File</span>
              </button>
            </div>

            {/* ================= MOBILE + TABLET (CARD VIEW) ================= */}
            <div className="flex flex-col gap-4 lg:hidden">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-[#1E222A] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
                >
                  <p className="text-sm text-green-400 font-medium">
                    ● {file.status}
                  </p>

                  <p className="text-blue-400 font-medium">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Date Posted:</span>{" "}
                    {file.datePosted}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Space:</span>{" "}
                      {file.spaceName}
                    </p>

                    {file.isNew && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition">
                        View File
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
            <div className="hidden lg:block bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date Posted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Space Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody className="divide-y divide-gray-700">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-800/50 transition">
                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-400 flex items-center space-x-1">
                            {file.status}
                            <ChevronDown size={14} />
                          </span>
                        </div>
                      </td>

                      {/* FILE NAME */}
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {file.name}
                      </td>

                      {/* DATE POSTED */}
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {file.datePosted}
                      </td>

                      {/* SPACE NAME */}
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {file.spaceName}
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        {file.isNew && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md">
                            View File
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            {/* CONTENT */}
            <div className="p-8 pt-12">
              {/* TITLE */}
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create file or Upload files here.
              </h2>

              {/* UPLOAD SECTION */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition relative ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleChange}
                  multiple
                  className="hidden"
                />

                <Upload size={40} className="mx-auto mb-3 text-gray-400" />

                <p className="text-gray-900 font-medium text-sm">
                  Choose a file or drag & drop it here.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  DOCS,PDF, PPT AND EXCEL, UP TO 50 MB
                </p>
              </div>

              {/* BROWSE BUTTON */}
              <button
                onClick={() => document.getElementById("file-upload").click()}
                className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition mb-4 bg-white"
              >
                Browse Files
              </button>

              {/* DIVIDER */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">Or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* CREATE FILE BUTTON */}
              <button className="w-full border-2 border-gray-900 text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center space-x-2 bg-white mb-6">
                <FileText size={20} />
                <span>Create File</span>
              </button>

              {/* UPLOADED FILES LIST */}
              {uploadedFiles.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* FILE HEADER */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="text-2xl">
                              {getFileIcon(file.name)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {file.name.toUpperCase()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(file.size / 1024).toFixed(0)}KB of 120KB
                              </p>
                            </div>
                          </div>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* PROGRESS BAR */}
                        {file.status === "uploading" && (
                          <>
                            <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-500 font-medium">
                              Uploading...
                            </p>
                          </>
                        )}

                        {/* SUCCESS STATUS */}
                        {file.status === "uploaded" && (
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <p className="text-xs text-green-600 font-medium">
                              Uploaded
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* DONE BUTTON */}
                  {uploadedFiles.some((f) => f.status === "uploaded") && (
                    <button
                      onClick={handleDone}
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                      Done
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default CreateFileAdmin;
