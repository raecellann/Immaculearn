import React, { useRef } from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiUploadCloud,
} from "react-icons/fi";

const CreateActivityForm = () => {
  const fileInputRef = useRef(null);
  const instructionRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const applyFormat = (command) => {
    instructionRef.current?.focus();
    document.execCommand(command, false, null);
  };

  return (
    <div className="bg-[#161A20] text-white font-sans p-4 sm:p-6 md:p-8">
      {/* COVER */}
      <div className="relative mb-6">
        <img
          src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-b-xl"
          alt="cover"
        />
        <div className="absolute inset-0 bg-black/50 rounded-b-xl" />
        <div className="absolute top-0 left-0 z-10">
          <div className="bg-black text-white px-6 sm:px-10 py-3 rounded-br-[1rem] text-xl sm:text-2xl font-extrabold">
            Zeldrick's Space
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="max-w-6xl mx-auto bg-black rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-white">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="font-semibold text-lg">
              Title: <span className="text-red-500">*</span>
            </label>
            <input
              className="bg-[#23272F] rounded-lg px-4 py-2 outline-none border border-[#23272F] focus:border-blue-500"
              placeholder="Enter activity title"
            />

            <label className="font-semibold">Instruction (optional)</label>
            <div className="bg-[#23272F] rounded-lg border border-[#23272F] focus-within:border-blue-500">
              <div
                ref={instructionRef}
                contentEditable
                className="min-h-[140px] px-4 py-3 outline-none"
              />
              <div className="border-t border-[#2F3440]" />
              <div className="flex gap-4 px-4 py-2 text-gray-300">
                <button onClick={() => applyFormat("bold")}><FiBold /></button>
                <button onClick={() => applyFormat("italic")}><FiItalic /></button>
                <button onClick={() => applyFormat("underline")}><FiUnderline /></button>
              </div>
            </div>

            {/* FILE UPLOAD */}
            <div className="mt-6">
              <label className="font-semibold mb-2 block">
                Choose a file or drag & drop it here.
              </label>
              <div
                onClick={handleFileClick}
                className="border border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center cursor-pointer bg-[#0F1115]"
              >
                <FiUploadCloud size={36} className="mb-3 text-gray-300" />
                <p className="text-sm text-gray-300 mb-2">
                  DOCS, PDF, PPT AND EXCEL, UP TO 10 MB
                </p>
                <button className="px-4 py-1.5 border border-gray-400 rounded-md text-sm">
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" className="hidden" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="font-semibold">Grades:</label>
            <input className="bg-[#23272F] rounded-lg px-4 py-2" />

            <label className="font-semibold">Assignees:</label>
            <select className="bg-[#23272F] rounded-lg px-4 py-2">
              <option>Individual</option>
              <option>Group</option>
            </select>

            <label className="font-semibold">Due Date:</label>
            <input type="date" className="bg-[#23272F] rounded-lg px-4 py-2" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="bg-gray-700 px-6 py-2 rounded-lg">
            Save as Draft
          </button>
          <button className="bg-blue-600 px-6 py-2 rounded-lg">
            Publish Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityForm;
