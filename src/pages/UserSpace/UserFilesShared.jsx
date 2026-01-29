import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import { FiFileText, FiMenu, FiX } from "react-icons/fi";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import { useFileManager } from "../../hooks/useFileManager";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";

const ShareModal = ({ isOpen, onClose, members, file, onGrantAccess, onRevokeAccess }) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#1E222A] rounded-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 bg-white text-gray-800 hover:text-black"
          onClick={onClose}
        >
          <FiX size={16} />
        </button>

        <div className="mt-8">

          <h2 className="text-xl font-semibold mb-4">Share "{file.filename}"</h2>
          <p className="text-gray-400 mb-4">Select members to grant or revoke access:</p>

          <div className="max-h-96 overflow-y-auto ">
            {members.map((member) => {
              const hasAccess = file.access?.includes(member.account_id);
              return (
                <div
                  key={member.account_id}
                  className="flex justify-between items-center p-2 rounded hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="text-white font-medium">{member.full_name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                  <button
                    onClick={() =>
                      hasAccess
                        ? onRevokeAccess(member.account_id)
                        : onGrantAccess(member.account_id)
                    }
                    className={`px-3 py-1 text-sm rounded ${
                      hasAccess ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {hasAccess ? "Revoke" : "Grant"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

const UserFilesShared = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { userSpaces, friendSpaces } = useSpace();
  const { space_uuid, space_name } = useParams();

  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);

  const { list } = useFileManager(currentSpace?.space_id);
  const files = list.data || [];

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(!(currentScrollY > lastScrollY.current && currentScrollY > 50));
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (list.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161A20]">
        <MainLoading />
      </div>
    );
  }

  // Grant/Revoke access handlers
  const handleGrantAccess = (memberId) => {
    setActiveFile((prev) => ({
      ...prev,
      access: [...(prev.access || []), memberId],
    }));
    // TODO: Call backend API to save access
  };

  const handleRevokeAccess = (memberId) => {
    setActiveFile((prev) => ({
      ...prev,
      access: (prev.access || []).filter((id) => id !== memberId),
    }));
    // TODO: Call backend API to remove access
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* Sidebar */}
      <div className="hidden lg:block"><Sidebar /></div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
      >
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col w-full">
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457]
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{space_name}</h1>
        </div>
        <div className="lg:hidden h-16" />

        {/* Cover */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Tabs */}
          <div className="w-full overflow-x-auto border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center space-x-12">
              <button onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}>Stream</button>
              <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}>Tasks</button>
              <button className="font-semibold border-b-2 border-white pb-2">Files</button>
              <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/people`)}>People</button>
            </div>
          </div>

          {/* Action Ribbon */}
          {activeFile && (
            <div className="sticky top-0 z-20 mb-6 bg-[#1E222A] border border-gray-700 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiFileText />
                <span key={activeFile.file_id} className="font-semibold truncate max-w-[220px]">
                  {activeFile.filename}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `/space/${space_uuid}/${space_name}/files/${activeFile.file_uuid}/${activeFile.filename}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  Open
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  Share
                </button>

                <button className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">
                  Upload Version
                </button>

                <button
                  onClick={() => setActiveFile(null)}
                  className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* File List */}
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setShowCreateUploadModal(true)}
              >
                <FiFileText size={16} />
                Create or Upload File
              </button>
            </div>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-[#0F1115] rounded-xl p-6">
              <div className="grid grid-cols-3 text-sm text-gray-400 pb-3 border-b border-gray-700">
                <div>File Name</div>
                <div>Date Created</div>
                <div>Created By</div>
              </div>

              {files.map((file) => (
                <div
                  key={file.file_id}
                  onClick={() => setActiveFile(file)}
                  className="grid grid-cols-3 items-center bg-[#161A20] rounded-lg px-4 py-3 mt-4
                             hover:bg-[#1E222A] cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <span className=" truncate max-w-[200px]">{file.filename}</span>
                  </div>

                  <div>
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>

                  <div>{file.owner_id === user.id ? "You" : currentSpace.members.find(
                      member => member.account_id === file.owner_id
                    )?.full_name}
                  </div>
                </div>
              ))}
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setActiveFile(file)}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#23272F] p-2 rounded-md">
                      <FiFileText />
                    </div>
                    <p className="font-semibold">{file.title}</p>
                  </div>

                  <p className="text-sm text-gray-400">
                    Created:{" "}
                    <span className="text-white">
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    By:{" "}
                    <span className="text-white">
                      {file.owner_name || "Unknown"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        members={currentSpace?.members || []}
        file={activeFile}
        onGrantAccess={handleGrantAccess}
        onRevokeAccess={handleRevokeAccess}
      />
    </div>
  );
};

export default UserFilesShared;
