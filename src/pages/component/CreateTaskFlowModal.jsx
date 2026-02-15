import React, { useState } from 'react';
import { FiCalendar, FiEdit, FiClock, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';

const colors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-orange-500 to-orange-600',
  'bg-gradient-to-r from-pink-500 to-pink-600',
  'bg-gradient-to-r from-indigo-500 to-indigo-600',
  'bg-gradient-to-r from-teal-500 to-teal-600',
  'bg-gradient-to-r from-red-500 to-red-600'
];
const icons = [
  '📚', '💻', '🔬', '🧠', '⚽', '💼', '🔧', '📊'
];

const CreateTaskFlowModal = ({
  show,
  setShow,
  availableSpaces,
  contextError,
  refreshSpaces,
  onTaskCreate
}) => {
  const [step, setStep] = useState('select');
  const [selectedSpace, setSelectedSpace] = useState("");
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    type: "Assignment"
  });

  if (!show) return null;

  // Step 1: Select Space
  if (step === 'select') {
    const spaces = Array.isArray(availableSpaces) ? availableSpaces : [];
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto border border-gray-200">
          <div className="p-3 bg-gradient-to-r from-blue-800 to-indigo-800 border-b border-blue-700 flex justify-between items-center">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                <FiCalendar className="text-white" size={10} />
              </div>
              Select Space
              {contextError && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Demo Mode</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshSpaces}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
                title="Refresh spaces"
              >
                <FiClock className="text-blue-600" size={14} />
              </button>
              <button
                onClick={() => setShow(false)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {spaces.length === 0 ? (
                <div className="p-4 text-center">
                  <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-500 text-sm">No spaces available</p>
                  <p className="text-gray-400 text-xs mt-1">Create or join spaces to add activities</p>
                  <button
                    onClick={refreshSpaces}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FiPlus className="inline mr-2" size={16} />
                    Refresh Spaces
                  </button>
                </div>
              ) : (
                spaces.map((space, index) => (
                  <button
                    key={space.space_uuid || index}
                    onClick={() => {
                      setSelectedSpace(space.space_name);
                      setStep('create');
                    }}
                    className="w-full group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-gray-800"
                  >
                    <div className={`absolute inset-0 ${colors[index % colors.length]} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative flex items-center gap-3 px-4 py-3 text-left">
                      <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform`}>
                        {icons[index % icons.length]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                          {space.space_name}
                        </p>
                        <p className="text-xs text-gray-200 group-hover:text-gray-100 transition-colors">
                          {space.space_type} • {space.members?.length || 0} members
                        </p>
                      </div>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <FiPlus className="text-white group-hover:text-blue-200 transition-colors" size={12} />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Create Task
  const safeSelectedSpace = selectedSpace || "";
  const space = availableSpaces && availableSpaces.find && availableSpaces.find(s => s.space_name === safeSelectedSpace);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl border-b border-blue-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FiPlus className="text-white" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create New Task</h3>
                <p className="text-blue-100 text-sm">Add a new task for {safeSelectedSpace || 'selected space'}</p>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Space Selection */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600" size={12} />
                  </div>
                  Space
                </label>
                <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-black font-medium">
                  {safeSelectedSpace || "Select a space"}
                </div>
              </div>
              {/* Task Title */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiEdit className="text-green-600" size={12} />
                  </div>
                  Task Title
                </label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                  placeholder="Enter task title"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiEdit className="text-purple-600" size={12} />
                  </div>
                  Description
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-black"
                  rows="4"
                  placeholder="Enter task description"
                />
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-5">
              {/* Due Date and Time */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiClock className="text-orange-600" size={12} />
                  </div>
                  Due Date & Time
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Date</label>
                    <input
                      type="date"
                      value={newActivity.dueDate}
                      onChange={(e) => setNewActivity({...newActivity, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Time</label>
                    <input
                      type="time"
                      value={newActivity.dueTime}
                      onChange={(e) => setNewActivity({...newActivity, dueTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                </div>
              </div>
              {/* Priority and Type */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiAlertCircle className="text-red-600" size={12} />
                  </div>
                  Priority & Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Priority</label>
                    <select
                      value={newActivity.priority}
                      onChange={(e) => setNewActivity({...newActivity, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1">Task Type</label>
                    <select
                      value={newActivity.type}
                      onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="Assignment">📝 Assignment</option>
                      <option value="Exam">📋 Exam</option>
                      <option value="Lab Activity">🔬 Lab Activity</option>
                      <option value="Paper">📄 Paper</option>
                      <option value="Practical Exam">⚽ Practical Exam</option>
                      <option value="Presentation">🎯 Presentation</option>
                      <option value="Project Demo">💻 Project Demo</option>
                      <option value="Coding Challenge">💡 Coding Challenge</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShow(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-white rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (safeSelectedSpace && newActivity.title && newActivity.description && space) {
                  try {
                    const activityPayload = {
                      task_title: newActivity.title,
                      task_instruction: newActivity.description,
                      task_due: `${newActivity.dueDate}T${newActivity.dueTime}:00`,
                      task_status: 'pending',
                      space_id: space.space_uuid,
                      task_type: newActivity.type,
                      priority: newActivity.priority
                    };
                    const response = await fetch(`/api/spaces/${space.space_uuid}/tasks`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(activityPayload)
                    });
                    if (response.ok) {
                      const newTask = {
                        id: Date.now(),
                        title: newActivity.title,
                        description: newActivity.description,
                        dueDate: newActivity.dueDate,
                        dueTime: newActivity.dueTime,
                        priority: newActivity.priority,
                        status: 'pending',
                        assignedBy: 'You',
                        category: 'Academic',
                        spaceId: space.space_uuid
                      };
                      if (onTaskCreate && typeof onTaskCreate === 'function') {
                        onTaskCreate(newTask);
                      }
                      setShow(false);
                    } else {
                      alert('Failed to create task');
                    }
                  } catch (error) {
                    alert('Error creating task: ' + error.message);
                  }
                }
              }}
              disabled={!safeSelectedSpace || !newActivity.title || !newActivity.description}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <FiPlus size={16} />
                Create Task
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskFlowModal;
