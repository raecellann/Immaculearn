import React, { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../component/sidebar";
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiPlus,
} from "react-icons/fi";
import Logout from "../component/logout";
import { useSpace } from "../../contexts/space/useSpace";
import { useTasks } from "../../hooks/useTasks";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import CreateTaskFlowModal from "../component/CreateTaskFlowModal";
import ErrorBoundary from "../component/ErrorBoundary";

const CalendarPage = () => {
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    currentSpace,
    allUploadedTasks,
    allUploadedTasksLoading,
  } = useSpace();

  const allSpaces = [
    ...(userSpaces || []),
    ...(courseSpaces || []),
    ...(friendSpaces || []),
  ];

  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [showCreateTaskFlow, setShowCreateTaskFlow] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [showSpaceCategories, setShowSpaceCategories] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    type: "Assignment",
  });
  const [contextError, setContextError] = useState(false);
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const spacesRef = useRef([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Manual refresh function
  const refreshSpaces = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handler for when a new task is created from the modal
  const handleTaskCreate = (newTask) => {
    // We just need to trigger a refresh of the tasks
    refreshSpaces();
  };

  const handleCancelCreate = () => {
    setShowCreateTaskFlow(false);
    setNewActivity({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      priority: "medium",
      type: "Assignment",
    });
    setSelectedSpace("");
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const getActivitiesForDate = (date) => {
    const dateStr = formatDate(date);
    return allUploadedTasks?.filter((task) => {
      if (!task.due_date) return false;
      // Handle different date formats - ensure consistent comparison
      // console.log(task.due_date);
      const taskDateObj = new Date(task.due_date);
      const taskDueDate =
        taskDateObj.getFullYear() +
        "-" +
        String(taskDateObj.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(taskDateObj.getDate()).padStart(2, "0");

      return taskDueDate === dateStr;
    });
  };

  // Map Task data to calendar activity structure
  const mapTaskToActivity = (task) => {
    return {
      id: task.task_id,
      title: task.task_title,
      description: task.task_instruction || "",
      dueDate: new Date(task.due_date).toISOString().split("T")[0],
      dueTime: new Date(task.due_date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      priority: "medium", // Default priority since Task interface doesn't have this field
      status: task.has_answered ? "completed" : "pending",
      subject:
        allSpaces.find((s) => s.space_id === task.space_id)?.space_name ||
        "Unknown Space",
      type: "Assignment", // Default type since Task interface doesn't have this field
      yearLevel:
        allSpaces.find((s) => s.space_id === task.space_id)?.space_yr_lvl ||
        "N/A",
      spaceId: allSpaces.find((s) => s.space_id === task.space_id)?.space_id,
    };
  };

  const getSubjectColor = (subject) => {
    // Generate colors dynamically based on subject name
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-gray-500",
    ];

    const index =
      subject.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Assignment":
        return "📝";
      case "Exam":
        return "📋";
      case "Lab Activity":
        return "🔬";
      case "Paper":
        return "📄";
      case "Practical Exam":
        return "⚽";
      case "Presentation":
        return "🎯";
      case "Project Demo":
        return "💻";
      case "Coding Challenge":
        return "💡";
      default:
        return "📚";
    }
  };

  const getActivitiesByStatistic = (statistic) => {
    const allActivities = allUploadedTasks?.map(mapTaskToActivity) || [];
    switch (statistic) {
      case "total":
        return allActivities;
      case "thisweek":
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return allActivities.filter((a) => {
          const activityDate = new Date(a.dueDate);
          return activityDate >= today && activityDate <= weekFromNow;
        });
      default:
        return [];
    }
  };

  const getStatisticTitle = (statistic) => {
    switch (statistic) {
      case "total":
        return "All Activities";
      case "thisweek":
        return "This Week's Activities";
      default:
        return "Activities";
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-20 sm:h-24 border"
          style={{ borderColor: currentColors.border }}
        ></div>,
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const dayTasks = getActivitiesForDate(date);
      const dayActivities = dayTasks.map(mapTaskToActivity);

      // console.log(dayActivities);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setSelectedStatistic(null);
          }}
          className={`h-20 sm:h-24 border p-1 cursor-pointer transition-colors ${
            isToday ? (isDarkMode ? "bg-blue-900" : "bg-blue-50") : ""
          } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
          style={{
            borderColor: currentColors.border,
            backgroundColor:
              isToday && !isSelected
                ? isDarkMode
                  ? "#1e3a8a"
                  : "#dbeafe"
                : isSelected
                  ? isDarkMode
                    ? "#1e40af"
                    : "#3b82f6"
                  : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isToday && !isSelected) {
              e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.12)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isToday && !isSelected) {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: currentColors.text }}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayActivities.slice(0, 2).map((activity, index) => (
              <div
                key={index}
                className="text-xs px-1 py-0.5 rounded truncate bg-blue-100 text-blue-800"
              >
                {activity.title}
              </div>
            ))}
            {dayActivities.length > 2 && (
              <div
                className="text-xs"
                style={{ color: currentColors.textSecondary }}
              >
                +{dayActivities.length - 2} more
              </div>
            )}
          </div>
        </div>,
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const changeMonth = (direction) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1,
      ),
    );
  };

  const selectedDateTasks = getActivitiesForDate(selectedDate);
  const selectedDateActivities = selectedDateTasks.map(mapTaskToActivity);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: currentColors.background }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= MOBILE HEADER ================= */}
        <div
          className="lg:hidden p-4 border-b flex items-center gap-4"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: currentColors.text }}
          >
            Activity Calendar
          </h1>
          <p
            className="text-xs mt-1"
            style={{ color: currentColors.textSecondary }}
          >
            Your academic calendar - track assignments, deadlines, and stay
            organized.{" "}
          </p>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: currentColors.text }}
            >
              Activity Calendar
            </h1>
            <p style={{ color: currentColors.textSecondary }}>
              {contextError
                ? "Showing sample data (SpaceContext not available)"
                : "Your academic calendar - track assignments, deadlines, and stay organized."}
            </p>
          </div>

          {allUploadedTasksLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Statistics - Top */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                    }}
                    onClick={() => setSelectedStatistic("total")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: currentColors.text }}
                        >
                          {allUploadedTasks?.length || 0}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Total Activities
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: currentColors.surface,
                      borderColor: currentColors.border,
                    }}
                    onClick={() => setSelectedStatistic("thisweek")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-yellow-600" />
                      </div>
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: currentColors.text }}
                        >
                          {(() => {
                            const today = new Date();
                            const weekFromNow = new Date(
                              today.getTime() + 7 * 24 * 60 * 60 * 1000,
                            );
                            return (
                              allUploadedTasks?.filter((task) => {
                                if (!task.due_date) return false;
                                const taskDate = new Date(task.due_date)
                                  .toISOString()
                                  .split("T")[0];
                                return (
                                  taskDate >= today && taskDate <= weekFromNow
                                );
                              }).length || 0
                            );
                          })()}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: currentColors.textSecondary }}
                        >
                          This Week
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-xl shadow-sm border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border,
                  }}
                >
                  {/* Calendar Header */}
                  <div
                    className="p-4 border-b flex items-center justify-between"
                    style={{ borderColor: currentColors.border }}
                  >
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = currentColors.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <FiChevronLeft
                        size={20}
                        style={{ color: currentColors.textSecondary }}
                      />
                    </button>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: currentColors.text }}
                    >
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h2>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = currentColors.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <FiChevronRight
                        size={20}
                        style={{ color: currentColors.textSecondary }}
                      />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-4">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-semibold py-2"
                            style={{ color: currentColors.textSecondary }}
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendar()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task List Section */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-xl shadow-sm border"
                  style={{
                    backgroundColor: currentColors.surface,
                    borderColor: currentColors.border,
                  }}
                >
                  <div
                    className="p-4 border-b"
                    style={{ borderColor: currentColors.border }}
                  >
                    <h3
                      className="font-semibold"
                      style={{ color: currentColors.text }}
                    >
                      {selectedStatistic
                        ? getStatisticTitle(selectedStatistic)
                        : `Activities for ${selectedDate.toLocaleDateString()}`}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: currentColors.textSecondary }}
                    >
                      {selectedStatistic
                        ? `${getActivitiesByStatistic(selectedStatistic).length} activit${getActivitiesByStatistic(selectedStatistic).length !== 1 ? "ies" : "y"} found`
                        : `${selectedDateActivities.length} activit${selectedDateActivities.length !== 1 ? "ies" : "y"} scheduled`}
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {selectedStatistic ? (
                      getActivitiesByStatistic(selectedStatistic).length ===
                      0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar
                            className="mx-auto mb-3"
                            size={32}
                            style={{ color: currentColors.textSecondary }}
                          />
                          <p style={{ color: currentColors.textSecondary }}>
                            No activities found
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {getActivitiesByStatistic(selectedStatistic).map(
                            (activity) => (
                              <div
                                key={activity.id}
                                className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                                style={{ borderColor: currentColors.border }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}
                                  ></div>
                                  <div className="flex-1">
                                    <div className="flex items-start gap-2">
                                      <span className="text-lg">
                                        {getTypeIcon(activity.type)}
                                      </span>
                                      <div className="flex-1">
                                        <h4
                                          className="font-medium text-sm"
                                          style={{ color: currentColors.text }}
                                        >
                                          {activity.title}
                                        </h4>
                                        <p
                                          className="text-xs mt-1"
                                          style={{
                                            color: currentColors.textSecondary,
                                          }}
                                        >
                                          {activity.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: currentColors.textSecondary,
                                        }}
                                      >
                                        <FiClock
                                          className="inline mr-1"
                                          size={10}
                                        />
                                        {activity.dueTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p
                                        className="text-xs"
                                        style={{
                                          color: currentColors.textSecondary,
                                        }}
                                      >
                                        {activity.subject}
                                      </p>
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: currentColors.textSecondary,
                                        }}
                                      >
                                        Due:{" "}
                                        {new Date(
                                          activity.dueDate,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )
                    ) : selectedDateActivities.length === 0 ? (
                      <div className="p-8 text-center">
                        <FiCalendar
                          className="mx-auto mb-3"
                          size={32}
                          style={{ color: currentColors.textSecondary }}
                        />
                        <p style={{ color: currentColors.textSecondary }}>
                          No activities for this date
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {selectedDateActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                            style={{ borderColor: currentColors.border }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">
                                    {getTypeIcon(activity.type)}
                                  </span>
                                  <div className="flex-1">
                                    <h4
                                      className="font-medium text-sm"
                                      style={{ color: currentColors.text }}
                                    >
                                      {activity.title}
                                    </h4>
                                    <p
                                      className="text-xs mt-1"
                                      style={{
                                        color: currentColors.textSecondary,
                                      }}
                                    >
                                      {activity.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className="text-xs"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    <FiClock
                                      className="inline mr-1"
                                      size={10}
                                    />
                                    {activity.dueTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    {activity.subject}
                                  </p>
                                  <span
                                    className="text-xs"
                                    style={{
                                      color: currentColors.textSecondary,
                                    }}
                                  >
                                    Due:{" "}
                                    {new Date(
                                      activity.dueDate,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TASK FLOW MODAL */}
      <ErrorBoundary>
        <CreateTaskFlowModal
          show={showCreateTaskFlow}
          setShow={setShowCreateTaskFlow}
          availableSpaces={allSpaces}
          contextError={contextError}
          refreshSpaces={refreshSpaces}
          onTaskCreate={handleTaskCreate}
        />
      </ErrorBoundary>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default CalendarPage;
