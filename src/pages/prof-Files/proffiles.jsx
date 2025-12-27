import React, { useState } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";

const ProfFilePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const files = [
    {
      status: "Posted",
      fileName: "LPS CS Thesis 1 – Week 6",
      datePosted: "July 24",
      spaceName: "CS THESIS 1 - 1SY2025-2026",
      posted: true,
    },
    {
      status: "To be Uploaded",
      fileName: "Data Mining-Lecture",
      datePosted: "Oct 30",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: false,
    },
    {
      status: "Posted",
      fileName: "Basic File and Access Concepts-2021",
      datePosted: "Oct 10",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8">
        {/* Mobile / Tablet Header */}
        <div className="lg:hidden flex items-center gap-4 mb-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold flex-1">Files</h1>
          <Button
            onClick={() => setShowModal(true)}
            style={{
              padding: "0.35rem 1rem",
              fontSize: "0.8rem",
              borderRadius: "0.375rem",
              backgroundColor: "#3B82F6",
            }}
          >
            Create/Upload
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center mb-6 relative">
          <h1 className="text-4xl font-bold text-center flex-1">Files</h1>
          <div className="absolute right-0 top-0 mt-4">
            <Button
              onClick={() => setShowModal(true)}
              style={{
                padding: "0.35rem 1rem",
                fontSize: "0.8rem",
                borderRadius: "0.375rem",
                backgroundColor: "#3B82F6",
              }}
            >
              Create or Upload File
            </Button>
          </div>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="lg:hidden space-y-4">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-[#1E222A] p-4 rounded-lg border border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-blue-400">{file.fileName}</h3>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    file.posted ? "text-green-400 bg-green-900/30" : "text-blue-400 bg-blue-900/30"
                  }`}
                >
                  {file.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">
                <span className="font-semibold">Date:</span> {file.datePosted}
              </p>
              <p className="text-gray-400 text-sm mb-2">
                <span className="font-semibold">Space:</span> {file.spaceName}
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-md text-sm">
                {file.posted ? "View File" : "Upload"}
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto mt-4">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-gray-600 text-gray-300 text-sm">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Date Posted</th>
                <th className="py-3 px-4">Space Name</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-[#1F242D] transition"
                >
                  <td
                    className={`py-3 px-4 ${
                      file.posted ? "text-green-400" : "text-blue-400"
                    }`}
                  >
                    {file.status}
                  </td>
                  <td className="py-3 px-4">{file.fileName}</td>
                  <td className="py-3 px-4">{file.datePosted}</td>
                  <td className="py-3 px-4">{file.spaceName}</td>
                  <td className="py-3 px-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                      {file.posted ? "View File" : "Upload"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-[#1F242D] p-6 rounded-lg w-[90%] max-w-[400px] shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Upload New File
              </h2>

              <form className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="File Name"
                  className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Date Posted (e.g. Oct 30)"
                  className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Space Name"
                  className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
                />
                <select className="p-2 bg-[#2A2E36] rounded-md text-white outline-none">
                  <option>To be Uploaded</option>
                  <option>Posted</option>
                </select>
              </form>

              <div className="flex justify-end mt-5 gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfFilePage;
