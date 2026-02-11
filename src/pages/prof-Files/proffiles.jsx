import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import Logout from "../component/logout";

const ProfFilePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const headerRef = useRef(null);
  const lastScroll = useRef(0);

  const files = [
    {
      status: "Posted",
      fileName: "LPS CS Thesis 1 – Week 6",
      datePosted: "July 24",
      spaceName: "CS THESIS 1 - 1SY2025-2026",
      posted: true,
      category: "your-space"
    },
    {
      status: "To be Uploaded",
      fileName: "Data Mining-Lecture",
      datePosted: "Oct 30",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: false,
      category: "course-space"
    },
    {
      status: "Posted",
      fileName: "Basic File and Access Concepts-2021",
      datePosted: "Oct 10",
      spaceName: "BUSINTEG - 1SY2025-2026",
      posted: true,
      category: "course-space"
    },
    {
      status: "Posted",
      fileName: "Machine Learning Projects",
      datePosted: "Nov 15",
      spaceName: "CS THESIS 1 - 1SY2025-2026",
      posted: true,
      category: "your-space"
    },
    {
      status: "Posted",
      fileName: "Database Design Notes",
      datePosted: "Sep 22",
      spaceName: "DATASTRUCT - 1SY2025-2026",
      posted: true,
      category: "course-space"
    },
    {
      status: "To be Uploaded",
      fileName: "Research Papers Collection",
      datePosted: "Dec 01",
      spaceName: "CS THESIS 1 - 1SY2025-2026",
      posted: false,
      category: "your-space"
    },
  ];

  const filesByCategory = files.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {});

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
          {filesByCategory['your-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Your Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {filesByCategory['your-space'].map((file, index) => (
                  <div
                    key={`your-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{file.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Course Space Files */}
          {filesByCategory['course-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Course Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {filesByCategory['course-space'].map((file, index) => (
                  <div
                    key={`course-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{file.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Friends Space Files */}
          {filesByCategory['friends-space'] && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Friends Space</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                {filesByCategory['friends-space'].map((file, index) => (
                  <div
                    key={`friends-space-${index}`}
                    className="bg-[#1F242D] border border-gray-600 rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 hover:bg-[#252B34] transition cursor-pointer"
                  >
                    <span className="text-xl">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">{file.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL RESTORED */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#1F242D] p-6 rounded-lg w-[90%] max-w-[400px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Upload New File
            </h2>

            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="File Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <input
                type="text"
                placeholder="Date Posted (e.g. Oct 30)"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <input
                type="text"
                placeholder="Space Name"
                className="p-2 bg-[#2A2E36] rounded-md text-white outline-none"
              />
              <select className="p-2 bg-[#2A2E36] rounded-md text-white outline-none">
                <option>To be Uploaded</option>
                <option>Posted</option>
              </select>
            </form>

            <div className="flex justify-end mt-5 gap-3">
              <button
                onClick={(e) => {
                  // Clear form
                  const form = e.target.closest('form');
                  if (form) {
                    form.reset();
                  }
                }}
                className="px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  // Handle form submission
                  const form = e.target.closest('form');
                  if (form) {
                    const formData = new FormData();
                    formData.append('fileName', form.querySelector('input[placeholder="File Name"]').value);
                    formData.append('datePosted', form.querySelector('input[placeholder*="Date"]').value);
                    formData.append('spaceName', form.querySelector('input[placeholder*="Space"]').value);
                    formData.append('status', form.querySelector('select').value);
                    
                    // Here you would typically make an API call to save the file
                    console.log('New file:', {
                      fileName: form.querySelector('input[placeholder="File Name"]').value,
                      datePosted: form.querySelector('input[placeholder*="Date"]').value,
                      spaceName: form.querySelector('input[placeholder*="Space"]').value,
                      status: form.querySelector('select').value
                    });
                    
                    // Add to files array and close modal
                    setFiles([...files, {
                      fileName: form.querySelector('input[placeholder="File Name"]').value,
                      datePosted: form.querySelector('input[placeholder*="Date"]').value,
                      spaceName: form.querySelector('input[placeholder*="Space"]').value,
                      status: form.querySelector('select').value === "To be Uploaded" ? "Posted" : "Posted",
                      posted: form.querySelector('select').value === "Posted",
                      category: form.querySelector('select').value === "To be Uploaded" ? "your-space" : "course-space"
                    }]);
                    setShowModal(false);
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