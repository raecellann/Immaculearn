import React, { useState, useRef } from "react";
import Button from "../../component/Button";
import { Image, X, Upload } from "lucide-react";


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
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const currentImages = formData.images || [];
    
    // Limit to 2 images total
    const availableSlots = 2 - currentImages.length;
    const newFiles = files.slice(0, availableSlots);
    
    if (newFiles.length === 0) {
      return;
    }

    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Update form data with new files
    setFormData({
      ...formData,
      images: [...currentImages, ...newFiles]
    });
    
    // Update previews
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the object URL to avoid memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setFormData({
      ...formData,
      images: newImages
    });
    setImagePreviews(newPreviews);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Images <span className="text-gray-500 text-xs">(Maximum 2 images)</span>
          </label>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Image upload area */}
          <div className="space-y-3">
            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add more images button */}
            {(formData.images || []).length < 2 && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-5 h-5" />
                <span>Add Image{imagePreviews.length === 0 ? 's' : ''}</span>
              </button>
            )}
            
            {/* Image limit indicator */}
            <div className="text-xs text-gray-500">
              {imagePreviews.length}/2 images uploaded
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">Target Audience</label>
          <select
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Users</option>
            <option value="TEACHERS">Professors Only</option>
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
