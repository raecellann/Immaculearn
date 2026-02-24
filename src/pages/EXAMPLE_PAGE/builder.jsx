import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useTasks } from "../../hooks/useTasks";
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
import { api } from "../../lib/api";

export default function TaskBuilder() {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { user } = useUser();
  const { userSpaces, friendSpaces, courseSpaces } = useSpace();

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
  const [score, setScore] = useState("1");
  const [dueDate, setDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskCategory, setTaskCategory] = useState("activity");

  // Quiz/Activity items state
  const [itemsCount, setItemsCount] = useState(1);
  const [items, setItems] = useState([
    { id: 1, text: "", type: "multiple_choice", points: 1, options: [] }
  ]);

  // Quiz configuration state
  const [quizConfig, setQuizConfig] = useState("all_multiple"); // all_multiple, all_identification, all_essay, custom
  const [customConfig, setCustomConfig] = useState({
    multipleChoice: 0,
    identification: 0,
    essay: 0
  });

  // Group activity members state
  const [groupMembers, setGroupMembers] = useState([]);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  // Group activity configuration state
  const [groupConfig, setGroupConfig] = useState("all_essay"); // all_essay, all_identification, custom
  const [groupCustomConfig, setGroupCustomConfig] = useState({
    essay: 0,
    identification: 0
  });

  // Criteria management state
  const [criteria, setCriteria] = useState([
    { id: 1, name: "", description: "", points: "" },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCriteriaSection, setShowCriteriaSection] = useState(false);

  // Load task data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('taskPreviewData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Restore task data from localStorage
        setTaskTitle(parsedData.title || "");
        setInstruction(parsedData.description || "");
        setTaskCategory(parsedData.type || "activity");
        setScore(parsedData.total_score?.toString() || "1");
        setDueDate(parsedData.due_date || "");
        
        // Restore items if available
        if (parsedData.items && parsedData.items.length > 0) {
          const restoredItems = parsedData.items.map((item, index) => ({
            id: item.id || index + 1,
            text: item.question_text || "",
            type: item.question_type || "essay",
            points: item.points || 1,
            options: item.options?.map(opt => ({
              id: opt.id || index + 1,
              text: opt.option_text || "",
              is_correct: opt.is_correct || false
            })) || []
          }));
          setItems(restoredItems);
          setItemsCount(restoredItems.length);
        }
        
        // Restore criteria if available
        if (parsedData.criteria && parsedData.criteria.length > 0) {
          const restoredCriteria = parsedData.criteria.map((criterion, index) => ({
            id: index + 1,
            name: criterion.criteria_name || "",
            description: criterion.description || "",
            points: criterion.max_score?.toString() || ""
          }));
          setCriteria(restoredCriteria);
        }
        
        // Restore group members if available
        if (parsedData.groupsData && parsedData.groupsData.length > 0) {
          // Note: In a real app, you'd need to map member IDs back to member objects
          // For now, we'll just show that there were members
          console.log("Group data found:", parsedData.groupsData);
        }
        
        // Restore quiz configuration if it's a quiz
        if (parsedData.type === "quiz") {
          // You could add logic to restore quiz configuration here
          // For now, it will use default configuration
        }
        
        // Restore group configuration if it's a group activity
        if (parsedData.is_group_task) {
          // You could add logic to restore group configuration here
          // For now, it will use default configuration
        }
      }
    } catch (error) {
      console.error("Error loading task data:", error);
      // If there's an error, continue with default values
    }
  }, []);

  // Task management
  const [isCreatingTask, setIsCreatingTask] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  // Task categories
  const taskCategories = [
    { value: "quiz", label: "Quiz", emoji: "📝" },
    { value: "activity", label: "Individual Activity", emoji: "�" },
    { value: "project", label: "Group Activity", emoji: "👥" },
  ];

  // Criteria templates
  const criteriaTemplates = {
    quiz: [
      {
        name: "Correct Answers",
        description: "Accuracy of responses",
        points: "50",
      },
      {
        name: "Completion",
        description: "All questions answered",
        points: "20",
      },
      {
        name: "Timeliness",
        description: "Submitted on time",
        points: "15",
      },
      {
        name: "Clarity",
        description: "Clear and understandable responses",
        points: "15",
      },
    ],
    activity: [
      {
        name: "Content Quality",
        description: "Quality and completeness of work",
        points: "40",
      },
      {
        name: "Creativity",
        description: "Original thinking and approach",
        points: "20",
      },
      {
        name: "Organization",
        description: "Structure and presentation",
        points: "20",
      },
      {
        name: "Timeliness",
        description: "Submitted by deadline",
        points: "20",
      },
    ],
    project: [
      {
        name: "Collaboration",
        description: "Teamwork and participation",
        points: "25",
      },
      {
        name: "Content Quality",
        description: "Quality of final output",
        points: "30",
      },
      {
        name: "Presentation",
        description: "Clarity and effectiveness",
        points: "25",
      },
      {
        name: "Equal Contribution",
        description: "Balanced participation from all members",
        points: "20",
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

  // Items management functions
  const updateItemsCount = (count) => {
    const newCount = Math.max(1, parseInt(count) || 1);
    setItemsCount(newCount);
    
    // Adjust items array based on quiz configuration
    const currentItems = [...items];
    if (newCount > currentItems.length) {
      // Add new items
      for (let i = currentItems.length + 1; i <= newCount; i++) {
        const itemType = getQuestionTypeForIndex(i);
        currentItems.push({
          id: i,
          text: "",
          type: itemType,
          points: 1,
          options: itemType === "multiple_choice" ? [
            { id: 1, text: "", is_correct: false },
            { id: 2, text: "", is_correct: false },
            { id: 3, text: "", is_correct: false },
            { id: 4, text: "", is_correct: false }
          ] : []
        });
      }
    } else {
      // Remove items
      currentItems.splice(newCount);
    }
    setItems(currentItems);
  };

  // Get question type based on quiz configuration and index
  const getQuestionTypeForIndex = (index) => {
    if (taskCategory !== "quiz") return "essay";
    
    switch (quizConfig) {
      case "all_multiple":
        return "multiple_choice";
      case "all_identification":
        return "identification";
      case "all_essay":
        return "essay";
      case "custom":
        // Determine type based on custom configuration
        const mcCount = customConfig.multipleChoice;
        const idCount = customConfig.identification;
        if (index <= mcCount) return "multiple_choice";
        if (index <= mcCount + idCount) return "identification";
        return "essay";
      default:
        return "multiple_choice";
    }
  };

  // Update quiz configuration
  const updateQuizConfig = (config) => {
    setQuizConfig(config);
    
    // Rebuild items array with new configuration
    const newItems = [];
    for (let i = 1; i <= itemsCount; i++) {
      const itemType = getQuestionTypeForIndexWithConfig(i, config);
      newItems.push({
        id: i,
        text: items[i - 1]?.text || "",
        type: itemType,
        points: items[i - 1]?.points || 1,
        options: itemType === "multiple_choice" ? 
          (items[i - 1]?.options || [
            { id: 1, text: "", is_correct: false },
            { id: 2, text: "", is_correct: false },
            { id: 3, text: "", is_correct: false },
            { id: 4, text: "", is_correct: false }
          ]) : []
      });
    }
    setItems(newItems);
  };

  // Helper function to get question type with specific config
  const getQuestionTypeForIndexWithConfig = (index, config) => {
    if (config === "all_multiple") return "multiple_choice";
    if (config === "all_identification") return "identification";
    if (config === "all_essay") return "essay";
    
    // Custom configuration
    const mcCount = customConfig.multipleChoice;
    const idCount = customConfig.identification;
    if (index <= mcCount) return "multiple_choice";
    if (index <= mcCount + idCount) return "identification";
    return "essay";
  };

  // Update custom configuration
  const updateCustomConfig = (field, value) => {
    const newConfig = { ...customConfig, [field]: parseInt(value) || 0 };
    setCustomConfig(newConfig);
    
    // Update items count to match total
    const total = newConfig.multipleChoice + newConfig.identification + newConfig.essay;
    if (total > 0) {
      setItemsCount(total);
      
      // Rebuild items array with correct types based on new custom config
      const newItems = [];
      for (let i = 1; i <= total; i++) {
        let itemType;
        if (i <= newConfig.multipleChoice) {
          itemType = "multiple_choice";
        } else if (i <= newConfig.multipleChoice + newConfig.identification) {
          itemType = "identification";
        } else {
          itemType = "essay";
        }
        
        newItems.push({
          id: i,
          text: items[i - 1]?.text || "",
          type: itemType,
          points: items[i - 1]?.points || 1,
          options: itemType === "multiple_choice" ? 
            (items[i - 1]?.options || [
              { id: 1, text: "", is_correct: false },
              { id: 2, text: "", is_correct: false },
              { id: 3, text: "", is_correct: false },
              { id: 4, text: "", is_correct: false }
            ]) : []
        });
      }
      setItems(newItems);
    }
  };

  const updateItem = (itemId, field, value) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const addOption = (itemId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newOption = {
          id: item.options.length + 1,
          text: "",
          is_correct: false
        };
        return { ...item, options: [...item.options, newOption] };
      }
      return item;
    }));
  };

  const updateOption = (itemId, optionId, field, value) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedOptions = item.options.map(option =>
          option.id === optionId ? { ...option, [field]: value } : option
        );
        return { ...item, options: updatedOptions };
      }
      return item;
    }));
  };

  const removeOption = (itemId, optionId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedOptions = item.options.filter(option => option.id !== optionId);
        return { ...item, options: updatedOptions };
      }
      return item;
    }));
  };

  // Group members management
  const addGroupMember = (member) => {
    if (!groupMembers.find(m => m.id === member.id)) {
      setGroupMembers([...groupMembers, member]);
    }
  };

  const removeGroupMember = (memberId) => {
    setGroupMembers(groupMembers.filter(m => m.id !== memberId));
  };

  // Get available members from current space
  const getAvailableMembers = () => {
    if (!currentSpace?.members) return [];
    return currentSpace.members.filter(member => 
      !groupMembers.find(m => m.id === member.id)
    );
  };

  // Group activity configuration functions
  const updateGroupConfig = (config) => {
    setGroupConfig(config);
    
    // Rebuild items array with new configuration
    const newItems = [];
    for (let i = 1; i <= itemsCount; i++) {
      const itemType = getGroupItemTypeForIndexWithConfig(i, config);
      newItems.push({
        id: i,
        text: items[i - 1]?.text || "",
        type: itemType,
        points: items[i - 1]?.points || 1,
        options: [] // Group activities don't have options
      });
    }
    setItems(newItems);
  };

  // Get group item type based on configuration and index
  const getGroupItemTypeForIndex = (index) => {
    if (taskCategory !== "project") return "essay";
    
    switch (groupConfig) {
      case "all_essay":
        return "essay";
      case "all_identification":
        return "identification";
      case "custom":
        // Determine type based on custom configuration
        const essayCount = groupCustomConfig.essay;
        if (index <= essayCount) return "essay";
        return "identification";
      default:
        return "essay";
    }
  };

  // Helper function to get group item type with specific config
  const getGroupItemTypeForIndexWithConfig = (index, config) => {
    if (config === "all_essay") return "essay";
    if (config === "all_identification") return "identification";
    
    // Custom configuration
    const essayCount = groupCustomConfig.essay;
    if (index <= essayCount) return "essay";
    return "identification";
  };

  // Update group custom configuration
  const updateGroupCustomConfig = (field, value) => {
    const newConfig = { ...groupCustomConfig, [field]: parseInt(value) || 0 };
    setGroupCustomConfig(newConfig);
    
    // Update items count to match total
    const total = newConfig.essay + newConfig.identification;
    if (total > 0) {
      setItemsCount(total);
      
      // Rebuild items array with correct types based on new custom config
      const newItems = [];
      for (let i = 1; i <= total; i++) {
        let itemType;
        if (i <= newConfig.essay) {
          itemType = "essay";
        } else {
          itemType = "identification";
        }
        
        newItems.push({
          id: i,
          text: items[i - 1]?.text || "",
          type: itemType,
          points: items[i - 1]?.points || 1,
          options: []
        });
      }
      setItems(newItems);
    }
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

    const score = parseInt(totalScore);
    if (isNaN(score) || score < 1) return;

    const pointsPerCriteria = Math.floor(score / criteria.length);
    const remainder = score % criteria.length;
    
    const updatedCriteria = criteria.map((criterion, index) => ({
      ...criterion,
      points: (pointsPerCriteria + (index < remainder ? 1 : 0)).toString(),
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
    setScore("1");
    setDueDate("");
    setSelectedFile(null);
    setTaskCategory("activity");
    setItemsCount(1);
    setItems([{ id: 1, text: "", type: "multiple_choice", points: 1, options: [] }]);
    setQuizConfig("all_multiple");
    setCustomConfig({ multipleChoice: 0, identification: 0, essay: 0 });
    setGroupConfig("all_essay");
    setGroupCustomConfig({ essay: 0, identification: 0 });
    setGroupMembers([]);
    setShowMemberSelector(false);
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

  // Handle task submission
  const handleTaskSubmit = async (isDraft = false) => {
    if (!taskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (!instruction.trim()) {
      toast.error("Please enter task instructions");
      return;
    }

    if (!score || parseInt(score) < 1) {
      toast.error("Please enter a valid score (minimum 1)");
      return;
    }

    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }

    // Validate group activity has members
    if (taskCategory === "project" && groupMembers.length === 0) {
      toast.error("Please add at least one member for group activity");
      return;
    }

    try {
      // Determine if this is a group task based on category
      const isGroupTask = taskCategory === "project";
      
      const taskData = {
        title: taskTitle,
        description: instruction,
        type: taskCategory,
        is_group_task: isGroupTask,
        total_score: parseInt(score),
        due_date: dueDate,
        status: isDraft ? "draft" : "published",
        // Include items for quiz and activity
        items: taskCategory !== "project" ? items.map(item => ({
          question_text: item.text,
          question_type: item.type,
          points: item.points,
          options: item.options.map(opt => ({
            option_text: opt.text,
            is_correct: opt.is_correct
          }))
        })) : [],
        // Include group members for group activity
        groupsData: isGroupTask ? [{
          group_name: `${taskTitle} Group`,
          members: groupMembers.map(member => member.id)
        }] : [],
        criteria: criteria.map(c => ({
          criteria_name: c.name,
          description: c.description,
          max_score: parseInt(c.points) || 0
        })).filter(c => c.criteria_name.trim() !== "")
      };

      // Store task data in localStorage for preview
      localStorage.setItem('taskPreviewData', JSON.stringify(taskData));

      // Display JSON data in alert for debugging
      alert("Task Data to be submitted:\n\n" + JSON.stringify(taskData, null, 2));

      if (isDraft) {
        await draftTaskMutation.mutateAsync({
          spaceId: currentSpace?.space_id,
          taskData,
        });
        toast.success("Task saved as draft!");
      } else {
        await uploadTaskMutation.mutateAsync({
          spaceId: currentSpace?.space_id,
          taskData,
        });
        toast.success("Task created successfully!");
      }

      // Reset form after successful submission
      resetTaskForm();
      
      // Navigate back to tasks page
      navigate(`/space/${space_uuid}/${space_name}/tasks`);
      
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  // Save task data to localStorage for preview
  const saveTaskForPreview = () => {
    if (!taskTitle.trim()) {
      toast.error("Please enter a task title before previewing");
      return;
    }

    // Determine if this is a group task based on category
    const isGroupTask = taskCategory === "project";
    
    const taskData = {
      title: taskTitle,
      description: instruction,
      type: taskCategory,
      is_group_task: isGroupTask,
      total_score: parseInt(score) || 1,
      due_date: dueDate,
      status: "preview",
      // Include items for quiz and activity
      items: taskCategory !== "project" ? items.map(item => ({
        question_text: item.text,
        question_type: item.type,
        points: item.points,
        options: item.options.map(opt => ({
          option_text: opt.text,
          is_correct: opt.is_correct
        }))
      })) : [],
      // Include group members for group activity
      groupsData: isGroupTask ? [{
        group_name: `${taskTitle} Group`,
        members: groupMembers.map(member => member.id)
      }] : [],
      criteria: criteria.map(c => ({
        criteria_name: c.name,
        description: c.description,
        max_score: parseInt(c.points) || 0
      })).filter(c => c.criteria_name.trim() !== "")
    };

    // Store task data in localStorage for preview
    localStorage.setItem('taskPreviewData', JSON.stringify(taskData));
    
    // Navigate to preview
    navigate(`/space/task-builder/preview`);
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
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-32 sm:h-40 md:h-48">
          <div className="absolute inset-0 bg-black/30" />
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
                <button
                  onClick={() =>
                    navigate(`/space/${space_uuid}/${space_name}/tasks`)
                  }
                >
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

          {/* TASK CREATION FORM */}
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create New Task</h2>
              <button
                onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}
                className="text-gray-400 hover:text-white flex items-center gap-2"
              >
                <FiArrowLeft size={16} />
                Back to Tasks
              </button>
            </div>

            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#1E222A] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter task title..."
                />
              </div>

              {/* Task Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {taskCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setTaskCategory(category.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        taskCategory === category.value
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.emoji}</div>
                      <div className="text-xs">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items/Questions Section - Only for Quiz and Individual Activity */}
              {taskCategory !== "project" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {taskCategory === "quiz" ? "Quiz Configuration" : "Activity Items"}
                    </h3>
                  </div>

                  {/* Quiz Configuration - Only for Quiz */}
                  {taskCategory === "quiz" && (
                    <div className="mb-6 p-4 bg-[#1E222A] border border-gray-600 rounded-lg">
                      <h4 className="font-medium mb-3">Question Type Configuration:</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <button
                          onClick={() => updateQuizConfig("all_multiple")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            quizConfig === "all_multiple"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">All Multiple Choice</div>
                        </button>
                        <button
                          onClick={() => updateQuizConfig("all_identification")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            quizConfig === "all_identification"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">All Identification</div>
                        </button>
                        <button
                          onClick={() => updateQuizConfig("all_essay")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            quizConfig === "all_essay"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">All Essay</div>
                        </button>
                        <button
                          onClick={() => updateQuizConfig("custom")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            quizConfig === "custom"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">Custom Mix</div>
                        </button>
                      </div>

                      {/* Custom Configuration */}
                      {quizConfig === "custom" && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">Set number of questions per type:</h5>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Multiple Choice</label>
                              <input
                                type="number"
                                value={customConfig.multipleChoice}
                                onChange={(e) => updateCustomConfig("multipleChoice", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Identification</label>
                              <input
                                type="number"
                                value={customConfig.identification}
                                onChange={(e) => updateCustomConfig("identification", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Essay</label>
                              <input
                                type="number"
                                value={customConfig.essay}
                                onChange={(e) => updateCustomConfig("essay", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Total Questions: {customConfig.multipleChoice + customConfig.identification + customConfig.essay}
                          </div>
                        </div>
                      )}

                      {/* Total Questions Display */}
                      {quizConfig !== "custom" && (
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Number of Questions:
                          </label>
                          <input
                            type="number"
                            value={itemsCount}
                            onChange={(e) => updateItemsCount(e.target.value)}
                            className="w-20 bg-[#1E222A] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            min="1"
                            max="50"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Items Count - Only for Individual Activity */}
                  {taskCategory === "activity" && (
                    <div className="mb-6 flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Number of Activity Items:
                      </label>
                      <input
                        type="number"
                        value={itemsCount}
                        onChange={(e) => updateItemsCount(e.target.value)}
                        className="w-20 bg-[#1E222A] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                        max="50"
                      />
                    </div>
                  )}

                  {/* Questions/Items List */}
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      // Determine background color based on question type
                      let bgColor = "bg-[#1E222A]"; // default
                      if (taskCategory === "quiz") {
                        if (item.type === "multiple_choice") {
                          bgColor = "bg-blue-900/30"; // light blue
                        } else if (item.type === "identification") {
                          bgColor = "bg-red-900/30"; // light red
                        } else if (item.type === "essay") {
                          bgColor = "bg-gray-700/30"; // light gray
                        }
                      }
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-4 ${bgColor} border border-gray-600 rounded-lg`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">
                              {taskCategory === "quiz" ? 
                                `Question ${index + 1} (${item.type.replace('_', ' ')})` : 
                                `Item ${index + 1}`
                              }
                            </h4>
                            {taskCategory === "quiz" && quizConfig !== "custom" && (
                              <select
                                value={item.type}
                                onChange={(e) => updateItem(item.id, "type", e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                              >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="identification">Identification</option>
                                <option value="essay">Essay</option>
                                <option value="file_upload">File Upload</option>
                              </select>
                            )}
                          </div>

                          <div className="space-y-3">
                            <textarea
                              value={item.text}
                              onChange={(e) => updateItem(item.id, "text", e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              placeholder={
                                taskCategory === "quiz" 
                                  ? item.type === "identification" 
                                    ? "Enter identification item/term..."
                                    : "Enter your question..."
                                  : "Enter item description..."
                              }
                              rows={3}
                            />

                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium">Points:</label>
                              <input
                                type="number"
                                value={item.points}
                                onChange={(e) => updateItem(item.id, "points", parseInt(e.target.value) || 0)}
                                className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                min="1"
                              />
                            </div>

                            {/* Multiple Choice Options - Only for Multiple Choice Questions */}
                            {taskCategory === "quiz" && item.type === "multiple_choice" && (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Options:</h5>
                                {item.options.map((option, optIndex) => (
                                  <div key={option.id} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${item.id}`}
                                      checked={option.is_correct}
                                      onChange={() => {
                                        // Set all options to false, then set this one to true
                                        const updatedOptions = item.options.map(opt => ({
                                          ...opt,
                                          is_correct: opt.id === option.id
                                        }));
                                        updateItem(item.id, "options", updatedOptions);
                                      }}
                                      className="w-4"
                                    />
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(item.id, option.id, "text", e.target.value)}
                                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                    {item.options.length > 2 && (
                                      <button
                                        onClick={() => removeOption(item.id, option.id)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(item.id)}
                                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                                >
                                  Add Option
                                </button>
                              </div>
                            )}

                            {/* Identification Type - Special Instructions */}
                            {taskCategory === "quiz" && item.type === "identification" && (
                              <div className="p-3 bg-gray-800 rounded text-sm text-gray-300">
                                <strong>Identification Type:</strong> Students will identify or name the item/term provided.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group Members Section - Only for Group Activity */}
              {taskCategory === "project" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Group Members</h3>
                    <button
                      onClick={() => setShowMemberSelector(!showMemberSelector)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      {showMemberSelector ? "Hide Members" : "Add Members"}
                    </button>
                  </div>

                  {/* Current Members */}
                  {groupMembers.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h4 className="font-medium text-sm">Selected Members ({groupMembers.length}):</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {groupMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{member.name || member.email}</div>
                                <div className="text-xs text-gray-400">{member.email}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeGroupMember(member.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member Selector */}
                  {showMemberSelector && (
                    <div className="p-4 bg-[#1E222A] border border-gray-600 rounded-lg">
                      <h4 className="font-medium mb-3">Available Members:</h4>
                      {getAvailableMembers().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {getAvailableMembers().map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded hover:border-blue-500 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{member.name || member.email}</div>
                                  <div className="text-xs text-gray-400">{member.email}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => addGroupMember(member)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No available members to add. All space members are already in the group.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Group Activity Items Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Group Activity Items</h3>
                    </div>

                    {/* Group Activity Configuration */}
                    <div className="mb-6 p-4 bg-[#1E222A] border border-gray-600 rounded-lg">
                      <h4 className="font-medium mb-3">Item Type Configuration:</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <button
                          onClick={() => updateGroupConfig("all_essay")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            groupConfig === "all_essay"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">All Essay</div>
                        </button>
                        <button
                          onClick={() => updateGroupConfig("all_identification")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            groupConfig === "all_identification"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">All Identification</div>
                        </button>
                        <button
                          onClick={() => updateGroupConfig("custom")}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            groupConfig === "custom"
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">Custom Mix</div>
                        </button>
                      </div>

                      {/* Custom Configuration */}
                      {groupConfig === "custom" && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm">Set number of items per type:</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Essay</label>
                              <input
                                type="number"
                                value={groupCustomConfig.essay}
                                onChange={(e) => updateGroupCustomConfig("essay", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Identification</label>
                              <input
                                type="number"
                                value={groupCustomConfig.identification}
                                onChange={(e) => updateGroupCustomConfig("identification", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Total Items: {groupCustomConfig.essay + groupCustomConfig.identification}
                          </div>
                        </div>
                      )}

                      {/* Total Items Display */}
                      {groupConfig !== "custom" && (
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Number of Items:
                          </label>
                          <input
                            type="number"
                            value={itemsCount}
                            onChange={(e) => updateItemsCount(e.target.value)}
                            className="w-20 bg-[#1E222A] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            min="1"
                            max="50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Group Activity Items List */}
                    <div className="space-y-4">
                      {items.map((item, index) => {
                        // Determine background color based on item type
                        let bgColor = "bg-[#1E222A]"; // default
                        if (item.type === "essay") {
                          bgColor = "bg-gray-700/30"; // light gray
                        } else if (item.type === "identification") {
                          bgColor = "bg-red-900/30"; // light red
                        }
                        
                        return (
                          <div
                            key={item.id}
                            className={`p-4 ${bgColor} border border-gray-600 rounded-lg`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">
                                Group Item {index + 1} (${item.type})
                              </h4>
                              {groupConfig !== "custom" && (
                                <select
                                  value={item.type}
                                  onChange={(e) => updateItem(item.id, "type", e.target.value)}
                                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                >
                                  <option value="essay">Essay</option>
                                  <option value="identification">Identification</option>
                                </select>
                              )}
                            </div>

                            <div className="space-y-3">
                              <textarea
                                value={item.text}
                                onChange={(e) => updateItem(item.id, "text", e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                placeholder={
                                  item.type === "identification" 
                                    ? "Enter group activity item/term..."
                                    : "Enter group activity description..."
                                }
                                rows={3}
                              />

                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium">Points:</label>
                                <input
                                  type="number"
                                  value={item.points}
                                  onChange={(e) => updateItem(item.id, "points", parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                  min="0"
                                  step="0.01"
                                />
                              </div>

                              {/* Identification Type - Special Instructions */}
                              {item.type === "identification" && (
                                <div className="p-3 bg-gray-800 rounded text-sm text-gray-300">
                                  <strong>Identification Type:</strong> Group members will identify or name the item/term provided.
                                </div>
                              )}

                              {/* Group Collaboration Note */}
                              <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded text-sm text-blue-300">
                                <strong>Group Activity:</strong> This item will be completed collaboratively by all group members.
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Task Instructions */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Instructions *
                </label>
                <div className="bg-[#1E222A] border border-gray-600 rounded-lg overflow-hidden">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-2 p-3 border-b border-gray-600">
                    <button
                      onClick={() => applyFormat("bold")}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Bold"
                    >
                      <FiBold size={16} />
                    </button>
                    <button
                      onClick={() => applyFormat("italic")}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Italic"
                    >
                      <FiItalic size={16} />
                    </button>
                    <button
                      onClick={() => applyFormat("underline")}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Underline"
                    >
                      <FiUnderline size={16} />
                    </button>
                    <div className="h-6 w-px bg-gray-600" />
                    <button
                      onClick={handleFileClick}
                      className="p-2 hover:bg-gray-700 rounded flex items-center gap-2"
                      title="Upload File"
                    >
                      <FiUploadCloud size={16} />
                      <span className="text-sm">Upload File</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.text"
                      className="hidden"
                    />
                  </div>
                  {/* Content Editor */}
                  <div
                    ref={instructionRef}
                    contentEditable
                    className="min-h-[200px] p-4 focus:outline-none"
                    placeholder="Enter task instructions..."
                    style={{
                      minHeight: "200px",
                    }}
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-400">
                    Attached file: {selectedFile.name}
                  </div>
                )}
              </div>

              {/* Score and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Score *
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full bg-[#1E222A] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter total score"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#1E222A] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Grading Criteria */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Grading Criteria</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={addCriteria}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Add Criteria
                    </button>
                    {criteria.length > 1 && (
                      <button
                        onClick={clearCriteria}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Templates */}
                {showTemplates && (
                  <div className="mb-4 p-4 bg-[#1E222A] border border-gray-600 rounded-lg">
                    <h4 className="font-medium mb-3">Choose a template:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => applyTemplate("quiz")}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        Quiz
                      </button>
                      <button
                        onClick={() => applyTemplate("activity")}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        Individual Activity
                      </button>
                      <button
                        onClick={() => applyTemplate("project")}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        Group Activity
                      </button>
                    </div>
                  </div>
                )}

                {/* Criteria List */}
                <div className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <div
                      key={criterion.id}
                      className="p-4 bg-[#1E222A] border border-gray-600 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) =>
                            updateCriteria(criterion.id, "name", e.target.value)
                          }
                          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Criteria name"
                        />
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) =>
                            updateCriteria(
                              criterion.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={criterion.points}
                          onChange={(e) =>
                            updateCriteria(criterion.id, "points", e.target.value)
                          }
                          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Points"
                          min="0"
                          step="0.01"
                        />
                        <button
                          onClick={() => removeCriteria(criterion.id)}
                          disabled={criteria.length === 1}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTaskSubmit(false)}
                    disabled={isCreatingTask}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    {isCreatingTask ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    onClick={() => handleTaskSubmit(true)}
                    disabled={isCreatingTask}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={saveTaskForPreview}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Preview Task
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/space/${space_uuid}/${space_name}/tasks`)}
                  className="px-6 py-2 border border-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
