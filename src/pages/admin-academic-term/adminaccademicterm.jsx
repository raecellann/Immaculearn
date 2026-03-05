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
  Info,
  Edit2Icon, // Add this missing import
} from "lucide-react";
import AdminSidebar from "../component/adminsidebar";
import { useAcademicMutations } from "../../hooks/useAcademicMutation";
import { toast } from "react-toastify";

const AdminAcademicTerm = () => {
  const { academicTerms, updateAcademic, createAcademic } =
    useAcademicMutations();

  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isShowEdit, setIsShowEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [tempStatus, setTempStatus] = useState("");
  const [editingTermId, setEditingTermId] = useState(null);

  // const enterEditMode = (term) => {
  //   setEditingTermId(term.id);
  //   setTempStatus(term.status);
  // };

  // const handleSaveStatus = (termId) => {
  //   handleStatusChange(termId, tempStatus);
  //   setEditingTermId(null);
  //   setTempStatus("");
  // };

  // const handleCancelEdit = () => {
  //   setEditingTermId(null);
  //   setTempStatus("");
  // };

  // Initialize formData
  const [formData, setFormData] = useState({
    academic_semester: "1st Semester",
    academic_period: "PRELIM",
    academic_year: new Date().getFullYear(),
    academic_status: "active",
  });

  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

  // Mock data for academic terms
  // const [academicTerms, setAcademicTerms] = useState([
  //   {
  //     id: "1st-semester-2024-prelim",
  //     name: "1st Semester",
  //     period: "PRELIM",
  //     schoolYear: "2024-2025",
  //     status: "active",
  //     createdAt: "2024-01-15T08:00:00Z",
  //   },
  //   {
  //     id: "1st-semester-2024-midterm",
  //     name: "1st Semester",
  //     period: "MIDTERM",
  //     schoolYear: "2024-2025",
  //     status: "completed",
  //     createdAt: "2024-01-15T08:00:00Z",
  //   },
  // ]);

  // Check if there's an active term
  const hasActiveTerm = academicTerms.some(
    (term) => term.academic_status === "active",
  );

  const handleCreateAcademicTerm = async () => {
    // Check if there's an active term
    if (hasActiveTerm) {
      setErrorMessage(
        "Cannot create new academic term while there is an active term. Please complete the active term first.",
      );
      return;
    }

    try {
      const academicYear = `${formData.academic_year}-${formData.academic_year + 1}`;

      // Create payload for API (only 3 parameters expected)
      const payload = {
        academic_period: formData.academic_period,
        academic_semester: parseInt(formData.academic_semester),
        academic_year: academicYear,
      };

      const response = await createAcademic.mutateAsync(payload);

      if (response?.success) {
        toast.success(response.message || "Academic term created successfully");
        resetForm();
        setShowCreateModal(false);
        setErrorMessage("");
      } else {
        toast.error(response?.message || "Failed to create academic term");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to create academic term.");
      toast.error(err.message || "Failed to create academic term");
    }
  };

  const handleEditTerm = async () => {
    if (!selectedTerm) return;

    try {
      const academicYear = `${formData.academic_year}-${parseInt(formData.academic_year) + 1}`;

      // Create payload WITHOUT academic_status
      const payload = {
        academic_id: selectedTerm.academic_id,
        academic_period: formData.academic_period,
        academic_semester: parseInt(formData.academic_semester),
        academic_year: academicYear,
        // academic_status is NOT included here
      };

      // Always include academic_status in payload when it's being changed
      payload.academic_status = formData.academic_status;

      const response = await updateAcademic.mutateAsync(payload);

      if (response?.success) {
        toast.success(response.message || "Academic term updated successfully");
        resetForm();
        setShowEditModal(false);
        setSelectedTerm(null);
        setErrorMessage("");
      } else {
        toast.error(response?.message || "Failed to update academic term");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update academic term.");
      toast.error(err.message || "Failed to update academic term");
    }
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

    // Safely parse the start year from academic_year
    let startYear = new Date().getFullYear(); // default value

    if (term.academic_year && typeof term.academic_year === "string") {
      const yearParts = term.academic_year.split("-");
      if (yearParts.length > 0 && !isNaN(parseInt(yearParts[0]))) {
        startYear = parseInt(yearParts[0]);
      }
    }

    setFormData({
      academic_id: term.academic_id,
      academic_period: term.academic_period,
      academic_semester: term.academic_semester,
      academic_year: startYear,
      academic_status: term.academic_status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      academic_semester: "1st Semester",
      academic_period: "PRELIM",
      academic_year: new Date().getFullYear(),
      academic_status: "active",
    });
    setErrorMessage("");
  };

  const handleYearChange = (year) => {
    setFormData({ ...formData, academic_year: parseInt(year) });
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
    <div className="flex font-sans min-h-screen bg-gray-50 text-gray-900">
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
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 lg:hidden overflow-hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden bg-white p-4 border-b border-gray-200 flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-gray-900 text-2xl p-0 focus:outline-none"
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
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Term Warning */}
          {hasActiveTerm && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-600">
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
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Academic Terms Yet
                </h3>
                <p className="text-gray-600 mb-6">
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Semester
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Academic Year
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicTerms.map((term) => (
                      <tr
                        key={term.academic_id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          {term.academic_semester}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {term.academic_period}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {term.academic_year}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(term.academic_status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(term.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditModal(term)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Create Academic Term
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Semester Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.academic_semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_semester: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>

                  {/* Period Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period
                    </label>
                    <select
                      value={formData.academic_period}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_period: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="PRELIM">PRELIM</option>
                      <option value="MIDTERM">MIDTERM</option>
                      <option value="PREFINALS">PREFINALS</option>
                      <option value="FINALS">FINALS</option>
                    </select>
                  </div>

                  {/* Academic Year Start */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year Start
                    </label>
                    <select
                      value={formData.academic_year}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
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
                    <p className="text-xs text-gray-500 mt-2">
                      Academic Year:{" "}
                      <span className="text-gray-900">
                        {formData.academic_year}-{formData.academic_year + 1}
                      </span>
                    </p>
                  </div>

                  {/* Note about status */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600">
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
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAcademicTerm}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Academic Term
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTerm(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Semester Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.academic_semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_semester: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>

                  {/* Period Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period
                    </label>
                    <select
                      value={formData.academic_period}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_period: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="PRELIM">PRELIM</option>
                      <option value="MIDTERM">MIDTERM</option>
                      <option value="PREFINALS">PREFINALS</option>
                      <option value="FINALS">FINALS</option>
                    </select>
                  </div>

                  {/* Academic Year Start */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year Start
                    </label>
                    <select
                      value={formData.academic_year}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
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
                    <p className="text-xs text-gray-500 mt-2">
                      Academic Year:{" "}
                      <span className="text-gray-900">
                        {formData.academic_year}-{formData.academic_year + 1}
                      </span>
                    </p>
                  </div>

                  {/* Status Dropdown - Only Active and Completed */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.academic_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academic_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    {formData.academic_status === "active" &&
                      hasActiveTerm &&
                      selectedTerm.academic_status !== "active" && (
                        <p className="text-xs text-red-600 mt-1">
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
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditTerm}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
