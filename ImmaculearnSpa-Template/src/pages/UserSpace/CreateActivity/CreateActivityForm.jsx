import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useParams } from "react-router";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import { hardcodedLessons } from "../UserFilesShared.jsx";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiX,
  FiSave,
  FiClock,
  FiTarget,
  FiCalendar,
  FiAlertTriangle,
  FiEdit3,
} from "react-icons/fi";

const CreateActivityForm = ({ spaceName }) => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // State management
  const [taskTitle, setTaskTitle] = useState("");
  const [score, setScore] = useState("");
  const [activityEndDate, setActivityEndDate] = useState("");
  const [activityEndTime, setActivityEndTime] = useState("");
  const [lessonUnder, setLessonUnder] = useState("");
  const [taskCategory, setTaskCategory] = useState("quiz");
  const [criteria, setCriteria] = useState([
    { id: 1, name: "", description: "", points: "" },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCriteriaSection, setShowCriteriaSection] = useState(false);
  const [errors, setErrors] = useState({
    taskTitle: "",
    lessonUnder: "",
    taskCategory: "",
    activityEndDate: "",
    activityEndTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Memoized task categories to prevent re-renders
  const taskCategories = useMemo(
    () => [
      { value: "quiz", label: "Quiz", emoji: "📝" },
      { value: "reflection-essay", label: "Reflection Essay", emoji: "🤔" },
      { value: "group-activity", label: "Group Activity", emoji: "👥" },
    ],
    [],
  );

  // Memoized criteria templates
  const criteriaTemplates = useMemo(
    () => ({
      essay: [
        {
          name: "Content & Understanding",
          description: "Depth of analysis and comprehension",
          points: "30",
        },
        {
          name: "Organization & Structure",
          description: "Logical flow and coherence",
          points: "25",
        },
        {
          name: "Research & Evidence",
          description: "Quality and relevance of sources",
          points: "20",
        },
        {
          name: "Writing Style & Clarity",
          description: "Grammar, syntax, and readability",
          points: "15",
        },
        {
          name: "Critical Thinking",
          description: "Analysis and evaluation skills",
          points: "10",
        },
      ],
      presentation: [
        {
          name: "Content & Knowledge",
          description: "Accuracy and depth of information",
          points: "30",
        },
        {
          name: "Delivery & Speaking",
          description: "Clarity, confidence, and engagement",
          points: "25",
        },
        {
          name: "Visual Aids",
          description: "Quality and effectiveness of slides/materials",
          points: "20",
        },
        {
          name: "Organization",
          description: "Structure and time management",
          points: "15",
        },
        {
          name: "Q&A Handling",
          description: "Response to questions and discussion",
          points: "10",
        },
      ],
      project: [
        {
          name: "Functionality & Completion",
          description: "Working features and project completion",
          points: "35",
        },
        {
          name: "Technical Implementation",
          description: "Code quality and technical approach",
          points: "25",
        },
        {
          name: "Design & User Experience",
          description: "Interface design and usability",
          points: "20",
        },
        {
          name: "Documentation",
          description: "Code comments and project documentation",
          points: "10",
        },
        {
          name: "Innovation & Creativity",
          description: "Original ideas and unique solutions",
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
    }),
    [],
  );

  // Optimized localStorage loading
  useEffect(() => {
    const storedTaskData = localStorage.getItem("taskFormData");
    if (storedTaskData) {
      try {
        const taskFormData = JSON.parse(storedTaskData);
        setTaskTitle(taskFormData.taskTitle || "");
        setLessonUnder(taskFormData.lessonUnder || "");
        setTaskCategory(taskFormData.taskCategory || "quiz");
        setScore(taskFormData.score || "");

        // Handle legacy datetime-local format and new separate format
        if (taskFormData.activityEndDate && taskFormData.activityEndTime) {
          setActivityEndDate(taskFormData.activityEndDate);
          setActivityEndTime(taskFormData.activityEndTime);
        } else if (taskFormData.activityEndTime) {
          // Legacy format - split datetime-local into date and time
          const dateTime = new Date(taskFormData.activityEndTime);
          setActivityEndDate(dateTime.toISOString().split("T")[0]);
          setActivityEndTime(dateTime.toTimeString().slice(0, 5));
        }

        setCriteria(
          taskFormData.criteria || [
            { id: 1, name: "", description: "", points: "" },
          ],
        );
      } catch (error) {
        console.error("Error loading task data from localStorage:", error);
      }
    }
  }, []);

  // Optimized error clearing
  const clearError = useCallback((field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);

  // Optimized criteria management
  const addCriteria = useCallback(() => {
    const newCriteria = {
      id: Date.now(),
      name: "",
      description: "",
      points: "",
    };
    setCriteria((prev) => [...prev, newCriteria]);
  }, []);

  const removeCriteria = useCallback((id) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCriteria = useCallback((id, field, value) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  }, []);

  const applyTemplate = useCallback(
    (templateType) => {
      const template = criteriaTemplates[templateType];
      if (template) {
        const newCriteria = template.map((item, index) => ({
          id: Date.now() + index,
          ...item,
        }));
        setCriteria(newCriteria);
        setShowTemplates(false);
        setShowCriteriaSection(true);
      }
    },
    [criteriaTemplates],
  );

  const clearCriteria = useCallback(() => {
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
    setShowTemplates(false);
    setShowCriteriaSection(false);
  }, []);

  // Enhanced validation with better error messages
  const validateForm = useCallback(() => {
    const newErrors = {
      taskTitle: "",
      lessonUnder: "",
      taskCategory: "",
      activityEndDate: "",
      activityEndTime: "",
    };

    let hasErrors = false;

    if (!taskTitle.trim()) {
      newErrors.taskTitle = "Activity title is required";
      hasErrors = true;
    } else if (taskTitle.trim().length < 3) {
      newErrors.taskTitle = "Title must be at least 3 characters long";
      hasErrors = true;
    }

    if (!lessonUnder.trim()) {
      newErrors.lessonUnder = "Lesson under is required";
      hasErrors = true;
    }

    if (!taskCategory) {
      newErrors.taskCategory = "Category is required";
      hasErrors = true;
    }

    // Validate date and time separately
    if (!activityEndDate) {
      newErrors.activityEndDate = "Activity end date is required";
      hasErrors = true;
    }

    if (!activityEndTime) {
      newErrors.activityEndTime = "Activity end time is required";
      hasErrors = true;
    } else if (activityEndDate) {
      // Combine date and time for validation
      const endDateTime = new Date(`${activityEndDate}T${activityEndTime}`);
      const now = new Date();
      if (endDateTime <= now) {
        newErrors.activityEndTime =
          "Activity end time must be at least 5 minutes in the future";
        hasErrors = true;
      } else if (endDateTime - now < 5 * 60 * 1000) {
        newErrors.activityEndTime =
          "Activity end time must be at least 5 minutes in the future";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return false;
    }

    setErrors({
      taskTitle: "",
      lessonUnder: "",
      taskCategory: "",
      activityEndTime: "",
    });
    return true;
  }, [taskTitle, lessonUnder, taskCategory, activityEndDate, activityEndTime]);

  // Enhanced form submission with loading states
  const handleCreateTask = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const taskData = {
        taskTitle,
        lessonUnder,
        taskCategory,
        score,
        activityEndDate,
        activityEndTime,
        activityEndDateTime: `${activityEndDate}T${activityEndTime}`, // Combined for compatibility
        criteria,
      };

      localStorage.setItem("taskFormData", JSON.stringify(taskData));

      // Navigate based on category
      switch (taskCategory) {
        case "quiz":
          navigate(`/space/${space_uuid}/${space_name}/form-builder`);
          break;
        case "reflection-essay":
          navigate(`/space/${space_uuid}/${space_name}/essay-form`);
          break;
        case "group-activity":
          navigate(`/space/${space_uuid}/${space_name}/create-document`);
          break;
        default:
          navigate(`/space/${space_uuid}/${space_name}/form-builder`);
          break;
      }
    } catch (error) {
      console.error("Error creating task:", error);
      // You could show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    taskTitle,
    lessonUnder,
    taskCategory,
    score,
    activityEndDate,
    activityEndTime,
    criteria,
    navigate,
    space_uuid,
    space_name,
  ]);

  // Enhanced draft saving
  const handleSaveDraft = useCallback(async () => {
    setIsDraftSaving(true);

    try {
      const draftData = {
        taskTitle,
        lessonUnder,
        taskCategory,
        score,
        activityEndDate,
        activityEndTime,
        activityEndDateTime: `${activityEndDate}T${activityEndTime}`, // Combined for compatibility
        criteria,
        isDraft: true,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("taskDraft", JSON.stringify(draftData));

      // You could show a success toast here
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsDraftSaving(false);
    }
  }, [
    taskTitle,
    lessonUnder,
    taskCategory,
    score,
    activityEndDate,
    activityEndTime,
    criteria,
  ]);

  const handleOpenFormBuilder = useCallback(() => {
    if (!validateForm()) return;

    const taskFormData = {
      taskTitle,
      lessonUnder,
      taskCategory,
      score,
      activityEndDate,
      activityEndTime,
      activityEndDateTime: `${activityEndDate}T${activityEndTime}`, // Combined for compatibility
      criteria,
    };
    localStorage.setItem("taskFormData", JSON.stringify(taskFormData));
    navigate(`/space/${space_uuid}/${space_name}/form-builder`);
  }, [
    validateForm,
    taskTitle,
    lessonUnder,
    taskCategory,
    score,
    activityEndDate,
    activityEndTime,
    criteria,
    navigate,
    space_uuid,
    space_name,
  ]);

  const confirmDeleteRoom = useCallback(() => {
    setCriteria([{ id: 1, name: "", description: "", points: "" }]);
  }, []);

  return (
    <div className="font-sans">
      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-6">
          {/* Title Field */}
          <div>
            <label className="block font-semibold mb-2">
              Title: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                clearError("taskTitle");
              }}
              className={`w-full rounded-lg px-4 py-3 outline-none border transition-colors ${
                errors.taskTitle
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              }`}
              style={{
                backgroundColor: currentColors.surface,
                borderColor: errors.taskTitle
                  ? "#ef4444"
                  : currentColors.border,
              }}
              placeholder="Enter activity title"
              disabled={isSubmitting}
            />
            {errors.taskTitle && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiX size={12} />
                {errors.taskTitle}
              </p>
            )}
          </div>

          {/* Lesson Under Field */}
          <div>
            <label className="block font-semibold mb-2">
              Lesson Under: <span className="text-red-500">*</span>
            </label>
            <select
              value={lessonUnder}
              onChange={(e) => {
                setLessonUnder(e.target.value);
                clearError("lessonUnder");
              }}
              className={`w-full rounded-lg px-4 py-3 outline-none border transition-colors ${
                errors.lessonUnder
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              }`}
              style={{
                backgroundColor: currentColors.surface,
                borderColor: errors.lessonUnder
                  ? "#ef4444"
                  : currentColors.border,
              }}
              disabled={isSubmitting}
            >
              <option value="">Select a lesson...</option>
              {hardcodedLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.name}>
                  {lesson.name}
                </option>
              ))}
            </select>
            {errors.lessonUnder && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiX size={12} />
                {errors.lessonUnder}
              </p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="block font-semibold mb-2">
              Category: <span className="text-red-500">*</span>
            </label>
            <select
              value={taskCategory}
              onChange={(e) => {
                setTaskCategory(e.target.value);
                clearError("taskCategory");
              }}
              className={`w-full rounded-lg px-4 py-3 outline-none border transition-colors ${
                errors.taskCategory
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-blue-500"
              }`}
              style={{
                backgroundColor: currentColors.surface,
                borderColor: errors.taskCategory
                  ? "#ef4444"
                  : currentColors.border,
              }}
              disabled={isSubmitting}
            >
              {taskCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.emoji} {category.label}
                </option>
              ))}
            </select>
            {errors.taskCategory && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiX size={12} />
                {errors.taskCategory}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-6">
          {/* Score Field */}
          <div>
            <label className="block font-semibold mb-2">
              Score: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-lg px-4 py-3 outline-none border focus:border-blue-500"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              }}
              placeholder="Enter score (e.g., 100)"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          {/* Activity End Time Field */}
          <div>
            <label className="block font-semibold mb-2">
              <FiClock className="inline mr-2" size={16} />
              Activity End Date & Time: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FiCalendar
                    size={14}
                    style={{ color: currentColors.textSecondary }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Date
                  </span>
                </div>
                <input
                  type="date"
                  value={activityEndDate}
                  onChange={(e) => {
                    setActivityEndDate(e.target.value);
                    clearError("activityEndDate");
                  }}
                  className={`w-full rounded-lg px-3 py-2 outline-none border transition-colors ${
                    errors.activityEndDate
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-blue-500"
                  }`}
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: errors.activityEndDate
                      ? "#ef4444"
                      : currentColors.border,
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isSubmitting}
                />
                {errors.activityEndDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiX size={12} />
                    {errors.activityEndDate}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FiClock
                    size={14}
                    style={{ color: currentColors.textSecondary }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Time
                  </span>
                </div>
                <input
                  type="time"
                  value={activityEndTime}
                  onChange={(e) => {
                    setActivityEndTime(e.target.value);
                    clearError("activityEndTime");
                  }}
                  className={`w-full rounded-lg px-3 py-2 outline-none border transition-colors ${
                    errors.activityEndTime
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-blue-500"
                  }`}
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: errors.activityEndTime
                      ? "#ef4444"
                      : currentColors.border,
                  }}
                  disabled={isSubmitting}
                />
                {errors.activityEndTime && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiX size={12} />
                    {errors.activityEndTime}
                  </p>
                )}
              </div>
            </div>

            {/* Combined validation message */}
            {errors.activityEndTime &&
              errors.activityEndTime.includes("future") && (
                <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                  <FiAlertTriangle size={12} />
                  {errors.activityEndTime}
                </p>
              )}

            <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
              <FiClock size={12} />
              When this time is reached, the activity will automatically close
            </p>
          </div>

          {/* Criteria Section - Hidden for quizzes */}
          {taskCategory !== "quiz" && (
            <div className="mt-6">
              {/* Section Header with Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: currentColors.text }}
                  >
                    📊 Scoring Criteria
                  </h3>
                  <p
                    className="text-xs opacity-70"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Define how this activity will be graded.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-3 py-2 text-xs rounded-lg transition-all hover:scale-105 flex items-center gap-1 whitespace-nowrap"
                    style={{
                      backgroundColor: currentColors.accent,
                      color: "white",
                    }}
                    disabled={isSubmitting}
                  >
                    <FiTarget size={12} />
                    Use Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCriteriaSection(!showCriteriaSection)}
                    className="px-3 py-2 text-xs rounded-lg transition-all hover:scale-105 flex items-center gap-1 whitespace-nowrap"
                    style={{
                      backgroundColor: currentColors.accent,
                      color: "white",
                    }}
                    disabled={isSubmitting}
                  >
                    <FiEdit3 size={12} />
                    {showCriteriaSection ? "Hide" : "Manual"} Criteria
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Template Selection */}
                {showTemplates && (
                  <div
                    className="rounded-xl p-6 border-2"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.accent,
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: currentColors.accent }}
                      >
                        Choose a Template:
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowTemplates(false)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-500 hover:text-white"
                        style={{ color: currentColors.textSecondary }}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.keys(criteriaTemplates).map((templateType) => (
                        <button
                          key={templateType}
                          type="button"
                          onClick={() => applyTemplate(templateType)}
                          className="p-4 rounded-lg transition-all hover:scale-105 text-left border"
                          style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                          }}
                          disabled={isSubmitting}
                        >
                          <div
                            className="font-medium capitalize"
                            style={{ color: currentColors.text }}
                          >
                            {templateType.replace("-", " ")}
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: currentColors.textSecondary }}
                          >
                            {criteriaTemplates[templateType].length} criteria
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={clearCriteria}
                        className="p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all text-left border border-red-500/50"
                        disabled={isSubmitting}
                      >
                        <div className="font-medium text-red-400">
                          🗑️ Clear All
                        </div>
                        <div className="text-xs text-red-300 mt-1">
                          Remove all criteria
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Criteria */}
                {showCriteriaSection && (
                  <div
                    className="rounded-xl p-6 max-h-[400px] overflow-y-auto"
                    style={{ backgroundColor: currentColors.surface }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4
                        className="text-lg font-semibold"
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
                          className="text-sm transition-colors hover:scale-105"
                          style={{ color: currentColors.accent }}
                          disabled={isSubmitting}
                        >
                          Change Template
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {criteria.map((criterion) => (
                        <div
                          key={criterion.id}
                          className="flex gap-3 items-start"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                              placeholder="Criteria name"
                              className="rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                              disabled={isSubmitting}
                            />
                            <input
                              type="text"
                              value={criterion.description}
                              onChange={(e) =>
                                updateCriteria(
                                  criterion.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Description"
                              className="rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                              disabled={isSubmitting}
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
                              className="rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                              disabled={isSubmitting}
                            />
                          </div>
                          {criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCriteria(criterion.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:scale-105"
                              disabled={isSubmitting}
                            >
                              <FiX size={14} />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addCriteria}
                        className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-105 font-medium"
                        disabled={isSubmitting}
                      >
                        + Add Criteria
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center sm:items-end sm:flex-row gap-2 sm:gap-4 mt-6 lg:mt-8">
        <button
          className="w-48 sm:w-auto px-3 py-2 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs"
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
          onClick={handleSaveDraft}
          disabled={isDraftSaving}
        >
          {isDraftSaving ? (
            <>
              <FiLoader className="animate-spin" size={12} />
              Saving...
            </>
          ) : (
            <>
              <FiSave size={12} />
              Save as Draft
            </>
          )}
        </button>

        {/* Open Form Builder Button - Only show for quiz and reflection-essay categories */}
        {(taskCategory === "quiz" || taskCategory === "reflection-essay") && (
          <button
            className="w-48 sm:w-auto px-3 py-2 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs"
            style={{ backgroundColor: "#6366f1", color: "white" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#4f46e5")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#6366f1")}
            onClick={handleOpenFormBuilder}
            disabled={isSubmitting}
          >
            <FiEdit3 size={12} />
            Open Form Builder
          </button>
        )}

        <button
          className="w-48 sm:w-auto px-3 py-2 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs"
          style={{ backgroundColor: currentColors.accent, color: "white" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = currentColors.accent)
          }
          onClick={handleCreateTask}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FiLoader className="animate-spin" size={12} />
              Creating...
            </>
          ) : (
            <>
              <FiTarget size={12} />
              Create Task
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateActivityForm;
