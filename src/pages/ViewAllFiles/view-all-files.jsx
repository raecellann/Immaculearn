import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import AdminSidebar from "../component/sidebar";

const ViewAllFilesPage = () => {
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#4d9bef] via-[#3d8ee8] via-[#2c81e1] via-[#1a73da] to-[#0066d2] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-white">Files</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-8">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">Files</h1>
          </div>
        </div>

        {/* FILES TABLE */}
        <div className="p-4 lg:p-8">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date Posted
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Space Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody className="divide-y divide-gray-700">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-800/50 transition">
                      {/* STATUS */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-400 flex items-center space-x-1">
                            {file.status}
                            <ChevronDown size={14} />
                          </span>
                        </div>
                      </td>

                      {/* FILE NAME */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-white font-medium">
                        <div className="max-w-[200px] lg:max-w-none truncate">
                          {file.name}
                        </div>
                      </td>

                      {/* DATE POSTED */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-300">
                        {file.datePosted}
                      </td>

                      {/* SPACE NAME */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-300">
                        {file.spaceName}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        {file.isNew && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md cursor-pointer hover:bg-blue-600 transition inline-block">
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
    </div>
  );
};

export default ViewAllFilesPage;
