import React, { useState, useEffect } from "react";
import AdminSidebar from "../component/adminsidebar";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Replace with your backend/API
    setStudents([
      { id: 1, name: "Raecell Ann", email: "raecell@student.edu" },
      { id: 2, name: "Jay", email: "jay@student.edu" },
    ]);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Students List</h1>

        <div className="bg-[#1E242E] p-6 rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Verified</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-800">
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.email}</td>
                  <td className="py-3 text-green-400">✔ Verified</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
