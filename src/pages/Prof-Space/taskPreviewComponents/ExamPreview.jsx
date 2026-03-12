import React, { useState } from "react";

const ExamPreview = ({ taskData, currentColors }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [hoveredOption, setHoveredOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(7200); // 2 hours in seconds

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse questions from the task data
  const getQuestions = () => {
    if (!taskData || !taskData.questions) return [];

    return taskData.questions.map((questionObj, index) => {
      const questionKey = `q${index + 1}`;
      const question = questionObj[questionKey];

      return {
        id: index + 1,
        question: question.question,
        answers: question.answers || [],
        type: determineQuestionType(question.answers),
        points: Math.floor(
          (taskData?.total_score || 100) / (taskData?.questions?.length || 1),
        ),
      };
    });
  };

  const determineQuestionType = (answers) => {
    if (!answers || answers.length === 0) return "short-answer";

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

    // Default to short answer
    return "short-answer";
  };

  const handleOptionClick = (questionId, letterIdentifier) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: letterIdentifier,
    }));
  };

  const handleTextAnswer = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                style={{
                  backgroundColor: currentColors.background,
                  borderWidth:
                    hoveredOption ===
                    `${question.id}-${answer.letter_identifier}`
                      ? "2px"
                      : "1px",
                  borderColor:
                    hoveredOption ===
                    `${question.id}-${answer.letter_identifier}`
                      ? "#2563eb"
                      : currentColors.border,
                }}
                onMouseEnter={() =>
                  setHoveredOption(`${question.id}-${answer.letter_identifier}`)
                }
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() =>
                  handleOptionClick(question.id, answer.letter_identifier)
                }
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                      userAnswers[question.id] === answer.letter_identifier
                        ? "bg-blue-600 border-blue-600 text-white"
                        : hoveredOption ===
                            `${question.id}-${answer.letter_identifier}`
                          ? "border-blue-400 text-blue-600"
                          : "border-gray-300 text-gray-500"
                    }`}
                    style={{
                      borderColor:
                        userAnswers[question.id] === answer.letter_identifier
                          ? "#2563eb"
                          : hoveredOption ===
                              `${question.id}-${answer.letter_identifier}`
                            ? "#2563eb"
                            : currentColors.border,
                      backgroundColor:
                        userAnswers[question.id] === answer.letter_identifier
                          ? "#2563eb"
                          : currentColors.background,
                      color:
                        userAnswers[question.id] === answer.letter_identifier
                          ? "#ffffff"
                          : hoveredOption ===
                              `${question.id}-${answer.letter_identifier}`
                            ? "#2563eb"
                            : currentColors.text,
                    }}
                  >
                    {answer.letter_identifier}
                  </div>
                </div>
                <div className="flex-1">
                  <p style={{ color: currentColors.text }}>
                    {answer.answer_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-3">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                style={{
                  backgroundColor: currentColors.background,
                  borderWidth:
                    hoveredOption ===
                    `${question.id}-${answer.letter_identifier}`
                      ? "2px"
                      : "1px",
                  borderColor:
                    hoveredOption ===
                    `${question.id}-${answer.letter_identifier}`
                      ? "#2563eb"
                      : currentColors.border,
                }}
                onMouseEnter={() =>
                  setHoveredOption(`${question.id}-${answer.letter_identifier}`)
                }
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() =>
                  handleOptionClick(question.id, answer.letter_identifier)
                }
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                    userAnswers[question.id] === answer.letter_identifier
                      ? "bg-blue-600 border-blue-600 text-white"
                      : hoveredOption ===
                          `${question.id}-${answer.letter_identifier}`
                        ? "border-blue-400 text-blue-600"
                        : "border-gray-300 text-gray-500"
                  }`}
                  style={{
                    borderColor:
                      userAnswers[question.id] === answer.letter_identifier
                        ? "#2563eb"
                        : hoveredOption ===
                            `${question.id}-${answer.letter_identifier}`
                          ? "#2563eb"
                          : currentColors.border,
                    backgroundColor:
                      userAnswers[question.id] === answer.letter_identifier
                        ? "#2563eb"
                        : currentColors.background,
                    color:
                      userAnswers[question.id] === answer.letter_identifier
                        ? "#ffffff"
                        : hoveredOption ===
                            `${question.id}-${answer.letter_identifier}`
                          ? "#2563eb"
                          : currentColors.text,
                  }}
                >
                  {answer.letter_identifier}
                </div>
                <div className="flex-1">
                  <p style={{ color: currentColors.text }}>
                    {answer.answer_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "short-answer":
      default:
        return (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: currentColors.background,
              borderColor: currentColors.border,
            }}
          >
            <textarea
              placeholder="Type your answer here..."
              className="w-full p-3 rounded border resize-none h-24"
              style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
                color: currentColors.text,
              }}
              value={userAnswers[question.id] || ""}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            />
          </div>
        );
    }
  };

  const questions = getQuestions();
  const answeredQuestions = Object.keys(userAnswers).length;
  const progress = (answeredQuestions / questions.length) * 100;

  return (
    <div
      className="max-w-4xl mx-auto p-6"
      style={{ backgroundColor: currentColors.background }}
    >
      {/* Exam Header with Timer */}
      <div
        className="mb-8 p-6 rounded-lg border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: currentColors.text }}
            >
              Exam Preview
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span
                  className="font-semibold"
                  style={{ color: currentColors.textSecondary }}
                >
                  Total Score:
                </span>
                <p style={{ color: currentColors.text }}>
                  {taskData?.total_score || 0} points
                </p>
              </div>
              <div>
                <span
                  className="font-semibold"
                  style={{ color: currentColors.textSecondary }}
                >
                  Questions:
                </span>
                <p style={{ color: currentColors.text }}>{questions.length}</p>
              </div>
              <div>
                <span
                  className="font-semibold"
                  style={{ color: currentColors.textSecondary }}
                >
                  Duration:
                </span>
                <p style={{ color: currentColors.text }}>2 hours</p>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div
            className="text-center p-4 rounded-lg"
            style={{
              backgroundColor: "#FEE2E2",
              border: "2px solid #FCA5A5",
            }}
          >
            <p className="text-sm font-semibold text-red-800 mb-1">
              Time Remaining
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: currentColors.textSecondary }}>Progress</span>
            <span style={{ color: currentColors.text }}>
              {answeredQuestions}/{questions.length} answered
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full"
            style={{
              backgroundColor: currentColors.border,
            }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: "#2563eb",
              }}
            />
          </div>
        </div>

        {taskData?.task_instructions && (
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: currentColors.background,
              borderLeft: `4px solid #2563eb`,
            }}
          >
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: currentColors.textSecondary }}
            >
              Instructions:
            </p>
            <p style={{ color: currentColors.text }}>
              {taskData.task_instructions}
            </p>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            }}
          >
            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                  }}
                >
                  Question {question.id}
                </span>
                <span
                  className="text-sm px-2 py-1 rounded"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.textSecondary,
                    border: `1px solid ${currentColors.border}`,
                  }}
                >
                  {question.points} points
                </span>
              </div>
              {userAnswers[question.id] && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Answered
                </span>
              )}
            </div>

            {/* Question Text */}
            <p
              className="text-lg leading-relaxed mb-4"
              style={{ color: currentColors.text }}
            >
              {question.question}
            </p>

            {/* Answer Options */}
            <div className="mt-4">{renderQuestion(question)}</div>
          </div>
        ))}
      </div>

      {/* Exam Footer */}
      <div
        className="mt-8 p-6 rounded-lg border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p
              className="font-semibold mb-2"
              style={{ color: currentColors.text }}
            >
              Exam Summary
            </p>
            <p
              className="text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              Questions answered: {answeredQuestions} of {questions.length}
            </p>
            <p
              className="text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              Time remaining: {formatTime(timeRemaining)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg font-medium border"
              style={{
                backgroundColor: currentColors.background,
                borderColor: currentColors.border,
                color: currentColors.text,
              }}
              onClick={() => {
                setUserAnswers({});
                setHoveredOption(null);
              }}
            >
              Reset Answers
            </button>
            <button
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: "#2563eb" }}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div
        className="mt-4 p-4 rounded-lg"
        style={{
          backgroundColor: "#FEF3C7",
          border: "1px solid #F59E0B",
        }}
      >
        <p className="text-sm text-amber-800">
          <strong>Warning:</strong> This is a preview of the exam. The actual
          exam will be timed and submissions cannot be modified after
          submission.
        </p>
      </div>
    </div>
  );
};

export default ExamPreview;
