import React, { useState } from "react";
import { FiEdit } from "react-icons/fi";

const QuizPreview = ({ taskData, currentColors, onEditQuiz }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [hoveredOption, setHoveredOption] = useState(null);

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
                  borderColor: currentColors.border,
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
                  {answer.isRightAnswer === 1 && (
                    <span className="text-xs text-green-500 font-semibold mt-1 inline-block">
                      ✓ Correct Answer
                    </span>
                  )}
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
                  borderColor: currentColors.border,
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
                  {answer.isRightAnswer === 1 && (
                    <span className="text-xs text-green-500 font-semibold mt-1 inline-block">
                      ✓ Correct Answer
                    </span>
                  )}
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
            <p style={{ color: currentColors.text }}>
              <strong>Answer:</strong>{" "}
              {question.answers[0]?.answer_text || "No answer provided"}
            </p>
            {question.answers[0]?.isRightAnswer === 1 && (
              <span className="text-xs text-green-500 font-semibold mt-2 inline-block">
                ✓ Correct Answer
              </span>
            )}
          </div>
        );
    }
  };

  const questions = getQuestions();

  return (
    <div
      className="max-w-4xl mx-auto p-6"
      style={{ backgroundColor: currentColors.background }}
    >
      {/* Quiz Header */}
      <div
        className="mb-8 p-6 rounded-lg border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: currentColors.text }}
        >
          Quiz Preview
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
              Due Date:
            </span>
            <p style={{ color: currentColors.text }}>
              {taskData?.due_date
                ? new Date(taskData?.due_date).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "No due date"}
            </p>
          </div>
          <div>
            <span
              className="font-semibold"
              style={{ color: currentColors.textSecondary }}
            >
              Questions:
            </span>
            <p style={{ color: currentColors.text }}>
              {taskData?.question_count}
            </p>
          </div>
        </div>
        {taskData?.task_instructions && (
          <div
            className="mt-4 p-3 rounded"
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
            {/* Question Number and Text */}
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                }}
              >
                Question {question.id}
              </span>
              <p
                className="text-lg leading-relaxed"
                style={{ color: currentColors.text }}
              >
                {question.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="mt-4">{renderQuestion(question)}</div>

            {/* User Answer Display */}
            {userAnswers[question.id] && (
              <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">
                  Your Answer: {userAnswers[question.id]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Footer */}
      <div
        className="mt-8 p-4 rounded-lg border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex justify-between items-center gap-4">
          <p style={{ color: currentColors.textSecondary }}>
            This is a preview of the quiz. Students will see this interface when
            taking the quiz.
          </p>
          <button
            className="px-6 py-3 rounded-lg text-white font-medium text-base shadow-lg hover:shadow-xl transition-all"
            style={{ 
              backgroundColor: "#22c55e",
              border: "2px solid #22c55e"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1d9d3a";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#22c55e";
              e.target.style.transform = "translateY(0px)";
            }}
            onClick={() => {
              setUserAnswers({});
              setHoveredOption(null);
              if (onEditQuiz) {
                onEditQuiz(taskData);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <FiEdit size={16} />
              Edit Quiz
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
