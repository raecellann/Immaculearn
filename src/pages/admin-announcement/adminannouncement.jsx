import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Logout from "../component/logout";
import { Menu } from "lucide-react";
import { useAdminAnnouncement } from "../../hooks/useAdminAnnouncement";
import AdminSidebar from "../component/adminsidebar";
import AnnouncementList from "./components/AnnouncementList";
import AnnouncementForm from "./components/AnnouncementForm";
import AnnouncementDetail from "./components/AnnouncementDetail";
import { useAdmin } from "../../contexts/admin/useAdmin";
import { toast } from "react-toastify";

const AdminAnnouncement = () => {
  const {
    createAnnouncement,
    getAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAdminAnnouncement();
  const [showLogout, setShowLogout] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetAudience: "all",
    scheduledDate: "",
    scheduledTime: "",
    attachments: [],
    images: [],
  });
  const [publishOption, setPublishOption] = useState("NOW"); // "NOW", "DRAFT", "SCHEDULED"

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllAnnouncements();
      if (result.success && result.data) {
        // Handle different response structures
        const announcementsData = Array.isArray(result.data)
          ? result.data
          : result.data.announcements || [];
        setAnnouncements(announcementsData);
      } else {
        toast.error(result.message || "Failed to fetch announcements");
        setAnnouncements([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to fetch announcements");
      setAnnouncements([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [getAllAnnouncements]);

  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

  // Optimized scheduled announcement checker with proper dependency management
  useEffect(() => {
    let lastCheckTime = new Date().toISOString();

    const checkScheduledAnnouncements = () => {
      const now = new Date();
      const currentDateTime = now.toISOString();

      // Only check if at least 1 minute has passed since last check
      if (
        new Date(currentDateTime).getTime() -
          new Date(lastCheckTime).getTime() >=
        60000
      ) {
        setAnnouncements((prevAnnouncements) => {
          const updatedAnnouncements = prevAnnouncements.map((announcement) => {
            if (announcement.status === "scheduled") {
              const scheduledDateTime = new Date(
                `${announcement.date} ${announcement.time}`,
              ).toISOString();
              if (scheduledDateTime <= currentDateTime) {
                return { ...announcement, status: "published" };
              }
            }
            return announcement;
          });

          // Only update state if there are actual changes
          const hasChanges = updatedAnnouncements.some(
            (ann, index) => ann.status !== prevAnnouncements[index].status,
          );

          return hasChanges ? updatedAnnouncements : prevAnnouncements;
        });

        lastCheckTime = currentDateTime;
      }
    };

    const interval = setInterval(checkScheduledAnnouncements, 30000); // Check every 30 seconds but only update if minute passed
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
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateAnnouncement = async () => {
    let scheduled_at = undefined;

    if (
      publishOption === "SCHEDULED" &&
      formData.scheduledDate &&
      formData.scheduledTime
    ) {
      scheduled_at = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`,
      ).toISOString();
    }

    const announcementData = {
      title: formData.title,
      content: formData.content,
      target_audience: formData.targetAudience.toUpperCase(),
      scheduled_at,
      publish_option: publishOption,
      images: formData.images,
    };

    setIsLoading(true);
    try {
      const result = await createAnnouncement(announcementData);
      if (result.success) {
        toast.success("Announcement created successfully!");
        fetchAnnouncements(); // Refresh the list
        setFormData({
          title: "",
          content: "",
          priority: "normal",
          targetAudience: "all",
          scheduledDate: "",
          scheduledTime: "",
          attachments: [],
          images: [],
        });
        setPublishOption("NOW"); // Reset publishOption to "NOW"
        setShowCreateModal(false);
      } else {
        toast.error(result.message || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    setIsLoading(true);
    try {
      const result = await deleteAnnouncement(announcementId);
      if (result.success) {
        toast.success("Announcement deleted successfully!");
        fetchAnnouncements(); // Refresh the list
        setSelectedAnnouncement(null);
      } else {
        toast.error(result.message || "Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    } finally {
      setIsLoading(false);
    }
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
      attachments: announcement.attachments,
      images: announcement.images || [],
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
      attachments: [],
      images: [],
    });
    setPublishOption("NOW");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Memoize filtered announcements to prevent unnecessary re-renders
  const filteredAnnouncements = useMemo(() => {
    if (!Array.isArray(announcements)) return [];

    return announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.author?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [announcements, searchQuery]);

  return (
    <div className="flex font-sans min-h-screen bg-gray-50 text-gray-900">
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
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 lg:hidden overflow-hidden border-r border-gray-200
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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
          <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* DESKTOP TITLE */}
          <h1 className="hidden lg:block text-2xl font-bold mb-6 text-gray-900">
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
