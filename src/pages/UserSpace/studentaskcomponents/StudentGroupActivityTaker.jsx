import { useState, useRef } from "react";
import { FiArrowLeft, FiUpload, FiUsers, FiStar, FiCheck, FiX } from "react-icons/fi";

const StudentGroupActivityTaker = ({
  currentColors,
  taskData,
  user,
  onBack,
  onSubmit,
  isLoading = false,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [peerRatings, setPeerRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const groups = taskData?.groups || [];
  const allowSelfGrouping = taskData?.allow_self_grouping ?? false;
  const peerEvaluation = taskData?.peer_evaluation ?? false;

  // Find the group this student belongs to (matched by account_id or name)
  const myGroup = groups.find((g) =>
    g.members?.some(
      (m) => m.account_id === user?.id || m.account_id === String(user?.id),
    ),
  );

  const myMemberEntry = myGroup?.members?.find(
    (m) => m.account_id === user?.id || m.account_id === String(user?.id),
  );
  const isLeader = myMemberEntry?.role === "leader";

  // For self-grouping: the group the student wants to join
  const targetGroup = allowSelfGrouping
    ? groups.find((g) => g.group === selectedGroupId)
    : myGroup;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSubmissionFile(file);
  };

  const handleJoinGroup = () => {
    if (!selectedGroupId) return;
    setHasJoined(true);
  };

  const handlePeerRating = (memberId, rating) => {
    setPeerRatings((prev) => ({ ...prev, [memberId]: rating }));
  };

  const handleSubmit = () => {
    if (!submissionFile && !submissionNote.trim()) return;
    onSubmit?.({
      task_id: taskData?.task_id,
      group_id: (myGroup || targetGroup)?.group,
      file: submissionFile,
      note: submissionNote,
      peer_ratings: peerEvaluation ? peerRatings : null,
    });
    setSubmitted(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const assignedGroup = myGroup || (hasJoined ? targetGroup : null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
          border: `1px solid ${currentColors.border}`,
        }}
      >
        <FiArrowLeft size={16} />
        Back
      </button>

      {/* TASK HEADER */}
      <div
        className="rounded-xl p-6 border"
        style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl">👥</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentColors.text }}>
              {taskData?.task_title || "Group Activity"}
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#2563eb22", color: "#2563eb" }}
            >
              Group Activity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="font-semibold mb-1" style={{ color: currentColors.textSecondary }}>
              Due Date
            </p>
            <p style={{ color: currentColors.text }}>
              {formatDate(taskData?.due_date || taskData?.task_due_date)}
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: currentColors.textSecondary }}>
              Total Score
            </p>
            <p style={{ color: currentColors.text }}>
              {taskData?.task_score || taskData?.total_score || 0} pts
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: currentColors.textSecondary }}>
              Group Size
            </p>
            <p style={{ color: currentColors.text }}>
              {taskData?.group_size || "—"} members
            </p>
          </div>
        </div>

        {(taskData?.task_instruction || taskData?.task_instructions) && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{ backgroundColor: currentColors.background, borderLeftColor: "#2563eb" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: currentColors.textSecondary }}>
              Instructions
            </p>
            <div
              className="text-sm leading-relaxed"
              style={{ color: currentColors.text }}
              dangerouslySetInnerHTML={{
                __html: taskData?.task_instruction || taskData?.task_instructions,
              }}
            />
          </div>
        )}
      </div>

      {/* YOUR GROUP */}
      {assignedGroup ? (
        <div
          className="rounded-xl p-6 border"
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FiUsers size={20} style={{ color: "#2563eb" }} />
            <h2 className="text-lg font-semibold" style={{ color: currentColors.text }}>
              Your Group — {assignedGroup.group_name || `Group ${assignedGroup.group}`}
            </h2>
            {isLeader && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-2"
                style={{ backgroundColor: "#f59e0b22", color: "#f59e0b" }}>
                Leader
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignedGroup.members?.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: currentColors.background }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    backgroundColor: member.role === "leader" ? "#f59e0b22" : "#2563eb22",
                    color: member.role === "leader" ? "#f59e0b" : "#2563eb",
                  }}
                >
                  {(member.name || member.account_id || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: currentColors.text }}>
                    {member.name || member.account_id}
                  </p>
                  <p className="text-xs capitalize" style={{ color: currentColors.textSecondary }}>
                    {member.role}
                  </p>
                </div>
                {(member.account_id === user?.id || member.account_id === String(user?.id)) && (
                  <span className="ml-auto text-xs font-medium" style={{ color: "#22c55e" }}>
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : allowSelfGrouping ? (
        /* SELF GROUPING — pick a group */
        <div
          className="rounded-xl p-6 border"
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: currentColors.text }}>
            Choose Your Group
          </h2>
          <p className="text-sm mb-4" style={{ color: currentColors.textSecondary }}>
            Select the group you want to join.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {groups.map((group) => {
              const isFull = group.members?.length >= (taskData?.group_size || 999);
              const isSelected = selectedGroupId === group.group;
              return (
                <div
                  key={group.group}
                  onClick={() => !isFull && setSelectedGroupId(group.group)}
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: isSelected ? "#2563eb" : currentColors.border,
                    backgroundColor: isSelected ? "#2563eb11" : currentColors.background,
                    opacity: isFull ? 0.5 : 1,
                    cursor: isFull ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: currentColors.text }}>
                      {group.group_name || `Group ${group.group}`}
                    </span>
                    {isSelected && <FiCheck size={16} style={{ color: "#2563eb" }} />}
                  </div>
                  <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                    {group.members?.length || 0} / {taskData?.group_size || "?"} members
                  </p>
                  {isFull && (
                    <span className="text-xs text-red-500 mt-1 block">Full</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleJoinGroup}
            disabled={!selectedGroupId}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              backgroundColor: selectedGroupId ? "#2563eb" : currentColors.border,
              color: selectedGroupId ? "#fff" : currentColors.textSecondary,
              cursor: selectedGroupId ? "pointer" : "not-allowed",
            }}
          >
            Join Group
          </button>
        </div>
      ) : (
        /* No group assigned yet */
        <div
          className="rounded-xl p-6 border text-center"
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <FiUsers size={40} className="mx-auto mb-3" style={{ color: currentColors.textSecondary }} />
          <p className="font-semibold" style={{ color: currentColors.text }}>
            No group assigned yet
          </p>
          <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
            Your professor will assign you to a group.
          </p>
        </div>
      )}

      {/* ALL GROUPS OVERVIEW */}
      {groups.length > 0 && (
        <div
          className="rounded-xl p-6 border"
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentColors.text }}>
            All Groups
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => {
              const isMyGroup = assignedGroup?.group === group.group;
              return (
                <div
                  key={group.group}
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: currentColors.background,
                    borderColor: isMyGroup ? "#2563eb" : currentColors.border,
                    borderWidth: isMyGroup ? "2px" : "1px",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm" style={{ color: currentColors.text }}>
                      {group.group_name || `Group ${group.group}`}
                    </span>
                    {isMyGroup && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#2563eb22", color: "#2563eb" }}>
                        Your Group
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {group.members?.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs"
                        style={{ color: currentColors.textSecondary }}>
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: member.role === "leader" ? "#f59e0b" : "#6b7280" }}
                        />
                        <span style={{ color: currentColors.text }}>
                          {member.name || member.account_id}
                        </span>
                        <span className="capitalize">({member.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBMISSION — only if student has a group */}
      {assignedGroup && !submitted && (
        <div
          className="rounded-xl p-6 border"
          style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentColors.text }}>
            Submit Group Work
          </h2>

          {/* File upload */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center mb-4 cursor-pointer transition-colors"
            style={{ borderColor: submissionFile ? "#22c55e" : currentColors.border }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            {submissionFile ? (
              <div className="flex items-center justify-center gap-3">
                <FiCheck size={20} style={{ color: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "#22c55e" }}>
                  {submissionFile.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSubmissionFile(null); }}
                  className="ml-2"
                >
                  <FiX size={16} style={{ color: currentColors.textSecondary }} />
                </button>
              </div>
            ) : (
              <div>
                <FiUpload size={28} className="mx-auto mb-2" style={{ color: currentColors.textSecondary }} />
                <p className="text-sm font-medium" style={{ color: currentColors.text }}>
                  Click to upload your file
                </p>
                <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                  PDF, DOCX, PPTX, images accepted
                </p>
              </div>
            )}
          </div>

          {/* Optional note */}
          <textarea
            value={submissionNote}
            onChange={(e) => setSubmissionNote(e.target.value)}
            rows={3}
            placeholder="Add a note for your professor (optional)..."
            className="w-full rounded-lg px-4 py-3 text-sm outline-none border resize-none mb-4"
            style={{
              backgroundColor: currentColors.background,
              color: currentColors.text,
              borderColor: currentColors.border,
            }}
          />

          {/* Peer evaluation */}
          {peerEvaluation && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: currentColors.text }}>
                Peer Evaluation
              </h3>
              <div className="space-y-3">
                {assignedGroup.members
                  ?.filter(
                    (m) =>
                      m.account_id !== user?.id && m.account_id !== String(user?.id),
                  )
                  .map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: currentColors.background }}
                    >
                      <span className="text-sm" style={{ color: currentColors.text }}>
                        {member.name || member.account_id}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handlePeerRating(member.account_id, star)}
                          >
                            <FiStar
                              size={18}
                              style={{
                                color:
                                  (peerRatings[member.account_id] || 0) >= star
                                    ? "#f59e0b"
                                    : currentColors.border,
                                fill:
                                  (peerRatings[member.account_id] || 0) >= star
                                    ? "#f59e0b"
                                    : "none",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || (!submissionFile && !submissionNote.trim())}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
            style={{
              backgroundColor:
                !submissionFile && !submissionNote.trim() ? currentColors.border : "#2563eb",
              color:
                !submissionFile && !submissionNote.trim()
                  ? currentColors.textSecondary
                  : "#ffffff",
              cursor:
                !submissionFile && !submissionNote.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Submitting..." : "Submit Group Work"}
          </button>
        </div>
      )}

      {/* SUBMITTED STATE */}
      {submitted && (
        <div
          className="rounded-xl p-8 border text-center"
          style={{ backgroundColor: currentColors.surface, borderColor: "#22c55e" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#22c55e22" }}>
            <FiCheck size={32} style={{ color: "#22c55e" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: currentColors.text }}>
            Submitted!
          </h2>
          <p className="text-sm" style={{ color: currentColors.textSecondary }}>
            Your group work has been submitted successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentGroupActivityTaker;
