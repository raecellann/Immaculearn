import React, { useState, useEffect, useRef } from "react";
import Logout from "../component/logout";
import {
  Menu,
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import AdminSidebar from "../component/adminsidebar";
import AnnouncementList from "./components/AnnouncementList";
import AnnouncementForm from "./components/AnnouncementForm";
import AnnouncementDetail from "./components/AnnouncementDetail";

const AdminAnnouncement = () => {
  const { user } = useUser();
  const [showLogout, setShowLogout] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetAudience: "all",
    scheduledDate: "",
    scheduledTime: "",
    attachments: []
  });
  const [publishOption, setPublishOption] = useState("now"); // "now", "draft", "schedule"
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Midterm Examination Schedule",
      content: "Please be informed that the midterm examinations for the first semester will start on October 15, 2024. Students are advised to review their examination schedules and prepare accordingly.",
      author: "Dr. Maria Santos",
      date: "2024-10-01",
      time: "09:00 AM",
      priority: "high",
      status: "published",
      views: 1250,
      likes: 89,
      targetAudience: "all",
      attachments: ["exam_schedule.pdf"]
    },
    {
      id: 2,
      title: "System Maintenance Notice",
      content: "The learning management system will undergo scheduled maintenance on October 5, 2024, from 2:00 AM to 6:00 AM. During this time, the system will be inaccessible.",
      author: "IT Department",
      date: "2024-09-28",
      time: "02:30 PM",
      priority: "medium",
      status: "published",
      views: 890,
      likes: 23,
      targetAudience: "all",
      attachments: []
    },
    {
      id: 3,
      title: "New Course Registration Guidelines",
      content: "Updated guidelines for course registration for the second semester are now available. Please review the new procedures before the registration period begins.",
      author: "Registrar Office",
      date: "2024-09-25",
      time: "11:00 AM",
      priority: "normal",
      status: "draft",
      views: 0,
      likes: 0,
      targetAudience: "students",
      attachments: ["registration_guide.pdf", "academic_calendar.pdf"]
    },
    {
      id: 4,
      title: "Faculty Development Workshop",
      content: "A professional development workshop on innovative teaching methods will be held on October 10, 2024. All faculty members are encouraged to attend.",
      author: "Academic Affairs",
      date: "2024-09-20",
      time: "03:00 PM",
      priority: "medium",
      status: "published",
      views: 156,
      likes: 34,
      targetAudience: "faculty",
      attachments: ["workshop_details.pdf", "registration_form.docx"]
    }
  ]);

  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const checkScheduledAnnouncements = () => {
      const now = new Date();
      const currentDateTime = now.toISOString();
      
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(announcement => {
          if (announcement.status === "scheduled") {
            const scheduledDateTime = new Date(`${announcement.date} ${announcement.time}`).toISOString();
            if (scheduledDateTime <= currentDateTime) {
              return { ...announcement, status: "published" };
            }
          }
          return announcement;
        })
      );
    };

    const interval = setInterval(checkScheduledAnnouncements, 60000); // Check every minute
    checkScheduledAnnouncements(); // Check immediately on mount

    return () => clearInterval(interval);
  }, []);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "normal":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "draft":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "scheduled":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleCreateAnnouncement = () => {
    const now = new Date();
    let announcementStatus = "published";
    let announcementDate = now.toISOString().split('T')[0];
    let announcementTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (publishOption === "draft") {
      announcementStatus = "draft";
    } else if (publishOption === "schedule" && formData.scheduledDate && formData.scheduledTime) {
      announcementStatus = "scheduled";
      announcementDate = formData.scheduledDate;
      announcementTime = formData.scheduledTime;
    }

    const newAnnouncement = {
      id: announcements.length + 1,
      ...formData,
      author: user?.name || "Admin",
      date: announcementDate,
      time: announcementTime,
      status: announcementStatus,
      views: announcementStatus === "published" ? 0 : 0,
      likes: 0
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      targetAudience: "all",
      scheduledDate: "",
      scheduledTime: "",
      attachments: []
    });
    setPublishOption("now");
    setShowCreateModal(false);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
    setSelectedAnnouncement(null);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      scheduledDate: "",
      scheduledTime: "",
      attachments: announcement.attachments
    });
  };

  const handleClearForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      targetAudience: "all",
      scheduledDate: "",
      scheduledTime: "",
      attachments: []
    });
    setPublishOption("now");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden overflow-hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* MOBILE HEADER */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Announcements</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6">
            Announcements
          </h1>

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* MAIN COLUMN - Form or Selected Announcement */}
            <div className="flex-1">
              {selectedAnnouncement ? (
                <AnnouncementDetail
                  selectedAnnouncement={selectedAnnouncement}
                  onBack={() => setSelectedAnnouncement(null)}
                  onDelete={handleDeleteAnnouncement}
                  onEdit={handleEditAnnouncement}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ) : (
                <AnnouncementForm
                  formData={formData}
                  setFormData={setFormData}
                  publishOption={publishOption}
                  setPublishOption={setPublishOption}
                  onCreateAnnouncement={handleCreateAnnouncement}
                  onClear={handleClearForm}
                />
              )}
            </div>

            {/* SIDE COLUMN - Announcements List */}
            <AnnouncementList
              announcements={announcements}
              filteredAnnouncements={filteredAnnouncements}
              selectedAnnouncement={selectedAnnouncement}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAnnouncementClick={setSelectedAnnouncement}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminAnnouncement;