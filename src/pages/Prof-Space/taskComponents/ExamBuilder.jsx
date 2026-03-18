import React, { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useSpace } from "../../../contexts/space/useSpace";

const ExamBuilder = ({
  currentColors,
  editingTask,
  onBack,
  onSave,
  onUpdate,
  onPublish,
  isLoading = false,
}) => {
  const { questionnaireEditData, questionnaireEditDataLoading } = useSpace();


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
  const [showDeleteTestConfirmation, setShowDeleteTestConfirmation] =
    useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

  // Populate form with editing task data
  useEffect(() => {
    if (editingTask) {
      // Handle different possible data structures
      const taskData = editingTask.rawData || editingTask;

      setExamTitle(taskData.task_title || taskData.title || "");
      setInstruction(taskData.task_instruction || taskData.instruction || "");
      setScore(taskData.total_items_score || taskData.score || "");

      // console.log(taskData.task_start, taskData.task_end);

      // Fix date format - convert to proper datetime-local format
      if (taskData.due_date) {
        try {
          const date = new Date(taskData.due_date);

          // Manually format to M/D/YYYY
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0"); // 03 for March
          const day = String(date.getDate()).padStart(2, "0"); // 18
          const formatted = `${year}-${month}-${day}`;

          setDueDate(formatted);
        } catch (error) {
          setDueDate("");
        }
      } else {
        setDueDate("");
      }

      setStartTime(taskData.task_start || "");
      setEndTime(taskData.task_end || "");

      // Parse exam questions and test groups
      // Use questionnaireEditData if available, otherwise parse from editingTask
      if (questionnaireEditData && Array.isArray(questionnaireEditData)) {
        console.log("=== PROCESSING QUESTIONNAIRE DATA ===");
        console.log("Raw questionnaireEditData:", questionnaireEditData);
        
        // For exams, questionnaireEditData is an array of groups with questions
        const parsedTestGroups = questionnaireEditData.map((group, index) => ({
          id: group.group_name || `Test ${index + 1}`,
          title: group.group_name || `Test ${index + 1}`,
          questionCount: group.questions?.length || 0,
          instruction: group.group_instruction || "",
          defaultQuestionType: "multiple-choice",
        }));

        console.log("Parsed test groups:", parsedTestGroups);
        setTestGroups(parsedTestGroups);

        // Parse questions from test groups
        const parsedQuestions = [];
        questionnaireEditData.forEach((group) => {
          console.log(`Processing group: ${group.group_name}, questions:`, group.questions);
          if (group.questions && Array.isArray(group.questions)) {
            group.questions.forEach((qData, index) => {
              let parsed = {
                id: qData.question_id || parsedQuestions.length + 1,
                type:
                  qData.question_type === "mcq"
                    ? "multiple-choice"
                    : qData.question_type === "true-false"
                      ? "true-false"
                      : qData.question_type === "identification"
                        ? "identification"
                        : "multiple-choice",
                question: qData.question || "",
                points: qData.point || 1,
                testGroup: group.group_name || "Test I",
              };

              // Handle multiple choice questions
              if (
                qData.question_type === "mcq" &&
                qData.choices &&
                Array.isArray(qData.choices)
              ) {
                parsed.options = qData.choices.map(
                  (choice) => choice.choice_answer || choice.answer_text || "",
                );
                parsed.correctAnswer = qData.choices.findIndex(
                  (choice) => choice.is_right_answer || choice.is_correct,
                );
                if (parsed.correctAnswer === -1) parsed.correctAnswer = 0;
              }
              // Handle true/false questions
              else if (
                qData.question_type === "true-false" &&
                qData.choices &&
                Array.isArray(qData.choices)
              ) {
                parsed.options = qData.choices.map(
                  (choice) => choice.choice_answer || choice.answer_text || "",
                );

                // Find correct answer and convert to string "true" or "false"
                const correctAnswerIndex = qData.choices.findIndex(
                  (choice) => choice.is_right_answer || choice.is_correct,
                );

                if (correctAnswerIndex !== -1) {
                  const correctChoice = qData.choices[correctAnswerIndex];
                  const answerText = (
                    correctChoice.choice_answer ||
                    correctChoice.answer_text ||
                    ""
                  ).toLowerCase();

                  if (
                    answerText === "true" ||
                    correctChoice.letter_identifier === "T"
                  ) {
                    parsed.correctAnswer = "true";
                  } else if (
                    answerText === "false" ||
                    correctChoice.letter_identifier === "F"
                  ) {
                    parsed.correctAnswer = "false";
                  } else {
                    parsed.correctAnswer = "true";
                  }
                } else {
                  parsed.correctAnswer = "true";
                }
              }
              // Handle identification questions
              else if (qData.question_type === "identification") {
                parsed.correctAnswers = qData.identification_answer
                  ? qData.identification_answer
                      .split(",")
                      .map((answer) => answer.trim())
                  : [""];
              }
              // Default for other question types
              else {
                parsed.options = ["", "", ""];
                parsed.correctAnswer = 0;
                parsed.correctAnswers = [""];
              }

              parsedQuestions.push(parsed);
            });
          }
        });

        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        }
      }
      // Fallback to parsing from editingTask if no questionnaireEditData
      else if (
        taskData.task_question_groups &&
        Array.isArray(taskData.task_question_groups)
      ) {
        const parsedTestGroups = taskData.task_question_groups.map(
          (group, index) => ({
            id: group.group_name || group.group_label || `Test ${index + 1}`,
            title: group.group_name || group.group_label || `Test ${index + 1}`,
            questionCount:
              group.questions?.length || group.group_questions?.length || 0,
            instruction: group.group_instruction || "",
            defaultQuestionType: "multiple-choice",
          }),
        );

        setTestGroups(parsedTestGroups);

        // Parse questions from test groups
        const parsedQuestions = [];
        taskData.task_question_groups.forEach((group) => {
          const groupQuestions = group.questions || group.group_questions;
          if (groupQuestions && Array.isArray(groupQuestions)) {
            groupQuestions.forEach((qData, index) => {
              let parsed = {
                id: qData.question_id || parsedQuestions.length + 1,
                type:
                  qData.question_type === "mcq"
                    ? "multiple-choice"
                    : qData.question_type === "true-false"
                      ? "true-false"
                      : qData.question_type === "identification"
                        ? "identification"
                        : "multiple-choice",
                question: qData.question || "",
                points: qData.point || 1,
                testGroup: group.group_name || group.group_label || "Test I",
              };

              // Handle multiple choice questions
              if (
                qData.question_type === "mcq" &&
                qData.choices &&
                Array.isArray(qData.choices)
              ) {
                parsed.options = qData.choices.map(
                  (choice) => choice.choice_answer || choice.answer_text || "",
                );
                parsed.correctAnswer = qData.choices.findIndex(
                  (choice) => choice.is_correct,
                );
                if (parsed.correctAnswer === -1) parsed.correctAnswer = 0;
              }
              // Handle true/false questions
              else if (
                qData.question_type === "true-false" &&
                qData.choices &&
                Array.isArray(qData.choices)
              ) {
                const correctAnswerIndex = qData.choices.findIndex(
                  (choice) => choice.is_correct,
                );

                if (correctAnswerIndex !== -1) {
                  const correctChoice = qData.choices[correctAnswerIndex];
                  const answerText = (
                    correctChoice.choice_answer ||
                    correctChoice.answer_text ||
                    ""
                  ).toLowerCase();

                  if (
                    answerText === "true" ||
                    correctChoice.letter_identifier === "T"
                  ) {
                    parsed.correctAnswer = "true";
                  } else if (
                    answerText === "false" ||
                    correctChoice.letter_identifier === "F"
                  ) {
                    parsed.correctAnswer = "false";
                  } else {
                    parsed.correctAnswer = "true";
                  }
                } else {
                  parsed.correctAnswer = "true";
                }
              }
              // Handle identification questions
              else if (qData.question_type === "identification") {
                parsed.correctAnswers = qData.identification_answer
                  ? qData.identification_answer
                      .split(",")
                      .map((answer) => answer.trim())
                  : [""];
              }
              // Default for other question types
              else {
                parsed.options = ["", "", ""];
                parsed.correctAnswer = 0;
                parsed.correctAnswers = [""];
              }

              parsedQuestions.push(parsed);
            });
          }
        });

        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        }
      }
    }
  }, [editingTask, questionnaireEditData]);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", ""],
      correctAnswer: 0,
      points: 1,
      testGroup: "Test I",
    },
  ]);

  const [testGroups, setTestGroups] = useState([
    {
      id: "Test I",
      title: "Test I",
      questionCount: 0,
      instruction: "",
      defaultQuestionType: "multiple-choice",
    },
  ]);

  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False" },
    { value: "identification", label: "Identification" },
  ];

  // Function to identify test type based on questions in a test group
  const identifyTestType = (testQuestions) => {
    if (!testQuestions || testQuestions.length === 0) {
      return "empty";
    }

    const questionTypesInTest = testQuestions.map((q) => q.type);
    const uniqueTypes = [...new Set(questionTypesInTest)];

    if (uniqueTypes.length === 1) {
      const singleType = uniqueTypes[0];
      switch (singleType) {
        case "multiple-choice":
          return "all-multiple-choice";
        case "true-false":
          return "all-true-false";
        case "identification":
          return "all-identification";
        default:
          return "unknown";
      }
    } else {
      return "mixed";
    }
  };

  // Function to set all questions in a test group to the same type
  const setAllQuestionsType = (testGroupId, questionType) => {
    const updatedQuestions = questions.map((q) => {
      if (q.testGroup === testGroupId) {
        // Reset question-specific data based on type
        if (questionType === "multiple-choice") {
          return {
            ...q,
            type: questionType,
            options: ["", "", ""],
            correctAnswer: 0,
            correctAnswers: [""],
          };
        } else if (questionType === "true-false") {
          return {
            ...q,
            type: questionType,
            correctAnswer: "true",
            correctAnswers: [""],
          };
        } else if (questionType === "identification") {
          return {
            ...q,
            type: questionType,
            correctAnswers: [""],
          };
        }
        return { ...q, type: questionType };
      }
      return q;
    });
    setQuestions(updatedQuestions);

    // Update the test group's default question type
    const updatedTestGroups = testGroups.map((tg) => {
      if (tg.id === testGroupId) {
        return { ...tg, defaultQuestionType: questionType };
      }
      return tg;
    });
    setTestGroups(updatedTestGroups);
  };

  // Calculate total score from all questions
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.points || 0),
    0,
  );

  const addQuestion = (testGroup = "Test I") => {
    const testQuestions = questions.filter((q) => q.testGroup === testGroup);
    const testType = identifyTestType(testQuestions);

    // Determine the question type for the new question
    let questionType = "multiple-choice"; // default
    if (testType === "all-multiple-choice") {
      questionType = "multiple-choice";
    } else if (testType === "all-true-false") {
      questionType = "true-false";
    } else if (testType === "all-identification") {
      questionType = "identification";
    } else if (
      testGroup &&
      testGroups.find((tg) => tg.id === testGroup)?.defaultQuestionType
    ) {
      // Use the test group's default type if no uniform type exists
      questionType = testGroups.find(
        (tg) => tg.id === testGroup,
      ).defaultQuestionType;
    }

    const newQuestion = {
      id: questions.length + 1,
      type: questionType,
      question: "",
      points: 1,
      testGroup,
    };

    // Set up question-specific data based on type
    if (questionType === "multiple-choice") {
      newQuestion.options = ["", "", ""];
      newQuestion.correctAnswer = 0;
      newQuestion.correctAnswers = [""];
    } else if (questionType === "true-false") {
      newQuestion.correctAnswer = "true";
      newQuestion.correctAnswers = [""];
    } else if (questionType === "identification") {
      newQuestion.correctAnswers = [""];
    }

    setQuestions([...questions, newQuestion]);
    updateTestGroupCounts();
  };

  const addTestGroup = () => {
    const testNumber = testGroups.length + 1;
    const romanNumerals = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    const newTestId = `Test ${romanNumerals[testNumber - 1] || testNumber}`;
    const newTestGroup = {
      id: newTestId,
      title: newTestId,
      questionCount: 0,
      instruction: "",
      defaultQuestionType: "multiple-choice",
    };
    setTestGroups([...testGroups, newTestGroup]);
  };

  const removeTestGroup = (testGroupId) => {
    console.log(testGroupId);
    // Only allow removal if there's more than one test group
    if (testGroups.length > 1) {
      console.log(testGroups);
      // Remove all questions that belong to the test being deleted
      const updatedQuestions = questions.filter(
        (q) => q.testGroup !== testGroupId,
      );
      setQuestions(updatedQuestions);

      // Find the index of the test group to remove
      const testGroupIndex = testGroups.findIndex(
        (tg) => String(tg.id) === String(testGroupId),
      );
      console.log(testGroupIndex);
      // Remove the test group using splice
      const updatedTestGroups = [...testGroups];
      updatedTestGroups.splice(testGroupIndex, 1);

      console.log(updatedTestGroups);

      // Re-index remaining test groups with proper Roman numerals
      const romanNumerals = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
      ];
      const reindexedTestGroups = updatedTestGroups.map((tg, index) => {
        const newTitle = `Test ${romanNumerals[index] || index + 1}`;
        const newId = newTitle;

        // Update all questions in this test group to use the new test group ID
        const finalUpdatedQuestions = updatedQuestions.map((q) => {
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
          title: newTitle,
        };
      });

      setTestGroups(reindexedTestGroups);
      // updateTestGroupCounts();
    }
  };

  const confirmDeleteTest = () => {
    if (testToDelete && testGroups.length > 1) {
      // Remove all questions that belong to the test being deleted
      const updatedQuestions = questions.filter(
        (q) => q.testGroup !== testToDelete.id,
      );
      setQuestions(updatedQuestions);

      // Find the index of the test group to remove
      const testGroupIndex = testGroups.findIndex(
        (tg) => String(tg.id) === String(testToDelete.id),
      );

      // Remove the test group using splice
      const updatedTestGroups = [...testGroups];
      updatedTestGroups.splice(testGroupIndex, 1);

      // Re-index remaining test groups with proper Roman numerals
      const romanNumerals = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
      ];
      const reindexedTestGroups = updatedTestGroups.map((tg, index) => {
        const newTitle = `Test ${romanNumerals[index] || index + 1}`;
        const newId = newTitle;

        // Update all questions in this test group to use the new test group ID
        const finalUpdatedQuestions = updatedQuestions.map((q) => {
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
          title: newTitle,
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
    const updatedCounts = testGroups.map((tg) => ({
      ...tg,
      questionCount: questions.filter((q) => q.testGroup === tg.id).length,
    }));
    setTestGroups(updatedCounts);
  };

  const updateTestGroupInstruction = (testGroupId, instruction) => {
    setTestGroups(
      testGroups.map((tg) =>
        tg.id === testGroupId ? { ...tg, instruction } : tg,
      ),
    );
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
          (question.correctAnswer !== "true" &&
            question.correctAnswer !== "false"))
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
                      validationErrors[`options_${question.id}`] &&
                      !option.trim()
                        ? "border-red-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor:
                        validationErrors[`options_${question.id}`] &&
                        !option.trim()
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
      task_category: "exam",
      task_title: examTitle,
      task_instruction: instruction,
      total_items_score: totalScore,
      due_date: dueDate,
      start_time: startTime,
      end_time: endTime,
      duration: duration,
      attempts: attempts,
      shuffle_questions: shuffleQuestions,
      show_results_immediately: showResultsImmediately,
      require_proctoring: requireProctoring,
      allow_calculator: allowCalculator,
      allow_notes: allowNotes,
      passing_score: passingScore,
      task_question_groups: testGroups.map((tg, index) => {
        const testQuestions = questions.filter((q) => q.testGroup === tg.id);
        const testType = identifyTestType(testQuestions);

        return {
          group_id: index + 1,
          group_label: tg.title,
          group_instruction: tg.instruction || "",
          group_test_type: testType,
          group_questions: testQuestions.map((question) => {
            const questionData = {
              question: question.question,
              question_type:
                question.type === "multiple-choice"
                  ? "mcq"
                  : question.type === "true-false"
                    ? "true-false"
                    : question.type === "identification"
                      ? "identification"
                      : question.type,
              point: question.points || 1,
            };

            // Handle different question types for choices
            if (question.type === "multiple-choice") {
              questionData.choices = question.options.map(
                (option, optIndex) => ({
                  id: optIndex + 1,
                  letter_identifier: String.fromCharCode(65 + optIndex), // A, B, C, D
                  choice_answer: option,
                  is_correct: question.correctAnswer === optIndex,
                }),
              );
            } else if (question.type === "true-false") {
              questionData.choices = [
                {
                  id: 1,
                  letter_identifier: "T",
                  choice_answer: "True",
                  is_correct: question.correctAnswer === "true",
                },
                {
                  id: 2,
                  letter_identifier: "F",
                  choice_answer: "False",
                  is_correct: question.correctAnswer === "false",
                },
              ];
            } else if (question.type === "identification") {
              questionData.identification_answer =
                question.correctAnswers
                  ?.filter((answer) => answer?.trim())
                  .join(", ") || "";
            }

            return questionData;
          }),
        };
      }),
    };

    // Add task_id if editing
    if (editingTask) {
      examData.task_id = editingTask.task_id || editingTask.id;
    }

    // Log payload data for debugging
    console.log("=== EXAM BUILDER PAYLOAD DATA ===");
    console.log("Status:", status);
    console.log("Exam Data:", examData);
    console.log("Formatted Questions:", formattedQuestions);
    console.log("Test Groups:", testGroups);
    console.log("Editing Task:", editingTask);

    if (editingTask) {
      // Update existing exam
      onUpdate(examData);
    } else {
      // Create new exam
      if (status === "published") {
        onPublish(examData);
      } else {
        onSave(examData);
      }
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
            {editingTask ? "Edit Exam" : "Exam Builder"}
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
                {editingTask && score
                  ? `${score} points`
                  : `${totalScore} points`}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label
                  className="block font-semibold mb-2"
                  style={{ color: currentColors.text }}
                >
                  Exam Start Time:
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const time = e.target.value;
                    if (time) {
                      const [hours, minutes] = time.split(":");
                      const minuteInt = parseInt(minutes);
                      // Round to nearest 15-minute interval
                      let roundedMinutes;
                      if (minuteInt < 8) {
                        roundedMinutes = "00";
                      } else if (minuteInt < 23) {
                        roundedMinutes = "15";
                      } else if (minuteInt < 38) {
                        roundedMinutes = "30";
                      } else if (minuteInt < 53) {
                        roundedMinutes = "45";
                      } else {
                        roundedMinutes = "00";
                        const hourInt = parseInt(hours) + 1;
                        setStartTime(
                          `${hourInt.toString().padStart(2, "0")}:${roundedMinutes}`,
                        );
                        return;
                      }
                      setStartTime(`${hours}:${roundedMinutes}`);
                    } else {
                      setStartTime(time);
                    }
                  }}
                  step="900"
                  className="w-full rounded-lg px-3 sm:px-4 py-2 outline-none border text-sm"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }}
                />
              </div>

              <div className="flex-1">
                <label
                  className="block font-semibold mb-2"
                  style={{ color: currentColors.text }}
                >
                  Exam End Time:
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    const time = e.target.value;
                    if (time) {
                      const [hours, minutes] = time.split(":");
                      const minuteInt = parseInt(minutes);
                      // Round to nearest 15-minute interval
                      let roundedMinutes;
                      if (minuteInt < 8) {
                        roundedMinutes = "00";
                      } else if (minuteInt < 23) {
                        roundedMinutes = "15";
                      } else if (minuteInt < 38) {
                        roundedMinutes = "30";
                      } else if (minuteInt < 53) {
                        roundedMinutes = "45";
                      } else {
                        roundedMinutes = "00";
                        const hourInt = parseInt(hours) + 1;
                        setEndTime(
                          `${hourInt.toString().padStart(2, "0")}:${roundedMinutes}`,
                        );
                        return;
                      }
                      setEndTime(`${hours}:${roundedMinutes}`);
                    } else {
                      setEndTime(time);
                    }
                  }}
                  step="900"
                  className="w-full rounded-lg px-3 sm:px-4 py-2 outline-none border text-sm"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* INSTRUCTION */}
        {/* <div className="mb-6 sm:mb-8">
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
        </div> */}

        {/* QUESTIONS */}
        <div className="space-y-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-semibold"
              style={{ color: currentColors.text }}
            >
              Questions
            </h2>
          </div>

          {testGroups.map((testGroup, testIndex) => {
            const testQuestions = questions.filter(
              (q) => q.testGroup === testGroup.id,
            );
            const testType = identifyTestType(testQuestions);
            const isUniformType =
              testType !== "mixed" &&
              testType !== "empty" &&
              testType !== "unknown";

            return (
              <div key={testGroup.id} className="space-y-4">
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-3 sm:gap-0"
                  style={{
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.surface,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                        {testQuestions.length} question
                        {testQuestions.length !== 1 ? "s" : ""}
                      </span>
                      {testQuestions.length > 0 && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: (() => {
                            const testType = identifyTestType(testQuestions);
                            switch (testType) {
                              case "all-multiple-choice":
                                return "#dbeafe"; // blue-100
                              case "all-true-false":
                                return "#dcfce7"; // green-100
                              case "all-identification":
                                return "#fef3c7"; // amber-100
                              case "mixed":
                                return "#f3e8ff"; // purple-100
                              default:
                                return currentColors.background;
                            }
                          })(),
                          color: (() => {
                            const testType = identifyTestType(testQuestions);
                            switch (testType) {
                              case "all-multiple-choice":
                                return "#1e40af"; // blue-800
                              case "all-true-false":
                                return "#166534"; // green-800
                              case "all-identification":
                                return "#92400e"; // amber-800
                              case "mixed":
                                return "#6b21a8"; // purple-800
                              default:
                                return currentColors.textSecondary;
                            }
                          })(),
                          border: `1px solid ${(() => {
                            const testType = identifyTestType(testQuestions);
                            switch (testType) {
                              case "all-multiple-choice":
                                return "#3b82f6"; // blue-500
                              case "all-true-false":
                                return "#22c55e"; // green-500
                              case "all-identification":
                                return "#f59e0b"; // amber-500
                              case "mixed":
                                return "#a855f7"; // purple-500
                              default:
                                return currentColors.border;
                            }
                          })()}`,
                        }}
                      >
                        {(() => {
                          const testType = identifyTestType(testQuestions);
                          switch (testType) {
                            case "all-multiple-choice":
                              return "All Multiple Choice";
                            case "all-true-false":
                              return "All True/False";
                            case "all-identification":
                              return "All Identification";
                            case "mixed":
                              return "Mixed Types";
                            default:
                              return "No Questions";
                          }
                        })()}
                      </span>
                    )}
                    {testQuestions.length > 0 && (
                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              setAllQuestionsType(testGroup.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="rounded-lg px-2 py-1 outline-none border text-xs cursor-pointer"
                          style={{
                            backgroundColor: currentColors.surface,
                            color: currentColors.text,
                            borderColor: currentColors.border,
                          }}
                        >
                          <option value="" disabled>
                            Set All to Type
                          </option>
                          <option value="multiple-choice">
                            All Multiple Choice
                          </option>
                          <option value="true-false">All True/False</option>
                          <option value="identification">
                            All Identification
                          </option>
                        </select>
                      </div>
                    )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    {testGroups.length > 1 && (
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
                        <span className="hidden sm:inline">Remove Test</span>
                        <span className="sm:hidden">Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Instruction Field */}
                <div className="ml-4 mr-4">
                  <label
                    className="block font-semibold mb-2 text-sm"
                    style={{ color: currentColors.text }}
                  >
                    Test Instruction:
                  </label>
                  <textarea
                    value={testGroup.instruction || ""}
                    onChange={(e) =>
                      updateTestGroupInstruction(testGroup.id, e.target.value)
                    }
                    className="w-full rounded-lg px-3 py-2 outline-none border min-h-[80px] resize-vertical text-sm"
                    style={{
                      backgroundColor: currentColors.background,
                      color: currentColors.text,
                      borderColor: currentColors.border,
                    }}
                    placeholder={`Add specific instructions for ${testGroup.title}...`}
                  />
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
                          disabled={isUniformType}
                          className={`rounded-lg px-3 py-1.5 outline-none border text-xs sm:text-sm w-full sm:w-auto ${
                            isUniformType ? "opacity-50 cursor-not-allowed" : ""
                          }`}
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
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-500 hover:text-red-400 p-1 sm:p-0"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
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
                          updateQuestion(
                            question.id,
                            "question",
                            e.target.value,
                          );
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
                          borderColor: validationErrors[
                            `question_${question.id}`
                          ]
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

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Add Test Button - Mobile: Bottom, Tablet/Desktop: Above Publish/Update */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addTestGroup}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors text-center"
              style={{
                backgroundColor: "#22c55e",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1d9d3a";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#22c55e";
              }}
            >
              <FiPlus size={14} /> Add Test
            </button>
          </div>
          
          {/* Publish/Update Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          {editingTask ? (
            // Editing mode - show Update button
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
              onClick={() => setShowUpdateConfirmation(true)}
            >
              {isLoading ? "Updating..." : "Update Exam"}
            </button>
          ) : (
            // Creating mode - show Publish button only
            <>
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
            </>
          )}
          </div>
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
              Are you sure you want to delete "{testToDelete.title}"? This
              action will also remove {testToDelete.questionCount} question
              {testToDelete.questionCount !== 1 ? "s" : ""} in this test.
            </p>
            <p
              className="mb-6 text-sm"
              style={{ color: currentColors.textSecondary }}
            >
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

      {/* Update Exam Confirmation Dialog */}
      {showUpdateConfirmation && (
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
              Update Exam Confirmation
            </h3>
            <p className="mb-4" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to update this exam? This will save all the changes you've made to the exam content and settings.
            </p>
            <p
              className="mb-6 text-sm"
              style={{ color: currentColors.textSecondary }}
            >
              <strong>Note:</strong> Students who haven't started the exam will see the updated version.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                }}
                onClick={() => setShowUpdateConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
                style={{ backgroundColor: "#2563eb" }}
                onClick={() => {
                  handleSave("updated");
                  setShowUpdateConfirmation(false);
                }}
              >
                Update Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamBuilder;
