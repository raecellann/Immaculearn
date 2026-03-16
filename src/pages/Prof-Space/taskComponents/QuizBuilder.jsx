import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import { useFile } from "../../../contexts/file/fileContextProvider";
import { toast } from "react-toastify";
import { useSpace } from "../../../contexts/space/useSpace";

const QuizBuilder = ({
  currentColors,
  editingTask,
  onBack,
  onSave,
  onUpdate,
  onPublish,
  isLoading = false,
}) => {
  const { resources } = useFile();
  const { questionnaireEditData, questionnaireEditDataLoading } = useSpace();
  // console.log(questionnaireEditData);
  const [quizTitle, setQuizTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [attempts, setAttempts] = useState("1");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

  const getLocalDateTimeMin = () => {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", ""],
      correctAnswer: 0,
      points: 1,
    },
  ]);

  // Populate form with editing task data
  useEffect(() => {
    if (editingTask) {
      // Handle different possible data structures
      const taskData = editingTask.rawData || editingTask;

      setQuizTitle(taskData.task_title || taskData.title || "");
      setInstruction(taskData.task_instruction || taskData.instruction || "");

      // Fix date format - convert to proper datetime-local format
      if (taskData.due_date) {
        try {
          const date = new Date(taskData.due_date);
          const formatted =
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0") +
            "T" +
            String(date.getHours()).padStart(2, "0") +
            ":" +
            String(date.getMinutes()).padStart(2, "0");

          setDueDate(formatted);
        } catch (error) {
          setDueDate("");
        }
      } else {
        setDueDate("");
      }

      setTimeLimit(taskData.time_limit || "");
      setAttempts(taskData.attempts || "1");
      setShowCorrectAnswers(taskData.show_correct_answers || false);
      setSelectedLesson(taskData.lesson_id || "");

      // Use questionnaireEditData if available
      if (questionnaireEditData && Array.isArray(questionnaireEditData)) {
        const parsedQuestions = questionnaireEditData
          .map((qData, index) => {
            let parsed = {
              id: qData.question_id || index + 1,
              type:
                qData.question_type === "mcq"
                  ? "multiple-choice"
                  : qData.question_type === "true-false"
                    ? "true-false"
                    : qData.question_type,
              question: qData.question || "",
              points: qData.point || 1,
            };

            // Handle multiple choice questions
            if (
              qData.question_type === "mcq" &&
              qData.choices &&
              Array.isArray(qData.choices)
            ) {
              parsed.options = qData.choices.map(
                (choice) => choice.choice_answer || choice.answer_text || "",
              );
              parsed.correctAnswer = qData.choices.findIndex(
                (choice) => choice.isRightAnswer || choice.is_correct,
              );
              if (parsed.correctAnswer === -1) parsed.correctAnswer = 0;
            }
            // Handle true/false questions
            else if (
              qData.question_type === "true-false" &&
              qData.choices &&
              Array.isArray(qData.choices)
            ) {
              parsed.options = qData.choices.map(
                (choice) => choice.choice_answer || choice.answer_text || "",
              );
              parsed.correctAnswer = qData.choices.findIndex(
                (choice) => choice.isRightAnswer || choice.is_correct,
              );
              if (parsed.correctAnswer === -1) parsed.correctAnswer = 0;
            }
            // Handle identification questions
            else if (qData.question_type === "identification") {
              parsed.correctAnswers = qData.identification_answer
                ? qData.identification_answer
                    .split(",")
                    .map((answer) => answer.trim())
                : [""];
            }
            // Default for other question types
            else {
              parsed.options = ["", "", ""];
              parsed.correctAnswer = 0;
              parsed.correctAnswers = [""];
            }

            return parsed;
          })
          .filter(Boolean);

        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        } else {
          setQuestions([
            {
              id: 1,
              type: "multiple-choice",
              question: "Sample question - please edit your quiz questions",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
              points: 1,
            },
          ]);
        }
      } else {
        // Fallback to default question if no questionnaireEditData
        setQuestions([
          {
            id: 1,
            type: "multiple-choice",
            question: "Sample question - please edit your quiz questions",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            points: 1,
          },
        ]);
      }
    }
  }, [editingTask, questionnaireEditData]);

  const determineQuestionType = (answers) => {
    if (!answers || answers.length === 0) return "multiple-choice";

    // Check if it's true/false
    if (
      answers.length === 2 &&
      answers.some((a) => a.letter_identifier === "T") &&
      answers.some((a) => a.letter_identifier === "F")
    ) {
      return "true-false";
    }

    // Check if it's multiple choice
    if (
      answers.length > 2 &&
      answers.every((a) => /^[A-Z]$/.test(a.letter_identifier))
    ) {
      return "multiple-choice";
    }

    // Default to multiple choice
    return "multiple-choice";
  };

  // Calculate total score from all questions
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.points || 0),
    0,
  );

  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False" },
    { value: "identification", label: "Identification" },
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", ""],
      correctAnswer: 0,
      points: 1,
      correctAnswers: [""], // For identification type questions
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {validationErrors[`options_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm">
                Please fill in all option fields
              </p>
            )}
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D, etc.
              return (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <label className="relative flex items-center justify-center cursor-pointer flex-shrink-0">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === index}
                      onChange={() =>
                        updateQuestion(question.id, "correctAnswer", index)
                      }
                      className="sr-only hidden"
                    />
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                        question.correctAnswer === index
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-500 hover:border-blue-400"
                      }`}
                      style={{
                        borderColor:
                          question.correctAnswer === index
                            ? "#2563eb"
                            : currentColors.border,
                        backgroundColor:
                          question.correctAnswer === index
                            ? "#2563eb"
                            : currentColors.background,
                        color:
                          question.correctAnswer === index
                            ? "#ffffff"
                            : currentColors.text,
                      }}
                    >
                      {letter}
                    </div>
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      updateOption(question.id, index, e.target.value);
                      if (validationErrors[`options_${question.id}`]) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          [`options_${question.id}`]: false,
                        }));
                      }
                    }}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm min-w-0 ${
                      validationErrors[`options_${question.id}`] &&
                      !option.trim()
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor:
                        validationErrors[`options_${question.id}`] &&
                        !option.trim()
                          ? "#ef4444"
                          : currentColors.border,
                    }}
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = question.options.filter(
                          (_, i) => i !== index,
                        );
                        updateQuestion(question.id, "options", newOptions);
                      }}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  updateQuestion(question.id, "options", [
                    ...question.options,
                    "",
                  ])
                }
                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex items-center gap-1 py-1"
              >
                <FiPlus size={14} /> Add Option
              </button>
            )}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-2">
            {validationErrors[`correctAnswer_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm">
                Please select True or False
              </p>
            )}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctAnswer === "true"}
                onChange={() =>
                  updateQuestion(question.id, "correctAnswer", "true")
                }
                className="sr-only hidden"
              />
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer ${
                  question.correctAnswer === "true"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
                style={{
                  borderColor:
                    question.correctAnswer === "true"
                      ? "#2563eb"
                      : currentColors.border,
                  backgroundColor:
                    question.correctAnswer === "true"
                      ? "#2563eb"
                      : currentColors.background,
                  color:
                    question.correctAnswer === "true"
                      ? "#ffffff"
                      : currentColors.text,
                }}
                onClick={() =>
                  updateQuestion(question.id, "correctAnswer", "true")
                }
              >
                T
              </div>
              <span style={{ color: currentColors.text }}>True</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctAnswer === "false"}
                onChange={() =>
                  updateQuestion(question.id, "correctAnswer", "false")
                }
                className="sr-only hidden"
              />
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer ${
                  question.correctAnswer === "false"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
                style={{
                  borderColor:
                    question.correctAnswer === "false"
                      ? "#2563eb"
                      : currentColors.border,
                  backgroundColor:
                    question.correctAnswer === "false"
                      ? "#2563eb"
                      : currentColors.background,
                  color:
                    question.correctAnswer === "false"
                      ? "#ffffff"
                      : currentColors.text,
                }}
                onClick={() =>
                  updateQuestion(question.id, "correctAnswer", "false")
                }
              >
                F
              </div>
              <span style={{ color: currentColors.text }}>False</span>
            </label>
          </div>
        );

      case "identification":
        return (
          <div>
            {validationErrors[`correctAnswer_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm mb-2">
                Please provide at least one correct answer
              </p>
            )}
            <div
              className="text-xs sm:text-sm mb-2"
              style={{ color: currentColors.textSecondary }}
            >
              Correct answers (comma-separated for multiple possible answers):
            </div>
            <div className="space-y-2">
              {question.correctAnswers?.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={answer || ""}
                    onChange={(e) => {
                      const newAnswers = [...question.correctAnswers];
                      newAnswers[index] = e.target.value;
                      updateQuestion(question.id, "correctAnswers", newAnswers);
                      if (validationErrors[`correctAnswer_${question.id}`]) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          [`correctAnswer_${question.id}`]: false,
                        }));
                      }
                    }}
                    placeholder={`Correct answer ${index + 1}`}
                    className={`flex-1 rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm ${
                      validationErrors[`correctAnswer_${question.id}`]
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor: validationErrors[
                        `correctAnswer_${question.id}`
                      ]
                        ? "#ef4444"
                        : currentColors.border,
                    }}
                  />
                  {question.correctAnswers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAnswers = question.correctAnswers.filter(
                          (_, i) => i !== index,
                        );
                        updateQuestion(
                          question.id,
                          "correctAnswers",
                          newAnswers,
                        );
                      }}
                      className="p-2 rounded-lg border text-red-500 hover:bg-red-50 transition-colors"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newAnswers = [...(question.correctAnswers || []), ""];
                  updateQuestion(question.id, "correctAnswers", newAnswers);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  borderColor: currentColors.border,
                  color: currentColors.text,
                }}
              >
                <FiPlus size={14} />
                Add Another Answer
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const validateFields = () => {
    const errors = {};

    if (!quizTitle.trim()) {
      errors.quizTitle = true;
    }

    if (!dueDate) {
      errors.dueDate = true;
    }

    if (!selectedLesson) {
      errors.selectedLesson = true;
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors[`question_${question.id}`] = true;
      }

      // Validate based on question type
      if (question.type === "multiple-choice") {
        if (question.options.some((option) => !option.trim())) {
          errors[`options_${question.id}`] = true;
        }
      } else if (
        question.type === "true-false" &&
        (!question.correctAnswer ||
          (question.correctAnswer !== "true" &&
            question.correctAnswer !== "false"))
      ) {
        errors[`correctAnswer_${question.id}`] = true;
      } else if (
        question.type === "identification" &&
        (!question.correctAnswers ||
          question.correctAnswers.length === 0 ||
          !question.correctAnswers.some((answer) => answer?.trim()))
      ) {
        errors[`correctAnswer_${question.id}`] = true;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (status) => {
    if (!validateFields()) {
      return;
    }

    // Convert datetime-local to ISO string
    let combinedDueDate = dueDate;
    if (dueDate) {
      combinedDueDate = new Date(dueDate).toISOString();
    }

    // Format questions according to the specified structure
    const formattedQuestions = questions.map((question) => {
      const questionData = {
        question_type:
          question.type === "multiple-choice"
            ? "mcq"
            : question.type === "true-false"
              ? "true-false"
              : question.type === "identification"
                ? "identification"
                : question.type,
        question: question.question,
        point: question.points || 1,
      };

      // Handle different question types
      if (question.type === "multiple-choice") {
        questionData.choices = question.options.map((option, optIndex) => ({
          letter_identifier: String.fromCharCode(65 + optIndex), // A, B, C, D
          choice_answer: option,
          isRightAnswer: question.correctAnswer === optIndex,
        }));
      } else if (question.type === "true-false") {
        questionData.choices = [
          {
            letter_identifier: "T",
            choice_answer: "True",
            isRightAnswer: question.correctAnswer === "true",
          },
          {
            letter_identifier: "F",
            choice_answer: "False",
            isRightAnswer: question.correctAnswer === "false",
          },
        ];
      } else if (question.type === "identification") {
        questionData.identification_answer =
          question.correctAnswers
            ?.filter((answer) => answer?.trim())
            .join(", ") || "";
      }

      return questionData;
    });

    // Create task object with the specified structure
    const taskData = {
      task_category: "quiz",
      task_title: quizTitle,
      task_instruction: instruction,
      total_score: totalScore,
      lesson_id: selectedLesson ? parseInt(selectedLesson) : null,
      due_date: combinedDueDate,
      questions: formattedQuestions,
    };

    // Add task ID if editing
    if (editingTask && editingTask.task_id) {
      taskData.task_id = editingTask.task_id;
    }

    if (status === "published") {
      toast.success(
        editingTask
          ? "Quiz updated and published successfully!"
          : "Quiz published successfully!",
      );
      onPublish(taskData);
    } else {
      toast.success(
        editingTask ? "Quiz updated successfully!" : "Quiz saved as draft!",
      );
      onSave(taskData);
    }
  };

  const handleUpdateTask = (status) => {
    if (!validateFields()) {
      return;
    }

    // Convert datetime-local to ISO string
    let combinedDueDate = dueDate;
    if (dueDate) {
      combinedDueDate = new Date(dueDate).toISOString();
    }

    // Format questions according to the specified structure
    const formattedQuestions = questions.map((question) => {
      const questionData = {
        question_type:
          question.type === "multiple-choice"
            ? "mcq"
            : question.type === "true-false"
              ? "true-false"
              : question.type === "identification"
                ? "identification"
                : question.type,
        question: question.question,
        point: question.points || 1,
      };

      // Handle different question types
      if (question.type === "multiple-choice") {
        questionData.choices = question.options.map((option, optIndex) => ({
          letter_identifier: String.fromCharCode(65 + optIndex), // A, B, C, D
          choice_answer: option,
          isRightAnswer: question.correctAnswer === optIndex,
        }));
      } else if (question.type === "true-false") {
        questionData.choices = [
          {
            letter_identifier: "T",
            choice_answer: "True",
            isRightAnswer: question.correctAnswer === "true",
          },
          {
            letter_identifier: "F",
            choice_answer: "False",
            isRightAnswer: question.correctAnswer === "false",
          },
        ];
      } else if (question.type === "identification") {
        questionData.identification_answer =
          question.correctAnswers
            ?.filter((answer) => answer?.trim())
            .join(", ") || "";
      }

      return questionData;
    });

    // Create task object with the specified structure
    const taskData = {
      task_id: editingTask?.task_id,
      task_category: "quiz",
      task_title: quizTitle,
      task_instruction: instruction,
      total_score: totalScore,
      lesson_id: selectedLesson ? parseInt(selectedLesson) : null,
      due_date: combinedDueDate,
      questions: formattedQuestions,
    };

    // Add task ID if editing
    if (editingTask && editingTask.task_id) {
      taskData.task_id = editingTask.task_id;
    }

    // alert(JSON.stringify(taskData));
    onUpdate(taskData);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* BACK BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors"
          style={{
            backgroundColor: currentColors.surface,
            color: currentColors.text,
            border: `1px solid ${currentColors.border}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = currentColors.hover;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = currentColors.surface;
          }}
          onClick={onBack}
        >
          <FiArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Task Types</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* QUIZ FORM */}
      <div
        className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📝</div>
          <h1
            className="text-2xl font-bold"
            style={{ color: currentColors.text }}
          >
            Quiz Builder
          </h1>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Quiz Title: <span className="text-red-500">*</span>
              </label>
              {validationErrors.quizTitle && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please enter a quiz title
                </p>
              )}
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => {
                  setQuizTitle(e.target.value);
                  if (validationErrors.quizTitle) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      quizTitle: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.quizTitle ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.quizTitle
                    ? "#ef4444"
                    : currentColors.border,
                }}
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Total Score:{" "}
                <span className="text-blue-500">(Auto-calculated)</span>
              </label>
              <div
                className="w-full rounded-lg px-4 py-2 outline-none border bg-gray-50"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
              >
                {totalScore} points
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Due Date: <span className="text-red-500">*</span>
              </label>
              {validationErrors.dueDate && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please select a due date
                </p>
              )}
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (validationErrors.dueDate) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      dueDate: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.dueDate ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.dueDate
                    ? "#ef4444"
                    : currentColors.border,
                }}
                min={getLocalDateTimeMin()}
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Connect to Lesson: <span className="text-red-500">*</span>
              </label>
              {validationErrors.selectedLesson && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please select a lesson
                </p>
              )}
              <select
                value={selectedLesson}
                onChange={(e) => {
                  setSelectedLesson(e.target.value);
                  if (validationErrors.selectedLesson) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      selectedLesson: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.selectedLesson ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.selectedLesson
                    ? "#ef4444"
                    : currentColors.border,
                }}
                required
              >
                <option value="">Select a lesson...</option>
                {resources.map((lesson) => (
                  <option key={lesson.lesson_id} value={lesson.lesson_id}>
                    {lesson.lesson_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* INSTRUCTION */}
        <div className="mb-6 sm:mb-8">
          <label
            className="block font-semibold mb-2"
            style={{ color: currentColors.text }}
          >
            Instructions (optional):
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Add instructions for students..."
            className="w-full rounded-lg px-4 py-3 outline-none border h-24"
            style={{
              backgroundColor: currentColors.background,
              color: currentColors.text,
              borderColor: currentColors.border,
            }}
          />
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">
          <div className="flex items-center">
            <h2
              className="text-xl font-semibold"
              style={{ color: currentColors.text }}
            >
              Questions
            </h2>
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="border rounded-lg p-4 sm:p-6"
              style={{
                borderColor: currentColors.border,
                backgroundColor: currentColors.background,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span
                    className="font-semibold text-sm sm:text-base"
                    style={{ color: currentColors.text }}
                  >
                    Q{index + 1}
                  </span>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id, "type", e.target.value)
                    }
                    className="rounded-lg px-3 py-1.5 outline-none border text-xs sm:text-sm w-full sm:w-auto"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border,
                    }}
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <label
                      className="text-xs sm:text-sm"
                      style={{ color: currentColors.text }}
                    >
                      Points:
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "points",
                          Number(e.target.value),
                        )
                      }
                      className="w-14 sm:w-16 rounded px-2 py-1.5 outline-none border text-xs sm:text-sm text-center"
                      style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.text,
                        borderColor: currentColors.border,
                      }}
                      min="1"
                    />
                  </div>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-400 p-1 sm:p-0 self-start sm:self-auto"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {validationErrors[`question_${question.id}`] && (
                  <p className="text-red-500 text-xs sm:text-sm mb-1">
                    Please enter a question
                  </p>
                )}
                <textarea
                  value={question.question}
                  onChange={(e) => {
                    updateQuestion(question.id, "question", e.target.value);
                    if (validationErrors[`question_${question.id}`]) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        [`question_${question.id}`]: false,
                      }));
                    }
                  }}
                  placeholder="Enter your question..."
                  className={`w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none border h-16 sm:h-20 text-sm resize-none ${
                    validationErrors[`question_${question.id}`]
                      ? "border-red-500"
                      : ""
                  }`}
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: validationErrors[`question_${question.id}`]
                      ? "#ef4444"
                      : currentColors.border,
                  }}
                />

                <div>
                  <label
                    className="block font-medium mb-2 sm:mb-3 text-xs sm:text-sm"
                    style={{ color: currentColors.text }}
                  >
                    Correct Answer:
                  </label>
                  {renderQuestionInput(question)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD QUESTION BUTTON */}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col items-stretch sm:items-end gap-4 mt-6 sm:mt-8">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <FiPlus size={16} /> Add Question
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              className="px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors"
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#2563eb";
              }}
              onClick={() => {
                if (editingTask) {
                  setShowUpdateConfirmation(true);
                } else {
                  handleSave("published");
                }
              }}
            >
              {isLoading
                ? "Publishing..."
                : editingTask
                  ? "Update and Publish"
                  : "Publish Activity"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showUpdateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.text }}
            >
              Confirm Quiz Update
            </h3>
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to update this quiz? This will modify the
              existing quiz and students may see the changes immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                }}
                onClick={() => {
                  setShowUpdateConfirmation(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
                style={{ backgroundColor: "#2563eb" }}
                onClick={() => {
                  setShowUpdateConfirmation(false);
                  handleUpdateTask();
                }}
              >
                Yes, Update Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
