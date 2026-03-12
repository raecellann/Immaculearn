import React, { useState, useRef } from 'react';
import { FiArrowLeft, FiUploadCloud, FiClock, FiLock, FiEye, FiEyeOff, FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

const ExamBuilder = ({ 
  currentColors, 
  onBack, 
  onSave, 
  onPublish,
  isLoading = false 
}) => {
  const [examTitle, setExamTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [score, setScore] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [examType, setExamType] = useState('final');
  const [duration, setDuration] = useState('60');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attempts, setAttempts] = useState('1');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [requireProctoring, setRequireProctoring] = useState(false);
  const [allowCalculator, setAllowCalculator] = useState(false);
  const [allowNotes, setAllowNotes] = useState(false);
  const [passingScore, setPassingScore] = useState('70');
  
  const instructionRef = useRef(null);
  const fileInputRef = useRef(null);

  const examTypes = [
    { value: 'quiz', label: 'Quiz', emoji: '📝' },
    { value: 'midterm', label: 'Midterm Exam', emoji: '📋' },
    { value: 'final', label: 'Final Exam', emoji: '🎯' },
    { value: 'practical', label: 'Practical Exam', emoji: '🔬' },
    { value: 'oral', label: 'Oral Exam', emoji: '🗣️' },
    { value: 'assessment', label: 'Assessment', emoji: '📊' }
  ];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("File selected:", file);

    if (file) {
      try {
        const extractedText = await extractTextFromFile(file);
        if (extractedText) {
          setInstruction(extractedText);
          if (instructionRef.current) {
            instructionRef.current.innerHTML = extractedText;
          }
          console.log("Text extracted from document:", extractedText);
        }
      } catch (error) {
        console.error("Error extracting text from file:", error);
      }
    }
  };

  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        resolve(`[PDF Document: ${file.name}]\n\nContent extraction from PDF requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        resolve(`[Word Document: ${file.name}]\n\nContent extraction from DOCX requires mammoth.js library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      else if (fileType.includes('presentation') || fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        resolve(`[PowerPoint Presentation: ${file.name}]\n\nContent extraction from PPTX requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      else if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        resolve(`[Excel Spreadsheet: ${file.name}]\n\nContent extraction from Excel requires xlsx library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      else if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
        const fileReader = new FileReader();
        fileReader.onload = function() {
          resolve(this.result);
        };
        fileReader.onerror = reject;
        fileReader.readAsText(file);
      }
      else {
        reject(new Error('Unsupported file type for text extraction'));
      }
    });
  };

  React.useEffect(() => {
    if (instructionRef.current) {
      const handleInput = () => {
        setInstruction(instructionRef.current.innerHTML);
      };
      instructionRef.current.addEventListener('input', handleInput);
      return () => {
        instructionRef.current?.removeEventListener('input', handleInput);
      };
    }
  }, []);

  const applyFormat = (format) => {
    document.execCommand(format, false, null);
    instructionRef.current?.focus();
  };

  const handleSave = (status) => {
    const examData = {
      title: examTitle,
      instruction,
      score: Number(score),
      dueDate,
      examType,
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
      selectedFile,
      category: 'exam'
    };

    if (status === 'published') {
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

      {/* EXAM FORM */}
      <div className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">📋</div>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>Exam Builder</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SECTION */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="font-semibold text-lg" style={{ color: currentColors.text }}>
              Exam Title: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              placeholder="Enter exam title"
            />

            <label className="font-semibold" style={{ color: currentColors.text }}>
              Exam Type: <span className="text-red-500">*</span>
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
            >
              {examTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>

            {/* INSTRUCTION */}
            <label className="font-semibold" style={{ color: currentColors.text }}>
              Exam Instructions (optional)
            </label>

            <div className="rounded-lg border transition-colors" style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}>
              <div
                ref={instructionRef}
                contentEditable
                className="min-h-[140px] px-4 py-3 outline-none"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text
                }}
                suppressContentEditableWarning
                placeholder="Add exam instructions, guidelines, and expectations..."
              />

              <div className="border-t" style={{ borderColor: currentColors.border }} />

              <div className="flex gap-4 px-4 py-2" style={{ color: currentColors.textSecondary }}>
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

            {/* FILE UPLOAD */}
            <div className="mt-6">
              <label className="block font-semibold mb-2" style={{ color: currentColors.text }}>
                Attach Exam Materials (optional)
              </label>

              <div
                onClick={handleFileClick}
                className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{
                  borderColor: currentColors.border,
                  backgroundColor: currentColors.background
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = currentColors.accent;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = currentColors.border;
                }}
              >
                <FiUploadCloud
                  size={36}
                  className="mb-3" style={{ color: currentColors.textSecondary }}
                />

                <p className="text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                  Upload exam materials, reference sheets, or resources
                </p>

                <p className="text-xs mb-4" style={{ color: currentColors.textSecondary }}>
                  PDF, DOC, PPT, EXCEL up to 10 MB
                </p>

                {selectedFile && (
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: currentColors.surface }}>
                    <p className="text-sm" style={{ color: currentColors.text }}>
                      Selected: {selectedFile.name}
                    </p>
                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="px-4 py-1.5 border rounded-md text-sm transition-colors mt-4"
                  style={{
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.background,
                    color: currentColors.text
                  }}
                >
                  Browse Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
            <label className="font-semibold" style={{ color: currentColors.text }}>
              Total Score: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              placeholder="Enter total score"
              min="1"
            />

            <label className="font-semibold" style={{ color: currentColors.text }}>
              Exam Date: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* EXAM SCHEDULING */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: currentColors.text }}>
                <FiClock /> Exam Schedule
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    Duration (minutes):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="flex-1 rounded px-3 py-2 outline-none border text-sm"
                      style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.text,
                        borderColor: currentColors.border
                      }}
                      min="1"
                      max="480"
                    />
                    <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                      {formatDuration(Number(duration))}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    Start Time:
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    End Time:
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                  />
                </div>
              </div>
            </div>

            {/* EXAM SETTINGS */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: currentColors.text }}>
                <FiLock /> Exam Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    Attempts Allowed:
                  </label>
                  <select
                    value={attempts}
                    onChange={(e) => setAttempts(e.target.value)}
                    className="w-full rounded px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                  >
                    <option value="1">1 attempt</option>
                    <option value="2">2 attempts</option>
                    <option value="3">3 attempts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    Passing Score (%):
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full rounded px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm" style={{ color: currentColors.text }}>Shuffle questions for each student</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showResultsImmediately}
                      onChange={(e) => setShowResultsImmediately(e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm" style={{ color: currentColors.text }}>Show results immediately after submission</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requireProctoring}
                      onChange={(e) => setRequireProctoring(e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm" style={{ color: currentColors.text }}>Require proctoring</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={allowCalculator}
                      onChange={(e) => setAllowCalculator(e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm" style={{ color: currentColors.text }}>Allow calculator</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={allowNotes}
                      onChange={(e) => setAllowNotes(e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm" style={{ color: currentColors.text }}>Allow notes/reference materials</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXAM SUMMARY */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
          <h3 className="font-semibold mb-3" style={{ color: currentColors.text }}>Exam Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="ml-2" style={{ color: currentColors.text }}>{formatDuration(Number(duration))}</span>
            </div>
            <div>
              <span className="text-gray-400">Attempts:</span>
              <span className="ml-2" style={{ color: currentColors.text }}>{attempts}</span>
            </div>
            <div>
              <span className="text-gray-400">Passing Score:</span>
              <span className="ml-2" style={{ color: currentColors.text }}>{passingScore}%</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
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
            {isLoading ? 'Publishing...' : 'Publish Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamBuilder;
