import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { useTasks } from "../../../hooks/useTasks";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import Sidebar from "../../component/sidebar";
import Button from "../../component/button_2";
import MainButton from "../../component/Button.jsx";
import Logout from "../../component/logout";
import AddMember from "../../component/AddMember";
import { DeleteConfirmationDialog } from "../../component/SweetAlert";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  FiLink,
  FiAlertTriangle,
  FiEdit3,
} from "react-icons/fi";
import { capitalizeWords } from "../../../utils/capitalizeFirstLetter";

const AdminTaskPage = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { user } = useUser();
  const { userSpaces, friendSpaces, courseSpaces } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Find current space
  const allSpaces = [
    ...(userSpaces || []),
    ...(friendSpaces || []),
    ...(courseSpaces || []),
  ];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );
  console.log("ACTIVE", currentSpace);

  const spaceName = capitalizeWords(currentSpace?.space_name) + "'s Space";
  const isOwnerSpace = currentSpace?.creator === user?.id;
  const isFriendSpace = !isOwnerSpace;

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskCategory, setTaskCategory] = useState("individual-activity");

  // Criteria management state
  const [criteria, setCriteria] = useState([
    { id: 1, name: "", description: "", points: "" },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCriteriaSection, setShowCriteriaSection] = useState(false);

  // Task management
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  // Add Member modal state
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  // Pending Invites modal state
  const [showPendingInvitations, setShowPendingInvitations] = useState(false);

  // Cover photo state
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [previousCoverPhotoUrl, setPreviousCoverPhotoUrl] = useState(null);
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

  // Delete Room modal state
  const [showDeleteRoom, setShowDeleteRoom] = useState(false);

  // Get tasks for current space
  const {
    uploadedTasksQuery,
    draftedTasksQuery,
    uploadTaskMutation,
    draftTaskMutation,
    updateTaskStatusMutation,
  } = useTasks(currentSpace?.space_id);

  const taskData = uploadedTasksQuery?.data || [];
  const draftActivities = draftedTasksQuery?.data || [];
  const uploadedTask = Array.isArray(taskData)
    ? taskData
    : taskData?.data || [];
  const draftedTask = Array.isArray(draftActivities)
    ? draftActivities
    : draftActivities?.data || [];

  // Task status styles
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    Missing: "border-[#FF5252] text-[#FF5252]",
  };

  const [openIndex, setOpenIndex] = useState(null);
  const [openDraftIndex, setOpenDraftIndex] = useState(null);

  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  // Task categories
  const taskCategories = [
    { value: "quiz", label: "Quiz", emoji: "�" },
    { value: "group-activity", label: "Group Activity", emoji: "👥" },
    { value: "individual-activity", label: "Individual Activity", emoji: "📝" },
  ];

  // Criteria templates
  const criteriaTemplates = {
    essay: [
      {
        name: "Content Quality",
        description: "Clarity, coherence, and depth of analysis",
        points: "30",
      },
      {
        name: "Research & Evidence",
        description: "Use of credible sources and proper citation",
        points: "25",
      },
      {
        name: "Organization",
        description: "Logical structure and flow of ideas",
        points: "20",
      },
      {
        name: "Grammar & Style",
        description: "Proper grammar, spelling, and academic writing style",
        points: "15",
      },
      {
        name: "Originality",
        description: "Original thinking and avoidance of plagiarism",
        points: "10",
      },
    ],
    research: [
      {
        name: "Research Question",
        description: "Clarity and significance of research question",
        points: "20",
      },
      {
        name: "Methodology",
        description: "Appropriate research methods and design",
        points: "25",
      },
      {
        name: "Data Analysis",
        description: "Proper analysis and interpretation of data",
        points: "25",
      },
      {
        name: "Literature Review",
        description: "Comprehensive review of relevant literature",
        points: "20",
      },
      {
        name: "Conclusions",
        description: "Logical conclusions based on findings",
        points: "10",
      },
    ],
    presentation: [
      {
        name: "Content",
        description: "Relevance and accuracy of content",
        points: "30",
      },
      {
        name: "Organization",
        description: "Clear structure and logical flow",
        points: "20",
      },
      {
        name: "Visual Aids",
        description: "Quality and effectiveness of visual materials",
        points: "20",
      },
      {
        name: "Delivery",
        description: "Clarity, confidence, and engagement",
        points: "20",
      },
      {
        name: "Time Management",
        description: "Appropriate pacing and time allocation",
        points: "10",
      },
    ],
    project: [
      {
        name: "Functionality",
        description: "Code works as intended without errors",
        points: "30",
      },
      {
        name: "Code Quality",
        description: "Clean, readable, and well-structured code",
        points: "25",
      },
      {
        name: "Documentation",
        description: "Clear and comprehensive documentation",
        points: "20",
      },
      {
        name: "Innovation",
        description: "Creative solutions and original thinking",
        points: "15",
      },
      {
        name: "Testing",
        description: "Thorough testing and error handling",
        points: "10",
      },
    ],
    creative: [
      {
        name: "Creativity",
        description: "Originality and innovative thinking",
        points: "30",
      },
      {
        name: "Technical Skill",
        description: "Execution and technical proficiency",
        points: "25",
      },
      {
        name: "Composition",
        description: "Balance, harmony, and visual appeal",
        points: "20",
      },
      {
        name: "Concept",
        description: "Clarity and strength of concept",
        points: "15",
      },
      {
        name: "Effort",
        description: "Time and effort invested in the work",
        points: "10",
      },
    ],
  };

  const getCategoryDisplay = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? `${category.emoji} ${category.label}` : "📝 Task";
  };

  // File handling functions
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast.error(
          "The file is too large to upload. Please choose a file smaller than 5MB.",
        );
        event.target.value = ""; // Clear the file input
        return;
      }

      setSelectedFile(file);
      await extractTextFromFile(file);
    }
  };

  const extractTextFromFile = async (file) => {
    try {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let extractedText = "";

      if (fileExtension === "pdf") {
        extractedText = await extractTextFromPDF(file);
      } else if (["doc", "docx"].includes(fileExtension)) {
        extractedText = await extractTextFromDocx(file);
      } else if (["ppt", "pptx"].includes(fileExtension)) {
        extractedText = await extractTextFromPptx(file);
      } else if (["xls", "xlsx"].includes(fileExtension)) {
        extractedText = await extractTextFromExcel(file);
      } else if (["txt", "text"].includes(fileExtension)) {
        extractedText = await extractTextFromText(file);
      }

      if (extractedText) {
        // Count words (split by whitespace and filter out empty strings)
        const wordCount = extractedText
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        const maxWordLimit = 1000;

        // Check if word count exceeds limit
        if (wordCount > maxWordLimit) {
          toast.error(
            `The file is too large to extract. It contains ${wordCount} words, but the maximum allowed is ${maxWordLimit} words. Please find your correct file task with shorter content.`,
          );
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setSelectedFile(null);
          return;
        }

        // If within word limit, set the content
        setInstruction(extractedText);
        if (instructionRef.current) {
          instructionRef.current.innerHTML = extractedText;
        }

        // Show success message with word count
        toast.success(
          `File content extracted successfully: ${wordCount} words`,
        );
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
      toast.error(
        "The file could not be processed. Please try a different file or check if the file is corrupted.",
      );
      // Clear the file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
    }
  };

  const extractTextFromPDF = async (file) => {
    // Simple PDF text extraction using FileReader as fallback
    // In a real implementation, you'd use a proper PDF library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // For now, return a placeholder indicating PDF content
        // In production, you'd parse the PDF content here
        const content = `[PDF Content from ${file.name}]\n\nThis is a placeholder for PDF text extraction. The file "${file.name}" has been uploaded and its content would be extracted here in a production environment with proper PDF parsing libraries.`;
        resolve(content);
      };
      reader.readAsText(file);
    });
  };

  const extractTextFromDocx = async (file) => {
    try {
      // Use mammoth library which is already installed
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("Error extracting DOCX:", error);
      return `[DOCX Content from ${file.name}]\n\nError extracting content from ${file.name}. Please ensure the file is a valid Word document.`;
    }
  };

  const extractTextFromPptx = async (file) => {
    // Simple PPTX text extraction using FileReader as fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // For now, return a placeholder indicating PPTX content
        // In production, you'd parse the PPTX content here
        const content = `[PPTX Content from ${file.name}]\n\nThis is a placeholder for PowerPoint text extraction. The file "${file.name}" has been uploaded and its content would be extracted here in a production environment with proper PPTX parsing libraries.`;
        resolve(content);
      };
      reader.readAsText(file);
    });
  };

  const extractTextFromExcel = async (file) => {
    try {
      // Use xlsx library which is already installed
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      let extractedText = "";

      // Iterate through all sheets
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_txt(worksheet);
        extractedText += `Sheet: ${sheetName}\n${jsonData}\n\n`;
      });

      return `[Excel Content from ${file.name}]\n\n${extractedText}`;
    } catch (error) {
      console.error("Error extracting Excel:", error);
      return `[Excel Content from ${file.name}]\n\nError extracting content from ${file.name}. Please ensure the file is a valid Excel document.`;
    }
  };

  const extractTextFromText = async (file) => {
    // Plain text extraction implementation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  // Missing functions implementation
  const handleStatusChange = (index, newStatus) => {
    // This would update the task status in the backend
    console.log(`Updating task ${index} status to ${newStatus}`);
    // Implementation would depend on your API structure
  };

  const applyTemplate = (templateType) => {
    const template = criteriaTemplates[templateType];
    if (template) {
      const newCriteria = template.map((criterion, index) => ({
        id: Date.now() + index,
        name: criterion.name,
        description: criterion.description,
        points: criterion.points,
      }));
      setCriteria(newCriteria);
      setShowTemplates(false);
      setShowCriteriaSection(true);
    }
  };

  const clearCriteria = () => {
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
    setShowTemplates(false);
    setShowCriteriaSection(false);
  };

  const addCriteria = () => {
    const newId = Math.max(...criteria.map((c) => c.id), 0) + 1;
    const newCriteria = [
      ...criteria,
      { id: newId, name: "", description: "", points: "" },
    ];
    setCriteria(newCriteria);

    // Redistribute score if total score is set
    if (score && newCriteria.length > 0) {
      distributeScoreAmongCriteria(score);
    }
  };

  const removeCriteria = (id) => {
    if (criteria.length > 1) {
      const newCriteria = criteria.filter((c) => c.id !== id);
      setCriteria(newCriteria);

      // Redistribute score if total score is set
      if (score && newCriteria.length > 0) {
        distributeScoreAmongCriteria(score);
      }
    }
  };

  const updateCriteria = (id, field, value) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  // Auto-distribute score among criteria
  const distributeScoreAmongCriteria = (totalScore) => {
    if (!totalScore || criteria.length === 0) return;

    const score = parseFloat(totalScore);
    if (isNaN(score) || score <= 0) return;

    const pointsPerCriteria = score / criteria.length;
    const updatedCriteria = criteria.map((criterion) => ({
      ...criterion,
      points: pointsPerCriteria.toFixed(2),
    }));

    setCriteria(updatedCriteria);
  };

  // Handle score change with auto-distribution
  const handleScoreChange = (newScore) => {
    setScore(newScore);
    if (newScore && criteria.length > 0) {
      distributeScoreAmongCriteria(newScore);
    }
  };

  // Effects
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

  const resetTaskForm = () => {
    setTaskTitle("");
    setInstruction("");
    setScore("");
    setDueDate("");
    setSelectedFile(null);
    setTaskCategory("individual-act");
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
    if (instructionRef.current) {
      instructionRef.current.innerHTML = "";
    }
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  // Add Member functions
  const handleInviteMember = () => {
    setShowInvitePopup(true);
  };

  // Pending Invites functions
  const handlePendingInvites = () => {
    setShowPendingInvites(true);
  };

  // Delete Room functions
  const handleDeleteRoom = () => {
    setShowDeleteRoom(true);
  };

  const confirmDeleteRoom = () => {
    // Here you would implement the actual delete logic
    toast.success(`Room "${currentSpace?.space_name}" has been deleted.`);
    setShowDeleteRoom(false);
    // Navigate back to spaces or home page
    navigate("/spaces");
  };

  // Copy link function
  const handleCopyLink = (space_link) => {
    navigator.clipboard
      .writeText(space_link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy link");
      });
  };

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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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
        setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
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

  const handleConfirmCoverPhoto = () => {
    // Create canvas to apply transformations
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to cover photo dimensions
      canvas.width = 1200;
      canvas.height = 400;
      
      // Calculate scale to cover the entire canvas
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Calculate position based on user vertical positioning
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);
      
      // Draw the image with transformations
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert to data URL and update
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCoverPhotoUrl(dataUrl);
      
      // Save to localStorage
      localStorage.setItem(`coverPhoto_${space_uuid}`, dataUrl);
      
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);
      
      toast.success("Cover photo updated successfully!");
    };
    
    img.src = coverPhotoUrl;
  };

  const handleCancelCoverPhoto = () => {
    setShowCoverPhotoConfirm(false);
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setCoverPhoto(null);
    // Restore previous cover photo URL
    setCoverPhotoUrl(previousCoverPhotoUrl);
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  // Handle gradient selection for cover photo
  const handleGradientSelection = (gradient) => {
    setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
    setCoverPhotoUrl(gradient);
    setShowCoverPhotoEditor(false); // Close editor since gradients don't need positioning
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

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
    const newPosition = Math.max(0, Math.min(100, dragStartPosition - positionChange));
    
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
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  // Load saved cover photo on component mount
  useEffect(() => {
    const savedCoverPhoto = localStorage.getItem(`coverPhoto_${space_uuid}`);
    if (savedCoverPhoto) {
      setCoverPhotoUrl(savedCoverPhoto);
    }
  }, [space_uuid]);

  // Save cover photo to localStorage when it changes
  useEffect(() => {
    if (coverPhotoUrl && !showCoverPhotoEditor) {
      localStorage.setItem(`coverPhoto_${space_uuid}`, coverPhotoUrl);
    }
  }, [coverPhotoUrl, space_uuid, showCoverPhotoEditor]);

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:block lg:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>
      <div className="flex-1 flex flex-col w-full">
        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
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
        <div className="lg:hidden h-16" />
        {/* ================= COVER ================= */}
        <div 
          className="relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          onClick={handleCoverPhotoClick}
        >
          {coverPhotoUrl ? (
            <>
              {coverPhotoUrl.includes('gradient') ? (
                <div
                  className="w-full h-full"
                  style={{ background: coverPhotoUrl }}
                />
              ) : (
                <img 
                  src={coverPhotoUrl} 
                  alt="Space Cover" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
              {isOwnerSpace && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUploadCloud size={16} />
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
                    <FiUploadCloud size={16} />
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
                  <div onClick={handlePendingInvites}>
                    <Button text="Pending Invites" />
                  </div>
                  <div onClick={handleDeleteRoom}>
                    <Button text="Delete Room" />
                  </div>
                </>
              )}
              {isFriendSpace && (
                <div className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: currentColors.surface }}>
                  <span className="text-xs text-blue-400 break-all">
                    {currentSpace?.space_link || "Loading..."}
                  </span>
                  <button
                    onClick={() => handleCopyLink(currentSpace?.space_link)}
                    className="p-1 rounded transition-colors"
                    style={{ color: currentColors.textSecondary }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = currentColors.hover;
                      e.target.style.color = currentColors.text;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = currentColors.textSecondary;
                    }}
                    title="Copy to clipboard"
                  >
                    <FiCopy size={16} />
                  </button>
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
                <button className="font-semibold border-b-2 pb-2" style={{ borderColor: currentColors.text }}>
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
              <div onClick={handlePendingInvites}>
                <Button text="Pending Invites" />
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
                  className="ml-auto px-4 py-2 rounded-lg text-sm font-medium block mb-6 flex items-center gap-2"
                  style={{ backgroundColor: currentColors.accent, color: 'white' }}
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
                        className="border-b hover:transition-colors"
                        style={{ borderColor: currentColors.border }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.hover}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <td className="py-3 px-4">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenIndex(openIndex === index ? null : index)
                              }
                              className={`px-4 py-1 rounded-full text-sm ${statusStyles[task.task_status]}`}
                              style={{ backgroundColor: currentColors.text, color: 'white' }}
                            >
                              {task.task_status} ▼
                            </button>

                            {openIndex === index && (
                              <div 
                                className="absolute left-0 mt-2 w-44 rounded-lg p-3 z-50 shadow-lg"
                                style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, border: '1px solid' }}
                              >
                                <div className="flex flex-col gap-2">
                                  {Object.keys(statusStyles).map((st) => (
                                    <button
                                      key={st}
                                      onClick={() =>
                                        handleStatusChange(index, st)
                                      }
                                      className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 whitespace-nowrap`}
                                      style={{ backgroundColor: currentColors.text, color: 'white' }}
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
                            className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: currentColors.accent, color: 'white' }}
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
                    className="border rounded-xl p-4"
                    style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
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
                        className={`px-3 py-1 rounded-full text-xs ${statusStyles[task.task_status]}`}
                        style={{ backgroundColor: currentColors.text, color: 'white' }}
                      >
                        {task.task_status}
                      </button>
                    </div>

                    <p className="text-sm text-gray-400">
                      Deadline:{" "}
                      <span style={{ color: currentColors.text }}>
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
                        className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: currentColors.accent, color: 'white' }}
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
                          className="border-b hover:transition-colors"
                          style={{ borderColor: currentColors.border }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.hover}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <td className="py-3 px-4">
                            <span
                              className="px-6 py-1 rounded-full text-sm font-bold min-w-[120px] text-center"
                              style={{ backgroundColor: currentColors.text, color: currentColors.textSecondary, border: `2px solid ${currentColors.border}` }}
                            >
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
                              className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: currentColors.accent, color: 'white' }}
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
                      className="border rounded-xl p-4"
                      style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-semibold">
                          {draft.task_title}
                        </p>

                        <span className="px-3 py-1 rounded-full text-xs border-2 font-bold"
                          style={{ backgroundColor: currentColors.text, color: currentColors.textSecondary, borderColor: currentColors.border }}>
                          Draft
                        </span>
                      </div>

                      <p className="text-xs text-gray-400">
                        Deadline:{" "}
                        <span style={{ color: currentColors.text }}>
                          {new Date(draft.task_due).toLocaleDateString("en-US")}
                        </span>
                      </p>

                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <a
                          href="/prof-task-view"
                          className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: currentColors.accent, color: 'white' }}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
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
              <div className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8" 
                   style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, border: '1px solid' }}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-4">
                    <label className="font-semibold text-lg">
                      Title: <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                      style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                      placeholder="Enter task title"
                    />

                    {/* Task Category */}
                    <label className="font-semibold">
                      Category: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500 w-full"
                      style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
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
                    <div className="rounded-lg border focus-within:border-blue-500"
                         style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                      <div
                        ref={instructionRef}
                        contentEditable
                        className="min-h-[140px] px-4 py-3 outline-none"
                        style={{ color: currentColors.text }}
                        suppressContentEditableWarning
                      />
                      <div className="border-t" style={{ borderColor: currentColors.border }} />
                      <div className="flex gap-4 px-4 py-2" style={{ color: currentColors.textSecondary }}>
                        <button
                          type="button"
                          onClick={() => applyFormat("bold")}
                          className="transition-colors"
                          style={{ color: currentColors.textSecondary }}
                          onMouseEnter={(e) => e.target.style.color = currentColors.text}
                          onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                        >
                          <FiBold />
                        </button>

                        <button
                          type="button"
                          onClick={() => applyFormat("italic")}
                          className="transition-colors"
                          style={{ color: currentColors.textSecondary }}
                          onMouseEnter={(e) => e.target.style.color = currentColors.text}
                          onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                        >
                          <FiItalic />
                        </button>

                        <button
                          type="button"
                          onClick={() => applyFormat("underline")}
                          className="transition-colors"
                          style={{ color: currentColors.textSecondary }}
                          onMouseEnter={(e) => e.target.style.color = currentColors.text}
                          onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                        >
                          <FiUnderline />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    <label className="font-semibold">
                      Score: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                      style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                      placeholder="Enter score"
                    />
                    {score && criteria.length > 0 && (
                      <div className="text-xs text-green-400 mt-1">
                        ✓ Auto-distributed:{" "}
                        {(parseFloat(score) / criteria.length).toFixed(2)}{" "}
                        points per criterion
                      </div>
                    )}

                    <label className="font-semibold">
                      Due Date: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                      style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                    />

                    <label className="font-semibold">File (optional)</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, border: '1px solid' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.hover}
                          onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.surface}
                        >
                          <FiUploadCloud size={16} />
                          Choose File
                        </button>
                        {selectedFile && (
                          <span className="text-sm text-gray-400">
                            {selectedFile.name}
                          </span>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx,.txt,.text"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Accepted formats: DOC, DOCX, PDF, PPT, PPTX, XLS, XLSX,
                        TXT | Max size: 5MB | Max content: 1000 words
                      </div>
                    </div>

                    {/* Criteria/Rubrics Section */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold">
                          Scoring Criteria:
                        </label>
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
                            onClick={() =>
                              setShowCriteriaSection(!showCriteriaSection)
                            }
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            {showCriteriaSection ? "Hide" : "Manual"} Criteria
                          </button>
                        </div>
                      </div>

                      {/* Auto-distribution explanation */}
                      {score && score !== "" && (
                        <div className="p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="text-green-400 mt-0.5">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="text-sm">
                              <p className="text-green-300 font-medium mb-1">
                                Automatic Score Distribution
                              </p>
                              <p className="text-gray-400 text-xs leading-relaxed">
                                Total score ({score}) is automatically
                                distributed equally among {criteria.length}{" "}
                                criteria. Each criterion receives{" "}
                                {(parseFloat(score) / criteria.length).toFixed(
                                  2,
                                )}{" "}
                                points.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template Selection */}
                      {showTemplates && (
                        <div className="bg-[#23272F] rounded-lg p-4 border border-purple-600">
                          <h4 className="text-sm font-semibold text-purple-400 mb-3">
                            Choose a Template:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => applyTemplate("essay")}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">
                                📝 Essay
                              </div>
                              <div className="text-xs text-gray-400">
                                For written essays and compositions
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("research")}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">
                                🔬 Research Paper
                              </div>
                              <div className="text-xs text-gray-400">
                                For academic research and analysis
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("presentation")}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">
                                🎤 Presentation
                              </div>
                              <div className="text-xs text-gray-400">
                                For oral presentations and demos
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("project")}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">
                                💻 Project
                              </div>
                              <div className="text-xs text-gray-400">
                                For coding and development projects
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate("creative")}
                              className="p-3 bg-[#161A20] rounded-lg hover:bg-[#1E222A] transition text-left border border-gray-600 hover:border-purple-500"
                            >
                              <div className="font-medium text-white">
                                🎨 Creative
                              </div>
                              <div className="text-xs text-gray-400">
                                For artistic and creative works
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={clearCriteria}
                              className="p-3 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition text-left border border-red-600/50 hover:border-red-500"
                            >
                              <div className="font-medium text-red-400">
                                🗑️ Clear All
                              </div>
                              <div className="text-xs text-red-300">
                                Remove all criteria
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {showCriteriaSection && (
                        <div className="bg-[#23272F] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-blue-400">
                              {criteria.some((c) => c.name.trim())
                                ? "Current Criteria:"
                                : "Add Your Criteria:"}
                            </h4>
                            {criteria.some((c) => c.name.trim()) && (
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
                              <div
                                key={criterion.id}
                                className="bg-[#161A20] rounded-lg p-3 border border-gray-600"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-blue-400">
                                    Criteria {index + 1}
                                  </span>
                                  {criteria.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCriteria(criterion.id)
                                      }
                                      className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>

                                <input
                                  type="text"
                                  value={criterion.name}
                                  onChange={(e) =>
                                    updateCriteria(
                                      criterion.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Criteria name (e.g., Content Quality)"
                                  className="w-full bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500"
                                />

                                <textarea
                                  value={criterion.description}
                                  onChange={(e) =>
                                    updateCriteria(
                                      criterion.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Description (optional)"
                                  rows={2}
                                  className="w-full bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 resize-none"
                                />

                                <input
                                  type="number"
                                  value={criterion.points}
                                  onChange={(e) =>
                                    updateCriteria(
                                      criterion.id,
                                      "points",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Points"
                                  min="0"
                                  step="0.5"
                                  className="w-full bg-[#1E222A] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500"
                                  readOnly={score && score !== ""}
                                  title={
                                    score && score !== ""
                                      ? "Points are automatically distributed from total score"
                                      : "Enter total score above to auto-distribute points"
                                  }
                                />
                                {score && score !== "" && (
                                  <div className="text-xs text-green-400 mt-1">
                                    Auto-calculated from total score
                                  </div>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={addCriteria}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                            >
                              + Add Criteria
                            </button>
                          </div>
                        </div>
                      )}

                      {/* FORM BUILDER SECTION */}
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="flex justify-between items-center">
                          <label className="font-semibold">
                            Activity Form Builder:
                          </label>
                          <button
                            onClick={() => {
                              // Store task data in sessionStorage for form builder
                              sessionStorage.setItem(
                                "taskFormData",
                                JSON.stringify({
                                  title: taskTitle,
                                  instruction: instruction,
                                }),
                              );
                              navigate(
                                `/space/${space_uuid}/${space_name}/form-builder`,
                              );
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <FiEdit3 size={16} />
                            Open Form Builder
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Create custom questions for members to answer when
                          submitting this task
                        </p>
                        <div className="text-xs text-blue-400 mt-1">
                          💡 Members can upload files if you enable "Allow
                          member attachments" in the form builder
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    onClick={() => {
                      resetTaskForm();
                      setIsCreatingTask(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    onClick={() => {
                      // Handle task creation logic here
                      console.log("Creating task:", {
                        taskTitle,
                        instruction,
                        score,
                        dueDate,
                        taskCategory,
                        criteria,
                      });
                      setIsCreatingTask(false);
                    }}
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INVITE POPUP */}
      <AddMember
        currentSpace={currentSpace}
        showInvitePopup={showInvitePopup}
        setShowInvitePopup={setShowInvitePopup}
      />

      {/* PENDING INVITES MODAL */}
      {showPendingInvites && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                Pending Invites
              </h3>
              <button
                onClick={() => setShowPendingInvites(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                No pending invitations at the moment.
              </p>
              <div className="text-sm text-gray-500">
                Invited members will appear here once they haven't accepted your
                invitation yet.
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-700">
              <button
                onClick={() => setShowPendingInvites(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ROOM MODAL */}
      <DeleteConfirmationDialog
        isOpen={showDeleteRoom}
        onClose={() => setShowDeleteRoom(false)}
        onConfirm={confirmDeleteRoom}
        space={{
          space_name: currentSpace?.space_name || "Unknown Space",
          members: currentSpace?.members || [],
          files: currentSpace?.files || [],
          tasks: uploadedTask || [],
        }}
      />

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo
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
                <p className="text-sm font-medium text-white mb-3">Color & Gradient</p>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded cursor-pointer border-2 border-gray-600 hover:border-blue-500 transition-colors"
                      style={{ background: color }}
                      onClick={() => handleGradientSelection(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Image Positioning (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-white mb-3">Position Image</p>
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      ref={coverPhotoEditorRef}
                      className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                      style={{
                        backgroundImage: `url(${coverPhotoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: `center ${coverPhotoPosition}%`,
                        backgroundRepeat: 'no-repeat',
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
                  <p className="text-sm text-gray-400 mt-2">
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
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <button
                  onClick={handleCoverPhotoSave}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                >
                  Apply
                </button>
              )}
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
              <h3 className="text-lg font-semibold text-white">
                Confirm Cover Photo
              </h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300 mb-4">
                Are you sure you want to apply this cover photo?
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskPage;
