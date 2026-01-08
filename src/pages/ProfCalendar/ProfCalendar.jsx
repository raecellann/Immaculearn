import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import { FiCalendar, FiClock, FiCheck, FiAlertCircle, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiEdit } from "react-icons/fi";

const ProfCalendarPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatistic, setSelectedStatistic] = useState(null);

  // Mock data for professor activities with due dates
  const mockActivities = [
    {
      id: 1,
      title: "Thesis Chapter 1 Submission",
      description: "Students submit their first thesis chapter",
      dueDate: "2026-01-15",
      dueTime: "11:59 PM",
      priority: "high",
      status: "pending",
      subject: "Thesis and Research",
      type: "Assignment",
      studentsCount: 32,
      yearLevel: "4th Year"
    },
    {
      id: 2,
      title: "Operating System Midterm Exam",
      description: "Covers processes, memory management, and file systems",
      dueDate: "2026-01-18",
      dueTime: "2:00 PM",
      priority: "high",
      status: "pending",
      subject: "Operating System",
      type: "Exam",
      studentsCount: 40,
      yearLevel: "3rd Year"
    },
    {
      id: 3,
      title: "Data Structure Lab Activity",
      description: "Binary tree implementation and traversal algorithms",
      dueDate: "2026-01-12",
      dueTime: "5:00 PM",
      priority: "medium",
      status: "pending",
      subject: "Data Structure",
      type: "Lab Activity",
      studentsCount: 41,
      yearLevel: "1st Year"
    },
    {
      id: 4,
      title: "MMW Reflection Paper",
      description: "Students write reflection on contemporary world issues",
      dueDate: "2026-01-20",
      dueTime: "11:59 PM",
      priority: "low",
      status: "pending",
      subject: "Understanding the Self",
      type: "Paper",
      studentsCount: 28,
      yearLevel: "1st Year"
    },
    {
      id: 5,
      title: "Physical Education Practical Exam",
      description: "Basketball skills and sportsmanship assessment",
      dueDate: "2026-01-22",
      dueTime: "10:00 AM",
      priority: "medium",
      status: "pending",
      subject: "Physical Education 2",
      type: "Practical Exam",
      studentsCount: 45,
      yearLevel: "2nd Year"
    },
    {
      id: 6,
      title: "Businteg Case Study Analysis",
      description: "Business integration case study presentation",
      dueDate: "2026-01-25",
      dueTime: "3:00 PM",
      priority: "high",
      status: "pending",
      subject: "Businteg",
      type: "Presentation",
      studentsCount: 35,
      yearLevel: "4th Year"
    },
    {
      id: 7,
      title: "Modtech Project Demo",
      description: "Modern technology project demonstration",
      dueDate: "2026-01-28",
      dueTime: "1:00 PM",
      priority: "medium",
      status: "pending",
      subject: "Modtech",
      type: "Project Demo",
      studentsCount: 30,
      yearLevel: "4th Year"
    },
    {
      id: 8,
      title: "CS-ELEC 2 Coding Challenge",
      description: "Advanced programming problem solving",
      dueDate: "2026-01-30",
      dueTime: "4:00 PM",
      priority: "medium",
      status: "pending",
      subject: "CS-ELEC 2",
      type: "Coding Challenge",
      studentsCount: 28,
      yearLevel: "3rd Year"
    }
  ];

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      setActivities(mockActivities);
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

  const getActivitiesForDate = (date) => {
    const dateStr = formatDate(date);
    return activities.filter(activity => activity.dueDate === dateStr);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Thesis and Research': return 'bg-purple-500';
      case 'Operating System': return 'bg-blue-500';
      case 'Data Structure': return 'bg-green-500';
      case 'Understanding the Self': return 'bg-pink-500';
      case 'Physical Education 2': return 'bg-orange-500';
      case 'Businteg': return 'bg-indigo-500';
      case 'Modtech': return 'bg-teal-500';
      case 'CS-ELEC 2': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Assignment': return '📝';
      case 'Exam': return '📋';
      case 'Lab Activity': return '🔬';
      case 'Paper': return '📄';
      case 'Practical Exam': return '⚽';
      case 'Presentation': return '🎯';
      case 'Project Demo': return '💻';
      case 'Coding Challenge': return '💡';
      default: return '📚';
    }
  };

  const getActivitiesByStatistic = (statistic) => {
    switch (statistic) {
      case 'total':
        return activities;
      case 'high':
        return activities.filter(a => a.priority === 'high');
      case 'upcoming':
        return activities.filter(a => new Date(a.dueDate) >= new Date());
      case 'overdue':
        return activities.filter(a => new Date(a.dueDate) < new Date());
      default:
        return [];
    }
  };

  const getStatisticTitle = (statistic) => {
    switch (statistic) {
      case 'total': return 'All Activities';
      case 'high': return 'High Priority Activities';
      case 'upcoming': return 'Upcoming Activities';
      case 'overdue': return 'Overdue Activities';
      default: return 'Activities';
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
      const dayActivities = getActivitiesForDate(date);
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
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`}
        >
          <div className="text-xs font-semibold text-gray-700 mb-1">{day}</div>
          <div className="space-y-1">
            {dayActivities.slice(0, 2).map((activity, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(activity.priority)}`}
              >
                {activity.title}
              </div>
            ))}
            {dayActivities.length > 2 && (
              <div className="text-xs text-gray-500">+{dayActivities.length - 2} more</div>
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

  const selectedDateActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
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
        <Sidebar />
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
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Activity Calendar</h1>
            <p className="text-gray-600 mt-1">Track all activity due dates and manage your class schedules</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Statistics - Top */}
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
                        <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
                        <div className="text-xs text-gray-600">Total Activities</div>
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
                          {activities.filter(a => a.priority === 'high').length}
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
                          {activities.filter(a => new Date(a.dueDate) >= new Date()).length}
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
                          {activities.filter(a => new Date(a.dueDate) < new Date()).length}
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

              {/* Activity List Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      {selectedStatistic ? getStatisticTitle(selectedStatistic) : `Activities for ${selectedDate.toLocaleDateString()}`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStatistic 
                        ? `${getActivitiesByStatistic(selectedStatistic).length} activit${getActivitiesByStatistic(selectedStatistic).length !== 1 ? 'ies' : 'y'} found`
                        : `${selectedDateActivities.length} activit${selectedDateActivities.length !== 1 ? 'ies' : 'y'} scheduled`
                      }
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {selectedStatistic ? (
                      getActivitiesByStatistic(selectedStatistic).length === 0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                          <p className="text-gray-500">No activities found</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {getActivitiesByStatistic(selectedStatistic).map(activity => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{getTypeIcon(activity.type)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      <FiClock className="inline mr-1" size={10} />
                                      {activity.dueTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                      {activity.subject} • {activity.yearLevel}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(activity.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                      {activity.studentsCount} students
                                    </p>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                      <FiEdit size={10} />
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      selectedDateActivities.length === 0 ? (
                        <div className="p-8 text-center">
                          <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                          <p className="text-gray-500">No activities for this date</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {selectedDateActivities.map(activity => (
                            <div key={activity.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{getTypeIcon(activity.type)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      <FiClock className="inline mr-1" size={10} />
                                      {activity.dueTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                      {activity.subject} • {activity.yearLevel}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                      {activity.studentsCount} students
                                    </p>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                      <FiEdit size={10} />
                                      Edit
                                    </button>
                                  </div>
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
    </div>
  );
};

export default ProfCalendarPage;
