import React, { useState, useEffect, useRef } from "react";
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
  X,
  Save,
  AlertCircle,
  Menu,
  Lock,
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
  const [showManagePeriodModal, setShowManagePeriodModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [managePeriodData, setManagePeriodData] = useState({
    gradingDueDate: "",
    submissionDeadline: "",
    extensionDeadline: "",
    remarks: ""
  });

  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

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

  // Check if a period is unlocked (previous period is completed)
  const isPeriodUnlocked = (periods, currentPeriodId) => {
    const periodOrder = ['prelim', 'midterm', 'prefinals', 'finals'];
    const currentIndex = periodOrder.indexOf(currentPeriodId);
    
    if (currentIndex === 0) return true; // First period is always unlocked
    
    const previousPeriodId = periodOrder[currentIndex - 1];
    const previousPeriod = periods.find(p => p.id === previousPeriodId);
    
    return previousPeriod?.status === "completed";
  };

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

  const handleManagePeriod = (period) => {
    setSelectedPeriod(period);
    setManagePeriodData({
      gradingDueDate: period.gradingDueDate || "",
      submissionDeadline: period.submissionDeadline || "",
      extensionDeadline: period.extensionDeadline || "",
      remarks: period.remarks || ""
    });
    setShowManagePeriodModal(true);
  };

  const handleSavePeriodSettings = () => {
    // Here you would save the period settings to your backend
    console.log("Saving period settings:", managePeriodData);
    setShowManagePeriodModal(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden overflow-hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Academic Terms</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Academic Term Management
          </h1>

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
                    <span>{term.name}</span>
                    <span className="text-xs opacity-75">({term.schoolYear})</span>
                    {isDisabled && (
                      <Lock className="w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Period Cards */}
          {currentTerm && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {currentTerm.periods.map((period) => {
                const isUnlocked = isPeriodUnlocked(currentTerm.periods, period.id);
                const isCompleted = period.status === "completed";
                const isLocked = !isUnlocked || isCompleted;
                
                return (
                  <div
                    key={period.id}
                    className={`bg-[#1E242E] rounded-xl border transition-all group ${
                      isLocked 
                        ? "border-[#3B4457] opacity-60" 
                        : "border-[#3B4457] hover:border-[#4A5568]"
                    }`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{period.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(period.status)}`}>
                            {period.status}
                          </span>
                          {isLocked && (
                            <span className="text-xs text-yellow-400 font-medium">
                              {isCompleted ? "Closed" : "Locked"}
                            </span>
                          )}
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${
                            isLocked ? "pointer-events-none" : ""
                          }`}>
                            <button
                              onClick={() => {
                                setSelectedPeriod(period);
                                setShowEditModal(true);
                              }}
                              disabled={isLocked}
                              className={`p-1 rounded ${
                                isLocked 
                                  ? "cursor-not-allowed" 
                                  : "hover:bg-[#2A2F3A]"
                              }`}
                            >
                              <Edit className={`w-4 h-4 ${isLocked ? "text-gray-600" : "text-gray-400"}`} />
                            </button>
                            <button 
                              disabled={isLocked}
                              className={`p-1 rounded ${
                                isLocked 
                                  ? "cursor-not-allowed" 
                                  : "hover:bg-[#2A2F3A]"
                              }`}
                            >
                              <Trash2 className={`w-4 h-4 ${isLocked ? "text-gray-600" : "text-red-400"}`} />
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
                          className={`w-full py-2 text-sm ${
                            isLocked
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-[#007AFF] hover:bg-blue-700 text-white"
                          }`}
                          onClick={() => !isLocked && handleManagePeriod(period)}
                          disabled={isLocked}
                        >
                          {isCompleted ? "View Period" : isLocked ? "Locked" : "Manage Period"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!currentTerm && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No academic term selected</p>
              <p className="text-sm mt-2">Select a term to view grading periods</p>
              <button
                onClick={() => console.log("Add new term button clicked")}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 transition-colors mt-4"
              >
                Add New Term
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* Manage Period Modal */}
      {showManagePeriodModal && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E222A] rounded-xl border border-[#3B4457] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3B4457]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Period Settings</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedTerm?.name} - {selectedPeriod.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowManagePeriodModal(false)}
                  className="p-2 hover:bg-[#2A2F3A] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Period Info */}
              <div className="bg-[#161A20] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Period Duration</span>
                </div>
                <div className="text-sm text-gray-300">
                  {formatDate(selectedPeriod.startDate)} - {formatDate(selectedPeriod.endDate)}
                </div>
              </div>

              {/* Grading Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grading Due Date
                </label>
                <input
                  type="datetime-local"
                  value={managePeriodData.gradingDueDate}
                  onChange={(e) => setManagePeriodData({...managePeriodData, gradingDueDate: e.target.value})}
                  className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Deadline for faculty to submit grades
                </p>
              </div>

              {/* Submission Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={managePeriodData.submissionDeadline}
                  onChange={(e) => setManagePeriodData({...managePeriodData, submissionDeadline: e.target.value})}
                  className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Final deadline for student submissions
                </p>
              </div>

              {/* Extension Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Extension Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={managePeriodData.extensionDeadline}
                  onChange={(e) => setManagePeriodData({...managePeriodData, extensionDeadline: e.target.value})}
                  className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Extended deadline for late submissions with penalties
                </p>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Remarks / Instructions
                </label>
                <textarea
                  value={managePeriodData.remarks}
                  onChange={(e) => setManagePeriodData({...managePeriodData, remarks: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none resize-none"
                  placeholder="Enter any special instructions or remarks for this period..."
                />
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">Important Notice</p>
                    <p className="text-xs text-yellow-300/80 mt-1">
                      Once grades are finalized and submitted, they cannot be modified. Please ensure all data is accurate before finalizing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#3B4457]">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowManagePeriodModal(false)}
                  className="px-4 py-2 bg-[#2A2F3A] text-gray-300 rounded-lg hover:bg-[#3B4457] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePeriodSettings}
                  className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicTerm;