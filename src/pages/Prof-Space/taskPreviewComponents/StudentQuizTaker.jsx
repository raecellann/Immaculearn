import React, { useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useSpace } from "../../../contexts/space/useSpace";

const StudentQuizTaker = ({ quizData, onSubmit, onExit }) => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const { questionnaire, setTaskId } = useSpace();
  console.log(questionnaire);

  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Parse questions from the task data
  const getQuestions = () => {
    if (!questionnaire || questionnaire.length === 0) return [];
    return questionnaire?.map((questionObj, index) => {
      const question = questionObj;
      return {
        // id: index + 1,
        question_id: question?.question_id,
        question: question?.question,
        type: determineQuestionType(
          question?.choices || [],
          question?.question_type,
        ),
        answers: question?.choices || [],
        points: Math.floor(
          (quizData?.total_score || 100) / (quizData?.questions?.length || 1),
        ),
      };
    });
  };

  const determineQuestionType = (answers, questionType) => {
    // If question_type is explicitly "mcq", treat as multiple-choice
    if (questionType === "mcq") return "multiple-choice";

    if (!answers || answers.length === 0) return "short-answer";
    if (
      answers.length === 2 &&
      answers.some((a) => a.letter_identifier === "T") &&
      answers.some((a) => a.letter_identifier === "F")
    )
      return "true-false";
    if (
      answers.length > 2 &&
      answers.every((a) => /^[A-Z]$/.test(a.letter_identifier))
    )
      return "multiple-choice";
    return "short-answer";
  };

  const handleOptionClick = (questionId, choice_id) => {
    setUserAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(answer => answer.question_id === questionId);
      
      if (existingAnswerIndex !== -1) {
        // Update existing answer
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = { question_id: questionId, choice_id: choice_id };
        return updatedAnswers;
      } else {
        // Add new answer
        return [...prev, { question_id: questionId, choice_id: choice_id }];
      }
    });
  };

  const handleTextAnswer = (questionId, answer) => {
    setUserAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(ans => ans.question_id === questionId);
      
      if (existingAnswerIndex !== -1) {
        // Update existing answer
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = { question_id: questionId, text_answer: answer };
        return updatedAnswers;
      } else {
        // Add new answer
        return [...prev, { question_id: questionId, text_answer: answer }];
      }
    });
  };

  const handleStartQuiz = () => {
    setTaskId(quizData.task_id);
    setQuizStarted(true);
  };
  const handleSubmit = () => setShowSubmitConfirm(true);
  const confirmSubmit = () => onSubmit(userAnswers);

  const questions = getQuestions();
  const answeredQuestions = userAnswers.length;
  const progress =
    questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

  // Pagination: only if > 10 questions
  const usesPagination = questions.length > 10;
  const questionsPerPage = usesPagination
    ? Math.ceil(questions.length / Math.ceil(questions.length / 10))
    : questions.length;
  const totalPages = usesPagination
    ? Math.ceil(questions.length / questionsPerPage)
    : 1;
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newStartIndex = page * questionsPerPage;
    setCurrentQuestion(Math.min(newStartIndex, questions.length - 1));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      if (usesPagination && next >= endIndex) setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      if (usesPagination && prev < startIndex) setCurrentPage(currentPage - 1);
    }
  };

  const getOptionClass = (selected) => {
    const base =
      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200";
    if (selected)
      return `${base} border-blue-500 ${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"}`;
    return `${base} ${isDarkMode ? "border-gray-600 hover:border-gray-400 hover:bg-gray-700/40" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`;
  };

  const getLetterBadgeClass = (selected) => {
    const base =
      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all";
    if (selected) return `${base} bg-blue-600 border-blue-600 text-white`;
    return `${base} ${isDarkMode ? "border-gray-500 text-gray-400" : "border-gray-300 text-gray-500"}`;
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "multiple-choice":
      case "true-false":
        return (
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const selected = userAnswers.some(
                userAnswer => userAnswer.question_id === question.question_id && userAnswer.choice_id === answer.choice_id
              );
              return (
                <div
                  key={index}
                  className={getOptionClass(selected)}
                  onClick={() =>
                    handleOptionClick(question.question_id, answer.choice_id)
                  }
                >
                  <div className={getLetterBadgeClass(selected)}>
                    {answer.letter_identifier}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: currentColors.text }}
                    >
                      {answer.choice_answer}
                    </p>
                  </div>
                  {selected && (
                    <FiCheck
                      size={20}
                      className="text-blue-500 flex-shrink-0 mt-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        );

      case "short-answer":
      default:
        const userAnswer = userAnswers.find(answer => answer.question_id === question.question_id);
              const answerValue = userAnswer?.text_answer || "";
              
              return (
                <div
                  className={`rounded-xl border-2 overflow-hidden transition-colors ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
                >
                  <textarea
                    placeholder="Type your answer here..."
                    className="w-full p-4 resize-none h-36 text-base outline-none transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? "#1B1F26" : "#ffffff",
                      color: currentColors.text,
                      borderColor: answerValue
                        ? "#2563eb"
                        : "transparent",
                      borderWidth: "2px",
                    }}
                    value={answerValue}
                    onChange={(e) =>
                      handleTextAnswer(question.question_id, e.target.value)
                    }
                  />
                </div>
              );
    }
  };

  // ── START SCREEN ───────────────────────────────────────────────────────
  if (!quizStarted) {
    return (
      // KEY FIX: use overflow-y-auto + min-h-screen so the page scrolls naturally
      // instead of centering in a fixed viewport (which clips content on small screens)
      <div
        className="min-h-screen w-full overflow-y-auto"
        style={{ backgroundColor: currentColors.background }}
      >
        {/* py-8 gives breathing room top & bottom so nothing is ever clipped */}
        <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div
            className="rounded-2xl shadow-2xl p-5 sm:p-8 text-center"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-5">📝</div>
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: currentColors.text }}
            >
              Quiz Ready
            </h1>
            <p
              className="text-sm mb-5 sm:mb-6"
              style={{ color: currentColors.textSecondary }}
            >
              Review the details below before starting
            </p>

            {/* Instructions */}
            <div
              className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-xl text-left"
              style={{
                backgroundColor: isDarkMode ? "#161A20" : "#f8fafc",
                border: `1px solid ${currentColors.border}`,
              }}
            >
              <h2
                className="text-base sm:text-lg font-semibold mb-3"
                style={{ color: currentColors.text }}
              >
                Instructions
              </h2>
              {quizData?.task_instructions && (
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: currentColors.textSecondary }}
                >
                  {quizData.task_instructions}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 sm:p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: isDarkMode ? "#1B1F26" : "#ffffff",
                    border: `1px solid ${currentColors.border}`,
                  }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Questions
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-500">
                    {quizData.question_count}
                  </p>
                </div>
                <div
                  className="p-3 sm:p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: isDarkMode ? "#1B1F26" : "#ffffff",
                    border: `1px solid ${currentColors.border}`,
                  }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Total Points
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-500">
                    {quizData?.total_score || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-5 sm:mb-6 p-4 rounded-xl text-left bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-600">
                <strong>Important:</strong> Once you start the quiz, you can
                navigate freely between questions. Make sure you have a stable
                internet connection and complete all questions before
                submitting.
              </p>
            </div>

            {/* Buttons — stacked on mobile, side-by-side on sm+, swapped on tablets */}
            <div className="flex flex-col sm:flex-row md:flex-row-reverse gap-3 justify-center">
              {/* Exit appears second on mobile (below Start) for thumb-reach priority */}
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25 text-sm sm:text-base"
              >
                Start Quiz →
              </button>
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
                style={{
                  border: `2px solid ${currentColors.border}`,
                  color: currentColors.textSecondary,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = currentColors.hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: currentColors.background }}
    >
      {/* ── STICKY HEADER ── */}
      <div
        className="sticky top-0 z-20 w-full shadow-md"
        style={{
          backgroundColor: currentColors.surface,
          borderBottom: `1px solid ${currentColors.border}`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onExit}
              className="p-2 rounded-lg flex-shrink-0 transition-colors"
              style={{ color: currentColors.text }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = currentColors.hover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1
                className="font-bold text-sm sm:text-base truncate"
                style={{ color: currentColors.text }}
              >
                Question {currentQuestion + 1}{" "}
                <span
                  className="font-normal"
                  style={{ color: currentColors.textSecondary }}
                >
                  of {questions.length}
                </span>
              </h1>
              <p
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                {answeredQuestions} answered ·{" "}
                {questions.length - answeredQuestions} remaining
              </p>
            </div>
          </div>

          {/* Right: progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                Progress
              </span>
              <div
                className="w-24 lg:w-36 h-2 rounded-full"
                style={{ backgroundColor: isDarkMode ? "#374151" : "#e2e8f0" }}
              >
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: currentColors.text }}
              >
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div
          className="sm:hidden w-full h-1"
          style={{ backgroundColor: isDarkMode ? "#374151" : "#e2e8f0" }}
        >
          <div
            className="h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {questions.length > 0 && (
          <div
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            {/* ── SCROLLABLE QUESTIONS ── */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              {paginatedQuestions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="p-5 sm:p-7 lg:p-8"
                  style={{
                    borderBottom:
                      index !== paginatedQuestions.length - 1
                        ? `1px solid ${currentColors.border}`
                        : "none",
                  }}
                >
                  <div className="mb-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-500/15 text-blue-500 rounded-full text-xs font-bold tracking-wide">
                        Question {question.question_id}
                      </span>
                      <span
                        className="px-3 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: isDarkMode ? "#2d3748" : "#f1f5f9",
                          color: currentColors.textSecondary,
                        }}
                      >
                        {question.points} pts
                      </span>
                      {userAnswers.some(answer => answer.question_id === question.question_id) && (
                        <span className="px-3 py-1 bg-green-500/15 text-green-500 rounded-full text-xs font-bold flex items-center gap-1">
                          <FiCheck size={11} /> Answered
                        </span>
                      )}
                    </div>
                    <h2
                      className="text-base sm:text-lg font-semibold leading-relaxed"
                      style={{ color: currentColors.text }}
                    >
                      {question.question}
                    </h2>
                  </div>

                  {renderQuestion(question)}
                </div>
              ))}
            </div>

            {/* ── NAVIGATION FOOTER ── */}
            <div
              className="px-4 sm:px-6 py-4"
              style={{
                borderTop: `1px solid ${currentColors.border}`,
                backgroundColor: isDarkMode ? "#161A20" : "#f8fafc",
              }}
            >
              {usesPagination ? (
                /* > 10 questions: Prev / counter / Next — Next becomes Submit on last page */
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        currentPage === 0
                          ? isDarkMode
                            ? "#2d3748"
                            : "#e2e8f0"
                          : currentColors.accent,
                      color:
                        currentPage === 0
                          ? currentColors.textSecondary
                          : "#ffffff",
                    }}
                  >
                    Prev
                  </button>

                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: isDarkMode ? "#2d3748" : "#e2e8f0",
                      color: currentColors.textSecondary,
                    }}
                  >
                    Page {currentPage + 1} / {totalPages}
                  </span>

                  {currentPage === totalPages - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/25"
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white"
                      style={{ backgroundColor: currentColors.accent }}
                    >
                      Next
                    </button>
                  )}
                </div>
              ) : (
                /* ≤ 10 questions: just a centered Submit button */
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className="px-10 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/25"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="rounded-2xl shadow-2xl p-6 w-full max-w-md"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <div className="text-4xl text-center mb-4">📋</div>
            <h3
              className="text-xl font-bold mb-2 text-center"
              style={{ color: currentColors.text }}
            >
              Submit Quiz?
            </h3>
            <p
              className="text-sm text-center mb-6 leading-relaxed"
              style={{ color: currentColors.textSecondary }}
            >
              You have answered{" "}
              <strong style={{ color: currentColors.text }}>
                {answeredQuestions}
              </strong>{" "}
              out of{" "}
              <strong style={{ color: currentColors.text }}>
                {questions.length}
              </strong>{" "}
              questions.
              {answeredQuestions < questions.length &&
                " Unanswered questions will be marked as incorrect."}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-2xl font-bold text-green-500">
                  {answeredQuestions}
                </p>
                <p className="text-xs text-green-600">Answered</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-500">
                  {questions.length - answeredQuestions}
                </p>
                <p className="text-xs text-red-500">Unanswered</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  border: `1px solid ${currentColors.border}`,
                  color: currentColors.textSecondary,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = currentColors.hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Keep Reviewing
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizTaker;
