import React, { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../component/profsidebar";
import { FiCalendar, FiClock, FiCheck, FiAlertCircle, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiEdit, FiPlus } from "react-icons/fi";
import Logout from "../component/logout";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import CreateTaskFlowModal from "../component/CreateTaskFlowModal";

const ProfCalendarPage = () => {
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState([]);
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
    type: "Assignment"
  });
  const [contextError, setContextError] = useState(false);
  const [availableSpaces, setAvailableSpaces] = useState([]);
  const spacesRef = useRef([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Manual refresh function
  const refreshSpaces = () => {
    setRefreshKey(prev => prev + 1);
    console.log('Manual refresh triggered'); // Debug log
  };

  // Try to get space context, but handle errors gracefully
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        // First, let's set some basic spaces to ensure calendar works
        console.log('Initializing calendar with basic spaces...'); // Debug log
        
        // Start with mock spaces to ensure calendar renders
        const initialSpaces = [
          {
            space_uuid: "arlecchino-space",
            space_name: "Arlecchino Space",
            space_type: "User",
            members: [{ user_id: 1, role: "admin" }]
          },
          {
            space_uuid: "sample-space", 
            space_name: "Sample Space",
            space_type: "Course",
            members: [{ user_id: 1, role: "professor" }]
          }
        ];
        
        // Try to fetch real spaces from API
        try {
          const [userSpacesResponse, courseSpacesResponse] = await Promise.allSettled([
            fetch('/api/spaces/user-spaces').then(res => res.json()).catch(() => ({ data: [] })),
            fetch('/api/spaces/course-spaces').then(res => res.json()).catch(() => ({ data: [] }))
          ]);
          
          const userSpaces = userSpacesResponse.status === 'fulfilled' ? userSpacesResponse.value.data || [] : [];
          const courseSpaces = courseSpacesResponse.status === 'fulfilled' ? courseSpacesResponse.value.data || [] : [];
          
          console.log('API User spaces response:', userSpacesResponse); // Debug log
          console.log('API Course spaces response:', courseSpacesResponse); // Debug log
          console.log('API User spaces:', userSpaces); // Debug log
          console.log('API Course spaces:', courseSpaces); // Debug log
          
          const allSpaces = [...userSpaces, ...courseSpaces];
          
          if (allSpaces.length > 0) {
            // Use real spaces if API worked
            spacesRef.current = allSpaces;
            setAvailableSpaces(allSpaces);
            console.log('Using real spaces from API:', allSpaces); // Debug log
          } else {
            // Use initial spaces if API failed
            spacesRef.current = initialSpaces;
            setAvailableSpaces(initialSpaces);
            console.log('Using initial spaces:', initialSpaces); // Debug log
          }
        } catch (apiError) {
          console.warn('API failed, using initial spaces:', apiError); // Debug log
          spacesRef.current = initialSpaces;
          setAvailableSpaces(initialSpaces);
        }
        
        const finalSpaces = availableSpaces.length > 0 ? availableSpaces : initialSpaces;
        console.log('Final spaces for calendar:', finalSpaces); // Debug log

        // Set some basic activities to ensure calendar shows content
        const basicActivities = [
          {
            id: 1,
            title: "Sample Activity",
            description: "This is a sample activity for testing",
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: "11:59 PM",
            priority: "medium",
            status: "pending",
            subject: "Arlecchino Space",
            type: "Assignment",
            studentsCount: 25,
            yearLevel: "4th Year",
            spaceId: "arlecchino-space"
          }
        ];
        
        setActivities(basicActivities);
        setContextError(false);
        setLoading(false);
        
      } catch (error) {
        console.error('Calendar initialization error:', error); // Debug log
        // Even if everything fails, show basic calendar
        const fallbackSpaces = [
          {
            space_uuid: "fallback-space",
            space_name: "Arlecchino Space",
            space_type: "User",
            members: [{ user_id: 1, role: "admin" }]
          }
        ];
        spacesRef.current = fallbackSpaces;
        setAvailableSpaces(fallbackSpaces);
        setActivities([{
          id: 1,
          title: "Sample Activity",
          description: "Calendar fallback activity",
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: "11:59 PM",
          priority: "medium",
          status: "pending",
          subject: "Arlecchino Space",
          type: "Assignment",
          studentsCount: 25,
          yearLevel: "4th Year",
          spaceId: "fallback-space"
        }]);
        setContextError(true);
        setLoading(false);
      }
    };

    initializeCalendar();
  }, [refreshKey]); // Re-run when refreshKey changes


  // Handler for when a new task is created from the modal
  const handleTaskCreate = (newTask) => {
    // Convert the newTask to the ProfCalendar activity format
    setActivities((prev) => [
      ...prev,
      {
        ...newTask,
        subject: (availableSpaces.find(s => s.space_uuid === newTask.spaceId)?.space_name) || '',
        studentsCount: (availableSpaces.find(s => s.space_uuid === newTask.spaceId)?.members?.length) || 25,
        yearLevel: '4th Year',
        type: newTask.type || 'Assignment',
      }
    ]);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setNewActivity({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      priority: "medium",
      type: "Assignment"
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
    // Generate colors dynamically based on subject name
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500',
      'bg-orange-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
      'bg-yellow-500', 'bg-gray-500'
    ];

    const index = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
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
      case 'thisweek':
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return activities.filter(a => {
          const activityDate = new Date(a.dueDate);
          return activityDate >= today && activityDate <= weekFromNow;
        });
      default:
        return [];
    }
  };

  const getStatisticTitle = (statistic) => {
    switch (statistic) {
      case 'total': return 'All Activities';
      case 'thisweek': return 'This Week\'s Activities';
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
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24 border" style={{ borderColor: currentColors.border }}></div>);
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
          className={`h-20 sm:h-24 border p-1 cursor-pointer transition-colors ${
            isToday ? (isDarkMode ? 'bg-blue-900' : 'bg-blue-50') : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          style={{ 
            borderColor: currentColors.border,
            backgroundColor: isToday && !isSelected ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : (isSelected ? (isDarkMode ? '#1e40af' : '#3b82f6') : 'transparent')
          }}
          onMouseEnter={(e) => {
            if (!isToday && !isSelected) {
              e.target.style.backgroundColor = currentColors.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isToday && !isSelected) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div className="text-xs font-semibold mb-1" style={{ color: currentColors.text }}>{day}</div>
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
              <div className="text-xs" style={{ color: currentColors.textSecondary }}>+{dayActivities.length - 2} more</div>
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
    <div className="flex min-h-screen" style={{ backgroundColor: currentColors.background }}>
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
        <div className="lg:hidden p-4 border-b flex items-center gap-4" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold" style={{ color: currentColors.text }}>Activity Calendar</h1>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: currentColors.text }}>Activity Calendar</h1>
            <p style={{ color: currentColors.textSecondary }}>
              {contextError ? "Showing sample data (SpaceContext not available)" : "Track all activity due dates and manage your class schedules"}
            </p>
          </div>

          {/* Create Activity Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateTaskFlow(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
              style={{ 
                backgroundColor: currentColors.accent,
                color: 'white'
              }}
            >
              <FiPlus size={16} />
              Create New Activity
            </button>
          </div>

          {/* Space Filter */}
          <div className="mb-4 rounded-xl shadow-sm border p-4" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-blue-600" size={16} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Filter by Space</label>
                  <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                    {selectedSpace 
                      ? `Filtering: ${availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space'}` 
                      : 'Click to select a space'
                    }
                  </p>
                </div>
              </div>
              {selectedSpace && (
                <button
                  onClick={() => setSelectedSpace("")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                    border: 'none'
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Space Categories - Hidden by default */}
            <div className="relative">
              <button
                onClick={() => setShowSpaceCategories(!showSpaceCategories)}
                className="w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between"
                style={{ 
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {selectedSpace 
                      ? '📍 ' + (availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space')
                      : '🌐 All Spaces'
                    }
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: currentColors.text }}>
                      {selectedSpace 
                        ? availableSpaces.find(s => s.space_uuid === selectedSpace)?.space_name || 'Unknown Space'
                        : 'All Spaces'
                      }
                    </div>
                    <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                      {selectedSpace 
                        ? 'Click to change space'
                        : 'Click to select a space'
                      }
                    </div>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 transition-transform ${showSpaceCategories ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: currentColors.textSecondary }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Categories */}
              {showSpaceCategories && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg border z-50 max-h-80 overflow-y-auto" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                  <div className="p-2">
                    {/* All Spaces Option */}
                    <div className="mb-3">
                      <button
                        onClick={() => {
                          setSelectedSpace("");
                          setShowSpaceCategories(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          !selectedSpace
                            ? 'border-blue-500 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        style={{ 
                          backgroundColor: !selectedSpace 
                            ? (isDarkMode ? '#1e3a8a' : '#dbeafe')
                            : currentColors.surface,
                          borderColor: !selectedSpace 
                            ? '#3b82f6'
                            : currentColors.border
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌐</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm" style={{ color: currentColors.text }}>All Spaces</div>
                            <div className="text-xs" style={{ color: currentColors.textSecondary }}>View activities from all spaces</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {(availableSpaces.length > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold" style={{ color: currentColors.text }}>Your Spaces</h4>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ color: currentColors.textSecondary, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}>
                            {availableSpaces.length} space{availableSpaces.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {availableSpaces.map((space) => (
                            <button
                              key={space.space_uuid}
                              onClick={() => {
                                setSelectedSpace(space.space_name);
                                setShowSpaceCategories(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg border transition-all ${
                                selectedSpace === space.space_name
                                  ? 'border-blue-500 shadow-sm'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              style={{ 
                                backgroundColor: selectedSpace === space.space_name 
                                  ? (isDarkMode ? '#1e3a8a' : '#dbeafe')
                                  : currentColors.surface,
                                borderColor: selectedSpace === space.space_name 
                                  ? '#3b82f6'
                                  : currentColors.border
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">🏠</span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm" style={{ color: currentColors.text }}>{space.space_name}</div>
                                  <div className="text-xs" style={{ color: currentColors.textSecondary }}>{space.space_type}</div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : availableSpaces.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Spaces Available</h3>
                <p className="text-gray-500 mb-4">
                  {contextError ? "SpaceContext is not available. Please check your setup." : "You need to create spaces to manage activities."}
                </p>
                <p className="text-sm text-gray-400 mb-4">Create spaces for your courses to start adding activities and tracking deadlines.</p>
                <button
                  onClick={() => setShowCreateDropdown(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  disabled={contextError}
                >
                  <FiPlus className="inline mr-2" size={16} />
                  {contextError ? "SpaceContext Unavailable" : "Create Your First Space"}
                </button>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Activities Created</h3>
                <p className="text-gray-500 mb-4">
                  {contextError ? "SpaceContext is not available. Please check your setup." : "You haven't created any activities yet."}
                </p>
                <button
                  onClick={() => setShowCreateDropdown(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiPlus className="inline mr-2" size={16} />
                  Create Your First Activity
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Statistics - Top */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    className="rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                    onClick={() => setSelectedStatistic('total')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: currentColors.text }}>{activities.length}</div>
                        <div className="text-xs" style={{ color: currentColors.textSecondary }}>Total Activities</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="rounded-lg p-4 border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}
                    onClick={() => setSelectedStatistic('thisweek')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: currentColors.text }}>
                          {(() => {
                            const today = new Date();
                            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                            return activities.filter(a => {
                              const activityDate = new Date(a.dueDate);
                              return activityDate >= today && activityDate <= weekFromNow;
                            }).length;
                          })()}
                        </div>
                        <div className="text-xs" style={{ color: currentColors.textSecondary }}>This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div className="rounded-xl shadow-sm border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                  {/* Calendar Header */}
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: currentColors.border }}>
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.hover}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <FiChevronLeft size={20} style={{ color: currentColors.textSecondary }} />
                    </button>
                    <h2 className="text-lg font-semibold" style={{ color: currentColors.text }}>
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = currentColors.hover}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <FiChevronRight size={20} style={{ color: currentColors.textSecondary }} />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-4">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: currentColors.textSecondary }}>
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
                <div className="rounded-xl shadow-sm border" style={{ backgroundColor: currentColors.surface, borderColor: currentColors.border }}>
                  <div className="p-4 border-b" style={{ borderColor: currentColors.border }}>
                    <h3 className="font-semibold" style={{ color: currentColors.text }}>
                      {selectedStatistic ? getStatisticTitle(selectedStatistic) : `Activities for ${selectedDate.toLocaleDateString()}`}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>
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
                          <FiCalendar className="mx-auto mb-3" size={32} style={{ color: currentColors.textSecondary }} />
                          <p style={{ color: currentColors.textSecondary }}>No activities found</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {getActivitiesByStatistic(selectedStatistic).map(activity => (
                            <div key={activity.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow" style={{ borderColor: currentColors.border }}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{getTypeIcon(activity.type)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm" style={{ color: currentColors.text }}>{activity.title}</h4>
                                      <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>{activity.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority}
                                    </span>
                                    <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      <FiClock className="inline mr-1" size={10} />
                                      {activity.dueTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      {activity.subject} • {activity.yearLevel}
                                    </p>
                                    <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      Due: {new Date(activity.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
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
                          <FiCalendar className="mx-auto mb-3" size={32} style={{ color: currentColors.textSecondary }} />
                          <p style={{ color: currentColors.textSecondary }}>No activities for this date</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {selectedDateActivities.map(activity => (
                            <div key={activity.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow" style={{ borderColor: currentColors.border }}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getSubjectColor(activity.subject)}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{getTypeIcon(activity.type)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm" style={{ color: currentColors.text }}>{activity.title}</h4>
                                      <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>{activity.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority}
                                    </span>
                                    <span className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      <FiClock className="inline mr-1" size={10} />
                                      {activity.dueTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      {activity.subject} • {activity.yearLevel}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
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

      {/* CREATE TASK FLOW MODAL */}
      <CreateTaskFlowModal
        show={showCreateTaskFlow}
        setShow={setShowCreateTaskFlow}
        availableSpaces={availableSpaces}
        contextError={contextError}
        refreshSpaces={refreshSpaces}
        onTaskCreate={handleTaskCreate}
      />

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfCalendarPage;
