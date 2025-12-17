import React, { useState } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";

const ProfTaskPage = () => {
  const navigate = useNavigate();
  
  // Task status styles
  const statusStyles = {
    Done: "border-2 border-[#00B865] text-[#10E164]",
    "In Progress": "border-[#0066D2] text-[#4D9BEF]",
    "Missing": "border-[#FF5252] text-[#FF5252]"
  };

  // Example tasks
  const [tasks, setTasks] = useState([
    {
      name: "Review Thesis Papers ",
      assignedTo: "All Students",
      deadline: "April 20, 2025",
      status: "In Progress"
    },
    {
      name: "Grade OS Assignments ",
      assignedTo: "Section A",
      deadline: "April 18, 2025",
      status: "Missing"
    },
    {
      name: "Submit Midterm Grades ",
      assignedTo: "All Sections",
      deadline: "April 15, 2025",
      status: "Done"
    },
    {
      name: "Prepare Lecture Slides ",
      assignedTo: "Section B",
      deadline: "April 25, 2025",
      status: "In Progress"
    },
    {
      name: "Hold Office Hours ",
      assignedTo: "All Students",
      deadline: "April 22, 2025",
      status: "In Progress"
    }
  ]);

  const [openIndex, setOpenIndex] = useState(null);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
    setOpenIndex(null);
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* PROFESSOR SIDEBAR */}
      <ProfSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER / BANNER */}
        <div className="relative mb-6">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Space Banner"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl rounded-t-none"
          />

          {/* TITLE */}
          <div className="absolute top-0 z-10">
            <div className="bg-black text-white px-10 py-3 rounded-b-[1rem] rounded-t-none shadow-lg text-2xl font-extrabold text-left">
              Professor Susan's Space
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-[120px] border-b border-white/10 mb-6 text-xl">
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-susan")}
          >
            Stream
          </button>
          <button
            className="pb-3 border-b-2 border-white font-medium"
            onClick={() => navigate("/prof-space-susan/tasks")}
          >
            Tasks
          </button>
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-susan/files-shared")}
          >
            Files Shared
          </button>
          <button
            className="pb-3 text-white/70 hover:text-white"
            onClick={() => navigate("/prof-space-susan/people")}
          >
            People
          </button>
        </div>

        {/* TASK TABLE */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Assigned Tasks 
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-600 text-left text-gray-400">
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Task Name</th>
                <th className="py-3 px-4 font-medium">Assigned To</th>
                <th className="py-3 px-4 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-[#1E222A] transition"
                >
                  <td className="py-3 px-4">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                        className={`bg-black px-4 py-1 rounded-full ${
                          statusStyles[task.status] || 'border-2 border-gray-500 text-gray-300'
                        } flex items-center gap-2 text-sm`}
                      >
                        <span className="font-medium">{task.status}</span>
                        <span className="text-xs">▼</span>
                      </button>

                      {openIndex === index && (
                        <div className="absolute left-0 mt-2 w-44 bg-black border border-gray-700 rounded-lg p-3 z-50">
                          <div className="flex flex-col gap-2">
                            {Object.keys(statusStyles).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(index, st)}
                                className={`w-full text-center px-4 py-2 rounded-full bg-black ${statusStyles[st]} text-sm font-medium hover:opacity-90`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <a
                      href="/prof-task-view"
                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2"
                    >
                      {task.name}
                    </a>
                  </td>

                  <td className="py-3 px-4">{task.assignedTo}</td>
                  <td className="py-3 px-4">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-6 flex justify-end">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              onClick={() => navigate("/prof-space-susan/create-task")}
            >
              + Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfTaskPage;