import React, { useState, useRef, useEffect } from "react";
import ProfSidebar from "../../component/profsidebar";
import Logout from "../../component/logout";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { useFile } from "../../../contexts/file/fileContextProvider";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfViewFiles = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { userSpaces, courseSpaces, friendSpaces, isLoading: spaceLoading } =
    useSpace();

  const { space_uuid, space_name } = useParams();

  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];
  
  // Remove duplicates by space_id
  const uniqueSpaces = allSpaces.filter(
    (space, index, self) =>
      index === self.findIndex(s => s.space_id === space.space_id)
  );
  
  const currentSpace = uniqueSpaces.find(
    (space) => space.space_uuid === space_uuid
  );

  // Safe display name (database first, URL fallback)
  const displayName =
    currentSpace?.space_name ||
    decodeURIComponent(space_name || "");

  const { resources } = useFile();
  const files = resources || [];
  
  console.log(files)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  /* ================= STICKY HEADER ================= */

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

  /* ================= LOADING STATES ================= */

  if (spaceLoading) {
    return (
      <div className="flex h-screen justify-center items-center" style={{ color: currentColors.text }}>
        Loading spaces...
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <div className="flex h-screen justify-center items-center" style={{ color: currentColors.text }}>
        Space not found.
      </div>
    );
  }

  const formatFileTitle = (file_name) => {
    if (!file_name) return "";

    const decodedFileName = decodeURIComponent(file_name);
    const nameWithoutExtension = decodedFileName.split(".")[0];
    const cleanTitle = nameWithoutExtension.split("_")[0];

    return cleanTitle;
  };

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">Files</h1>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto pt-20 sm:pt-24 lg:pt-10">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10" style={{ color: currentColors.text }}>
            {space_name} Files
          </h1>

          <div className="max-w-6xl mx-auto">
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

            {/* ================= MOBILE (CARD VIEW) ================= */}
            <div className="flex flex-col gap-4 block md:hidden">
              {files.length === 0 && (
                <div className="rounded-lg p-6 text-center border" style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                  color: currentColors.textSecondary
                }}>
                  <div>No File Found.</div>
                </div>
              )}
              {files.map((file, index) => (
                <div
                  key={file.file_id || `file-${index}`}
                  className="rounded-lg p-4 flex flex-col gap-3 border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#10B981' }}>
                    ● {file.lesson_name || 'No Lesson'}
                  </p>

                  <p className="font-medium break-words" style={{ color: '#3B82F6' }}>
                    {formatFileTitle(file.file_name)}
                  </p>

                  <p className="text-sm">
                    <span style={{ color: currentColors.textSecondary }}>Date Posted:</span>{" "}
                    {file.created_at}
                  </p>

                  
                  <div className="flex items-center justify-between">
                    <span 
                      onClick={() =>
                        navigate(
                          `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.file_name)}/${file.file_id}`
                        )
                      }
                      className="px-3 py-1 text-xs rounded-md cursor-pointer transition"
                      style={{
                        backgroundColor: '#3B82F6',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                    >
                      View File
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= TABLET (RESPONSIVE TABLE VIEW) ================= */}
            <div className="hidden md:block lg:hidden rounded-lg overflow-hidden" style={{
              backgroundColor: currentColors.surface
            }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: currentColors.border }}>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Lesson Name</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>File Name</th>
                      
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>File Type</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Date</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                    {files.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center"
                          style={{ color: currentColors.textSecondary }}
                        >
                          No File Found.
                        </td>
                      </tr>
                    )}
                    {files.map((file, index) => (
                      <tr
                        key={file.file_id || `file-${index}`}
                        className="transition"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = currentColors.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: currentColors.text }}>{file.lesson_name || 'No Lesson'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm truncate max-w-[200px]" title={formatFileTitle(file.file_name)} style={{ color: currentColors.text }}>
                            {formatFileTitle(file.file_name)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>
                          {file.file_name?.split('.').pop()?.toUpperCase() || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            onClick={() =>
                              navigate(
                                // /files/:space_name/:space_uuid/:orig_file_name/:file_id
                                `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.file_name)}/${file.file_id}` 
                              )
                            }
                            className="px-2 py-1 text-xs rounded-md cursor-pointer transition" style={{
                              backgroundColor: '#3B82F6',
                              color: 'white'
                            }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}>
                            View
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= LAPTOP & DESKTOP (TABLE VIEW) ================= */}
            <div className="hidden lg:block rounded-lg overflow-hidden" style={{
              backgroundColor: currentColors.surface
            }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left" style={{ borderColor: currentColors.border }}>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Lesson Name</th>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>File Name</th>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Date Posted</th>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                  {files.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-6 text-center"
                        style={{ color: currentColors.textSecondary }}
                      >
                        No File Found.
                      </td>
                    </tr>
                  )}

                  {files.map((file, index) => (
                    <tr
                      key={file.file_id || `file-${index}`}
                      className="transition"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentColors.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4 font-medium" style={{ color: currentColors.text }}>{file.lesson_name || 'No Lesson'}</td>
                      
                      <td className="px-6 py-4 font-medium" style={{ color: currentColors.text }}>{formatFileTitle(file.file_name)}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          onClick={() =>
                            navigate(
                              `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.file_name)}/${file.file_id}` 
                            )
                          }
                          className="px-2 py-1 text-xs rounded-md cursor-pointer transition" style={{
                            backgroundColor: '#3B82F6',
                            color: 'white'
                          }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}>
                          View
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfViewFiles;
