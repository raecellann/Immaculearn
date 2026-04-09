import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const ParentGradeView = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const studentData = {
    name: "Raecell Ann Galvez",
    studentNumber: "22-1241",
    subjects: [
      {
        name: "Thesis and Research",
        grade: 80,
        teacher: "Jober Reyes",
        prelim: 80,
        midterm: null,
        semiFinals: null,
        finals: null,
        requiredGrade: 80,
      },
      {
        name: "Mathematics",
        grade: 95,
        teacher: "Math Teacher",
        prelim: 90,
        midterm: 92,
        semiFinals: 94,
        finals: 95,
        requiredGrade: 85,
      },
      {
        name: "Science",
        grade: 92,
        teacher: "Science Teacher",
        prelim: 90,
        midterm: 91,
        semiFinals: 92,
        finals: 92,
        requiredGrade: 85,
      },
      {
        name: "English",
        grade: 94,
        teacher: "English Teacher",
        prelim: 92,
        midterm: 93,
        semiFinals: 94,
        finals: 94,
        requiredGrade: 85,
      },
      {
        name: "Computer Programming",
        grade: 96,
        teacher: "CS Teacher",
        prelim: 94,
        midterm: 95,
        semiFinals: 96,
        finals: 96,
        requiredGrade: 85,
      },
      {
        name: "PE",
        grade: 98,
        teacher: "PE Teacher",
        prelim: 97,
        midterm: 98,
        semiFinals: 98,
        finals: 98,
        requiredGrade: 85,
      },
    ],
  };

  const handleSeeMore = (subject) => {
    setSelectedSubject(subject);
    setShowDetails(true);
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedSubject(null);
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white font-inter p-8">
      {!showDetails ? (
        <>
          <h1 className="text-3xl font-bold mb-2">Student Grades</h1>
          <p className="text-gray-400 mb-8">
            Viewing records for student{" "}
            <span className="text-[#8AB4FF]">{studentData.studentNumber}</span>
          </p>

          {/* Student Info */}
          <div className="bg-[#1E242E] p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-1">{studentData.name}</h2>
            <p className="text-gray-400 text-sm">
              Student Number: {studentData.studentNumber}
            </p>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto bg-[#1F232B] rounded-2xl p-6 shadow-lg">
            <table className="min-w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-2 px-4">Grade</th>
                  <th className="py-2 px-4">Subject Name</th>
                  <th className="py-2 px-4">Subject Teacher</th>
                  <th className="py-2 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {studentData.subjects.map((subject, index) => (
                  <tr key={index} className="bg-[#2A2F38] rounded-xl">
                    <td className="py-3 px-4 font-bold text-white">
                      {subject.grade}
                    </td>
                    <td className="py-3 px-4">{subject.name}</td>
                    <td className="py-3 px-4">{subject.teacher}</td>
                    <td
                      className="py-3 px-4 text-blue-400 hover:underline cursor-pointer"
                      onClick={() => handleSeeMore(subject)}
                    >
                      See More
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-8">
            <ArrowLeft
              className="mr-2 cursor-pointer text-gray-300 hover:text-white"
              onClick={handleBack}
            />
            <h1 className="text-3xl font-bold">Grades Viewing</h1>
          </div>

          <div className="bg-[#1F232B] rounded-2xl p-6 shadow-lg">
            <p className="text-lg mb-2">
              <span className="font-semibold text-gray-400">Subject:</span>{" "}
              {selectedSubject?.name}
            </p>
            <p className="text-lg mb-4">
              <span className="font-semibold text-gray-400">
                Subject Teacher:
              </span>{" "}
              {selectedSubject?.teacher}
            </p>

            <table className="min-w-full text-left border-separate border-spacing-y-2 mb-6">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-2 px-4">Grade</th>
                  <th className="py-2 px-4">Prelim</th>
                  <th className="py-2 px-4">Midterm</th>
                  <th className="py-2 px-4">Semi-Finals</th>
                  <th className="py-2 px-4">Finals</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#2A2F38] rounded-xl">
                  <td className="py-3 px-4">Grade</td>
                  <td className="py-3 px-4 font-bold">
                    {selectedSubject?.prelim || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {selectedSubject?.midterm ? selectedSubject.midterm : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {selectedSubject?.semiFinals
                      ? selectedSubject.semiFinals
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {selectedSubject?.finals ? selectedSubject.finals : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-gray-400 text-right">
              Required Grade:{" "}
              <span className="text-white font-bold">
                {selectedSubject?.requiredGrade || "N/A"}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentGradeView;
