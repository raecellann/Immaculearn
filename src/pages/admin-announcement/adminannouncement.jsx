import React, { useState } from "react";
import Button from "../component/Button";
import Logout from "../component/logout";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Send,
  X,
  Bell,
  Settings,
  FileText,
  Image as ImageIcon,
  Link2,
  Menu,
} from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import AdminSidebar from "../component/adminsidebar";

const AdminAnnouncement = () => {
  const { user } = useUser();
  const [showLogout, setShowLogout] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form state for creating/editing announcements
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetAudience: "all",
    scheduledDate: "",
    attachments: []
  });

  // Mock data for announcements
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
    const newAnnouncement = {
      id: announcements.length + 1,
      ...formData,
      author: user?.name || "Admin",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "published",
      views: 0,
      likes: 0
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      targetAudience: "all",
      scheduledDate: "",
      attachments: []
    });
    setShowCreateModal(false);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
    setSelectedAnnouncement(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <AdminSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Burger Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-[#1E222A] rounded-lg text-white hover:bg-[#2A2F3A] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Middle Column - Announcement Creation/Viewing */}
        <div className="flex-1 bg-[#161A20] overflow-y-auto">
          <div className="pt-20 lg:pt-6 p-4 lg:p-6">
            {selectedAnnouncement ? (
              // View selected announcement
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="w-full">
                    <button
                      onClick={() => setSelectedAnnouncement(false)}
                      className="text-gray-400 hover:text-white bg-transparent border-none p-2 text-lg font-medium transition-colors mb-4"
                    >
                      ← Back
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">{selectedAnnouncement.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{selectedAnnouncement.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedAnnouncement.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedAnnouncement.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedAnnouncement.priority)}`}>
                      {selectedAnnouncement.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAnnouncement.status)}`}>
                      {selectedAnnouncement.status}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1E242E] rounded-xl p-6 mb-6">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>

                {selectedAnnouncement.attachments.length > 0 && (
                  <div className="bg-[#1E242E] rounded-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {selectedAnnouncement.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#2A2F3A] rounded-lg">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    className="w-full sm:w-auto bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2"
                    onClick={() => {
                      setEditingAnnouncement(selectedAnnouncement);
                      setFormData({
                        title: selectedAnnouncement.title,
                        content: selectedAnnouncement.content,
                        priority: selectedAnnouncement.priority,
                        targetAudience: selectedAnnouncement.targetAudience,
                        scheduledDate: "",
                        attachments: selectedAnnouncement.attachments
                      });
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                    onClick={() => handleDeleteAnnouncement(selectedAnnouncement.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              // Create new announcement form
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">Create Announcement</h1>
                  <p className="text-gray-400">Create and publish announcements for students and faculty</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-[#1E242E] border border-[#3B4457] rounded-lg px-4 py-3 focus:outline-none focus:border-[#007AFF]"
                      placeholder="Enter announcement title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-[#1E242E] border border-[#3B4457] rounded-lg px-4 py-3 h-64 focus:outline-none focus:border-[#007AFF] resize-none"
                      placeholder="Write your announcement content..."
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full bg-[#1E242E] border border-[#3B4457] rounded-lg px-4 py-3 focus:outline-none focus:border-[#007AFF]"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium mb-2">Target Audience</label>
                      <select
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        className="w-full bg-[#1E242E] border border-[#3B4457] rounded-lg px-4 py-3 focus:outline-none focus:border-[#007AFF]"
                      >
                        <option value="all">All Users</option>
                        <option value="faculty">Professors Only</option>
                        <option value="students">Students Only</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-3">
                      <Button
                        className="flex h-12 justify-between items-center bg-[#007AFF] hover:bg-blue-700 text-white px-6 py-3"
                        onClick={handleCreateAnnouncement}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publish Announcement
                      </Button>
                      <Button
                        className="h-12 bg-white hover:bg-gray-700 text-white px-6 py-3"
                        onClick={() => setFormData({
                          title: "",
                          content: "",
                          priority: "normal",
                          targetAudience: "all",
                          scheduledDate: "",
                          attachments: []
                        })}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Column - Announcements List */}
        <div className="w-80 bg-[#1E222A] border-r border-[#3B4457] overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-[#3B4457]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-400" />
                Announcements
              </h2>
              <span className="bg-[#007AFF] text-white text-xs px-2 py-1 rounded-full">
                {announcements.length}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements..."
                className="w-full bg-[#2A2F3A] border border-[#3B4457] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          <div className="p-4 space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-[#4A5568] ${
                  selectedAnnouncement?.id === announcement.id
                    ? "bg-[#2A2F3A] border-[#007AFF]"
                    : "bg-[#1E242E] border-[#3B4457]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm line-clamp-2">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{announcement.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(announcement.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{announcement.views} views</span>
                    <span>•</span>
                    <span>{announcement.likes} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default AdminAnnouncement;