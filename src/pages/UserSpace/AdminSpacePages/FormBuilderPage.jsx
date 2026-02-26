import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../../component/sidebar";
import { useSpaceTheme } from "../../../contexts/theme/spaceThemeContextProvider";
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiCheckSquare,
  FiCircle,
  FiType,
  FiAlignLeft,
  FiArrowLeft,
  FiList,
  FiUploadCloud,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import mammoth from 'mammoth';

const FormBuilderPage = () => {
  const navigate = useNavigate();
  const { space_uuid, space_name } = useParams();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  
  // Question types
  const questionTypes = [
    { id: 'identification', label: 'Identification', icon: FiType },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: FiCheckSquare },
    { id: 'true_false', label: 'True or False', icon: FiCircle },
    { id: 'reflection_essay', label: 'Reflection/Essay', icon: FiAlignLeft },
    { id: 'enumeration', label: 'Enumeration', icon: FiList },
  ];
  
  // Form Builder State
  const [questions, setQuestions] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [questionQuantities, setQuestionQuantities] = useState(
    Object.fromEntries(questionTypes.map(type => [type.id, '']))
  );
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    questionType: '',
    questionCount: 0,
    questionLabel: ''
  });
  
  // Refs for file upload and instruction
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);
  
  // Filter question types based on task category
  const getAvailableQuestionTypes = () => {
    if (taskCategory === 'reflection-essay') {
      // Only allow short answer (identification) for reflection/essay
      return questionTypes.filter(type => type.id === 'identification');
    }
    // Show all question types for quiz
    return questionTypes;
  };
  
  // Retrieve task data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('taskFormData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setTaskTitle(data.taskTitle || "");
        setInstruction(data.instruction || "");
        setTaskCategory(data.taskCategory || "");
      } catch (error) {
        console.error('Error parsing stored task data:', error);
      }
    }
  }, []);
  
  // File Upload Functions
  const handleFileClick = () => {
    console.log("handleFileClick called");
    console.log("fileInputRef.current:", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef.current is null");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      await extractTextFromFile(file);
    }
  };

  const extractTextFromFile = async (file) => {
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      let extractedText = '';

      if (fileExtension === 'pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (['doc', 'docx'].includes(fileExtension)) {
        extractedText = await extractTextFromDocx(file);
      } else if (['ppt', 'pptx'].includes(fileExtension)) {
        extractedText = await extractTextFromPptx(file);
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        extractedText = await extractTextFromExcel(file);
      } else if (['txt', 'text'].includes(fileExtension)) {
        extractedText = await extractTextFromText(file);
      }

      if (extractedText) {
        setInstruction(extractedText);
        if (instructionRef.current) {
          instructionRef.current.innerHTML = extractedText;
        }
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
    }
  };

  const extractTextFromPDF = async (file) => {
    return `[PDF Document: ${file.name}]\n\nThis is where the extracted text from the PDF would appear. The PDF text extraction functionality needs to be implemented using a library like pdf.js or pdf-parse.\n\nDocument content would be extracted and displayed here automatically.`;
  };

  const extractTextFromDocx = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value;
      
      if (extractedText && extractedText.trim().length > 0) {
        const formattedText = extractedText
          .replace(/\s+/g, ' ')
          .substring(0, 3000)
          .replace(/([.!?])\s+/g, '$1\n\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        
        return `[Word Document: ${file.name}]\n\n${formattedText}${extractedText.length > 3000 ? '\n\n...' : ''}`;
      } else {
        return `[Word Document: ${file.name}]\n\nNo text content found in this document. The document may be empty or contain only images.`;
      }
    } catch (error) {
      console.error('Error extracting text from DOCX with mammoth:', error);
      return `[Word Document: ${file.name}]\n\nUnable to extract text from this Word document. The file may be corrupted or in an unsupported format.`;
    }
  };

  const extractTextFromPptx = async (file) => {
    return `[PowerPoint Presentation: ${file.name}]\n\nThis is where the extracted text from the PowerPoint would appear. The PPTX text extraction functionality needs to be implemented using a library like pptx-parser.\n\nSlide content would be extracted and displayed here automatically.`;
  };

  const extractTextFromExcel = async (file) => {
    return `[Excel Spreadsheet: ${file.name}]\n\nThis is where the extracted text from the Excel file would appear. The Excel text extraction functionality needs to be implemented using a library like xlsx or exceljs.\n\nCell content would be extracted and displayed here automatically.`;
  };

  const extractTextFromText = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };
  
  // Form Builder Functions
  const addMultipleQuestions = (type, quantity) => {
    const newQuestions = [];
    for (let i = 0; i < quantity; i++) {
      const newQuestion = {
        id: Date.now() + i,
        type: type,
        question: "",
        options: type === 'multiple_choice' ? ['', '', '', ''] : [],
        correctAnswer: type === 'true_false' ? '' : (type === 'multiple_choice' ? '' : (type === 'enumeration' ? [''] : '')),
        points: 1,
        required: true,
        scoringCriteria: type === 'reflection_essay' ? [''] : [],
        expectedAnswers: type === 'enumeration' ? [''] : [],
      };
      newQuestions.push(newQuestion);
    }
    setQuestions([...questions, ...newQuestions]);
  };

  const updateQuestionQuantity = (type, value) => {
    // Allow empty values or limit between 1-50
    const quantity = value === '' ? '' : Math.max(1, Math.min(50, parseInt(value) || 1));
    setQuestionQuantities(prev => ({
      ...prev,
      [type]: quantity
    }));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const deleteQuestionsByType = (type) => {
    const questionsToDelete = questions.filter(q => q.type === type);
    if (questionsToDelete.length === 0) {
      return; // No questions of this type to delete
    }
    
    const questionType = questionTypes.find(t => t.id === type);
    setDeleteModal({
      isOpen: true,
      questionType: type,
      questionCount: questionsToDelete.length,
      questionLabel: questionType?.label || type
    });
  };

  const confirmDeleteQuestions = () => {
    setQuestions(questions.filter(q => q.type !== deleteModal.questionType));
    setDeleteModal({
      isOpen: false,
      questionType: '',
      questionCount: 0,
      questionLabel: ''
    });
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      questionType: '',
      questionCount: 0,
      questionLabel: ''
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveForm = () => {
    // Here you would save the form data and navigate back or to next step
    console.log("Saving form:", { taskTitle, instruction, questions });
    const data = {taskTitle, instruction, questions};
    // Navigate back to previous page
    localStorage.setItem("saved-form", JSON.stringify(data));
    // Clear the taskFormData since we're done with it
    localStorage.removeItem("taskFormData");
    navigate(`/space/${space_uuid}/${space_name}/tasks`);
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow transition"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
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
        <div className="max-w-6xl mx-auto rounded-xl shadow-lg p-8" 
             style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, border: '1px solid' }}>
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
                  className="w-full rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                  style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Instruction (optional)
                </label>
                <div className="rounded-lg border focus-within:border-blue-500"
                     style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                  <div
                    ref={instructionRef}
                    contentEditable
                    className="min-h-[140px] px-4 py-3 outline-none"
                    suppressContentEditableWarning
                    style={{ color: currentColors.text }}
                    dangerouslySetInnerHTML={{ __html: instruction }}
                  />
                  <div className="border-t" style={{ borderColor: currentColors.border }} />
                  <div className="flex gap-4 px-4 py-2 justify-center" style={{ color: currentColors.textSecondary }}>
                    <button
                      type="button"
                      onClick={() => applyFormat("bold")}
                      className="transition-colors"
                      style={{ color: currentColors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = currentColors.text}
                      onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                    >
                      <FiBold />
                    </button>

                    <button
                      type="button"
                      onClick={() => applyFormat("italic")}
                      className="transition-colors"
                      style={{ color: currentColors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = currentColors.text}
                      onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                    >
                      <FiItalic />
                    </button>

                    <button
                      type="button"
                      onClick={() => applyFormat("underline")}
                      className="transition-colors"
                      style={{ color: currentColors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = currentColors.text}
                      onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                    >
                      <FiUnderline />
                    </button>

                    {/* File Upload Button */}
                    <div className="border-l" style={{ borderColor: currentColors.border }} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Upload button clicked");
                        handleFileClick();
                      }}
                      className="transition-colors flex items-center gap-1 cursor-pointer hover:bg-opacity-10 hover:bg-white rounded px-2 py-1"
                      style={{ color: currentColors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = currentColors.text}
                      onMouseLeave={(e) => e.target.style.color = currentColors.textSecondary}
                      title={selectedFile ? selectedFile.name : "Upload file (DOCS, PDF, PPT, EXCEL - up to 10MB)"}
                    >
                      <FiUploadCloud size={16} />
                      <span className="text-xs truncate max-w-24">
                        {selectedFile ? selectedFile.name : "Upload"}
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM BUILDER */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6">Form Questions</h3>

            {/* QUESTION TYPE SELECTION */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">
                Add Question Type: 
                {taskCategory === 'reflection-essay' && (
                  <span className="ml-2 text-sm text-gray-400">(Short Answer Only)</span>
                )}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {getAvailableQuestionTypes().map((type) => {
                  const Icon = type.icon;
                  const questionsOfType = questions.filter(q => q.type === type.id);
                  return (
                    <div className="rounded-lg p-4 border" 
                         style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                      <div className="flex flex-col items-center gap-2">
                        <Icon size={24} style={{ color: currentColors.accent }} />
                        <span className="text-sm font-medium text-center" style={{ color: currentColors.text }}>{type.label}</span>
                        <span className="text-xs text-gray-400">({questionsOfType.length} added)</span>
                        <div className="flex flex-col items-center gap-2 w-full">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={questionQuantities[type.id]}
                            onChange={(e) => updateQuestionQuantity(type.id, e.target.value)}
                            className="w-full rounded px-2 py-1 text-sm outline-none border focus:border-blue-500 text-center"
                            style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
                            placeholder="total no. of questions"
                          />
                          <button
                            onClick={() => addMultipleQuestions(type.id, questionQuantities[type.id] || 0)}
                            className="w-full px-3 py-1 rounded text-xs font-medium transition"
                            style={{ 
                              backgroundColor: currentColors.accent, 
                              color: 'white',
                              opacity: !questionQuantities[type.id] ? 0.5 : 1,
                              cursor: !questionQuantities[type.id] ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = currentColors.accent}
                            disabled={!questionQuantities[type.id]}
                          >
                            Add {questionQuantities[type.id] || 0}
                          </button>
                          <button
                            onClick={() => deleteQuestionsByType(type.id)}
                            className="w-full px-3 py-1 rounded text-xs font-medium transition flex items-center justify-center gap-1 mt-2"
                            style={{ 
                              backgroundColor: '#dc2626', 
                              color: 'white',
                              opacity: questionsOfType.length === 0 ? 0.5 : 1,
                              cursor: questionsOfType.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                            disabled={questionsOfType.length === 0}
                          >
                            <FiTrash2 size={14} /> Delete All {type.label}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUESTIONS LIST */}
            {questions.length > 0 ? (
              <div className="space-y-6">
                <h4 className="font-semibold">Questions ({questions.length})</h4>
                {questions.map((question, index) => {
                  const isFirstOfItsType = index === 0 || questions[index - 1]?.type !== question.type;
                  const questionsOfType = questions.filter(q => q.type === question.type);
                  
                  return (
                    <div className="rounded-lg p-6 border" 
                         style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold" 
                                style={{ backgroundColor: currentColors.accent }}>
                            Q{index + 1}
                          </span>
                          <span 
                                className="px-3 py-1 rounded-full text-sm" 
                                style={{ backgroundColor: currentColors.surface, color: currentColors.textSecondary }}>
                            {questionTypes.find(t => t.id === question.type)?.label}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete this question"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
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
                    {question.type === 'identification' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Correct Answer:</label>
                        <input
                          type="text"
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                          className="w-full rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
                          placeholder="Enter the correct answer for identification"
                        />
                      </div>
                    )}

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
                                className="flex-1 rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                                style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
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

                    {question.type === 'enumeration' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Expected Answers:</label>
                        <div className="space-y-2">
                          {question.expectedAnswers.map((answer, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-gray-400 w-6">{index + 1}.</span>
                              <input
                                type="text"
                                value={answer}
                                onChange={(e) => {
                                  const newAnswers = [...question.expectedAnswers];
                                  newAnswers[index] = e.target.value;
                                  updateQuestion(question.id, 'expectedAnswers', newAnswers);
                                }}
                                className="flex-1 rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                                style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
                                placeholder={`Expected answer ${index + 1}`}
                              />
                              {question.expectedAnswers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newAnswers = question.expectedAnswers.filter((_, i) => i !== index);
                                    updateQuestion(question.id, 'expectedAnswers', newAnswers);
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                  title="Remove this answer"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newAnswers = [...question.expectedAnswers, ''];
                              updateQuestion(question.id, 'expectedAnswers', newAnswers);
                            }}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                          >
                            + Add Expected Answer
                          </button>
                        </div>
                      </div>
                    )}

                    {question.type === 'reflection_essay' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Sample Answer / Key Points (Optional):</label>
                        <textarea
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 rounded text-sm font-medium transition"
                          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
                          placeholder="Enter a sample answer or key points for evaluation (optional)"
                        />
                        
                        <label className="block text-sm font-medium mb-2">Scoring Criteria:</label>
                        <div className="space-y-2">
                          {question.scoringCriteria.map((criterion, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={criterion}
                                onChange={(e) => {
                                  const newCriteria = [...question.scoringCriteria];
                                  newCriteria[index] = e.target.value;
                                  updateQuestion(question.id, 'scoringCriteria', newCriteria);
                                }}
                                className="flex-1 rounded-lg px-3 py-2 outline-none border focus:border-blue-500"
                                style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
                                placeholder={`Criterion ${index + 1} (e.g., Content Quality: 30%)`}
                              />
                              {question.scoringCriteria.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCriteria = question.scoringCriteria.filter((_, i) => i !== index);
                                    updateQuestion(question.id, 'scoringCriteria', newCriteria);
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                  title="Remove this criterion"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newCriteria = [...question.scoringCriteria, ''];
                              updateQuestion(question.id, 'scoringCriteria', newCriteria);
                            }}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition"
                          >
                            + Add Scoring Criterion
                          </button>
                        </div>
                      </div>
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Correct Answer:</label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                          className="w-full rounded-lg px-4 py-2 outline-none border focus:border-blue-500"
                          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }}
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p>No questions added yet. Select a question type above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(30_36_46_/var(--tw-bg-opacity,1))] rounded-xl p-6 max-w-md w-full mx-4 border border-[#2F3440]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <FiTrash2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete All {deleteModal.questionLabel} Questions</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete all {deleteModal.questionCount} {deleteModal.questionLabel.toLowerCase()} question{deleteModal.questionCount > 1 ? 's' : ''}?
                </p>
              </div>
            </div>
            
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-300">
                <strong>Warning:</strong> This action cannot be undone. All questions of this type will be permanently removed from your form.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestions}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete All {deleteModal.questionCount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
