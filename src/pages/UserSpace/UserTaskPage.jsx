import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTasks } from "../../hooks/useTasks";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import {
  FiMenu,
  FiX,
  FiCopy,
} from "react-icons/fi";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import MainButton from "../component/Button.jsx";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";

const UserTaskPage = () => {
  const [copyFeedback, setCopyFeedback] = useState("");
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { user, isLoading } = useUser();
  const { userSpaces, friendSpaces } = useSpace();
  
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find((space) => space.space_uuid === space_uuid);
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;
  
  const { uploadedTasksQuery, draftedTasksQuery, updateTaskStatusMutation } = useTasks(currentSpace?.space_id);
  const taskData = uploadedTasksQuery?.data || [];
  const draftActivities = draftedTasksQuery?.data || [];
  const uploadedTask = Array.isArray(taskData) ? taskData : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities) ? draftActivities : draftActivities?.data || [];

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [openIndex, setOpenIndex] = useState(null);
  const [openDraftIndex, setOpenDraftIndex] = useState(null);

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

  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  const handleStatusChange = (index, newStatus) => {
    const task = uploadedTask[index];
    if (task && task.id) {
      updateTaskStatusMutation.mutate({ taskId: task.id, newStatus });
    }
    setOpenIndex(null);
  };

  const handleDraftStatusChange = (index, newStatus) => {
    const draft = draftedTask[index];
    if (draft && draft.id) {
      updateTaskStatusMutation.mutate({ taskId: draft.id, newStatus });
    }
    setOpenDraftIndex(null);
  };

  const handleCopyLink = (space_link) => {
    navigator.clipboard.writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch(() => {
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  const taskCategories = [
    { value: "personal-reflection", label: "Personal Reflection", emoji: "🤔" },
    { value: "individual-act", label: "Individual Activity", emoji: "📝" },
    { value: "group-project", label: "Group Project", emoji: "👥" },
    { value: "individual-project", label: "Individual Project", emoji: "🎯" },
  ];

  const getCategoryDisplay = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? `${category.emoji} ${category.label}` : "📝 Task";
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:block lg:hidden`}>
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      <div className="flex-1 flex flex-col w-full">
        <div className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="bg-transparent border-none text-white text-2xl p-0">
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>
        <div className="lg:hidden h-16" />
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-32 sm:h-40 md:h-48">
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="p-4 sm:p-6">
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">({currentSpace?.members?.length || 0} member(s))</span>
              {isFriendSpace && (
                <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md">
                  <span className="text-xs text-blue-400 break-all">{currentSpace?.space_link || "Loading..."}</span>
                  <button onClick={() => handleCopyLink(currentSpace?.space_link)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors" title="Copy to clipboard">
                    <FiCopy size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}>Stream</button>
                <button className="font-semibold border-b-2 border-white pb-2">Tasks</button>
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/files`)}>Files</button>
                <button onClick={() => navigate(`/space/${space_uuid}/${space_name}/people`)}>People</button>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Assigned Tasks</h2>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400 text-left">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Task Name</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedTask?.map((task, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-[#1E222A]">
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.task_status]}`}>
                            {task.task_status} ▼
                          </button>
                          {openIndex === index && (
                            <div className="absolute left-0 mt-2 w-44 bg-[#1E222A] border border-gray-700 rounded-lg p-3 z-50 shadow-lg">
                              <div className="flex flex-col gap-2">
                                {Object.keys(statusStyles).map((st) => (
                                  <button key={st} onClick={() => handleStatusChange(index, st)} className={`w-full text-center px-4 py-2 rounded-full bg-black ${statusStyles[st]} text-sm font-medium hover:opacity-90 whitespace-nowrap`}>
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryDisplay(task.task_category)}</span>
                          <span className="text-sm font-semibold">{task.task_title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(task.task_due).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })}
                      </td>
                      <td className="py-3 px-4">
                        <MainButton className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium" onClick={() => navigate(`/task/${currentSpace?.space_uuid}/${currentSpace?.space_name}/${task.task_title}`)}>
                          View Button
                        </MainButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {uploadedTask?.map((task, index) => (
                <div key={index} className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryDisplay(task.task_category)}</span>
                      <span className="text-sm font-semibold">{task.task_title}</span>
                    </div>
                    <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.task_status]}`}>
                      {task.task_status}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Deadline: <span className="text-white">{new Date(task.task_due).toLocaleDateString("en-US")}</span>
                  </p>
                  {openIndex === index && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-col gap-2">
                        {Object.keys(statusStyles).map((st) => (
                          <button key={st} onClick={() => { handleStatusChange(index, st); setOpenIndex(null); }} className={`w-full text-center px-4 py-2 rounded-full ${statusStyles[st]} text-sm font-medium`}>
                            Mark as {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <a href="/prof-task-view" className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-5xl mx-auto w-full mt-12">
              <h2 className="text-xl font-semibold mb-6">Draft Activities 📝</h2>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600 text-gray-400 text-left">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Task Name</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftedTask?.map((draft, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-[#1E222A]">
                        <td className="py-3 px-4">
                          <span className="px-6 py-1 rounded-full bg-black text-sm font-bold border-2 border-gray-500 text-gray-400 inline-block min-w-[120px] text-center">Draft</span>
                        </td>
                        <td className="py-3 px-4">{draft.task_title}</td>
                        <td className="py-3 px-4">
                          {new Date(draft.task_due).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })}
                        </td>
                        <td className="py-3 px-4">
                          <a href="/prof-task-view" className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-4">
                {draftedTask?.map((draft, index) => (
                  <div key={index} className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold">{draft.task_title}</p>
                      <span className="px-3 py-1 rounded-full bg-black text-xs border-2 border-gray-500 text-gray-400 font-bold">Draft</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Deadline: <span className="text-white">{new Date(draft.task_due).toLocaleDateString("en-US")}</span>
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <a href="/prof-task-view" className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default UserTaskPage;
