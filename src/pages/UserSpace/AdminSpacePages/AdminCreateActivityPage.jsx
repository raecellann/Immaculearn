import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../component/sidebar";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiPaperclip,
  FiEdit3,
  FiCheckSquare,
  FiCircle,
  FiType,
  FiAlignLeft,
} from "react-icons/fi";


const AdminCreateActivityPage = () => {
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Form Builder State
  const [questions, setQuestions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [grades, setGrades] = useState("");
  const [assignees, setAssignees] = useState("Individual");
  const [dueDate, setDueDate] = useState("");
  const [enableForm, setEnableForm] = useState(false);
  const [allowAttachments, setAllowAttachments] = useState(false);

  // Question types
  const questionTypes = [
    { id: 'identification', label: 'Identification', icon: FiType },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: FiCheckSquare },
    { id: 'true_false', label: 'True or False', icon: FiCircle },
    { id: 'reflection', label: 'Reflection', icon: FiAlignLeft },
    { id: 'essay', label: 'Essay', icon: FiEdit3 },
  ];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Apply formatting ONLY inside instruction box
  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

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

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.background, color: currentColors.text }}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER / BANNER */}
        <div className="relative mb-6">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            alt="Space Banner"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl"
          />
          <div className="absolute top-0 z-10">
            <div className="bg-black text-white px-10 py-3 rounded-b-[1rem] shadow-lg text-2xl font-extrabold">
              Zeldrick’s Space
            </div>
          </div>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex justify-end mb-6">
          <button
            className="flex items-center gap-2 bg-black/70 hover:bg-black px-4 py-2 rounded-lg text-white text-sm font-medium shadow"
            onClick={() => navigate("/admintaskpage")}
          >
            <FiArrowLeft /> Back to Tasks
          </button>
        </div>

        {/* FORM CARD */}
        <div className="max-w-6xl mx-auto bg-black rounded-xl shadow-lg p-8 border border-white">
          <div className="flex flex-col md:flex-row gap-6">
            {/* LEFT SECTION */}
            <div className="flex-1 flex flex-col gap-4">
              <label className="font-semibold text-lg">
                Title: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}
                placeholder="Enter activity title"
              />

              {/* INSTRUCTION */}
              <label className="font-semibold">Instruction (optional)</label>

              <div className="rounded-lg border focus-within:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}>
                {/* Editable Instruction Area */}
                <div
                  ref={instructionRef}
                  contentEditable
                  className="min-h-[140px] px-4 py-3 outline-none"
                  suppressContentEditableWarning
                />

                {/* Divider */}
                <div className="border-t border-[#2F3440]" />

                {/* Formatting Toolbar (BOTTOM) */}
                <div className="flex gap-4 px-4 py-2 text-gray-300">
                  <button
                    type="button"
                    onClick={() => applyFormat("bold")}
                    className="hover:text-white"
                  >
                    <FiBold />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("italic")}
                    className="hover:text-white"
                  >
                    <FiItalic />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("underline")}
                    className="hover:text-white"
                  >
                    <FiUnderline />
                  </button>
                </div>
              </div>

              {/* ATTACHMENTS SECTION */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block font-semibold">
                    Attachments
                  </label>
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

                <div
                  onClick={handleFileClick}
                  className="border border-dashed border-gray-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition" style={{ backgroundColor: isDarkMode ? "#0F1115" : currentColors.surface }}
                >
                  <FiPaperclip size={36} className="mb-3 text-gray-300" />

                  <p className="text-sm text-gray-300 mb-2">
                    Choose a file or drag & drop it here.
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    DOCS, PDF, PPT AND EXCEL, UP TO 10 MB
                  </p>

                  <button
                    type="button"
                    className="px-4 py-1.5 border border-gray-400 rounded-md text-sm hover:bg-gray-800"
                  >
                    Browse Files
                  </button>

                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    multiple
                    onChange={handleAttachmentUpload}
                  />
                </div>

                {/* ATTACHMENTS LIST */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: currentColors.surface }}>
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

            {/* RIGHT SECTION */}
            <div className="flex-1 flex flex-col gap-4">
              <label className="font-semibold">Grades:</label>
              <input
                type="text"
                value={grades}
                onChange={(e) => setGrades(e.target.value)}
                className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}
                placeholder="e.g. 95/100"
              />

              <label className="font-semibold">Assignees:</label>
              <select 
                value={assignees}
                onChange={(e) => setAssignees(e.target.value)}
                className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}
              >
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>

              <label className="font-semibold">Due Date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}
              />

              {/* FORM BUILDER TOGGLE */}
              <div className="mt-6">
                <label className="flex items-center gap-3 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableForm}
                    onChange={(e) => setEnableForm(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  Enable Form Builder
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Create custom questions for members to answer
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold">
              Publish Activity
            </button>
            <button className="bg-gray-700 hover:bg-gray-800 px-6 py-2 rounded-lg font-semibold">
              Save as Draft
            </button>
          </div>
        </div>

        {/* FORM BUILDER SECTION */}
        {enableForm && (
          <div className="max-w-6xl mx-auto mt-6 bg-black rounded-xl shadow-lg p-8 border border-white">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Form Builder</h3>
              <p className="text-gray-400">Create questions for members to answer when submitting this activity.</p>
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
                      className="flex flex-col items-center gap-2 p-4 rounded-lg hover:transition border hover:border-blue-500" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.surface }}
                    >
                      <Icon size={24} className="text-blue-400" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUESTIONS LIST */}
            {questions.length > 0 && (
              <div className="space-y-6">
                <h4 className="font-semibold">Questions ({questions.length})</h4>
                {questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg p-6 border" style={{ backgroundColor: currentColors.surface, borderColor: isDarkMode ? "#2F3440" : currentColors.border }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Q{index + 1}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: isDarkMode ? "#1E222A" : currentColors.surface, color: isDarkMode ? "#D1D5DB" : currentColors.textSecondary }}>
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
                        className="w-full rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.surface, borderColor: isDarkMode ? "#2F3440" : currentColors.border }}
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
                                className="flex-1 rounded-lg px-3 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.surface, borderColor: isDarkMode ? "#2F3440" : currentColors.border }}
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
                          className="w-full rounded-lg px-4 py-2 outline-none border focus:border-blue-500" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.surface, borderColor: isDarkMode ? "#2F3440" : currentColors.border }}
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
                          className="w-20 rounded-lg px-3 py-1 outline-none border focus:border-blue-500" style={{ backgroundColor: isDarkMode ? "#161A20" : currentColors.surface, borderColor: isDarkMode ? "#2F3440" : currentColors.border }}
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
            )}

            {questions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FiPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p>No questions added yet. Select a question type above to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreateActivityPage;
