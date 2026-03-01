import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useTasks } from "../../hooks/useTasks";
import { useSpaceTheme } from "../../contexts/theme/spaceThemeContextProvider";
import { hardcodedLessons } from "./UserFilesShared.jsx";
import Sidebar from "../component/sidebar";
import Button from "../component/button_2";
import MainButton from "../component/Button.jsx";
import Logout from "../component/logout";
import AddMember from "../component/AddMember";
import { DeleteConfirmationDialog } from "../component/SweetAlert";
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
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";

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

  // Form builder state
  const [formFields, setFormFields] = useState([]);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState("text");

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

  // Quick task creation modal state
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickLessonUnder, setQuickLessonUnder] = useState("");
  const [quickTaskCategory, setQuickTaskCategory] = useState("quiz");
  const [quickTaskErrors, setQuickTaskErrors] = useState({
    quickTaskTitle: "",
    quickLessonUnder: ""
  });
  const [lessons, setLessons] = useState(hardcodedLessons.map(lesson => lesson.name));

  // Exam filter state
  const [examFilter, setExamFilter] = useState("all"); // "all", "prelim", "midterm", "prefinals", "finals"

  // Function to filter tasks by exam type
  const filterTasksByExam = (tasks) => {
    if (examFilter === "all") return tasks;
    
    return tasks.filter(task => {
      const lessonUnder = task.lessonUnder?.toLowerCase() || "";
      switch (examFilter) {
        case "prelim":
          return lessonUnder.includes("prelim");
        case "midterm":
          return lessonUnder.includes("midterm");
        case "prefinals":
          return lessonUnder.includes("prefinals");
        case "finals":
          return lessonUnder.includes("finals");
        default:
          return true;
      }
    });
  };

  // Add Member modal state
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  // Pending Invites modal state
  const [showPendingInvites, setShowPendingInvites] = useState(false);

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

  // Form field types
  const fieldTypes = [
    { value: "text", label: "Short Answer", icon: "📝" },
    { value: "textarea", label: "Long Answer", icon: "📄" },
    { value: "multiple-choice", label: "Multiple Choice", icon: "🔘" },
    { value: "checkbox", label: "Checkbox", icon: "☑️" },
    { value: "number", label: "Number", icon: "🔢" },
    { value: "date", label: "Date", icon: "📅" },
  ];

  // Criteria templates
  const criteriaTemplates = {
    quiz: [
      {
        name: "Correct Answers",
        description: "Accuracy of responses and correct solutions",
        points: "40",
      },
      {
        name: "Understanding",
        description: "Demonstration of concept comprehension",
        points: "30",
      },
      {
        name: "Problem Solving",
        description: "Ability to apply knowledge to solve problems",
        points: "20",
      },
      {
        name: "Clarity",
        description: "Clear and organized presentation of answers",
        points: "10",
      },
    ],
    "individual-activity": [
      {
        name: "Content Quality",
        description: "Depth, accuracy, and relevance of content",
        points: "30",
      },
      {
        name: "Critical Thinking",
        description: "Analysis, evaluation, and independent thought",
        points: "25",
      },
      {
        name: "Organization",
        description: "Structure, coherence, and logical flow",
        points: "20",
      },
      {
        name: "Completeness",
        description: "Thoroughness and attention to requirements",
        points: "15",
      },
      {
        name: "Presentation",
        description: "Clarity, formatting, and professional appearance",
        points: "10",
      },
    ],
    "group-activity": [
      {
        name: "Collaboration",
        description: "Teamwork, communication, and cooperation",
        points: "25",
      },
      {
        name: "Content Quality",
        description: "Accuracy, depth, and relevance of work",
        points: "25",
      },
      {
        name: "Individual Contribution",
        description: "Each member's participation and effort",
        points: "20",
      },
      {
        name: "Process & Planning",
        description: "Organization, time management, and workflow",
        points: "15",
      },
      {
        name: "Final Output",
        description: "Quality and completeness of the final deliverable",
        points: "15",
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

  // Form builder functions
  const addFormField = () => {
    const newField = {
      id: Date.now(),
      type: selectedFieldType,
      label: "",
      required: false,
      options: selectedFieldType === "multiple-choice" ? ["", ""] : [],
    };
    setFormFields([...formFields, newField]);
  };

  const updateFormField = (id, field, value) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, [field]: value } : field
      )
    );
  };

  const removeFormField = (id) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  const addOption = (fieldId) => {
    setFormFields(
      formFields.map((field) =>
        field.id === fieldId
          ? { ...field, options: [...field.options, ""] }
          : field
      )
    );
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFormFields(
      formFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.map((option, index) =>
                index === optionIndex ? value : option
              ),
            }
          : field
      )
    );
  };

  const removeOption = (fieldId, optionIndex) => {
    setFormFields(
      formFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.filter((_, index) => index !== optionIndex),
            }
          : field
      )
    );
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
      
      // Update innerHTML when instruction state changes
      if (instruction !== instructionRef.current.innerHTML) {
        instructionRef.current.innerHTML = instruction;
      }
      
      return () => {
        instructionRef.current?.removeEventListener("input", handleInput);
      };
    }
  }, [instruction, isCreatingTask]);

  const resetTaskForm = () => {
    setTaskTitle("");
    setInstruction("");
    setScore("");
    setDueDate("");
    setSelectedFile(null);
    setTaskCategory("individual-activity");
    setFormFields([]);
    setShowFormBuilder(false);
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

  // Quick Task Creation functions
  const clearQuickTaskError = (field) => {
    setQuickTaskErrors(prev => ({
      ...prev,
      [field]: ""
    }));
  };

  const handleQuickTaskCreate = () => {
    // Clear previous errors
    const newErrors = {
      quickTaskTitle: "",
      quickLessonUnder: ""
    };
    
    let hasErrors = false;

    // Validate required fields
    if (!quickTaskTitle.trim()) {
      newErrors.quickTaskTitle = "Task title is required";
      hasErrors = true;
    } else if (quickTaskTitle.trim().length < 3) {
      newErrors.quickTaskTitle = "Title must be at least 3 characters long";
      hasErrors = true;
    }

    if (!quickLessonUnder.trim()) {
      newErrors.quickLessonUnder = "Lesson under is required";
      hasErrors = true;
    }

    // Set errors if any
    if (hasErrors) {
      setQuickTaskErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setQuickTaskErrors({
      quickTaskTitle: "",
      quickLessonUnder: ""
    });

    // Store task data in localStorage for the next page
    const taskData = {
      taskTitle: quickTaskTitle,
      lessonUnder: quickLessonUnder,
      taskCategory: quickTaskCategory,
      instruction: "",
      score: "",
      dueDate: "",
      selectedFile: null,
      criteria: [{ id: 1, name: "", description: "", points: "" }]
    };
    localStorage.setItem("taskFormData", JSON.stringify(taskData));

    // Navigate to CreateActivityForm
    navigate(`/space/${space_uuid}/${space_name}/create-activity`);

    // Reset modal state
    setShowQuickTaskModal(false);
    setQuickTaskTitle("");
    setQuickLessonUnder("");
    setQuickTaskCategory("quiz");
    setQuickTaskErrors({
      quickTaskTitle: "",
      quickLessonUnder: ""
    });
  };

  const confirmDeleteRoom = () => {
    // Here you would implement the actual delete logic
    toast.success(`Room "${currentSpace?.space_name}" has been deleted.`);
    setShowDeleteRoom(false);
    // Navigate back to spaces or home page
    navigate("/spaces");
  };

  useEffect(() => {
      const stored = localStorage.getItem("saved-form")
  
      if (stored) {
        try {
          const savedData = JSON.parse(stored);
          setTaskTitle(savedData.taskTitle || "");
          setInstruction(savedData.instruction || "");
          setIsCreatingTask(true);
          // Set the innerHTML after a short delay to ensure the ref is available
          setTimeout(() => {
            if (instructionRef.current && savedData.instruction) {
              instructionRef.current.innerHTML = savedData.instruction;
            }
          }, 0);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
  
    }, [])

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
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
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-32 sm:h-40 md:h-48">
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="p-4 sm:p-6">
          <div className="hidden md:block mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{spaceName}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                ({currentSpace?.members?.length || 0} member(s))
              </span>
              {isOwnerSpace && (
                <div className="flex flex-wrap gap-2">
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
              {isFriendSpace && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
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
              <div className="flex justify-center space-x-6 sm:space-x-8 md:space-x-12">
                <button
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}`)}
                  className="px-3 py-2 text-sm sm:text-base hover:opacity-80 transition-opacity"
                >
                  Stream
                </button>
                <button 
                  className="px-3 py-2 text-sm sm:text-base font-semibold border-b-2 pb-2 hover:opacity-80 transition-opacity" 
                  style={{ borderColor: currentColors.text }}
                >
                  Tasks
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/files`)
                  }
                  className="px-3 py-2 text-sm sm:text-base hover:opacity-80 transition-opacity"
                >
                  Files
                </button>
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/people`)
                  }
                  className="px-3 py-2 text-sm sm:text-base hover:opacity-80 transition-opacity"
                >
                  People
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Add Member Button */}
          {isOwnerSpace && (
            <div className="md:hidden flex flex-col sm:flex-row sm:justify-end gap-2 mb-6 px-2 sm:px-0">
              <div onClick={handleInviteMember} className="w-full sm:w-auto">
                <Button text="Add Member" />
              </div>
              <div onClick={handlePendingInvites} className="w-full sm:w-auto">
                <Button text="Pending Invites" />
              </div>
              <div onClick={handleDeleteRoom} className="w-full sm:w-auto">
                <Button text="Delete Room" />
              </div>
            </div>
          )}

          {/* TASKS LIST VIEW */}
            <div className="max-w-5xl mx-auto">
              {isOwnerSpace && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  {/* Exam Filter - Left Side */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: currentColors.text, fontSize: '0.65rem' }}>
                        Filter:
                      </span>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {[
                          { value: "all", label: "All" },
                          { value: "prelim", label: "Prelim" },
                          { value: "midterm", label: "Midterm" },
                          { value: "prefinals", label: "Prefinals" },
                          { value: "finals", label: "Finals" }
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setExamFilter(filter.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                              examFilter === filter.value
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: currentColors.textSecondary, fontSize: '0.6rem' }}>
                        {filterTasksByExam(uploadedTask).length} of {uploadedTask.length}
                      </span>
                      {examFilter !== "all" && (
                        <button
                          onClick={() => setExamFilter("all")}
                          className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
                          style={{ fontSize: '0.65rem' }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Create Task Button - Right Side */}
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                    onClick={() => setShowQuickTaskModal(true)}
                  >
                    <FiFileText size={16} />
                    Create Task
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold">Assigned Tasks</h2>
              </div>

              {/* Desktop/Tablet Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-600 text-gray-400 text-left">
                      <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Status</th>
                      <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Task Name</th>
                      <th className="py-3 px-2 sm:px-4 text-sm sm:text-base hidden lg:table-cell">Deadline</th>
                      <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterTasksByExam(uploadedTask)?.map((task, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#1E222A]"
                      >
                        <td className="py-3 px-2 sm:px-4">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenIndex(openIndex === index ? null : index)
                              }
                              className={`px-2 sm:px-4 py-1 rounded-full bg-black text-xs sm:text-sm ${statusStyles[task.task_status]}`}
                            >
                              {task.task_status} ▼
                            </button>

                            {openIndex === index && (
                              <div className="absolute left-0 mt-2 w-40 sm:w-44 bg-[#1E222A] border border-gray-700 rounded-lg p-2 sm:p-3 z-50 shadow-lg">
                                <div className="flex flex-col gap-1 sm:gap-2">
                                  {Object.keys(statusStyles).map((st) => (
                                    <button
                                      key={st}
                                      onClick={() => {
                                        handleStatusChange(index, st);
                                        setOpenIndex(null);
                                      }}
                                      className={`w-full text-center px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-black text-xs sm:text-sm font-medium hover:opacity-90 whitespace-nowrap ${statusStyles[st]}`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                            <span className="text-sm sm:text-lg flex-shrink-0">
                              {getCategoryDisplay(task.task_category)}
                            </span>

                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {task.task_title}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                          <span className="text-xs sm:text-sm">
                            {new Date(task.task_due).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <MainButton
                            className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium w-full sm:w-auto"
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
              <div className="sm:hidden space-y-3 sm:space-y-4 px-2 sm:px-0">
                {filterTasksByExam(uploadedTask)?.map((task, index) => (
                  <div
                    key={index}
                    className="bg-[#1B1F26] border border-gray-700 rounded-xl p-3 sm:p-4 shadow-sm"
                  >
                    {/* Task Name Section */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-400 mb-1">Task Name</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg flex-shrink-0">
                          {getCategoryDisplay(task.task_category)}
                        </span>
                        <span className="text-sm sm:text-base font-semibold truncate">
                          {task.task_title}
                        </span>
                      </div>
                    </div>

                    {/* Status and Deadline Row */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      {/* Status Section */}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-400 mb-1">Status</p>
                        <button
                          onClick={() =>
                            setOpenIndex(openIndex === index ? null : index)
                          }
                          className={`px-2 py-1 rounded-full bg-black text-xs flex-shrink-0 ${statusStyles[task.task_status]}`}
                        >
                          {task.task_status}
                        </button>
                      </div>

                      {/* Deadline Section */}
                      <div className="flex-1 text-right">
                        <p className="text-xs font-medium text-gray-400 mb-1">Deadline</p>
                        <p className="text-sm text-white">
                          {new Date(task.task_due).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-xs font-medium text-gray-400 mb-2">Details</p>
                      <MainButton
                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium w-full"
                        onClick={() =>
                          navigate(
                            `/task/${currentSpace?.space_uuid}/${currentSpace?.space_name}/${task.task_title}`,
                          )
                        }
                      >
                        View Task
                      </MainButton>
                    </div>

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

                {/* Desktop/Tablet Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-600 text-gray-400 text-left">
                        <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Status</th>
                        <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Task Name</th>
                        <th className="py-3 px-2 sm:px-4 text-sm sm:text-base hidden lg:table-cell">Deadline</th>
                        <th className="py-3 px-2 sm:px-4 text-sm sm:text-base">Details</th>
                      </tr>
                    </thead>

                    <tbody>
                      {draftedTask?.map((draft, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-700 hover:bg-[#1E222A]"
                        >
                          <td className="py-3 px-2 sm:px-4">
                            <span className="px-3 sm:px-6 py-1 rounded-full bg-black text-xs sm:text-sm font-bold border-2 border-gray-500 text-gray-400 inline-block min-w-[100px] sm:min-w-[120px] text-center">
                              Draft
                            </span>
                          </td>

                          <td className="py-3 px-2 sm:px-4">
                            <span className="text-xs sm:text-sm truncate block max-w-[150px] sm:max-w-none">
                              {draft.task_title}
                            </span>
                          </td>

                          <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                            <span className="text-xs sm:text-sm">
                              {new Date(draft.task_due).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                },
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4">
                            <a
                              href="/prof-task-view"
                              className="block w-full text-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium"
                            >
                              View Details
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3 sm:space-y-4 px-2 sm:px-0">
                  {draftedTask?.map((draft, index) => (
                    <div
                      key={index}
                      className="bg-[#1B1F26] border border-gray-700 rounded-xl p-3 sm:p-4 shadow-sm"
                    >
                      {/* Task Name Section */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-400 mb-1">Task Name</p>
                        <p className="text-sm font-semibold truncate">
                          {draft.task_title}
                        </p>
                      </div>

                      {/* Status and Deadline Row */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        {/* Status Section */}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-400 mb-1">Status</p>
                          <span className="px-3 py-1 rounded-full bg-black text-xs border-2 border-gray-500 text-gray-400 font-bold inline-block">
                            Draft
                          </span>
                        </div>

                        {/* Deadline Section */}
                        <div className="flex-1 text-right">
                          <p className="text-xs font-medium text-gray-400 mb-1">Deadline</p>
                          <p className="text-sm text-white">
                            {new Date(draft.task_due).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="border-t border-gray-700 pt-3">
                        <p className="text-xs font-medium text-gray-400 mb-2">Details</p>
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

      {/* QUICK TASK CREATION MODAL */}
      {showQuickTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4"
            style={{ backgroundColor: currentColors.surface, border: `1px solid ${currentColors.border}` }}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: currentColors.text }}>
              Create New Task
            </h3>
            
            <div className="space-y-4">
              {/* Title Activity */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentColors.text }}>
                  Title Activity: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={quickTaskTitle}
                  onChange={(e) => {
                    setQuickTaskTitle(e.target.value);
                    clearQuickTaskError('quickTaskTitle');
                  }}
                  className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors text-sm ${
                    quickTaskErrors.quickTaskTitle ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                  }`}
                  style={{ 
                    backgroundColor: currentColors.background, 
                    borderColor: quickTaskErrors.quickTaskTitle ? '#ef4444' : currentColors.border,
                    color: currentColors.text
                  }}
                  placeholder="Enter task title"
                />
                {quickTaskErrors.quickTaskTitle && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiX size={12} />
                    {quickTaskErrors.quickTaskTitle}
                  </p>
                )}
              </div>

              {/* Lesson Under */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentColors.text }}>
                  Lesson Under: <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={quickLessonUnder}
                    onChange={(e) => {
                      setQuickLessonUnder(e.target.value);
                      clearQuickTaskError('quickLessonUnder');
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-colors text-sm ${
                      quickTaskErrors.quickLessonUnder ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                    style={{ 
                      backgroundColor: currentColors.background, 
                      borderColor: quickTaskErrors.quickLessonUnder ? '#ef4444' : currentColors.border,
                      color: currentColors.text
                    }}
                  >
                    <option value="">
                      {lessons.length === 0 ? "Add lessons below to get started..." : "Select a lesson..."}
                    </option>
                    {lessons.map((lesson, index) => (
                      <option key={index} value={lesson}>
                        {lesson}
                      </option>
                    ))}
                  </select>
                </div>
                {quickTaskErrors.quickLessonUnder && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiX size={12} />
                    {quickTaskErrors.quickLessonUnder}
                  </p>
                )}
                
                </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentColors.text }}>
                  Category: <span className="text-red-500">*</span>
                </label>
                <select
                  value={quickTaskCategory}
                  onChange={(e) => setQuickTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:border-blue-500 outline-none text-sm"
                  style={{ 
                    backgroundColor: currentColors.background, 
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                >
                  <option value="quiz">📝 Quiz</option>
                  <option value="reflection-essay">📄 Reflection/Essay</option>
                  <option value="group-activity">👥 Group Activity</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuickTaskModal(false);
                  setQuickTaskTitle("");
                  setQuickLessonUnder("");
                  setQuickTaskCategory("quiz");
                  setQuickTaskErrors({
                    quickTaskTitle: "",
                    quickLessonUnder: ""
                  });
                }}
                className="px-4 py-2 rounded-lg transition w-full sm:w-auto order-2 sm:order-1"
                style={{ 
                  backgroundColor: currentColors.textSecondary, 
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.text}
                onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.textSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleQuickTaskCreate}
                className="px-4 py-2 rounded-lg transition w-full sm:w-auto order-1 sm:order-2"
                style={{ 
                  backgroundColor: currentColors.accent, 
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskPage;
