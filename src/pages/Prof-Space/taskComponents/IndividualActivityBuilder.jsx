import React, { useState, useRef } from 'react';
import { FiArrowLeft, FiUploadCloud, FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

const IndividualActivityBuilder = ({ 
  currentColors, 
  onBack, 
  onSave, 
  onPublish,
  isLoading = false 
}) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [score, setScore] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activityType, setActivityType] = useState('assignment');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);
  const [latePenalty, setLatePenalty] = useState('10');
  
  const instructionRef = useRef(null);
  const fileInputRef = useRef(null);

  const activityTypes = [
    { value: 'assignment', label: 'Assignment', emoji: '📝' },
    { value: 'homework', label: 'Homework', emoji: '📚' },
    { value: 'project', label: 'Project', emoji: '🎯' },
    { value: 'lab', label: 'Lab Activity', emoji: '🔬' },
    { value: 'reading', label: 'Reading Assignment', emoji: '📖' },
    { value: 'presentation', label: 'Presentation', emoji: '📊' }
  ];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("File selected:", file);

    // Extract text from document and populate instruction field
    if (file) {
      try {
        const extractedText = await extractTextFromFile(file);
        if (extractedText) {
          setInstruction(extractedText);
          // Update the contentEditable div if it exists
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

      // PDF file extraction
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        resolve(`[PDF Document: ${file.name}]\n\nContent extraction from PDF requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      // Word document extraction
      else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        resolve(`[Word Document: ${file.name}]\n\nContent extraction from DOCX requires mammoth.js library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      // PowerPoint extraction
      else if (fileType.includes('presentation') || fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        resolve(`[PowerPoint Presentation: ${file.name}]\n\nContent extraction from PPTX requires additional library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      // Excel extraction
      else if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        resolve(`[Excel Spreadsheet: ${file.name}]\n\nContent extraction from Excel requires xlsx library integration.\n\nFile size: ${(file.size / 1024).toFixed(2)} KB`);
      }
      // Plain text file
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

  // Sync instruction state with contentEditable
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
    const activityData = {
      title: activityTitle,
      instruction,
      score: Number(score),
      dueDate,
      activityType,
      estimatedTime,
      allowLateSubmission,
      latePenalty: Number(latePenalty),
      selectedFile,
      category: 'individual-activity'
    };

    if (status === 'published') {
      onPublish(activityData);
    } else {
      onSave(activityData);
    }
  };

  const resetForm = () => {
    setActivityTitle('');
    setInstruction('');
    setScore('');
    setDueDate('');
    setSelectedFile(null);
    setActivityType('assignment');
    setEstimatedTime('');
    setAllowLateSubmission(true);
    setLatePenalty('10');
    if (instructionRef.current) {
      instructionRef.current.innerHTML = "";
    }
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SECTION */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="font-semibold text-lg" style={{ color: currentColors.text }}>
              Activity Title: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentColors.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentColors.border;
              }}
              placeholder="Enter activity title"
            />

            <label className="font-semibold" style={{ color: currentColors.text }}>
              Activity Type: <span className="text-red-500">*</span>
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              onFocus={(e) => {
                e.target.style.borderColor = currentColors.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentColors.border;
              }}
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>

            {/* INSTRUCTION */}
            <label className="font-semibold" style={{ color: currentColors.text }}>
              Instructions (optional)
            </label>

            <div className="rounded-lg border transition-colors" style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}>
              {/* Editable Instruction Area */}
              <div
                ref={instructionRef}
                contentEditable
                className="min-h-[140px] px-4 py-3 outline-none"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text
                }}
                suppressContentEditableWarning
              />

              {/* Divider */}
              <div className="border-t" style={{ borderColor: currentColors.border }} />

              {/* Formatting Toolbar (BOTTOM) */}
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
                Attach Files (optional)
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
                  Choose a file or drag & drop it here.
                </p>

                <p className="text-xs mb-4" style={{ color: currentColors.textSecondary }}>
                  DOCS, PDF, PPT AND EXCEL, UP TO 10 MB
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
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = currentColors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = currentColors.background;
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
              Score: <span className="text-red-500">*</span>
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
              onFocus={(e) => {
                e.target.style.borderColor = currentColors.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentColors.border;
              }}
              placeholder="Enter score (e.g., 100)"
              min="0"
            />

            <label className="font-semibold" style={{ color: currentColors.text }}>
              Due Date: <span className="text-red-500">*</span>
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
              onFocus={(e) => {
                e.target.style.borderColor = currentColors.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentColors.border;
              }}
              min={new Date().toISOString().split('T')[0]}
            />

            <label className="font-semibold" style={{ color: currentColors.text }}>
              Estimated Time (minutes):
            </label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="rounded-lg px-4 py-2 outline-none border transition-colors"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                borderColor: currentColors.border
              }}
              placeholder="e.g., 30 minutes"
            />

            {/* SUBMISSION SETTINGS */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
              <h3 className="font-semibold mb-4" style={{ color: currentColors.text }}>Submission Settings</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allowLateSubmission}
                    onChange={(e) => setAllowLateSubmission(e.target.checked)}
                    className="w-4 h-4 mr-3"
                  />
                  <span style={{ color: currentColors.text }}>Allow late submission</span>
                </label>

                {allowLateSubmission && (
                  <div className="ml-7">
                    <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                      Late submission penalty (%):
                    </label>
                    <input
                      type="number"
                      value={latePenalty}
                      onChange={(e) => setLatePenalty(e.target.value)}
                      className="w-24 rounded px-2 py-1 outline-none border text-sm"
                      style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.text,
                        borderColor: currentColors.border
                      }}
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
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
            {isLoading ? 'Publishing...' : 'Publish Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualActivityBuilder;
