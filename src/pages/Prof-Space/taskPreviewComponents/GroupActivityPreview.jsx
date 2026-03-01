import React, { useState } from 'react';

const GroupActivityPreview = ({ taskData, currentColors }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: currentColors.background }}>
      {/* Activity Header */}
      <div className="mb-8 p-6 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: currentColors.text }}>
          Group Activity Preview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold" style={{ color: currentColors.textSecondary }}>Total Score:</span>
            <p style={{ color: currentColors.text }}>{taskData?.total_score || 0} points</p>
          </div>
          <div>
            <span className="font-semibold" style={{ color: currentColors.textSecondary }}>Due Date:</span>
            <p style={{ color: currentColors.text }}>
              {taskData?.task_due_date 
                ? new Date(taskData.task_due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'No due date'
              }
            </p>
          </div>
          <div>
            <span className="font-semibold" style={{ color: currentColors.textSecondary }}>Type:</span>
            <p style={{ color: currentColors.text }}>Group Activity</p>
          </div>
        </div>
        {taskData?.task_instructions && (
          <div className="mt-4 p-3 rounded" style={{
            backgroundColor: currentColors.background,
            borderLeft: `4px solid #2563eb`
          }}>
            <p className="text-sm font-semibold mb-1" style={{ color: currentColors.textSecondary }}>Instructions:</p>
            <p style={{ color: currentColors.text }}>{taskData.task_instructions}</p>
          </div>
        )}
      </div>

      {/* Group Selection */}
      <div className="mb-8 p-6 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: currentColors.text }}>
          Select Your Group
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Group 1', 'Group 2', 'Group 3'].map((group, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGroup === index ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{
                backgroundColor: selectedGroup === index ? '#EFF6FF' : currentColors.background,
                borderColor: selectedGroup === index ? '#2563eb' : currentColors.border
              }}
              onClick={() => setSelectedGroup(index)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold mb-2" style={{ color: currentColors.text }}>
                  {group}
                </h3>
                <div className="text-sm space-y-1" style={{ color: currentColors.textSecondary }}>
                  <p>Members: 3-4</p>
                  <p>Leader: To be assigned</p>
                </div>
                {selectedGroup === index && (
                  <div className="mt-2">
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Content */}
      <div className="p-6 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: currentColors.text }}>
          Activity Details
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: currentColors.text }}>
              Description
            </h3>
            <p style={{ color: currentColors.text, lineHeight: '1.6' }}>
              {taskData?.task_instructions || 'No instructions provided for this group activity.'}
            </p>
          </div>

          {/* Group Collaboration Area */}
          <div className="mt-6 p-6 border rounded-lg" style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.border
          }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: currentColors.text }}>
              Group Collaboration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chat Area */}
              <div className="p-4 rounded border" style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border
              }}>
                <h4 className="font-medium mb-3" style={{ color: currentColors.text }}>
                  Group Chat
                </h4>
                <div className="space-y-2 mb-3">
                  <div className="text-sm">
                    <span className="font-medium" style={{ color: '#2563eb' }}>Student 1:</span>
                    <span style={{ color: currentColors.text }}> Let's start working on this!</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium" style={{ color: '#2563eb' }}>Student 2:</span>
                    <span style={{ color: currentColors.text }}> I agree, let's divide the tasks.</span>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: currentColors.border,
                    color: currentColors.text
                  }}
                />
              </div>

              {/* File Sharing */}
              <div className="p-4 rounded border" style={{
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border
              }}>
                <h4 className="font-medium mb-3" style={{ color: currentColors.text }}>
                  Shared Files
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm p-2 rounded" style={{
                    backgroundColor: currentColors.background
                  }}>
                    <span>📄</span>
                    <span style={{ color: currentColors.text }}>research_notes.pdf</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded" style={{
                    backgroundColor: currentColors.background
                  }}>
                    <span>📊</span>
                    <span style={{ color: currentColors.text }}>data_analysis.xlsx</span>
                  </div>
                </div>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                  + Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Submission Area */}
          <div className="mt-6 p-6 border-2 border-dashed rounded-lg text-center" style={{
            borderColor: currentColors.border,
            backgroundColor: currentColors.background
          }}>
            <div className="text-4xl mb-3">📁</div>
            <p className="text-lg font-medium mb-2" style={{ color: currentColors.text }}>
              Submit Group Work
            </p>
            <p className="text-sm mb-4" style={{ color: currentColors.textSecondary }}>
              Upload your completed group project here
            </p>
            <button 
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#2563eb' }}
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <p style={{ color: currentColors.textSecondary }}>
          This is a preview of the group activity. Students will see this interface when participating in the group project.
        </p>
      </div>
    </div>
  );
};

export default GroupActivityPreview;
