import React, { useState } from 'react';

const IndividualActivityPreview = ({ taskData, currentColors }) => {
  return (
    <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: currentColors.background }}>
      {/* Activity Header */}
      <div className="mb-8 p-6 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: currentColors.text }}>
          Individual Activity Preview
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
            <p style={{ color: currentColors.text }}>Individual Activity</p>
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
              {taskData?.task_instructions || 'No instructions provided for this individual activity.'}
            </p>
          </div>

          {/* File Upload Area */}
          <div className="mt-6 p-6 border-2 border-dashed rounded-lg text-center" style={{
            borderColor: currentColors.border,
            backgroundColor: currentColors.background
          }}>
            <div className="text-4xl mb-3">📁</div>
            <p className="text-lg font-medium mb-2" style={{ color: currentColors.text }}>
              Submit Your Work
            </p>
            <p className="text-sm mb-4" style={{ color: currentColors.textSecondary }}>
              Upload your completed assignment here
            </p>
            <button 
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#2563eb' }}
            >
              Choose File
            </button>
          </div>

          {/* Submission Requirements */}
          <div className="mt-6 p-4 rounded" style={{
            backgroundColor: currentColors.background,
            border: `1px solid ${currentColors.border}`
          }}>
            <h3 className="text-lg font-medium mb-3" style={{ color: currentColors.text }}>
              Submission Requirements
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: currentColors.text }}>
              <li className="flex items-start gap-2">
                <span style={{ color: '#2563eb' }}>•</span>
                <span>Submit your work before the due date</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#2563eb' }}>•</span>
                <span>Ensure your name is clearly visible on the document</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#2563eb' }}>•</span>
                <span>Follow all formatting requirements mentioned in instructions</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#2563eb' }}>•</span>
                <span>Accepted file formats: PDF, DOC, DOCX, TXT</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 rounded-lg border" style={{
        backgroundColor: currentColors.surface,
        borderColor: currentColors.border
      }}>
        <p style={{ color: currentColors.textSecondary }}>
          This is a preview of the individual activity. Students will see this interface when viewing the assignment.
        </p>
      </div>
    </div>
  );
};

export default IndividualActivityPreview;
