import React, { useState } from "react";
import Button from "../../component/Button";


const AnnouncementForm = ({
  formData,
  setFormData,
  publishOption,
  setPublishOption,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onClear,
  editingAnnouncement
}) => {

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;

    setIsPublishing(true);

    try {
      await onCreateAnnouncement();
    } finally {
      setTimeout(() => {
        setIsPublishing(false);
      }, 3000); // 3 seconds disable
    }
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
        </h1>
        <p className="text-gray-600">
          {editingAnnouncement ? "Update announcement details" : "Create and publish announcements for students and faculty"}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter announcement title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
            placeholder="Write your announcement content..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">Target Audience</label>
          <select
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Users</option>
            <option value="faculty">Professors Only</option>
            <option value="students">Students Only</option>
          </select>
        </div>

        

        <div className="flex flex-col sm:flex-row justify-end items-center mt-6 gap-3">
          <Button
            className="h-12 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3"
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
          className="flex h-12 justify-between items-center bg-[#007AFF] hover:bg-blue-700 text-white px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? "Publishing..." : "Publish Announcement"}
        </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;
