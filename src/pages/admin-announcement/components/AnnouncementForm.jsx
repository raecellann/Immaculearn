import React from "react";
import Button from "../../component/Button";

const AnnouncementForm = ({
  formData,
  setFormData,
  publishOption,
  setPublishOption,
  onCreateAnnouncement,
  onClear
}) => {
  return (
    <div className="bg-[#1E242E] rounded-xl p-6">
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
            className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter announcement title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write your announcement content..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="faculty">Professors Only</option>
              <option value="students">Students Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Publish Options</label>
            <select
              value={publishOption}
              onChange={(e) => setPublishOption(e.target.value)}
              className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="now">Publish Now</option>
              <option value="draft">Save as Draft</option>
              <option value="schedule">Schedule for Later</option>
            </select>
          </div>
        </div>

        {publishOption === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Schedule Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Schedule Time</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full bg-[#242B38] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end items-center mt-6 gap-3">
          <Button
            className="h-12 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
            className="flex h-12 justify-between items-center bg-[#007AFF] hover:bg-blue-700 text-white px-6 py-3"
            onClick={onCreateAnnouncement}
          >
            {publishOption === "now" ? "Publish Announcement" : publishOption === "draft" ? "Save as Draft" : "Schedule Announcement"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;
