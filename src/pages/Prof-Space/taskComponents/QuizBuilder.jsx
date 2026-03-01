import React, { useState } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import { useFile } from "../../../contexts/file/fileContextProvider";

const QuizBuilder = ({
  currentColors,
  onBack,
  onSave,
  onPublish,
  isLoading = false,
}) => {
  const { resources } = useFile();
  const [quizTitle, setQuizTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [attempts, setAttempts] = useState("1");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState("");

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
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D, etc.
              return (
                <div key={index} className="flex items-center gap-2">
                  <label className="relative flex items-center justify-center cursor-pointer">
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
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
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
                    onChange={(e) =>
                      updateOption(question.id, index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 rounded-lg px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor: currentColors.border,
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
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiTrash2 size={16} />
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
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <FiPlus size={16} /> Add Option
              </button>
            )}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-2">
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
          <input
            type="text"
            value={question.correctAnswer || ""}
            onChange={(e) =>
              updateQuestion(question.id, "correctAnswer", e.target.value)
            }
            placeholder="Correct answer"
            className="w-full rounded-lg px-3 py-2 outline-none border text-sm"
            style={{
              backgroundColor: currentColors.background,
              color: currentColors.text,
              borderColor: currentColors.border,
            }}
          />
        );

      case "enumeration":
        return (
          <div className="space-y-2">
            <div
              className="text-sm"
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
              onChange={(e) =>
                updateQuestion(
                  question.id,
                  "correctAnswer",
                  e.target.value.split(",").map((a) => a.trim()),
                )
              }
              placeholder="Answer 1, Answer 2, Answer 3..."
              className="w-full rounded-lg px-3 py-2 outline-none border text-sm h-20"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
            />
          </div>
        );

      case "short-answer":
        return (
          <div className="space-y-2">
            <div
              className="text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              Sample correct answer (for grading reference):
            </div>
            <textarea
              value={question.correctAnswer || ""}
              onChange={(e) =>
                updateQuestion(question.id, "correctAnswer", e.target.value)
              }
              placeholder="Enter sample answer or key points..."
              className="w-full rounded-lg px-3 py-2 outline-none border text-sm h-20"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = (status) => {
    // Combine date and time into ISO string if both are provided
    let combinedDueDate = dueDate;
    if (dueDate && dueTime) {
      combinedDueDate = new Date(`${dueDate}T${dueTime}`).toISOString();
    } else if (dueDate) {
      combinedDueDate = new Date(dueDate).toISOString();
    }

    // Format questions according to the specified structure
    const formattedQuestions = questions.map((question, index) => {
      const questionData = {
        [`q${index + 1}`]: {
          question: question.question,
          answers: [],
        },
      };

      // Handle different question types
      if (question.type === "multiple-choice") {
        question.options.forEach((option, optIndex) => {
          questionData[`q${index + 1}`].answers.push({
            letter_identifier: String.fromCharCode(65 + optIndex), // A, B, C, D
            isRightAnswer: question.correctAnswer === optIndex ? 1 : 0,
            answer_text: option,
          });
        });
      } else if (question.type === "true-false") {
        questionData[`q${index + 1}`].answers = [
          {
            letter_identifier: "T",
            isRightAnswer: question.correctAnswer === "true" ? 1 : 0,
            answer_text: "True",
          },
          {
            letter_identifier: "F",
            isRightAnswer: question.correctAnswer === "false" ? 1 : 0,
            answer_text: "False",
          },
        ];
      } else {
        // For identification, enumeration, short-answer
        questionData[`q${index + 1}`].answers = [
          {
            letter_identifier: "A",
            isRightAnswer: 1,
            answer_text: question.correctAnswer || "",
          },
        ];
      }

      return questionData;
    });

    // Create task object with the specified structure
    const taskData = {
      task_type: "quiz",
      total_score: totalScore,
      task_due_date: combinedDueDate,
      task_instructions: instruction,
      lesson_id: selectedLesson ? parseInt(selectedLesson) : null,
      questions: formattedQuestions,
    };

    // Store in localStorage
    try {
      localStorage.setItem("quizTask", JSON.stringify(taskData));
      console.log("Task saved to localStorage:", taskData);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    const quizData = {
      title: quizTitle,
      instruction,
      score: totalScore,
      dueDate: combinedDueDate,
      timeLimit,
      attempts: Number(attempts),
      showCorrectAnswers,
      questions,
      category: "quiz",
      lessonId: selectedLesson ? parseInt(selectedLesson) : null,
      lessonName: selectedLesson
        ? resources.find(
            (lesson) => lesson.lesson_id === parseInt(selectedLesson),
          )?.lesson_name
        : null,
    };

    if (status === "published") {
      onPublish(quizData);
    } else {
      onSave(quizData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Quiz Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
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

          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Due Date: <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="rounded-lg px-4 py-2 outline-none border"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }}
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 rounded-lg px-4 py-2 outline-none border"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Connect to Lesson: <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
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
        <div className="mb-8">
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
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-semibold"
              style={{ color: currentColors.text }}
            >
              Questions
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <FiPlus size={16} /> Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="border rounded-lg p-6"
              style={{
                borderColor: currentColors.border,
                backgroundColor: currentColors.background,
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <span
                    className="font-semibold"
                    style={{ color: currentColors.text }}
                  >
                    Question {index + 1}
                  </span>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id, "type", e.target.value)
                    }
                    className="rounded-lg px-3 py-1 outline-none border text-sm"
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
                      className="text-sm"
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
                      className="w-16 rounded px-2 py-1 outline-none border text-sm text-center"
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
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, "question", e.target.value)
                  }
                  placeholder="Enter your question..."
                  className="w-full rounded-lg px-4 py-3 outline-none border h-20"
                  style={{
                    backgroundColor: currentColors.surface,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }}
                />

                <div>
                  <label
                    className="block font-medium mb-3 text-sm"
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

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
          <button
            className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors"
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
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors"
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
            {isLoading ? "Publishing..." : "Publish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
