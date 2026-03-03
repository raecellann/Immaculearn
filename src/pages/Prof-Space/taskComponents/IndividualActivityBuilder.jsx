import React, { useState } from 'react';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useFile } from '../../../contexts/file/fileContextProvider';

const IndividualActivityBuilder = ({ 
  currentColors, 
  onBack, 
  onSave, 
  onPublish,
  isLoading = false 
}) => {
  const { resources } = useFile();
  const [activityTitle, setActivityTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  const getLocalDateTimeMin = () => {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };
  
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      answer: '',
      points: 5,
    },
  ]);

  // Calculate total score from all questions
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.points || 0),
    0,
  );




  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      answer: '',
      points: 5,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const handleSave = (status) => {
    // Format questions for individual activity
    const formattedQuestions = questions.map((question) => ({
      question_type: 'individual-activity',
      question: question.question,
      point: question.points || 1,
      choices: [
        {
          letter_identifier: 'A',
          choice_answer: question.answer || '',
          isRightAnswer: true,
        },
      ],
    }));

    const taskData = {
      task_category: 'individual-activity',
      task_title: activityTitle,
      due_date: new Date(dueDate).toISOString(),
      task_instruction: instruction,
      total_score: totalScore,
      lesson_id: selectedLesson ? parseInt(selectedLesson) : null,
      questions: formattedQuestions,
    };

    if (status === 'published') {
      onPublish(taskData);
    } else {
      onSave(taskData);
    }
  };

  const resetForm = () => {
    setActivityTitle('');
    setInstruction('');
    setDueDate('');
    setSelectedLesson('');
    setQuestions([
      {
        id: 1,
        question: '',
        answer: '',
        points: 1,
      },
    ]);
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
            border: `1px solid ${currentColors.border}`
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

      {/* ACTIVITY FORM */}
      <div className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📄</div>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>Individual Activity Builder</h1>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Activity Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                placeholder="Enter activity title"
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
                {totalScore} points
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Due Date: <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                min={getLocalDateTimeMin()}
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Connect to Lesson: <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none border"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                }}
                required
              >
                <option value="">Select a lesson...</option>
                {resources.map((lesson) => (
                  <option key={lesson.lesson_id} value={lesson.lesson_id}>
                    {lesson.lesson_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* INSTRUCTION */}
        <div className="mb-8">
          <label
            className="block font-semibold mb-2"
            style={{ color: currentColors.text }}
          >
            Instructions (optional):
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Add instructions for students..."
            className="w-full rounded-lg px-4 py-3 outline-none border h-24"
            style={{
              backgroundColor: currentColors.background,
              color: currentColors.text,
              borderColor: currentColors.border,
            }}
          />
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-semibold"
              style={{ color: currentColors.text }}
            >
              Questions
            </h2>
            
          </div>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="border rounded-lg p-6"
              style={{
                borderColor: currentColors.border,
                backgroundColor: currentColors.background,
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <span
                    className="font-semibold"
                    style={{ color: currentColors.text }}
                  >
                    Question {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <label
                      className="text-sm"
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
                      className="w-16 rounded px-2 py-1 outline-none border text-sm text-center"
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
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block font-medium mb-2 text-sm"
                    style={{ color: currentColors.text }}
                  >
                    Question:
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, "question", e.target.value)
                    }
                    placeholder="Enter your question..."
                    className="w-full rounded-lg px-4 py-3 outline-none border h-20"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block font-medium mb-2 text-sm"
                    style={{ color: currentColors.text }}
                  >
                    Answer (for grading reference):
                  </label>
                  <textarea
                    value={question.answer}
                    onChange={(e) =>
                      updateQuestion(question.id, "answer", e.target.value)
                    }
                    placeholder="Enter the expected answer or key points..."
                    className="w-full rounded-lg px-4 py-3 outline-none border h-20"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* ACTION BUTTONS */}
        <div className="flex flex-col items-end gap-4 mt-8">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 sm:px-4 px-4 py-2 bg-blue-600 text-white rounded-lg sm:text-base sm:w-auto hover:bg-blue-700 text-sm"
          >
            <FiPlus size={16} /> Add Question
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors"
              style={{
                backgroundColor: currentColors.surface,
                color: currentColors.text,
                border: `1px solid ${currentColors.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = currentColors.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentColors.surface;
              }}
              onClick={() => handleSave('draft')}
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto transition-colors"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onClick={() => handleSave('published')}
            >
              {isLoading ? 'Publishing...' : 'Publish Activity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualActivityBuilder;
