import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../component/sidebar";
import { useNavigate, useParams } from "react-router";

const ViewFilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* 🔹 STICKY HEADER LOGIC */
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

  /* ================= GET ROUTE PARAMS ================= */

  const { file_uuid, file_name } = useParams();

  const decodedFileName = decodeURIComponent(file_name || "");

// Remove extension
    const nameWithoutExtension = decodedFileName.split(".")[0];

    // Get only text before first underscore
    const cleanTitle = nameWithoutExtension.split("_")[0];


  /* ================= STATES ================= */

  const [title, setTitle] = useState(cleanTitle || "Untitled File");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [content, setContent] = useState(`File UUID: ${file_uuid}

This is dynamic content.
You can now fetch real file data using file_uuid.`);

  const [isEditingContent, setIsEditingContent] = useState(false);

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar />
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* � Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-white text-2xl p-0"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">File Viewer</h1>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto w-full max-w-6xl mx-auto pt-20 sm:pt-24 lg:pt-10">

          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            File Viewer
          </h1>

          <div className="mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white bg-transparent border-none p-2 text-lg font-medium transition-colors"
            >
              ← Back
            </button>
          </div>

          <div className="w-full bg-[#1E242E] rounded-xl p-6 lg:p-8 shadow-lg">

            {/* HEADER SECTION */}
            <div className="mb-6">

              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">

                {/* EDITABLE TITLE */}
                {isEditingTitle ? (
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-[#2A2F38] border border-gray-600 px-3 py-2 rounded text-white w-full"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="text-sm border border-gray-600 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="text-sm border border-blue-500 text-blue-400 px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-blue-400 text-sm hover:underline"
                    >
                      ✏ Edit
                    </button>
                  </div>
                )}
              </div>

              {/* META INFO */}
              <div className="text-sm text-gray-400 space-y-1">
                <p><span className="text-gray-300 font-medium">File UUID:</span> {file_uuid}</p>
                <p><span className="text-gray-300 font-medium">File Name:</span> {decodedFileName}</p>
              </div>

            </div>

            {/* CONTENT SECTION */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold">Content</h3>
                {!isEditingContent && (
                  <button
                    onClick={() => setIsEditingContent(true)}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    ✏ Edit
                  </button>
                )}
              </div>

              {isEditingContent ? (
                <div className="space-y-3">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-60 bg-[#2A2F38] border border-gray-600 p-3 rounded text-white"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingContent(false)}
                      className="text-sm border border-gray-600 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditingContent(false)}
                      className="text-sm border border-blue-500 text-blue-400 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-line text-gray-300">
                  {content}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFilePage;
