import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useTasks } from "../../../hooks/useTasks";
import ProfSidebar from "../../component/profsidebar";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { FiX, FiUser, FiCheck, FiX as FiXIcon, FiBarChart2, FiArrowLeft } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const ResponseSummaryPage = () => {
  const { space_uuid, space_name, task_name, task_id } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [responseSummaryData, setResponseSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
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
  const currentTask = [...uploadedTasks, ...draftedTasks].find(t => t.task_id === task_id || t.task_id === task_id);

  // Decode URL parameters
  const decodedSpaceName = decodeURIComponent(space_name || '');
  const decodedTaskName = decodeURIComponent(task_name || '');

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
      }
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
      }
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
      }
    }
  ];

  // Mock quiz questions - replace with actual quiz data
  const mockQuizQuestions = [
    {
      id: 1,
      question: "What is the primary function of chlorophyll in plants?",
      type: "multiple-choice",
      answers: [
        { letter_identifier: "A", answer_text: "Capture light energy", is_correct: true },
        { letter_identifier: "B", answer_text: "Store water", is_correct: false },
        { letter_identifier: "C", answer_text: "Produce oxygen", is_correct: false },
        { letter_identifier: "D", answer_text: "Absorb nutrients", is_correct: false }
      ]
    },
    {
      id: 2,
      question: "Photosynthesis requires sunlight.",
      type: "true-false",
      answers: [
        { letter_identifier: "T", answer_text: "True", is_correct: true },
        { letter_identifier: "F", answer_text: "False", is_correct: false }
      ]
    },
    {
      id: 3,
      question: "Which gas is released during photosynthesis?",
      type: "multiple-choice",
      answers: [
        { letter_identifier: "A", answer_text: "Carbon dioxide", is_correct: false },
        { letter_identifier: "B", answer_text: "Nitrogen", is_correct: false },
        { letter_identifier: "C", answer_text: "Oxygen", is_correct: true },
        { letter_identifier: "D", answer_text: "Hydrogen", is_correct: false }
      ]
    },
    {
      id: 4,
      question: "Where does photosynthesis primarily occur in plants?",
      type: "multiple-choice",
      answers: [
        { letter_identifier: "A", answer_text: "Roots", is_correct: false },
        { letter_identifier: "B", answer_text: "Leaves", is_correct: true },
        { letter_identifier: "C", answer_text: "Stem", is_correct: false },
        { letter_identifier: "D", answer_text: "Flowers", is_correct: false }
      ]
    },
    {
      id: 5,
      question: "Briefly describe the process of photosynthesis.",
      type: "short-answer",
      answers: [
        { answer_text: "The process by which plants use sunlight, water, and CO2 to produce glucose and oxygen", is_correct: true }
      ]
    }
  ];

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
    
    const correctAnswer = question.answers.find(a => a.is_correct);
    if (!correctAnswer) return false;
    
    // Handle different answer formats
    if (question.type === 'true-false') {
      return studentAnswer.toLowerCase() === correctAnswer.answer_text.toLowerCase();
    }
    
    return studentAnswer === correctAnswer.letter_identifier || 
           studentAnswer.toLowerCase() === correctAnswer.answer_text.toLowerCase();
  };

  // Helper function to generate pie chart data for questions using admin dashboard styling
  const generatePieChartData = (question) => {
    const answerCounts = {};
    
    // Count all answers (correct and incorrect)
    mockStudentData.forEach(student => {
      const studentAnswer = student.answers[question.id];
      if (studentAnswer) {
        answerCounts[studentAnswer] = (answerCounts[studentAnswer] || 0) + 1;
      }
    });

    const labels = Object.keys(answerCounts);
    const values = Object.values(answerCounts);

    return {
      labels: labels.map(label => {
        // Find the answer text for this label
        const answer = question.answers.find(a => 
          a.letter_identifier === label || 
          a.answer_text.toLowerCase() === label.toLowerCase()
        );
        return answer ? answer.answer_text : label;
      }),
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: THEME.bg,
        borderWidth: 2,
        hoverOffset: 10,
      }]
    };
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
    const mockSummaryData = {
      quizTitle: quizData?.task_title || currentTask?.task_title || decodedTaskName || "Quiz",
      totalStudents: mockStudentData.length,
      passedStudents: mockStudentData.filter(s => s.score >= (s.total_score * 0.6)).length,
      failedStudents: mockStudentData.filter(s => s.score < (s.total_score * 0.6)).length,
      averageScore: Math.round(mockStudentData.reduce((acc, s) => acc + (s.score / s.total_score * 100), 0) / mockStudentData.length),
      passRate: Math.round((mockStudentData.filter(s => s.score >= (s.total_score * 0.6)).length / mockStudentData.length) * 100),
      questionAnalysis: mockQuizQuestions.map((question, index) => {
        const correctAnswer = question.answers.find(a => a.is_correct);
        const incorrectCounts = {};
        
        mockStudentData.forEach(student => {
          const studentAnswer = student.answers[question.id];
          const isCorrect = checkIfAnswerIsCorrect(question, studentAnswer);
          
          if (!isCorrect && studentAnswer) {
            incorrectCounts[studentAnswer] = (incorrectCounts[studentAnswer] || 0) + 1;
          }
        });
        
        return {
          questionId: question.id,
          questionText: question.question,
          correctAnswer: correctAnswer?.letter_identifier || correctAnswer?.answer_text || "N/A",
          incorrectAnswers: incorrectCounts,
          correctCount: mockStudentData.filter(s => checkIfAnswerIsCorrect(question, s.answers[question.id])).length,
          incorrectCount: mockStudentData.filter(s => !checkIfAnswerIsCorrect(question, s.answers[question.id])).length
        };
      }),
      studentResults: mockStudentData.map(student => ({
        name: student.student_name,
        score: Math.round(student.score / student.total_score * 100),
        status: student.score >= (student.total_score * 0.6) ? 'passed' : 'failed',
        answers: student.answers
      }))
    };
    
    setResponseSummaryData(mockSummaryData);
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch quiz data based on currentTask from useTasks
    console.log("Fetching quiz data for task_id:", task_id, "space_uuid:", space_uuid);
    console.log("Current task found:", currentTask);
    
    try {
      // Use currentTask data if found
      if (currentTask) {
        console.log("Setting quiz data from currentTask:", currentTask);
        setQuizData(currentTask);
      } else {
        // Fallback to localStorage for local tasks
        const savedQuiz = localStorage.getItem("quizTask");
        if (savedQuiz) {
          const parsedQuiz = JSON.parse(savedQuiz);
          console.log("Found saved quiz data:", parsedQuiz);
          
          // Check if this quiz matches the current task_id
          if (parsedQuiz.task_id === task_id || parsedQuiz.id === task_id) {
            setQuizData(parsedQuiz);
            console.log("Set quiz data from localStorage");
          } else {
            console.log("Saved quiz doesn't match current task_id");
          }
        }
      }
      
      // Generate response summary data
      generateResponseSummaryData();
      
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setIsLoading(false);
    }
  }, [task_id, space_uuid, currentTask]);

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date set";
    try {
      const date = new Date(dueDate);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p style={{ color: currentColors.text }}>Loading response summary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
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
          color: currentColors.text
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
            color: currentColors.text
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
          <h1 className="text-xl sm:text-2xl font-bold mt-4">
            Response Summary - {responseSummaryData?.quizTitle || 'Quiz'}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Overview Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="rounded-xl p-6 border shadow-sm"
              style={{
                background: "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                borderColor: 'rgba(0,191,255,0.3)',
                color: '#FFFFFF'
              }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {responseSummaryData?.totalStudents}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)' }}>Total Students</div>
            </div>
            <div 
              className="rounded-xl p-6 border shadow-sm"
              style={{
                background: "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                borderColor: 'rgba(0,191,255,0.3)',
                color: '#FFFFFF'
              }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {responseSummaryData?.passedStudents}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)' }}>Passed</div>
            </div>
            <div 
              className="rounded-xl p-6 border shadow-sm"
              style={{
                background: "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                borderColor: 'rgba(0,191,255,0.3)',
                color: '#FFFFFF'
              }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {responseSummaryData?.failedStudents}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)' }}>Failed</div>
            </div>
            <div 
              className="rounded-xl p-6 border shadow-sm"
              style={{
                background: "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
                borderColor: 'rgba(0,191,255,0.3)',
                color: '#FFFFFF'
              }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {responseSummaryData?.passRate}%
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)' }}>Pass Rate</div>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6" style={{ color: currentColors.text }}>
              Question Analysis - Response Distribution
            </h2>
            <div className="space-y-8">
              {responseSummaryData?.questionAnalysis?.map((question, index) => {
                const mockQuestion = mockQuizQuestions.find(q => q.id === question.questionId);
                const chartData = mockQuestion ? generatePieChartData(mockQuestion) : null;
                
                return (
                  <div 
                    key={question.questionId} 
                    className="rounded-xl p-5 sm:p-6 border shadow-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                      color: currentColors.text
                    }}
                  >
                    <div className="mb-6">
                      <span 
                        className="font-medium text-lg"
                        style={{ color: currentColors.text }}
                      >
                        Q{question.questionId}:
                      </span>
                      <span className="ml-2 text-lg" style={{ color: currentColors.text }}>
                        {question.questionText}
                      </span>
                    </div>
                    
                    {chartData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart - Admin Dashboard Style */}
                        <div 
                          className="rounded-xl border shadow-sm"
                          style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border
                          }}
                        >
                          <div 
                            className="p-4 border-b"
                            style={{ borderColor: currentColors.border }}
                          >
                            <h4 
                              className="text-sm font-semibold uppercase tracking-wider"
                              style={{ color: currentColors.textSecondary }}
                            >
                              Response Distribution
                            </h4>
                          </div>
                          <div className="p-4" style={{ height: 300 }}>
                            <Pie data={chartData} options={chartOptions} />
                          </div>
                        </div>
                        
                        {/* Statistics */}
                        <div className="space-y-4">
                          <div 
                            className="rounded-lg p-4"
                            style={{
                              backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                              color: currentColors.text
                            }}
                          >
                            <h4 
                              className="text-sm font-semibold uppercase tracking-wider mb-3"
                              style={{ color: currentColors.textSecondary }}
                            >
                              Statistics
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span 
                                  className="text-sm font-medium"
                                  style={{ color: '#10B981' }}
                                >
                                  Correct Answer:
                                </span>
                                <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                                  {question.correctAnswer}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span 
                                  className="text-sm"
                                  style={{ color: '#3B82F6' }}
                                >
                                  Correct Responses:
                                </span>
                                <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                                  {question.correctCount} students
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span 
                                  className="text-sm"
                                  style={{ color: '#F43F5E' }}
                                >
                                  Incorrect Responses:
                                </span>
                                <span className="text-sm font-medium" style={{ color: currentColors.text }}>
                                  {question.incorrectCount} students
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div 
                            className="rounded-lg p-4"
                            style={{
                              backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2',
                              color: currentColors.text
                            }}
                          >
                            <h4 
                              className="text-sm font-semibold uppercase tracking-wider mb-3"
                              style={{ color: '#F43F5E' }}
                            >
                              Common Mistakes
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(question.incorrectAnswers).map(([answer, count]) => (
                                <div key={answer} className="flex justify-between items-center">
                                  <span 
                                    className="text-sm"
                                    style={{ color: '#F43F5E' }}
                                  >
                                    • {answer}
                                  </span>
                                  <span 
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                      color: currentColors.textSecondary,
                                      backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
                                    }}
                                  >
                                    {count} students
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            {Object.keys(question.incorrectAnswers).length === 0 && (
                              <div 
                                className="text-sm font-medium flex items-center gap-2"
                                style={{ color: '#10B981' }}
                              >
                                <span style={{ color: '#10B981' }}>✓</span>
                                All students answered correctly!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Results */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6" style={{ color: currentColors.text }}>
              Student Results
            </h2>
            <div 
              className="rounded-xl border shadow-sm overflow-hidden"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr 
                      className="border-b"
                      style={{
                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                        borderColor: currentColors.border
                      }}
                    >
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Student Name
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Score
                      </th>
                      <th 
                        className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentColors.textSecondary }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                    {responseSummaryData?.studentResults?.map((student, index) => (
                      <tr 
                        key={index} 
                        className="transition-colors"
                        style={{
                          backgroundColor: currentColors.surface,
                          color: currentColors.text
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = currentColors.surface;
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: currentColors.text }}>
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center" style={{ color: currentColors.text }}>
                          {student.score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span 
                            className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor: student.status === 'passed' 
                                ? (isDarkMode ? '#065F46' : '#D1FAE5')
                                : (isDarkMode ? '#7F1D1D' : '#FEE2E2'),
                              color: student.status === 'passed' 
                                ? '#10B981' 
                                : '#EF4444'
                            }}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseSummaryPage;
