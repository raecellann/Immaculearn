import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import Logout from "../../component/logout";
import {
  FiFileText,
  FiMenu,
  FiX,
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
} from "react-icons/fi";

const AdminTaskPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  /* ================= CREATE TASK MODE ================= */
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showManualGroups, setShowManualGroups] = useState(false);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(1);
  const [groups, setGroups] = useState([{ id: 1, members: [], leader: '', showInputs: false, isSaved: false, wasPreviouslySaved: false }]);
  const [activeGroup, setActiveGroup] = useState(1);
  const [isTablet, setIsTablet] = useState(false);
  const [groupsConfigured, setGroupsConfigured] = useState(false);
  const [groupCreationMethod, setGroupCreationMethod] = useState(null);
  const [generatedGroupsPreview, setGeneratedGroupsPreview] = useState([]);

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

  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  // Example available members in the admin's space
  const availableMembers = [
    "John Smith",
    "Emily Johnson", 
    "Michael Brown",
    "Sarah Davis",
    "James Wilson",
    "Lisa Anderson",
    "Robert Taylor",
    "Maria Garcia",
    "David Martinez",
    "Jennifer Lopez"
  ];

  const handleManualGroups = () => {
    if (groupsConfigured) {
      if (groupCreationMethod === 'generate') {
        setShowGenerateGroups(true);
      } else {
        setActiveGroup(1);
        setShowManualGroups(true);
      }
    } else {
      const input = document.getElementById('groups-input');
      const numGroups = parseInt(input.value) || 1;
      setNumberOfGroups(numGroups);
      setGroupCreationMethod('manual');
      
      const newGroups = Array.from({ length: numGroups }, (_, index) => ({
        id: index + 1,
        members: [''],
        leader: '',
        showInputs: false,
        isSaved: false,
        wasPreviouslySaved: false
      }));
      setGroups(newGroups);
      setActiveGroup(1);
      setShowManualGroups(true);
    }
  };

  const handleGenerateGroups = () => {
    const input = document.getElementById('groups-input');
    const numGroups = parseInt(input.value) || 1;
    setNumberOfGroups(numGroups);
    
    shuffleGroups(numGroups);
    setShowGenerateGroups(true);
  };

  const shuffleGroups = (numGroups) => {
    const shuffledMembers = [...availableMembers].sort(() => Math.random() - 0.5);
    
    const totalMembers = shuffledMembers.length;
    const baseMembersPerGroup = Math.floor(totalMembers / numGroups);
    const remainder = totalMembers % numGroups;
    
    const newGroups = Array.from({ length: numGroups }, (_, index) => {
      const membersCount = baseMembersPerGroup + (index < remainder ? 1 : 0);
      
      let startIndex = 0;
      for (let i = 0; i < index; i++) {
        startIndex += baseMembersPerGroup + (i < remainder ? 1 : 0);
      }
      const endIndex = startIndex + membersCount;
      
      const groupMembers = shuffledMembers.slice(startIndex, endIndex);
      
      const leader = groupMembers[0] || '';
      const members = groupMembers.slice(1);
      
      return {
        id: index + 1,
        leader: leader,
        members: members,
        showInputs: false,
        isSaved: true,
        wasPreviouslySaved: true
      };
    });
    
    setGeneratedGroupsPreview(newGroups);
  };

  // Task status styles
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  // Example tasks
  const [tasks, setTasks] = useState([
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
  const [openIndex, setOpenIndex] = useState(null);

  // Draft activities state
  const [draftActivities, setDraftActivities] = useState([
    {
      name: "Research Paper Draft 📝",
      deadline: "May 15, 2025",
      space: "Zeldrick's Space",
      status: "Draft",
    },
    {
      name: "Lab Report Outline 🧪",
      deadline: "May 20, 2025",
      space: "Your Space",
      status: "Draft",
    },
  ]);
  const [openDraftIndex, setOpenDraftIndex] = useState(null);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
  };

  const handleDraftStatusChange = (index, newStatus) => {
    const updated = [...draftActivities];
    updated[index].status = newStatus;
    setDraftActivities(updated);
    setOpenDraftIndex(null);
  };

  const handleGroupMemberChange = (groupId, memberIndex, value) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].members[memberIndex] = value;
    setGroups(updatedGroups);
  };

  const handleGroupLeaderChange = (groupId, value) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].leader = value;
    setGroups(updatedGroups);
  };

  const toggleGroupInputs = (groupId) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].showInputs = !updatedGroups[groupId - 1].showInputs;
    setGroups(updatedGroups);
  };

  const editGroup = (groupId) => {
    const updatedGroups = [...groups];
    const group = updatedGroups[groupId - 1];
    
    updatedGroups[groupId - 1].originalData = {
      leader: group.leader,
      members: [...group.members]
    };
    
    updatedGroups[groupId - 1].showInputs = true;
    updatedGroups[groupId - 1].isSaved = false;
    setGroups(updatedGroups);
  };

  const resetGroupInputs = (groupId) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1] = {
      ...updatedGroups[groupId - 1],
      leader: '',
      members: [''],
      showInputs: false,
      isSaved: false
    };
    setGroups(updatedGroups);
  };

  const addMemberToGroup = (groupId) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].members.push('');
    setGroups(updatedGroups);
  };

  const saveMemberToGroup = (groupId, memberIndex) => {
    const updatedGroups = [...groups];
    const currentMember = updatedGroups[groupId - 1].members[memberIndex];
    
    if (currentMember.trim()) {
      console.log(`Member "${currentMember}" saved to Group ${groupId}`);
    }
  };

  const addMemberFromAvailable = (memberName) => {
    const activeGroupData = groups[activeGroup - 1];
    if (!activeGroupData.showInputs) {
      console.log('Cannot add member: Group inputs are not visible. Click "Add People" first.');
      return;
    }

    const updatedGroups = [...groups];
    const activeGroupDataUpdated = updatedGroups[activeGroup - 1];
    
    if (!activeGroupDataUpdated.leader || activeGroupDataUpdated.leader.trim() === '') {
      activeGroupDataUpdated.leader = memberName;
      console.log(`Added "${memberName}" as leader of Group ${activeGroup}`);
    } else {
      const activeGroupMembers = activeGroupDataUpdated.members;
      const firstEmptyIndex = activeGroupMembers.findIndex(member => !member || member.trim() === '');
      
      if (firstEmptyIndex !== -1) {
        activeGroupMembers[firstEmptyIndex] = memberName;
      } else {
        activeGroupMembers.push(memberName);
        activeGroupMembers.push('');
      }
      console.log(`Added "${memberName}" to Group ${activeGroup} as member at position ${firstEmptyIndex !== -1 ? firstEmptyIndex + 1 : activeGroupMembers.length}`);
    }
    
    setGroups(updatedGroups);
  };

  const getAssignedMembers = () => {
    const allAssignedMembers = new Set();
    groups.forEach(group => {
      if (group.leader && group.leader.trim()) {
        allAssignedMembers.add(group.leader.trim());
      }
      group.members.forEach(member => {
        if (member && member.trim()) {
          allAssignedMembers.add(member.trim());
        }
      });
    });
    return allAssignedMembers;
  };

  const isMemberAssigned = (memberName) => {
    return getAssignedMembers().has(memberName);
  };

  const getMemberRole = (memberName) => {
    for (const group of groups) {
      if (group.leader && group.leader.trim() === memberName) {
        return 'leader';
      }
      if (group.members.some(member => member && member.trim() === memberName)) {
        return 'member';
      }
    }
    return null;
  };

  const saveGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const validMembers = group.members.filter(member => member.trim());
    console.log(`Group ${groupId} saved with leader: ${group.leader}, members:`, validMembers);
    
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].isSaved = true;
    updatedGroups[groupId - 1].showInputs = false;
    updatedGroups[groupId - 1].wasPreviouslySaved = true;
    setGroups(updatedGroups);
  };

  const removeMemberFromGroup = (groupId, memberIndex) => {
    const updatedGroups = [...groups];
    const groupMembers = updatedGroups[groupId - 1].members;
    
    groupMembers.splice(memberIndex, 1);
    
    const hasEmptyField = groupMembers.some(member => !member || member.trim() === '');
    if (!hasEmptyField) {
      groupMembers.push('');
    }
    
    setGroups(updatedGroups);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457]
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <h1 className="text-xl font-bold">Zeldrick's Space</h1>
        </div>

        {/* HEADER SPACER */}
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
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Zeldrick's Space</h1>
          </div>

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16 xl:gap-[120px]">
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-stream")}
                >
                  Stream
                </button>
                <button
                  className="text-white text-base sm:text-lg md:text-xl font-semibold pb-2 px-1 whitespace-nowrap bg-transparent"
                  onClick={() => navigate("/admin-task-page")}
                >
                  Tasks
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-files-shared")}
                >
                  Files Shared
                </button>
                <button
                  className="text-gray-400 text-base sm:text-lg md:text-xl hover:text-white transition bg-transparent px-1 whitespace-nowrap"
                  onClick={() => navigate("/admin-people")}
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* ================= CREATE/UPLOAD ACTIVITY BUTTON ================= */}
          {!isCreatingTask && (
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                onClick={() => setIsCreatingTask(true)}
              >
                <FiFileText size={16} />
                Create Task
              </button>
            </div>
          )}

          {!isCreatingTask ? (
            <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-xl font-semibold mb-6">Activities 📚</h2>

            {/* DESKTOP TABLE - HIDDEN ON MOBILE */}
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
                  {tasks.map((task, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#1E222A]"
                    >
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenIndex(openIndex === index ? null : index)
                            }
                            className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.status]}`}
                          >
                            {task.status} ▼
                          </button>
                          {openIndex === index && (
                            <div className="absolute left-0 mt-2 w-44 bg-[#1E222A] border border-gray-700 rounded-lg p-3 z-50 shadow-lg">
                              <div className="flex flex-col gap-2">
                                {Object.keys(statusStyles).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() =>
                                      handleStatusChange(index, st)
                                    }
                                    className={`w-full text-center px-4 py-2 rounded-full bg-black ${statusStyles[st]} text-sm font-medium hover:opacity-90 whitespace-nowrap`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {task.name}
                      </td>
                      <td className="py-3 px-4">{task.deadline}</td>
                      <td className="py-3 px-4">
                        <a
                          href="/task-view-admin"
                          className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS - SHOWN ON MOBILE */}
            <div className="md:hidden space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold">{task.name}</p>
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                      className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.status]}`}
                    >
                      {task.status}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Deadline:{" "}
                    <span className="text-white">{task.deadline}</span>
                  </p>

                  {openIndex === index && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-col gap-2">
                        {Object.keys(statusStyles).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              handleStatusChange(index, st);
                              setOpenIndex(null);
                            }}
                            className={`w-full text-center px-4 py-2 rounded-full ${statusStyles[st]} text-sm font-medium`}
                          >
                            Mark as {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <a
                      href="/task-view-admin"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* DRAFT ACTIVITIES TABLE */}
            <div className="max-w-5xl mx-auto w-full mt-12">
              <h2 className="text-xl font-semibold mb-6">Draft Activities 📝</h2>

              {/* DESKTOP TABLE - HIDDEN ON MOBILE */}
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
                    {draftActivities.map((draft, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#1E222A]"
                      >
                        <td className="py-3 px-4">
                          <span className="px-6 py-1 rounded-full bg-black text-sm font-bold border-2 border-gray-500 text-gray-400 inline-block min-w-[120px] text-center">
                            Draft
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {draft.name}
                        </td>
                        <td className="py-3 px-4">{draft.deadline}</td>
                        <td className="py-3 px-4">
                          <a
                            href="/task-view-admin"
                            className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS - SHOWN ON MOBILE */}
              <div className="md:hidden space-y-4">
                {draftActivities.map((draft, index) => (
                  <div
                    key={index}
                    className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold">{draft.name}</p>
                      <span className="px-3 py-1 rounded-full bg-black text-xs border-2 border-gray-500 text-gray-400">
                        Draft
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      Deadline:{" "}
                      <span className="text-white">{draft.deadline}</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <a
                        href="/task-view-admin"
                        className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          ) : (
            /* ================= CREATE TASK FORM ================= */
            <div className="max-w-5xl mx-auto">
              {/* BACK BUTTON */}
              <div className="flex justify-end mb-6">
                <button
                  className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
                  onClick={() => setIsCreatingTask(false)}
                >
                  <FiArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Tasks</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>

              {/* FORM CARD */}
              <div className="bg-black rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-white">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* LEFT SECTION */}
                  <div className="flex-1 flex flex-col gap-4">
                    <label className="font-semibold text-lg">
                      Title: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      placeholder="Enter activity title"
                    />

                    {/* INSTRUCTION */}
                    <label className="font-semibold">Instruction (optional)</label>

                    <div className="bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
                      {/* Editable Instruction Area */}
                      <div
                        ref={instructionRef}
                        contentEditable
                        className="min-h-[140px] px-4 py-3 outline-none"
                        suppressContentEditableWarning
                      />

                      {/* Divider */}
                      <div className="border-t border-[#2F3440]" />

                      {/* Formatting Toolbar (BOTTOM) */}
                      <div className="flex gap-4 px-4 py-2 text-gray-300">
                        <button
                          type="button"
                          onClick={() => applyFormat("bold")}
                          className="hover:text-white"
                        >
                          <FiBold />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("italic")}
                          className="hover:text-white"
                        >
                          <FiItalic />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("underline")}
                          className="hover:text-white"
                        >
                          <FiUnderline />
                        </button>
                      </div>
                    </div>

                    {/* FILE UPLOAD */}
                    <div className="mt-6">
                      <label className="block font-semibold mb-2">
                        Choose a file or drag & drop it here.
                      </label>

                      <div
                        onClick={handleFileClick}
                        className="border border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-[#0F1115] hover:border-blue-500 transition"
                      >
                        <FiUploadCloud
                          size={36}
                          className="mb-3 text-gray-300"
                        />

                        <p className="text-sm text-gray-300 mb-2">
                          Choose a file or drag & drop it here.
                        </p>

                        <p className="text-xs text-gray-500 mb-4">
                          DOCS, PDF, PPT AND EXCEL, UP TO 10 MB
                        </p>

                        <button
                          type="button"
                          className="px-4 py-1.5 border border-gray-400 rounded-md text-sm hover:bg-gray-800"
                        >
                          Browse Files
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
                    <label className="font-semibold">Score:</label>
                    <input
                      type="text"
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      placeholder="20/20"
                    />

                    
                    <label className="font-semibold">Due Date:</label>
                    <input
                      type="date"
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                    />

                    {groupsConfigured ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <label className="font-semibold">View Groups:</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                              onClick={() => setShowResetConfirmation(true)}
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                              onClick={handleManualGroups}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#23272F] rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groups.filter(group => group.leader.trim() || group.members.filter(m => m.trim()).length > 0).map((group) => (
                              <div key={group.id} className="bg-[#161A20] rounded-lg p-3">
                                <div className="font-semibold text-blue-400 mb-2">Group {group.id}</div>
                                <div className="space-y-1">
                                  <div>
                                    <span className="text-xs font-medium text-yellow-400">Leader:</span>
                                    <div className="text-white text-sm mt-1">
                                      {group.leader.trim() ? group.leader : 'No leader'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-green-400">Members:</span>
                                    <div className="text-white text-sm mt-1">
                                      {group.members.filter(m => m.trim()).length > 0 ? (
                                        group.members.filter(m => m.trim()).map((member, index) => (
                                          <div key={index}>{member}</div>
                                        ))
                                      ) : (
                                        'No members'
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <label className="font-semibold">Assign Groups:</label>
                          <div className="flex items-center bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                              onClick={() => {
                                const input = document.getElementById('groups-input');
                                if (input.value > 1) input.value = parseInt(input.value) - 1;
                              }}
                            >
                              -
                            </button>
                            <input
                              id="groups-input"
                              type="number"
                              className="bg-transparent w-12 text-center outline-none text-white text-sm [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                              defaultValue={1}
                              min="1"
                            />
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                              onClick={() => {
                                const input = document.getElementById('groups-input');
                                input.value = parseInt(input.value) + 1;
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
                            onClick={handleManualGroups}
                          >
                            Manual
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            onClick={handleGenerateGroups}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => {
                      // Handle publish logic here
                      setIsCreatingTask(false);
                    }}
                  >
                    Publish Activity
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => {
                      // Handle save as draft logic here
                      setIsCreatingTask(false);
                    }}
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* MANUAL GROUPS MODAL */}
      {showManualGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Manual Groups ({numberOfGroups} {numberOfGroups === 1 ? 'Group' : 'Groups'})
              </h2>
              <button
                onClick={() => setShowManualGroups(false)}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col md:flex-row lg:flex-row gap-6">
              <div className="flex-1 md:order-1 lg:order-1 order-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div 
                      key={group.id} 
                      className={`bg-[#23272F] rounded-lg p-4 cursor-pointer transition-all ${
                        activeGroup === group.id ? 'ring-2 ring-blue-500' : 'hover:bg-[#2a2f38]'
                      }`}
                      onClick={() => {
                        if (activeGroup && activeGroup !== group.id) {
                          const prevGroup = groups.find(g => g.id === activeGroup);
                          if (prevGroup && prevGroup.showInputs && !prevGroup.isSaved) {
                            const updatedGroups = [...groups];
                            
                            if (prevGroup.wasPreviouslySaved && prevGroup.originalData) {
                              updatedGroups[activeGroup - 1].leader = prevGroup.originalData.leader;
                              updatedGroups[activeGroup - 1].members = [...prevGroup.originalData.members];
                              updatedGroups[activeGroup - 1].showInputs = false;
                              updatedGroups[activeGroup - 1].isSaved = true;
                              delete updatedGroups[activeGroup - 1].originalData;
                            } else {
                              updatedGroups[activeGroup - 1].leader = '';
                              updatedGroups[activeGroup - 1].members = [''];
                              updatedGroups[activeGroup - 1].showInputs = false;
                              updatedGroups[activeGroup - 1].isSaved = false;
                            }
                            
                            setGroups(updatedGroups);
                          }
                        }
                        
                        setActiveGroup(group.id);
                      }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white">
                          Group {group.id}
                        </h3>
                        {group.showInputs && group.wasPreviouslySaved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedGroups = [...groups];
                              
                              if (updatedGroups[group.id - 1].originalData) {
                                updatedGroups[group.id - 1].leader = updatedGroups[group.id - 1].originalData.leader;
                                updatedGroups[group.id - 1].members = [...updatedGroups[group.id - 1].originalData.members];
                                delete updatedGroups[group.id - 1].originalData;
                              }
                              
                              updatedGroups[group.id - 1].showInputs = false;
                              updatedGroups[group.id - 1].isSaved = true;
                              setGroups(updatedGroups);
                            }}
                            className="text-gray-400 text-xl bg-transparent border-none outline-none hover:bg-transparent hover:text-red-400 focus:outline-none focus:ring-0"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      {group.isSaved ? (
                        <div className="space-y-2">
                          {group.leader && group.leader.trim() && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-yellow-400">Leader:</span>
                              <span className="text-sm text-white">{group.leader}</span>
                            </div>
                          )}
                          {group.members.filter(m => m.trim()).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-green-400">Members:</span>
                              <div className="mt-1 space-y-1">
                                {group.members.filter(m => m.trim()).map((member, index) => (
                                  <div key={index} className="text-sm text-white pl-2">
                                    • {member}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editGroup(group.id);
                            }}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm mt-3"
                          >
                            Edit Group
                          </button>
                        </div>
                      ) : (
                        <>
                          {!group.showInputs ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupInputs(group.id);
                              }}
                              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Add People
                            </button>
                          ) : (
                            <>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Leader:
                                </label>
                                <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={group.leader}
                                    onChange={(e) => handleGroupLeaderChange(group.id, e.target.value)}
                                    placeholder="Enter leader name"
                                    className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                  />
                                  {group.leader.trim() && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedGroups = [...groups];
                                        updatedGroups[group.id - 1].leader = '';
                                        setGroups(updatedGroups);
                                      }}
                                      disabled={group.members.filter(member => member.trim()).length > 0}
                                      className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                                        group.members.filter(member => member.trim()).length > 0
                                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                          : 'bg-red-600 text-white hover:bg-red-700'
                                      }`}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Members:
                                </label>
                                <div className="space-y-2 mb-3">
                                  {group.members.map((member, memberIndex) => (
                                    <div key={memberIndex} className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        value={member}
                                        onChange={(e) => handleGroupMemberChange(group.id, memberIndex, e.target.value)}
                                        placeholder="Enter member name"
                                        className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                      />
                                      {member.trim() && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeMemberFromGroup(group.id, memberIndex);
                                          }}
                                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex-shrink-0"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {!group.wasPreviouslySaved && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetGroupInputs(group.id);
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveGroup(group.id);
                                  }}
                                  disabled={!group.leader.trim() && group.members.filter(member => member.trim()).length === 0}
                                  className={`${group.wasPreviouslySaved ? 'w-full' : 'flex-1'} px-3 py-2 text-sm rounded ${
                                    !group.leader.trim() && group.members.filter(member => member.trim()).length === 0
                                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  Save Group
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      
                      {activeGroup !== group.id && !group.isSaved && group.members.filter(m => m.trim()).length > 0 && (
                        <div className="text-gray-400 text-sm">
                          {group.members.filter(m => m.trim()).length} members
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-80 md:w-72 sm:w-64 bg-[#23272F] rounded-lg p-4 h-fit max-h-[300px] md:max-h-[280px] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:order-2 lg:order-2 order-1">
                <h3 className="font-semibold text-white mb-4">
                  Available Members ({availableMembers.length - getAssignedMembers().size})
                </h3>
                <div className="space-y-2">
                  {availableMembers.slice(0, isTablet ? 5 : availableMembers.length).map((member, index) => {
                    const isAssigned = isMemberAssigned(member);
                    const role = getMemberRole(member);
                    return (
                      <div 
                        key={index} 
                        className={`rounded p-3 text-white text-sm transition cursor-pointer ${
                          isAssigned 
                            ? 'bg-[#1a1f29] opacity-50 cursor-not-allowed' 
                            : 'bg-[#161A20] hover:bg-[#1a1f29]'
                        }`}
                        onClick={() => !isAssigned && addMemberFromAvailable(member)}
                      >
                        <div className="flex items-center justify-between">
                          <span className={isAssigned ? 'line-through' : ''}>{member}</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              role === 'leader' ? 'bg-yellow-500' : 
                              role === 'member' ? 'bg-green-500' : 
                              'bg-green-500'
                            }`}></div>
                            <span className="text-xs text-gray-400">
                              {role === 'leader' ? 'Leader' : 
                               role === 'member' ? 'Member' : 
                               'Click to add'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  const groupsData = groups.map(group => ({
                    groupId: group.id,
                    leader: group.leader.trim(),
                    members: group.members.filter(member => member.trim())
                  }));
                  console.log('All groups saved:', groupsData);
                  setGroupsConfigured(true);
                  setGroupCreationMethod('manual');
                  setShowManualGroups(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Groups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE GROUPS MODAL */}
      {showGenerateGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#1E222A] rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Generate Groups ({numberOfGroups} {numberOfGroups === 1 ? 'Group' : 'Groups'})
              </h2>
              <button
                onClick={() => setShowGenerateGroups(false)}
                className="text-gray-400 text-xl sm:text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0 p-1"
              >
                ×
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
                The system will automatically generate {numberOfGroups} groups and randomly assign students to them.
              </p>
              
              <div className="bg-[#23272F] rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h3 className="font-semibold text-white text-sm sm:text-base">Generated Groups Preview:</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (numberOfGroups > 1) {
                          const newNumGroups = numberOfGroups - 1;
                          setNumberOfGroups(newNumGroups);
                          shuffleGroups(newNumGroups);
                        }
                      }}
                      disabled={numberOfGroups <= 1}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups <= 1 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      -
                    </button>
                    <span className="text-white font-medium min-w-[2rem] text-center">{numberOfGroups}</span>
                    <button
                      onClick={() => {
                        const newNumGroups = numberOfGroups + 1;
                        setNumberOfGroups(newNumGroups);
                        shuffleGroups(newNumGroups);
                      }}
                      disabled={numberOfGroups >= availableMembers.length}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups >= availableMembers.length
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {generatedGroupsPreview.map((group, index) => (
                    <div key={index} className="bg-[#161A20] rounded p-2 sm:p-3">
                      <div className="text-blue-400 font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Group {group.id}</div>
                      <div className="text-xs space-y-0.5 sm:space-y-1">
                        <div className="text-yellow-400">
                          <span className="font-medium">Leader:</span>
                          <span className="block xs:inline xs:ml-1">{group.leader}</span>
                        </div>
                        <div className="text-green-400">
                          <span className="font-medium">Members:</span>
                          <span className="block xs:inline xs:ml-1">{group.members.join(", ")}</span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs mt-1 sm:mt-2">Auto-assigned</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => shuffleGroups(numberOfGroups)}
                className="mr-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm sm:text-base font-medium"
              >
                Shuffle
              </button>
              <button
                onClick={() => {
                  setGroups(generatedGroupsPreview);
                  setGroupsConfigured(true);
                  setGroupCreationMethod('generate');
                  console.log(`Generated ${numberOfGroups} groups:`, generatedGroupsPreview);
                  setShowGenerateGroups(false);
                }}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base font-medium"
              >
                Confirm Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Reset Groups</h2>
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 text-sm">
                Are you sure you want to reset all groups? This will remove all group assignments and you'll need to configure them again.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setGroups([{ id: 1, members: [], leader: '', showInputs: false, isSaved: false, wasPreviouslySaved: false }]);
                  setNumberOfGroups(1);
                  setGroupsConfigured(false);
                  setGroupCreationMethod(null);
                  setShowResetConfirmation(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskPage;
