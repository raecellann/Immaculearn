import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSpaceCategories, setShowSpaceCategories] = useState(false);
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
  
  // Use space context properly at the top level
  const {
    userSpaces,
    courseSpaces,
    friendSpaces,
    isLoading: spaceLoading,
  } = useSpace();
  
  // Combine all spaces from context
  const availableSpaces = useMemo(() => {
    const allSpaces = [
      ...(userSpaces || []),
      ...(courseSpaces || []),
      ...(friendSpaces || [])
    ];
    console.log("Available spaces from context:", allSpaces);
    return allSpaces;
  }, [userSpaces, courseSpaces, friendSpaces]);
  
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize calendar with spaces from context
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        console.log("Initializing calendar with spaces from context...");
        console.log("Available spaces:", availableSpaces);
        console.log("userSpaces:", userSpaces);
        console.log("courseSpaces:", courseSpaces);
        console.log("friendSpaces:", friendSpaces);
        
        // Always show calendar, even if no spaces
        if (availableSpaces.length === 0) {
          console.log("No spaces available in context, showing empty calendar");
          setAllTasks([]);
          setContextError(true);
          setLoading(false);
          return;
        }

        console.log("Found spaces:", availableSpaces);
        setContextError(false);

        // Fetch tasks from all spaces
        const taskPromises = availableSpaces.map((space) =>
          fetch(`/api/spaces/${space.space_uuid}/tasks`)
            .then((res) => {
              if (!res.ok) throw new Error('Failed to fetch tasks');
              return res.json();
            })
            .then((data) => data || [])
            .catch((error) => {
              console.warn(`Failed to fetch tasks for space ${space.space_uuid}:`, error);
              return [];
            }),
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

        console.log("Fetched tasks:", allFetchedTasks);
        setAllTasks(allFetchedTasks);
        setContextError(false);
      } catch (error) {
        console.error("Error initializing calendar:", error);
        setContextError(true);
        // Use mock data as fallback
        setAllTasks([
          {
            id: 1,
            title: "Sample Task",
            description: "This is a sample task since no spaces are available",
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
  }, [availableSpaces, refreshKey]); // Re-run when availableSpaces or refreshKey changes

  // Manual refresh function
  const refreshSpaces = () => {
    setRefreshKey((prev) => prev + 1);
    console.log("Manual refresh triggered");
  };

  // Handle task creation
  const handleTaskCreate = (newTask) => {
    console.log("handleTaskCreate called with:", newTask);
    setAllTasks([...allTasks, newTask]);
  };

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
    return allTasks.filter((task) => {
      const matchesDate = task.dueDate === dateStr;
      const matchesSpace = !selectedSpace || task.spaceId === selectedSpace;
      return matchesDate && matchesSpace;
    });
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
    const filteredTasks = selectedSpace 
      ? allTasks.filter(task => task.spaceId === selectedSpace)
      : allTasks;
    
    switch (statistic) {
      case "total":
        return filteredTasks;
      case "thisweek":
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return filteredTasks.filter((t) => {
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
                key={`${task.id}-${index}`}
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Statistics - Top */}
              <div className="lg:col-span-3">
                {/* Space Filter */}
                <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900">Filter by Space</label>
                        <p className="text-xs text-gray-500">
                          {selectedSpace 
                            ? `Filtering: ${availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space'}`
                            : 'Click to select a space'
                          }
                        </p>
                      </div>
                    </div>
                    {selectedSpace && (
                      <button
                        onClick={() => setSelectedSpace(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                  
                  {/* Space Categories - Hidden by default */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpaceCategories(!showSpaceCategories)}
                      className="w-full text-left p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {selectedSpace 
                            ? '� ' + (availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space')
                            : '🌐 All Spaces'
                          }
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {selectedSpace 
                              ? availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space'
                              : 'All Spaces'
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedSpace 
                              ? 'Click to change space'
                              : 'Click to select a space'
                            }
                          </div>
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${showSpaceCategories ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Categories */}
                    {showSpaceCategories && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                        <div className="p-2">
                          {/* Your Spaces */}
                          {userSpaces && userSpaces.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">👤 Your Spaces</h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {userSpaces.length} space{userSpaces.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {userSpaces.map((space) => (
                                  <button
                                    key={space.space_uuid}
                                    onClick={() => {
                                      setSelectedSpace(space.space_uuid);
                                      setShowSpaceCategories(false);
                                    }}
                                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                                      selectedSpace === space.space_uuid
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">🏠</span>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{space.space_name}</div>
                                        <div className="text-xs text-gray-500">{space.space_type}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Course Spaces */}
                          {courseSpaces && courseSpaces.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">📚 Course Spaces</h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {courseSpaces.length} space{courseSpaces.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {courseSpaces.map((space) => (
                                  <button
                                    key={space.space_uuid}
                                    onClick={() => {
                                      setSelectedSpace(space.space_uuid);
                                      setShowSpaceCategories(false);
                                    }}
                                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                                      selectedSpace === space.space_uuid
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">📖</span>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{space.space_name}</div>
                                        <div className="text-xs text-gray-500">{space.space_type}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Friend Spaces */}
                          {friendSpaces && friendSpaces.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">🤝 Friend Spaces</h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {friendSpaces.length} space{friendSpaces.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {friendSpaces.map((space) => (
                                  <button
                                    key={space.space_uuid}
                                    onClick={() => {
                                      setSelectedSpace(space.space_uuid);
                                      setShowSpaceCategories(false);
                                    }}
                                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                                      selectedSpace === space.space_uuid
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">👥</span>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{space.space_name}</div>
                                        <div className="text-xs text-gray-500">{space.space_type}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* All Spaces Option */}
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setSelectedSpace(null);
                                setShowSpaceCategories(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg border transition-all ${
                                !selectedSpace
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-gray-700">🌐 All Spaces</h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {userSpaces.length + courseSpaces.length + friendSpaces.length} space{(userSpaces.length + courseSpaces.length + friendSpaces.length) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                          {getTasksByStatistic("total").length}
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
                          {getTasksByStatistic("thisweek").length}
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
