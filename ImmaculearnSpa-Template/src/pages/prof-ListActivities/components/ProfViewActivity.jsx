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

  // Decode URL parameters
  const decodedSpaceName = decodeURIComponent(space_name || "");
  const decodedTaskName = decodeURIComponent(task_name || "");

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

            {/* Students Who Took Quiz / Groups Information */}
            <div className="mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-semibold">
                  {currentTask?.task_category === 'group-activity' 
                    ? 'Groups in This Activity:'
                    : 'Students Who Completed This Quiz:'
                  }
                </h3>
                {currentTask?.task_category === 'group-activity' ? (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                    }}
                  >
                    <FiUser size={16} />
                    {allUserCompletedTask?.groups?.length || 0} Groups
                  </div>
                ) : (
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
                )}
              </div>

              {/* Mobile Card View - For small screens */}
              <div className="block sm:hidden">
                <div className="space-y-3">
                  {currentTask?.task_category === 'group-activity' 
                    ? [
                      {
                        group_id: 1,
                        group_name: "Group 1",
                        members: [
                          { student_name: "John Smith", is_leader: true },
                          { student_name: "Emily Johnson", is_leader: false },
                          { student_name: "Michael Chen", is_leader: false },
                          { student_name: "Sarah Williams", is_leader: false }
                        ]
                      },
                      {
                        group_id: 2,
                        group_name: "Group 2",
                        members: [
                          { student_name: "David Martinez", is_leader: true },
                          { student_name: "Lisa Anderson", is_leader: false },
                          { student_name: "James Wilson", is_leader: false }
                        ]
                      },
                      {
                        group_id: 3,
                        group_name: "Group 3",
                        members: [
                          { student_name: "Robert Taylor", is_leader: true },
                          { student_name: "Maria Garcia", is_leader: false },
                          { student_name: "Thomas Brown", is_leader: false },
                          { student_name: "Jennifer Davis", is_leader: false },
                          { student_name: "William Miller", is_leader: false }
                        ]
                      },
                      {
                        group_id: 4,
                        group_name: "Group 4",
                        members: [
                          { student_name: "Christopher Lee", is_leader: true },
                          { student_name: "Amanda White", is_leader: false }
                        ]
                      }
                    ].map((group) => (
                        <div
                          key={group.group_id}
                          className="rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md"
                          style={{
                            backgroundColor: currentColors.background,
                            borderColor: currentColors.border,
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {/* Group Name */}
                          <div className="mb-2">
                            <h4
                              className="font-semibold text-sm mb-2"
                              style={{ color: currentColors.text }}
                            >
                              {group.group_name}
                            </h4>
                          </div>

                          {/* Group Leader */}
                          <div className="mb-2">
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: currentColors.textSecondary }}
                            >
                              GROUP LEADER:
                            </div>
                            <div
                              className="text-xs font-medium"
                              style={{ color: currentColors.text }}
                            >
                              {group.members?.find(m => m.is_leader)?.student_name || 'No leader assigned'}
                            </div>
                          </div>

                          {/* Members */}
                          <div className="mb-2">
                            <div
                              className="text-xs font-medium mb-1"
                              style={{ color: currentColors.textSecondary }}
                            >
                              MEMBERS:
                            </div>
                            <div className="space-y-1">
                              {group.members?.filter(m => !m.is_leader).map((member, index) => (
                                <div
                                  key={index}
                                  className="text-xs flex items-center gap-1"
                                  style={{ color: currentColors.text }}
                                >
                                  <span className="text-xs">•</span>
                                  {member.student_name}
                                </div>
                              )) || <div className="text-xs" style={{ color: currentColors.textSecondary }}>No members</div>}
                            </div>
                          </div>

                          {/* Member Count Badge */}
                          <div className="flex justify-end">
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: currentColors.surface,
                                color: currentColors.primary || currentColors.text,
                              }}
                            >
                              {group.members?.length || 0} members
                            </span>
                          </div>
                        </div>
                      ))
                    : allUserCompletedTask?.students?.map((student) => (
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
                              {student.student_name}
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
                      ))
                  }
                </div>
              </div>

              {/* Desktop Table View - For medium screens and up */}
              <div className="hidden sm:block">
                {currentTask?.task_category === 'group-activity' ? (
                  <div>
                    {/* Group Activity - Grid of Group Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Mock data for design demonstration */}
                      {[
                        {
                          group_id: 1,
                          group_name: "Group 1",
                          members: [
                            { student_name: "John Smith", is_leader: true },
                            { student_name: "Emily Johnson", is_leader: false },
                            { student_name: "Michael Chen", is_leader: false },
                            { student_name: "Sarah Williams", is_leader: false }
                          ]
                        },
                        {
                          group_id: 2,
                          group_name: "Group 2",
                          members: [
                            { student_name: "David Martinez", is_leader: true },
                            { student_name: "Lisa Anderson", is_leader: false },
                            { student_name: "James Wilson", is_leader: false }
                          ]
                        },
                        {
                          group_id: 3,
                          group_name: "Group 3",
                          members: [
                            { student_name: "Robert Taylor", is_leader: true },
                            { student_name: "Maria Garcia", is_leader: false },
                            { student_name: "Thomas Brown", is_leader: false },
                            { student_name: "Jennifer Davis", is_leader: false },
                            { student_name: "William Miller", is_leader: false }
                          ]
                        },
                        {
                          group_id: 4,
                          group_name: "Group 4",
                          members: [
                            { student_name: "Christopher Lee", is_leader: true },
                            { student_name: "Amanda White", is_leader: false }
                          ]
                        }
                      ].map((group) => (
                      <div
                        key={group.group_id}
                        className="rounded-lg border p-4 transition-all hover:shadow-md"
                        style={{
                          backgroundColor: currentColors.background,
                          borderColor: currentColors.border,
                        }}
                      >
                        {/* Group Name */}
                        <div className="mb-3">
                          <h4
                            className="font-semibold text-base mb-2"
                            style={{ color: currentColors.text }}
                          >
                            {group.group_name}
                          </h4>
                        </div>

                        {/* Group Leader */}
                        <div className="mb-3">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: currentColors.textSecondary }}
                          >
                            GROUP LEADER:
                          </div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: currentColors.text }}
                          >
                            {group.members?.find(m => m.is_leader)?.student_name || 'No leader assigned'}
                          </div>
                        </div>

                        {/* Members */}
                        <div className="mb-3">
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: currentColors.textSecondary }}
                          >
                            MEMBERS:
                          </div>
                          <div className="space-y-1">
                            {group.members?.filter(m => !m.is_leader).map((member, index) => (
                              <div
                                key={index}
                                className="text-sm flex items-center gap-2"
                                style={{ color: currentColors.text }}
                              >
                                <span className="text-xs">•</span>
                                {member.student_name}
                              </div>
                            )) || <div className="text-sm" style={{ color: currentColors.textSecondary }}>No members</div>}
                          </div>
                        </div>

                        {/* Member Count Badge */}
                        <div className="flex justify-end">
                          <span
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: currentColors.surface,
                              color: currentColors.primary || currentColors.text,
                            }}
                          >
                            {group.members?.length || 0} members
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View All Groups Link - Only show if more than 3 groups */}
                  {4 > 3 && (
                    <div className="flex justify-end">
                      <button
                        className="text-sm font-medium transition-all hover:underline"
                        style={{ color: "#3b82f6" }}
                        onMouseEnter={(e) => {
                          e.target.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.textDecoration = "none";
                        }}
                      >
                        View All Groups
                      </button>
                    </div>
                  )}
                </div>
                ) : (
                  // Quiz Activity - Traditional Table View
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
                            {allUserCompletedTask?.students?.map((student) => (
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
                                      <div>{student.student_name}</div>
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
                )}
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

                        <div className="flex gap-4 mt-1 text-sm">
                          <span style={{ color: currentColors.text }}>
                            Score:{" "}
                            <strong>
                              {selectedStudent.score}/
                              {selectedStudent.total_items_score}
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
                      {allUserCompletedTask?.questions?.map((question) => (
                        <div
                          key={question.position}
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
                              {question.position}.
                            </span>
                            <div className="flex-1">
                              <p
                                className="font-medium mb-3"
                                style={{ color: currentColors.text }}
                              >
                                {question.question}
                              </p>

                              {/* Answer Options - Different display based on question type */}
                              {question.question_type === "identification" ? (
                                /* Identification questions - show correct answer */
                                <div className="space-y-2 mb-3">
                                  <div
                                    className="text-xs sm:text-sm mb-2"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    Student's Answer:
                                  </div>
                                  <div className="flex gap-2">
                                    {(() => {
                                      const studentAnswer =
                                        selectedStudent.answers?.[
                                          question.question_id
                                        ] ||
                                        selectedStudent.answers?.[
                                          question.position
                                        ] ||
                                        "";
                                      const correctAnswers =
                                        question.answers
                                          ?.filter((a) => a.is_correct)
                                          .flatMap((a) =>
                                            a.choice_answer
                                              .split(",")
                                              .map((part) => part.trim()),
                                          ) || [];
                                      const isCorrect = correctAnswers.includes(
                                        studentAnswer.trim(),
                                      );

                                      return (
                                        <div className="flex-1 relative">
                                          <input
                                            type="text"
                                            value={studentAnswer}
                                            readOnly
                                            placeholder="No answer provided"
                                            className={`w-full rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm ${
                                              isCorrect
                                                ? "bg-green-50 border-green-200"
                                                : ""
                                            }`}
                                            style={{
                                              backgroundColor: isCorrect
                                                ? undefined
                                                : currentColors.surface,
                                              color: "black",
                                              borderColor: isCorrect
                                                ? undefined
                                                : currentColors.border,
                                            }}
                                          />
                                          {isCorrect && (
                                            <FiCheck
                                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                                              size={16}
                                            />
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {/* Show correct answers below for reference */}
                                  <div
                                    className="text-xs sm:text-sm mt-2"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    Correct answers:{" "}
                                    {question.answers
                                      ?.filter((a) => a.is_correct)
                                      .map((a) =>
                                        a.choice_answer
                                          .split(",")
                                          .map((part, index) => part.trim())
                                          .join(", "),
                                      )
                                      .join(", ") || "N/A"}
                                  </div>
                                </div>
                              ) : (
                                /* Multiple-choice and true-false questions - show options with student answer */
                                <div className="space-y-2 mb-3">
                                  {question.answers.map((answer, index) => {
                                    const studentAnswer =
                                      selectedStudent.answers?.[
                                        question.question_id
                                      ] ||
                                      selectedStudent.answers?.[
                                        question.position
                                      ] ||
                                      "";
                                    const isStudentAnswer =
                                      question.question_type === "true-false"
                                        ? studentAnswer ===
                                            answer.letter_identifier ||
                                          studentAnswer.toLowerCase() ===
                                            answer.choice_answer.toLowerCase()
                                        : studentAnswer ===
                                          answer.letter_identifier;
                                    const isCorrect = answer.is_correct;

                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-center gap-2 p-2 rounded ${
                                          isStudentAnswer
                                            ? isCorrect
                                              ? "bg-green-50 border border-green-200"
                                              : "bg-red-50 border border-red-200"
                                            : "bg-gray-50 border border-gray-200"
                                        }`}
                                      >
                                        <div
                                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                                          style={{
                                            backgroundColor: isStudentAnswer
                                              ? isCorrect
                                                ? "#10b981"
                                                : "#ef4444"
                                              : currentColors.border,
                                            color: isStudentAnswer
                                              ? "white"
                                              : currentColors.text,
                                          }}
                                        >
                                          {answer.letter_identifier ||
                                            String.fromCharCode(65 + index)}
                                        </div>
                                        <span
                                          className="text-sm"
                                          style={{ color: "black" }}
                                        >
                                          {question.question_type ===
                                          "identification"
                                            ? answer.choice_answer
                                                .split(",")
                                                .map((part, index) => (
                                                  <span key={index}>
                                                    {part.trim()}
                                                    {index <
                                                      answer.choice_answer.split(
                                                        ",",
                                                      ).length -
                                                        1 && ", "}
                                                  </span>
                                                ))
                                            : answer.choice_answer}
                                        </span>
                                        {isStudentAnswer &&
                                          (isCorrect ? (
                                            <FiCheck
                                              className="text-green-600 ml-auto"
                                              size={16}
                                            />
                                          ) : (
                                            <FiXIcon
                                              className="text-red-600 ml-auto"
                                              size={16}
                                            />
                                          ))}
                                      </div>
                                    );
                                  })}
                                  {/* Show correct answer below for reference only when student is incorrect */}
                                  {(() => {
                                    const studentAnswer =
                                      selectedStudent.answers?.[
                                        question.question_id
                                      ] ||
                                      selectedStudent.answers?.[
                                        question.position
                                      ] ||
                                      "";
                                    const correctAnswer =
                                      question.answers?.find(
                                        (a) => a.is_correct,
                                      );
                                    const isStudentCorrect =
                                      correctAnswer &&
                                      (studentAnswer ===
                                        correctAnswer.letter_identifier ||
                                        (question.question_type ===
                                          "true-false" &&
                                          studentAnswer.toLowerCase() ===
                                            correctAnswer.choice_answer.toLowerCase()));

                                    return (
                                      !isStudentCorrect && (
                                        <div
                                          className="text-xs sm:text-sm mt-2"
                                          style={{
                                            color: currentColors.textSecondary,
                                          }}
                                        >
                                          Correct answer:{" "}
                                          {correctAnswer?.choice_answer ||
                                            "N/A"}
                                        </div>
                                      )
                                    );
                                  })()}
                                </div>
                              )}

                              {/* Student Answer Display */}
                              {/* {selectedStudent.answers[question.id] &&
                                renderStudentAnswer(
                                  question,
                                  selectedStudent.answers[question.id],
                                )} */}
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
