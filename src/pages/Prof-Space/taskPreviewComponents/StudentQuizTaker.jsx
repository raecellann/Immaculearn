import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { useSpace } from "../../../contexts/space/useSpace";

const StudentQuizTaker = ({ quizData, onSubmit, onExit }) => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const { questionnaire, setTaskId } = useSpace();

  const taskType = quizData?.task_category || quizData?.task_type || "quiz";
  const isExam = taskType === "exam";
  const isIndividualActivity = taskType === "individual-activity" || taskType === "individual_activity";


  console.log(questionnaire)

  // useEffect to monitor questionnaire data changes
  useEffect(() => {
    console.log('Questionnaire data updated:', questionnaire);

    // You can add additional logic here when questionnaire data changes
    // For example: update state, trigger actions, etc.

  }, [questionnaire]);

  // useEffect to process questions whenever questionnaire or quizData changes
  useEffect(() => {
    const questions = getQuestions();
    const groupedQuestions = getGroupedQuestions();

    console.log('Processed questions updated:', questions);
    console.log('Processed grouped questions updated:', groupedQuestions);

    // Update component state with processed data
    setProcessedQuestions(questions);
    setProcessedGroupedQuestions(groupedQuestions);

  }, [questionnaire, quizData, isExam]);

  // Determine task type for display

  let displayType;
  if (isExam) {
    displayType = "Exam";
  } else if (isIndividualActivity) {
    displayType = "Individual Activity";
  } else {
    displayType = "Quiz";
  }

  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [processedQuestions, setProcessedQuestions] = useState([]);
  const [processedGroupedQuestions, setProcessedGroupedQuestions] = useState([]);

  // Parse questions from the task data
  const getQuestions = () => {

    console.log('getQuestions called - questionnaire:', questionnaire)
    console.log('getQuestions called - quizData:', quizData)
    console.log('isExam:', isExam)

    // For exams, try to get questions from different possible data structures
    if (isExam) {
      let examData = quizData;

      // Check if quizData has rawData property
      if (quizData && quizData.rawData) {
        examData = quizData.rawData;
        console.log('Using quizData.rawData for exam:', examData);
      }

      // Check if examData is the array of groups
      if (examData && Array.isArray(examData)) {
        const allQuestions = [];
        examData.forEach(group => {
          if (group.questions && Array.isArray(group.questions)) {
            group.questions.forEach(question => {
              allQuestions.push({
                question_id: question?.question_id,
                question: question?.question,
                type: determineQuestionType(
                  question?.choices || [],
                  question?.question_type,
                ),
                answers: question?.choices || [],
                point: question?.point || group.group_point || 0,
                group_id: group.group_id,
                group_name: group.group_name,
                group_instruction: group.group_instruction,
              });
            });
          }
        });
        console.log('Exam questions processed:', allQuestions);
        return allQuestions;
      }

      // Check if examData has question_groups property
      if (examData && examData.question_groups && Array.isArray(examData.question_groups)) {
        const allQuestions = [];
        examData.question_groups.forEach(group => {
          if (group.questions && Array.isArray(group.questions)) {
            group.questions.forEach(question => {
              allQuestions.push({
                question_id: question?.question_id,
                question: question?.question,
                type: determineQuestionType(
                  question?.choices || [],
                  question?.question_type,
                ),
                answers: question?.choices || [],
                point: question?.point || group.group_point || 0,
                group_id: group.group_id,
                group_name: group.group_name,
                group_instruction: group.group_instruction,
              });
            });
          }
        });
        console.log('Exam questions from question_groups processed:', allQuestions);
        return allQuestions;
      }
    }

    // Regular quiz structure - use questionnaire as fallback
    if (!questionnaire || questionnaire.length === 0) {
      console.log('No questionnaire data available');
      return [];
    }

    const regularQuestions = questionnaire?.map((questionObj, index) => {
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
        point: questionnaire?.point,
      };
    });

    console.log('Regular questions processed:', regularQuestions);
    return regularQuestions;
  };

  // Get grouped questions for exam display
  const getGroupedQuestions = () => {


    if (!isExam) return [];

    let examData = questionnaire;

    // Check if quizData has rawData property
    if (quizData && quizData.rawData) {
      examData = quizData.rawData;
      console.log('Using quizData.rawData for grouped questions:', examData);
    }


    // Check if examData is the array of groups
    if (examData && Array.isArray(examData)) {
      const groupedQuestions = examData.map(group => ({
        group_id: group.group_id,
        group_name: group.group_name,
        group_instruction: group.group_instruction,
        questions: group.questions ? group.questions.map(question => ({
          question_id: question?.question_id,
          question: question?.question,
          type: determineQuestionType(
            question?.choices || [],
            question?.question_type,
          ),
          answers: question?.choices || [],
          point: question?.point || group.group_point || 0,
          group_id: group.group_id,
          group_name: group.group_name,
          group_instruction: group.group_instruction,
        })) : []
      }));

      console.log('Grouped questions processed:', groupedQuestions);
      return groupedQuestions;
    }

    // Check if examData has question_groups property
    if (examData && examData.question_groups && Array.isArray(examData.question_groups)) {
      const groupedQuestions = examData.question_groups.map(group => ({
        group_id: group.group_id,
        group_name: group.group_name,
        group_instruction: group.group_instruction,
        questions: group.questions ? group.questions.map(question => ({
          question_id: question?.question_id,
          question: question?.question,
          type: determineQuestionType(
            question?.choices || [],
            question?.question_type,
          ),
          answers: question?.choices || [],
          point: question?.point || group.group_point || 0,
          group_id: group.group_id,
          group_name: group.group_name,
          group_instruction: group.group_instruction,
        })) : []
      }));

      console.log('Grouped questions from question_groups processed:', groupedQuestions);
      return groupedQuestions;
    }

    console.log('No valid exam data structure found for grouped questions');
    return [];
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
      const existingAnswerIndex = prev.findIndex(
        (answer) => Number(answer.question_id) === Number(questionId),
      );

      if (existingAnswerIndex !== -1) {
        const existingAnswer = prev[existingAnswerIndex];

        // If clicking the same choice, remove the answer (deselect)
        if (Number(existingAnswer.choice_id) === Number(choice_id)) {
          const updatedAnswers = [...prev];
          updatedAnswers.splice(existingAnswerIndex, 1);
          return updatedAnswers;
        } else {
          // Update to different choice
          const updatedAnswers = [...prev];
          updatedAnswers[existingAnswerIndex] = {
            question_id: questionId,
            choice_id: choice_id,
          };
          return updatedAnswers;
        }
      } else {
        // Add new answer
        return [...prev, { question_id: questionId, choice_id: choice_id }];
      }
    });
  };

  const handleTextAnswer = (questionId, answer) => {
    setUserAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(
        (ans) => Number(ans.question_id) === Number(questionId),
      );

      // If answer is empty, remove the answer entirely
      if (!answer || answer.trim() === '') {
        if (existingAnswerIndex !== -1) {
          const updatedAnswers = [...prev];
          updatedAnswers.splice(existingAnswerIndex, 1);
          return updatedAnswers;
        }
        return prev;
      }

      if (existingAnswerIndex !== -1) {
        // Update existing answer
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = {
          question_id: questionId,
          text_answer: answer,
        };
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
  const confirmSubmit = () => {
    const formattedAnswers = userAnswers.map((answer) => {
      if (answer.choice_id) {
        return {
          question_id: answer.question_id,
          choice_id: answer.choice_id,
        };
      } else if (answer.text_answer) {
        return {
          question_id: answer.question_id,
          answer_text: answer.text_answer,
        };
      }
      return answer;
    });

    onSubmit(formattedAnswers);
  };

  const questions = processedQuestions;
  const answeredQuestions = userAnswers.length;

  // For exams, use grouped structure
  const groupedQuestions = processedGroupedQuestions;
  const displayQuestions = isExam ? groupedQuestions : questions;

  // Calculate total questions for exam display
  const totalQuestions = isExam && groupedQuestions.length > 0
    ? groupedQuestions.reduce((total, group) => total + (group.questions?.length || 0), 0)
    : questions.length;

  const progress =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

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

  const isOptionSelected = (questionId, choiceId) => {
    return userAnswers.some(
      (answer) =>
        Number(answer.question_id) === Number(questionId) && Number(answer.choice_id) === Number(choiceId),
    );
  };

  const getTextAnswer = (questionId) => {
    const answer = userAnswers.find(
      (ans) => Number(ans.question_id) === Number(questionId) && ans.text_answer,
    );
    return answer ? answer.text_answer : "";
  };

  const hasTextAnswer = (questionId) => {
    return userAnswers.some(
      (ans) => Number(ans.question_id) === Number(questionId) && ans.text_answer && ans.text_answer.trim() !== '',
    );
  };

  const getOptionClass = (selected) => {
    const base =
      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200";
    if (selected)
      return `${base} border-blue-500 shadow-lg shadow-blue-500/25 ${isDarkMode ? "bg-blue-900/40 ring-2 ring-blue-400/50" : "bg-blue-50 ring-2 ring-blue-200"}`;
    return `${base} ${isDarkMode ? "border-gray-600 hover:border-gray-400 hover:bg-gray-700/40" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`;
  };

  const getLetterBadgeClass = (selected) => {
    const base =
      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all";
    if (selected) return `${base} bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-400/50`;
    return `${base} ${isDarkMode ? "border-gray-500 text-gray-400" : "border-gray-300 text-gray-500"}`;
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className={getOptionClass(
                  isOptionSelected(
                    question.question_id,
                    answer.choice_id,
                  ),
                )}
                onClick={() =>
                  handleOptionClick(question.question_id, answer.choice_id)
                }
              >
                <div className="flex items-center justify-center">
                  <div
                    className={getLetterBadgeClass(
                      isOptionSelected(
                        question.question_id,
                        answer.choice_id,
                      ),
                    )}
                  >
                    {answer.letter_identifier}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed">
                    {answer.choice_answer}
                  </p>
                </div>
                {isOptionSelected(
                  question.question_id,
                  answer.choice_id,
                ) && (
                    <div style={{ color: currentColors.accent }}>
                      <FiCheck size={20} />
                    </div>
                  )}
              </div>
            ))}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className={getOptionClass(
                  isOptionSelected(
                    question.question_id,
                    answer.choice_id,
                  ),
                )}
                onClick={() =>
                  handleOptionClick(question.question_id, answer.choice_id)
                }
              >
                <div
                  className={getLetterBadgeClass(
                    isOptionSelected(
                      question.question_id,
                      answer.choice_id,
                    ),
                  )}
                >
                  {answer.letter_identifier}
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed">
                    {answer.choice_answer}
                  </p>
                </div>
                {isOptionSelected(
                  question.question_id,
                  answer.choice_id,
                ) && (
                    <div style={{ color: currentColors.accent }}>
                      <FiCheck size={20} />
                    </div>
                  )}
              </div>
            ))}
          </div>
        );

      case "short-answer":
      default:
        return (
          <div
            className="p-4 rounded-lg border-2"
            style={{ borderColor: currentColors.border }}
          >
            <textarea
              placeholder="Type your answer here..."
              className="w-full p-4 rounded border resize-none h-32 text-base"
              style={{
                backgroundColor: currentColors.background,
                borderColor: hasTextAnswer(question.question_id)
                  ? currentColors.accent
                  : currentColors.border,
                borderWidth: hasTextAnswer(question.question_id)
                  ? "2px"
                  : "1px",
                color: currentColors.text,
              }}
              value={getTextAnswer(question.question_id)}
              onChange={(e) =>
                handleTextAnswer(question.question_id, e.target.value)
              }
            />
          </div>
        );
    }
  };

  // Render exam groups
  const renderExamGroups = () => {
    return groupedQuestions.map((group, groupIndex) => (
      <div key={group.group_id} className="mb-8">
        {/* Group Header */}
        <div className="mb-6 p-4 rounded-xl" style={{
          backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
          border: `1px solid ${currentColors.border}`,
        }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: currentColors.text }}>
            {group.group_name}
          </h3>
          {group.group_instruction && (
            <p className="text-sm" style={{ color: currentColors.textSecondary }}>
              <b>{group.questions[0].type === "multiple-choice" ? "Multiple Choice" : group.questions[0].type === "true-false" ? "True or False" : "Identification"}: </b>{group.group_instruction}
            </p>
          )}
        </div>

        {/* Group Questions */}
        <div className="space-y-6">
          {group.questions.map((question, questionIndex) => (
            <div
              key={question.question_id}
              className="p-5 sm:p-6 rounded-xl"
              style={{
                backgroundColor: currentColors.surface,
                border: `1px solid ${currentColors.border}`,
              }}
            >
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                    style={{
                      backgroundColor: `${currentColors.accent}15`,
                      color: currentColors.accent,
                    }}
                  >
                    Question {questionIndex + 1}
                  </span>
                  <span
                    className="px-3 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: isDarkMode ? "#2d3748" : "#f1f5f9",
                      color: currentColors.textSecondary,
                    }}
                  >
                    {question.point} pts
                  </span>
                  {userAnswers.some(
                    (answer) => answer.question_id === question.question_id,
                  ) && (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                        }}
                      >
                        <FiCheck size={11} /> Answered
                      </span>
                    )}
                </div>
                <h4
                  className="text-base font-semibold leading-relaxed"
                  style={{ color: currentColors.text }}
                >
                  {question.question}
                </h4>
              </div>

              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>
    ));
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
              {displayType} Ready
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
                  <p
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: currentColors.accent }}
                  >
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
                  <p
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: "#10b981" }}
                  >
                    {quizData?.total_score || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div
              className="mb-5 sm:mb-6 p-4 rounded-xl text-left"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(251, 191, 36, 0.1)"
                  : "rgba(251, 191, 36, 0.05)",
                border: `1px solid ${isDarkMode ? "rgba(251, 191, 36, 0.3)" : "rgba(251, 191, 36, 0.2)"}`,
              }}
            >
              <p className="text-sm" style={{ color: "#d97706" }}>
                <strong>Important:</strong> Once you start the {displayType.toLowerCase()}, you can
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
                Start {displayType} →
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
                Exit {displayType}
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
                  of {totalQuestions}
                </span>
              </h1>
              <p
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                {answeredQuestions} answered ·{" "}
                {totalQuestions - answeredQuestions} remaining
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
                style={{ backgroundColor: currentColors.surfaceSecondary }}
              >
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: currentColors.accent,
                  }}
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
          style={{ backgroundColor: currentColors.surfaceSecondary }}
        >
          <div
            className="h-1 transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: currentColors.accent,
            }}
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
              className="overflow-y-auto p-5 sm:p-7 lg:p-8"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              {isExam ? (
                renderExamGroups()
              ) : (
                paginatedQuestions.map((question, index) => (
                  <div
                    key={question.question_id}
                    style={{
                      borderBottom:
                        index !== paginatedQuestions.length - 1
                          ? `1px solid ${currentColors.border}`
                          : "none",
                      paddingBottom: index !== paginatedQuestions.length - 1 ? "2rem" : "0",
                      marginBottom: index !== paginatedQuestions.length - 1 ? "2rem" : "0",
                    }}
                  >
                    <div className="mb-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                          style={{
                            backgroundColor: `${currentColors.accent}15`,
                            color: currentColors.accent,
                          }}
                        >
                          Question {question.question_id}
                        </span>
                        <span
                          className="px-3 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: isDarkMode ? "#2d3748" : "#f1f5f9",
                            color: currentColors.textSecondary,
                          }}
                        >
                          {questionnaire[index].point} pts
                        </span>
                        {userAnswers.some(
                          (answer) => answer.question_id === question.question_id,
                        ) && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                              style={{
                                backgroundColor: "rgba(16, 185, 129, 0.15)",
                                color: "#10b981",
                              }}
                            >
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
                ))
              )}
            </div>

            {/* ── NAVIGATION FOOTER ── */}
            {!isExam && (
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
            )}

            {/* Exam Submit Button */}
            {isExam && (
              <div
                className="px-4 sm:px-6 py-4"
                style={{
                  borderTop: `1px solid ${currentColors.border}`,
                  backgroundColor: isDarkMode ? "#161A20" : "#f8fafc",
                }}
              >
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className="px-10 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/25"
                  >
                    Submit {displayType}
                  </button>
                </div>
              </div>
            )}
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
              Submit {displayType}?
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
                {totalQuestions}
              </strong>{" "}
              questions.
              {answeredQuestions < totalQuestions &&
                " Unanswered questions will be marked as incorrect."}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div
                className="text-center p-3 rounded-xl"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <p className="text-2xl font-bold" style={{ color: "#10b981" }}>
                  {answeredQuestions}
                </p>
                <p className="text-xs" style={{ color: "#059669" }}>
                  Answered
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>
                  {totalQuestions - answeredQuestions}
                </p>
                <p className="text-xs" style={{ color: "#dc2626" }}>
                  Unanswered
                </p>
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
                Submit {displayType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizTaker;
