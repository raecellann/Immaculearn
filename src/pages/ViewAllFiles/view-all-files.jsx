import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
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

  return (
    <div className="flex h-screen bg-black">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-3xl font-bold text-white">Files</h1>
          </div>

          {/* FILES TABLE */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full">
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
                  <tr
                    key={index}
                    className="hover:bg-gray-800/50 transition"
                  >
                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-400 flex items-center space-x-1">
                          <span>{file.status}</span>
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
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md cursor-pointer hover:bg-blue-600 transition">
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
  );
};

export default ViewAllFilesPage;
