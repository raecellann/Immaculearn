import React, { useState, useEffect, useRef } from "react";
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
import CreateTaskFlowModal from "../component/CreateTaskFlowModal";
import ErrorBoundary from "../component/ErrorBoundary";

const CalendarPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextError, setContextError] = useState(false);
  const [showCreateTaskFlow, setShowCreateTaskFlow] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    type: "Assignment",
  });
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const spacesRef = useRef([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Manual refresh function
  const refreshSpaces = () => {
    setRefreshKey((prev) => prev + 1);
    console.log("Manual refresh triggered"); // Debug log
  };

  // Handle space selection
  const handleSpaceSelect = (spaceName) => {
    console.log("handleSpaceSelect called with:", spaceName);
    setSelectedSpace(spaceName);
    setShowCreateDropdown(false);
    setShowCreateModal(true);
    console.log(
      "After handleSpaceSelect - selectedSpace:",
      spaceName,
      "showCreateModal: true",
    );
  };

  // Handle task creation
  const handleTaskCreate = (newTask) => {
    console.log("handleTaskCreate called with:", newTask);
    setAllTasks([...allTasks, newTask]);
  };

  // Try to get space context, but handle errors gracefully
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        // First, let's set some basic spaces to ensure calendar works
        console.log("Initializing calendar with basic spaces..."); // Debug log

        // Start with mock spaces to ensure calendar renders
        const initialSpaces = [
          {
            space_uuid: "arlecchino-space",
            space_name: "Arlecchino Space",
            space_type: "User",
            members: [{ user_id: 1, role: "admin" }],
          },
          {
            space_uuid: "sample-space",
            space_name: "Sample Space",
            space_type: "Course",
            members: [{ user_id: 1, role: "professor" }],
          },
        ];

        // Try to fetch real spaces from API
        try {
          const [userSpacesResponse, courseSpacesResponse] =
            await Promise.allSettled([
              fetch("/api/spaces/user-spaces")
                .then((res) => res.json())
                .catch(() => ({ data: [] })),
              fetch("/api/spaces/course-spaces")
                .then((res) => res.json())
                .catch(() => ({ data: [] })),
            ]);

          const userSpaces =
            userSpacesResponse.status === "fulfilled"
              ? userSpacesResponse.value.data || []
              : [];
          const courseSpaces =
            courseSpacesResponse.status === "fulfilled"
              ? courseSpacesResponse.value.data || []
              : [];

          console.log("API User spaces response:", userSpacesResponse); // Debug log
          console.log("API Course spaces response:", courseSpacesResponse); // Debug log
          console.log("API User spaces:", userSpaces); // Debug log
          console.log("API Course spaces:", courseSpaces); // Debug log

          const allSpaces = [...userSpaces, ...courseSpaces];

          if (allSpaces.length > 0) {
            // Use real spaces if API worked
            spacesRef.current = allSpaces;
            setAvailableSpaces(allSpaces);
            console.log("Using real spaces from API:", allSpaces); // Debug log
          } else {
            // Use initial spaces if API failed
            spacesRef.current = initialSpaces;
            setAvailableSpaces(initialSpaces);
            console.log("Using initial spaces:", initialSpaces); // Debug log
          }
        } catch (apiError) {
          console.warn("API failed, using initial spaces:", apiError); // Debug log
          spacesRef.current = initialSpaces;
          setAvailableSpaces(initialSpaces);
        }

        const finalSpaces =
          availableSpaces.length > 0 ? availableSpaces : initialSpaces;
        console.log("Final spaces for calendar:", finalSpaces); // Debug log

        // Use regular import for space context
        const spaceContext = useSpace();

        const userSpaces = spaceContext.userSpaces || [];
        const courseSpaces = spaceContext.courseSpaces || [];
        const friendSpaces = spaceContext.friendSpaces || [];
        const allSpaces = [...userSpaces, ...courseSpaces, ...friendSpaces];

        if (allSpaces.length === 0) {
          setAllTasks([]);
          setLoading(false);
          return;
        }

        // Fetch tasks from all spaces
        const taskPromises = allSpaces.map((space) =>
          fetch(`/api/spaces/${space.space_uuid}/tasks`)
            .then((res) => res.json())
            .catch(() => []),
        );

        const taskResults = await Promise.all(taskPromises);
        const allFetchedTasks = taskResults.flat().map((task) => ({
          id: task.id,
          title: task.task_title,
          description: task.task_instruction || "",
          dueDate: task.task_due
            ? new Date(task.task_due).toISOString().split("T")[0]
            : "",
          dueTime: task.task_due
            ? new Date(task.task_due).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          priority: "medium",
          status: task.task_status,
          assignedBy: "Admin",
          category: "Academic",
          spaceId: task.space_id,
        }));

        setAllTasks(allFetchedTasks);
        setContextError(false);
      } catch (error) {
        console.warn(
          "SpaceContext not available, using fallback mode:",
          error.message,
        );
        setContextError(true);
        // Use mock data as fallback
        setAllTasks([
          {
            id: 1,
            title: "Sample Task",
            description:
              "This is a sample task since SpaceContext is not available",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "11:59 PM",
            priority: "medium",
            status: "pending",
            assignedBy: "Admin",
            category: "Academic",
            spaceId: "fallback",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    initializeCalendar();
  }, [refreshKey]); // Re-run when refreshKey changes

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return allTasks.filter((task) => task.dueDate === dateStr);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Academic":
        return "bg-blue-500";
      case "Technical":
        return "bg-purple-500";
      case "Research":
        return "bg-green-500";
      case "Development":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTasksByStatistic = (statistic) => {
    switch (statistic) {
      case "total":
        return allTasks;
      case "thisweek":
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return allTasks.filter((t) => {
          const taskDate = new Date(t.dueDate);
          return taskDate >= today && taskDate <= weekFromNow;
        });
      default:
        return [];
    }
  };

  const getStatisticTitle = (statistic) => {
    switch (statistic) {
      case "total":
        return "All Tasks";
      case "thisweek":
        return "This Week's Tasks";
      default:
        return "Tasks";
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
          className="h-20 sm:h-24 border border-gray-200"
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
      const dayTasks = getTasksForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setSelectedStatistic(null);
          }}
          className={`h-20 sm:h-24 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isToday ? "bg-blue-50" : ""
          } ${isSelected ? "ring-2 ring-blue-500" : ""} hover:bg-gray-50`}
        >
          <div className="text-xs font-semibold text-gray-700 mb-1">{day}</div>
          <div className="space-y-1">
            {dayTasks.slice(0, 2).map((task, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(task.priority)}`}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayTasks.length - 2} more
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

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        <div className="lg:hidden bg-white p-4 border-b border-gray-200 flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-gray-700 text-2xl p-0"
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold text-gray-900">Activity Calendar</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track all activity due dates and manage your class schedules
          </p>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Activity Calendar
            </h1>
            <p className="text-gray-600">
              {contextError
                ? "Showing sample data (SpaceContext not available)"
                : "Track all activity due dates and manage your class schedules"}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : allTasks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Tasks Available
                </h3>
                <p className="text-gray-500 mb-4">
                  {contextError
                    ? "SpaceContext is not available. Please check your setup."
                    : "No tasks have been assigned in your spaces yet."}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Tasks will appear here once they are created.
                </p>
                <button
                  onClick={() => setShowCreateTaskFlow(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                >
                  <FiPlus className="inline mr-2" size={14} />
                  Create Your First Task
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Statistics - Top */}
              <div className="lg:col-span-3">
                {/* Create Activity Button - Top */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowCreateTaskFlow(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiPlus size={14} />
                      Create New Task
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic("total")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {allTasks.length}
                        </div>
                        <div className="text-xs text-gray-600">Total Tasks</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic("thisweek")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const today = new Date();
                            const weekFromNow = new Date(
                              today.getTime() + 7 * 24 * 60 * 60 * 1000,
                            );
                            return allTasks.filter((t) => {
                              const taskDate = new Date(t.dueDate);
                              return (
                                taskDate >= today && taskDate <= weekFromNow
                              );
                            }).length;
                          })()}
                        </div>
                        <div className="text-xs text-gray-600">This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Calendar Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiChevronLeft className="text-gray-600" size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h2>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiChevronRight className="text-gray-600" size={20} />
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
                            className="text-center text-xs font-semibold text-gray-600 py-2"
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      {selectedStatistic
                        ? getStatisticTitle(selectedStatistic)
                        : `Tasks for ${selectedDate.toLocaleDateString()}`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStatistic
                        ? `${getTasksByStatistic(selectedStatistic).length} task${getTasksByStatistic(selectedStatistic).length !== 1 ? "s" : ""} found`
                        : `${selectedDateTasks.length} task${selectedDateTasks.length !== 1 ? "s" : ""} assigned`}
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {selectedStatistic ? (
                      getTasksByStatistic(selectedStatistic).length === 0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar
                            className="mx-auto text-gray-400 mb-3"
                            size={32}
                          />
                          <p className="text-gray-500">No tasks found</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {getTasksByStatistic(selectedStatistic).map(
                            (task) => (
                              <div
                                key={task.id}
                                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 ${getCategoryColor(task.category)}`}
                                  ></div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {task.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {task.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                                      >
                                        {task.priority}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        <FiClock
                                          className="inline mr-1"
                                          size={10}
                                        />
                                        {task.dueTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-xs text-gray-500">
                                        Assigned by: {task.assignedBy}
                                      </p>
                                      <span className="text-xs text-gray-500">
                                        Due:{" "}
                                        {new Date(
                                          task.dueDate,
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
                    ) : selectedDateTasks.length === 0 ? (
                      <div className="p-8 text-center">
                        <FiCalendar
                          className="mx-auto text-gray-400 mb-3"
                          size={32}
                        />
                        <p className="text-gray-500">No tasks for this date</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {selectedDateTasks.map((task) => (
                          <div
                            key={task.id}
                            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${getCategoryColor(task.category)}`}
                              ></div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {task.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {task.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    <FiClock
                                      className="inline mr-1"
                                      size={10}
                                    />
                                    {task.dueTime}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Assigned by: {task.assignedBy}
                                </p>
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

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* CREATE TASK FLOW MODAL */}
      <ErrorBoundary>
        <CreateTaskFlowModal
          show={showCreateTaskFlow}
          setShow={setShowCreateTaskFlow}
          availableSpaces={availableSpaces}
          contextError={contextError}
          refreshSpaces={refreshSpaces}
          onTaskCreate={handleTaskCreate}
        />
      </ErrorBoundary>
    </div>
  );
};

export default CalendarPage;
