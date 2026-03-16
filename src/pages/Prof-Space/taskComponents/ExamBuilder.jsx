import React, { useState } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

const ExamBuilder = ({
  currentColors,
  onBack,
  onSave,
  onPublish,
  isLoading = false,
}) => {
  const [examTitle, setExamTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attempts, setAttempts] = useState("1");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [requireProctoring, setRequireProctoring] = useState(false);
  const [allowCalculator, setAllowCalculator] = useState(false);
  const [allowNotes, setAllowNotes] = useState(false);
  const [passingScore, setPassingScore] = useState("70");
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteTestConfirmation, setShowDeleteTestConfirmation] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "multiple-choice",
      question: "",
      options: ["", '', ""],
      correctAnswer: 0,
      points: 1,
      testGroup: "Test I",
    },
  ]);

  const [testGroups, setTestGroups] = useState([
    { id: "Test I", title: "Test I", questionCount: 0 },
  ]);

  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False" },
    { value: "identification", label: "Identification" },
  ];

  // Calculate total score from all questions
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.points || 0),
    0,
  );

  const addQuestion = (testGroup = "Test I") => {
    const newQuestion = {
      id: questions.length + 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", ""],
      correctAnswer: 0,
      points: 1,
      correctAnswers: [""], // For identification type questions
      testGroup,
    };
    setQuestions([...questions, newQuestion]);
    updateTestGroupCounts();
  };

  const addTestGroup = () => {
    const testNumber = testGroups.length + 1;
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    const newTestId = `Test ${romanNumerals[testNumber - 1] || testNumber}`;
    const newTestGroup = { id: newTestId, title: newTestId, questionCount: 0 };
    setTestGroups([...testGroups, newTestGroup]);
  };

  const removeTestGroup = (testGroupId) => {

    console.log(testGroupId)
    // Only allow removal if there's more than one test group
    if (testGroups.length > 1) {

      console.log(testGroups)
      // Remove all questions that belong to the test being deleted
      const updatedQuestions = questions.filter(q => q.testGroup !== testGroupId);
      setQuestions(updatedQuestions);
      
      // Find the index of the test group to remove
      const testGroupIndex = testGroups.findIndex(tg => String(tg.id) === String(testGroupId));
      console.log(testGroupIndex)
      // Remove the test group using splice
      const updatedTestGroups = [...testGroups];
      updatedTestGroups.splice(testGroupIndex, 1);

      console.log(updatedTestGroups)
      
      // Re-index remaining test groups with proper Roman numerals
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      const reindexedTestGroups = updatedTestGroups.map((tg, index) => {
        const newTitle = `Test ${romanNumerals[index] || index + 1}`;
        const newId = newTitle;
        
        // Update all questions in this test group to use the new test group ID
        const finalUpdatedQuestions = updatedQuestions.map(q => {
          if (q.testGroup === tg.id) {
            return { ...q, testGroup: newId };
          }
          return q;
        });
        
        // Update questions state with the new test group assignments
        setQuestions(finalUpdatedQuestions);
        
        return {
          ...tg,
          id: newId,
          title: newTitle
        };
      });
      
      setTestGroups(reindexedTestGroups);
      // updateTestGroupCounts();
    }
  };

  const confirmDeleteTest = () => {
    if (testToDelete && testGroups.length > 1) {
      // Remove all questions that belong to the test being deleted
      const updatedQuestions = questions.filter(q => q.testGroup !== testToDelete.id);
      setQuestions(updatedQuestions);
      
      // Find the index of the test group to remove
      const testGroupIndex = testGroups.findIndex(tg => String(tg.id) === String(testToDelete.id));
      
      // Remove the test group using splice
      const updatedTestGroups = [...testGroups];
      updatedTestGroups.splice(testGroupIndex, 1);
      
      // Re-index remaining test groups with proper Roman numerals
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      const reindexedTestGroups = updatedTestGroups.map((tg, index) => {
        const newTitle = `Test ${romanNumerals[index] || index + 1}`;
        const newId = newTitle;
        
        // Update all questions in this test group to use the new test group ID
        const finalUpdatedQuestions = updatedQuestions.map(q => {
          if (q.testGroup === tg.id) {
            return { ...q, testGroup: newId };
          }
          return q;
        });
        
        // Update questions state with the new test group assignments
        setQuestions(finalUpdatedQuestions);
        
        return {
          ...tg,
          id: newId,
          title: newTitle
        };
      });
      
      setTestGroups(reindexedTestGroups);
      updateTestGroupCounts();
    }
    setShowDeleteTestConfirmation(false);
    setTestToDelete(null);
  };

  const cancelDeleteTest = () => {
    setShowDeleteTestConfirmation(false);
    setTestToDelete(null);
  };

  const updateTestGroupCounts = () => {
    const updatedCounts = testGroups.map(tg => ({
      ...tg,
      questionCount: questions.filter(q => q.testGroup === tg.id).length
    }));
    setTestGroups(updatedCounts);
  };

  React.useEffect(() => {
    updateTestGroupCounts();
  }, [questions]);

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
      updateTestGroupCounts();
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

  const validateFields = () => {
    const errors = {};

    if (!examTitle.trim()) {
      errors.examTitle = true;
    }

    if (!dueDate) {
      errors.dueDate = true;
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors[`question_${question.id}`] = true;
      }

      // Validate based on question type
      if (question.type === "multiple-choice") {
        if (question.options.some((option) => !option.trim())) {
          errors[`options_${question.id}`] = true;
        }
      } else if (
        question.type === "true-false" &&
        (!question.correctAnswer ||
          (question.correctAnswer !== "true" && question.correctAnswer !== "false"))
      ) {
        errors[`correctAnswer_${question.id}`] = true;
      } else if (
        question.type === "identification" &&
        (!question.correctAnswers ||
          question.correctAnswers.length === 0 ||
          !question.correctAnswers.some((answer) => answer?.trim()))
      ) {
        errors[`correctAnswer_${question.id}`] = true;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {validationErrors[`options_${question.id}`] && (
              <p className="text-red-500 text-xs sm:text-sm">
                Please fill in all option fields
              </p>
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
                        setValidationErrors((prev) => ({
                          ...prev,
                          [`options_${question.id}`]: false,
                        }));
                      }
                    }}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm min-w-0 ${
                      validationErrors[`options_${question.id}`] && !option.trim()
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor:
                        validationErrors[`options_${question.id}`] && !option.trim()
                          ? "#ef4444"
                          : currentColors.border,
                    }}
                  />
                  {question.options.length > 2 && (
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
                  )}
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
              <p className="text-red-500 text-xs sm:text-sm">
                Please select True or False
              </p>
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
              <p className="text-red-500 text-xs sm:text-sm mb-2">
                Please provide at least one correct answer
              </p>
            )}
            <div
              className="text-xs sm:text-sm mb-2"
              style={{ color: currentColors.textSecondary }}
            >
              Correct answers (comma-separated for multiple possible answers):
            </div>
            <div className="space-y-2">
              {question.correctAnswers?.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={answer || ""}
                    onChange={(e) => {
                      const newAnswers = [...question.correctAnswers];
                      newAnswers[index] = e.target.value;
                      updateQuestion(question.id, "correctAnswers", newAnswers);
                      if (validationErrors[`correctAnswer_${question.id}`]) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          [`correctAnswer_${question.id}`]: false,
                        }));
                      }
                    }}
                    placeholder={`Correct answer ${index + 1}`}
                    className={`flex-1 rounded-lg px-2.5 sm:px-3 py-2 outline-none border text-xs sm:text-sm ${
                      validationErrors[`correctAnswer_${question.id}`]
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor: validationErrors[
                        `correctAnswer_${question.id}`
                      ]
                        ? "#ef4444"
                        : currentColors.border,
                    }}
                  />
                  {question.correctAnswers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAnswers = question.correctAnswers.filter(
                          (_, i) => i !== index,
                        );
                        updateQuestion(
                          question.id,
                          "correctAnswers",
                          newAnswers,
                        );
                      }}
                      className="p-2 rounded-lg border text-red-500 hover:bg-red-50 transition-colors"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newAnswers = [...(question.correctAnswers || []), ""];
                  updateQuestion(question.id, "correctAnswers", newAnswers);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  borderColor: currentColors.border,
                  color: currentColors.text,
                }}
              >
                <FiPlus size={14} />
                Add Another Answer
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = (status) => {
    if (!validateFields()) {
      return;
    }

    // Format questions according to the specified structure with test groups
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
        test_group: question.testGroup || "Test I",
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
        questionData.identification_answer =
          question.correctAnswers
            ?.filter((answer) => answer?.trim())
            .join(", ") || "";
      }

      return questionData;
    });

    const examData = {
      title: examTitle,
      instruction,
      total_score: totalScore,
      dueDate,
      duration: Number(duration),
      startTime,
      endTime,
      attempts: Number(attempts),
      shuffleQuestions,
      showResultsImmediately,
      requireProctoring,
      allowCalculator,
      allowNotes,
      passingScore: Number(passingScore),
      category: "exam",
      questions: formattedQuestions,
    };

    if (status === "published") {
      onPublish(examData);
    } else {
      onSave(examData);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

      {/* EXAM FORM */}
      <div
        className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📋</div>
          <h1
            className="text-2xl font-bold"
            style={{ color: currentColors.text }}
          >
            Exam Builder
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
                Exam Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                placeholder="Enter exam title"
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
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

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Exam Date: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {/* INSTRUCTION */}
        <div className="mb-6 sm:mb-8">
          <label
            className="block font-semibold mb-2"
            style={{ color: currentColors.text }}
          >
            Exam Instructions (optional):
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full rounded-lg px-4 py-3 outline-none border min-h-[140px] resize-vertical"
            style={{
              backgroundColor: currentColors.background,
              color: currentColors.text,
              borderColor: currentColors.border,
            }}
            placeholder="Add exam instructions, guidelines, and expectations..."
          />
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-semibold"
              style={{ color: currentColors.text }}
            >
              Questions
            </h2>
            <button
              type="button"
              onClick={addTestGroup}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <FiPlus size={14} /> Add Test
            </button>
          </div>

          {testGroups.map((testGroup, testIndex) => {
            const testQuestions = questions.filter(q => q.testGroup === testGroup.id);
            return (
              <div key={testGroup.id} className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.surface,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: currentColors.text }}
                    >
                      {testGroup.title}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: currentColors.background,
                        color: currentColors.textSecondary,
                        border: `1px solid ${currentColors.border}`,
                      }}
                    >
                      {testQuestions.length} question{testQuestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={testGroup.id}
                      onChange={(e) => {
                        const newTestGroup = e.target.value;
                        testQuestions.forEach(q => {
                          updateQuestion(q.id, "testGroup", newTestGroup);
                        });
                      }}
                      className="rounded-lg px-2 py-1 outline-none border text-xs"
                      style={{
                        backgroundColor: currentColors.background,
                        color: currentColors.text,
                        borderColor: currentColors.border,
                      }}
                    >
                      {testGroups.map(tg => (
                        <option key={tg.id} value={tg.id}>
                          Move to {tg.title}
                        </option>
                      ))}
                    </select>
                    {testGroups.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => removeTestGroup(testGroup.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          style={{
                            backgroundColor: "transparent",
                            border: `1px solid #dc2626`,
                          }}
                        >
                          <FiTrash2 size={12} />
                          Remove Test
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {testQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 sm:p-6 ml-4"
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
                        <p className="text-red-500 text-xs sm:text-sm mb-1">
                          Please enter a question
                        </p>
                      )}
                      <textarea
                        value={question.question}
                        onChange={(e) => {
                          updateQuestion(question.id, "question", e.target.value);
                          if (validationErrors[`question_${question.id}`]) {
                            setValidationErrors((prev) => ({
                              ...prev,
                              [`question_${question.id}`]: false,
                            }));
                          }
                        }}
                        placeholder="Enter your question..."
                        className={`w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 outline-none border h-16 sm:h-20 text-sm resize-none ${
                          validationErrors[`question_${question.id}`]
                            ? "border-red-500"
                            : ""
                        }`}
                        style={{
                          backgroundColor: currentColors.surface,
                          color: currentColors.text,
                          borderColor: validationErrors[`question_${question.id}`]
                            ? "#ef4444"
                            : currentColors.border,
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

                <div className="ml-4">
                  <button
                    type="button"
                    onClick={() => addQuestion(testGroup.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus size={14} /> Add Question to {testGroup.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD QUESTION BUTTON */}
        <div className="flex flex-col items-stretch sm:items-end gap-4 mb-6 sm:mb-8">
          {testGroups.length > 0 && (
            <button
              type="button"
              onClick={() => addQuestion(testGroups[0].id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <FiPlus size={16} /> Add Question to {testGroups[0].title}
            </button>
          )}
        </div>
        

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
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
            {isLoading ? "Saving..." : "Save as Draft"}
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
            {isLoading ? "Publishing..." : "Publish Exam"}
          </button>
        </div>
      </div>

      {/* Delete Test Confirmation Dialog */}
      {showDeleteTestConfirmation && testToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.text }}
            >
              Delete Test Confirmation
            </h3>
            <p className="mb-4" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to delete "{testToDelete.title}"? 
              This action will also remove {testToDelete.questionCount} question{testToDelete.questionCount !== 1 ? 's' : ''} in this test.
            </p>
            <p className="mb-6 text-sm" style={{ color: currentColors.textSecondary }}>
              <strong>Warning:</strong> This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                }}
                onClick={cancelDeleteTest}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
                style={{ backgroundColor: "#dc2626" }}
                onClick={confirmDeleteTest}
              >
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamBuilder;
