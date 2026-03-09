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

const QuizBuilder = ({
  currentColors,
  editingTask,
  onBack,
  onSave,
  onPublish,
  isLoading = false,
}) => {
  const { resources } = useFile();
  const [quizTitle, setQuizTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [attempts, setAttempts] = useState("1");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Mock lessons data
  // const [resources] = useState([
  //   {
  //     lesson_id: 1,
  //     acad_term_id: 1,
  //     c_space_id: 1,
  //     space_id: 1,
  //     lesson_name: "Introduction to React",
  //     created_at: "2024-01-15T10:00:00Z"
  //   },
  //   {
  //     lesson_id: 2,
  //     acad_term_id: 1,
  //     c_space_id: 1,
  //     space_id: 1,
  //     lesson_name: "JavaScript Fundamentals",
  //     created_at: "2024-01-16T10:00:00Z"
  //   },
  //   {
  //     lesson_id: 3,
  //     acad_term_id: 1,
  //     c_space_id: 1,
  //     space_id: 1,
  //     lesson_name: "HTML & CSS Basics",
  //     created_at: "2024-01-17T10:00:00Z"
  //   },
  //   {
  //     lesson_id: 4,
  //     acad_term_id: 1,
  //     c_space_id: 1,
  //     space_id: 1,
  //     lesson_name: "State Management",
  //     created_at: "2024-01-18T10:00:00Z"
  //   },
  //   {
  //     lesson_id: 5,
  //     acad_term_id: 1,
  //     c_space_id: 1,
  //     space_id: 1,
  //     lesson_name: "Component Lifecycle",
  //     created_at: "2024-01-19T10:00:00Z"
  //   }
  // ]);

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
    console.log("=== QUIZ EDIT DEBUG START ===");
    console.log("QuizBuilder editingTask:", editingTask);
    
    if (editingTask) {
      // Handle different possible data structures
      const taskData = editingTask.rawData || editingTask;
      console.log("taskData:", taskData);
      
      setQuizTitle(taskData.task_title || taskData.title || "");
      setInstruction(taskData.task_instructions || taskData.instruction || "");
      
      // Fix date format - convert to proper datetime-local format
      if (taskData.due_date) {
        try {
          const date = new Date(taskData.due_date);
          // Format: yyyy-MM-ddThh:mm
          const formattedDate = date.toISOString().slice(0, 16);
          setDueDate(formattedDate);
          console.log("Formatted due date:", formattedDate);
        } catch (error) {
          console.error("Date formatting error:", error);
          setDueDate("");
        }
      } else {
        setDueDate("");
      }
      
      setTimeLimit(taskData.time_limit || "");
      setAttempts(taskData.attempts || "1");
      setShowCorrectAnswers(taskData.show_correct_answers || false);
      setSelectedLesson(taskData.lesson_id || "");
      
      // Handle questions based on the actual data structure we saw
      console.log("=== PARSING QUESTIONS ===");
      
      let questionsData = [];
      
      // Try to parse questions from different possible locations
      try {
        // Method 1: Check if questions is a string that needs JSON parsing
        if (typeof taskData.questions === 'string') {
          console.log("Questions is a string, attempting to parse...");
          const parsedQuestions = JSON.parse(taskData.questions);
          if (Array.isArray(parsedQuestions)) {
            questionsData = parsedQuestions;
            console.log("✓ Successfully parsed questions from string:", questionsData);
          }
        }
        // Method 2: Check if questions is already an array
        else if (Array.isArray(taskData.questions)) {
          questionsData = taskData.questions;
          console.log("✓ Found questions array directly:", questionsData);
        }
        // Method 3: Check editingTask.questions
        else if (Array.isArray(editingTask.questions)) {
          questionsData = editingTask.questions;
          console.log("✓ Found questions in editingTask:", questionsData);
        }
        // Method 4: Check if questions are stored in task_content or other properties
        else if (taskData.task_content && typeof taskData.task_content === 'string') {
          console.log("Checking task_content...");
          const parsedContent = JSON.parse(taskData.task_content);
          if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
            questionsData = parsedContent.questions;
            console.log("✓ Found questions in task_content:", questionsData);
          }
        }
        // Method 5: Look for any property that might contain questions
        else {
          console.log("Searching all properties for questions...");
          Object.keys(taskData).forEach(key => {
            const value = taskData[key];
            if (typeof value === 'string' && value.includes('question')) {
              try {
                const parsed = JSON.parse(value);
                if (parsed.questions && Array.isArray(parsed.questions)) {
                  questionsData = parsed.questions;
                  console.log(`✓ Found questions in property "${key}":`, questionsData);
                }
              } catch (e) {
                // Not valid JSON, continue searching
              }
            }
          });
        }
      } catch (error) {
        console.error("Error parsing questions:", error);
      }
      
      console.log("Final questionsData:", questionsData);
      
      if (questionsData.length > 0) {
        console.log(`Processing ${questionsData.length} questions...`);
        
        const parsedQuestions = questionsData.map((qObj, index) => {
          console.log(`\n--- Processing question ${index + 1} ---`);
          console.log("Full qObj:", qObj);
          
          // Handle different question structures
          let questionData = null;
          
          // Structure 1: {q1: {question: "...", answers: [...]}}
          const questionKey = `q${index + 1}`;
          if (qObj[questionKey]) {
            questionData = qObj[questionKey];
            console.log("✓ Found with key method:", questionData);
          }
          // Structure 2: Direct question object
          else if (qObj.question) {
            questionData = qObj;
            console.log("✓ Found with direct method:", questionData);
          }
          // Structure 3: Check if qObj itself is the question data
          else if (typeof qObj === 'object' && (qObj.question || qObj.answers)) {
            questionData = qObj;
            console.log("✓ qObj is the question data:", questionData);
          }
          
          console.log(`Final questionData for Q${index + 1}:`, questionData);
          
          if (questionData) {
            const parsed = {
              id: index + 1,
              type: determineQuestionType(questionData.answers),
              question: questionData.question || "",
              options: questionData.answers ? questionData.answers.map(a => a.answer_text || a.answer || a.text || "") : ["", "", ""],
              correctAnswer: questionData.answers ? questionData.answers.findIndex(a => a.is_correct) : 0,
              points: questionData.points || 1,
            };
            console.log("Parsed question:", parsed);
            return parsed;
          }
          
          console.log("❌ No valid question data found");
          return null;
        }).filter(Boolean);
        
        console.log("\nFinal parsed questions:", parsedQuestions);
        
        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          console.log("✅ Questions set successfully!");
        } else {
          console.log("❌ No valid questions parsed");
        }
      } else {
        console.log("❌ No questions found");
        
        // Show what we have for debugging
        console.log("=== DEBUG INFO ===");
        console.log("taskData.questions:", taskData.questions);
        console.log("editingTask.questions:", editingTask.questions);
        console.log("taskData keys:", Object.keys(taskData));
        
        // If we still can't find questions, create a default question for testing
        console.log("Creating default question for testing...");
        setQuestions([{
          id: 1,
          type: "multiple-choice",
          question: "Sample question - please edit your quiz questions",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          points: 1,
        }]);
      }
    }
    
    console.log("=== QUIZ EDIT DEBUG END ===\n");
  }, [editingTask]);

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
    { value: "enumeration", label: "Enumeration" },
    { value: "short-answer", label: "Short Answer" },
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", ""],
      correctAnswer: 0,
      points: 1,
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
              <p className="text-red-500 text-xs sm:text-sm">Please fill in all option fields</p>
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
                        setValidationErrors(prev => ({ ...prev, [`options_${question.id}`]: false }));
                      }
                    }}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm min-w-0 ${
                      validationErrors[`options_${question.id}`] && !option.trim() ? 'border-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor: validationErrors[`options_${question.id}`] && !option.trim() ? '#ef4444' : currentColors.border,
                    }}
                  />
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
              <p className="text-red-500 text-xs sm:text-sm">Please select True or False</p>
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
              <p className="text-red-500 text-xs sm:text-sm mb-2">Please provide the correct answer</p>
            )}
            <input
              type="text"
              value={question.correctAnswer || ""}
              onChange={(e) => {
                updateQuestion(question.id, "correctAnswer", e.target.value);
                if (validationErrors[`correctAnswer_${question.id}`]) {
                  setValidationErrors(prev => ({ ...prev, [`correctAnswer_${question.id}`]: false }));
                }
              }}
              placeholder="Correct answer"
              className={`w-full rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm ${
                validationErrors[`correctAnswer_${question.id}`] ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: validationErrors[`correctAnswer_${question.id}`] ? '#ef4444' : currentColors.border,
              }}
            />
          </div>
        );

      case "enumeration":
        return (
          <div className="space-y-2">
            {validationErrors[`correctAnswer_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm mb-2">Please provide at least one answer</p>
            )}
            <div
              className="text-xs sm:text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              Correct answers (comma-separated):
            </div>
            <textarea
              value={
                Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(", ")
                  : question.correctAnswer || ""
              }
              onChange={(e) => {
                updateQuestion(
                  question.id,
                  "correctAnswer",
                  e.target.value.split(",").map((a) => a.trim()),
                );
                if (validationErrors[`correctAnswer_${question.id}`]) {
                  setValidationErrors(prev => ({ ...prev, [`correctAnswer_${question.id}`]: false }));
                }
              }}
              placeholder="Answer 1, Answer 2, Answer 3..."
              className={`w-full rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm h-16 sm:h-20 resize-none ${
                validationErrors[`correctAnswer_${question.id}`] ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: validationErrors[`correctAnswer_${question.id}`] ? '#ef4444' : currentColors.border,
              }}
            />
          </div>
        );

      case "short-answer":
        return (
          <div className="space-y-2">
            {validationErrors[`correctAnswer_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm mb-2">Please provide a sample answer</p>
            )}
            <div
              className="text-xs sm:text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              Sample correct answer (for grading reference):
            </div>
            <textarea
              value={question.correctAnswer || ""}
              onChange={(e) => {
                updateQuestion(question.id, "correctAnswer", e.target.value);
                if (validationErrors[`correctAnswer_${question.id}`]) {
                  setValidationErrors(prev => ({ ...prev, [`correctAnswer_${question.id}`]: false }));
                }
              }}
              placeholder="Enter sample answer or key points..."
              className={`w-full rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm h-16 sm:h-20 resize-none ${
                validationErrors[`correctAnswer_${question.id}`] ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: validationErrors[`correctAnswer_${question.id}`] ? '#ef4444' : currentColors.border,
              }}
            />
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
        if (question.options.some(option => !option.trim())) {
          errors[`options_${question.id}`] = true;
        }
      } else if (question.type === "true-false" && (!question.correctAnswer || (question.correctAnswer !== "true" && question.correctAnswer !== "false"))) {
        errors[`correctAnswer_${question.id}`] = true;
      } else if (question.type === "identification" && !question.correctAnswer?.trim()) {
        errors[`correctAnswer_${question.id}`] = true;
      } else if (question.type === "enumeration" && (!question.correctAnswer || question.correctAnswer.length === 0 || question.correctAnswer.every(ans => !ans.trim()))) {
        errors[`correctAnswer_${question.id}`] = true;
      } else if (question.type === "short-answer" && !question.correctAnswer?.trim()) {
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
        questionData.identification_answer = question.correctAnswer || "";
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

    // Store in localStorage
    // try {
    //   const completeData = {
    //     space_uuid: "12334c11-0d45-11f1-88ce-c03532821bd5", // This should come from context/props
    //     taskData: taskData
    //   };
    //   localStorage.setItem("quizTask", JSON.stringify(completeData));
    //   console.log("Task saved to localStorage:", completeData);
    // } catch (error) {
    //   console.error("Error saving to localStorage:", error);
    // }

    if (status === "published") {
      toast.success(editingTask ? "Quiz updated and published successfully!" : "Quiz published successfully!");
      onPublish(taskData);
    } else {
      toast.success(editingTask ? "Quiz updated successfully!" : "Quiz saved as draft!");
      onSave(taskData);
    }
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
                <p className="text-red-500 text-xs sm:text-sm mb-1">Please enter a quiz title</p>
              )}
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => {
                  setQuizTitle(e.target.value);
                  if (validationErrors.quizTitle) {
                    setValidationErrors(prev => ({ ...prev, quizTitle: false }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.quizTitle ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.quizTitle ? '#ef4444' : currentColors.border,
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
                <p className="text-red-500 text-xs sm:text-sm mb-1">Please select a due date</p>
              )}
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (validationErrors.dueDate) {
                    setValidationErrors(prev => ({ ...prev, dueDate: false }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.dueDate ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.dueDate ? '#ef4444' : currentColors.border,
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
                <p className="text-red-500 text-xs sm:text-sm mb-1">Please select a lesson</p>
              )}
              <select
                value={selectedLesson}
                onChange={(e) => {
                  setSelectedLesson(e.target.value);
                  if (validationErrors.selectedLesson) {
                    setValidationErrors(prev => ({ ...prev, selectedLesson: false }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.selectedLesson ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.selectedLesson ? '#ef4444' : currentColors.border,
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
                  <p className="text-red-500 text-xs sm:text-sm mb-1">Please enter a question</p>
                )}
                <textarea
                  value={question.question}
                  onChange={(e) => {
                    updateQuestion(question.id, "question", e.target.value);
                    if (validationErrors[`question_${question.id}`]) {
                      setValidationErrors(prev => ({ ...prev, [`question_${question.id}`]: false }));
                    }
                  }}
                  placeholder="Enter your question..."
                  className={`w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none border h-16 sm:h-20 text-sm resize-none ${
                    validationErrors[`question_${question.id}`] ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: validationErrors[`question_${question.id}`] ? '#ef4444' : currentColors.border,
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
              onClick={() => handleSave("draft")}
            >
              {isLoading ? "Saving..." : (editingTask ? "Update Draft" : "Save as Draft")}
            </button>
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
              onClick={() => handleSave("published")}
            >
              {isLoading ? "Publishing..." : (editingTask ? "Update and Publish" : "Publish Activity")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
