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
  CheckCircle,
  Play,
  StopCircle,
  Info, // Add this missing import
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import AdminSidebar from "../component/adminsidebar";

const AdminAcademicTerm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form state for creating/editing academic term
  const [formData, setFormData] = useState({
    semester: "1st Semester",
    period: "PRELIM",
    startYear: new Date().getFullYear(),
    status: "active", // Default to active since no upcoming option
  });

  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

  // Mock data for academic terms
  const [academicTerms, setAcademicTerms] = useState([
    {
      id: "1st-semester-2024-prelim",
      name: "1st Semester",
      period: "PRELIM",
      schoolYear: "2024-2025",
      status: "active",
      createdAt: "2024-01-15T08:00:00Z",
    },
    {
      id: "1st-semester-2024-midterm",
      name: "1st Semester",
      period: "MIDTERM",
      schoolYear: "2024-2025",
      status: "completed",
      createdAt: "2024-01-15T08:00:00Z",
    },
  ]);

  // Check if there's an active term
  const hasActiveTerm = academicTerms.some((term) => term.status === "active");

  const handleCreateAcademicTerm = () => {
    // Check if there's an active term
    if (hasActiveTerm) {
      setErrorMessage(
        "Cannot create new academic term while there is an active term. Please complete the active term first.",
      );
      return;
    }

    const academicYear = `${formData.startYear}-${formData.startYear + 1}`;

    // Create new academic term (always active by default when creating)
    const newTerm = {
      id: `${formData.semester.toLowerCase().replace(" ", "-")}-${formData.startYear}-${formData.period.toLowerCase()}-${Date.now()}`,
      name: formData.semester,
      period: formData.period,
      schoolYear: academicYear,
      status: "active", // Always active when created
      createdAt: new Date().toISOString(),
    };

    setAcademicTerms([...academicTerms, newTerm]);
    resetForm();
    setShowCreateModal(false);
    setErrorMessage("");
  };

  const handleEditTerm = () => {
    if (!selectedTerm) return;

    // Check if trying to activate while another term is active
    if (
      formData.status === "active" &&
      hasActiveTerm &&
      selectedTerm.status !== "active"
    ) {
      setErrorMessage(
        "Cannot activate this term while another term is active. Please complete the active term first.",
      );
      return;
    }

    const academicYear = `${formData.startYear}-${formData.startYear + 1}`;

    const updatedTerms = academicTerms.map((term) =>
      term.id === selectedTerm.id
        ? {
            ...term,
            name: formData.semester,
            period: formData.period,
            schoolYear: academicYear,
            status: formData.status,
          }
        : term,
    );

    setAcademicTerms(updatedTerms);
    resetForm();
    setShowEditModal(false);
    setSelectedTerm(null);
    setErrorMessage("");
  };

  const handleDeleteTerm = (termId) => {
    const termToDelete = academicTerms.find((t) => t.id === termId);

    // Prevent deletion of active term
    if (termToDelete?.status === "active") {
      setErrorMessage(
        "Cannot delete an active academic term. Please complete it first.",
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this academic term?")) {
      setAcademicTerms(academicTerms.filter((term) => term.id !== termId));
    }
  };

  const handleStatusChange = (termId, newStatus) => {
    const term = academicTerms.find((t) => t.id === termId);

    // If trying to activate, check if another term is active
    if (newStatus === "active" && hasActiveTerm && term.status !== "active") {
      setErrorMessage(
        "Cannot activate this term while another term is active. Please complete the active term first.",
      );
      return;
    }

    const updatedTerms = academicTerms.map((term) =>
      term.id === termId ? { ...term, status: newStatus } : term,
    );
    setAcademicTerms(updatedTerms);
    setErrorMessage("");
  };

  const openEditModal = (term) => {
    setSelectedTerm(term);
    setFormData({
      semester: term.name,
      period: term.period,
      startYear: parseInt(term.schoolYear.split("-")[0]),
      status: term.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      semester: "1st Semester",
      period: "PRELIM",
      startYear: new Date().getFullYear(),
      status: "active",
    });
    setErrorMessage("");
  };

  const handleYearChange = (year) => {
    setFormData({ ...formData, startYear: parseInt(year) });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
            <Play className="w-3 h-3" /> Active
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> Unknown
          </span>
        );
    }
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
      {/* Sidebar components */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

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
          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Term Warning */}
          {hasActiveTerm && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-center gap-3 text-yellow-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                There is an active academic term. You cannot create new terms
                until the active term is marked as completed.
              </p>
            </div>
          )}

          {/* DESKTOP TITLE AND CREATE BUTTON */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Academic Terms</h1>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              disabled={hasActiveTerm}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                hasActiveTerm
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-[#007AFF] hover:bg-blue-600"
              } text-white`}
            >
              <Plus className="w-4 h-4" />
              Create Academic Term
            </button>
          </div>

          {/* MOBILE CREATE BUTTON */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              disabled={hasActiveTerm}
              className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                hasActiveTerm
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-[#007AFF] hover:bg-blue-600"
              } text-white`}
            >
              <Plus className="w-5 h-5" />
              Create Academic Term
            </button>
          </div>

          {/* ACADEMIC TERMS LIST */}
          {academicTerms.length === 0 ? (
            /* No Academic Terms State */
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#1E242E] rounded-xl border border-[#3B4457] p-8 text-center">
                <div className="w-16 h-16 bg-[#2A2F3A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Academic Terms Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Get started by creating your first academic term. You can set
                  up semesters, periods, and academic years.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  disabled={hasActiveTerm}
                  className={`px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 ${
                    hasActiveTerm
                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                      : "bg-[#007AFF] hover:bg-blue-600"
                  } text-white`}
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Academic Term
                </button>
              </div>
            </div>
          ) : (
            /* Academic Terms Table */
            <div className="bg-[#1E242E] rounded-xl border border-[#3B4457] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3B4457] bg-[#161A20]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Semester
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Academic Year
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicTerms.map((term) => (
                      <tr
                        key={term.id}
                        className="border-b border-[#3B4457] hover:bg-[#2A2F3A] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">{term.name}</td>
                        <td className="px-6 py-4 text-sm">{term.period}</td>
                        <td className="px-6 py-4 text-sm">{term.schoolYear}</td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(term.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(term.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Status Dropdown - Only Active and Completed */}
                            <select
                              value={term.status}
                              onChange={(e) =>
                                handleStatusChange(term.id, e.target.value)
                              }
                              className="bg-[#161A20] border border-[#3B4457] rounded-lg text-xs px-2 py-1 text-white focus:border-[#007AFF] focus:outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(term)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Academic Term Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1E242E] rounded-xl border border-[#3B4457] w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-[#3B4457]">
                  <h2 className="text-xl font-bold text-white">
                    Create Academic Term
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Semester Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                  </div>

                  {/* Period Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Period
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) =>
                        setFormData({ ...formData, period: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      <option value="PRELIM">PRELIM</option>
                      <option value="MIDTERM">MIDTERM</option>
                      <option value="PREFINALS">PREFINALS</option>
                      <option value="FINALS">FINALS</option>
                    </select>
                  </div>

                  {/* Academic Year Start */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Academic Year Start
                    </label>
                    <select
                      value={formData.startYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - 2 + i,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Academic Year:{" "}
                      <span className="text-white">
                        {formData.startYear}-{formData.startYear + 1}
                      </span>
                    </p>
                  </div>

                  {/* Note about status */}
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                    <p className="text-xs text-blue-400">
                      <Info className="w-3 h-3 inline mr-1" />
                      New terms are automatically set to Active status.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 bg-[#2A2F3A] text-gray-300 rounded-lg hover:bg-[#3B4457] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAcademicTerm}
                      className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Academic Term Modal */}
          {showEditModal && selectedTerm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1E242E] rounded-xl border border-[#3B4457] w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-[#3B4457]">
                  <h2 className="text-xl font-bold text-white">
                    Edit Academic Term
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTerm(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Semester Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                    </select>
                  </div>

                  {/* Period Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Period
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) =>
                        setFormData({ ...formData, period: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      <option value="PRELIM">PRELIM</option>
                      <option value="MIDTERM">MIDTERM</option>
                      <option value="PREFINALS">PREFINALS</option>
                      <option value="FINALS">FINALS</option>
                    </select>
                  </div>

                  {/* Academic Year Start */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Academic Year Start
                    </label>
                    <select
                      value={formData.startYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - 2 + i,
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Academic Year:{" "}
                      <span className="text-white">
                        {formData.startYear}-{formData.startYear + 1}
                      </span>
                    </p>
                  </div>

                  {/* Status Dropdown - Only Active and Completed */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#161A20] border border-[#3B4457] rounded-lg text-white focus:border-[#007AFF] focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    {formData.status === "active" &&
                      hasActiveTerm &&
                      selectedTerm.status !== "active" && (
                        <p className="text-xs text-red-400 mt-1">
                          Warning: Another term is currently active. Activating
                          this will deactivate the other term.
                        </p>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTerm(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 bg-[#2A2F3A] text-gray-300 rounded-lg hover:bg-[#3B4457] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditTerm}
                      className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminAcademicTerm;
