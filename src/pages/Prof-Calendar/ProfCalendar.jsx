import React, { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../component/profsidebar";
import { FiCalendar, FiClock, FiCheck, FiAlertCircle, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiEdit, FiPlus } from "react-icons/fi";
import Logout from "../component/logout";
import { SpaceContext } from "../../contexts/space/spaceContext";

const ProfCalendarPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Handle create activity
  const handleCreateActivity = async () => {
    if (selectedSpace && newActivity.title && newActivity.description) {
      try {
        // Find the selected space
        const space = availableSpaces.find(s => s.space_name === selectedSpace);
        if (!space) {
          console.error('Space not found');
          return;
        }

        // If this is a mock space (context error), just add to local state
        if (contextError || space.space_uuid.startsWith('mock-')) {
          const mockActivity = {
            id: activities.length + 1,
            title: newActivity.title,
            description: newActivity.description,
            dueDate: newActivity.dueDate,
            dueTime: newActivity.dueTime,
            priority: newActivity.priority,
            status: "pending",
            subject: space.space_name,
            type: newActivity.type,
            studentsCount: space.members?.length || 25,
            yearLevel: "4th Year",
            spaceId: space.space_uuid
          };
          
          setActivities([...activities, mockActivity]);
          
          // Reset form
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
          return;
        }

        // Create activity data in the format expected by the API
        const activityData = {
          title: newActivity.title,
          instruction: newActivity.description,
          due_date: new Date(`${newActivity.dueDate}T${newActivity.dueTime}`).toISOString(),
          status: 'pending',
          scoring: 100, // Default scoring
        };

        // Call the API to create the task/activity
        const response = await fetch(`/api/spaces/${space.space_uuid}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(activityData),
        });

        if (response.ok) {
          const createdActivity = await response.json();
          const formattedActivity = {
            id: createdActivity.id,
            title: createdActivity.task_title,
            description: createdActivity.task_instruction || '',
            dueDate: createdActivity.task_due ? new Date(createdActivity.task_due).toISOString().split('T')[0] : '',
            dueTime: createdActivity.task_due ? new Date(createdActivity.task_due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            priority: newActivity.priority,
            status: createdActivity.task_status,
            subject: space.space_name,
            type: newActivity.type,
            studentsCount: space.members?.length || 25,
            yearLevel: '4th Year',
            spaceId: space.space_uuid
          };
          
          setActivities([...activities, formattedActivity]);

          // Reset form
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
        } else {
          console.error('Failed to create activity');
        }
      } catch (error) {
        console.error('Error creating activity:', error);
      }
    }
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
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Activity Calendar</h1>
              <p className="text-gray-600 mt-1">
                {contextError ? "Showing sample data (SpaceContext not available)" : "Track all activity due dates and manage your class schedules"}
              </p>
            </div>
          </div>

          {/* Create Activity Button */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => {
                    if (selectedSpace) {
                      setShowCreateModal(true);
                    } else {
                      setShowCreateDropdown(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiPlus size={16} />
                  Create Activity
                </button>
                
                {/* Dropdown */}
                {showCreateDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <FiCalendar className="text-white" size={10} />
                          </div>
                          Select Space
                          {contextError && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Demo Mode
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={refreshSpaces}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
                            title="Refresh spaces"
                          >
                            <FiClock className="text-blue-600" size={14} />
                          </button>
                          <button
                            onClick={() => setShowCreateDropdown(false)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1.5 transition-colors"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                      {contextError && (
                        <p className="text-xs text-yellow-700 mt-1">
                          SpaceContext unavailable - showing demo spaces. Click refresh to reload.
                        </p>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {(() => {
                          console.log('Dropdown rendering - availableSpaces:', availableSpaces); // Debug log
                          console.log('Dropdown rendering - availableSpaces.length:', availableSpaces.length); // Debug log
                          console.log('Dropdown rendering - spacesRef.current:', spacesRef.current); // Debug log
                          console.log('Dropdown rendering - spacesRef.current.length:', spacesRef.current.length); // Debug log
                          console.log('Dropdown rendering - contextError:', contextError); // Debug log
                          return null;
                        })()}
                        {(availableSpaces.length === 0 && spacesRef.current.length === 0) ? (
                          <div className="p-4 text-center">
                            <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No spaces available</p>
                            <p className="text-gray-400 text-xs mt-1">Create or join spaces to add activities</p>
                            <button
                              onClick={refreshSpaces}
                              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <FiPlus className="inline mr-2" size={16} />
                              Refresh Spaces
                            </button>
                          </div>
                        ) : (
                          (availableSpaces.length > 0 ? availableSpaces : spacesRef.current).map((space, index) => {
                            console.log('Rendering space:', space); // Debug log
                            const colors = [
                              'bg-gradient-to-r from-blue-500 to-blue-600',
                              'bg-gradient-to-r from-green-500 to-green-600',
                              'bg-gradient-to-r from-purple-500 to-purple-600',
                              'bg-gradient-to-r from-orange-500 to-orange-600',
                              'bg-gradient-to-r from-pink-500 to-pink-600',
                              'bg-gradient-to-r from-indigo-500 to-indigo-600',
                              'bg-gradient-to-r from-teal-500 to-teal-600',
                              'bg-gradient-to-r from-red-500 to-red-600'
                            ];
                            const icons = [
                              '📚', '💻', '🔬', '🧠', '⚽', '💼', '🔧', '📊'
                            ];
                            
                            return (
                              <button
                                key={space.space_uuid}
                                onClick={() => {
                                  setSelectedSpace(space.space_name);
                                  setShowCreateDropdown(false);
                                  setShowCreateModal(true);
                                }}
                                className="w-full group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                              >
                                <div className={`absolute inset-0 ${colors[index % colors.length]} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                <div className="relative flex items-center gap-3 px-4 py-3 text-left">
                                  <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform`}>
                                    {icons[index % icons.length]}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                                      {space.space_name}
                                    </p>
                                    <p className="text-xs text-gray-200 group-hover:text-gray-100 transition-colors">
                                      {space.space_type} • {space.members?.length || 0} members
                                    </p>
                                  </div>
                                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <FiPlus className="text-white group-hover:text-blue-200 transition-colors" size={12} />
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedSpace && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                  <span>Selected: {selectedSpace}</span>
                  <button
                    onClick={() => {
                      setSelectedSpace("");
                      setShowCreateDropdown(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full p-1 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
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
                    onClick={() => setSelectedStatistic('thisweek')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const today = new Date();
                            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                            return activities.filter(a => {
                              const activityDate = new Date(a.dueDate);
                              return activityDate >= today && activityDate <= weekFromNow;
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

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl border-b border-blue-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiPlus className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Create New Activity</h3>
                    <p className="text-blue-100 text-sm">Add a new activity for {selectedSpace}</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelCreate}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Space Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" size={12} />
                      </div>
                      Space
                    </label>
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-black font-medium">
                      {selectedSpace || "Select a space"}
                    </div>
                  </div>

                  {/* Activity Title */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiEdit className="text-green-600" size={12} />
                      </div>
                      Activity Title
                    </label>
                    <input
                      type="text"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                      placeholder="Enter activity title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiEdit className="text-purple-600" size={12} />
                      </div>
                      Description
                    </label>
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-black"
                      rows="4"
                      placeholder="Enter activity description"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Due Date and Time */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-orange-600" size={12} />
                      </div>
                      Due Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Date</label>
                        <input
                          type="date"
                          value={newActivity.dueDate}
                          onChange={(e) => setNewActivity({...newActivity, dueDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Time</label>
                        <input
                          type="time"
                          value={newActivity.dueTime}
                          onChange={(e) => setNewActivity({...newActivity, dueTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority and Type */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center">
                        <FiAlertCircle className="text-red-600" size={12} />
                      </div>
                      Priority & Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Priority</label>
                        <select
                          value={newActivity.priority}
                          onChange={(e) => setNewActivity({...newActivity, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value="low">🟢 Low Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="high">🔴 High Priority</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Activity Type</label>
                        <select
                          value={newActivity.type}
                          onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value="Assignment">📝 Assignment</option>
                          <option value="Exam">📋 Exam</option>
                          <option value="Lab Activity">🔬 Lab Activity</option>
                          <option value="Paper">📄 Paper</option>
                          <option value="Practical Exam">⚽ Practical Exam</option>
                          <option value="Presentation">🎯 Presentation</option>
                          <option value="Project Demo">💻 Project Demo</option>
                          <option value="Coding Challenge">💡 Coding Challenge</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelCreate}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateActivity}
                  disabled={!selectedSpace || !newActivity.title || !newActivity.description}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <FiPlus size={16} />
                    Create Activity
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfCalendarPage;
