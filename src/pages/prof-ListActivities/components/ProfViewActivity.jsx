import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useTasks } from "../../../hooks/useTasks";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import {
  FiX,
  FiUser,
  FiCheck,
  FiX as FiXIcon,
  FiBarChart2,
  FiArrowLeft,
} from "react-icons/fi";
import { useSpace } from "../../../contexts/space/useSpace";

const ProfViewActivityPage = () => {
  const { space_uuid, space_name, task_id, task_name } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showStudentAnswers, setShowStudentAnswers] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const { allUserCompletedTask, allUserCompletedTaskLoading, setTaskId } =
    useSpace();

  if (task_id) {
    setTaskId(task_id);
  }

  // Use useTasks hook to fetch tasks
  const { uploadedTasksQuery, draftedTasksQuery } = useTasks(space_uuid);

  // Filter tasks to find current task
  const uploadedTaskData = uploadedTasksQuery?.data || [];
  const draftedTaskData = draftedTasksQuery?.data || [];

  // Handle API response structure
  const uploadedTasks = Array.isArray(uploadedTaskData)
    ? uploadedTaskData
    : uploadedTaskData?.data || [];
  const draftedTasks = Array.isArray(draftedTaskData)
    ? draftedTaskData
    : draftedTaskData?.data || [];

  // Find current task by task_id
  const currentTask = uploadedTasks.find(
    (t) => Number(t.task_id) === Number(task_id),
  );

  console.log(currentTask);

  // Decode URL parameters
  const decodedSpaceName = decodeURIComponent(space_name || "");
  const decodedTaskName = decodeURIComponent(task_name || "");

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mock student data with answers - replace with actual API call
  const mockStudentData = [
    {
      student_id: "1",
      student_name: "Juan Dela Cruz",
      student_email: "juan.cruz@email.com",
      score: 15,
      total_score: 20,
      completed_at: "2025-11-20T14:30:00Z",
      answers: {
        1: "A", // Question 1 answer
        2: "True", // Question 2 answer
        3: "C", // Question 3 answer
        4: "B", // Question 4 answer
        5: "Photosynthesis is the process by which plants make their own food", // Question 5 answer
      },
    },
    {
      student_id: "2",
      student_name: "Maria Santos",
      student_email: "maria.santos@email.com",
      score: 18,
      total_score: 20,
      completed_at: "2025-11-20T15:15:00Z",
      answers: {
        1: "B", // Question 1 answer
        2: "False", // Question 2 answer
        3: "A", // Question 3 answer
        4: "D", // Question 4 answer
        5: "The process where plants convert sunlight into energy", // Question 5 answer
      },
    },
    {
      student_id: "3",
      student_name: "Jose Reyes",
      student_email: "jose.reyes@email.com",
      score: 12,
      total_score: 20,
      completed_at: "2025-11-21T10:45:00Z",
      answers: {
        1: "C", // Question 1 answer
        2: "True", // Question 2 answer
        3: "B", // Question 3 answer
        4: "A", // Question 4 answer
        5: "Plants use chlorophyll to capture light energy", // Question 5 answer
      },
    },
  ];

  // Mock quiz questions - replace with actual quiz data
  const mockQuizQuestions = [
    {
      id: 1,
      question: "What is the primary function of chlorophyll in plants?",
      type: "multiple-choice",
      answers: [
        {
          letter_identifier: "A",
          answer_text: "Capture light energy",
          is_correct: true,
        },
        {
          letter_identifier: "B",
          answer_text: "Store water",
          is_correct: false,
        },
        {
          letter_identifier: "C",
          answer_text: "Produce oxygen",
          is_correct: false,
        },
        {
          letter_identifier: "D",
          answer_text: "Absorb nutrients",
          is_correct: false,
        },
      ],
    },
    {
      id: 2,
      question: "Photosynthesis requires sunlight.",
      type: "true-false",
      answers: [
        { letter_identifier: "T", answer_text: "True", is_correct: true },
        { letter_identifier: "F", answer_text: "False", is_correct: false },
      ],
    },
    {
      id: 3,
      question: "Which gas is released during photosynthesis?",
      type: "multiple-choice",
      answers: [
        {
          letter_identifier: "A",
          answer_text: "Carbon dioxide",
          is_correct: false,
        },
        { letter_identifier: "B", answer_text: "Nitrogen", is_correct: false },
        { letter_identifier: "C", answer_text: "Oxygen", is_correct: true },
        { letter_identifier: "D", answer_text: "Hydrogen", is_correct: false },
      ],
    },
    {
      id: 4,
      question: "Where does photosynthesis primarily occur in plants?",
      type: "multiple-choice",
      answers: [
        { letter_identifier: "A", answer_text: "Roots", is_correct: false },
        { letter_identifier: "B", answer_text: "Leaves", is_correct: true },
        { letter_identifier: "C", answer_text: "Stem", is_correct: false },
        { letter_identifier: "D", answer_text: "Flowers", is_correct: false },
      ],
    },
    {
      id: 5,
      question: "Briefly describe the process of photosynthesis.",
      type: "short-answer",
      answers: [
        {
          answer_text:
            "The process by which plants use sunlight, water, and CO2 to produce glucose and oxygen",
          is_correct: true,
        },
      ],
    },
  ];

  // Helper functions
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentAnswers(true);
  };

  // Handle response summary for quiz - navigate to separate page
  const handleResponseSummary = () => {
    navigate(
      `/prof/response-summary/${space_uuid}/${encodeURIComponent(space_name)}/${encodeURIComponent(decodedTaskName)}/${task_id}`,
    );
  };

  const checkIfAnswerIsCorrect = (question, studentAnswer) => {
    if (!question.answers || !studentAnswer) return false;

    const correctAnswer = question.answers.find((a) => a.is_correct);
    if (!correctAnswer) return false;

    // Handle different answer formats
    if (question.type === "true-false") {
      return (
        studentAnswer.toLowerCase() === correctAnswer.answer_text.toLowerCase()
      );
    }

    return (
      studentAnswer === correctAnswer.letter_identifier ||
      studentAnswer.toLowerCase() === correctAnswer.answer_text.toLowerCase()
    );
  };

  const renderStudentAnswer = (question, studentAnswer) => {
    const isCorrect = checkIfAnswerIsCorrect(question, studentAnswer);

    return (
      <div
        className={`mt-4 p-3 rounded border ${
          isCorrect
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-semibold ${
              isCorrect ? "text-green-800" : "text-red-800"
            }`}
          >
            Student Answer: {studentAnswer}
          </p>
          {isCorrect ? (
            <FiCheck className="text-green-600" size={16} />
          ) : (
            <FiXIcon className="text-red-600" size={16} />
          )}
        </div>
      </div>
    );
  };

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // useEffect(() => {
  //   // Fetch quiz data based on currentTask from useTasks

  //   try {
  //     // Use currentTask data if found
  //     if (currentTask) {
  //       console.log("Setting quiz data from currentTask:", currentTask);
  //       setQuizData(currentTask);
  //     } else {
  //       // Fallback to localStorage for local tasks
  //       const savedQuiz = localStorage.getItem("quizTask");
  //       if (savedQuiz) {
  //         const parsedQuiz = JSON.parse(savedQuiz);
  //         console.log("Found saved quiz data:", parsedQuiz);

  //         // Check if this quiz matches the current task_id
  //         if (parsedQuiz.task_id === task_id || parsedQuiz.id === task_id) {
  //           setQuizData(parsedQuiz);
  //           console.log("Set quiz data from localStorage");
  //         } else {
  //           console.log("Saved quiz doesn't match current task_id");
  //         }
  //       }
  //     }

  //     // TODO: Add API call to fetch task data from backend using task_id if not found
  //     // Example: fetchTaskData(task_id, space_uuid)
  //   } catch (error) {
  //     console.error("Error fetching quiz data:", error);
  //   }
  // }, [task_id, space_uuid, currentTask]);

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date set";
    try {
      const date = new Date(dueDate);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* Desktop ProfSidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <ProfSidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet ProfSidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <ProfSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text,
          }}
        >
          <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-xl sm:text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate">
              {decodedTaskName || "Task View"}
            </h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-16 sm:pt-20 lg:pt-10) */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10 pt-16 sm:pt-20 lg:pt-10 overflow-y-auto">
          {/* Back Button */}
          <div className="mb-3 sm:mb-4 flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-none p-2 text-base sm:text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
              ← Back
            </button>
          </div>

          {/* Task Information */}
          <div
            className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-4xl sm:max-w-5xl mx-auto"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 font-inter">
              Task Information:
            </h2>
            <hr
              className="mb-3 sm:mb-4"
              style={{ borderColor: currentColors.border }}
            />

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
              <div className="space-y-2 sm:space-y-3">
                <p className="font-semibold font-inter text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                  {quizData?.task_title ||
                    currentTask?.task_title ||
                    decodedTaskName ||
                    "Week 8 Individual Activity"}
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <p
                    className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                    style={{ opacity: 0.7 }}
                  >
                    Due Date:{" "}
                    <span style={{ opacity: 1 }}>
                      {/* {currentTask?.due_date} */}
                      {formatDueDate(currentTask?.due_date)}
                    </span>
                  </p>
                  {!quizData && !currentTask && (
                    <p
                      className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                      style={{ opacity: 0.7 }}
                    >
                      Task ID: <span style={{ opacity: 1 }}>{task_id}</span>
                    </p>
                  )}
                  {!quizData && !currentTask && (
                    <p
                      className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                      style={{ opacity: 0.7 }}
                    >
                      Space:{" "}
                      <span style={{ opacity: 1 }}>{decodedSpaceName}</span>
                    </p>
                  )}
                  {(quizData?.task_instruction ||
                    currentTask?.task_instruction) && (
                    <p
                      className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                      style={{ opacity: 0.7 }}
                    >
                      Instructions:{" "}
                      <span style={{ opacity: 1 }} className="break-words">
                        {quizData?.task_instruction ||
                          currentTask?.task_instruction}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Students Who Took Quiz Table */}
            <div className="mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-semibold">
                  Students Who Completed This Quiz:
                </h3>
                <button
                  onClick={handleResponseSummary}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#d97706";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f59e0b";
                  }}
                >
                  <FiBarChart2 size={16} />
                  Response Summary
                </button>
              </div>

              {/* Mobile Card View - For small screens */}
              <div className="block sm:hidden">
                <div className="space-y-3">
                  {allUserCompletedTask.map((student) => (
                    <div
                      key={student.account_id}
                      className="rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                        transition: "background-color 0.2s ease",
                      }}
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className="font-medium text-sm"
                          style={{ color: currentColors.text }}
                        >
                          {student.full_name}
                        </h4>
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: currentColors.surface,
                            color: currentColors.primary || currentColors.text,
                          }}
                        >
                          {student.score}/{student.total_items_score}
                        </span>
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Completed:{" "}
                        {new Date(student.completed_at).toLocaleDateString()} at{" "}
                        {new Date(student.completed_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Click to view answers
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View - For medium screens and up */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div
                      className="overflow-hidden shadow-sm rounded-lg border"
                      style={{ borderColor: currentColors.border }}
                    >
                      <table
                        className="min-w-full divide-y"
                        style={{ borderColor: currentColors.border }}
                      >
                        <thead
                          style={{
                            backgroundColor: currentColors.surface,
                            borderBottom: `2px solid ${currentColors.border}`,
                          }}
                        >
                          <tr>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold"
                              style={{ color: currentColors.text }}
                            >
                              Student Name
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold"
                              style={{ color: currentColors.text }}
                            >
                              Score
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold"
                              style={{ color: currentColors.text }}
                            >
                              Total Items
                            </th>
                            <th
                              className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold"
                              style={{ color: currentColors.text }}
                            >
                              Completed
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className="divide-y"
                          style={{ borderColor: currentColors.border }}
                        >
                          {allUserCompletedTask?.map((student) => (
                            <tr
                              key={student.account_id}
                              className="cursor-pointer transition-all hover:shadow-md"
                              style={{
                                backgroundColor: currentColors.background,
                                transition: "background-color 0.2s ease",
                              }}
                              onClick={() => handleStudentClick(student)}
                            >
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm"
                                style={{ color: currentColors.text }}
                              >
                                <div className="flex items-center gap-2">
                                  <div>
                                    <div>{student.full_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm"
                                style={{ color: currentColors.text }}
                              >
                                <span
                                  className="font-medium"
                                  style={{
                                    color:
                                      currentColors.primary ||
                                      currentColors.text,
                                  }}
                                >
                                  {student.score}
                                </span>
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm"
                                style={{ color: currentColors.text }}
                              >
                                {student.total_items_score}
                              </td>
                              <td
                                className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm"
                                style={{ color: currentColors.text }}
                              >
                                <div>
                                  <div>
                                    {new Date(
                                      student.completed_at,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div
                                    className="text-xs"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    {new Date(
                                      student.completed_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty state message when no students have taken the quiz */}
              {false && ( // Change to true when no data is available
                <div
                  className="text-center py-8 sm:py-12"
                  style={{ color: currentColors.textSecondary }}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
                  <p className="text-sm sm:text-base">
                    No students have completed this quiz yet.
                  </p>
                  <p className="text-xs sm:text-sm mt-1">
                    Check back later for submissions.
                  </p>
                </div>
              )}
            </div>

            {/* Student Answers Modal */}
            {showStudentAnswers && selectedStudent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                  className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  style={{ backgroundColor: currentColors.background }}
                >
                  {/* Modal Header */}
                  <div
                    className="sticky top-0 p-4 border-b flex justify-between items-center"
                    style={{
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.border,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{
                          backgroundColor:
                            currentColors.primary || currentColors.accent,
                        }}
                      >
                        {selectedStudent.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold"
                          style={{ color: currentColors.text }}
                        >
                          {selectedStudent.student_name}'s Answers
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: currentColors.textSecondary }}
                        >
                          {selectedStudent.student_email}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span style={{ color: currentColors.text }}>
                            Score:{" "}
                            <strong>
                              {selectedStudent.score}/
                              {selectedStudent.total_score}
                            </strong>
                          </span>
                          <span style={{ color: currentColors.textSecondary }}>
                            Completed:{" "}
                            {new Date(
                              selectedStudent.completed_at,
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              selectedStudent.completed_at,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowStudentAnswers(false);
                        setSelectedStudent(null);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: currentColors.text }}
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {mockQuizQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="font-bold text-lg"
                              style={{
                                color:
                                  currentColors.primary || currentColors.accent,
                              }}
                            >
                              {question.id}.
                            </span>
                            <div className="flex-1">
                              <p
                                className="font-medium mb-3"
                                style={{ color: currentColors.text }}
                              >
                                {question.question}
                              </p>

                              {/* Answer Options */}
                              <div className="space-y-2 mb-3">
                                {question.answers.map((answer, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 p-2 rounded ${
                                      answer.is_correct
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-gray-50 border border-gray-200"
                                    }`}
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                      style={{
                                        backgroundColor: answer.is_correct
                                          ? "#10b981"
                                          : currentColors.border,
                                        color: answer.is_correct
                                          ? "white"
                                          : currentColors.text,
                                      }}
                                    >
                                      {answer.letter_identifier ||
                                        String.fromCharCode(65 + index)}
                                    </div>
                                    <span
                                      className="text-sm"
                                      style={{ color: currentColors.text }}
                                    >
                                      {answer.answer_text}
                                    </span>
                                    {answer.is_correct && (
                                      <FiCheck
                                        className="text-green-600 ml-auto"
                                        size={16}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Student Answer Display */}
                              {selectedStudent.answers[question.id] &&
                                renderStudentAnswer(
                                  question,
                                  selectedStudent.answers[question.id],
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfViewActivityPage;
