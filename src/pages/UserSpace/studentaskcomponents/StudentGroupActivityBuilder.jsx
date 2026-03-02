import React, { useState, useRef } from 'react';
import { FiArrowLeft, FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

const StudentGroupActivityBuilder = ({ 
  currentColors, 
  onBack, 
  onSave, 
  onPublish,
  isLoading = false 
}) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const instructionRef = useRef(null);

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
      dueDate,
      category: 'group-activity'
    };

    if (status === 'published') {
      onPublish(activityData);
    } else {
      onSave(activityData);
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

      {/* GROUP ACTIVITY FORM */}
      <div className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">👥</div>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>Group Activity Builder</h1>
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
              placeholder="Enter activity title"
            />

            {/* INSTRUCTION */}
            <label className="font-semibold" style={{ color: currentColors.text }}>
              Instructions (optional)
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
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
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
              min={new Date().toISOString().split('T')[0]}
            />
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

export default StudentGroupActivityBuilder;