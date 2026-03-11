import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Megaphone } from "lucide-react";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";
import { announcementService } from "../../../services/userAnnounceservice";

const priorityStyles = {
  high: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    badgeDark: "bg-red-900/40 text-red-300",
    label: "Urgent",
  },
  normal: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    badgeDark: "bg-blue-900/40 text-blue-300",
    label: "Info",
  },
};

const StudentAnnouncementByAdmin = () => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [viewedAnnouncements, setViewedAnnouncements] = useState(new Set());
  
  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prevent duplicate fetches
  const hasFetched = useRef(false);

  // Fetch student announcements on component mount (only once)
  useEffect(() => {
    const fetchStudentAnnouncements = async () => {
      // Prevent duplicate fetches
      if (hasFetched.current) return;
      hasFetched.current = true;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get announcements for students (target_audience = "STUDENTS" or "ALL")
        const response = await announcementService.getAnnouncementsByAudience("STUDENTS");
        
        if (response.success && response.data) {
          setAnnouncements(response.data);
        } else {
          setError(response.message || "Failed to load announcements");
        }
      } catch (err) {
        setError("Failed to load announcements");
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnnouncements();
  }, []); // Empty dependency array - only runs once on mount

  // Get visible announcements (limit to 3 most recent)
  const visible = announcements.slice(0, 3);

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    if (!viewedAnnouncements.has(announcement.announce_id)) {
      setViewedAnnouncements(prev => new Set(prev).add(announcement.announce_id));
    }
  };

  return (
    <div
      className="rounded-xl p-4 sm:p-6 mt-4"
      style={{
        background: isDarkMode
          ? "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)"
          : "linear-gradient(159deg, rgba(0,0,128,1) 0%, rgba(0,191,255,1) 100%)",
        border: "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Megaphone
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "white" }}
        />
        <h4
          className="font-semibold text-base sm:text-lg"
          style={{ color: "white" }}
        >
          Announcements
        </h4>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <p style={{ color: isDarkMode ? "white" : "white" }}>Loading announcements...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-4">
          <p style={{ color: isDarkMode ? "white" : "white" }}>{error}</p>
        </div>
      )}

      {/* Announcements List */}
      {!loading && !error && (
        <div className="space-y-3">
          {visible.length === 0 ? (
            <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? "white" : "white" }}>
              <div className="flex flex-col items-center gap-3">
                <Megaphone size={32} className="text-gray-400" />
                <div>
                  <p 
                    className="text-sm font-medium mb-1"
                    style={{ color: isDarkMode ? "white" : "white" }}
                  >
                    No announcements yet
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: isDarkMode ? "white" : "white" }}
                  >
                    Admin hasn't posted any announcements at the moment
                  </p>
                </div>
              </div>
            </div>
          ) : (
            visible.map((announcement) => (
              <div
                key={announcement.announce_id}
                className="mt-3 p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(30, 36, 46, 0.9)"
                    : "rgba(255, 255, 255, 0.95)",
                  borderColor: isDarkMode ? currentColors.border : "rgb(229, 231, 235)",
                  borderWidth: "1px",
                }}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {!viewedAnnouncements.has(announcement.announce_id) && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}></div>
                    )}
                    <p
                      className="text-sm font-semibold line-clamp-2"
                      style={{ color: currentColors.text }}
                    >
                      {announcement.title}
                    </p>
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-3 line-clamp-3"
                    style={{
                      color: currentColors.textSecondary,
                      lineHeight: "1.5",
                    }}
                  >
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <svg 
                      className="w-4 h-4 flex-shrink-0" 
                      style={{ color: currentColors.textSecondary }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p
                      className="text-xs font-medium"
                      style={{
                        color: currentColors.textSecondary,
                      }}
                    >
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View All button */}
      {!loading && !error && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigate("/notifications", { state: { filter: "announcements" } })}
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: "white"  }}
          >
            View All Announcements →
          </button>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            style={{
              backgroundColor: currentColors.surface,
              backdropFilter: "blur(20px)",
              border: "1px solid",
              borderColor: currentColors.border,
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex justify-between items-start"
              style={{ borderColor: currentColors.border }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2
                    className="text-xl font-bold line-clamp-2"
                    style={{ color: currentColors.text }}
                  >
                    {selectedAnnouncement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: currentColors.textSecondary }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p
                    className="text-sm font-medium"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-4"
                style={{ color: currentColors.textSecondary }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="p-6 rounded-xl leading-relaxed"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(17, 24, 39, 0.5)"
                    : "rgba(249, 250, 251, 0.8)",
                  border: "1px solid",
                  borderColor: currentColors.border,
                  fontSize: "16px",
                  lineHeight: "1.7",
                }}
              >
                <p
                  className="text-base"
                  style={{ color: currentColors.text }}
                >
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t"
              style={{ borderColor: currentColors.border }}
            >
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncementByAdmin;
