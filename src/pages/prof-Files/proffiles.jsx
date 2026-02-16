import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/profsidebar";
import { useFileManager } from "../../hooks/useFileManager";
import Button from "../component/Button";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";

const ProfFilePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const lastScroll = useRef(0);

  const { isAuthenticated } = useUser();
  const { userSpaces, courseSpaces } = useSpace();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Use actual space data instead of hardcoded array
  const spaces = [
    // Your spaces (Professor's personal spaces)
    ...(userSpaces || []).map(space => ({ 
      name: space.space_name, 
      category: "your-space",
      space_uuid: space.space_uuid
    })),
    // Course spaces (Professor's course spaces)
    ...(courseSpaces || []).map(space => ({ 
      name: space.space_name, 
      category: "course-space",
      space_uuid: space.space_uuid
    }))
  ];

  const spacesByCategory = spaces.reduce((acc, space) => {
    if (!acc[space.category]) {
      acc[space.category] = [];
    }
    acc[space.category].push(space);
    return acc;
  }, {
    'your-space': [],
    'course-space': []
  });

  // 🔹 Hide-on-scroll header
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (headerRef.current) {
        if (currentScroll > lastScroll.current) {
          headerRef.current.style.transform = "translateY(-100%)";
        } else {
          headerRef.current.style.transform = "translateY(0)";
        }
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 🔥 Sticky Mobile Header */}
        <div
          ref={headerRef}
          className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E222A] border-b border-[#3B4457]
          transition-transform duration-300"
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

        {/* ✅ CONTENT (FOLDER-LIKE DISPLAY) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Files
          </h1>

          {/* Your Space Files */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Your Space</h2>
            {userSpaces?.length === 0 ? (
              <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                No space files yet
              </div>
            ) : userSpaces?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {userSpaces.map((space, index) => (
                  <div
                    key={`your-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/prof/files/${space.space_uuid}/${space.space_name}/${space.space_uuid}/${space.space_name}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{space.space_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>

          {/* Course Space Files */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Course Space</h2>
            {spacesByCategory['course-space']?.length === 0 ? (
              <div className="bg-[#1E242E] rounded-xl p-10 text-center text-gray-400 border border-dashed border-gray-600">
                No course space files yet
              </div>
            ) : spacesByCategory['course-space']?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {spacesByCategory['course-space'].map((space, index) => (
                  <div
                    key={`course-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                    onClick={() => navigate(`/prof/files/${space.space_uuid}/${space.space_name}/${space.space_uuid}/${space.space_name}`)}
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{space.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-b border-gray-700 my-6"></div>
          </div>

        </div>
      </div>

      {/* ✅ MODAL RESTORED */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#1F242D] p-6 rounded-lg w-[90%] max-w-[400px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Upload New File
            </h2>

            <form className="flex flex-col gap-3" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleFileUpload(formData);
            }}>
              <input
                type="text"
                name="fileName"
                placeholder="File Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
                required
              />
              <input
                type="text"
                name="spaceName"
                placeholder="Space Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
                required
              />
            </form>

            <div className="flex justify-end mt-5 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const form = document.querySelector('form');
                  if (form && form.checkValidity()) {
                    const formData = new FormData(form);
                    handleFileUpload(formData);
                  } else {
                    form?.reportValidity();
                  }
                }}
                className="px-3 py-1 bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfFilePage;