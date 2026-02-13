import React, { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../component/Button";
import Logout from "../component/logout";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Users,
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import AdminSidebar from "../component/adminsidebar";

const AdminAcademicTerm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("1st Sem");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Mock data for academic terms and periods
  const [academicTerms, setAcademicTerms] = useState([
    {
      id: "1st-sem",
      name: "1st Sem",
      schoolYear: "2024-2025",
      status: "active",
      periods: [
        {
          id: "prelim",
          name: "Prelim",
          startDate: "2024-08-01",
          endDate: "2024-09-15",
          status: "completed",
          totalStudents: 1250,
          activeCourses: 45
        },
        {
          id: "midterm",
          name: "Midterm",
          startDate: "2024-09-16",
          endDate: "2024-10-31",
          status: "active",
          totalStudents: 1250,
          activeCourses: 45
        },
        {
          id: "prefinals",
          name: "Prefinals",
          startDate: "2024-11-01",
          endDate: "2024-12-15",
          status: "upcoming",
          totalStudents: 1250,
          activeCourses: 45
        },
        {
          id: "finals",
          name: "Finals",
          startDate: "2024-12-16",
          endDate: "2025-01-31",
          status: "upcoming",
          totalStudents: 1250,
          activeCourses: 45
        }
      ]
    },
    {
      id: "2nd-sem",
      name: "2nd Sem",
      schoolYear: "2024-2025",
      status: "upcoming",
      periods: [
        {
          id: "prelim",
          name: "Prelim",
          startDate: "2025-02-01",
          endDate: "2025-03-15",
          status: "upcoming",
          totalStudents: 1180,
          activeCourses: 42
        },
        {
          id: "midterm",
          name: "Midterm",
          startDate: "2025-03-16",
          endDate: "2025-04-30",
          status: "upcoming",
          totalStudents: 1180,
          activeCourses: 42
        },
        {
          id: "prefinals",
          name: "Prefinals",
          startDate: "2025-05-01",
          endDate: "2025-06-15",
          status: "upcoming",
          totalStudents: 1180,
          activeCourses: 42
        },
        {
          id: "finals",
          name: "Finals",
          startDate: "2025-06-16",
          endDate: "2025-07-31",
          status: "upcoming",
          totalStudents: 1180,
          activeCourses: 42
        }
      ]
    }
  ]);

  // Check if 1st semester is completed
  const isFirstSemCompleted = academicTerms.find(term => term.id === "1st-sem")?.status === "completed";

  const currentTerm = academicTerms.find(term => term.id === selectedTerm.replace(" ", "-").toLowerCase());

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "upcoming":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden ${
        false ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#1E222A] p-4 border-b border-[#3B4457]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Academic Term Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage academic terms and grading periods</p>
            </div>
            
          </div>
        </div>

        <div className="flex-1 p-6">
          {/* Term Selection */}
          <div className="flex gap-4 mb-6">
            {academicTerms.filter(term => term.id === "1st-sem" || term.id === "2nd-sem").map((term) => {
              const isSecondSem = term.id === "2nd-sem";
              const isDisabled = isSecondSem && !isFirstSemCompleted;
              
              return (
                <button
                  key={term.id}
                  onClick={() => !isDisabled && setSelectedTerm(term.name)}
                  disabled={isDisabled}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedTerm === term.name
                      ? "bg-[#007AFF] text-white"
                      : isDisabled
                      ? "bg-[#1E242E] text-gray-500 cursor-not-allowed opacity-50"
                      : "bg-[#1E242E] text-gray-300 hover:bg-[#2A2F3A]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{term.name}</span>
                    <span className="text-xs opacity-75">({term.schoolYear})</span>
                    {isDisabled && (
                      <span className="text-xs text-yellow-400 ml-1">(Locked)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Period Cards */}
          {currentTerm && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {currentTerm.periods.map((period) => (
                <div
                  key={period.id}
                  className="bg-[#1E242E] rounded-xl border border-[#3B4457] hover:border-[#4A5568] transition-all group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{period.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(period.status)}`}>
                          {period.status}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowEditModal(true);
                            }}
                            className="p-1 hover:bg-[#2A2F3A] rounded"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-[#2A2F3A] rounded">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">Students</span>
                        </div>
                        <span className="font-medium">{period.totalStudents.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Active Courses</span>
                        </div>
                        <span className="font-medium">{period.activeCourses}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-[#3B4457]">
                      <Button
                        className="w-full bg-[#007AFF] hover:bg-blue-700 text-white py-2 text-sm"
                        onClick={() => navigate(`/admin/academic-term/${period.id}`)}
                      >
                        Manage Period
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!currentTerm && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No academic term selected</p>
              <p className="text-sm mt-2">Select a term to view grading periods</p>
            </div>
          )}
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminAcademicTerm;