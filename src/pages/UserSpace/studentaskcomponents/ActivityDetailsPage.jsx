import React, { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar";
import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiCalendar,
  FiUsers,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiDownload,
  FiUser,
} from "react-icons/fi";
import { useTasks } from "../../../hooks/useTasks";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { capitalizeWords } from "../../../utils/capitalizeFirstLetter";
import Button from "../../component/button_2";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { toast } from "react-toastify";

const ActivityDetailsPage = () => {
  const { space_uuid, space_name, task_id, task_title } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { space, studentGroup, studentGroupLoading, setTaskId } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  if (task_id) {
    setTaskId(task_id);
  }

  // Use useTasks hook to get uploaded tasks
  const { uploadedTasksQuery } = useTasks(space_uuid);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Task data state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task categories with emojis
  const taskCategories = [
    { value: "quiz", label: "Quiz", emoji: "📝" },
    { value: "group-activity", label: "Group Activity", emoji: "👥" },
    { value: "individual-activity", label: "Individual Activity", emoji: "📄" },
    { value: "exam", label: "Exam", emoji: "📋" },
  ];

  // Get category emoji and label
  const getCategoryDisplay = (categoryValue) => {
    const category = taskCategories.find((cat) => cat.value === categoryValue);
    return category ? `${category.emoji} ${category.label}` : "📝 Task";
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Fetch task details from uploaded tasks using task_id
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);

        // Get uploaded tasks from the useTasks hook - same as ProfViewActivity
        const taskData = uploadedTasksQuery?.data || [];
        const uploadedTask = Array.isArray(taskData)
          ? taskData
          : taskData?.data || [];

        // Find task by task_id - same logic as ProfViewActivity
        let foundTask = uploadedTask.find(
          (task) => Number(task.task_id) === Number(task_id),
        );

        // If not found in uploaded tasks, try localStorage for backwards compatibility
        if (!foundTask) {
          const storedTasks = localStorage.getItem("quizTask");
          if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            foundTask = parsedTasks.find(
              (task) => task.task_id === task_id || task.id === task_id,
            );
          }
        }

        // If still not found, create placeholder
        if (!foundTask) {
          foundTask = {
            task_id: task_id,
            task_title: decodeURIComponent(task_title || "Untitled Task"),
            task_category: "individual-activity",
            instruction: "",
            score: null,
            due_date: null,
            attachments: [],
          };
        }

        setTask(foundTask);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError("Failed to load activity details");
        setLoading(false);
      }
    };

    if (task_id && uploadedTasksQuery) {
      fetchTaskDetails();
    }
  }, [task_id, task_title, uploadedTasksQuery]);

  const handleBackToTasks = () => {
    navigate(-1);
  };

  const handleStartActivity = () => {
    // Navigate to the activity taking page or open modal
    toast.info("Starting activity...");
    // You can implement the actual activity taking logic here
  };

  // Handle group card click - navigate to group-specific path
  const handleGroupClick = (group) => {
    navigate(
      `/document/${space_uuid}/${encodeURIComponent(space_name)}/${encodeURIComponent(task.task_title)}/${task_id}/${encodeURIComponent(group.group_name)}/${group.group_id}`
    );
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date set";
    try {
      const date = new Date(dueDate);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "text-green-600 dark:text-green-400";
      case "graded":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "graded":
        return "Graded";
      default:
        return "Not Submitted";
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen"
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading activity details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen"
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={handleBackToTasks} className="px-4 py-2">
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div
        className="flex min-h-screen"
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4">Activity not found</p>
            <Button onClick={handleBackToTasks} className="px-4 py-2">
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: currentColors.surface }}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
            color: currentColors.text,
          }}
        >
          <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-xl sm:text-2xl p-0"
              style={{ color: currentColors.text }}
            >
              ☰
            </button>
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate">
              {task.task_title || "Activity Details"}
            </h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-16 sm:pt-20 lg:pt-10) */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-10 pt-16 sm:pt-20 lg:pt-10 overflow-y-auto">
          {/* Back Button */}
          <div className="mb-3 sm:mb-4 flex items-center">
            <button
              onClick={handleBackToTasks}
              className="bg-transparent border-none p-2 text-base sm:text-lg font-medium transition-colors"
              style={{ color: currentColors.textSecondary }}
            >
              ← Back
            </button>
          </div>

          {/* Task Information */}
          <div
            className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-4xl sm:max-w-5xl mx-auto"
            style={{
              backgroundColor: currentColors.surface,
              border: `1px solid ${currentColors.border}`,
            }}
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 font-inter">
              Task Information:
            </h2>
            <hr
              className="mb-3 sm:mb-4"
              style={{ borderColor: currentColors.border }}
            />

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
              <div className="space-y-2 sm:space-y-3">
                <p className="font-semibold font-inter text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">
                  {task.task_title}
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <p
                    className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                    style={{ opacity: 0.7 }}
                  >
                    Due Date:{" "}
                    <span style={{ opacity: 1 }}>
                      {formatDueDate(task.due_date)}
                    </span>
                  </p>
                  <p
                    className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                    style={{ opacity: 0.7 }}
                  >
                    Category:{" "}
                    <span style={{ opacity: 1 }}>
                      {getCategoryDisplay(task.task_category)}
                    </span>
                  </p>
                  {(task.instruction || task.task_instruction) && (
                    <p
                      className="text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-10"
                      style={{ opacity: 0.7 }}
                    >
                      Instructions:{" "}
                      <span style={{ opacity: 1 }} className="break-words">
                        {task.instruction || task.task_instruction}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 sm:mb-4 font-inter flex items-center">
                  <FiFileText className="mr-2" />
                  Attachments:
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        backgroundColor: currentColors.background,
                        borderColor: currentColors.border,
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <FiFileText
                          style={{ color: currentColors.textSecondary }}
                        />
                        <div>
                          <p
                            style={{ color: currentColors.text }}
                            className="font-medium"
                          >
                            {attachment.name}
                          </p>
                          <p
                            style={{ color: currentColors.textSecondary }}
                            className="text-sm"
                          >
                            {attachment.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.url, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <FiDownload />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Group Information - Only show for group activities */}
            {task.task_category === "group-activity" && studentGroup && (
              <div className="mt-6 sm:mt-8">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold">
                    Your Group:
                  </h3>
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                    }}
                  >
                    <FiUser size={16} />
                    {studentGroup.members?.length || 0} Members
                  </div>
                </div>

                {/* Mobile Card View - For small screens */}
                <div className="block sm:hidden">
                  <div
                    className="rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md"
                    style={{
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.border,
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => handleGroupClick(studentGroup)}
                  >
                    {/* Group Name */}
                    <div className="mb-2">
                      <h4
                        className="font-semibold text-sm mb-2"
                        style={{ color: currentColors.text }}
                      >
                        {studentGroup.group_name}
                      </h4>
                    </div>

                    {/* Group Leader */}
                    <div className="mb-2">
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: currentColors.textSecondary }}
                      >
                        GROUP LEADER:
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: currentColors.text }}
                      >
                        {studentGroup.members?.find((m) => m.is_leader)
                          ?.student_name || "No leader assigned"}
                      </div>
                    </div>

                    {/* Members */}
                    <div className="mb-2">
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: currentColors.textSecondary }}
                      >
                        MEMBERS:
                      </div>
                      <div className="space-y-1">
                        {studentGroup.members
                          ?.filter((m) => !m.is_leader)
                          .map((member, index) => (
                            <div
                              key={index}
                              className="text-xs flex items-center gap-1"
                              style={{ color: currentColors.text }}
                            >
                              <span className="text-xs">•</span>
                              {member.student_name}
                            </div>
                          )) || (
                            <div
                              className="text-xs"
                              style={{ color: currentColors.textSecondary }}
                            >
                              No other members
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Member Count Badge */}
                    <div className="flex justify-end">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: currentColors.surface,
                          color:
                            currentColors.primary || currentColors.text,
                        }}
                      >
                        {studentGroup.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop View - For medium screens and up */}
                <div className="hidden sm:block">
                  <div
                    className="rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer max-w-md"
                    style={{
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.border,
                    }}
                    onClick={() => handleGroupClick(studentGroup)}
                  >
                    {/* Group Name */}
                    <div className="mb-3">
                      <h4
                        className="font-semibold text-base mb-2"
                        style={{ color: currentColors.text }}
                      >
                        {studentGroup.group_name}
                      </h4>
                    </div>

                    {/* Group Leader */}
                    <div className="mb-3">
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: currentColors.textSecondary }}
                      >
                        GROUP LEADER:
                      </div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: currentColors.text }}
                      >
                        {studentGroup.members?.find((m) => m.is_leader)
                          ?.student_name || "No leader assigned"}
                      </div>
                    </div>

                    {/* Members */}
                    <div className="mb-3">
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: currentColors.textSecondary }}
                      >
                        MEMBERS:
                      </div>
                      <div className="space-y-1">
                        {studentGroup.members
                          ?.filter((m) => !m.is_leader)
                          .map((member, index) => (
                            <div
                              key={index}
                              className="text-sm flex items-center gap-2"
                              style={{ color: currentColors.text }}
                            >
                              <span className="text-xs">•</span>
                              {member.student_name}
                            </div>
                          )) || (
                            <div
                              className="text-sm"
                              style={{ color: currentColors.textSecondary }}
                            >
                              No other members
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Member Count Badge */}
                    <div className="flex justify-end">
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: currentColors.surface,
                          color:
                            currentColors.primary || currentColors.text,
                        }}
                      >
                        {studentGroup.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for group activities when user has no group */}
            {task.task_category === "group-activity" && (!studentGroup || studentGroupLoading) && (
              <div className="mt-6 sm:mt-8">
                <div
                  className="text-center py-8 sm:py-12"
                  style={{ color: currentColors.textSecondary }}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
                  <p className="text-sm sm:text-base">
                    {studentGroupLoading ? "Loading your group information..." : "You haven't been assigned to a group yet."}
                  </p>
                  <p className="text-xs sm:text-sm mt-1">
                    {studentGroupLoading ? "Please wait..." : "Check back later for group assignments."}
                  </p>
                </div>
              </div>
            )}

            {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleStartActivity}
                className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Activity
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToTasks}
                className="flex-1 justify-center"
              >
                Back to Tasks
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsPage;
