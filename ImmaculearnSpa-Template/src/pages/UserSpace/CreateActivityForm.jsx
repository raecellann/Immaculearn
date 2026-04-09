import React, { useState, useRef, useEffect } from "react";
import { useSpaceTheme } from "../../contexts/theme/spaceThemeContextProvider";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

const CreateActivityForm = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  // State management
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskCategory, setTaskCategory] = useState("individual-activity");
  const [criteria, setCriteria] = useState([
    { id: 1, name: "", description: "", points: "" },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCriteriaSection, setShowCriteriaSection] = useState(false);

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
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
        setInstruction(extractedText);
        if (instructionRef.current) {
          instructionRef.current.innerHTML = extractedText;
        }
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
    }
  };

  const extractTextFromPDF = async (file) => {
    // PDF text extraction implementation
    return "PDF text extraction would be implemented here";
  };

  const extractTextFromDocx = async (file) => {
    // DOCX text extraction implementation
    return "DOCX text extraction would be implemented here";
  };

  const extractTextFromPptx = async (file) => {
    // PPTX text extraction implementation
    return "PPTX text extraction would be implemented here";
  };

  const extractTextFromExcel = async (file) => {
    // Excel text extraction implementation
    return "Excel text extraction would be implemented here";
  };

  const extractTextFromText = async (file) => {
    // Plain text extraction implementation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  // Criteria management functions
  const addCriteria = () => {
    const newCriteria = {
      id: Date.now(),
      name: "",
      description: "",
      points: "",
    };
    setCriteria([...criteria, newCriteria]);
  };

  const removeCriteria = (id) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((c) => c.id !== id));
    }
  };

  const updateCriteria = (id, field, value) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const getTotalCriteriaPoints = () => {
    return criteria.reduce((total, c) => {
      const points = parseFloat(c.points) || 0;
      return total + points;
    }, 0);
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
  };

  useEffect(() => {
    const stored = localStorage.getItem("saved-form");

    if (stored) {
      try {
        const savedData = JSON.parse(stored);
        setTaskTitle(savedData.taskTitle || "");
        setInstruction(savedData.instruction || "");
        // Set the innerHTML after a short delay to ensure the ref is available
        setTimeout(() => {
          if (instructionRef.current && savedData.instruction) {
            instructionRef.current.innerHTML = savedData.instruction;
          }
        }, 0);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  // Sync instruction state with contentEditable ref
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
  }, [instruction]);

  return (
    <div
      className="font-sans p-4 sm:p-6 md:p-8"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* COVER */}
      <div className="relative mb-6">
        <img
          src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-b-xl"
          alt="cover"
        />
        <div
          className="absolute inset-0 rounded-b-xl"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.2)",
          }}
        />
        <div className="absolute top-0 left-0 z-10">
          <div
            className="px-6 sm:px-10 py-3 rounded-br-[1rem] text-xl sm:text-2xl font-extrabold"
            style={{ backgroundColor: currentColors.text, color: "white" }}
          >
            Zeldrick's Space
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div
        className="max-w-6xl mx-auto rounded-xl shadow-lg p-4 sm:p-6 md:p-8"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
          border: "1px solid",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="font-semibold text-lg">
              Title: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
              placeholder="Enter activity title"
            />

            {/* Task Category */}
            <label className="font-semibold">
              Category: <span className="text-red-500">*</span>
            </label>
            <select
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              className="bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-4 py-2 outline-none border border-[rgb(30_36_46_/var(--tw-bg-opacity,1))] focus:border-blue-500 w-full"
            >
              {taskCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.emoji} {category.label}
                </option>
              ))}
            </select>

            {/* Instruction */}
            <label className="font-semibold">Instruction (optional)</label>
            <div
              className="rounded-lg border focus-within:border-blue-500"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
            >
              <div
                ref={instructionRef}
                contentEditable
                className="min-h-[140px] px-4 py-3 outline-none"
                suppressContentEditableWarning
              />
              <div
                className="border-t"
                style={{ borderColor: currentColors.border }}
              />
              <div
                className="flex gap-4 px-4 py-2"
                style={{ color: currentColors.textSecondary }}
              >
                <button
                  type="button"
                  onClick={() => applyFormat("bold")}
                  className="transition-colors"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = currentColors.text)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = currentColors.textSecondary)
                  }
                >
                  <FiBold />
                </button>

                <button
                  type="button"
                  onClick={() => applyFormat("italic")}
                  className="transition-colors"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = currentColors.text)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = currentColors.textSecondary)
                  }
                >
                  <FiItalic />
                </button>

                <button
                  type="button"
                  onClick={() => applyFormat("underline")}
                  className="transition-colors"
                  style={{ color: currentColors.textSecondary }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = currentColors.text)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = currentColors.textSecondary)
                  }
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
                className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition"
                style={{
                  borderColor: currentColors.border,
                  backgroundColor: currentColors.surface,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.borderColor = currentColors.accent)
                }
                onMouseLeave={(e) =>
                  (e.target.style.borderColor = currentColors.border)
                }
              >
                <FiUploadCloud
                  size={36}
                  className="mb-3"
                  style={{ color: currentColors.textSecondary }}
                />
                <p
                  className="text-sm mb-2"
                  style={{ color: currentColors.textSecondary }}
                >
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

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
            <label className="font-semibold">
              Score: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
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
              className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
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
                    className="px-3 py-1 text-sm rounded-md transition"
                    style={{
                      backgroundColor: currentColors.accent,
                      color: "white",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#9333ea")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = currentColors.accent)
                    }
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCriteriaSection(!showCriteriaSection)}
                    className="px-3 py-1 text-sm rounded-md transition"
                    style={{
                      backgroundColor: currentColors.accent,
                      color: "white",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = currentColors.accent)
                    }
                  >
                    {showCriteriaSection ? "Hide" : "Manual"} Criteria
                  </button>
                </div>
              </div>

              {/* Template Selection */}
              {showTemplates && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.accent,
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: currentColors.accent }}
                    >
                      Choose a Template:
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(false)}
                      className="transition-colors"
                      style={{ color: currentColors.textSecondary }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = currentColors.text)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = currentColors.textSecondary)
                      }
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyTemplate("essay")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: currentColors.text }}
                      >
                        📝 Essay
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        For written essays and compositions
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("research")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: currentColors.text }}
                      >
                        🔬 Research Paper
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        For academic research and analysis
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("presentation")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: currentColors.text }}
                      >
                        🎤 Presentation
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        For oral presentations and demos
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("project")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: currentColors.text }}
                      >
                        💻 Project
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        For coding and development projects
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("creative")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div className="font-medium text-white">🎨 Creative</div>
                      <div className="text-xs text-gray-400">
                        For artistic and creative works
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("case-study")}
                      className="p-3 rounded-lg transition text-left border"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = currentColors.hover;
                        e.target.style.borderColor = currentColors.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = currentColors.surface;
                        e.target.style.borderColor = currentColors.border;
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: currentColors.text }}
                      >
                        📊 Case Study
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        For business case studies and analysis
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
                <div
                  className="rounded-lg p-4 max-h-[300px] overflow-y-auto"
                  style={{ backgroundColor: currentColors.surface }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: currentColors.accent }}
                    >
                      {criteria.some((c) => c.name.trim())
                        ? "Current Criteria:"
                        : "Add Your Criteria:"}
                    </h4>
                    {criteria.some((c) => c.name.trim()) && (
                      <button
                        type="button"
                        onClick={() => setShowTemplates(true)}
                        className="text-xs transition-colors"
                        style={{ color: currentColors.accent }}
                        onMouseEnter={(e) => (e.target.style.color = "#a78bfa")}
                        onMouseLeave={(e) =>
                          (e.target.style.color = currentColors.accent)
                        }
                      >
                        Change Template
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {criteria.map((criterion, index) => (
                      <div
                        className="rounded-lg p-3 border"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className="text-sm font-medium"
                            style={{ color: currentColors.accent }}
                          >
                            Criteria {index + 1}
                          </span>
                          {criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCriteria(criterion.id)}
                              className="text-sm transition-colors"
                              style={{ color: "#ef4444" }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#f87171")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#ef4444")
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) =>
                            updateCriteria(criterion.id, "name", e.target.value)
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
                          className="w-full rounded px-3 py-2 text-sm outline-none border focus:border-blue-500 resize-none"
                          style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                            color: currentColors.text,
                          }}
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
                        />
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
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="px-6 py-2 rounded-lg transition"
            style={{
              backgroundColor: currentColors.textSecondary,
              color: "white",
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = currentColors.text)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = currentColors.textSecondary)
            }
          >
            Save as Draft
          </button>
          <button
            className="px-6 py-2 rounded-lg transition"
            style={{ backgroundColor: currentColors.accent, color: "white" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = currentColors.accent)
            }
          >
            Publish Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityForm;
