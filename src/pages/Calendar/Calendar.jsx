import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { FiCalendar, FiClock, FiCheck, FiAlertCircle, FiMenu, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Logout from "../component/logout";

const CalendarPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatistic, setSelectedStatistic] = useState(null);

  // Mock data for pending tasks assigned by admin
  const mockTasks = [
    {
      id: 1,
      title: "Submit Thesis Chapter 2",
      description: "Complete the participation section with proper citations",
      dueDate: "2026-01-15",
      dueTime: "11:59 PM",
      priority: "high",
      status: "pending",
      assignedBy: "Admin",
      category: "Academic"
    },
    {
      id: 2,
      title: "Review Database Design",
      description: "Check the ER diagram and relationships",
      dueDate: "2026-01-12",
      dueTime: "5:00 PM",
      priority: "medium",
      status: "pending",
      assignedBy: "Admin",
      category: "Technical"
    },
    {
      id: 3,
      title: "Complete Survey Responses",
      description: "Submit at least 20 survey responses for prototype testing",
      dueDate: "2026-01-18",
      dueTime: "3:00 PM",
      priority: "low",
      status: "pending",
      assignedBy: "Admin",
      category: "Research"
    },
    {
      id: 4,
      title: "Frontend Development",
      description: "Implement the user dashboard with responsive design",
      dueDate: "2026-01-20",
      dueTime: "11:59 PM",
      priority: "high",
      status: "pending",
      assignedBy: "Admin",
      category: "Development"
    },
    {
      id: 5,
      title: "Backend API Integration",
      description: "Connect frontend with backend APIs for user authentication",
      dueDate: "2026-01-22",
      dueTime: "6:00 PM",
      priority: "medium",
      status: "pending",
      assignedBy: "Admin",
      category: "Development"
    }
  ];

  useEffect(() => {
    // Simulate loading tasks
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Academic': return 'bg-blue-500';
      case 'Technical': return 'bg-purple-500';
      case 'Research': return 'bg-green-500';
      case 'Development': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTasksByStatistic = (statistic) => {
    switch (statistic) {
      case 'total':
        return tasks;
      case 'high':
        return tasks.filter(t => t.priority === 'high');
      case 'upcoming':
        return tasks.filter(t => new Date(t.dueDate) >= new Date());
      case 'overdue':
        return tasks.filter(t => new Date(t.dueDate) < new Date());
      default:
        return [];
    }
  };

  const getStatisticTitle = (statistic) => {
    switch (statistic) {
      case 'total': return 'All Tasks';
      case 'high': return 'High Priority Tasks';
      case 'upcoming': return 'Upcoming Tasks';
      case 'overdue': return 'Overdue Tasks';
      default: return 'Tasks';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24 border border-gray-200"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setSelectedStatistic(null); // Clear statistic selection when date is clicked
          }}
          className={`h-20 sm:h-24 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`}
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
              <div className="text-xs text-gray-500">+{dayTasks.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
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
          <h1 className="text-xl font-bold text-gray-900">Task Calendar</h1>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Task Calendar</h1>
            <p className="text-gray-600 mt-1">Track all pending tasks assigned by admin</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Statistics - Moved to Top */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div 
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic('total')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                        <div className="text-xs text-gray-600">Total Tasks</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic('high')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FiAlertCircle className="text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {tasks.filter(t => t.priority === 'high').length}
                        </div>
                        <div className="text-xs text-gray-600">High Priority</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic('upcoming')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {tasks.filter(t => new Date(t.dueDate) >= new Date()).length}
                        </div>
                        <div className="text-xs text-gray-600">Upcoming</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStatistic('overdue')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCheck className="text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {tasks.filter(t => new Date(t.dueDate) < new Date()).length}
                        </div>
                        <div className="text-xs text-gray-600">Overdue</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Calendar Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiChevronLeft className="text-gray-600" size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
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
                      {selectedStatistic ? getStatisticTitle(selectedStatistic) : `Tasks for ${selectedDate.toLocaleDateString()}`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStatistic 
                        ? `${getTasksByStatistic(selectedStatistic).length} task${getTasksByStatistic(selectedStatistic).length !== 1 ? 's' : ''} found`
                        : `${selectedDateTasks.length} task${selectedDateTasks.length !== 1 ? 's' : ''} assigned`
                      }
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {selectedStatistic ? (
                      getTasksByStatistic(selectedStatistic).length === 0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                          <p className="text-gray-500">No tasks found</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {getTasksByStatistic(selectedStatistic).map(task => (
                            <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getCategoryColor(task.category)}`}></div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      <FiClock className="inline mr-1" size={10} />
                                      {task.dueTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                      Assigned by: {task.assignedBy}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      selectedDateTasks.length === 0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                          <p className="text-gray-500">No tasks for this date</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {selectedDateTasks.map(task => (
                            <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getCategoryColor(task.category)}`}></div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      <FiClock className="inline mr-1" size={10} />
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
                      )
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
    </div>
  );
};

export default CalendarPage;