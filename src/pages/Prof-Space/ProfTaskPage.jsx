import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTasks } from "../../hooks/useTasks";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import {
  FiMenu,
  FiX,
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
  FiFileText,
  FiCopy,
  FiUpload,
} from "react-icons/fi";
import Logout from "../component/logout";
import ProfSidebar from "../component/profsidebar";
import AddMember from "../component/AddMember";
import ArchiveClassAlert from "../component/ArchiveClassAlert";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import Button from "../component/button_2";
import { DeleteConfirmationDialog } from "../component/SweetAlert.jsx";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { toast } from "react-toastify";
import QuizBuilder from "./taskComponents/QuizBuilder";
import IndividualActivityBuilder from "./taskComponents/IndividualActivityBuilder";
import GroupActivityBuilder from "./taskComponents/GroupActivityBuilder";
import ExamBuilder from "./taskComponents/ExamBuilder";
import {
  QuizPreview,
  IndividualActivityPreview,
  GroupActivityPreview,
  ExamPreview,
  StudentQuizTaker,
} from "./taskPreviewComponents";

const ProfTaskPage = () => {
  // ================= TASK FORM STATE =================
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskCategory, setTaskCategory] = useState("individual-activity");

  // Task categories with emojis
  const taskCategories = [
    { value: "quiz", label: "Quiz", emoji: "📝" },
    { value: "group-activity", label: "Group Activity", emoji: "👥" },
    { value: "individual-activity", label: "Individual Activity", emoji: "📄" },
    { value: "exam", label: "Exam", emoji: "�" },
  ];

  // Get category emoji and label
  const getCategoryDisplay = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? `${category.emoji} ${category.label}` : "📝 Task";
  };

  // Get category emoji
  const getCategoryEmoji = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? category.emoji : "📝";
  };

  const navigate = useNavigate();

  const { space_uuid, space_name } = useParams();

  const { user, isLoading: userLoading } = useUser();
  const { addNotification, showGlobalNotification } = useNotification();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    useJoinRequests,
    isLoading: spaceLoading,
    acceptJoinRequest,
    declineJoinRequest,
    deleteSpace,
    setArchive,
    submitTaskAnswer,
  } = useSpace();

  // Join requests
  const { data: joinRequestsData = [], isLoading: joinRequestsLoading } =
    useJoinRequests(space_uuid || "");

  // UUID validation
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const isValidUuid = uuidPattern.test(space_uuid);

  // Find current space
  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  // Check if user is owner
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;

  // Space name
  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";

  // Apply useTasks hook
  const {
    uploadedTasksQuery,
    draftedTasksQuery,
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  } = useTasks(currentSpace?.space_uuid);

  const taskData = uploadedTasksQuery?.data || [];
  const draftActivities = draftedTasksQuery?.data || [];
  const isLoadingTasks = uploadedTasksQuery?.isLoading;
  const isLoadingDrafts = draftedTasksQuery?.isLoading;
  const tasksError = uploadedTasksQuery?.error;
  const draftsError = draftedTasksQuery?.error;

  // Handle API response structure - data might be nested
  const uploadedTask = Array.isArray(taskData)
    ? taskData
    : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities)
    ? draftActivities
    : draftActivities?.data || [];

  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteButtonClicked, setInviteButtonClicked] = useState(false);
  const [pendingButtonClicked, setPendingButtonClicked] = useState(false);
  const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const lastScrollY = useRef(0);

  // Cover photo state
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPhotoPosition, setCoverPhotoPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const [showCoverPhotoConfirm, setShowCoverPhotoConfirm] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const coverPhotoEditorRef = useRef(null);

  // Gradient color options for cover photo
  const colorOptions = [
    "linear-gradient(45deg, #FFC107, #FF5722)",
    "linear-gradient(45deg, #3F51B5, #2196F3)",
    "linear-gradient(45deg, #9C27B0, #673AB7)",
    "linear-gradient(45deg, #E91E63, #F44336)",
    "linear-gradient(45deg, #4CAF50, #8BC34A)",
    "linear-gradient(45deg, #FF9800, #FFC107)",
    "linear-gradient(45deg, #00BCD4, #009688)",
    "linear-gradient(45deg, #795548, #607D8B)",
  ];

  /* ================= CREATE TASK MODE ================= */
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showTaskTypeSelection, setShowTaskTypeSelection] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [showManualGroups, setShowManualGroups] = useState(false);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(1);
  const [groups, setGroups] = useState([
    {
      id: 1,
      members: [],
      leader: "",
      showInputs: false,
      isSaved: false,
      wasPreviouslySaved: false,
    },
  ]);
  const [activeGroup, setActiveGroup] = useState(1); // Track which group is currently active
  const [isTablet, setIsTablet] = useState(false);
  const [groupsConfigured, setGroupsConfigured] = useState(false); // Track if groups are configured
  const [groupCreationMethod, setGroupCreationMethod] = useState(null); // Track how groups were created: 'manual' or 'generate'
  const [generatedGroupsPreview, setGeneratedGroupsPreview] = useState([]); // Store shuffled groups for preview

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewTask, setPreviewTask] = useState(null);
  const [showStudentQuiz, setShowStudentQuiz] = useState(false);
  const [studentQuizTask, setStudentQuizTask] = useState(null);

  // Example available members in the professor's space
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
    "Jennifer Lopez",
  ];

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

  // Invite member
  const handleInviteMember = () => {
    setInviteButtonClicked(true);
    setIsInviting(true);
    setShowInvitePopup(true);
    setTimeout(() => {
      setInviteButtonClicked(false);
      setIsInviting(false);
    }, 500);
  };

  // Delete room / Archive class
  const handleDeleteRoom = async () => {
    if (!currentSpace) return;

    // Check if it's a course space
    const isCourseSpace = currentSpace?.space_type === "course" || currentSpace?.space_day;
    
    if (isCourseSpace) {
      // Show archive confirmation dialog for course spaces
      setDialogMessage(currentSpace);
      setShowArchiveDialog(true);
    } else {
      // Show delete confirmation dialog for regular spaces
      setDialogMessage(currentSpace.space_name);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    // Prevent multiple executions
    if (!currentSpace || !showDeleteDialog) return;

    setShowDeleteDialog(false);
    setDeleteButtonClicked(true);
    setIsDeleting(true);

    try {
      await deleteSpace(currentSpace.space_uuid, user.id);

      // Navigate immediately after successful deletion
      navigate("/prof/spaces");
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteButtonClicked(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteButtonClicked(false);
  };

  const handleConfirmArchive = async () => {
    // Prevent multiple executions
    if (!currentSpace || !showArchiveDialog) return;

    setShowArchiveDialog(false);
    setDeleteButtonClicked(true);
    setIsDeleting(true);

    try {
      // Use the archive function instead of delete
      await setArchive(currentSpace.space_uuid);

      toast.success(`Class "${currentSpace.space_name}" has been archived successfully!`);

      // Navigate to archive page after successful archiving
      navigate("/prof/archive");
    } catch (error) {
      console.error("Failed to archive class:", error);
      toast.error("Failed to archive class. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteButtonClicked(false);
    }
  };

  const handleCancelArchive = () => {
    setShowArchiveDialog(false);
    setDeleteButtonClicked(false);
  };

  // Handle pending invitations
  const handlePendingInvitations = () => {
    setPendingButtonClicked(true);
    setShowPendingInvitations(true);
    setTimeout(() => {
      setPendingButtonClicked(false);
    }, 500);
  };

  // Handle join requests
  const handleAcceptJoinRequest = async (userId) => {
    try {
      await acceptJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to accept join request:", error);
    }
  };

  const handleDeclineJoinRequest = async (userId) => {
    try {
      await declineJoinRequest(userId, space_uuid);
    } catch (error) {
      console.error("Failed to decline join request:", error);
    }
  };

  // Send invite
  const sendInvite = () => {
    if (inviteEmail.trim()) {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInvitePopup(false);
    }
  };

  // Copy link
  const handleCopyLink = (space_link) => {
    navigator.clipboard
      .writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("File selected:", file);

    // Extract text from document and populate instruction field
    if (file) {
      try {
        const extractedText = await extractTextFromFile(file);
        if (extractedText) {
          setInstruction(extractedText);
          // Update the contentEditable div if it exists
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

  // Load saved cover photo from backend on component mount
  useEffect(() => {
    const savedCoverPhoto = currentSpace?.space_cover;
    console.log("Loading cover photo:", savedCoverPhoto);
    if (savedCoverPhoto) {
      setCoverPhotoUrl(savedCoverPhoto);
    }
  }, [currentSpace]);

  // Cover photo drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPosition(coverPhotoPosition);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartY;
    const containerHeight = coverPhotoEditorRef.current?.offsetHeight || 400;
    const positionChange = (deltaY / containerHeight) * 100;
    const newPosition = Math.max(
      0,
      Math.min(100, dragStartPosition - positionChange),
    );

    setCoverPhotoPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  // Cover photo handlers
  const handleCoverPhotoClick = () => {
    if (isOwnerSpace) {
      coverPhotoInputRef.current?.click();
    }
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please upload an image smaller than 5MB");
        return;
      }

      setCoverPhoto(file);

      // Create preview and open editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoUrl(e.target.result);
        setShowCoverPhotoEditor(true);
        setCoverPhotoPosition(50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoSave = () => {
    setShowCoverPhotoConfirm(true);
  };

  // Handle gradient selection for cover photo
  const handleGradientSelection = (gradient) => {
    setCoverPhotoUrl(gradient);
    setShowCoverPhotoConfirm(true); // Show confirmation dialog for gradients
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  const handleConfirmCoverPhoto = () => {
    // Check if it's a gradient or an image
    if (coverPhotoUrl && coverPhotoUrl.includes('gradient')) {
      // For gradients, save directly without canvas transformations
      // Backend will handle saving the space_cover
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);
      
      addNotification({
        type: "success",
        title: "Cover Photo Updated",
        message: "Your cover photo has been updated successfully!",
        duration: 3000,
      });
    } else {
      // For images, create canvas to apply transformations
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas size to cover photo dimensions
        canvas.width = 1200;
        canvas.height = 400;

        // Calculate scale to cover the entire canvas
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate position based on user vertical positioning
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);

        // Draw the image with transformations
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to data URL and update
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCoverPhotoUrl(dataUrl);

        // Backend will handle saving the space_cover
        setShowCoverPhotoEditor(false);
        setShowCoverPhotoConfirm(false);

        addNotification({
          type: "success",
          title: "Cover Photo Updated",
          message: "Your cover photo has been updated successfully!",
          duration: 3000,
        });
      };

      img.onerror = () => {
        addNotification({
          type: "error",
          title: "Image Load Failed",
          message: "Failed to load image. Please try again.",
          duration: 3000,
        });
        setShowCoverPhotoConfirm(false);
      };

      img.src = coverPhotoUrl;
    }
  };

  const handleCancelCoverPhoto = () => {
    setShowCoverPhotoConfirm(false);
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setCoverPhoto(null);
    // Don't clear coverPhotoUrl on cancel, keep the existing cover photo
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  const resetCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoPosition(50);
    // Backend will handle removing the space_cover
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  // Text extraction functions (same as UserTaskPage)
  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      // PDF file extraction
      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        resolve(
          `[PDF Document: ${file.name}]\n\nContent extraction from PDF requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      }
      // Word document extraction
      else if (
        fileType.includes("word") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        resolve(
          `[Word Document: ${file.name}]\n\nContent extraction from DOCX requires mammoth.js library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      }
      // PowerPoint extraction
      else if (
        fileType.includes("presentation") ||
        fileName.endsWith(".pptx") ||
        fileName.endsWith(".ppt")
      ) {
        resolve(
          `[PowerPoint Presentation: ${file.name}]\n\nContent extraction from PPTX requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      }
      // Excel extraction
      else if (
        fileType.includes("sheet") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        resolve(
          `[Excel Spreadsheet: ${file.name}]\n\nContent extraction from Excel requires xlsx library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`,
        );
      }
      // Plain text file
      else if (fileType.startsWith("text/") || fileName.endsWith(".txt")) {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          resolve(this.result);
        };
        fileReader.onerror = reject;
        fileReader.readAsText(file);
      } else {
        reject(new Error("Unsupported file type for text extraction"));
      }
    });
  };

  const handleViewScore = (task) => {
    // Example: navigate to score page or open modal
    console.log("Viewing score for task:", task);
    // You can replace the console.log with your actual logic, e.g.,
    // navigate(`/quiz/${task.id}/score`);
    // or open a modal with the score
  };

  // Sync instruction state with contentEditable
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

  const applyFormat = (format) => {
    document.execCommand(format, false, null);
    instructionRef.current?.focus();
  };

  // ================= UPLOAD HANDLER =================
  const handleUpload = async (status_type, taskData) => {
    let payload;

    console.log(taskData);

    console.log("Uploading task with payload:", taskData);

    try {
      if (status_type === "uploaded") {
        await uploadTaskMutation.mutateAsync({
          space_uuid: currentSpace?.space_uuid,
          taskData: taskData,
        });
        alert("Task published successfully!");
      } else {
        await draftTaskMutation.mutateAsync({
          spaceId: Number(currentSpace?.space_id),
          taskData: payload,
        });
        alert("Task saved as draft!");
      }

      // Reset form and close
      resetTaskForm();
      setIsCreatingTask(false);
      setSelectedTaskType(null);
      setShowTaskTypeSelection(false);
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
    setTaskCategory("individual-activity");
    setSelectedTaskType(null);
    setShowTaskTypeSelection(false);
    setGroups([
      {
        id: 1,
        members: [],
        leader: "",
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

  const handleManualGroups = () => {
    if (groupsConfigured) {
      // If groups are already configured, open the appropriate popup based on creation method
      if (groupCreationMethod === "generate") {
        setShowGenerateGroups(true);
      } else {
        setActiveGroup(1);
        setShowManualGroups(true);
      }
    } else {
      // If no groups are configured, create new empty groups and set creation method to manual
      const input = document.getElementById("groups-input");
      const numGroups = parseInt(input.value) || 1;
      setNumberOfGroups(numGroups);
      setGroupCreationMethod("manual");

      // Initialize groups with empty members arrays and leader field
      const newGroups = Array.from({ length: numGroups }, (_, index) => ({
        id: index + 1,
        members: [""],
        leader: "",
        showInputs: false,
        isSaved: false,
      }));
      setGroups(newGroups);
      setActiveGroup(1); // Reset to first group when modal opens
      setShowManualGroups(true);
    }
  };

  const handleGenerateGroups = () => {
    const input = document.getElementById("groups-input");
    const numGroups = parseInt(input.value) || 1;
    setNumberOfGroups(numGroups);

    // Generate initial shuffled groups
    shuffleGroups(numGroups);
    setShowGenerateGroups(true);
  };

  const shuffleGroups = (numGroups) => {
    // Shuffle all available members
    const shuffledMembers = [...availableMembers].sort(
      () => Math.random() - 0.5,
    );

    // Calculate base members per group and remainder
    const totalMembers = shuffledMembers.length;
    const baseMembersPerGroup = Math.floor(totalMembers / numGroups);
    const remainder = totalMembers % numGroups;

    const newGroups = Array.from({ length: numGroups }, (_, index) => {
      // Distribute members: first groups get one extra member if there's a remainder
      const membersCount = baseMembersPerGroup + (index < remainder ? 1 : 0);

      // Calculate start and end indices for this group
      let startIndex = 0;
      for (let i = 0; i < index; i++) {
        startIndex += baseMembersPerGroup + (i < remainder ? 1 : 0);
      }
      const endIndex = startIndex + membersCount;

      const groupMembers = shuffledMembers.slice(startIndex, endIndex);

      // First member becomes leader, rest are members
      const leader = groupMembers[0] || "";
      const members = groupMembers.slice(1);

      return {
        id: index + 1,
        leader: leader,
        members: members,
        showInputs: false,
        isSaved: true,
      };
    });

    setGeneratedGroupsPreview(newGroups);
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
    updatedGroups[groupId - 1].showInputs =
      !updatedGroups[groupId - 1].showInputs;
    setGroups(updatedGroups);
  };

  const editGroup = (groupId) => {
    const updatedGroups = [...groups];
    const group = updatedGroups[groupId - 1];

    // Store original data before editing
    updatedGroups[groupId - 1].originalData = {
      leader: group.leader,
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
      leader: "",
      members: [""],
      showInputs: false,
      isSaved: false,
    };
    setGroups(updatedGroups);
  };

  const addMemberToGroup = (groupId) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].members.push("");
    setGroups(updatedGroups);
  };

  const saveMemberToGroup = (groupId, memberIndex) => {
    const updatedGroups = [...groups];
    const currentMember = updatedGroups[groupId - 1].members[memberIndex];

    if (currentMember.trim()) {
      // Member is already saved through the onChange handler
      console.log(`Member "${currentMember}" saved to Group ${groupId}`);
      // Could add visual feedback here if needed
    }
  };

  const addMemberFromAvailable = (memberName) => {
    // Check if the active group has inputs visible
    const activeGroupData = groups[activeGroup - 1];
    if (!activeGroupData.showInputs) {
      console.log(
        'Cannot add member: Group inputs are not visible. Click "Add People" first.',
      );
      return;
    }

    const updatedGroups = [...groups];
    const activeGroupDataUpdated = updatedGroups[activeGroup - 1];

    // If group has no leader, assign as leader
    if (
      !activeGroupDataUpdated.leader ||
      activeGroupDataUpdated.leader.trim() === ""
    ) {
      activeGroupDataUpdated.leader = memberName;
      console.log(`Added "${memberName}" as leader of Group ${activeGroup}`);
    } else {
      // If group already has a leader, add as member
      const activeGroupMembers = activeGroupDataUpdated.members;
      const firstEmptyIndex = activeGroupMembers.findIndex(
        (member) => !member || member.trim() === "",
      );

      if (firstEmptyIndex !== -1) {
        activeGroupMembers[firstEmptyIndex] = memberName;
      } else {
        activeGroupMembers.push(memberName);
        // Add a new empty input field to maintain one empty field
        activeGroupMembers.push("");
      }
      console.log(
        `Added "${memberName}" to Group ${activeGroup} as member at position ${firstEmptyIndex !== -1 ? firstEmptyIndex + 1 : activeGroupMembers.length}`,
      );
    }

    setGroups(updatedGroups);
  };

  // Get all members that are already assigned to any group (as leaders or members)
  const getAssignedMembers = () => {
    const allAssignedMembers = new Set();
    groups.forEach((group) => {
      // Add leader if exists
      if (group.leader && group.leader.trim()) {
        allAssignedMembers.add(group.leader.trim());
      }
      // Add members
      group.members.forEach((member) => {
        if (member && member.trim()) {
          allAssignedMembers.add(member.trim());
        }
      });
    });
    return allAssignedMembers;
  };

  // Check if a member is already assigned to any group (as leader or member)
  const isMemberAssigned = (memberName) => {
    return getAssignedMembers().has(memberName);
  };

  // Get the role of a member (leader, member, or null if not assigned)
  const getMemberRole = (memberName) => {
    for (const group of groups) {
      if (group.leader && group.leader.trim() === memberName) {
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
    console.log(
      `Group ${groupId} saved with leader: ${group.leader}, members:`,
      validMembers,
    );

    // Mark the group as saved
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].isSaved = true;
    updatedGroups[groupId - 1].showInputs = false;
    updatedGroups[groupId - 1].wasPreviouslySaved = true;
    setGroups(updatedGroups);

    // Here you could add visual feedback or backend call
  };

  const removeMemberFromGroup = (groupId, memberIndex) => {
    const updatedGroups = [...groups];
    const groupMembers = updatedGroups[groupId - 1].members;

    // Remove the member at the specified index
    groupMembers.splice(memberIndex, 1);

    // Ensure there's always at least one empty input field
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

  // TaskSection component for reusable task sections
  const TaskSection = ({ category, emoji, title, tasks }) => {
    const categoryTasks = filterTasksByCategory(tasks, category);

    if (categoryTasks.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-semibold">
            {title} ({categoryTasks.length})
          </h2>
        </div>

        <div
          className="rounded-xl p-4 sm:p-6 border"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: isDarkMode ? currentColors.border : "#000000",
          }}
        >
          {/* TABLE HEADER */}
          <div
            className="hidden sm:grid grid-cols-4 text-sm pb-3 border-b mb-4"
            style={{
              color: currentColors.textSecondary,
              borderColor: currentColors.border,
            }}
          >
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Task Name</div>
            <div className="col-span-1">Deadline</div>
            <div className="col-span-1">Details</div>
          </div>

          {/* TASK LIST */}
          {categoryTasks.map((task, index) => {
            const originalIndex = allTasks.findIndex(
              (t) => t.task_id === task.task_id,
            );
            return (
              <div
                key={task.task_id || index}
                className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
                style={{
                  backgroundColor: currentColors.background,
                  borderColor: currentColors.border,
                }}
              >
                {/* Mobile and Tablet Layout */}
                <div className="sm:hidden">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      {task.isLocal && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Local
                        </span>
                      )}
                      <span
                        className="text-sm font-semibold"
                        style={{ color: currentColors.text }}
                      >
                        {task.task_title}
                      </span>
                    </div>
                    {!task.isLocal ? (
                      <button
                        onClick={() =>
                          setOpenIndex(
                            openIndex === originalIndex ? null : originalIndex,
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs`}
                        style={{
                          backgroundColor: currentColors.text,
                          color: "white",
                        }}
                      >
                        {task.task_status}
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500 text-white">
                        {task.task_status}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Deadline:{" "}
                    <span style={{ color: currentColors.text }}>
                      {task.due_date}
                    </span>
                  </p>
                  {!task.isLocal && openIndex === originalIndex && (
                    <div
                      className="mb-3 pt-3 border-t"
                      style={{ borderColor: currentColors.border }}
                    >
                      <div className="flex flex-col gap-2">
                        {Object.keys(statusStyles).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              handleStatusChange(originalIndex, st);
                              setOpenIndex(null);
                            }}
                            className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium`}
                            style={{
                              backgroundColor: currentColors.text,
                              color: "white",
                            }}
                          >
                            Mark as {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {task.isLocal && task.task_category === "quiz" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleTakeQuiz(task);
                        }}
                        className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: task.has_answered
                            ? "black"
                            : "#10B981",
                          color: "white",
                        }}
                        // disabled={task.has_answered ? true : false}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#059669";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#10B981";
                        }}
                      >
                        Take Quiz
                      </button>
                    )}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePreviewTask(task);
                      }}
                      className={`text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        task.isLocal && task.task_category === "quiz"
                          ? "flex-1"
                          : "block w-full"
                      }`}
                      style={{
                        backgroundColor: task.isLocal
                          ? "#2563eb"
                          : currentColors.accent,
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = task.isLocal
                          ? "#1d4ed8"
                          : "#1d4ed8";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = task.isLocal
                          ? "#2563eb"
                          : currentColors.accent;
                      }}
                    >
                      {task.isLocal ? "Preview" : "View Details"}
                    </a>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid grid-cols-4 items-center">
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      {task.isLocal && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Local
                        </span>
                      )}
                      {!task.isLocal ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenIndex(
                                openIndex === originalIndex
                                  ? null
                                  : originalIndex,
                              )
                            }
                            className={`px-4 py-1 rounded-full text-sm`}
                            style={{
                              backgroundColor: currentColors.text,
                              color: "white",
                            }}
                          >
                            {task.task_status} ▼
                          </button>
                          {openIndex === originalIndex && (
                            <div
                              className="absolute left-0 mt-2 w-44 rounded-lg p-3 z-50 shadow-lg"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                                border: "1px solid",
                              }}
                            >
                              <div className="flex flex-col gap-2">
                                {Object.keys(statusStyles).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() =>
                                      handleStatusChange(originalIndex, st)
                                    }
                                    className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 whitespace-nowrap`}
                                    style={{
                                      backgroundColor: currentColors.text,
                                      color: "white",
                                    }}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-4 py-1 rounded-full text-sm bg-blue-500 text-white">
                          {task.task_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: currentColors.text }}
                    >
                      {task.task_title}
                    </span>
                  </div>
                  <div
                    className="col-span-1"
                    style={{ color: currentColors.text }}
                  >
                    {new Date(task.due_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                  <div className="col-span-1">
                    <div className="flex gap-2">
                      {task.task_category === "quiz" && (
                        <>
                          {!isOwnerSpace ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // Decide what to do based on whether the quiz was answered
                                task?.has_answered
                                  ? handleViewScore(task)
                                  : handleTakeQuiz(task);
                              }}
                              className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              style={{
                                backgroundColor: task.has_answered
                                  ? "gray"
                                  : "#10B981",
                                color: "white",
                                cursor: "pointer", // always clickable
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor =
                                  task.has_answered ? "#6b7280" : "#059669";
                                // optional: darker gray for answered
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor =
                                  task.has_answered ? "gray" : "#10B981";
                              }}
                            >
                              {task.has_answered ? "View Score" : "Take Quiz"}
                            </button>
                          ) : (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePreviewTask(task);
                              }}
                              className={`text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                task.isLocal ? "flex-1" : "block w-full"
                              }`}
                              style={{
                                backgroundColor: task.isLocal
                                  ? "#2563eb"
                                  : currentColors.accent,
                                color: "white",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = task.isLocal
                                  ? "#1d4ed8"
                                  : "#1d4ed8";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = task.isLocal
                                  ? "#2563eb"
                                  : currentColors.accent;
                              }}
                            >
                              View Details
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Handle preview for local tasks
  const handlePreviewTask = (task) => {
    setPreviewTask(task);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewTask(null);
  };

  // Handle student quiz taking
  const handleTakeQuiz = (task) => {
    setStudentQuizTask(task);
    setShowStudentQuiz(true);
  };

  const handleCloseStudentQuiz = () => {
    setShowStudentQuiz(false);
    setStudentQuizTask(null);
  };

  const handleQuizSubmit = async (answers) => {
    const submissionData = {
      task_id: studentQuizTask.task_id || studentQuizTask.rawData?.task_id,
      answers: answers.map((answer) => {
        // For choice-based questions
        if (answer.choice_id) {
          return {
            question_id: answer.question_id,
            choice_id: answer.choice_id,
          };
        }
        // For text-based questions (short answers)
        else if (answer.answer_text) {
          return {
            question_id: answer.question_id,
            answer_text: answer.answer_text,
          };
        }
        // Fallback for any other type
        else {
          return {
            question_id: answer.question_id,
          };
        }
      }),
    };

    console.log("Quiz submitted with formatted data:", submissionData);
    alert("Quiz submitted successfully!");
    try {
      await submitTaskAnswer(submissionData);
    } catch (err) {}
    handleCloseStudentQuiz();
  };

  // Get preview component based on task category
  const getPreviewComponent = (task) => {
    const category = task.task_category || task.rawData?.task_type || "quiz";

    switch (category) {
      case "quiz":
        return (
          <QuizPreview
            taskData={task.rawData || task}
            currentColors={currentColors}
          />
        );
      case "individual-activity":
        return (
          <IndividualActivityPreview
            taskData={task.rawData || task}
            currentColors={currentColors}
          />
        );
      case "group-activity":
        return (
          <GroupActivityPreview
            taskData={task.rawData || task}
            currentColors={currentColors}
          />
        );
      case "exam":
        return (
          <ExamPreview
            taskData={task.rawData || task}
            currentColors={currentColors}
          />
        );
      default:
        return (
          <QuizPreview
            taskData={task.rawData || task}
            currentColors={currentColors}
          />
        );
    }
  };

  // Load tasks from localStorage
  const loadTasksFromLocalStorage = () => {
    try {
      const storedTasks = localStorage.getItem("quizTask");
      if (storedTasks) {
        const taskData = JSON.parse(storedTasks);
        // Convert localStorage format to match API format
        return [
          {
            id: `local_${Date.now()}`, // Unique ID for localStorage tasks
            task_title: `Quiz: ${taskData.task_type || "Quiz"}`,
            task_category: taskData.task_type || "quiz",
            task_status: "In Progress",
            task_due: taskData.task_due_date,
            task_instruction: taskData.task_instructions,
            task_score: taskData.total_score,
            isLocal: true, // Flag to identify localStorage tasks
            rawData: taskData, // Store original data for detailed view
          },
        ];
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
    }
    return [];
  };

  // Combine API tasks with localStorage tasks
  const allTasks = [...(uploadedTask || [])];

  // Filter tasks by category
  const filterTasksByCategory = (tasks, category) => {
    return tasks.filter((task) => task.task_category === category);
  };

  // Get task counts by category
  const getTaskCountByCategory = (category) => {
    return filterTasksByCategory(allTasks, category).length;
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

  // Loading state
  if (userLoading || spaceLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        Loading...
      </div>
    );
  }

  // Invalid space or not found
  if (!isValidUuid || !currentSpace) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Space not found
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        {/* <ProfSidebar onLogoutClick={() => setShowLogout(true)} /> */}
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
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
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface,
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div
        className="flex-1 flex flex-col w-full"
        style={{ backgroundColor: currentColors.background }}
      >
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">{spaceName}</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div
          className="relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          onClick={handleCoverPhotoClick}
        >
          {coverPhotoUrl ? (
            <>
              <img
                src={coverPhotoUrl}
                alt="Space Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
              {isOwnerSpace && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Change Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className="absolute inset-0 bg-black/30" />
              {isOwnerSpace && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Upload Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          )}
          {isOwnerSpace && (
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          )}
        </div>

        <div className="p-4 sm:p-6">
          {/* ================= DESKTOP TITLE ================= */}
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                (
                {currentSpace?.space_type === "course"
                  ? currentSpace?.members?.length - 1 + " student(s)"
                  : currentSpace?.members?.length + " member(s)" || 0}
                )
              </span>
              {isOwnerSpace && (
                <>
                  <div onClick={handleInviteMember}>
                    <Button text="Add Member" />
                  </div>
                  <div onClick={handlePendingInvitations} className="relative">
                    <Button text="Pending Invites" />
                    {pendingInvitesCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingInvitesCount}
                      </span>
                    )}
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text={currentSpace?.space_type === "course" || currentSpace?.space_day ? "Archive Class" : "Delete Room"} />
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

          {/* ================= TABS ================= */}
          <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-700 pb-4 mb-6">
            <div className="flex justify-center min-w-max mx-auto px-4">
              <div className="flex justify-center space-x-12">
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}`)
                  }
                >
                  Stream
                </button>
                <button
                  className="font-semibold border-b-2 pb-2"
                  style={{ borderColor: currentColors.text }}
                >
                  Tasks
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/files`)
                  }
                >
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/prof/space/${space_uuid}/${space_name}/people`)
                  }
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* Add Member Button - Mobile */}
          {isOwnerSpace && (
            <div className="md:hidden flex justify-end gap-2 mb-6">
              <div onClick={handleInviteMember}>
                <Button text="Add Member" />
              </div>
              <div onClick={handlePendingInvitations} className="relative">
                <Button text="Pending Invites" />
                {pendingInvitesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingInvitesCount}
                  </span>
                )}
              </div>
              <div onClick={handleDeleteRoom}>
                <Button text={currentSpace?.space_type === "course" || currentSpace?.space_day ? "Archive Class" : "Delete Room"} />
              </div>
            </div>
          )}

          {!isCreatingTask && !showTaskTypeSelection ? (
            /* ================= TASKS LIST VIEW WITH SECTIONS ================= */
            <div className="max-w-5xl mx-auto">
              <button
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium block mb-6 flex items-center gap-2"
                onClick={() => setShowTaskTypeSelection(true)}
              >
                <FiFileText size={16} />
                Create Task
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-semibold">Assigned Tasks</h2>
              </div>

              {/* TASK SECTIONS */}
              <TaskSection
                category="quiz"
                emoji="📝"
                title="Quizzes"
                tasks={allTasks}
              />

              <TaskSection
                category="individual-activity"
                emoji="📄"
                title="Individual Activities"
                tasks={allTasks}
              />

              <TaskSection
                category="group-activity"
                emoji="👥"
                title="Group Activities"
                tasks={allTasks}
              />

              <TaskSection
                category="exam"
                emoji="📋"
                title="Exams"
                tasks={allTasks}
              />

              {/* Show message if no tasks exist */}
              {allTasks.length === 0 && (
                <div
                  className="text-center py-12"
                  style={{ color: currentColors.textSecondary }}
                >
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg mb-2">No tasks assigned yet</p>
                  <p className="text-sm">
                    Create your first task to get started!
                  </p>
                </div>
              )}

              {/* DRAFT ACTIVITIES TABLE */}
              <div className="max-w-5xl mx-auto w-full mt-12">
                <h2 className="text-xl font-semibold mb-6">
                  Draft Activities 📝
                </h2>
                {/* RESPONSIVE DRAFT TABLE */}
                <div
                  className="rounded-xl p-4 sm:p-6 border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: isDarkMode ? currentColors.border : "#000000",
                  }}
                >
                  {/* TABLE HEADER - Hidden on mobile, visible on larger screens */}
                  <div
                    className="hidden sm:grid grid-cols-4 text-sm pb-3 border-b mb-4"
                    style={{
                      color: currentColors.textSecondary,
                      borderColor: currentColors.border,
                    }}
                  >
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Task Name</div>
                    <div className="col-span-1">Deadline</div>
                    <div className="col-span-1">Details</div>
                  </div>

                  {/* DRAFT LIST - Responsive cards for all screen sizes */}
                  {draftedTask?.map((draft, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                      }}
                    >
                      {/* Mobile and Tablet Layout */}
                      <div className="sm:hidden">
                        <div className="flex justify-between items-center mb-3">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: currentColors.text }}
                          >
                            {draft.task_title}
                          </p>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: currentColors.text,
                              color: currentColors.textSecondary,
                              border: `2px solid ${currentColors.border}`,
                            }}
                          >
                            Draft
                          </span>
                        </div>
                        <p
                          className="text-xs mb-3"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Deadline:{" "}
                          <span style={{ color: currentColors.text }}>
                            {new Date(draft.task_due).toLocaleDateString(
                              "en-US",
                            )}
                          </span>
                        </p>
                        <a
                          href="/prof-task-view"
                          className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            backgroundColor: currentColors.accent,
                            color: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#1d4ed8";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor =
                              currentColors.accent;
                          }}
                        >
                          View Details
                        </a>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:grid grid-cols-4 items-center">
                        <div className="col-span-1">
                          <span
                            className="px-6 py-1 rounded-full text-sm font-bold inline-block min-w-[120px] text-center"
                            style={{
                              backgroundColor: currentColors.text,
                              color: currentColors.textSecondary,
                              border: `2px solid ${currentColors.border}`,
                            }}
                          >
                            Draft
                          </span>
                        </div>
                        <div
                          className="col-span-1"
                          style={{ color: currentColors.text }}
                        >
                          {draft.task_title}
                        </div>
                        <div
                          className="col-span-1"
                          style={{ color: currentColors.text }}
                        >
                          {new Date(draft.task_due).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            },
                          )}
                        </div>
                        <div className="col-span-1">
                          <a
                            href="/prof-task-view"
                            className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: currentColors.accent,
                              color: "white",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#1d4ed8";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor =
                                currentColors.accent;
                            }}
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : showTaskTypeSelection ? (
            /* ================= TASK TYPE SELECTION ================= */
            <div className="max-w-5xl mx-auto">
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Select Task Type
                    </h2>
                    <button
                      onClick={() => setShowTaskTypeSelection(false)}
                      className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Quiz Card */}
                    <div
                      className="bg-[#23272F] rounded-lg p-6 cursor-pointer hover:bg-[#2a2f38] transition-all border border-gray-600 hover:border-blue-500"
                      onClick={() => {
                        setSelectedTaskType("quiz");
                        setTaskCategory("quiz");
                        setShowTaskTypeSelection(false);
                        setIsCreatingTask(true);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Quiz
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Create a quiz with multiple choice, true/false,
                          Identification, Enumeration, or short answer questions
                        </p>
                      </div>
                    </div>

                    {/* Individual Activity Card */}
                    <div
                      className="bg-[#23272F] rounded-lg p-6 cursor-pointer hover:bg-[#2a2f38] transition-all border border-gray-600 hover:border-blue-500"
                      onClick={() => {
                        setSelectedTaskType("individual-activity");
                        setTaskCategory("individual-activity");
                        setShowTaskTypeSelection(false);
                        setIsCreatingTask(true);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Individual Activity
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Assign individual tasks, homework, or activities for
                          each student
                        </p>
                      </div>
                    </div>

                    {/* Group Activity Card */}
                    <div
                      className="bg-[#23272F] rounded-lg p-6 cursor-pointer hover:bg-[#2a2f38] transition-all border border-gray-600 hover:border-blue-500"
                      onClick={() => {
                        setSelectedTaskType("group-activity");
                        setTaskCategory("group-activity");
                        setShowTaskTypeSelection(false);
                        setIsCreatingTask(true);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Group Activity
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Create collaborative tasks for student groups to work
                          together
                        </p>
                      </div>
                    </div>

                    {/* Exam Card */}
                    <div
                      className="bg-[#23272F] rounded-lg p-6 cursor-pointer hover:bg-[#2a2f38] transition-all border border-gray-600 hover:border-blue-500"
                      onClick={() => {
                        setSelectedTaskType("exam");
                        setTaskCategory("exam");
                        setShowTaskTypeSelection(false);
                        setIsCreatingTask(true);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Exam
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Schedule formal examinations with time limits and
                          grading criteria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TASK BUILDERS ================= */
            <div>
              {selectedTaskType === "quiz" && (
                <QuizBuilder
                  currentColors={currentColors}
                  onBack={() => {
                    setIsCreatingTask(false);
                    setSelectedTaskType(null);
                    setShowTaskTypeSelection(false);
                  }}
                  onSave={(taskData) => handleUpload("draft", taskData)}
                  onPublish={(taskData) => handleUpload("uploaded", taskData)}
                  isLoading={
                    draftTaskMutation.isLoading || uploadTaskMutation.isLoading
                  }
                />
              )}

              {selectedTaskType === "individual-activity" && (
                <IndividualActivityBuilder
                  currentColors={currentColors}
                  onBack={() => {
                    setIsCreatingTask(false);
                    setSelectedTaskType(null);
                    setShowTaskTypeSelection(false);
                  }}
                  onSave={(taskData) => handleUpload("draft", taskData)}
                  onPublish={(taskData) => handleUpload("uploaded", taskData)}
                  isLoading={
                    draftTaskMutation.isLoading || uploadTaskMutation.isLoading
                  }
                />
              )}

              {selectedTaskType === "group-activity" && (
                <GroupActivityBuilder
                  currentColors={currentColors}
                  onBack={() => {
                    setIsCreatingTask(false);
                    setSelectedTaskType(null);
                    setShowTaskTypeSelection(false);
                  }}
                  onSave={(taskData) => handleUpload("draft", taskData)}
                  onPublish={(taskData) => handleUpload("uploaded", taskData)}
                  isLoading={
                    draftTaskMutation.isLoading || uploadTaskMutation.isLoading
                  }
                />
              )}

              {selectedTaskType === "exam" && (
                <ExamBuilder
                  currentColors={currentColors}
                  onBack={() => {
                    setIsCreatingTask(false);
                    setSelectedTaskType(null);
                    setShowTaskTypeSelection(false);
                  }}
                  onSave={(taskData) => handleUpload("draft", taskData)}
                  onPublish={(taskData) => handleUpload("uploaded", taskData)}
                  isLoading={
                    draftTaskMutation.isLoading || uploadTaskMutation.isLoading
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && previewTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Task Preview - {previewTask.task_title}
              </h2>
              <button
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700 text-2xl bg-transparent border-none outline-none hover:bg-transparent focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-4">{getPreviewComponent(previewTask)}</div>
          </div>
        </div>
      )}

      {/* STUDENT QUIZ TAKER MODAL */}
      {showStudentQuiz && studentQuizTask && (
        <div className="fixed inset-0 z-50">
          <StudentQuizTaker
            quizData={studentQuizTask.rawData || studentQuizTask}
            currentColors={currentColors}
            onSubmit={handleQuizSubmit}
            onExit={handleCloseStudentQuiz}
          />
        </div>
      )}

      {/* ADD MEMBER POPUP */}
      <AddMember
        currentSpace={currentSpace}
        onInviteMember={sendInvite}
        showInvitePopup={showInvitePopup}
        setShowInvitePopup={setShowInvitePopup}
      />

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
                onClick={() => setShowManualGroups(false)}
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
                        // Reset the previously active group if it was in edit mode and not saved
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

                            // If it was a previously saved group, restore original data and set as saved
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
                              updatedGroups[activeGroup - 1].leader = "";
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

                              // Restore original data if it exists
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
                          {group.leader && group.leader.trim() && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-yellow-400">
                                Leader:
                              </span>
                              <span className="text-sm text-white">
                                {group.leader}
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
                                    value={group.leader}
                                    onChange={(e) =>
                                      handleGroupLeaderChange(
                                        group.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter leader name"
                                    className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                  />
                                  {group.leader.trim() && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedGroups = [...groups];
                                        updatedGroups[group.id - 1].leader = "";
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
                                    !group.leader.trim() &&
                                    group.members.filter((member) =>
                                      member.trim(),
                                    ).length === 0
                                  }
                                  className={`${group.wasPreviouslySaved ? "w-full" : "flex-1"} px-3 py-2 text-sm rounded ${
                                    !group.leader.trim() &&
                                    group.members.filter((member) =>
                                      member.trim(),
                                    ).length === 0
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
                  {availableMembers.length - getAssignedMembers().size})
                </h3>
                <div className="space-y-2">
                  {availableMembers
                    .slice(0, isTablet ? 5 : availableMembers.length)
                    .map((member, index) => {
                      const isAssigned = isMemberAssigned(member);
                      const role = getMemberRole(member);
                      return (
                        <div
                          key={index}
                          className={`rounded p-3 text-white text-sm transition cursor-pointer ${
                            isAssigned
                              ? "bg-[#1a1f29] opacity-50 cursor-not-allowed"
                              : "bg-[#161A20] hover:bg-[#1a1f29]"
                          }`}
                          onClick={() =>
                            !isAssigned && addMemberFromAvailable(member)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className={isAssigned ? "line-through" : ""}>
                              {member}
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
                  // Save all groups with their leaders and members
                  const groupsData = groups.map((group) => ({
                    groupId: group.id,
                    leader: group.leader.trim(),
                    members: group.members.filter((member) => member.trim()), // Remove empty members
                  }));
                  console.log("All groups saved:", groupsData);
                  // Here you would send this data to your backend
                  setGroupsConfigured(true);
                  setGroupCreationMethod("manual");
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
                      disabled={numberOfGroups >= availableMembers.length}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups >= availableMembers.length
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
                            {group.leader}
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
                  // Use the shuffled groups
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
                  // Reset all groups
                  setGroups([
                    {
                      id: 1,
                      members: [],
                      leader: "",
                      showInputs: false,
                      isSaved: false,
                      wasPreviouslySaved: false,
                    },
                  ]);
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

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        space={
          currentSpace || {
            space_name: "Unknown Space",
            members: [],
            files: [],
            tasks: [],
          }
        }
      />

      {/* ARCHIVE CLASS CONFIRMATION DIALOG */}
      <ArchiveClassAlert
        isOpen={showArchiveDialog}
        onClose={handleCancelArchive}
        onConfirm={handleConfirmArchive}
        space={
          currentSpace || {
            space_name: "Unknown Class",
            members: [],
            files: [],
            tasks: [],
          }
        }
      />

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Position Cover Photo
              </h2>
              <button
                onClick={handleCoverPhotoCancel}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Gradient Options */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: currentColors.text }}>Color & Gradient</p>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded cursor-pointer border-2 transition-colors"
                      style={{ 
                        background: color,
                        borderColor: currentColors.border
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = currentColors.accent || '#3B82F6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = currentColors.border;
                      }}
                      onClick={() => handleGradientSelection(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Separator Line */}
              <div className="relative flex items-center my-4">
                <div className="flex-1 border-t" style={{ borderColor: currentColors.border }}></div>
                <span className="px-3 text-sm" style={{ color: currentColors.textSecondary }}>or</span>
                <div className="flex-1 border-t" style={{ borderColor: currentColors.border }}></div>
              </div>

              {/* Upload Option (only show when gradient is selected) */}
              {coverPhotoUrl && coverPhotoUrl.includes('gradient') && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => coverPhotoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      border: `1px solid ${currentColors.border}`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = currentColors.accent || '#3B82F6';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = currentColors.background;
                      e.target.style.color = currentColors.text;
                    }}
                  >
                    <FiUpload size={14} />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}

              {/* Preview Area (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <div className="mb-6">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden" style={{ backgroundColor: currentColors.background }}>
                    <div
                      ref={coverPhotoEditorRef}
                      className={`relative w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                      style={{
                        backgroundImage: `url(${coverPhotoUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: `center ${coverPhotoPosition}%`,
                        backgroundRepeat: "no-repeat",
                      }}
                      onMouseDown={handleMouseDown}
                    />
                    <div className="absolute inset-0 border-2 border-white/30 pointer-events-none" />
                    {isDragging && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        Dragging...
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                    Click and drag the image up or down to position it
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCoverPhotoCancel}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCoverPhotoSave}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COVER PHOTO CONFIRMATION DIALOG */}
      {showCoverPhotoConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo?
              </h2>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300">
                Do you want to change the cover photo for this space with the
                image you uploaded?
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCancelCoverPhoto}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCoverPhoto}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Change Cover Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING INVITATIONS POPUP */}
      {showPendingInvitations && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-xl shadow-2xl max-w-md w-full border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: currentColors.border }}>
              <h3 className="text-xl font-semibold" style={{ color: currentColors.text }}>
                Pending Invites
              </h3>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="transition-colors p-1 rounded-lg"
                style={{ color: currentColors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentColors.text;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentColors.textSecondary;
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Invitations List */}
            <div className="p-6">
              {joinRequestsData.length === 0 ? (
                <>
                  <p className="mb-4" style={{ color: currentColors.text }}>
                    No pending invitations at the moment.
                  </p>
                  <div className="text-sm" style={{ color: currentColors.textSecondary }}>
                    Invited members will appear here once they have not yet accepted your invitation.
                  </div>
                </>
              ) : (
                joinRequestsData.map((invitation) => (
                  <div
                    key={invitation.account_id}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.border,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={invitation.profile_pic}
                        alt={invitation.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: currentColors.text }}>
                          {invitation.fullname}
                        </h3>
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                          {invitation.email}
                        </p>
                        <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
                          {invitation.message || "Hello world"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                            {invitation.added_at}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          declineJoinRequest(invitation.account_id)
                        }
                        className="px-3 py-1.5 text-sm rounded-md transition disabled:opacity-50"
                        style={{
                          backgroundColor: '#6B7280',
                          color: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#4B5563';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#6B7280';
                        }}
                      >
                        Decline
                      </button>
                      <button
                        disabled={spaceLoading}
                        onClick={() =>
                          acceptJoinRequest(invitation.account_id)
                        }
                        className="px-3 py-1.5 text-sm rounded-md transition disabled:opacity-50"
                        style={{
                          backgroundColor: '#2563EB',
                          color: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1D4ED8';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#2563EB';
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end p-6 border-t" style={{ borderColor: currentColors.border }}>
              <button
                onClick={() => setShowPendingInvitations(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: currentColors.accent || '#3B82F6', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = currentColors.accentHover || '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = currentColors.accent || '#3B82F6';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfTaskPage;
