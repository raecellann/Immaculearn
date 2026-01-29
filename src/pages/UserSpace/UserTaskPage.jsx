import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import { FiMenu, FiX, FiFileText } from "react-icons/fi";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import MainLoading from "../../components/LoadingComponents/mainLoading";
import { toast } from "react-toastify";
import { useFileManager } from "../../hooks/useFileManager";
// import FileService from "../../services/fileService";


const UserTaskPage = () => {
  const navigate = useNavigate();
  // const fileService = new FileService();
  const { create } = useFileManager();

  const { space_uuid, space_name } = useParams();

  const { user, isLoading } = useUser();
  const { userSpaces, friendSpaces } = useSpace();

  /* ================= SPACE & OWNER LOGIC ================= */
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid
  );

  const isOwner = user && currentSpace?.creator === user.id;

  /* ================= UI STATES ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [fileName, setFileName] = useState("");




  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(
        !(currentScrollY > lastScrollY.current && currentScrollY > 50)
      );
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= TASK DATA ================= */
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  const [tasks] = useState([
    {
      name: "Thesis Paper 📄",
      deadline: "April 12, 2025",
      space: "Zeldrick's Space",
      status: "Done",
    },
    {
      name: "OS Activity 🧠",
      deadline: "April 12, 2025",
      space: "Your Space",
      status: "In Progress",
    },
    {
      name: "Personal Reflection 📝",
      deadline: "April 12, 2025",
      space: "Nathaniel's Space",
      status: "Missing",
    },
  ]);

  /* ================= RENDER ================= */
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#161A20] justify-center items-center">
        <MainLoading />
      </div>
    );
  }


  const handleCreateFile = () => {
    if (!fileName.trim()) {
      toast.error("File title is required");
      return;
    }

    create.mutate(
      {
        title: fileName,
        space_id: currentSpace?.space_id || "",
        content: "",
      },
      {
        onSuccess: (newFile) => {
          toast.success(`File "${fileName}" created successfully!`);

          const url = `/space/${space_uuid}/${space_name}/files/${newFile.fuuid}/${fileName}`;
          window.open(url, "_blank", "noopener,noreferrer");

          setFileName("");
          setIsCreatingFile(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(err?.message || "Failed to create file");
        },
      }
    );
  };



  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:hidden`}
      >
        <Sidebar />
      </div>

      {/* <iframe src="https://docs.google.com/gview?url=http://res.cloudinary.com/dbriapahp/raw/upload/v1769578532/ImmacuLearn/uploads/sample-doc1_o1_1769574913296html.docx&embedded=true" width="600" height="800"></iframe> */}


      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= MOBILE HEADER ================= */}
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

        {/* ================= COVER ================= */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-bold">{space_name}</h1>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center space-x-12">
              <button onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}>
                Stream
              </button>
              <button className="font-semibold border-b-2 border-white pb-2">
                Tasks
              </button>
              <button
                onClick={() =>
                  navigate(`/space/${space_uuid}/${space_name}/files`)
                }
              >
                Files
              </button>
              <button
                onClick={() =>
                  navigate(`/space/${space_uuid}/${space_name}/people`)
                }
              >
                People
              </button>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          {!isCreatingFile ? (
            <>
              {/* OWNER BUTTON */}
              {isOwner && (
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setIsCreatingFile(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <FiFileText size={16} />
                    Create File
                  </button>
                </div>
              )}

              {/* TASK LIST */}
              <div className="max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold mb-6">
                  To Do Lists 📚
                </h2>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600 text-gray-400 text-left">
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Task Name</th>
                        <th className="py-3 px-4">Deadline</th>
                        <th className="py-3 px-4">Space Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <span
                              className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.status]}`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-blue-400">
                            {task.name}
                          </td>
                          <td className="py-3 px-4">{task.deadline}</td>
                          <td className="py-3 px-4">{task.space}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-4">
                  {tasks.map((task, index) => (
                    <div
                      key={index}
                      className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex justify-between mb-2">
                        <p className="font-semibold">{task.name}</p>
                        <span
                          className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.status]}`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Deadline: {task.deadline}
                      </p>
                      <p className="text-sm text-gray-400">
                        Space: {task.space}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ================= CREATE / UPLOAD FILE ================= */
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-6">
                <button
                  className="bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-sm"
                  onClick={() => setIsCreatingFile(false)}
                >
                  ← Back to Tasks
                </button>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white">
                <label className="font-semibold text-lg mb-3 block">
                  File Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-[#23272F] w-full rounded-lg px-4 py-2 mb-6 outline-none border border-[#23272F] focus:border-blue-500"
                  placeholder="Enter file title"
                />

                {/* <div className="border border-dashed border-gray-500 rounded-lg p-8 text-center bg-[#0F1115]">
                  <p className="text-sm text-gray-300 mb-2">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, DOCX, PPT, XLSX — up to 10MB
                  </p>
                  <button className="px-4 py-2 border border-gray-400 rounded-md text-sm hover:bg-gray-800">
                    Browse Files
                  </button>
                </div> */}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="bg-gray-700 hover:bg-gray-800 px-6 py-2 rounded-lg"
                    onClick={() => setIsCreatingFile(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateFile}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTaskPage;
