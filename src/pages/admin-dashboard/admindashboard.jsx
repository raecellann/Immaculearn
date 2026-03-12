import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../component/adminsidebar";
import { Users, GraduationCap, UserCheck, Menu, TrendingUp, Activity, BarChart3, PieChart, Megaphone, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import { adminDashboardService } from "../../adminServices/adminDashboard";
import { genderOptions, yearLevelOptions, departmentOptions } from "../component/enumOptions";
import { toast } from "react-toastify";
import DashboardCharts from "./components/DashboardCharts";
import DashboardStyles from "./components/DashboardStyles";
import { useAdminAnnouncement } from "../../hooks/useAdminAnnouncement";
import { useAcademicMutations } from "../../hooks/useAcademicMutation";
import { useAdmin } from "../../contexts/admin/useAdmin";



const AdminDashboard = () => {
  const { getAllAnnouncements } = useAdminAnnouncement();
  const { academicTerms } = useAcademicMutations();
  const { isAuthenticated, admin } = useAdmin();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
    const [animatedStats, setAnimatedStats] = useState({ teachers: 0, students: 0, pending: 0 });

  /* STICKY HEADER STATE */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Get active academic term
  const getActiveAcademicTerm = () => {
    const activeTerm = academicTerms.find(term => term.academic_status === 'active');
    return activeTerm;
  };

  const activeTerm = getActiveAcademicTerm();

  // Helper functions to get display names
  const getGenderName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const gender = genderOptions.find(option => option.code === code);
    return gender ? gender.name : '-';
  };

  const getDepartmentName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const department = departmentOptions.find(option => option.code === code);
    return department ? department.name : '-';
  };

  const getCourseName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const department = departmentOptions.find(option => option.code === code);
    return department ? department.name : '-';
  };

  const getYearLevelName = (code) => {
    if (code === null || code === undefined) {
      return '-';
    }
    const codeStr = String(code);
    const yearLevel = yearLevelOptions.find(option => option.code === codeStr);
    return yearLevel ? yearLevel.name : '-';
  };
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    pending: 0,
  });

  // Animate stats on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 500);
    return () => clearTimeout(timer);
  }, [stats]);

    const fetchStudents = async () => {
    try {
      const res = await adminDashboardService.getAllStudentEmails();

      if (res.success && res.data) {
        const mapped = res.data.students?.map((student, index) => ({
          id: student.student_id ?? `temp-${index}`,
          name: `${student.student_fn || ''} ${student.student_ln || ''}`.trim() || student.email.split('@')[0],
          email: student.email,
          course: getCourseName(student.student_course),
          courseCode: student.student_course || "Unknown",
          gender: getGenderName(student.student_gender),
          yearLevel: getYearLevelName(student.student_yr_lvl)
        })) || [];

        setStudents(mapped);
        setStats(prev => ({
          ...prev,
          students: mapped.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };
  const fetchTeachers = async () => {
    try {
      const res = await adminDashboardService.getAllProfEmails();

      if (res.success && res.data) {
        const mapped = res.data.emails?.map((teacher, index) => ({
          id: teacher.email ?? `temp-${index}`,
          name: `${teacher.prof_fn || ''} ${teacher.prof_ln || ''}`.trim() || teacher.email.split('@')[0],
          email: teacher.email,
          gender: getGenderName(teacher.prof_gender),
          department: getDepartmentName(teacher.prof_department)
        })) || [];

        setTeachers(mapped);
        setStats(prev => ({
          ...prev,
          teachers: mapped.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const result = await getAllAnnouncements();
      if (result.success && result.data) {
        const announcementsData = Array.isArray(result.data) ? result.data : result.data.announcements || [];
        setAnnouncements(announcementsData);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };


  useEffect(() => {
  // Only fetch data if authenticated
  if (isAuthenticated && admin) {
    fetchStudents();
    fetchTeachers();
    fetchAnnouncements();
  }
}, [isAuthenticated, admin]);

  /* NAVIGATION FUNCTIONS */
  const navigateToTeachers = () => {
    navigate('/admin/teachers');
  };

  const navigateToStudents = () => {
    navigate('/admin/students');
  };

  /* SCROLL BEHAVIOR (RESTORED) */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <DashboardStyles />
      <div className="flex min-h-screen bg-gray-50 text-gray-900">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE/TABLET SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 border-r border-gray-200
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
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
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header with animation */}
          <div className="mb-8 animate-fade-in">
            <h1 className="hidden lg:block text-3xl font-bold text-center text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-center text-gray-600 mt-2">Welcome back! Here's your overview.</p>
          </div>

          {/* ===== ENHANCED STAT CARDS ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard 
              icon={GraduationCap} 
              label="Teachers" 
              value={animatedStats.teachers} 
              color="blue" 
              onClick={navigateToTeachers}
              trend="+12%"
              iconBg={TrendingUp}
            />
            <StatCard 
              icon={Users} 
              label="Students" 
              value={animatedStats.students} 
              color="green" 
              onClick={navigateToStudents}
              trend="+8%"
              iconBg={Activity}
            />
            <StatCard 
              icon={Megaphone} 
              label="Announcements" 
              value={announcements.length}
              color="orange" 
              onClick={() => navigate('/admin/announcement')}
              trend="+2"
              iconBg={Activity}
            />
            <StatCard 
              icon={Calendar} 
              label="Academic Term" 
              value={activeTerm ? `${activeTerm.academic_semester}${activeTerm.academic_semester === 1 ? 'st' : 'nd'} Semester` : 'No Active Term'}
              color="indigo" 
              onClick={() => navigate('/admin/academic-term')}
              trend={activeTerm ? `${activeTerm.academic_period} • ${activeTerm.academic_year}` : 'None'}
              iconBg={TrendingUp}
            />
          </div>

          {/* ===== DASHBOARD CHARTS ===== */}
          <div className="mb-8">
            <DashboardCharts students={students} teachers={teachers} />
          </div>

          {/* ===== ENHANCED TEACHERS AND STUDENTS LISTS ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* ===== TEACHERS LIST ===== */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="hidden sm:inline">Teachers</span>
                  <span className="sm:hidden">Tchrs</span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {teachers.length}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden">
                {teachers.slice(0, 3).map((teacher, index) => (
                  <div
                    key={teacher.id}
                    className="bg-gray-50 p-3 sm:p-4 rounded-lg transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-xs sm:text-sm text-gray-900 mb-1 truncate">{teacher.name}</p>
                        <p className="text-gray-600 text-xs mb-1 truncate">{teacher.email}</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">
                            {teacher.gender}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[100px] sm:max-w-none font-medium">
                            {teacher.department}
                          </span>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
                {teachers.length > 3 && (
                  <div className="flex justify-end">
                    <button
                      onClick={navigateToTeachers}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors duration-200"
                    >
                      View All Teachers ({teachers.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== STUDENTS LIST ===== */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="hidden sm:inline">Students</span>
                  <span className="sm:hidden">Stds</span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {students.length}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden">
                {students.slice(0, 3).map((student, index) => (
                  <div
                    key={student.id}
                    className="bg-gray-50 p-3 sm:p-4 rounded-lg transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-xs sm:text-sm text-gray-900 mb-1 truncate">{student.name}</p>
                        <p className="text-gray-600 text-xs mb-1 truncate">{student.email}</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">
                            {student.gender}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[80px] sm:max-w-none font-medium">
                            {student.course}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">
                            {student.yearLevel}
                          </span>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
                {students.length > 3 && (
                  <div className="flex justify-end">
                    <button
                      onClick={navigateToStudents}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors duration-200"
                    >
                      View All Students ({students.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    
  </div>
    </>
  );
};

/* 🔹 ENHANCED STAT CARD WITH ANIMATIONS */
const StatCard = ({ icon: Icon, label, value, color, onClick, trend, iconBg: IconBg }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [displayText, setDisplayText] = useState('');
  
  // Check if value is a number or text
  const isNumeric = typeof value === 'number';
  
  // Animate number counting
  useEffect(() => {
    if (isNumeric) {
      const duration = 1500;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      // For text values, just set the text directly
      setDisplayText(value);
    }
  }, [value, isNumeric]);

  const colorGradients = {
    blue: 'from-blue-600 via-blue-500 to-indigo-600',
    green: 'from-emerald-600 via-green-500 to-teal-600',
    orange: 'from-orange-600 via-amber-500 to-yellow-600',
    indigo: 'from-indigo-600 via-violet-500 to-purple-600',
    purple: 'from-purple-600 via-violet-500 to-indigo-600',
    amber: 'from-amber-600 via-orange-500 to-yellow-600',
  };

  const iconBackgrounds = {
    blue: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-200 border border-blue-400/30',
    green: 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 text-emerald-200 border border-emerald-400/30',
    orange: 'bg-gradient-to-br from-orange-500/20 to-amber-600/20 text-orange-200 border border-orange-400/30',
    indigo: 'bg-gradient-to-br from-indigo-500/20 to-violet-600/20 text-indigo-200 border border-indigo-400/30',
    purple: 'bg-gradient-to-br from-purple-500/20 to-violet-600/20 text-purple-200 border border-purple-400/30',
    amber: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-200 border border-amber-400/30',
  };

  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left p-3 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-3 sm:gap-4 
        bg-gradient-to-br ${colorGradients[color]} 
        shadow-lg hover:shadow-2xl hover:shadow-${color}-500/30 
        transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-white focus:ring-${color}-400
        border border-${color}-400/20 relative overflow-hidden group`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className={`${iconBackgrounds[color]} p-2 sm:p-3.5 rounded-lg sm:rounded-xl backdrop-blur-sm transform transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-white/80 bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            <IconBg className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">{trend}</span>
            <span className="xs:hidden">{trend.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="text-white relative z-10">
        <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">{label}</p>
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums">
          {isNumeric ? displayValue.toLocaleString() : displayText}
        </h2>
      </div>
      
      <div className="ml-auto opacity-80 transform transition-transform duration-300 group-hover:translate-x-1 hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </button>
  );
};

export default AdminDashboard;
