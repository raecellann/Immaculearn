import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";

const TaskPreview = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();

  // State for task data and answers
  const [taskData, setTaskData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState({});

  // Load task data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('taskPreviewData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setTaskData(parsedData);
      } else {
        toast.error("No task data found. Please create a task first.");
        navigate('/space/task-builder');
      }
    } catch (error) {
      console.error("Error loading task data:", error);
      toast.error("Error loading task data");
      navigate('/space/task-builder');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle answer changes
  const handleAnswerChange = (itemId, value) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  // Handle multiple choice selection
  const handleMultipleChoice = (itemId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: optionId
    }));
  };

  // Handle correct answer toggle
  const handleCorrectAnswerToggle = (itemId, optionId) => {
    setCorrectAnswers(prev => {
      const newCorrectAnswers = { ...prev };
      
      // If this option is already marked as correct, unmark it
      if (newCorrectAnswers[itemId] === optionId) {
        delete newCorrectAnswers[itemId];
      } else {
        // Mark this option as correct (automatically replaces any previous correct answer)
        newCorrectAnswers[itemId] = optionId;
      }
      
      return newCorrectAnswers;
    });
  };

  // Calculate total score
  const calculateScore = () => {
    if (!taskData?.items) return 0;
    
    let totalScore = 0;
    taskData.items.forEach(item => {
      if (item.question_type === "multiple_choice" && answers[item.id]) {
        const selectedOption = item.options.find(opt => opt.id === answers[item.id]);
        const correctOptionId = correctAnswers[item.id];
        if (selectedOption && selectedOption.id === correctOptionId) {
          totalScore += item.points;
        }
      } else if (item.question_type === "identification" && answers[item.id]) {
        // In real app, this would be graded by teacher
        totalScore += item.points;
      } else if (item.question_type === "essay" && answers[item.id]) {
        // In real app, this would be graded by teacher
        totalScore += item.points;
      }
    });
    return totalScore;
  };

  // Handle submission
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Check if all questions are answered
    const unansweredQuestions = taskData.items.filter(item => !answers[item.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions (${unansweredQuestions.length} remaining)`);
      setIsSubmitting(false);
      return;
    }

    // Simulate submission
    setTimeout(() => {
      const score = calculateScore();
      toast.success(`Task submitted! Score: ${score}/${taskData.total_score}`);
      setIsSubmitting(false);
      
      // Show results in alert for debugging
      const submissionData = {
        task_id: taskData.id || 'preview',
        answers: answers,
        score: score,
        submitted_at: new Date().toISOString()
      };
      alert("Submission Data:\n\n" + JSON.stringify(submissionData, null, 2));
    }, 1500);
  };

  // Get background color based on question type
  const getQuestionBgColor = (type) => {
    switch (type) {
      case "multiple_choice":
        return "bg-blue-900/30";
      case "identification":
        return "bg-red-900/30";
      case "essay":
        return "bg-gray-700/30";
      case "file_upload":
        return "bg-green-900/30";
      default:
        return "bg-[#1E222A]";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#161A20] text-white items-center justify-center">
        <div className="text-xl">Loading task preview...</div>
      </div>
    );
  }

  // No data state
  if (!taskData) {
    return (
      <div className="flex min-h-screen bg-[#161A20] text-white items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">No task data found</div>
          <button
            onClick={() => navigate('/space/task-builder')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Go to Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Sidebar - Same as builder */}
      <div className="hidden lg:block">
        {/* Import and use the same Sidebar component */}
        <div className="w-64 bg-[#1E222A] border-r border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-6">Task Preview</h2>
          <nav className="space-y-2">
            <button
              onClick={() => navigate(`/space/task`)}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              ← Back to Tasks
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              ← Back to Builder
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Task Header */}
          <div className="bg-[#1E222A] border border-gray-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{taskData.title}</h1>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                  {taskData.type?.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400">
                  Total Score: {taskData.total_score} points
                </span>
                {taskData.is_group_task && (
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
                    GROUP ACTIVITY
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-gray-300 mb-4">
              <p>{taskData.description}</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              {taskData.due_date && (
                <span>Due: {new Date(taskData.due_date).toLocaleDateString()}</span>
              )}
              {taskData.items && (
                <span>Questions: {taskData.items.length}</span>
              )}
            </div>

            {/* Display criteria if available */}
            {taskData.criteria && taskData.criteria.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium mb-2">Grading Criteria:</h4>
                <div className="space-y-1">
                  {taskData.criteria.map((criterion, index) => (
                    <div key={index} className="text-sm text-gray-400">
                      • {criterion.criteria_name}: {criterion.max_score} points
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Questions */}
          {taskData.items && taskData.items.length > 0 && (
            <div className="space-y-6 mb-8">
              {taskData.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-6 ${getQuestionBgColor(item.question_type)} border border-gray-600 rounded-lg`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1} ({item.question_type?.replace('_', ' ')})
                    </h3>
                    <span className="text-sm text-gray-400">
                      {item.points} points
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-200">{item.question_text}</p>
                  </div>

                  {/* Multiple Choice Options */}
                  {item.question_type === "multiple_choice" && item.options && (
                    <div className="space-y-3">
                      {item.options.map((option) => {
                        const isCorrect = correctAnswers[item.id || index] === option.id;
                        return (
                          <div key={option.id} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`question-${item.id || index}`}
                              value={option.id}
                              checked={answers[item.id || index] === option.id}
                              onChange={() => handleMultipleChoice(item.id || index, option.id)}
                              className="w-4"
                            />
                            <label
                              className={`flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-700 transition-colors flex-1 ${
                                isCorrect ? 'bg-green-900/30 border border-green-600' : 'bg-gray-800'
                              }`}
                            >
                              <span className="flex-1">{option.option_text}</span>
                              <button
                                onClick={() => handleCorrectAnswerToggle(item.id || index, option.id)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  isCorrect 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                              >
                                {isCorrect ? '✓ Correct' : 'Mark Correct'}
                              </button>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Identification */}
                  {item.question_type === "identification" && (
                    <div>
                      <textarea
                        value={answers[item.id || index] || ""}
                        onChange={(e) => handleAnswerChange(item.id || index, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your answer here..."
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Essay */}
                  {item.question_type === "essay" && (
                    <div>
                      <textarea
                        value={answers[item.id || index] || ""}
                        onChange={(e) => handleAnswerChange(item.id || index, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Write your essay here..."
                        rows={8}
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {item.question_type === "file_upload" && (
                    <div>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          onChange={(e) => handleAnswerChange(item.id || index, e.target.files[0])}
                          className="hidden"
                          id={`file-${item.id || index}`}
                        />
                        <label
                          htmlFor={`file-${item.id || index}`}
                          className="cursor-pointer"
                        >
                          <div className="text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p>Click to upload file</p>
                            <p className="text-sm">or drag and drop</p>
                          </div>
                        </label>
                        {answers[item.id || index] && (
                          <p className="mt-4 text-green-400">
                            Selected: {answers[item.id || index].name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Group Activity Notice */}
          {taskData.is_group_task && (
            <div className="mb-8 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <h4 className="font-medium mb-2">Group Activity Notice:</h4>
              <p className="text-sm text-blue-300">
                This is a group activity. You will collaborate with your group members to complete this task.
                {taskData.groupsData && taskData.groupsData.length > 0 && (
                  <span> Group: {taskData.groupsData[0].group_name}</span>
                )}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? "Submitting..." : `Submit ${taskData.type}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreview;
