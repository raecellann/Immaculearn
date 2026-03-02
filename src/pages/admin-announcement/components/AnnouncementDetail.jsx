import React from "react";
import Button from "../../component/Button";
import { Calendar, Clock, User, FileText } from "lucide-react";

const AnnouncementDetail = ({
  selectedAnnouncement,
  onBack,
  onDelete,
  onEdit,
  getPriorityColor,
  getStatusColor,
  formatDate
}) => {
  // Handle undefined selectedAnnouncement
  if (!selectedAnnouncement) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="text-center py-8">
          <p className="text-gray-600">No announcement selected</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-800 bg-transparent border-none"
          >
            ← Back to announcements
          </button>
        </div>
      </div>
    );
  }

  // Handle attachments safely
  const attachments = selectedAnnouncement.attachments || [];
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="w-full">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 bg-transparent border-none p-2 text-lg font-medium transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            {selectedAnnouncement.announcement_title || selectedAnnouncement.title || 'Untitled'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{selectedAnnouncement.created_by || selectedAnnouncement.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedAnnouncement.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{selectedAnnouncement.time || '12:00 PM'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedAnnouncement.priority || 'normal')}`}>
            {selectedAnnouncement.priority || 'normal'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAnnouncement.announcement_status || selectedAnnouncement.status || 'draft')}`}>
            {selectedAnnouncement.announcement_status || selectedAnnouncement.status || 'draft'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {selectedAnnouncement.announcement_content || selectedAnnouncement.content || 'No content available'}
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Attachments
          </h3>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-900">{attachment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          onClick={() => onDelete(selectedAnnouncement.announce_id)}
        >
          Delete
        </Button>
        <Button
          className="w-full sm:w-auto bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2"
          onClick={() => onEdit(selectedAnnouncement)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
