import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft } from "lucide-react";

const GradeViewing = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSeeMore = () => setShowDetails(true);
  const handleBack = () => setShowDetails(false);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 md:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header (MATCHES TASKPAGE) */}
        <div className="md:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Grades Viewing</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          {!showDetails ? (
            <>
              <h1 className="hidden md:block text-3xl font-bold mb-10 text-center">
                Grades Viewing
              </h1>

              {/* ===== MOBILE VIEW ===== */}
              <div className="md:hidden flex flex-col gap-4">
                <div className="bg-[#1F232B] rounded-xl p-4">
                  <p className="text-sm text-gray-400">Subject</p>
                  <p className="font-semibold">Thesis and Research</p>

                  <p className="text-sm text-gray-400 mt-2">Teacher</p>
                  <p>Jober Reyes</p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold">Grade: 80</span>
                    <span
                      onClick={handleSeeMore}
                      className="text-blue-400 text-sm cursor-pointer hover:underline"
                    >
                      See More
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== TABLET & DESKTOP ===== */}
              <div className="hidden md:block overflow-x-auto bg-[#1F232B] rounded-2xl p-6 shadow-lg">
                <table className="min-w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="py-2 px-4">Grade</th>
                      <th className="py-2 px-4">Subject Name</th>
                      <th className="py-2 px-4">Subject Teacher</th>
                      <th className="py-2 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#2A2F38]">
                      <td className="py-3 px-4 font-bold">80</td>
                      <td className="py-3 px-4">Thesis and Research</td>
                      <td className="py-3 px-4">Jober Reyes</td>
                      <td
                        onClick={handleSeeMore}
                        className="py-3 px-4 text-blue-400 hover:underline cursor-pointer"
                      >
                        See More
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* DETAILS HEADER */}
              <div className="mb-6">
                <ArrowLeft
                  onClick={handleBack}
                  className="cursor-pointer text-gray-300 hover:text-white inline-block"
                />
              </div>

              {/* ===== MOBILE DETAILS ===== */}
              <div className="md:hidden bg-[#1F232B] rounded-xl p-4 space-y-3">
                <p>
                  <span className="text-gray-400">Subject:</span> Thesis
                </p>
                <p>
                  <span className="text-gray-400">Teacher:</span> Jober Reyes
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="bg-[#2A2F38] p-3 rounded-lg">
                    Prelim: <strong>80</strong>
                  </div>
                  <div className="bg-[#2A2F38] p-3 rounded-lg">
                    Midterm: N/A
                  </div>
                  <div className="bg-[#2A2F38] p-3 rounded-lg">
                    Semi-Finals: N/A
                  </div>
                  <div className="bg-[#2A2F38] p-3 rounded-lg">
                    Finals: N/A
                  </div>
                </div>

                <p className="text-right text-gray-400 mt-4">
                  Required Grade:{" "}
                  <span className="text-white font-bold">80</span>
                </p>
              </div>

              {/* ===== DESKTOP DETAILS ===== */}
              <div className="hidden md:block bg-[#1F232B] rounded-2xl p-6 shadow-lg">
                <p className="text-lg mb-2">
                  <span className="font-semibold text-gray-400">Subject:</span>{" "}
                  Thesis
                </p>
                <p className="text-lg mb-4">
                  <span className="font-semibold text-gray-400">
                    Subject Teacher:
                  </span>{" "}
                  Jober Reyes
                </p>

                <table className="min-w-full text-left border-separate border-spacing-y-2 mb-6">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="py-2 px-4">Grade</th>
                      <th className="py-2 px-4">Prelim</th>
                      <th className="py-2 px-4">Midterm</th>
                      <th className="py-2 px-4">Semi-Finals</th>
                      <th className="py-2 px-4">Finals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#2A2F38]">
                      <td className="py-3 px-4 font-bold">80</td>
                      <td className="py-3 px-4">80</td>
                      <td className="py-3 px-4 text-gray-400">N/A</td>
                      <td className="py-3 px-4 text-gray-400">N/A</td>
                      <td className="py-3 px-4 text-gray-400">N/A</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-gray-400 text-right">
                  Required Grade:{" "}
                  <span className="text-white font-bold">80</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeViewing;
