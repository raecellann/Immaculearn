import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone } from "lucide-react";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

// Mock announcements — replace with real API data as needed
const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "School Holiday Notice",
    message: "School will be closed on Monday for maintenance.",
    date: "March 2, 2026",
    priority: "high",
  },
  {
    id: 2,
    title: "Exam Schedule Released",
    message: "Final exam schedule has been posted. Check your student portal.",
    date: "February 28, 2026",
    priority: "normal",
  },
  {
    id: 3,
    title: "New Library Hours",
    message: "Library will now be open until 9 PM on weekdays for extended study hours.",
    date: "February 25, 2026",
    priority: "normal",
  },
];

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

  const visible = MOCK_ANNOUNCEMENTS.slice(0, 3);

  return (
    <div
      className="rounded-xl p-4 sm:p-6 mt-4"
      style={{
        backgroundColor: currentColors.surface,
        border: isDarkMode ? "none" : "1px solid black",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Megaphone
          className="w-5 h-5 flex-shrink-0"
          style={{ color: isDarkMode ? "#60A5FA" : "#1e3a8a" }}
        />
        <h4
          className="font-semibold text-base sm:text-lg"
          style={{ color: isDarkMode ? "white" : "black" }}
        >
          Announcements
        </h4>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="p-6 rounded-lg border text-center" style={{ borderColor: isDarkMode ? currentColors.border : "black" }}>
            <div className="flex flex-col items-center gap-3">
              <Megaphone size={32} className="text-gray-400" />
              <div>
                <p 
                  className="text-sm font-medium mb-1"
                  style={{ color: isDarkMode ? "white" : "black" }}
                >
                  No announcements yet
                </p>
                <p 
                  className="text-xs"
                  style={{ color: isDarkMode ? currentColors.textSecondary : "#666666" }}
                >
                  Admin hasn't posted any announcements at the moment
                </p>
              </div>
            </div>
          </div>
        ) : (
          visible.map((announcement) => (
            <div
              key={announcement.id}
              className="p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(31, 41, 55, 0.5)"
                  : currentColors.surface,
                backdropFilter: isDarkMode ? "blur(10px)" : "none",
                borderColor: isDarkMode
                  ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                  : "black",
              }}
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? "white" : "black" }}
                  >
                    {announcement.title}
                  </p>
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#666666",
                    }}
                  >
                    {announcement.message}
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{
                      color: isDarkMode
                        ? currentColors.textSecondary
                        : "#666666",
                    }}
                  >
                    {announcement.date}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    announcement.priority === "high"
                      ? "bg-red-600 text-white"
                      : "bg-yellow-600 text-white"
                  }`}
                >
                  {announcement.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => navigate("/notifications", { state: { filter: "announcements" } })}
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: isDarkMode ? "#60A5FA" : "#007AFF" }}
        >
          View All Announcements →
        </button>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: currentColors.surface }}
          >
            <div
              className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: currentColors.border }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: currentColors.text }}
              >
                {selectedAnnouncement.title}
              </h2>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-2xl hover:opacity-80"
                style={{ color: currentColors.textSecondary }}
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedAnnouncement.priority === "high"
                        ? "bg-red-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {selectedAnnouncement.priority.toUpperCase()}
                  </span>
                  <p
                    className="text-sm"
                    style={{ color: currentColors.textSecondary }}
                  >
                    {selectedAnnouncement.date}
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(31, 41, 55, 0.5)"
                      : currentColors.surface,
                    backdropFilter: isDarkMode ? "blur(10px)" : "none",
                    borderColor: isDarkMode
                      ? "rgb(55 65 81 / var(--tw-border-opacity, 1))"
                      : "black",
                  }}
                >
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: currentColors.text }}
                  >
                    {selectedAnnouncement.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncementByAdmin;
