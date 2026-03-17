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
  FiDownload,
} from "react-icons/fi";
import { useSpace } from "../../../contexts/space/useSpace";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import Button from "../../component/Button";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
);

const ResponseSummaryPage = () => {
  const { space_uuid, space_name, task_name, task_id } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [responseSummaryData, setResponseSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("summary"); // "summary" | "question" | "individual"
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Use useSpace hook to get completed task data
  const { allUserCompletedTask, allUserCompletedTaskLoading, setTaskId } =
    useSpace();

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
  const currentTask = [...uploadedTasks, ...draftedTasks].find(
    (t) => t.task_id === task_id || t.task_id === task_id,
  );

  // Decode URL parameters
  const decodedSpaceName = decodeURIComponent(space_name || "");
  const decodedTaskName = decodeURIComponent(task_name || "");

  // Set task ID for useSpace hook
  if (task_id) {
    setTaskId(task_id);
  }

  // Get real student data from allUserCompletedTask
  const realStudentData = allUserCompletedTask?.students || [];

  // Get real questions from allUserCompletedTask
  const realQuestions = allUserCompletedTask?.questions || [];

  // Admin Dashboard Theme
  const THEME = {
    bg: "#FFFFFF",
    card: "#F9FAFB",
    border: "#E5E7EB",
    text: "#111827",
    muted: "#6B7280",
    blue: "#3B82F6",
    green: "#10B981",
    indigo: "#6366F1",
    teal: "#14B8A6",
    amber: "#F59E0B",
    rose: "#F43F5E",
    purple: "#A855F7",
    orange: "#F97316",
  };

  const PALETTE = [
    THEME.blue,
    THEME.green,
    THEME.indigo,
    THEME.teal,
    THEME.amber,
    THEME.rose,
    THEME.purple,
    THEME.orange,
  ];

  const baseTooltip = {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    titleColor: "#111827",
    bodyColor: "#6B7280",
    padding: 10,
    cornerRadius: 8,
  };

  // Helper function to check if answer is correct
  const checkIfAnswerIsCorrect = (question, studentAnswer) => {
    if (!question.answers || !studentAnswer) return false;

    const correctAnswer = question.answers.find((a) => a.is_correct);
    if (!correctAnswer) return false;

    // Debug logging for true-false questions
    if (question.question_type === "true-false") {
      // console.log('True-False Question Debug:', {
      //   questionText: question.question,
      //   studentAnswer,
      //   correctLetter: correctAnswer.letter_identifier,
      //   correctChoice: correctAnswer.choice_answer,
      //   studentMatchesLetter: studentAnswer === correctAnswer.letter_identifier,
      //   studentMatchesChoice: studentAnswer.toLowerCase() === correctAnswer.choice_answer.toLowerCase()
      // });

      // Try to match with letter_identifier first (T/F), then with choice_answer (True/False)
      return (
        studentAnswer === correctAnswer.letter_identifier ||
        studentAnswer.toLowerCase() ===
          correctAnswer.choice_answer.toLowerCase()
      );
    }

    // Debug logging for other question types
    // console.log("General Question Debug:", {
    //   questionText: question.question,
    //   studentAnswer,
    //   correctLetter: correctAnswer.letter_identifier,
    //   correctChoice: correctAnswer.choice_answer,
    //   studentMatchesLetter: studentAnswer === correctAnswer.letter_identifier,
    //   studentMatchesChoice:
    //     studentAnswer.toLowerCase() ===
    //     correctAnswer.choice_answer.toLowerCase(),
    // });

    // For other question types, check if student answer matches letter_identifier or any part of choice_answer
    const correctChoiceParts = correctAnswer.choice_answer
      .split(",")
      .map((part) => part.trim().toLowerCase());
    return (
      studentAnswer === correctAnswer.letter_identifier ||
      correctChoiceParts.includes(studentAnswer.toLowerCase())
    );
  };

  // Determine which chart type to use based on question type — matches Google Forms style
  const getChartType = (question) => {
    const type = question.question_type?.toLowerCase();
    if (type === "true-false" || type === "truefalse") return "bar-horizontal";
    if (
      type === "identification" ||
      type === "short-answer" ||
      type === "essay"
    )
      return "text-list";
    // multiple choice / default → pie
    return "pie";
  };

  // Helper function to build chart data (shared between chart types)
  const generateChartData = (question) => {
    const answerCounts = {};
    realStudentData.forEach((student) => {
      const studentAnswer =
        student.answers?.[question.question_id] ||
        student.answers?.[question.position];
      if (studentAnswer) {
        answerCounts[studentAnswer] = (answerCounts[studentAnswer] || 0) + 1;
      }
    });

    const rawLabels = Object.keys(answerCounts);
    const values = Object.values(answerCounts);

    const resolvedLabels = rawLabels.map((label) => {
      const answer = question.answers?.find(
        (a) =>
          a.letter_identifier === label ||
          a.choice_answer?.toLowerCase() === label.toLowerCase(),
      );
      return answer ? answer.choice_answer : label;
    });

    return { rawLabels, resolvedLabels, values };
  };

  // Helper function to generate pie chart data for questions using admin dashboard styling
  const generatePieChartData = (question) => {
    const { resolvedLabels, values } = generateChartData(question);
    return {
      labels: resolvedLabels,
      datasets: [
        {
          data: values,
          backgroundColor: resolvedLabels.map(
            (_, i) => PALETTE[i % PALETTE.length],
          ),
          borderColor: isDarkMode ? "#1e2330" : THEME.bg,
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  };

  // Generate horizontal bar chart data (best for multiple choice ≤4 options)
  const generateBarChartData = (question, horizontal = true) => {
    const { resolvedLabels, values } = generateChartData(question);
    const correctAnswer = question.answers?.find((a) => a.is_correct);

    const backgroundColors = resolvedLabels.map((label) => {
      const answer = question.answers?.find((a) => a.choice_answer === label);
      if (answer?.is_correct) return THEME.green;
      return isDarkMode ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.65)";
    });

    return {
      labels: resolvedLabels,
      datasets: [
        {
          label: "Responses",
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((c) =>
            c.replace("0.7", "1").replace("0.65", "1"),
          ),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  };

  // Chart options for horizontal bar
  const barHorizontalOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct =
              total > 0 ? ((ctx.parsed.x / total) * 100).toFixed(1) : 0;
            return `  ${ctx.parsed.x} student${ctx.parsed.x !== 1 ? "s" : ""} (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: THEME.muted, stepSize: 1, precision: 0 },
        grid: {
          color: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
        },
      },
      y: {
        ticks: {
          color: THEME.muted,
          font: { size: 12 },
          callback: function (val, idx) {
            const label = this.getLabelForValue(val);
            return label?.length > 20 ? label.slice(0, 20) + "…" : label;
          },
        },
        grid: { display: false },
      },
    },
  };

  // Chart options using admin dashboard styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: THEME.muted,
          padding: 10,
          font: { size: 10 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return `  ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  // Generate response summary data
  const generateResponseSummaryData = () => {
    if (!realStudentData.length || !realQuestions.length) {
      setIsLoading(false);
      return;
    }

    const summaryData = {
      quizTitle:
        quizData?.task_title ||
        currentTask?.task_title ||
        decodedTaskName ||
        "Quiz",
      totalStudents: realStudentData.length,
      passedStudents: realStudentData.filter((s) => {
        const percentage = (s.score / s.total_items_score) * 100;
        return percentage >= 60;
      }).length,
      failedStudents: realStudentData.filter((s) => {
        const percentage = (s.score / s.total_items_score) * 100;
        return percentage < 60;
      }).length,
      averageScore: Math.round(
        realStudentData.reduce((acc, s) => {
          const percentage = (s.score / s.total_items_score) * 100;
          return acc + percentage;
        }, 0) / realStudentData.length,
      ),
      passRate: Math.round(
        (realStudentData.filter((s) => {
          const percentage = (s.score / s.total_items_score) * 100;
          return percentage >= 60;
        }).length /
          realStudentData.length) *
          100,
      ),
      questionAnalysis: realQuestions.map((question) => {
        const correctAnswer = question.answers.find((a) => a.is_correct);
        const incorrectCounts = {};

        realStudentData.forEach((student) => {
          const studentAnswer =
            student.answers?.[question.question_id] ||
            student.answers?.[question.position];
          const isCorrect = checkIfAnswerIsCorrect(question, studentAnswer);

          if (!isCorrect && studentAnswer) {
            incorrectCounts[studentAnswer] =
              (incorrectCounts[studentAnswer] || 0) + 1;
          }
        });

        return {
          questionId: question.question_id || question.position,
          questionText: question.question,
          correctAnswer:
            correctAnswer?.letter_identifier ||
            correctAnswer?.choice_answer ||
            "N/A",
          incorrectAnswers: incorrectCounts,
          correctCount: realStudentData.filter((s) => {
            const studentAnswer =
              s.answers?.[question.question_id] ||
              s.answers?.[question.position];
            return checkIfAnswerIsCorrect(question, studentAnswer);
          }).length,
          incorrectCount: realStudentData.filter((s) => {
            const studentAnswer =
              s.answers?.[question.question_id] ||
              s.answers?.[question.position];
            return !checkIfAnswerIsCorrect(question, studentAnswer);
          }).length,
        };
      }),
      studentResults: realStudentData.map((student) => {
        const percentage = Math.round(
          (student.score / student.total_items_score) * 100,
        );
        return {
          name: student.student_name,
          score: percentage,
          status: percentage >= 60 ? "passed" : "failed",
          answers: student.answers,
        };
      }),
    };

    setResponseSummaryData(summaryData);
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch quiz data based on currentTask from useTasks
    // console.log(
    //   "Fetching quiz data for task_id:",
    //   task_id,
    //   "space_uuid:",
    //   space_uuid,
    // );
    // console.log("Current task found:", currentTask);
    // console.log("All user completed task:", allUserCompletedTask);

    try {
      // Use currentTask data if found
      if (currentTask) {
        setQuizData(currentTask);
      } else {
        // Fallback to localStorage for local tasks
        const savedQuiz = localStorage.getItem("quizTask");
        if (savedQuiz) {
          const parsedQuiz = JSON.parse(savedQuiz);

          // Check if this quiz matches the current task_id
          if (parsedQuiz.task_id === task_id || parsedQuiz.id === task_id) {
            setQuizData(parsedQuiz);
          }
        }
      }

      // Generate response summary data when real data is available
      if (realStudentData.length > 0 && realQuestions.length > 0) {
        generateResponseSummaryData();
      } else if (!allUserCompletedTaskLoading) {
        // If loading is complete but no data, stop loading
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setIsLoading(false);
    }
  }, [
    task_id,
    space_uuid,
    currentTask,
    allUserCompletedTask,
    allUserCompletedTaskLoading,
    realStudentData,
    realQuestions,
  ]);

  const exportToExcel = () => {
    if (!responseSummaryData) return;

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Overview ──
    const overviewData = [
      ["Quiz Title", responseSummaryData.quizTitle || "Quiz"],
      ["Total Students", responseSummaryData.totalStudents],
      ["Passed", responseSummaryData.passedStudents],
      ["Failed", responseSummaryData.failedStudents],
      ["Pass Rate", `${responseSummaryData.passRate}%`],
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    overviewSheet["!cols"] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, overviewSheet, "Overview");

    // ── Sheet 2: Student Results ──
    const studentHeaders = [["Student Name", "Score (%)", "Status"]];
    const studentRows = (responseSummaryData.studentResults || []).map((s) => [
      s.name,
      s.score,
      s.status,
    ]);
    const studentSheet = XLSX.utils.aoa_to_sheet([
      ...studentHeaders,
      ...studentRows,
    ]);
    studentSheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, studentSheet, "Student Results");

    // ── Sheet 3: Question Analysis ──
    const qaHeaders = [
      [
        "Question ID",
        "Question",
        "Correct Answer",
        "Correct Responses",
        "Incorrect Responses",
        "Common Mistakes",
      ],
    ];
    const qaRows = (responseSummaryData.questionAnalysis || []).map((q) => [
      q.questionId,
      q.questionText,
      q.correctAnswer,
      q.correctCount,
      q.incorrectCount,
      Object.entries(q.incorrectAnswers || {})
        .map(([ans, cnt]) => `${ans}: ${cnt}`)
        .join(", ") || "None",
    ]);
    const qaSheet = XLSX.utils.aoa_to_sheet([...qaHeaders, ...qaRows]);
    qaSheet["!cols"] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, qaSheet, "Question Analysis");

    const filename = `Response_Summary_${(responseSummaryData.quizTitle || "Quiz").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

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

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen font-sans"
        style={{ backgroundColor: currentColors.background }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p style={{ color: currentColors.text }}>
              Loading response summary...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div
          className="sticky top-0 z-30 border-b p-4 sm:p-6"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text,
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden bg-transparent border-none text-xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-transparent border-none p-2 text-base font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
              <FiArrowLeft size={20} />
              Back to Quiz Details
            </button>
          </div>
          <div className="flex items-center justify-between mt-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold flex-1 min-w-0 truncate">
              Response Summary - {responseSummaryData?.quizTitle || "Quiz"}
            </h1>
            <Button
              onClick={exportToExcel}
              className="flex-shrink-0"
              style={{
                borderRadius: "8px",
                padding: "0.6em 1.5em",
                fontSize: "0.875rem",
                minWidth: "160px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiDownload className="mr-2" />
              Export to Excel
            </Button>
          </div>

          {/* View Tabs — like Google Forms */}
          <div
            className="flex gap-0 mt-4 border-b"
            style={{ borderColor: currentColors.border }}
          >
            {[
              { key: "summary", label: "Summary" },
              { key: "question", label: "Question" },
              { key: "individual", label: "Individual" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className="px-5 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderBottom:
                    activeView === tab.key
                      ? "2px solid #3B82F6"
                      : "2px solid transparent",
                  color:
                    activeView === tab.key
                      ? "#3B82F6"
                      : currentColors.textSecondary,
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom:
                    activeView === tab.key
                      ? "2px solid #3B82F6"
                      : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow: "none",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  if (activeView !== tab.key)
                    e.currentTarget.style.color = "#3B82F6";
                }}
                onMouseLeave={(e) => {
                  if (activeView !== tab.key)
                    e.currentTarget.style.color = currentColors.textSecondary;
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ── SUMMARY TAB ── */}
          {activeView === "summary" && (
            <>
              {/* Overview Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div
                  className="rounded-xl p-4 sm:p-6 border shadow-sm"
                  style={{
                    background:
                      "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                    borderColor: "rgba(0,191,255,0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    {responseSummaryData?.totalStudents}
                  </div>
                  <div
                    className="text-xs sm:text-sm"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Total Students
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 sm:p-6 border shadow-sm"
                  style={{
                    background:
                      "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                    borderColor: "rgba(0,191,255,0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    {responseSummaryData?.passedStudents}
                  </div>
                  <div
                    className="text-xs sm:text-sm"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Passed
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 sm:p-6 border shadow-sm"
                  style={{
                    background:
                      "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                    borderColor: "rgba(0,191,255,0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    {responseSummaryData?.failedStudents}
                  </div>
                  <div
                    className="text-xs sm:text-sm"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Failed
                  </div>
                </div>
                <div
                  className="rounded-xl p-4 sm:p-6 border shadow-sm"
                  style={{
                    background:
                      "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                    borderColor: "rgba(0,191,255,0.3)",
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    {responseSummaryData?.passRate}%
                  </div>
                  <div
                    className="text-xs sm:text-sm"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Pass Rate
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── QUESTION TAB ── */}
          {activeView === "question" && (
            <div className="mb-8">
              <h2
                className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6"
                style={{ color: currentColors.text }}
              >
                Question Analysis - Response Distribution
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {responseSummaryData?.questionAnalysis?.map(
                  (question, index) => {
                    const realQuestion = realQuestions.find(
                      (q) =>
                        (q.question_id &&
                          q.question_id === question.questionId) ||
                        (q.position && q.position === question.questionId),
                    );
                    const chartType = realQuestion
                      ? getChartType(realQuestion)
                      : "pie";
                    const chartData =
                      realQuestion && chartType !== "text-list"
                        ? chartType === "bar-horizontal"
                          ? generateBarChartData(realQuestion, true)
                          : generatePieChartData(realQuestion)
                        : null;

                    // For text-list (identification), collect raw answers
                    const textAnswers =
                      chartType === "text-list" && realQuestion
                        ? realStudentData
                            .map(
                              (student) =>
                                student.answers?.[realQuestion.question_id] ||
                                student.answers?.[realQuestion.position],
                            )
                            .filter(Boolean)
                        : [];

                    // Chart type label for UI badge
                    const chartTypeLabels = {
                      "bar-horizontal": "True / False",
                      "text-list": "Identification",
                      pie: "Multiple Choice",
                    };
                    const chartBadge =
                      chartTypeLabels[chartType] || "Response Distribution";

                    return (
                      <div
                        key={question.questionId}
                        className="rounded-xl p-4 sm:p-5 sm:p-6 border shadow-sm"
                        style={{
                          backgroundColor: currentColors.surface,
                          borderColor: currentColors.border,
                          color: currentColors.text,
                        }}
                      >
                        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <span
                              className="font-medium text-base sm:text-lg"
                              style={{ color: currentColors.text }}
                            >
                              Q{question.questionId}:
                            </span>
                            <span
                              className="ml-2 text-base sm:text-lg break-words"
                              style={{ color: currentColors.text }}
                            >
                              {question.questionText}
                            </span>
                          </div>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                            style={{
                              backgroundColor: isDarkMode
                                ? "rgba(99,102,241,0.18)"
                                : "rgba(99,102,241,0.1)",
                              color: THEME.indigo,
                            }}
                          >
                            {chartBadge}
                          </span>
                        </div>

                        {/* ── Text list (Identification / Short answer) — like Google Forms ── */}
                        {chartType === "text-list" && (
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div
                              className="rounded-xl border shadow-sm w-full sm:flex-1"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                            >
                              <div
                                className="px-4 py-3 border-b"
                                style={{ borderColor: currentColors.border }}
                              >
                                <h4
                                  className="text-xs font-semibold uppercase tracking-wider"
                                  style={{ color: currentColors.textSecondary }}
                                >
                                  {textAnswers.length} response
                                  {textAnswers.length !== 1 ? "s" : ""}
                                </h4>
                              </div>
                              <div
                                className="divide-y max-h-64 overflow-y-auto"
                                style={{ borderColor: currentColors.border }}
                              >
                                {textAnswers.length > 0 ? (
                                  textAnswers.map((ans, i) => (
                                    <div
                                      key={i}
                                      className="px-4 py-3 text-sm"
                                      style={{
                                        color: currentColors.text,
                                        borderColor: currentColors.border,
                                      }}
                                    >
                                      {ans}
                                    </div>
                                  ))
                                ) : (
                                  <div
                                    className="px-4 py-6 text-sm text-center"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    No responses yet.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Stats panel for identification */}
                            <div className="flex flex-col gap-3 sm:w-64 flex-shrink-0">
                              <div
                                className="rounded-xl border p-4"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "#1e2330"
                                    : "#F9FAFB",
                                  borderColor: currentColors.border,
                                }}
                              >
                                <h4
                                  className="text-xs font-bold uppercase tracking-wider mb-3"
                                  style={{ color: currentColors.textSecondary }}
                                >
                                  Statistics
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <span
                                      className="text-sm"
                                      style={{ color: "#3B82F6" }}
                                    >
                                      Total Responses
                                    </span>
                                    <span
                                      className="text-sm font-semibold"
                                      style={{ color: currentColors.text }}
                                    >
                                      {textAnswers.length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {chartData && (
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Chart — left side */}
                            <div
                              className="rounded-xl border shadow-sm flex-shrink-0 w-full sm:w-auto"
                              style={{
                                backgroundColor: currentColors.surface,
                                borderColor: currentColors.border,
                              }}
                            >
                              <div
                                className="px-4 py-3 border-b"
                                style={{ borderColor: currentColors.border }}
                              >
                                <h4
                                  className="text-xs font-semibold uppercase tracking-wider"
                                  style={{ color: currentColors.textSecondary }}
                                >
                                  Response Distribution
                                </h4>
                              </div>
                              <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                                {/* Horizontal Bar — true/false */}
                                {chartType === "bar-horizontal" && (
                                  <div
                                    style={{
                                      width: "100%",
                                      minWidth: 300,
                                      height: Math.max(
                                        100,
                                        chartData.labels.length * 52,
                                      ),
                                    }}
                                  >
                                    <Bar
                                      data={chartData}
                                      options={barHorizontalOptions}
                                    />
                                  </div>
                                )}

                                {/* Pie — multiple choice */}
                                {chartType === "pie" && (
                                  <>
                                    <div
                                      className="flex-shrink-0 relative"
                                      style={{
                                        width: 220,
                                        height: 220,
                                        overflow: "hidden",
                                      }}
                                    >
                                      <Pie
                                        data={chartData}
                                        options={{
                                          ...chartOptions,
                                          responsive: true,
                                          maintainAspectRatio: false,
                                          layout: { padding: 10 },
                                          plugins: {
                                            ...chartOptions.plugins,
                                            legend: { display: false },
                                          },
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                      {chartData.labels.map((label, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-2 min-w-0"
                                        >
                                          <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{
                                              backgroundColor:
                                                chartData.datasets[0]
                                                  .backgroundColor[i],
                                            }}
                                          />
                                          <span
                                            className="text-xs break-words flex-1"
                                            style={{
                                              color: currentColors.text,
                                            }}
                                          >
                                            {label}
                                          </span>
                                          <span
                                            className="text-xs font-semibold flex-shrink-0"
                                            style={{
                                              color:
                                                currentColors.textSecondary,
                                            }}
                                          >
                                            {chartData.datasets[0].data[i]}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Right side — Statistics + Common Mistakes */}
                            <div className="flex flex-col gap-3 flex-1 min-w-0">
                              {/* Statistics */}
                              <div
                                className="rounded-xl border p-4"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "#1e2330"
                                    : "#F9FAFB",
                                  borderColor: currentColors.border,
                                }}
                              >
                                <h4
                                  className="text-xs font-bold uppercase tracking-wider mb-3"
                                  style={{ color: currentColors.textSecondary }}
                                >
                                  Statistics
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <span
                                      className="text-sm font-medium"
                                      style={{ color: "#10B981" }}
                                    >
                                      Correct Answer
                                    </span>
                                    <span
                                      className="text-sm font-bold px-2 py-0.5 rounded"
                                      style={{
                                        color: "#10B981",
                                        backgroundColor: isDarkMode
                                          ? "#064e3b"
                                          : "#D1FAE5",
                                      }}
                                    >
                                      {question.correctAnswer}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center gap-2">
                                    <span
                                      className="text-sm"
                                      style={{ color: "#3B82F6" }}
                                    >
                                      Correct Responses
                                    </span>
                                    <span
                                      className="text-sm font-semibold"
                                      style={{ color: currentColors.text }}
                                    >
                                      {question.correctCount} student
                                      {question.correctCount !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center gap-2">
                                    <span
                                      className="text-sm"
                                      style={{ color: "#F43F5E" }}
                                    >
                                      Incorrect Responses
                                    </span>
                                    <span
                                      className="text-sm font-semibold"
                                      style={{ color: currentColors.text }}
                                    >
                                      {question.incorrectCount} student
                                      {question.incorrectCount !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Common Mistakes — green if all correct, red if there are mistakes */}
                              {(() => {
                                const allCorrect =
                                  Object.keys(question.incorrectAnswers)
                                    .length === 0;
                                return (
                                  <div
                                    className="rounded-xl border p-4 flex-1"
                                    style={{
                                      backgroundColor: allCorrect
                                        ? isDarkMode
                                          ? "#052e16"
                                          : "#F0FDF4"
                                        : isDarkMode
                                          ? "#2d0a0a"
                                          : "#FEF2F2",
                                      borderColor: allCorrect
                                        ? isDarkMode
                                          ? "#166534"
                                          : "#bbf7d0"
                                        : isDarkMode
                                          ? "#7f1d1d"
                                          : "#fecaca",
                                    }}
                                  >
                                    <h4
                                      className="text-xs font-bold uppercase tracking-wider mb-3"
                                      style={{
                                        color: allCorrect
                                          ? "#10B981"
                                          : "#F43F5E",
                                      }}
                                    >
                                      Common Mistakes
                                    </h4>
                                    {allCorrect ? (
                                      <div className="flex items-center gap-2">
                                        <span style={{ color: "#10B981" }}>
                                          ✓
                                        </span>
                                        <span
                                          className="text-sm font-medium"
                                          style={{ color: "#10B981" }}
                                        >
                                          All students answered correctly.
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {Object.entries(
                                          question.incorrectAnswers,
                                        ).map(([answer, count]) => (
                                          <div
                                            key={answer}
                                            className="flex justify-between items-center gap-2"
                                          >
                                            <span
                                              className="text-sm break-words flex-1"
                                              style={{ color: "#F43F5E" }}
                                            >
                                              • {answer}
                                            </span>
                                            <span
                                              className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                                              style={{
                                                color:
                                                  currentColors.textSecondary,
                                                backgroundColor: isDarkMode
                                                  ? "#374151"
                                                  : "#F3F4F6",
                                              }}
                                            >
                                              {count} student
                                              {count !== 1 ? "s" : ""}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* ── SUMMARY TAB — Student Results ── */}
          {activeView === "summary" && (
            <div className="mb-8">
              <h2
                className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6"
                style={{ color: currentColors.text }}
              >
                Student Results
              </h2>
              <div
                className="rounded-xl border shadow-sm overflow-hidden"
                style={{
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          backgroundColor: isDarkMode ? "#374151" : "#F9FAFB",
                          borderColor: currentColors.border,
                        }}
                      >
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Student Name
                        </th>
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase tracking-wider"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Score
                        </th>
                        <th
                          className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium uppercase tracking-wider"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: currentColors.border }}
                    >
                      {responseSummaryData?.studentResults?.map(
                        (student, index) => (
                          <tr
                            key={index}
                            className="transition-colors"
                            style={{
                              backgroundColor: currentColors.surface,
                              color: currentColors.text,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? "#374151"
                                : "#F9FAFB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                currentColors.surface;
                            }}
                          >
                            <td
                              className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium break-words max-w-[100px] sm:max-w-none"
                              style={{ color: currentColors.text }}
                            >
                              {student.name}
                            </td>
                            <td
                              className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center"
                              style={{ color: currentColors.text }}
                            >
                              {student.score}%
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                              <span
                                className="px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                style={{
                                  backgroundColor:
                                    student.status === "passed"
                                      ? isDarkMode
                                        ? "#065F46"
                                        : "#D1FAE5"
                                      : isDarkMode
                                        ? "#7F1D1D"
                                        : "#FEE2E2",
                                  color:
                                    student.status === "passed"
                                      ? "#10B981"
                                      : "#EF4444",
                                }}
                              >
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── INDIVIDUAL TAB ── */}
          {activeView === "individual" && (
            <div>
              {/* Student navigator */}
              {responseSummaryData?.studentResults?.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setSelectedStudentIndex((i) => Math.max(0, i - 1))
                        }
                        disabled={selectedStudentIndex === 0}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          borderColor: currentColors.border,
                          color: currentColors.text,
                          backgroundColor: currentColors.surface,
                        }}
                      >
                        ← Prev
                      </button>
                      <span
                        className="text-sm font-medium"
                        style={{ color: currentColors.textSecondary }}
                      >
                        {selectedStudentIndex + 1} /{" "}
                        {responseSummaryData.studentResults.length}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedStudentIndex((i) =>
                            Math.min(
                              responseSummaryData.studentResults.length - 1,
                              i + 1,
                            ),
                          )
                        }
                        disabled={
                          selectedStudentIndex ===
                          responseSummaryData.studentResults.length - 1
                        }
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          borderColor: currentColors.border,
                          color: currentColors.text,
                          backgroundColor: currentColors.surface,
                        }}
                      >
                        Next →
                      </button>
                    </div>

                    {/* Student selector dropdown */}
                    <select
                      value={selectedStudentIndex}
                      onChange={(e) =>
                        setSelectedStudentIndex(Number(e.target.value))
                      }
                      className="px-3 py-1.5 rounded-lg text-sm border"
                      style={{
                        borderColor: currentColors.border,
                        color: currentColors.text,
                        backgroundColor: currentColors.surface,
                      }}
                    >
                      {responseSummaryData.studentResults.map((s, i) => (
                        <option key={i} value={i}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student info card */}
                  {(() => {
                    const student =
                      responseSummaryData.studentResults[selectedStudentIndex];
                    return (
                      <div>
                        <div
                          className="rounded-xl p-4 sm:p-5 mb-6 flex items-center justify-between flex-wrap gap-3"
                          style={{
                            background:
                              "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.25)",
                                color: "white",
                              }}
                            >
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-bold text-white text-base">
                                {student.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "rgba(255,255,255,0.8)" }}
                              >
                                Score: {student.score}% &nbsp;·&nbsp;
                                <span
                                  style={{
                                    color:
                                      student.status === "passed"
                                        ? "#86efac"
                                        : "#fca5a5",
                                  }}
                                >
                                  {student.status === "passed"
                                    ? "Passed"
                                    : "Failed"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Per-question answers */}
                        <div className="space-y-4">
                          {realQuestions.map((question, qIdx) => {
                            const studentAnswer =
                              student.answers?.[question.question_id] ||
                              student.answers?.[question.position];
                            const isCorrect = checkIfAnswerIsCorrect(
                              question,
                              studentAnswer,
                            );
                            const correctAnswer = question.answers?.find(
                              (a) => a.is_correct,
                            );
                            const correctLabel =
                              correctAnswer?.letter_identifier ||
                              correctAnswer?.choice_answer ||
                              "N/A";

                            return (
                              <div
                                key={qIdx}
                                className="rounded-xl border p-4"
                                style={{
                                  backgroundColor: currentColors.surface,
                                  borderColor: isCorrect
                                    ? isDarkMode
                                      ? "#166534"
                                      : "#bbf7d0"
                                    : isDarkMode
                                      ? "#7f1d1d"
                                      : "#fecaca",
                                }}
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <p
                                    className="text-sm font-semibold flex-1"
                                    style={{ color: currentColors.text }}
                                  >
                                    Q{qIdx + 1}. {question.question}
                                  </p>
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                                    style={{
                                      backgroundColor: isCorrect
                                        ? isDarkMode
                                          ? "#052e16"
                                          : "#D1FAE5"
                                        : isDarkMode
                                          ? "#2d0a0a"
                                          : "#FEE2E2",
                                      color: isCorrect ? "#10B981" : "#EF4444",
                                    }}
                                  >
                                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm">
                                  <span
                                    className="px-3 py-1 rounded-lg"
                                    style={{
                                      backgroundColor: isCorrect
                                        ? isDarkMode
                                          ? "#052e16"
                                          : "#D1FAE5"
                                        : isDarkMode
                                          ? "#2d0a0a"
                                          : "#FEE2E2",
                                      color: isCorrect ? "#10B981" : "#EF4444",
                                    }}
                                  >
                                    Student answered:{" "}
                                    <strong>
                                      {studentAnswer || "No answer"}
                                    </strong>
                                  </span>
                                  {!isCorrect && (
                                    <span
                                      className="px-3 py-1 rounded-lg"
                                      style={{
                                        backgroundColor: isDarkMode
                                          ? "#052e16"
                                          : "#D1FAE5",
                                        color: "#10B981",
                                      }}
                                    >
                                      Correct answer:{" "}
                                      <strong>{correctLabel}</strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div
                  className="text-center py-16"
                  style={{ color: currentColors.textSecondary }}
                >
                  <FiUser size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No student responses yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseSummaryPage;
