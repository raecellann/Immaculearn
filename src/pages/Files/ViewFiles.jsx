import React, { useState } from "react";
import Sidebar from "../component/sidebar";

const ViewFilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [title, setTitle] = useState("Calculus: Lecture 3");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [content, setContent] = useState(`Today we covered integration by parts. The formula for integration by parts is given by:

∫u dv = uv − ∫v du

Where u and v are functions of x. The process involves choosing u and dv such that the integral on the right‑hand side is easier to solve than the original integral.

We also discussed the method of partial fractions, which allows us to break down complex fractions into simpler ones, making them easier to integrate.`);
  const [isEditingContent, setIsEditingContent] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* ================= MOBILE + TABLET HEADER ================= */}
        <div className="lg:hidden p-4 flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Files</h1>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto w-full max-w-6xl mx-auto">

          {/* ================= PAGE TITLE ================= */}
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            Files
          </h1>

          {/* ================= LECTURE CARD ================= */}
          <div className="w-full bg-[#1E242E] rounded-xl p-6 lg:p-8 shadow-lg">

            {/* Top Section */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                  {isEditingTitle ? (
                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#2A2F38] border border-gray-600 px-2 py-1 rounded text-white w-full"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingTitle(false)}
                          className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors bg-transparent"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setIsEditingTitle(false)}
                          className="text-sm text-blue-400 hover:bg-blue-600/20 border border-blue-500 px-3 py-1 rounded transition-colors bg-transparent"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-white">{title}</h2>
                      <button
                        className="text-sm text-blue-400 hover:underline bg-transparent border-none p-0"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        ✏ Edit Title
                      </button>
                    </div>
                  )}
                </div>

                <button className="text-white hover:text-gray-300 text-sm bg-transparent border border-gray-500 hover:border-gray-300 px-2 py-0.5 rounded transition-colors">
                  ← Back
                </button>
              </div>

              <div className="text-sm text-gray-400 space-y-1">
                <p><span className="font-medium text-gray-300">File Posted:</span> April 05, 2025</p>
                <p><span className="font-medium text-gray-300">Uploaded By:</span> Zeldrick Delos Santos</p>
              </div>
            </div>

            {/* File Button */}
            <div className="mb-6">
              <button className="flex items-center gap-2 bg-[#2E3440] hover:bg-[#3A4250] text-white px-4 py-2 rounded-md text-sm">
                <img
                  src="/src/assets/lectures/pdf-icon.svg"
                  alt="PDF Icon"
                  className="w-5 h-5"
                />
                Lecture.pdf <span className="text-gray-400 text-xs">(5mb)</span>
              </button>
            </div>

            {/* Content Section */}
            <div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-white">Content:</h3>
                {!isEditingContent && (
                  <button 
                    onClick={() => setIsEditingContent(true)}
                    className="text-sm text-blue-400 hover:underline bg-transparent border-none p-0"
                  >
                    ✏ Edit Content
                  </button>
                )}
              </div>

              <div className="text-gray-300 text-sm leading-relaxed space-y-4">
                {isEditingContent ? (
                  <div className="space-y-2">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-60 bg-[#2A2F38] border border-gray-600 p-3 rounded text-white"
                      autoFocus
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setIsEditingContent(false)}
                        className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors bg-transparent"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsEditingContent(false)}
                        className="text-sm text-blue-400 hover:bg-blue-600/20 border border-blue-500 px-3 py-1 rounded transition-colors bg-transparent"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{content}</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 w-full">
            <button className="px-4 sm:px-5 py-2 sm:py-1.5 bg-white text-gray-800 hover:bg-gray-200 rounded-full transition-colors text-sm sm:text-sm">
              Cancel
            </button>
            <button className="px-4 sm:px-5 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors text-sm sm:text-sm">
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFilePage;
