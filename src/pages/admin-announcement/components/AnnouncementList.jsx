import React from "react";
import { Megaphone, Calendar } from "lucide-react";

const AnnouncementList = ({
  announcements,
  filteredAnnouncements,
  selectedAnnouncement,
  searchQuery,
  setSearchQuery,
  onAnnouncementClick,
  getPriorityColor,
  getStatusColor,
  formatDate
}) => {
  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col lg:sticky lg:top-0">
      <div className="bg-[#1E242E] rounded-xl p-4 mb-4">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* DESKTOP: Announcements List — grows to fill remaining height */}
      <div className="hidden lg:block bg-[#1E242E] rounded-xl p-4 overflow-y-auto"
        style={{ maxHeight: '70vh', scrollbarWidth: 'thin', scrollbarColor: '#4A5568 #1E242E' }}>
        <div className="space-y-3">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => onAnnouncementClick(announcement)}
                className={`p-5 rounded-lg border cursor-pointer transition-all hover:border-[#4A5568] ${
                  selectedAnnouncement?.id === announcement.id
                    ? "bg-[#242B38] border-[#007AFF]"
                    : "bg-[#1E242E] border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm line-clamp-2 flex-1">{announcement.title}</h3>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(announcement.status)}`}>
                      {announcement.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{announcement.content}</p>
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No announcements found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery ? `No announcements matching "${searchQuery}"` : "No announcements available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE/TABLET: Announcements Cards */}
      <div className="lg:hidden space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              onClick={() => onAnnouncementClick(announcement)}
              className="bg-[#1E242E] rounded-xl p-5 border border-gray-600 cursor-pointer hover:border-[#4A5568] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base flex-1">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(announcement.status)}`}>
                    {announcement.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">{announcement.content}</p>
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No announcements found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? `No announcements matching "${searchQuery}"` : "No announcements available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementList;
