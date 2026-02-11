import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import { Edit } from "lucide-react";

const TaskViewAll = () => {
  const [members, setMembers] = useState([
    { name: "Abesamis, Aaron", file: "Answers.pdf", grade: "15/20", isEditing: false },
    { name: "Adriano, Mary Ann", file: "Answers.pdf", grade: "19/20", isEditing: false },
    { name: "Adriano, Mary Ann", file: "Answers.pdf", grade: "20/20", isEditing: false },
  ]);

  const handleEditGrade = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].isEditing = !updatedMembers[index].isEditing;
    setMembers(updatedMembers);
  };

  const handleGradeChange = (index, newGrade) => {
    const updatedMembers = [...members];
    updatedMembers[index].grade = newGrade;
    setMembers(updatedMembers);
  };

  const handleGradeBlur = (index) => {
    const updatedMembers = [...members];
    updatedMembers[index].isEditing = false;
    setMembers(updatedMembers);
  };

  const handleGradeKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleGradeBlur(index);
    }
  };

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Title */}
        <h1 className="text-center text-5xl font-bold font-grotesque">Task</h1>

        {/* Task Info Container */}
        <div className="p-8 rounded-2xl shadow-lg max-w-5xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4 font-inter">
            Task Information:
          </h2>
          <hr className="border-gray-700 mb-4" />

          {/* Task Title */}
          <div className="mb-10">
            <p className="font-semibold font-inter text-3xl">
              Week 8 Individual Activity
            </p>

            <p className="text-sm opacity-70 mt-2 flex gap-10">
              Due Date:{" "}
              <span className="opacity-100">November 20, 2025</span>
            </p>

            <p className="text-sm opacity-70 mt-2 flex gap-5">
              Assigned By:{" "}
              <span className="opacity-100">Zeldrick Delos Santos</span>
            </p>
          </div>

          {/* Members Attachments */}
          <h3 className="text-lg font-semibold mb-4 font-inter">
            Members Attachments:
          </h3>
          <hr className="border-gray-700 mb-4" />

          {/* Table Header */}
          <div className="grid grid-cols-4 mb-3 opacity-70 text-sm">
            <p>Name</p>
            <p>File Uploaded</p>
            <p>Grade</p>
            <p></p>
          </div>

          {/* Members Rows */}
          {members.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-4 mb-4 border-b border-gray-800 text-sm"
            >
              <p>{member.name}</p>
              <p>{member.file}</p>
              {member.isEditing ? (
                <input
                  type="text"
                  value={member.grade}
                  onChange={(e) => handleGradeChange(index, e.target.value)}
                  onBlur={() => handleGradeBlur(index)}
                  onKeyPress={(e) => handleGradeKeyPress(e, index)}
                  className="bg-[#2A2A2A] text-white px-2 py-1 rounded w-20"
                  autoFocus
                />
              ) : (
                <p>{member.grade}</p>
              )}

            <button
              onClick={() => handleEditGrade(index)}
              className="text-blue-400 hover:underline flex items-center gap-1 text-sm px-2 py-1 w-fit justify-self-end"
            >
              <Edit className="w-3 h-3" />
              Edit Grade
            </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskViewAll;
