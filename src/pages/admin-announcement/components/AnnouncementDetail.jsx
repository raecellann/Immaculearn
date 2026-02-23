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
  return (
    <div className="bg-[#1E242E] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="w-full">
          <button
            onClick={onBack}
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

      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
      </div>

      {selectedAnnouncement.attachments.length > 0 && (
        <div className="mb-6">
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
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          onClick={() => onDelete(selectedAnnouncement.id)}
        >
          Delete
        </Button>
        <Button
          className="w-full sm:w-auto bg-[#007AFF] hover:bg-blue-700 text-wh  ite px-4 py-2"
          onClick={() => onEdit(selectedAnnouncement)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
