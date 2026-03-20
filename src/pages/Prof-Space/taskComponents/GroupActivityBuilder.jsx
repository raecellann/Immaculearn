import React, { useState, useRef } from "react";
import { FiArrowLeft, FiUsers, FiFilePlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router";
import { useFile } from "../../../contexts/file/fileContextProvider";
import { useSpace } from "../../../contexts/space/useSpace";
import { toast } from "react-toastify";

const GroupActivityBuilder = ({
  currentColors,
  onBack,
  onSave,
  onPublish,
  onUpdate,
  editingTask,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { space_uuid } = useParams();
  const { resources } = useFile();
  const { userSpaces, courseSpaces, friendSpaces } = useSpace();
  const [activityTitle, setActivityTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [score, setScore] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const getLocalDateTimeMin = () => {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 16);
  };
  const [groupSize, setGroupSize] = useState("3");
  const [allowSelfGrouping, setAllowSelfGrouping] = useState(false);
  const [peerEvaluation, setPeerEvaluation] = useState(false);

  const instructionRef = useRef(null);

  // Group management state
  const [showManualGroups, setShowManualGroups] = useState(false);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [groups, setGroups] = useState([
    {
      id: 1,
      members: [],
      leader: "",
      showInputs: false,
      isSaved: false,
      wasPreviouslySaved: false,
    },
  ]);
  const [activeGroup, setActiveGroup] = useState(1);
  const [groupsConfigured, setGroupsConfigured] = useState(false);
  const [groupCreationMethod, setGroupCreationMethod] = useState(null);
  const [generatedGroupsPreview, setGeneratedGroupsPreview] = useState([]);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState(null);

  // Get current space and its members
  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];
  const currentSpace = allSpaces.find(
    (space) => space.space_uuid === space_uuid,
  );

  // Extract member names from space members (excluding creators/admins, focusing on students)
  const availableMembers =
    currentSpace?.members
      .filter((member) => member.role !== "creator") // Filter out creators/admins
      .map((member) => member.full_name)
      .filter((name) => name && name.trim()) || [];

  // Handle case where space is not found or has no student members
  React.useEffect(() => {
    if (!currentSpace) {
      console.warn("Space not found for UUID:", space_uuid);
    } else if (availableMembers.length === 0) {
      console.warn(
        "No student members found in space:",
        currentSpace.space_name,
      );
    }
  }, [currentSpace, availableMembers, space_uuid]);

  React.useEffect(() => {
    if (instructionRef.current) {
      const handleInput = () => {
        setInstruction(instructionRef.current.innerHTML);
      };
      instructionRef.current.addEventListener("input", handleInput);
      return () => {
        instructionRef.current?.removeEventListener("input", handleInput);
      };
    }
  }, []);

  // Populate form with editingTask data if available
  React.useEffect(() => {
    if (editingTask) {
      // Basic task information
      setActivityTitle(editingTask.task_title || editingTask.title || "");
      setInstruction(
        editingTask.task_instruction || editingTask.instruction || "",
      );
      setScore(editingTask.task_score || editingTask.score || "");
      setDueDate(editingTask.task_due || editingTask.due_date || "");
      setSelectedLesson(editingTask.task_lesson || editingTask.lesson || "");

      // Group activity specific settings
      setGroupSize(editingTask.group_size || "3");
      setAllowSelfGrouping(editingTask.allow_self_grouping || false);
      setPeerEvaluation(editingTask.peer_evaluation || false);

      // Groups data - handle different possible data structures
      if (editingTask.groups && Array.isArray(editingTask.groups)) {
        setGroups(editingTask.groups);
        setGroupsConfigured(true);
        setGroupCreationMethod(editingTask.group_creation_method || "manual");
      } else if (editingTask.rawData && editingTask.rawData.groups) {
        setGroups(editingTask.rawData.groups);
        setGroupsConfigured(true);
        setGroupCreationMethod(
          editingTask.rawData.group_creation_method || "manual",
        );
      }
    }
  }, [editingTask]);

  // Group management functions
  const handleManualGroups = () => {
    if (groupsConfigured) {
      if (groupCreationMethod === "generate") {
        setShowGenerateGroups(true);
      } else {
        setActiveGroup(1);
        setShowManualGroups(true);
      }
    } else {
      const input = document.getElementById("groups-input");
      const numGroups = parseInt(input.value) || 2;
      setNumberOfGroups(numGroups);
      setGroupCreationMethod("manual");

      const newGroups = Array.from({ length: numGroups }, (_, index) => ({
        id: index + 1,
        members: [""],
        leader: "",
        showInputs: false,
        isSaved: false,
      }));
      setGroups(newGroups);
      setActiveGroup(1);
      setShowManualGroups(true);
    }
  };

  const handleGenerateGroups = () => {
    const input = document.getElementById("groups-input");
    const numGroups = parseInt(input.value) || 2;
    setNumberOfGroups(numGroups);
    shuffleGroups(numGroups);
    setShowGenerateGroups(true);
  };

  const shuffleGroups = (numGroups) => {
    // Check if there are any members to shuffle
    if (availableMembers.length === 0) {
      alert("No student members available in this space to create groups.");
      return;
    }

    // Check if we have enough members for 1 leader + 1 member per group
    if (availableMembers.length < numGroups * 2) {
      alert(
        `Not enough students for ${numGroups} groups. Each group needs 1 leader + 1 member (${numGroups * 2} students required, but only ${availableMembers.length} available).`,
      );
      return;
    }

    const shuffledMembers = [...availableMembers].sort(
      () => Math.random() - 0.5,
    );
    const totalMembers = shuffledMembers.length;

    // Check if group size constraints can be satisfied
    const maxGroupSize = Math.ceil(totalMembers / numGroups);

    if (maxGroupSize > 10) {
      alert(
        `With ${numGroups} groups, some groups would have more than 10 members. Please increase the number of groups.`,
      );
      return;
    }

    // Distribute members to ensure exactly 1 leader + 1 member minimum per group
    const baseMembersPerGroup = Math.floor(
      (totalMembers - numGroups) / numGroups,
    ); // Subtract leaders first
    const remainder = (totalMembers - numGroups) % numGroups;

    const newGroups = Array.from({ length: numGroups }, (_, index) => {
      const membersCount = baseMembersPerGroup + (index < remainder ? 1 : 0);

      let startIndex = 0;
      for (let i = 0; i < index; i++) {
        startIndex += 1 + baseMembersPerGroup + (i < remainder ? 1 : 0); // 1 for leader + members
      }
      const endIndex = startIndex + 1 + membersCount; // 1 for leader + members

      const groupMembers = shuffledMembers.slice(startIndex, endIndex);
      const leader = groupMembers[0] || "";
      const members = groupMembers.slice(1, 1 + membersCount); // Ensure exactly membersCount members

      return {
        id: index + 1,
        leader: leader,
        members: members,
        showInputs: false,
        isSaved: true,
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
    updatedGroups[groupId - 1].showInputs =
      !updatedGroups[groupId - 1].showInputs;
    setGroups(updatedGroups);
  };

  const saveGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    const validMembers = group.members.filter((member) => member.trim());

    // Check group size constraints (exactly 1 leader + 1 member minimum)
    const leaderCount = group.leader?.trim() ? 1 : 0;
    const totalSize = leaderCount + validMembers.length;

    if (leaderCount === 0) {
      alert("Group must have exactly 1 leader");
      return;
    }

    if (validMembers.length === 0) {
      alert("Group must have exactly 1 member");
      return;
    }

    if (totalSize > 10) {
      alert("Group cannot have more than 10 members (leader + members)");
      return;
    }

    const updatedGroups = [...groups];
    updatedGroups[groupId - 1].isSaved = true;
    updatedGroups[groupId - 1].showInputs = false;
    updatedGroups[groupId - 1].wasPreviouslySaved = true;
    setGroups(updatedGroups);
  };

  const addMemberToGroup = (memberName) => {
    const activeGroupData = groups[activeGroup - 1];
    if (!activeGroupData.showInputs) {
      return;
    }

    // Check group size constraints (exactly 1 leader + 1 member minimum)
    const currentGroupSize = activeGroupData.leader?.trim() ? 1 : 0;
    const currentMembersCount = activeGroupData.members.filter((m) =>
      m?.trim(),
    ).length;
    const totalCurrentSize = currentGroupSize + currentMembersCount;

    if (totalCurrentSize >= 10) {
      alert("Group has reached maximum size of 10 members");
      return;
    }

    const updatedGroups = [...groups];
    const activeGroupDataUpdated = updatedGroups[activeGroup - 1];

    if (
      !activeGroupDataUpdated.leader ||
      activeGroupDataUpdated.leader.trim() === ""
    ) {
      activeGroupDataUpdated.leader = memberName;
    } else {
      // Check if this would exceed the 1 member minimum requirement
      if (currentMembersCount >= 1) {
        // Find a group with only 1 member to add the extra member
        const targetGroup = updatedGroups.find((group, index) => {
          if (group.id === activeGroup) return false;
          const membersCount = group.members.filter((m) => m?.trim()).length;
          return membersCount === 0 && group.leader?.trim(); // Has leader but no members
        });

        if (targetGroup) {
          const firstEmptyIndex = targetGroup.members.findIndex(
            (member) => !member || member.trim() === "",
          );
          if (firstEmptyIndex !== -1) {
            targetGroup.members[firstEmptyIndex] = memberName;
          } else {
            targetGroup.members.push(memberName);
          }
        } else {
          const activeGroupMembers = activeGroupDataUpdated.members;
          const firstEmptyIndex = activeGroupMembers.findIndex(
            (member) => !member || member.trim() === "",
          );

          if (firstEmptyIndex !== -1) {
            activeGroupMembers[firstEmptyIndex] = memberName;
          } else {
            // Check if adding this member would exceed max size
            if (totalCurrentSize + 1 > 10) {
              alert("Group would exceed maximum size of 10 members");
              return;
            }
            activeGroupMembers.push(memberName);
            activeGroupMembers.push("");
          }
        }
      } else {
        // Add as first member
        const activeGroupMembers = activeGroupDataUpdated.members;
        const firstEmptyIndex = activeGroupMembers.findIndex(
          (member) => !member || member.trim() === "",
        );

        if (firstEmptyIndex !== -1) {
          activeGroupMembers[firstEmptyIndex] = memberName;
        } else {
          activeGroupMembers.push(memberName);
          activeGroupMembers.push("");
        }
      }
    }

    setGroups(updatedGroups);
  };

  const getAssignedMembers = () => {
    const allAssignedMembers = new Set();
    groups.forEach((group) => {
      if (group.leader && group.leader.trim()) {
        allAssignedMembers.add(group.leader.trim());
      }
      group.members.forEach((member) => {
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

  const editGroup = (groupId) => {
    const updatedGroups = [...groups];
    const group = updatedGroups[groupId - 1];

    // Store original data for potential restoration
    if (group.isSaved) {
      group.originalData = {
        leader: group.leader,
        members: [...group.members],
      };
    }

    group.showInputs = true;
    group.isSaved = false;
    setGroups(updatedGroups);
  };

  const removeMemberFromGroup = (groupId, memberIndex) => {
    const updatedGroups = [...groups];
    const group = updatedGroups[groupId - 1];

    // Remove the member at the specified index
    group.members.splice(memberIndex, 1);

    // Ensure there's always at least one empty member input
    if (group.members.length === 0) {
      group.members.push("");
    }

    setGroups(updatedGroups);
  };

  const resetGroupInputs = (groupId) => {
    const updatedGroups = [...groups];
    const group = updatedGroups[groupId - 1];

    // If it was previously saved, restore original data
    if (group.wasPreviouslySaved && group.originalData) {
      group.leader = group.originalData.leader;
      group.members = [...group.originalData.members];
      delete group.originalData;
    } else {
      // Reset to empty state for new groups
      group.leader = "";
      group.members = [""];
    }

    group.showInputs = false;
    group.isSaved = false;
    setGroups(updatedGroups);
  };

  const addMemberFromAvailable = (memberName) => {
    addMemberToGroup(memberName);
  };

  const handleDistributeEqually = () => {
    // Get unassigned students
    const assignedMembers = getAssignedMembers();
    const unassignedStudents = availableMembers.filter(
      (student) => !assignedMembers.has(student),
    );

    if (unassignedStudents.length === 0) {
      alert("All students are already assigned to groups.");
      return;
    }

    // Check if we have enough students for minimum requirement
    const minRequiredStudents = numberOfGroups * 2; // 1 leader + 1 member per group
    if (unassignedStudents.length < minRequiredStudents) {
      alert(
        `Not enough unassigned students for equal distribution. Need at least ${minRequiredStudents} students (${numberOfGroups} groups × 2), but only ${unassignedStudents.length} available.`,
      );
      return;
    }

    // Shuffle unassigned students for random distribution
    const shuffledStudents = [...unassignedStudents].sort(
      () => Math.random() - 0.5,
    );

    // Calculate base distribution and remainder
    const baseStudentsPerGroup = Math.floor(
      shuffledStudents.length / numberOfGroups,
    );
    const remainder = shuffledStudents.length % numberOfGroups;

    // Create updated groups with equal distribution
    const updatedGroups = groups.map((group, index) => {
      const studentsForThisGroup =
        baseStudentsPerGroup + (index < remainder ? 1 : 0);
      const startIndex =
        index * baseStudentsPerGroup + Math.min(index, remainder);
      const endIndex = startIndex + studentsForThisGroup;

      const groupStudents = shuffledStudents.slice(startIndex, endIndex);

      // Ensure 1 leader + 1 member minimum
      if (groupStudents.length >= 2) {
        return {
          ...group,
          leader: groupStudents[0] || group.leader,
          members: [
            ...groupStudents.slice(1),
            ...Array(Math.max(0, studentsForThisGroup - 1)).fill(""),
          ],
          isSaved: true,
          showInputs: false,
        };
      } else {
        // Keep existing group data if not enough students for this group
        return group;
      }
    });

    setGroups(updatedGroups);
  };

  const getMemberRole = (memberName) => {
    for (const group of groups) {
      if (group.leader && group.leader.trim() === memberName.trim()) {
        return "leader";
      }
      if (
        group.members.some(
          (member) => member && member.trim() === memberName.trim(),
        )
      ) {
        return "member";
      }
    }
    return null;
  };

  const validateFields = () => {
    const errors = {};

    if (!activityTitle.trim()) {
      errors.activityTitle = true;
    }

    if (!instruction.trim()) {
      errors.instruction = true;
    }

    if (!score.trim()) {
      errors.score = true;
    }

    if (!dueDate) {
      errors.dueDate = true;
    }

    if (!selectedLesson) {
      errors.selectedLesson = true;
    }

    // Check if groups are configured but have unassigned students
    if (
      groupsConfigured &&
      availableMembers.length > 0 && // Only validate if there are members to assign
      getAssignedMembers().size < availableMembers.length
    ) {
      errors.unassignedStudents = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to get account ID by member name
  const getAccountIdByName = (memberName) => {
    const member = currentSpace?.members?.find(
      (m) => m.full_name === memberName && m.role !== "creator",
    );
    return member?.account_id || null;
  };

  const handleSave = (status) => {
    if (!validateFields()) {
      return;
    }

    // Additional validation for publishing group activities
    if (status === "published" && availableMembers.length < 4) {
      toast.error("You need at least 4 students in your course space to create and publish group activities.");
      return;
    }

    // Transform groups data to match required format
    const groupsPayload =
      groupsConfigured && groups.length > 0
        ? groups
            .filter(
              (g) => g.leader?.trim() || g.members?.some((m) => m?.trim()),
            )
            .map((group, index) => {
              const members = [];

              // Add leader if exists
              if (group.leader?.trim()) {
                const leaderAccountId = getAccountIdByName(group.leader.trim());
                if (leaderAccountId) {
                  members.push({
                    account_id: leaderAccountId,
                    role: "leader",
                  });
                }
              }

              // Add members if they exist
              group.members
                .filter((member) => member?.trim())
                .forEach((member) => {
                  const memberAccountId = getAccountIdByName(member.trim());
                  if (memberAccountId) {
                    members.push({
                      account_id: memberAccountId,
                      role: "member",
                    });
                  }
                });

              return {
                group: group.id,
                group_name: `Group ${group.id}`,
                members: members,
              };
            })
        : [];

    const activityData = {
      task_category: "group-activity",
      space_uuid: space_uuid, // Use actual space UUID from params
      task_title: activityTitle,
      due_date: dueDate,
      total_items_score: Number(score),
      lesson_id: selectedLesson ? parseInt(selectedLesson) : null,
      task_instruction: instruction,
      groups: groupsPayload,
      group_size: groupSize,
      allow_self_grouping: allowSelfGrouping,
      peer_evaluation: peerEvaluation,
      group_creation_method: groupCreationMethod,
    };

    // If editing, include task_id and use onUpdate
    if (editingTask) {
      activityData.task_id = editingTask.task_id || editingTask.id;
      if (onUpdate) {
        setPendingUpdateData(activityData);
        setShowUpdateConfirmation(true);
      } else if (status === "published") {
        onPublish(activityData);
      } else {
        onSave(activityData);
      }
    } else {
      // New task - use original logic
      if (status === "published") {
        toast.success("Group activity published successfully!");
        onPublish(activityData);
      } else {
        toast.success("Group activity saved as draft!");
        onSave(activityData);
      }
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
            border: `1px solid ${currentColors.border}`,
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
      <div
        className="rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border"
        style={{
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">👥</div>
          <h1
            className="text-2xl font-bold"
            style={{ color: currentColors.text }}
          >
            Group Activity Builder
          </h1>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Activity Title: <span className="text-red-500">*</span>
              </label>
              {validationErrors.activityTitle && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please enter an activity title
                </p>
              )}
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => {
                  setActivityTitle(e.target.value);
                  if (validationErrors.activityTitle) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      activityTitle: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.activityTitle ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.activityTitle
                    ? "#ef4444"
                    : currentColors.border,
                }}
                placeholder="Enter activity title"
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Score: <span className="text-red-500">*</span>
              </label>
              {validationErrors.score && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please enter a score
                </p>
              )}
              <input
                type="number"
                value={score}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow whole numbers (non-negative integers)
                  if (
                    value === "" ||
                    (/^\d+$/.test(value) && parseInt(value) >= 0)
                  ) {
                    setScore(value);
                  }
                  if (validationErrors.score) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      score: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.score ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.score
                    ? "#ef4444"
                    : currentColors.border,
                }}
                placeholder="Enter score"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Due Date: <span className="text-red-500">*</span>
              </label>
              {validationErrors.dueDate && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please select a due date
                </p>
              )}
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (validationErrors.dueDate) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      dueDate: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.dueDate ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.dueDate
                    ? "#ef4444"
                    : currentColors.border,
                }}
                min={getLocalDateTimeMin()}
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: currentColors.text }}
              >
                Connect to Lesson: <span className="text-red-500">*</span>
              </label>
              {validationErrors.selectedLesson && (
                <p className="text-red-500 text-xs sm:text-sm mb-1">
                  Please select a lesson
                </p>
              )}
              <select
                value={selectedLesson}
                onChange={(e) => {
                  setSelectedLesson(e.target.value);
                  if (validationErrors.selectedLesson) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      selectedLesson: false,
                    }));
                  }
                }}
                className={`w-full rounded-lg px-4 py-2 outline-none border ${
                  validationErrors.selectedLesson ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  borderColor: validationErrors.selectedLesson
                    ? "#ef4444"
                    : currentColors.border,
                }}
                required
              >
                <option value="">Select a lesson...</option>
                {resources.map((lesson) => (
                  <option key={lesson.lesson_id} value={lesson.lesson_id}>
                    {lesson.lesson_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* INSTRUCTION */}
        <div className="mb-8">
          <label
            className="block font-semibold mb-2"
            style={{ color: currentColors.text }}
          >
            Instructions: <span className="text-red-500">*</span>
          </label>
          {validationErrors.instruction && (
            <p className="text-red-500 text-xs sm:text-sm mb-1">
              Please enter instructions for the activity
            </p>
          )}
          <div
            className={`rounded-lg border transition-colors ${
              validationErrors.instruction ? "border-red-500" : ""
            }`}
            style={{
              backgroundColor: currentColors.background,
              borderColor: validationErrors.instruction
                ? "#ef4444"
                : currentColors.border,
            }}
          >
            <div
              ref={instructionRef}
              contentEditable
              className="min-h-[140px] px-4 py-3 outline-none"
              style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
              }}
              suppressContentEditableWarning
              onInput={() => {
                setInstruction(instructionRef.current.innerHTML);
                if (validationErrors.instruction) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    instruction: false,
                  }));
                }
              }}
            />
          </div>
        </div>

        {/* GROUP MANAGEMENT SECTION */}
        {!allowSelfGrouping && (
          <div className="mb-8">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentColors.background }}
            >
              <h3
                className="font-semibold mb-4"
                style={{ color: currentColors.text }}
              >
                Group Management
              </h3>

              {groupsConfigured ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm"
                      style={{ color: currentColors.text }}
                    >
                      Groups configured (
                      {
                        groups.filter(
                          (g) =>
                            g.leader?.trim() ||
                            g.members?.some((m) => m?.trim()),
                        ).length
                      }
                      )
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => {
                          setGroups([
                            {
                              id: 1,
                              members: [],
                              leader: "",
                              showInputs: false,
                              isSaved: false,
                              wasPreviouslySaved: false,
                            },
                          ]);
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
                    <label
                      className="text-sm"
                      style={{ color: currentColors.text }}
                    >
                      Number of groups:
                    </label>
                    <div
                      className="flex items-center rounded-lg border"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                      }}
                    >
                      <button
                        type="button"
                        className="px-2 py-1 text-gray-400 hover:text-white transition text-sm"
                        onClick={() => {
                          const input = document.getElementById("groups-input");
                          if (input.value > 2)
                            input.value = parseInt(input.value) - 1;
                        }}
                      >
                        -
                      </button>
                      <input
                        id="groups-input"
                        type="number"
                        className="bg-transparent w-12 text-center outline-none text-sm"
                        style={{ color: currentColors.text }}
                        defaultValue={2}
                        min="2"
                        max="10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("groups-input");
                          const currentValue = parseInt(input.value);
                          // Check if we have enough members for new group (1 leader + 1 member)
                          if (
                            currentValue < 10 &&
                            availableMembers.length >= (currentValue + 1) * 2
                          ) {
                            input.value = currentValue + 1;
                          }
                        }}
                        disabled={
                          availableMembers.length <
                          (parseInt(
                            document.getElementById("groups-input")?.value || 2,
                          ) +
                            1) *
                            2
                        }
                        className={`px-2 py-1 text-sm transition ${
                          availableMembers.length <
                          (parseInt(
                            document.getElementById("groups-input")?.value || 2,
                          ) +
                            1) *
                            2
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      Max: 10 groups
                    </span>
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

            {/* GENERATED GROUPS CARDS */}
            {groupsConfigured && groups.length > 0 && (
              <div className="mt-6">
                <h4
                  className="font-semibold mb-4"
                  style={{ color: currentColors.text }}
                >
                  Generated Groups
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups
                    .filter(
                      (g) =>
                        g.leader?.trim() || g.members?.some((m) => m?.trim()),
                    )
                    .map((group, index) => (
                      <div
                        key={group.id}
                        className="border rounded-lg p-4"
                        style={{
                          borderColor: currentColors.border,
                          backgroundColor: currentColors.background,
                        }}
                      >
                        <div className="text-blue-500 font-semibold text-sm mb-2">
                          Group {group.id}
                        </div>
                        <div className="text-xs space-y-1">
                          <div style={{ color: currentColors.text }}>
                            <span className="font-medium">Leader:</span>{" "}
                            {group.leader || "Not assigned"}
                          </div>
                          <div style={{ color: currentColors.text }}>
                            <span className="font-medium">Members:</span>{" "}
                            {group.members
                              .filter((m) => m?.trim())
                              .join(", ") || "No members"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end mt-8">
          <button
            className="px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-colors"
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#2563eb";
            }}
            onClick={() => handleSave("published")}
          >
            {isLoading
              ? "Publishing..."
              : editingTask
                ? "Update & Publish"
                : "Publish Activity"}
          </button>
        </div>
      </div>

      {/* MANUAL GROUPS MODAL */}
      {showManualGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  Manual Groups({numberOfGroups}{" "}
                  {numberOfGroups === 1 ? "Group" : "Groups"})
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (numberOfGroups > 2) {
                        const newNumGroups = numberOfGroups - 1;
                        setNumberOfGroups(newNumGroups);

                        // Remove the last group if it exists and has no data
                        const updatedGroups = [...groups];
                        if (updatedGroups.length > newNumGroups) {
                          const lastGroup =
                            updatedGroups[updatedGroups.length - 1];
                          if (
                            !lastGroup.leader.trim() &&
                            !lastGroup.members.some((m) => m.trim())
                          ) {
                            updatedGroups.pop();
                            if (activeGroup > updatedGroups.length) {
                              setActiveGroup(updatedGroups.length);
                            }
                          }
                        }
                        setGroups(updatedGroups);
                      }
                    }}
                    disabled={numberOfGroups <= 2}
                    className={`w-6 h-6 rounded flex items-center justify-center text-sm font-medium transition ${
                      numberOfGroups <= 2
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                  >
                    -
                  </button>
                  <span className="text-white font-medium min-w-[1.5rem] text-center text-sm">
                    {numberOfGroups}
                  </span>
                  <button
                    onClick={() => {
                      if (
                        numberOfGroups < 10 &&
                        availableMembers.length >= (numberOfGroups + 1) * 2
                      ) {
                        const newNumGroups = numberOfGroups + 1;
                        setNumberOfGroups(newNumGroups);

                        // Add a new empty group
                        const updatedGroups = [...groups];
                        updatedGroups.push({
                          id: newNumGroups,
                          members: [""],
                          leader: "",
                          showInputs: false,
                          isSaved: false,
                          wasPreviouslySaved: false,
                        });
                        setGroups(updatedGroups);
                      }
                    }}
                    disabled={
                      numberOfGroups >= 10 ||
                      availableMembers.length < (numberOfGroups + 1) * 2
                    }
                    className={`w-6 h-6 rounded flex items-center justify-center text-sm font-medium transition ${
                      numberOfGroups >= 10 ||
                      availableMembers.length < (numberOfGroups + 1) * 2
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-600 text-white hover:bg-gray-500"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowManualGroups(false)}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col md:flex-row lg:flex-row gap-6">
              {/* Groups - Left side for tablet and larger */}
              <div className="flex-1 md:order-1 lg:order-1 order-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`bg-[#23272F] rounded-lg p-4 cursor-pointer transition-all ${
                        activeGroup === group.id
                          ? "ring-2 ring-blue-500"
                          : "hover:bg-[#2a2f38]"
                      }`}
                      onClick={() => {
                        // Reset the previously active group if it was in edit mode and not saved
                        if (activeGroup && activeGroup !== group.id) {
                          const prevGroup = groups.find(
                            (g) => g.id === activeGroup,
                          );
                          if (
                            prevGroup &&
                            prevGroup.showInputs &&
                            !prevGroup.isSaved
                          ) {
                            const updatedGroups = [...groups];

                            // If it was a previously saved group, restore original data and set as saved
                            if (
                              prevGroup.wasPreviouslySaved &&
                              prevGroup.originalData
                            ) {
                              updatedGroups[activeGroup - 1].leader =
                                prevGroup.originalData.leader;
                              updatedGroups[activeGroup - 1].members = [
                                ...prevGroup.originalData.members,
                              ];
                              updatedGroups[activeGroup - 1].showInputs = false;
                              updatedGroups[activeGroup - 1].isSaved = true;
                              delete updatedGroups[activeGroup - 1]
                                .originalData;
                            } else {
                              // For new groups, reset to empty state
                              updatedGroups[activeGroup - 1].leader = "";
                              updatedGroups[activeGroup - 1].members = [""];
                              updatedGroups[activeGroup - 1].showInputs = false;
                              updatedGroups[activeGroup - 1].isSaved = false;
                            }

                            setGroups(updatedGroups);
                          }
                        }

                        setActiveGroup(group.id);
                      }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-white">
                          Group {group.id}
                        </h3>
                        {group.showInputs && group.wasPreviouslySaved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedGroups = [...groups];

                              // Restore original data if it exists
                              if (updatedGroups[group.id - 1].originalData) {
                                updatedGroups[group.id - 1].leader =
                                  updatedGroups[
                                    group.id - 1
                                  ].originalData.leader;
                                updatedGroups[group.id - 1].members = [
                                  ...updatedGroups[group.id - 1].originalData
                                    .members,
                                ];
                                delete updatedGroups[group.id - 1].originalData;
                              }

                              updatedGroups[group.id - 1].showInputs = false;
                              updatedGroups[group.id - 1].isSaved = true;
                              setGroups(updatedGroups);
                            }}
                            className="text-gray-400 text-xl bg-transparent border-none outline-none hover:bg-transparent hover:text-red-400 focus:outline-none focus:ring-0"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Show saved group content */}
                      {group.isSaved ? (
                        <div className="space-y-2">
                          {group.leader && group.leader.trim() && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-yellow-400">
                                Leader:
                              </span>
                              <span className="text-sm text-white">
                                {group.leader}
                              </span>
                            </div>
                          )}
                          {group.members.filter((m) => m.trim()).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-green-400">
                                Members:
                              </span>
                              <div className="mt-1 space-y-1">
                                {group.members
                                  .filter((m) => m.trim())
                                  .map((member, index) => (
                                    <div
                                      key={index}
                                      className="text-sm text-white pl-2"
                                    >
                                      • {member}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editGroup(group.id);
                            }}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm mt-3"
                          >
                            Edit Group
                          </button>
                        </div>
                      ) : (
                        /* Show input fields for unsaved groups */
                        <>
                          {!group.showInputs ? (
                            // Show Add People button when inputs are hidden
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupInputs(group.id);
                              }}
                              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Add People
                            </button>
                          ) : (
                            // Show input fields when inputs are visible
                            <>
                              {/* Leader Field */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Leader:
                                </label>
                                <div
                                  className="flex gap-2 items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={group.leader}
                                    onChange={(e) =>
                                      handleGroupLeaderChange(
                                        group.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter leader name"
                                    className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                  />
                                  {group.leader.trim() && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedGroups = [...groups];
                                        updatedGroups[group.id - 1].leader = "";
                                        setGroups(updatedGroups);
                                      }}
                                      disabled={
                                        group.members.filter((member) =>
                                          member.trim(),
                                        ).length > 0
                                      }
                                      className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                                        group.members.filter((member) =>
                                          member.trim(),
                                        ).length > 0
                                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                          : "bg-red-600 text-white hover:bg-red-700"
                                      }`}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Members Field */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Members:
                                </label>
                                <div className="space-y-2 mb-3">
                                  {group.members.map((member, memberIndex) => (
                                    <div
                                      key={memberIndex}
                                      className="flex gap-2 items-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="text"
                                        value={member}
                                        onChange={(e) =>
                                          handleGroupMemberChange(
                                            group.id,
                                            memberIndex,
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Enter member name"
                                        className="flex-1 bg-[#161A20] rounded px-3 py-2 text-white text-sm outline-none border border-gray-600 focus:border-blue-500 min-w-0"
                                      />
                                      {member.trim() && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeMemberFromGroup(
                                              group.id,
                                              memberIndex,
                                            );
                                          }}
                                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs flex-shrink-0"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Save Group button */}
                              <div className="flex gap-2">
                                {!group.wasPreviouslySaved && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetGroupInputs(group.id);
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveGroup(group.id);
                                  }}
                                  disabled={
                                    !group.leader.trim() &&
                                    group.members.filter((member) =>
                                      member.trim(),
                                    ).length === 0
                                  }
                                  className={`${group.wasPreviouslySaved ? "w-full" : "flex-1"} px-3 py-2 text-sm rounded ${
                                    !group.leader.trim() &&
                                    group.members.filter((member) =>
                                      member.trim(),
                                    ).length === 0
                                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                >
                                  Save Group
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Show member count for inactive groups */}
                      {activeGroup !== group.id &&
                        !group.isSaved &&
                        group.members.filter((m) => m.trim()).length > 0 && (
                          <div className="text-gray-400 text-sm">
                            {group.members.filter((m) => m.trim()).length}{" "}
                            members
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Students - Right side for tablet and larger */}
              <div className="lg:w-80 md:w-72 sm:w-64 bg-[#23272F] rounded-lg p-4 h-fit max-h-[300px] md:max-h-[280px] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:order-2 lg:order-2 order-1">
                <h3 className="font-semibold text-white mb-4">
                  Available Students (
                  {availableMembers.length - getAssignedMembers().size})
                </h3>
                {availableMembers.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-4">
                    {currentSpace
                      ? "No student members found in this space."
                      : "Loading space data..."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableMembers
                      .filter((member) => !isMemberAssigned(member)) // Only show unassigned students
                      .map((member, index) => {
                        return (
                          <div
                            key={index}
                            className="rounded p-3 text-white text-sm transition cursor-pointer bg-[#161A20] hover:bg-[#1a1f29]"
                            onClick={() => addMemberFromAvailable(member)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{member}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-400">
                                  Click to add
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {availableMembers.filter(
                      (member) => !isMemberAssigned(member),
                    ).length === 0 && (
                      <div className="text-gray-400 text-sm text-center py-4">
                        All students are assigned to groups
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex  ${validationErrors.unassignedStudents ? "justify-between" : "justify-end"}  items-center mt-6`}
            >
              {validationErrors.unassignedStudents && (
                <div className="flex-1 p-3 bg-red-100 border border-red-400 rounded-lg mr-4">
                  <p className="text-red-700 text-sm">
                    Please assign all available students to groups before
                    saving.
                    {availableMembers.length - getAssignedMembers().size}{" "}
                    student(s) still unassigned.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleDistributeEqually}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Distribute Equally
                </button>
                <button
                  onClick={() => {
                    // Clear any existing validation errors first
                    setValidationErrors({});

                    // Check if all students are assigned (only if there are members)
                    if (
                      availableMembers.length > 0 &&
                      getAssignedMembers().size < availableMembers.length
                    ) {
                      setValidationErrors({ unassignedStudents: true });
                      return;
                    }

                    // Save all groups with their leaders and members
                    const groupsData = groups.map((group) => ({
                      groupId: group.id,
                      leader: group.leader.trim(),
                      members: group.members.filter((member) => member.trim()), // Remove empty members
                    }));
                    // Here you would send this data to your backend
                    setGroupsConfigured(true);
                    setGroupCreationMethod("manual");
                    setShowManualGroups(false);
                  }}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700`}
                >
                  Save Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE GROUPS MODAL */}
      {showGenerateGroups && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#1E222A] rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Generate Groups ({numberOfGroups}{" "}
                {numberOfGroups === 1 ? "Group" : "Groups"})
              </h2>
              <button
                onClick={() => setShowGenerateGroups(false)}
                className="text-gray-400 text-xl sm:text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0 p-1"
              >
                ×
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
                The system will automatically generate {numberOfGroups} groups
                and randomly assign students to them.
              </p>

              <div className="bg-[#23272F] rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Generated Groups Preview:
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (numberOfGroups > 2) {
                          const newNumGroups = numberOfGroups - 1;
                          setNumberOfGroups(newNumGroups);
                          shuffleGroups(newNumGroups);
                        }
                      }}
                      disabled={numberOfGroups <= 2}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups <= 2
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      }`}
                    >
                      -
                    </button>
                    <span className="text-white font-medium min-w-[2rem] text-center">
                      {numberOfGroups}
                    </span>
                    <button
                      onClick={() => {
                        if (
                          numberOfGroups < 10 &&
                          availableMembers.length >= (numberOfGroups + 1) * 2
                        ) {
                          const newNumGroups = numberOfGroups + 1;
                          setNumberOfGroups(newNumGroups);
                          shuffleGroups(newNumGroups);
                        }
                      }}
                      disabled={
                        numberOfGroups >= 10 ||
                        availableMembers.length < (numberOfGroups + 1) * 2
                      }
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                        numberOfGroups >= 10 ||
                        availableMembers.length < (numberOfGroups + 1) * 2
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-600 text-white hover:bg-gray-500"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {generatedGroupsPreview.map((group, index) => (
                    <div
                      key={index}
                      className="bg-[#161A20] rounded p-2 sm:p-3"
                    >
                      <div className="text-blue-400 font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
                        Group {group.id}
                      </div>
                      <div className="text-xs space-y-0.5 sm:space-y-1">
                        <div className="text-yellow-400">
                          <span className="font-medium">Leader:</span>
                          <span className="block xs:inline xs:ml-1">
                            {group.leader}
                          </span>
                        </div>
                        <div className="text-green-400">
                          <span className="font-medium">Members:</span>
                          <span className="block xs:inline xs:ml-1">
                            {group.members.join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs mt-1 sm:mt-2">
                        Auto-assigned
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => shuffleGroups(numberOfGroups)}
                className="mr-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm sm:text-base font-medium"
              >
                Shuffle
              </button>
              <button
                onClick={() => {
                  // Use the shuffled groups
                  setGroups(generatedGroupsPreview);
                  setGroupsConfigured(true);
                  setGroupCreationMethod("generate");

                  setShowGenerateGroups(false);
                }}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base font-medium"
              >
                Confirm Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showUpdateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.text }}
            >
              Confirm Group Activity Update
            </h3>
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to update this group activity? This will
              modify the existing activity and notify all enrolled students.
            </p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-1"
                style={{
                  backgroundColor: currentColors.surface,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                }}
                onClick={() => {
                  setShowUpdateConfirmation(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors flex-1"
                style={{ backgroundColor: "#2563eb" }}
                onClick={() => {
                  setShowUpdateConfirmation(false);
                  if (pendingUpdateData) {
                    onUpdate(pendingUpdateData);
                    setPendingUpdateData(null);
                  }
                }}
              >
                Update & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupActivityBuilder;
