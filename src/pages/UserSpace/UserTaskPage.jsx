import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTasks } from "../../hooks/useTasks";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import {
  FiMenu,
  FiX,
  FiBold,
  FiCopy,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
  FiFileText,
  FiBook,
  FiCode,
  FiMusic,
  FiVideo,
  FiImage,
} from "react-icons/fi";
import Logout from "../component/logout";
import Sidebar from "../component/sidebar";
import Button from "../component/button_2";
import MainButton from "../component/Button.jsx";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";

const UserTaskPage = () => {
  // ================= STATE MANAGEMENT =================
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [joinRequestsData, setJoinRequestsData] = useState([]);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { user, isLoading } = useUser();
  const {
    userSpaces,
    friendSpaces,
    deleteSpace,
    acceptJoinRequest,
    declineJoinRequest,
  } = useSpace();
  // ================= SPACE & OWNER LOGIC =================
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;
  // ================= TASK FORM STATE =================
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskCategory, setTaskCategory] = useState("individual-act");
  
  // ================= CRITERIA/RUBRICS STATE =================
  const [criteria, setCriteria] = useState([
    { id: 1, name: "", description: "", points: "" }
  ]);
  const [showCriteriaSection, setShowCriteriaSection] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Ready-made criteria templates
  const criteriaTemplates = {
    essay: [
      { name: "Content & Ideas", description: "Quality of arguments, originality, and depth of analysis", points: "30" },
      { name: "Organization & Structure", description: "Logical flow, paragraph structure, and coherence", points: "25" },
      { name: "Language & Grammar", description: "Grammar, spelling, vocabulary, and sentence structure", points: "20" },
      { name: "Research & Evidence", description: "Use of sources, citations, and supporting evidence", points: "15" },
      { name: "Critical Thinking", description: "Analysis, synthesis, and evaluation of ideas", points: "10" }
    ],
    research: [
      { name: "Research Question", description: "Clarity and significance of the research question", points: "15" },
      { name: "Literature Review", description: "Comprehensive review of existing research", points: "20" },
      { name: "Methodology", description: "Appropriateness and rigor of research methods", points: "25" },
      { name: "Data Analysis", description: "Accuracy and depth of data interpretation", points: "20" },
      { name: "Conclusions", description: "Quality of findings and implications", points: "20" }
    ],
    presentation: [
      { name: "Content Quality", description: "Accuracy, relevance, and depth of content", points: "30" },
      { name: "Delivery Skills", description: "Clarity, confidence, and engagement", points: "25" },
      { name: "Visual Aids", description: "Quality and effectiveness of slides/materials", points: "20" },
      { name: "Organization", description: "Structure, timing, and flow", points: "15" },
      { name: "Q&A Handling", description: "Ability to answer questions effectively", points: "10" }
    ],
    project: [
      { name: "Technical Implementation", description: "Functionality, code quality, and technical skills", points: "35" },
      { name: "Design & UX", description: "User interface, user experience, and aesthetics", points: "25" },
      { name: "Innovation", description: "Creativity, originality, and unique features", points: "20" },
      { name: "Documentation", description: "Code documentation, readme, and instructions", points: "10" },
      { name: "Presentation", description: "Project demonstration and explanation", points: "10" }
    ],
    creative: [
      { name: "Originality", description: "Creativity and uniqueness of the work", points: "30" },
      { name: "Technical Skill", description: "Execution and mastery of techniques", points: "25" },
      { name: "Concept Development", description: "Clarity and depth of the concept", points: "20" },
      { name: "Aesthetic Quality", description: "Visual appeal and artistic merit", points: "15" },
      { name: "Presentation", description: "Overall presentation and impact", points: "10" }
    ]
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

  const getCategoryEmoji = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? category.emoji : "📝";
  };
  // ================= TASKS HOOK =================
  const {
    uploadedTasksQuery,
    draftedTasksQuery,
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  } = useTasks(currentSpace?.space_id);

  const taskData = uploadedTasksQuery?.data || [];
  const draftActivities = draftedTasksQuery?.data || [];
  // const isLoadingTasks = uploadedTasksQuery?.isLoading;
  // const isLoadingDrafts = draftedTasksQuery?.isLoading;
  // const tasksError = uploadedTasksQuery?.error;
  // const draftsError = draftedTasksQuery?.error;
  const uploadedTask = Array.isArray(taskData)
    ? taskData
    : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities)
    ? draftActivities
    : draftActivities?.data || [];

  const handleUpload = async (status_type) => {
    if (!taskTitle.trim()) {
      alert("Task title is required");
      return;
    }
    if (!dueDate) {
      alert("Due date is required");
      return;
    }
    if (!score) {
      alert("Score is required");
      return;
    }

    if (!groups) {
      alert("Due date is required");
      return;
    }

    const payload = {
      title: taskTitle,
      instruction: instruction || "No instruction provided",
      scoring: Number(score),
      status: status_type,
      due_date: dueDate,
      category: taskCategory,
      criteria: criteria.filter(c => c.name.trim() && c.points.trim()),
    };

    if (groupsConfigured && groups.length > 0) {
      const validGroups = groups.filter(
        (group) =>
          group.leader?.account_id || group.members?.some((m) => m?.trim()),
      );
      if (validGroups.length > 0) {
        payload.groupsData = validGroups.map((group, index) => ({
          group_name: `Group_${index + 1}`,
          leader_id: group.leader?.account_id,
          members: group.members
            .filter((member) => member?.trim())
            .map((member) => member.trim()),
        }));
      }
    }

    console.log("Uploading task with payload:", payload);

    try {
      if (status_type === "uploaded") {
        await uploadTaskMutation.mutateAsync({
          spaceId: Number(currentSpace?.space_id),
          taskData: payload,
        });
        alert("Task published successfully!");
      } else {
        await draftTaskMutation.mutateAsync({
          spaceId: Number(currentSpace?.space_id),
          taskData: payload,
        });
        alert("Task saved as draft!");
      }

      resetTaskForm();
      setIsCreatingTask(false);
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setInstruction("");
    setScore("");
    setDueDate("");
    setSelectedFile(null);
    setTaskCategory("individual-act");
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
    setShowCriteriaSection(false);
    setLastGroupSaved([]);
    setGroups([
      {
        id: 1,
        members: [],
        leader: { account_id: null, full_name: "" },
        showInputs: false,
        isSaved: false,
        wasPreviouslySaved: false,
      },
    ]);
    setNumberOfGroups(1);
    setGroupsConfigured(false);
    setGroupCreationMethod(null);
    if (instructionRef.current) {
      instructionRef.current.innerHTML = "";
    }
  };

  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // ================= CREATE TASK MODE =================
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showManualGroups, setShowManualGroups] = useState(false);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(0);
  const [lastGroupSaved, setLastGroupSaved] = useState([]);
  const [groups, setGroups] = useState([
    {
      id: 1,
      members: [],
      leader: { account_id: null, full_name: "" },
      showInputs: false,
      isSaved: false,
      wasPreviouslySaved: false,
    },
  ]);

  const ispublisheable =
    numberOfGroups > 0 &&
    taskTitle &&
    instruction &&
    score &&
    dueDate &&
    taskCategory;
  const isNotPublishable = !ispublisheable;
  const [activeGroup, setActiveGroup] = useState(1);
  const [lastActiveGroup, setLastActiveGroup] = useState(1);
  const [isTablet, setIsTablet] = useState(false);
  const [groupsConfigured, setGroupsConfigured] = useState(false);
  const [groupCreationMethod, setGroupCreationMethod] = useState(null);
  const [generatedGroupsPreview, setGeneratedGroupsPreview] = useState([]);

  // ================= EFFECTS =================

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
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  useEffect(() => {
    if (instructionRef.current) {
      const handleInput = () => {
        setInstruction(instructionRef.current.innerHTML);
      };
      instructionRef.current.addEventListener("input", handleInput);
      return () => {
        instructionRef.current?.removeEventListener("input", handleInput);
      };
    }
  }, [isCreatingTask]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("File selected:", file);
    if (file) {
      try {
        const extractedText = await extractTextFromFile(file);
        if (extractedText) {
          setInstruction(extractedText);
          if (instructionRef.current) {
            instructionRef.current.innerHTML = extractedText;
          }
          console.log("Text extracted from document:", extractedText);
        }
      } catch (error) {
        console.error("Error extracting text from file:", error);
      }
    }
  };

  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      // PDF file extraction
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        extractTextFromPDF(file).then(resolve).catch(reject);
      }
      // Word document extraction
      else if (
        fileType.includes("word") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        extractTextFromDocx(file).then(resolve).catch(reject);
      }
      // PowerPoint extraction
      else if (
        fileType.includes("presentation") ||
        fileName.endsWith(".pptx") ||
        fileName.endsWith(".ppt")
      ) {
        extractTextFromPptx(file).then(resolve).catch(reject);
      }
      // Excel extraction
      else if (
        fileType.includes("sheet") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        extractTextFromExcel(file).then(resolve).catch(reject);
      }
      // Plain text file
      else if (fileType.startsWith("text/") || fileName.endsWith(".txt")) {
        extractTextFromText(file).then(resolve).catch(reject);
      } else {
        reject(new Error("Unsupported file type for text extraction"));
      }
    });
  };

  // PDF text extraction

  const extractTextFromPDF = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        // For PDF extraction, we'll use a simple approach

        // In a real implementation, you'd use a library like pdf.js

        // For now, we'll return a placeholder indicating PDF content

        resolve(
          `[PDF Document: ${file.name}]\n\nContent extraction from PDF requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  // DOCX text extraction

  const extractTextFromDocx = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        // For DOCX extraction, you'd typically use mammoth.js

        // For now, we'll return a placeholder indicating DOCX content

        resolve(
          `[Word Document: ${file.name}]\n\nContent extraction from DOCX requires mammoth.js library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  // PPTX text extraction

  const extractTextFromPptx = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        // For PPTX extraction, you'd use a specialized library

        // For now, we'll return a placeholder indicating PPTX content

        resolve(
          `[PowerPoint Presentation: ${file.name}]\n\nContent extraction from PPTX requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  // Excel text extraction

  const extractTextFromExcel = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        // For Excel extraction, you'd use libraries like xlsx or sheetjs

        // For now, we'll return a placeholder indicating Excel content

        resolve(
          `[Excel Spreadsheet: ${file.name}]\n\nContent extraction from Excel requires xlsx library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  // Plain text extraction

  const extractTextFromText = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        resolve(this.result);
      };

      fileReader.onerror = reject;

      fileReader.readAsText(file);
    });
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();

    document.execCommand(command, false, null);
  };

  const handleManualGroups = () => {
    if (groupsConfigured) {
      if (groupCreationMethod === "generate") {
        setShowGenerateGroups(true);
      } else {
        // Restore saved groups from lastGroupSaved

        if (lastGroupSaved && lastGroupSaved.length > 0) {
          const restoredGroups = lastGroupSaved.map((savedGroup) => ({
            id: savedGroup.groupId,

            members: [...savedGroup.members, ""], // Add empty slot for new members

            leader: {
              account_id: savedGroup.leader_id,

              full_name:
                currentSpace?.members?.find(
                  (m) => m.account_id === savedGroup.leader_id,
                )?.full_name || "",
            },

            showInputs: false,

            isSaved: true,

            wasPreviouslySaved: true,
          }));

          setGroups(restoredGroups);

          setNumberOfGroups(restoredGroups.length);
        }

        setActiveGroup(lastActiveGroup);

        setShowManualGroups(true);
      }
    } else {
      const input = document.getElementById("groups-input");

      const numGroups = parseInt(input?.value) || 1;

      setNumberOfGroups(numGroups);

      setGroupCreationMethod("manual");

      const newGroups = Array.from({ length: numGroups }, (_, index) => ({
        id: index + 1,

        members: [""],

        leader: { account_id: null, full_name: "" },

        showInputs: false,

        isSaved: false,

        wasPreviouslySaved: false,
      }));

      setGroups(newGroups);

      setActiveGroup(1);

      setShowManualGroups(true);
    }
  };

  const handleGenerateGroups = () => {
    const input = document.getElementById("groups-input");

    const numGroups = parseInt(input?.value) || 1;

    setNumberOfGroups(numGroups);

    shuffleGroups(numGroups);

    setShowGenerateGroups(true);
  };

  const shuffleGroups = (numGroups) => {
    if (!currentSpace?.members || currentSpace.members.length === 0) return;

    // Shuffle members randomly

    const shuffledMembers = [...currentSpace.members].sort(
      () => Math.random() - 0.5,
    );

    const totalMembers = shuffledMembers.length;

    const baseMembersPerGroup = Math.floor(totalMembers / numGroups);

    const remainder = totalMembers % numGroups;

    const newGroups = Array.from({ length: numGroups }, (_, index) => {
      const membersCount = baseMembersPerGroup + (index < remainder ? 1 : 0);

      // Calculate startIndex dynamically

      let startIndex = 0;

      for (let i = 0; i < index; i++) {
        startIndex += baseMembersPerGroup + (i < remainder ? 1 : 0);
      }

      const endIndex = startIndex + membersCount;

      const groupMembers = shuffledMembers.slice(startIndex, endIndex);

      // Extract only account IDs

      const leader = groupMembers[0]?.account_id || null;

      const members = groupMembers.slice(1).map((member) => member.account_id);

      return {
        id: index + 1,

        leader: groupMembers?.[0],

        members: members,

        showInputs: false,

        isSaved: true,

        wasPreviouslySaved: true,
      };
    });

    setGeneratedGroupsPreview(newGroups);
  };

  // Group management functions (unchanged from your code)

  const handleGroupMemberChange = (groupId, memberIndex, value) => {
    const updatedGroups = [...groups];

    updatedGroups[groupId - 1].members[memberIndex] = value;

    setGroups(updatedGroups);
  };

  const handleGroupLeaderChange = (groupId, value) => {
    const updatedGroups = [...groups];

    // Find the member object from currentSpace.members that matches the name

    const memberObj = currentSpace?.members?.find((m) => m.full_name === value);

    updatedGroups[groupId - 1].leader = memberObj || {
      account_id: null,
      full_name: value,
    };

    setGroups(updatedGroups);
  };

  const toggleGroupInputs = (groupId) => {
    const updatedGroups = [...groups];

    updatedGroups[groupId - 1].showInputs =
      !updatedGroups[groupId - 1].showInputs;

    setGroups(updatedGroups);
  };

  const editGroup = (groupId) => {
    const updatedGroups = [...groups];

    const group = updatedGroups[groupId - 1];

    updatedGroups[groupId - 1].originalData = {
      leader: group.leader?.account_id,

      members: [...group.members],
    };

    updatedGroups[groupId - 1].showInputs = true;

    updatedGroups[groupId - 1].isSaved = false;

    setGroups(updatedGroups);
  };

  const resetGroupInputs = (groupId) => {
    const updatedGroups = [...groups];

    updatedGroups[groupId - 1] = {
      ...updatedGroups[groupId - 1],

      leader: { account_id: null, full_name: "" },

      members: [""],

      showInputs: false,

      isSaved: false,
    };

    setGroups(updatedGroups);
    setLastGroupSaved([]);
    setNumberOfGroups(0);
  };

  const addMemberFromAvailable = (memberName) => {
    const activeGroupData = groups[activeGroup - 1];

    if (!activeGroupData.showInputs) {
      alert('Please click "Add People" first to edit this group.');

      return;
    }

    const updatedGroups = [...groups];

    const activeGroupDataUpdated = updatedGroups[activeGroup - 1];

    // Find the member object from currentSpace.members

    const memberObj = currentSpace?.members?.find(
      (m) => m.full_name === memberName,
    );

    if (
      !activeGroupDataUpdated.leader?.account_id &&
      !activeGroupDataUpdated.leader?.full_name
    ) {
      activeGroupDataUpdated.leader = memberObj || {
        account_id: null,
        full_name: memberName,
      };
    } else {
      const activeGroupMembers = activeGroupDataUpdated.members;
      const firstEmptyIndex = activeGroupMembers.findIndex(
        (member) => !member || member.trim() === "",
      );
      if (firstEmptyIndex !== -1) {
        activeGroupMembers[firstEmptyIndex] = memberName;
      } else {
        activeGroupMembers.push(memberName);
        activeGroupMembers.push("");
      }
    }
    setGroups(updatedGroups);
  };
  const getAssignedMembers = () => {
    const allAssignedMembers = new Set();
    groups.forEach((group) => {
      if (group.leader?.full_name) {
        allAssignedMembers.add(group.leader.full_name);
      }
      group.members.forEach((member) => {
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
      if (group.leader?.full_name === memberName) {
        return "leader";
      }
      if (
        group.members.some((member) => member && member.trim() === memberName)
      ) {
        return "member";
      }
    }
    return null;
  };
  const saveGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    const validMembers = group.members.filter((member) => member.trim());
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
    const hasEmptyField = groupMembers.some(
      (member) => !member || member.trim() === "",
    );
    if (!hasEmptyField) {
      groupMembers.push("");
    }
    setGroups(updatedGroups);
  };
  // Task status styles
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };
  const [openIndex, setOpenIndex] = useState(null);
  const [openDraftIndex, setOpenDraftIndex] = useState(null);
  const handleStatusChange = (index, newStatus) => {
    const task = uploadedTask[index];
    if (task && task.id) {
      updateTaskStatusMutation.mutate(
        { taskId: task.id, newStatus },
        {
          onSuccess: () => {
            console.log(`Task ${task.id} status updated to ${newStatus}`);
          },
          onError: (error) => {
            console.error("Failed to update task status:", error);
          },
        },
      );
    }
    setOpenIndex(null);
  };
  const handleDraftStatusChange = (index, newStatus) => {
    const draft = draftedTask[index];
    if (draft && draft.id) {
      updateTaskStatusMutation.mutate(
        { taskId: draft.id, newStatus },
        {
          onSuccess: () => {
            console.log(`Draft ${draft.id} status updated to ${newStatus}`);
          },
          onError: (error) => {
            console.error("Failed to update draft status:", error);
          },
        },
      );
    }
    setOpenDraftIndex(null);
  };
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };
  const handleDeleteRoom = async () => {
    if (!currentSpace) return;
    setDialogMessage(currentSpace.space_name);
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (!currentSpace || !showDeleteDialog) return;
    setShowDeleteDialog(false);
    try {
      await deleteSpace(currentSpace.space_uuid, user.id);
      navigate("/space");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };
  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
      setJoinRequestsData((prev) =>
        prev.filter((req) => req.account_id !== userId),
      );
    } catch (error) {
      console.error("Failed to accept join request:", error);
    }
  };
  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
      setJoinRequestsData((prev) =>
        prev.filter((req) => req.account_id !== userId),
      );
    } catch (error) {
      console.error("Failed to decline join request:", error);
    }
  };
  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };
  const handleCopyLink = (space_link) => {
    navigator.clipboard
      .writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  // ================= CRITERIA MANAGEMENT FUNCTIONS =================
  const addCriteria = () => {
    const newCriteria = {
      id: Date.now(),
      name: "",
      description: "",
      points: ""
    };
    setCriteria([...criteria, newCriteria]);
  };

  const removeCriteria = (id) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter(c => c.id !== id));
    }
  };

  const updateCriteria = (id, field, value) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const getTotalCriteriaPoints = () => {
    return criteria.reduce((total, c) => {
      const points = parseFloat(c.points) || 0;
      return total + points;
    }, 0);
  };

  // ================= TEMPLATE MANAGEMENT FUNCTIONS =================
  const applyTemplate = (templateType) => {
    const template = criteriaTemplates[templateType];
    if (template) {
      const newCriteria = template.map((criterion, index) => ({
        id: Date.now() + index,
        name: criterion.name,
        description: criterion.description,
        points: criterion.points
      }));
      setCriteria(newCriteria);
      setShowTemplates(false);
      setShowCriteriaSection(true);
    }
  };

  const clearCriteria = () => {
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
  };
  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-sans">
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      <div className="flex-1 flex flex-col w-full">
        {/* MOBILE HEADER */}
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
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>
        <div className="lg:hidden h-16" />
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
            alt="cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="p-4 sm:p-6">
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                ({currentSpace?.members?.length || 0} member(s))
              </span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div
                    onClick={() => setShowPendingInvitations(true)}
                    className="relative"
                  >
                    <Button text="Pending Invites" />
                    {joinRequestsData.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {joinRequestsData.length}
                      </span>
                    )}
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
              )}
              {isFriendSpace && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-[#2A2F3A] p-2 rounded-md">
                    <span className="text-xs text-blue-400 break-all">
                      {currentSpace?.space_link || "Loading..."}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentSpace?.space_link)}
                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}
                >
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
          </div>

          {/* Mobile Add Member Button */}

          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <div onClick={handleInviteMember}>
                <Button text="Add Member" />
              </div>

              <div
                onClick={() => setShowPendingInvitations(true)}
                className="relative"
              >
                <Button text="Pending Invites" />

                {joinRequestsData.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {joinRequestsData.length}
                  </span>
                )}
              </div>

              <div onClick={handleDeleteRoom}>
                <Button text="Delete Room" />
              </div>
            </div>
          )}

          {!isCreatingTask ? (
            /* TASKS LIST VIEW */

            <div className="max-w-5xl mx-auto">
              {isOwnerSpace && (
                <button
                  className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium block mb-6 flex items-center gap-2"
                  onClick={() => setIsCreatingTask(true)}
                >
                  <FiFileText size={16} />
                  Create Task
                </button>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold">Assigned Tasks</h2>
              </div>

              {/* Desktop Table */}

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
                              className={`px-4 py-1 rounded-full bg-black text-sm ${statusStyles[task.task_status]}`}
                            >
                              {task.task_status} ▼
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
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCategoryDisplay(task.task_category)}
                            </span>

                            <span className="text-sm font-semibold">
                              {task.task_title}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {new Date(task.task_due).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <MainButton
                            className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                            onClick={() =>
                              navigate(
                                `/task/${currentSpace?.space_uuid}/${currentSpace?.space_name}/${task.task_title}`,
                              )
                            }
                          >
                            View Button
                          </MainButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}

              <div className="md:hidden space-y-4">
                {uploadedTask?.map((task, index) => (
                  <div
                    key={index}
                    className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryDisplay(task.task_category)}
                        </span>

                        <span className="text-sm font-semibold">
                          {task.task_title}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className={`px-3 py-1 rounded-full bg-black text-xs ${statusStyles[task.task_status]}`}
                      >
                        {task.task_status}
                      </button>
                    </div>

                    <p className="text-sm text-gray-400">
                      Deadline:{" "}
                      <span className="text-white">
                        {new Date(task.task_due).toLocaleDateString("en-US")}
                      </span>
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
                        href="/prof-task-view"
                        className="block w-full text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Draft Activities */}

              <div className="max-w-5xl mx-auto w-full mt-12">
                <h2 className="text-xl font-semibold mb-6">
                  Draft Activities 📝
                </h2>

                {/* Desktop Table */}

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
                        <tr
                          key={index}
                          className="border-b border-gray-700 hover:bg-[#1E222A]"
                        >
                          <td className="py-3 px-4">
                            <span className="px-6 py-1 rounded-full bg-black text-sm font-bold border-2 border-gray-500 text-gray-400 inline-block min-w-[120px] text-center">
                              Draft
                            </span>
                          </td>

                          <td className="py-3 px-4">{draft.task_title}</td>

                          <td className="py-3 px-4">
                            {new Date(draft.task_due).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              },
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href="/prof-task-view"
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

                <div className="md:hidden space-y-4">
                  {draftedTask?.map((draft, index) => (
                    <div
                      key={index}
                      className="bg-[#1B1F26] border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-semibold">
                          {draft.task_title}
                        </p>

                        <span className="px-3 py-1 rounded-full bg-black text-xs border-2 border-gray-500 text-gray-400 font-bold">
                          Draft
                        </span>
                      </div>

                      <p className="text-xs text-gray-400">
                        Deadline:{" "}
                        <span className="text-white">
                          {new Date(draft.task_due).toLocaleDateString("en-US")}
                        </span>
                      </p>

                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <a
                          href="/prof-task-view"
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
            /* CREATE TASK FORM */

            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-6">
                <button
                  className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
                  onClick={() => {
                    resetTaskForm();
                    setIsCreatingTask(false);
                  }}
                >
                  <FiArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Tasks</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
              <div className="bg-black rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-white">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-4">
                    <label className="font-semibold text-lg">
                      Title: <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      placeholder="Enter task title"
                    />

                    {/* Task Category */}

                    <label className="font-semibold">
                      Category: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500 w-full"
                    >
                      {taskCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </option>
                      ))}
                    </select>

                    {/* Instruction */}
                    <label className="font-semibold">
                      Instruction (optional)
                    </label>
                    <div className="bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
                      <div
                        ref={instructionRef}
                        contentEditable
                        className="min-h-[140px] px-4 py-3 outline-none"
                        suppressContentEditableWarning
                      />
                      <div className="border-t border-[#2F3440]" />
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

                    {/* File Upload */}

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
                          {selectedFile
                            ? selectedFile.name
                            : "Choose a file or drag & drop it here."}
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
                          onChange={handleFileChange}
                          accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
                    <label className="font-semibold">
                      Score: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      placeholder="Enter score (e.g., 100)"
                      min="0"
                    />
                    <label className="font-semibold">
                      Due Date: <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
                      min={new Date().toISOString().split("T")[0]}
                    />

                    {/* Criteria/Rubrics Section */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold">Scoring Criteria:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                          >
                            Use Template
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCriteriaSection(!showCriteriaSection)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            {showCriteriaSection ? "Hide" : "Manual"} Criteria
                          </button>
                        </div>
                      </div>

                      {/* Template Selection */}
                      {showTemplates && (
                        <div className="bg-[#23272F] rounded-lg p-4 border border-purple-600">
                          <h4 className="text-sm font-semibold text-purple-400 mb-3">Choose a Template:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => applyTemplate('essay')}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">📝 Essay</div>
                              <div className="text-xs text-gray-400">For written essays and compositions</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate('research')}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">🔬 Research Paper</div>
                              <div className="text-xs text-gray-400">For academic research and analysis</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate('presentation')}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">🎤 Presentation</div>
                              <div className="text-xs text-gray-400">For oral presentations and demos</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate('project')}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">💻 Project</div>
                              <div className="text-xs text-gray-400">For coding and development projects</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate('creative')}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">🎨 Creative Work</div>
                              <div className="text-xs text-gray-400">For artistic and creative assignments</div>
                            </button>
                            <button
                              type="button"
                              onClick={clearCriteria}
                              className="p-3 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition text-left border border-red-600/50 hover:border-red-500"
                            >
                              <div className="font-medium text-red-400">🗑️ Clear All</div>
                              <div className="text-xs text-red-300">Remove all criteria</div>
                            </button>
                          </div>
                        </div>
                      )}

                      {showCriteriaSection && (
                        <div className="bg-[#23272F] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-blue-400">
                              {criteria.some(c => c.name.trim()) ? "Current Criteria:" : "Add Your Criteria:"}
                            </h4>
                            {criteria.some(c => c.name.trim()) && (
                              <button
                                type="button"
                                onClick={() => setShowTemplates(true)}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                Change Template
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {criteria.map((criterion, index) => (
                              <div key={criterion.id} className="bg-[#161A20] rounded-lg p-3 border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-blue-400">Criteria {index + 1}</span>
                                  {criteria.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeCriteria(criterion.id)}
                                      className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={criterion.name}
                                    onChange={(e) => updateCriteria(criterion.id, 'name', e.target.value)}
                                    placeholder="Criteria name (e.g., Content Quality)"
                                    className="w-full bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500"
                                  />
                                  
                                  <textarea
                                    value={criterion.description}
                                    onChange={(e) => updateCriteria(criterion.id, 'description', e.target.value)}
                                    placeholder="Description (optional)"
                                    rows={2}
                                    className="w-full bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 resize-none"
                                  />
                                  
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={criterion.points}
                                      onChange={(e) => updateCriteria(criterion.id, 'points', e.target.value)}
                                      placeholder="Points"
                                      min="0"
                                      step="0.5"
                                      className="w-24 bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500"
                                    />
                                    <span className="text-sm text-gray-400">points</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={addCriteria}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                            >
                              + Add Another Criteria
                            </button>
                            
                            {getTotalCriteriaPoints() > 0 && (
                              <div className="pt-2 border-t border-gray-600">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-300">Total Criteria Points:</span>
                                  <span className="font-semibold text-blue-400">{getTotalCriteriaPoints()}</span>
                                </div>
                                {parseFloat(score) > 0 && getTotalCriteriaPoints() !== parseFloat(score) && (
                                  <p className="text-xs text-yellow-400 mt-1">
                                    Note: Total criteria points ({getTotalCriteriaPoints()}) 
                                    {getTotalCriteriaPoints() > parseFloat(score) ? " exceed" : " don't match"} 
                                    total score ({score})
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

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

                        <div className="bg-[#23272F] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groups
                              .filter(
                                (group) =>
                                  group.leader?.account_id ||
                                  group.members.filter((m) => m.trim()).length >
                                    0,
                              )
                              .map((group) => (
                                <div
                                  key={group.id}
                                  className="bg-[#161A20] rounded-lg p-3"
                                >
                                  <div className="font-semibold text-blue-400 mb-2">
                                    Group {group.id}
                                  </div>

                                  <div className="space-y-1">
                                    <div>
                                      <span className="text-xs font-medium text-yellow-400">
                                        Leader:
                                      </span>

                                      <div className="text-white text-sm mt-1">
                                        {group.leader?.full_name || "No leader"}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-xs font-medium text-green-400">
                                        Members:
                                      </span>

                                      <div className="text-white text-sm mt-1">
                                        {group.members.filter((m) => m.trim())
                                          .length > 0
                                          ? group.members
                                              .filter((m) => m.trim())
                                              .map((member, idx) => (
                                                <div key={idx}>{member}</div>
                                              ))
                                          : "No members"}
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
                          <label className="font-semibold">
                            Assign Groups:
                          </label>

                          <div className="flex items-center bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
                            <button
                              type="button"
                              className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                              onClick={() => {
                                const input =
                                  document.getElementById("groups-input");

                                if (input && input.value > 1)
                                  input.value = parseInt(input.value) - 1;
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
                              max={10}
                            />

                            <button
                              type="button"
                              className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                              onClick={() => {
                                const input =
                                  document.getElementById("groups-input");

                                if (
                                  input &&
                                  parseInt(input.value) < currentSpace?.length
                                ) {
                                  input.value = parseInt(input.value) + 1;
                                }
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

                {/* Action Buttons */}

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleUpload("uploaded")}
                    disabled={uploadTaskMutation.isLoading || isNotPublishable}
                  >
                    {uploadTaskMutation.isLoading
                      ? "Publishing..."
                      : "Publish Task"}
                  </button>

                  <button
                    className="bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleUpload("draft")}
                    disabled={draftTaskMutation.isLoading || isNotPublishable}
                  >
                    {draftTaskMutation.isLoading
                      ? "Saving..."
                      : "Save as Draft"}
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
                Manual Groups({numberOfGroups}{" "}
                {numberOfGroups === 1 ? "Group" : "Groups"})
              </h2>
              <button
                onClick={() => {
                  // Store current active group before closing
                  // if (activeGroup) {
                  //   setLastActiveGroup(activeGroup);
                  // }
                  if (lastGroupSaved && lastGroupSaved.length > 0) {
                    const restoredGroups = lastGroupSaved.map((savedGroup) => ({
                      id: savedGroup.groupId,
                      members: [...savedGroup.members, ""],
                      leader: {
                        account_id: savedGroup.leader_id,
                        full_name:
                          currentSpace?.members?.find(
                            (m) => m.account_id === savedGroup.leader_id,
                          )?.full_name || "",
                      },
                      showInputs: false,
                      isSaved: true,
                      wasPreviouslySaved: true,
                    }));
                    setGroups(restoredGroups);
                  } else {
                    setGroups([]); // Clear groups if nothing was previously saved
                  }
                  setShowManualGroups(false);
                }}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col md:flex-row lg:flex-row gap-6">
              {/* Groups - Left side for tablet and larger */}

              <div className="flex-1 md:order-1 lg:order-1 order-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`bg-[#23272F] rounded-lg p-4 cursor-pointer transition-all ${
                        activeGroup === group.id
                          ? "ring-2 ring-blue-500"
                          : "hover:bg-[#2a2f38]"
                      }`}
                      onClick={() => {
                        if (activeGroup && activeGroup !== group.id) {
                          const prevGroup = groups.find(
                            (g) => g.id === activeGroup,
                          );
                          if (
                            prevGroup &&
                            prevGroup.showInputs &&
                            !prevGroup.isSaved
                          ) {
                            const updatedGroups = [...groups];
                            if (
                              prevGroup.wasPreviouslySaved &&
                              prevGroup.originalData
                            ) {
                              updatedGroups[activeGroup - 1].leader =
                                prevGroup.originalData.leader;
                              updatedGroups[activeGroup - 1].members = [
                                ...prevGroup.originalData.members,
                              ];
                              updatedGroups[activeGroup - 1].showInputs = false;
                              updatedGroups[activeGroup - 1].isSaved = true;
                              delete updatedGroups[activeGroup - 1]
                                .originalData;
                            } else {
                              // For new groups, reset to empty state
                              updatedGroups[activeGroup - 1].leader = {
                                account_id: null,
                                full_name: "",
                              };
                              updatedGroups[activeGroup - 1].members = [""];
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
                                updatedGroups[group.id - 1].leader =
                                  updatedGroups[
                                    group.id - 1
                                  ].originalData.leader;
                                updatedGroups[group.id - 1].members = [
                                  ...updatedGroups[group.id - 1].originalData
                                    .members,
                                ];
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

                      {/* Show saved group content */}

                      {group.isSaved ? (
                        <div className="space-y-2">
                          {group.leader?.full_name && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-yellow-400">
                                Leader:
                              </span>

                              <span className="text-sm text-white">
                                {group.leader.full_name}
                              </span>
                            </div>
                          )}

                          {group.members.filter((m) => m.trim()).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-green-400">
                                Members:
                              </span>

                              <div className="mt-1 space-y-1">
                                {group.members
                                  .filter((m) => m.trim())
                                  .map((member, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-white pl-2"
                                    >
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
                        /* Show input fields for unsaved groups */

                        <>
                          {!group.showInputs ? (
                            // Show Add People button when inputs are hidden

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
                            // Show input fields when inputs are visible

                            <>
                              {/* Leader Field */}

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Leader:
                                </label>

                                <div
                                  className="flex gap-2 items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={group.leader?.full_name || ""}
                                    onChange={(e) =>
                                      handleGroupLeaderChange(
                                        group.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter leader name"
                                    className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                  />

                                  {group.leader?.account_id && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        const updatedGroups = [...groups];

                                        updatedGroups[group.id - 1].leader = {
                                          account_id: null,
                                          full_name: "",
                                        };

                                        setGroups(updatedGroups);
                                      }}
                                      disabled={
                                        group.members.filter((member) =>
                                          member.trim(),
                                        ).length > 0
                                      }
                                      className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                                        group.members.filter((member) =>
                                          member.trim(),
                                        ).length > 0
                                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                          : "bg-red-600 text-white hover:bg-red-700"
                                      }`}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Members Field */}

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Members:
                                </label>

                                <div className="space-y-2 mb-3">
                                  {group.members.map((member, memberIndex) => (
                                    <div
                                      key={memberIndex}
                                      className="flex gap-2 items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="text"
                                        value={member}
                                        onChange={(e) =>
                                          handleGroupMemberChange(
                                            group.id,
                                            memberIndex,
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Enter member name"
                                        className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                      />

                                      {member.trim() && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();

                                            removeMemberFromGroup(
                                              group.id,
                                              memberIndex,
                                            );
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

                              {/* Save Group button */}

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
                                  disabled={
                                    !group.leader?.full_name ||
                                    !group.leader?.full_name.trim()
                                  }
                                  className={`${group.wasPreviouslySaved ? "w-full" : "flex-1"} px-3 py-2 text-sm rounded ${
                                    !group.leader?.full_name ||
                                    !group.leader?.full_name.trim()
                                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                >
                                  Save Group
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Show member count for inactive groups */}

                      {activeGroup !== group.id &&
                        !group.isSaved &&
                        group.members.filter((m) => m.trim()).length > 0 && (
                          <div className="text-gray-400 text-sm">
                            {group.members.filter((m) => m.trim()).length}{" "}
                            members
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Students - Right side for tablet and larger */}

              <div className="lg:w-80 md:w-72 sm:w-64 bg-[#23272F] rounded-lg p-4 h-fit max-h-[300px] md:max-h-[280px] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:order-2 lg:order-2 order-1">
                <h3 className="font-semibold text-white mb-4">
                  Available Students (
                  {currentSpace?.members.length - getAssignedMembers().size})
                </h3>

                <div className="space-y-2">
                  {currentSpace?.members
                    .slice(0, isTablet ? 5 : currentSpace?.members.length)
                    .map((member, index) => {
                      const isAssigned = isMemberAssigned(member.full_name);
                      const role = getMemberRole(member.full_name);
                      return (
                        <div
                          key={index}
                          className={`rounded p-3 text-white text-sm transition cursor-pointer ${
                            isAssigned
                              ? "bg-[#1a1f29] opacity-50 cursor-not-allowed"
                              : "bg-[#161A20] hover:bg-[#1a1f29]"
                          }`}
                          onClick={() =>
                            !isAssigned &&
                            addMemberFromAvailable(member.full_name)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className={isAssigned ? "line-through" : ""}>
                              {member.full_name}
                            </span>

                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  role === "leader"
                                    ? "bg-yellow-500"
                                    : role === "member"
                                      ? "bg-green-500"
                                      : "bg-green-500"
                                }`}
                              ></div>

                              <span className="text-xs text-gray-400">
                                {role === "leader"
                                  ? "Leader"
                                  : role === "member"
                                    ? "Member"
                                    : "Click to add"}
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
                  const groupsData = groups.map((group) => ({
                    groupId: group.id,
                    leader_id: group.leader?.account_id,
                    members: group.members.filter((member) => member.trim()), // Remove empty members
                  }));
                  console.log("All groups saved:", groupsData);
                  setLastGroupSaved(groupsData);
                  setGroupsConfigured(true);
                  setGroupCreationMethod("manual");
                  setShowManualGroups(false);
                }}
                disabled={groups.some(
                  (group) =>
                    !group.leader?.full_name || !group.leader?.full_name.trim(),
                )}
                className={`px-4 py-2 text-sm rounded ${
                  groups.some(
                    (group) =>
                      !group.leader?.full_name ||
                      !group.leader?.full_name.trim(),
                  )
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
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
                Generate Groups ({numberOfGroups}{" "}
                {numberOfGroups === 1 ? "Group" : "Groups"})
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
                The system will automatically generate {numberOfGroups} groups
                and randomly assign students to them.
              </p>

              <div className="bg-[#23272F] rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Generated Groups Preview:
                  </h3>

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
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      }`}
                    >
                      -
                    </button>

                    <span className="text-white font-medium min-w-[2rem] text-center">
                      {numberOfGroups}
                    </span>

                    <button
                      onClick={() => {
                        const newNumGroups = numberOfGroups + 1;

                        setNumberOfGroups(newNumGroups);

                        shuffleGroups(newNumGroups);
                      }}
                      disabled={numberOfGroups >= currentSpace?.members.length}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups >= currentSpace?.members.length
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {generatedGroupsPreview.map((group, index) => (
                    <div
                      key={index}
                      className="bg-[#161A20] rounded p-2 sm:p-3"
                    >
                      <div className="text-blue-400 font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                        Group {group.id}
                      </div>

                      <div className="text-xs space-y-0.5 sm:space-y-1">
                        <div className="text-yellow-400">
                          <span className="font-medium">Leader:</span>

                          <span className="block xs:inline xs:ml-1">
                            {group.leader?.full_name}
                          </span>
                        </div>

                        <div className="text-green-400">
                          <span className="font-medium">Members:</span>

                          <span className="block xs:inline xs:ml-1">
                            {group.members.join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-500 text-xs mt-1 sm:mt-2">
                        Auto-assigned
                      </div>
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
                  setGroupCreationMethod("generate");
                  console.log(
                    `Generated ${numberOfGroups} groups:`,
                    generatedGroupsPreview,
                  );

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
                Are you sure you want to reset all groups? This will remove all
                group assignments and you'll need to configure them again.
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
                  setGroups([
                    {
                      id: 1,
                      members: [],
                      leader: { account_id: null, full_name: "" },
                      showInputs: false,
                      isSaved: false,
                      wasPreviouslySaved: false,
                    },
                  ]);

                  setNumberOfGroups(0);
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

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Invitations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {joinRequestsData.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No pending invitations
                </p>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div
                    key={invitation.account_id}
                    className="bg-[#2A2F3A] rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={invitation.profile_pic}
                        alt={invitation.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{invitation.fullname}</h3>
                        <p className="text-sm text-gray-400">
                          {invitation.email}
                        </p>
                        <p className="text-sm mt-1">
                          {invitation.message || "Hello world"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {invitation.added_at}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          handleDeclineJoinRequest(invitation.account_id)
                        }
                        className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition"
                      >
                        Decline
                      </button>
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          handleAcceptJoinRequest(invitation.account_id)
                        }
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* INVITE POPUP */}
      {showInvitePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#E6E6E6] rounded-2xl w-[420px] max-w-[90vw] p-6 shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Add Member</h2>
              <button
                onClick={() => setShowInvitePopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* INVITATION LINK */}
            <div className="mb-4">
              <p className="text-sm font-medium text-black mb-1">
                Invitation Link
              </p>
              <div className="flex items-center justify-between bg-white px-3 py-1 rounded-md border border-gray-300">
                <span className="text-xs text-gray-600 truncate flex-1">
                  {currentSpace?.space_link}
                </span>
                <button
                  onClick={() => handleCopyLink(currentSpace?.space_link)}
                  className={`text-sm ml-2 px-2 py-1 rounded transition-colors ${
                    copyFeedback
                      ? copyFeedback === "Copied!"
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                      : "text-gray-500 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  {copyFeedback || "Copy Link"}
                </button>
              </div>
            </div>
            {/* INPUT */}
            <div className="mb-4">
              <p className="text-sm font-medium text-black mb-1">
                Type username or email
              </p>
              <input
                type="text"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-md
                  border
                  border-purple-500
                  bg-white
                  text-black
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                "
              />
            </div>

            <div>
              <p className="text-sm font-medium text-black mb-2">
                Suggested Users
              </p>
              <div className="space-y-3">
                {[
                  {
                    name: "Raecell Ann Galvez",
                    email: "raecellanngalvez@gmail.com",
                    avatar:
                      "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg",
                  },
                  {
                    name: "Nathaniel Faborada",
                    email: "faboradanathaniel@gmail.com",
                    avatar:
                      "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg",
                  },
                  {
                    name: "Wilson Esmabe",
                    email: "wilsonesmabe2003@gmail.com",
                    avatar:
                      "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419202/wilson_fw2qoz.jpg",
                  },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-transparent hover:bg-gray-200 px-2 py-2 rounded-lg cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-black">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={dialogMessage}
      />
    </div>
  );
};

export default UserTaskPage;
