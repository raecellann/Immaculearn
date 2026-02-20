import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../component/profsidebar";
import Logout from "../../component/logout";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { useFileManager } from "../../../hooks/useFileManager";

const ProfViewFiles = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { userSpaces, courseSpaces, friendSpaces, isLoading: spaceLoading } =
    useSpace();

  const { space_uuid, space_name } = useParams();

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  /* ================= GET REAL SPACE ================= */

  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];

  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid
  );

  // Safe display name (database first, URL fallback)
  const displayName =
    currentSpace?.space_name ||
    decodeURIComponent(space_name || "");

  /* ================= FETCH FILES ================= */

  const { list } = useFileManager(currentSpace?.space_id || null);
  const files = list?.data || [];

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
      <div className="flex h-screen justify-center items-center text-white">
        Loading spaces...
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Space not found.
      </div>
    );
  }
    const formatFileTitle = (filename) => {
  if (!filename) return "";

  const decodedFileName = decodeURIComponent(filename);
  const nameWithoutExtension = decodedFileName.split(".")[0];
  const cleanTitle = nameWithoutExtension.split("_")[0];

  return cleanTitle;
};
  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
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
            <h1 className="text-lg font-bold">Files</h1>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto pt-20 sm:pt-24 lg:pt-10">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-10">
            {displayName} Files
          </h1>

          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </button>
            </div>

            {/* ================= MOBILE (CARD VIEW) ================= */}
            <div className="flex flex-col gap-4 block md:hidden">
              {files.length === 0 && (
                <div className="bg-[#1E222A] border border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-gray-400">No File Found.</div>
                </div>
              )}
              {files.map((file, index) => (
                <div
                  key={file.file_uuid}
                  className="bg-[#1E222A] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
                >
                  <p className="text-sm text-green-400 font-medium">
                    ● {file.status}
                  </p>

                  <p className="text-blue-400 font-medium break-words">
                    {formatFileTitle(file.filename)}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Date Posted:</span>{" "}
                    {file.created_at}
                  </p>

                  <div className="flex items-center justify-between">
                    <span 
                      onClick={() =>
                        navigate(
                          `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.filename)}/${file.file_uuid}`
                        )
                      }
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition"
                    >
                      View File
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= TABLET (RESPONSIVE TABLE VIEW) ================= */}
            <div className="hidden md:block lg:hidden bg-gray-900 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-left">
                      <th className="px-4 py-3 text-xs uppercase">Status</th>
                      <th className="px-4 py-3 text-xs uppercase">File Name</th>
                      <th className="px-4 py-3 text-xs uppercase">Date</th>
                      <th className="px-4 py-3 text-xs uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {files.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-gray-400"
                        >
                          No File Found.
                        </td>
                      </tr>
                    )}
                    {files.map((file) => (
                      <tr
                        key={file.file_uuid}
                        className="hover:bg-gray-800/50 transition"
                      >
                        <td className="px-4 py-3">
                          <span className={`${file.status === "uploaded" ? "text-green-400" : file.status === "drafted" && "text-white-400" } flex items-center gap-2`}>
                            <span className={`w-2 h-2 ${file.status === "uploaded" ? "bg-green-500" : file.status === "drafted" && "bg-gray-500" } rounded-full`} />
                            <span className="text-xs">{file.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm truncate max-w-[200px]" title={formatFileTitle(file.filename)}>
                            {formatFileTitle(file.filename)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-sm">
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            onClick={() =>
                              navigate(
                                `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.filename)}/${file.file_uuid}`
                              )
                            }
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition"
                          >
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
            <div className="hidden lg:block bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-left">
                    <th className="px-6 py-4 text-xs uppercase">Status</th>
                    <th className="px-6 py-4 text-xs uppercase">File Name</th>
                    <th className="px-6 py-4 text-xs uppercase">
                      Date Posted
                    </th>
                    <th className="px-6 py-4 text-xs uppercase">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700">
                  {files.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-6 text-center text-gray-400"
                      >
                        No File Found.
                      </td>
                    </tr>
                  )}

                  {files.map((file) => (
                    <tr
                      key={file.file_uuid}
                      className="hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className={`${file.status === "uploaded" ? "text-green-400" : file.status === "drafted" && "text-white-400" } flex items-center gap-2`}>
                          <span className={`w-2 h-2 ${file.status === "uploaded" ? "bg-green-500" : file.status === "drafted" && "bg-gray-500" } rounded-full`} />
                          {file.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {formatFileTitle(file.filename)}
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {file.created_at
                          ? new Date(file.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span 
                          onClick={() =>
                            navigate(
                              `/prof/files/${encodeURIComponent(space_name)}/${space_uuid}/${encodeURIComponent(file.filename)}/${file.file_uuid}`
                            )
                          }
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md cursor-pointer hover:bg-blue-600 transition"
                        >
                          View File
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
