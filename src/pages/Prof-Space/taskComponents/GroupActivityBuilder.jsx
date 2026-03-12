import React, { useState, useRef } from 'react';
import { FiArrowLeft, FiUsers, FiFilePlus } from 'react-icons/fi';
import { useNavigate } from 'react-router';

const GroupActivityBuilder = ({ 
  currentColors, 
  onBack, 
  onSave, 
  onPublish,
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const [activityTitle, setActivityTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [score, setScore] = useState('');
  const [dueDate, setDueDate] = useState('');
  const getLocalDateTimeMin = () => {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };

  const [estimatedTime, setEstimatedTime] = useState('');
  const [groupSize, setGroupSize] = useState('3');
  const [allowSelfGrouping, setAllowSelfGrouping] = useState(false);
  const [peerEvaluation, setPeerEvaluation] = useState(false);
  
  const instructionRef = useRef(null);

  // Group management state
  const [showManualGroups, setShowManualGroups] = useState(false);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(1);
  const [groups, setGroups] = useState([{ id: 1, members: [], leader: '', showInputs: false, isSaved: false, wasPreviouslySaved: false }]);
  const [activeGroup, setActiveGroup] = useState(1);
  const [groupsConfigured, setGroupsConfigured] = useState(false);
  const [groupCreationMethod, setGroupCreationMethod] = useState(null);
  const [generatedGroupsPreview, setGeneratedGroupsPreview] = useState([]);

  // Example available members
  const availableMembers = [
    "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis",
    "James Wilson", "Lisa Anderson", "Robert Taylor", "Maria Garcia",
    "David Martinez", "Jennifer Lopez"
  ];



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

  
  // Group management functions
  const handleManualGroups = () => {
    if (groupsConfigured) {
      if (groupCreationMethod === 'generate') {
        setShowGenerateGroups(true);
      } else {
        setActiveGroup(1);
        setShowManualGroups(true);
      }
    } else {
      const input = document.getElementById('groups-input');
      const numGroups = parseInt(input.value) || 1;
      setNumberOfGroups(numGroups);
      setGroupCreationMethod('manual');
      
      const newGroups = Array.from({ length: numGroups }, (_, index) => ({
        id: index + 1,
        members: [''],
        leader: '',
        showInputs: false,
        isSaved: false
      }));
      setGroups(newGroups);
      setActiveGroup(1);
      setShowManualGroups(true);
    }
  };

  const handleGenerateGroups = () => {
    const input = document.getElementById('groups-input');
    const numGroups = parseInt(input.value) || 1;
    setNumberOfGroups(numGroups);
    shuffleGroups(numGroups);
    setShowGenerateGroups(true);
  };

  const shuffleGroups = (numGroups) => {
    const shuffledMembers = [...availableMembers].sort(() => Math.random() - 0.5);
    const totalMembers = shuffledMembers.length;
    const baseMembersPerGroup = Math.floor(totalMembers / numGroups);
    const remainder = totalMembers % numGroups;
    
    const newGroups = Array.from({ length: numGroups }, (_, index) => {
      const membersCount = baseMembersPerGroup + (index < remainder ? 1 : 0);
      
      let startIndex = 0;
      for (let i = 0; i < index; i++) {
        startIndex += baseMembersPerGroup + (i < remainder ? 1 : 0);
      }
      const endIndex = startIndex + membersCount;
      
      const groupMembers = shuffledMembers.slice(startIndex, endIndex);
      const leader = groupMembers[0] || '';
      const members = groupMembers.slice(1);
      
      return {
        id: index + 1,
        leader: leader,
        members: members,
        showInputs: false,
        isSaved: true
      };
    });
    
    setGeneratedGroupsPreview(newGroups);
  };

  const handleGroupMemberChange = (groupId, memberIndex, value) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].members[memberIndex] = value;
    setGroups(updatedGroups);
  };

  const handleGroupLeaderChange = (groupId, value) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].leader = value;
    setGroups(updatedGroups);
  };

  const toggleGroupInputs = (groupId) => {
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].showInputs = !updatedGroups[groupId - 1].showInputs;
    setGroups(updatedGroups);
  };

  const saveGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    const validMembers = group.members.filter(member => member.trim());
    console.log(`Group ${groupId} saved with leader: ${group.leader}, members:`, validMembers);
    
    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].isSaved = true;
    updatedGroups[groupId - 1].showInputs = false;
    updatedGroups[groupId - 1].wasPreviouslySaved = true;
    setGroups(updatedGroups);
  };

  const addMemberToGroup = (memberName) => {
    const activeGroupData = groups[activeGroup - 1];
    if (!activeGroupData.showInputs) {
      console.log('Cannot add member: Group inputs are not visible. Click "Add People" first.');
      return;
    }

    const updatedGroups = [...groups];
    const activeGroupDataUpdated = updatedGroups[activeGroup - 1];
    
    if (!activeGroupDataUpdated.leader || activeGroupDataUpdated.leader.trim() === '') {
      activeGroupDataUpdated.leader = memberName;
      console.log(`Added "${memberName}" as leader of Group ${activeGroup}`);
    } else {
      const activeGroupMembers = activeGroupDataUpdated.members;
      const firstEmptyIndex = activeGroupMembers.findIndex(member => !member || member.trim() === '');
      
      if (firstEmptyIndex !== -1) {
        activeGroupMembers[firstEmptyIndex] = memberName;
      } else {
        activeGroupMembers.push(memberName);
        activeGroupMembers.push('');
      }
      console.log(`Added "${memberName}" to Group ${activeGroup} as member at position ${firstEmptyIndex !== -1 ? firstEmptyIndex + 1 : activeGroupMembers.length}`);
    }
    
    setGroups(updatedGroups);
  };

  const getAssignedMembers = () => {
    const allAssignedMembers = new Set();
    groups.forEach(group => {
      if (group.leader && group.leader.trim()) {
        allAssignedMembers.add(group.leader.trim());
      }
      group.members.forEach(member => {
        if (member && member.trim()) {
          allAssignedMembers.add(member.trim());
        }
      });
    });
    return allAssignedMembers;
  };

  const isMemberAssigned = (memberName) => {
    return getAssignedMembers().has(memberName);
  };

  const handleSave = (status) => {
    const activityData = {
      title: activityTitle,
      instruction,
      score: Number(score),
      dueDate,
      estimatedTime,
      groupSize: Number(groupSize),
      allowSelfGrouping,
      peerEvaluation,
      groupsConfigured,
      groupsData: groupsConfigured && groups.length > 0 ? groups.filter(g => g.leader?.trim() || g.members?.some(m => m?.trim())).map((group, index) => ({
        group_name: `Group_${index + 1}`,
        leader_id: group.leader?.trim() || null,
        members: group.members.filter(member => member?.trim()).map(member => member.trim())
      })) : null,
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold" style={{ color: currentColors.text }}>
                  Score: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }}
                  placeholder="Enter score"
                  min="0"
                />
              </div>

              <div>
                <label className="font-semibold" style={{ color: currentColors.text }}>
                  Est. Time (min):
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
                  style={{
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    borderColor: currentColors.border
                  }}
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="font-semibold" style={{ color: currentColors.text }}>
                Due Date: <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg px-4 py-2 outline-none border transition-colors w-full"
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: currentColors.border
                }}
                min={getLocalDateTimeMin()}
              />
            </div>

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

              </div>

          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1 flex flex-col gap-4 mt-6 lg:mt-0">
            {/* GROUP SETTINGS */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: currentColors.text }}>
                <FiUsers /> Group Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                    Group Size:
                  </label>
                  <select
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="w-full rounded px-3 py-2 outline-none border text-sm"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }}
                  >
                    <option value="2">2 members</option>
                    <option value="3">3 members</option>
                    <option value="4">4 members</option>
                    <option value="5">5 members</option>
                    <option value="6">6 members</option>
                  </select>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allowSelfGrouping}
                    onChange={(e) => setAllowSelfGrouping(e.target.checked)}
                    className="w-4 h-4 mr-3"
                  />
                  <span style={{ color: currentColors.text }}>Allow students to form their own groups</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={peerEvaluation}
                    onChange={(e) => setPeerEvaluation(e.target.checked)}
                    className="w-4 h-4 mr-3"
                  />
                  <span style={{ color: currentColors.text }}>Enable peer evaluation</span>
                </label>
              </div>
            </div>

            {/* GROUP MANAGEMENT */}
            {!allowSelfGrouping && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.background }}>
                <h3 className="font-semibold mb-4" style={{ color: currentColors.text }}>Group Management</h3>
                
                {groupsConfigured ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: currentColors.text }}>
                        Groups configured ({groups.filter(g => g.leader?.trim() || g.members?.some(m => m?.trim())).length})
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          onClick={() => {
                            setGroups([{ id: 1, members: [], leader: '', showInputs: false, isSaved: false, wasPreviouslySaved: false }]);
                            setGroupsConfigured(false);
                            setGroupCreationMethod(null);
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={handleManualGroups}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm" style={{ color: currentColors.text }}>Number of groups:</label>
                      <div className="flex items-center rounded-lg border" style={{ backgroundColor: currentColors.background, borderColor: currentColors.border }}>
                        <button
                          type="button"
                          className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                          onClick={() => {
                            const input = document.getElementById('groups-input');
                            if (input.value > 1) input.value = parseInt(input.value) - 1;
                          }}
                        >
                          -
                        </button>
                        <input
                          id="groups-input"
                          type="number"
                          className="bg-transparent w-12 text-center outline-none text-sm"
                          style={{ color: currentColors.text }}
                          defaultValue={1}
                          min="1"
                        />
                        <button
                          type="button"
                          className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                          onClick={() => {
                            const input = document.getElementById('groups-input');
                            input.value = parseInt(input.value) + 1;
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={handleManualGroups}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleGenerateGroups}
                      >
                        Auto-generate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-8">
          <button
            className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors"
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#10b981';
            }}
            onClick={() => navigate('/create-document')}
          >
            <FiFilePlus className="inline mr-2" size={16} />
            Create Document
          </button>
          
          <div className="flex gap-3 sm:gap-4">
            <button
              className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors"
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
              className="px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors"
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

      {/* MANUAL GROUPS MODAL */}
      {showManualGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Manual Groups ({numberOfGroups} {numberOfGroups === 1 ? 'Group' : 'Groups'})
              </h2>
              <button
                onClick={() => setShowManualGroups(false)}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {groups.map((group) => (
                <div key={group.id} className="bg-[#23272F] rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Group {group.id}</h3>
                  
                  {!group.showInputs ? (
                    <button
                      onClick={() => toggleGroupInputs(group.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Add Members
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Leader:</label>
                        <input
                          type="text"
                          value={group.leader}
                          onChange={(e) => handleGroupLeaderChange(group.id, e.target.value)}
                          placeholder="Enter leader name"
                          className="w-full bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Members:</label>
                        {group.members.map((member, index) => (
                          <input
                            key={index}
                            type="text"
                            value={member}
                            onChange={(e) => handleGroupMemberChange(group.id, index, e.target.value)}
                            placeholder="Enter member name"
                            className="w-full bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 mb-2"
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => saveGroup(group.id)}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Save Group
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setGroupsConfigured(true);
                  setGroupCreationMethod('manual');
                  setShowManualGroups(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Groups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE GROUPS MODAL */}
      {showGenerateGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Generate Groups ({numberOfGroups} {numberOfGroups === 1 ? 'Group' : 'Groups'})
              </h2>
              <button
                onClick={() => setShowGenerateGroups(false)}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">
                The system will automatically generate {numberOfGroups} groups and randomly assign students to them.
              </p>
              
              <div className="bg-[#23272F] rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {generatedGroupsPreview.map((group, index) => (
                    <div key={index} className="bg-[#161A20] rounded p-3">
                      <div className="text-blue-400 font-semibold text-sm mb-2">Group {group.id}</div>
                      <div className="text-xs space-y-1">
                        <div className="text-yellow-400">
                          <span className="font-medium">Leader:</span> {group.leader}
                        </div>
                        <div className="text-green-400">
                          <span className="font-medium">Members:</span> {group.members.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => shuffleGroups(numberOfGroups)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Shuffle
              </button>
              <button
                onClick={() => {
                  setGroups(generatedGroupsPreview);
                  setGroupsConfigured(true);
                  setGroupCreationMethod('generate');
                  setShowGenerateGroups(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupActivityBuilder;
