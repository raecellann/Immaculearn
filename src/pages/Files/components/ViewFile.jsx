import React, { useState, useRef, useEffect } from "react";
import ProfSidebar from "../../component/profsidebar";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useFileManager } from "../../../hooks/useFileManager";

const ViewFilePage = () => {
  console.log("ViewFilePage rendering...");
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
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
  console.log("Route params:", { file_uuid, file_name });

  const decodedFileName = decodeURIComponent(file_name || "");

  const formatFileTitle = (file_name) => {
    if (!file_name) return "";

    const decodedFileName = decodeURIComponent(file_name);
    const nameWithoutExtension = decodedFileName.split(".")[0];
    
    // Remove timestamp prefix (like "1-1-1772112187584-") and get the clean title
    const cleanTitle = nameWithoutExtension.replace(/^\d+-\d+-\d+-/, '');
    
    return cleanTitle || nameWithoutExtension;
  };


  /* ================= STATES ================= */

  const [title, setTitle] = useState(formatFileTitle(file_name) || "Untitled File");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [content, setContent] = useState(`File UUID: ${file_uuid}

This is dynamic content.
You can now fetch real file data using file_uuid.`);

  const [isEditingContent, setIsEditingContent] = useState(false);

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <ProfSidebar />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <ProfSidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* � Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-lg font-bold" style={{ color: isDarkMode ? "white" : currentColors.text }}>File Viewer</h1>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto w-full max-w-6xl mx-auto pt-20 sm:pt-24 lg:pt-10">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10" style={{ color: currentColors.text }}>
            File Viewer
          </h1>

          <div className="mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = currentColors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = currentColors.textSecondary}
            >
              ← Back
            </button>
          </div>

          <div className="w-full rounded-lg p-6" style={{
            backgroundColor: currentColors.surface,
            border: `1px solid ${currentColors.border}`
          }}>

            {/* HEADER SECTION */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">

                {/* EDITABLE TITLE */}
                {isEditingTitle ? (
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <input
                      value={formatFileTitle(file_name)}
                      onChange={(e) => setTitle(e.target.value)}
                      className="px-3 py-2 rounded w-full"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                        color: currentColors.text
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="text-sm px-3 py-1 rounded"
                        style={{
                          borderColor: currentColors.border,
                          color: currentColors.textSecondary
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="text-sm px-3 py-1 rounded"
                        style={{
                          backgroundColor: currentColors.primary,
                          color: currentColors.text
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold" style={{ color: currentColors.text }}>{title}</h2>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-sm hover:underline"
                      style={{ color: currentColors.primary }}
                    >
                      ✏ Edit
                    </button>
                  </div>
                )}
              </div>


            </div>

            {/* CONTENT SECTION */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold">Content</h3>
                {!isEditingContent && (
                  <button
                    onClick={() => setIsEditingContent(true)}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: currentColors.primary }}
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
                    className="w-full h-60 p-3 rounded font-mono text-sm"
                    style={{
                      backgroundColor: currentColors.background,
                      border: `1px solid ${currentColors.border}`,
                      color: currentColors.text
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingContent(false)}
                      className="text-sm px-3 py-1 rounded transition-colors"
                      style={{
                        border: `1px solid ${currentColors.border}`,
                        color: currentColors.textSecondary
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditingContent(false)}
                      className="text-sm px-3 py-1 rounded transition-colors"
                      style={{
                        backgroundColor: currentColors.primary,
                        color: currentColors.text
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-line p-4 rounded font-mono text-sm" style={{
                    backgroundColor: currentColors.background,
                    border: `1px solid ${currentColors.border}`,
                    color: currentColors.text,
                    minHeight: "200px"
                  }}>
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
