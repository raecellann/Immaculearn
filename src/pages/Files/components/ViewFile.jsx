import React, { useState, useRef, useEffect } from "react";
import ProfSidebar from "../../component/profsidebar";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useFile } from "../../../contexts/file/fileContextProvider";



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
  
  const { resources } = useFile();

  const decodedFileName = decodeURIComponent(file_name || "");

  // Find the file from resources using useMemo to prevent recalculations
  const file = React.useMemo(() => {
    return resources?.find(resource => resource.file_id === parseInt(file_uuid));
  }, [resources, file_uuid]);

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

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch file data and content
  useEffect(() => {
    const fetchFileContent = async () => {
      if (!file) {
        setError("File not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        setFileData(file);

        // Fetch content from the file URL
        const response = await fetch(file.file_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file content: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        const fileExtension = file.file_name.split('.').pop()?.toLowerCase();
        
        // Clone the response since we can only read it once
        const responseClone = response.clone();
        
        // Try to get content as text first for common file extensions
        if (contentType?.includes('application/json')) {
          try {
            const jsonData = await response.json();
            setContent(JSON.stringify(jsonData, null, 2));
          } catch (jsonError) {
            // If JSON parsing fails, try as text
            const textData = await responseClone.text();
            setContent(textData);
          }
        } else if (contentType?.includes('text/') || 
                   contentType?.includes('application/sql') ||
                   contentType?.includes('application/javascript') ||
                   contentType?.includes('application/xml') ||
                   ['sql', 'txt', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'csv', 'log', 'md', 'py', 'php', 'html', 'css', 'scss', 'less', 'db', 'sqlite', 'sqlite3'].includes(fileExtension)) {
          
          // For these types, try to get text content even if content-type is wrong
          try {
            const textData = await response.text();
            
            // Check if the content is actually readable text (not binary garbage)
            if (textData && textData.length > 0) {
              // Simple check for readable text - if it contains mostly printable characters
              const printableChars = textData.replace(/[\x00-\x1F\x7F]/g, '').length;
              const totalChars = textData.length;
              const readableRatio = printableChars / totalChars;
              
              if (readableRatio > 0.7) { // If 70% or more is readable text
                setContent(textData);
              } else {
                setContent(`File appears to be binary despite having a text-based extension.\n\nFile type: ${contentType || 'Unknown'}\nFile extension: ${fileExtension || 'Unknown'}\nReadable content ratio: ${(readableRatio * 100).toFixed(1)}%\n\nPlease download the file to view its contents with appropriate software.`);
              }
            } else {
              setContent('File appears to be empty.');
            }
          } catch (textError) {
            console.error('Error reading file as text:', textError);
            setContent(`File could not be displayed as text. This might be a binary file.\n\nFile type: ${contentType || 'Unknown'}\nFile extension: ${fileExtension || 'Unknown'}\n\nPlease download the file to view its contents.`);
          }
        } else {
          // For unknown binary types, still try to read as text as a fallback
          try {
            const textData = await responseClone.text();
            
            // Check if it might actually be readable text
            const printableChars = textData.replace(/[\x00-\x1F\x7F]/g, '').length;
            const totalChars = textData.length;
            const readableRatio = printableChars / totalChars;
            
            if (textData.length > 0 && readableRatio > 0.7) {
              setContent(`File was detected as binary but appears to contain readable text:\n\n${textData}`);
            } else {
              setContent(`Binary file (${contentType}) - Content cannot be displayed as text. Download the file to view its contents.\n\nFile type: ${contentType || 'Unknown'}\nFile extension: ${fileExtension || 'Unknown'}`);
            }
          } catch (fallbackError) {
            setContent(`Binary file (${contentType}) - Content cannot be displayed as text. Download the file to view its contents.\n\nFile type: ${contentType || 'Unknown'}\nFile extension: ${fileExtension || 'Unknown'}`);
          }
        }
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError(err.message || 'Failed to load file content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileContent();
  }, [file]); // Only depend on the file object to prevent duplicate calls

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
                {fileData && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: currentColors.textSecondary }}>
                    <span>•</span>
                    <span>{fileData.file_size ? `${(fileData.file_size / 1024).toFixed(2)} KB` : 'Unknown size'}</span>
            
                  </div>
                )}
                {!isEditingContent && !isLoading && !error && (
                  <button
                    onClick={() => setIsEditingContent(true)}
                    className="text-sm hover:underline transition-colors"
                    style={{ color: currentColors.primary }}
                  >
                    ✏ Edit
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8" style={{
                    backgroundColor: currentColors.background,
                    border: `1px solid ${currentColors.border}`,
                    minHeight: "200px"
                  }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p style={{ color: currentColors.textSecondary }}>Loading file content...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded" style={{
                    backgroundColor: isDarkMode ? '#991b1b20' : '#ef444420',
                    border: `1px solid ${isDarkMode ? '#991b1b' : '#ef4444'}`,
                    color: isDarkMode ? '#fca5a5' : '#dc2626'
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <h4 className="font-semibold">Error Loading File</h4>
                  </div>
                  <p className="text-sm">{error}</p>
                  {fileData && (
                    <button
                      onClick={() => window.open(fileData.file_url, '_blank')}
                      className="mt-3 text-sm underline"
                      style={{ color: currentColors.primary }}
                    >
                      Try opening the file directly
                    </button>
                  )}
                </div>
              ) : isEditingContent ? (
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
                <div className="relative">
                  <div className="whitespace-pre-line p-4 rounded font-mono text-sm overflow-x-auto" style={{
                      backgroundColor: currentColors.background,
                      border: `1px solid ${currentColors.border}`,
                      color: currentColors.text,
                      minHeight: "200px"
                    }}>
                    {content || 'No content available'}
                  </div>
                
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
