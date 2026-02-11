import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import InputField from "@/pages/component/InputField";
import { Edit, Check } from "lucide-react";

const TaskViewPageAdmin = () => {
  const [spaceComment, setSpaceComment] = useState("");
  const [privateComment, setPrivateComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedInstruction, setUploadedInstruction] = useState(null);
  const [showSendSpace, setShowSendSpace] = useState(false);
  const [showSendPrivate, setShowSendPrivate] = useState(false);
  const [taskTitle, setTaskTitle] = useState("Week 8 Individual Activity");
  const [dueDate, setDueDate] = useState("November 20, 2025");
  const [grade, setGrade] = useState("20");
  const [isEditingTask, setIsEditingTask] = useState(false);

  const handleSendSpaceComment = () => {
    console.log("Sending space comment:", spaceComment);
    setSpaceComment("");
    setShowSendSpace(false);
  };

  const handleSendPrivateComment = () => {
    console.log("Sending private comment:", privateComment);
    setPrivateComment("");
    setShowSendPrivate(false);
  };

  const handleInstructionFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setUploadedInstruction(file);
    } else {
      alert("Please select a PDF or DOC file.");
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

        {/* Task Information */}
        <div className="p-8 rounded-2xl shadow-lg max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 font-inter">
            Task Information:
          </h2>
          <hr className="border-gray-700 mb-4" />

          {/* Title + Edit Button */}
          <div className="mb-10">
            <div className="flex justify-between items-start w-full">
              {/* Title / Input */}
              <div>
                {isEditingTask ? (
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setIsEditingTask(false)
                    }
                    className="bg-[#2A2A2A] text-white px-2 py-1 rounded font-semibold font-inter"
                    autoFocus
                  />
                ) : (
                  <p className="font-semibold font-inter text-3xl">
                    {taskTitle}
                  </p>
                )}

                <p className="text-sm opacity-70 mt-2 flex gap-10 mt-4">
                  Due Date:{" "}
                  {isEditingTask ? (
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setIsEditingTask(false)
                      }
                      className="bg-[#2A2A2A] text-white px-2 py-1 rounded"
                    />
                  ) : (
                    <span className="opacity-100">{dueDate}</span>
                  )}
                </p>

                <p className="text-sm opacity-70 mt-2 flex gap-5">
                  Assigned By:{" "}
                  <span className="opacity-100">Zeldrick Delos Santos</span>
                </p>
              </div>

              {/* Grade Section */}
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setIsEditingTask(!isEditingTask)}
                    className="text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit task
                  </button>
                  {isEditingTask && (
                    <button
                      onClick={() => setIsEditingTask(false)}
                      className="text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </button>
                  )}
                </div>

                <p className="font-semibold">Grade:</p>

                {isEditingTask ? (
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setIsEditingTask(false)
                    }
                    className="bg-[#2A2A2A] text-white px-2 py-1 rounded text-2xl font-bold mt-2 w-16"
                    autoFocus
                  />
                ) : (
                  <p className="text-2xl font-bold mt-2">{grade}</p>
                )}
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* File Uploaded */}
            <div>
              <h3 className="font-semibold mb-3">File Uploaded:</h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleInstructionFileChange}
                className="hidden"
                id="instruction-upload"
              />
              <label
                htmlFor="instruction-upload"
                className="bg-[#2A2A2A] px-4 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-[#3A3A3A]"
              >
                <span className="text-xl">+</span>{" "}
                {uploadedInstruction ? uploadedInstruction.name : "Upload Here"}
              </label>
            </div>

            {/* Members Attachments */}
            <div>
              <h3 className="font-semibold mb-3">Members Attachments:</h3>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-inter">Wilson Esmabe</h4>
                <button className="bg-[#2A2A2A] px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-[#3A3A3A]">
                  see work
                </button>
              </div>
              <hr className="border-gray-700 mb-2" />

              <div className="flex justify-between items-center">
                <p className="font-inter opacity-70">+ 2 more</p>
                <a
                  href="/task-view-all"
                  className="bg-[#2A2A2A] px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-[#3A3A3A] opacity-70 inline-block"
                >
                  see all works
                </a>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <hr className="border-gray-700 mb-4" />
          <h3 className="font-semibold mb-4">Comments</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Space Comment */}
            <div className="p-4 rounded-xl">
              <p className="text-sm mb-2 opacity-70">Add space comment</p>
              <div className="relative">
                <img
                  src="/src/assets/HomePage/frieren-avatar.jpg"
                  alt="Frieren"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full z-10"
                />
                <InputField
                  placeholder="Write a comment..."
                  value={spaceComment}
                  onChange={(e) => {
                    setSpaceComment(e.target.value);
                    setShowSendSpace(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendSpaceComment()
                  }
                  style={{
                    fontSize: "0.875rem",
                    paddingLeft: "3rem",
                    paddingRight: "4rem",
                    width: "100%",
                  }}
                />
                {showSendSpace && (
                  <button
                    onClick={handleSendSpaceComment}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <span>&rarr;</span> Send
                  </button>
                )}
              </div>
            </div>

            {/* Private Comment */}
            <div className="p-4 rounded-xl">
              <p className="text-sm mb-2 opacity-70">Add private comment</p>
              <div className="relative">
                <img
                  src="/src/assets/HomePage/frieren-avatar.jpg"
                  alt="Frieren"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full z-10"
                />
                <InputField
                  placeholder="Write a private comment..."
                  value={privateComment}
                  onChange={(e) => {
                    setPrivateComment(e.target.value);
                    setShowSendPrivate(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendPrivateComment()
                  }
                  style={{
                    fontSize: "0.875rem",
                    paddingLeft: "3rem",
                    paddingRight: "4rem",
                    width: "100%",
                  }}
                />

                {showSendPrivate && (
                  <button
                    onClick={handleSendPrivateComment}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-black px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <span>&rarr;</span> Send
                  </button>
                )}
              </div>

              <p className="text-xs opacity-50 mt-1">
                Private comments are only visible to you and your admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskViewPageAdmin;
