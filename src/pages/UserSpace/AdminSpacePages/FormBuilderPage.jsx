import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../../component/sidebar";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import {
  FiPlus,
  FiTrash2,
  FiPaperclip,
  FiEdit3,
  FiCheckSquare,
  FiCircle,
  FiType,
  FiAlignLeft,
  FiArrowLeft,
} from "react-icons/fi";

const FormBuilderPage = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Form Builder State
  const [questions, setQuestions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [allowAttachments, setAllowAttachments] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  
  // Retrieve task data from sessionStorage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('taskFormData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setTaskTitle(data.title || "");
        setInstruction(data.instruction || "");
      } catch (error) {
        console.error('Error parsing stored task data:', error);
      }
    }
  }, []);
  
  // Question types
  const questionTypes = [
    { id: 'identification', label: 'Identification', icon: FiType },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: FiCheckSquare },
    { id: 'true_false', label: 'True or False', icon: FiCircle },
    { id: 'reflection', label: 'Reflection', icon: FiAlignLeft },
    { id: 'essay', label: 'Essay', icon: FiEdit3 },
  ];

  // Form Builder Functions
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      question: "",
      options: type === 'multiple_choice' ? ['', '', '', ''] : [],
      correctAnswer: type === 'true_false' ? '' : (type === 'multiple_choice' ? '' : ''),
      points: 1,
      required: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveForm = () => {
    // Here you would save the form data and navigate back or to next step
    console.log("Saving form:", { taskTitle, instruction, questions, attachments, allowAttachments });
    // Navigate back to previous page
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
            onClick={handleBack}
          >
            <FiArrowLeft size={16} />
            Back to Tasks
          </button>
          <h1 className="text-2xl font-bold">Activity Form Builder</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
            onClick={handleSaveForm}
          >
            Save Form
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="max-w-6xl mx-auto bg-black rounded-xl shadow-lg p-8 border border-white">
          {/* BASIC INFO */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Activity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Activity Title: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-4 py-2 outline-none border border-[rgb(30_36_46_/var(--tw-bg-opacity,1))] focus:border-blue-500"
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Instruction (optional)
                </label>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-4 py-2 outline-none border border-[rgb(30_36_46_/var(--tw-bg-opacity,1))] focus:border-blue-500 h-20 resize-none"
                  placeholder="Enter instructions for this activity"
                />
              </div>
            </div>
          </div>

          {/* FORM BUILDER */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Form Questions</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowAttachments}
                    onChange={(e) => setAllowAttachments(e.target.checked)}
                    className="rounded"
                  />
                  Allow member attachments
                </label>
              </div>
            </div>
            
            {/* Explanation for member attachments */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-400 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">What are "Member Attachments"?</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    When enabled, members can upload their own files (documents, images, PDFs, etc.) when submitting this activity. 
                    Perfect for assignments requiring essays, reports, project files, or evidence photos.
                  </p>
                </div>
              </div>
            </div>

            {/* QUESTION TYPE SELECTION */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Add Question Type:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {questionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => addQuestion(type.id)}
                      className="flex flex-col items-center gap-2 p-4 bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg hover:bg-[#2F3440] transition border border-[rgb(30_36_46_/var(--tw-bg-opacity,1))] hover:border-blue-500"
                    >
                      <Icon size={24} className="text-blue-400" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUESTIONS LIST */}
            {questions.length > 0 ? (
              <div className="space-y-6">
                <h4 className="font-semibold">Questions ({questions.length})</h4>
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg p-6 border border-[#2F3440]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Q{index + 1}
                        </span>
                        <span className="px-3 py-1 bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-full text-sm text-gray-300">
                          {questionTypes.find(t => t.id === question.type)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    {/* QUESTION TEXT */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Question:</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        className="w-full bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-4 py-2 outline-none border border-[#2F3440] focus:border-blue-500"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    {/* QUESTION TYPE SPECIFIC OPTIONS */}
                    {question.type === 'multiple_choice' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Options:</label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <span className="text-gray-400 w-6">{String.fromCharCode(65 + optionIndex)}.</span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(question.id, 'options', newOptions);
                                }}
                                className="flex-1 bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-3 py-2 outline-none border border-[#2F3440] focus:border-blue-500"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Correct Answer:</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              value="true"
                              checked={question.correctAnswer === 'true'}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="rounded"
                            />
                            True
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              value="false"
                              checked={question.correctAnswer === 'false'}
                              onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                              className="rounded"
                            />
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Correct Answer:</label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                          className="w-full bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-4 py-2 outline-none border border-[#2F3440] focus:border-blue-500"
                        >
                          <option value="">Select correct answer</option>
                          {question.options.map((option, index) => (
                            <option key={index} value={option}>
                              {String.fromCharCode(65 + index)}. {option || `Option ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* QUESTION SETTINGS */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Points:</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                          className="w-20 bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-lg px-3 py-1 outline-none border border-[#2F3440] focus:border-blue-500"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p>No questions added yet. Select a question type above to get started.</p>
              </div>
            )}
          </div>

          {/* ATTACHMENTS SECTION */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Attachments</h3>
            <div
              onClick={() => document.getElementById('form-attachment-input')?.click()}
              className="border border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-[#0F1115] hover:border-blue-500 transition"
            >
              <FiPaperclip size={36} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-300 mb-2">
                Choose files or drag & drop here
              </p>
              <p className="text-xs text-gray-500">
                DOCS, PDF, PPT, EXCEL up to 10MB
              </p>
              <input
                id="form-attachment-input"
                type="file"
                className="hidden"
                multiple
                onChange={handleAttachmentUpload}
              />
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiPaperclip className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderPage;
