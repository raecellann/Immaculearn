import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import { useNavigate, useParams } from "react-router";
import { useSpace } from "../../../contexts/space/useSpace";
import { useUser } from "../../../contexts/user/useUser";
import { useFileManager } from "../../../hooks/useFileManager";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ViewAllFilesPage = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();

  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, []);


  const { userSpaces, friendSpaces } = useSpace();
  const { space_uuid, space_name } = useParams();

  
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  // Remove duplicates by space_id
  const uniqueSpaces = allSpaces.filter(
    (space, index, self) =>
      index === self.findIndex(s => s.space_id === space.space_id)
  );
  
  const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);



  const { list } = useFileManager(currentSpace?.space_id);
  const files = list.data || [];

  console.log(files)



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

  const formatFileTitle = (filename) => {
  if (!filename) return "";

  const decodedFileName = decodeURIComponent(filename);
  const nameWithoutExtension = decodedFileName.split(".")[0];
  const cleanTitle = nameWithoutExtension.split("_")[0];

  return cleanTitle;
};

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
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
            <h1 className="text-lg font-bold" style={{ color: isDarkMode ? "white" : currentColors.text }}>Files</h1>
          </div>
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto pt-20 sm:pt-24 lg:pt-10">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10" style={{ color: currentColors.text }}>
            { space_name } Files
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
                  key={index}
                  className="border rounded-lg p-4 flex flex-col gap-3"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#10B981' }}>
                    ● {file.status}
                  </p>

                  <p className="font-medium break-words" style={{ color: '#3B82F6' }}>
                    {formatFileTitle(file.filename)}
                  </p>

                  <p className="text-sm">
                    <span style={{ color: currentColors.textSecondary }}>Date Posted:</span>{" "}
                    {file.created_at}
                  </p>

                  
                  <div className="flex items-center justify-between">
                    <span 
                      
                      onClick={() =>
                        navigate(
                          `/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.filename)}/${file.file_uuid}`
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
            <div className="hidden md:block lg:hidden rounded-lg overflow-hidden" style={{ backgroundColor: currentColors.surface }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: currentColors.border }}>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Status</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>File Name</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Date</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                    {files.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center"
                          style={{ color: currentColors.textSecondary }}
                        >
                          No File Found.
                        </td>
                      </tr>
                    )}
                    {files.map((file, index) => (
                      <tr
                        key={index}
                        className="transition"
                        style={{ ':hover': { backgroundColor: currentColors.hover } }}
                      >
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full`} style={{
                              backgroundColor: file.status === "uploaded" ? '#10B981' : '#6B7280'
                            }} />
                            <span className="text-xs" style={{ color: currentColors.text }}>{file.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm truncate max-w-[200px]" title={formatFileTitle(file.filename)} style={{ color: currentColors.text }}>
                            {formatFileTitle(file.filename)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs rounded-md cursor-pointer transition" style={{
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
            <div className="hidden lg:block rounded-lg overflow-hidden" style={{ backgroundColor: currentColors.surface }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b text-left" style={{ borderColor: currentColors.border }}>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Status</th>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>File Name</th>
                    <th className="px-6 py-4 text-xs uppercase" style={{ color: currentColors.textSecondary }}>Date Posted</th>
                    {/* <th className="px-6 py-4 text-xs uppercase">Space Name</th> */}
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
                      key={index}
                      className="transition"
                      style={{ ':hover': { backgroundColor: currentColors.hover } }}
                    >
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full`} style={{
                            backgroundColor: file.status === "uploaded" ? '#10B981' : '#6B7280'
                          }} />
                          <span className="text-xs" style={{ color: currentColors.text }}>{file.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: currentColors.text }}>{formatFileTitle(file.filename)}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: currentColors.textSecondary }}>
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-md cursor-pointer transition" style={{
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

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ViewAllFilesPage;