import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiMenu, FiX, FiChevronLeft, FiUpload } from "react-icons/fi";
import Logout from "../component/logout";
import DeleteButton from "../component/DeleteButton";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useNotification } from "../../contexts/notification/notificationContextProvider";

const ProfPeoplePage = () => {
  const { user } = useUser();
  const { addNotification } = useNotification();
  const { userSpaces, courseSpaces, removeUserFromSpace } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { space_uuid } = useParams();

  /* ================= HEADER + SIDEBAR ================= */
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const lastScrollY = useRef(0);

  // Cover photo state
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPhotoPosition, setCoverPhotoPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const [showCoverPhotoConfirm, setShowCoverPhotoConfirm] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const coverPhotoEditorRef = useRef(null);

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

  // Load saved cover photo on component mount
  useEffect(() => {
    const savedCoverPhoto = localStorage.getItem(`coverPhoto_${space_uuid}`);
    if (savedCoverPhoto) {
      setCoverPhotoUrl(savedCoverPhoto);
    }
  }, [space_uuid]);

  // Save cover photo to localStorage when it changes
  useEffect(() => {
    if (coverPhotoUrl && !showCoverPhotoEditor) {
      localStorage.setItem(`coverPhoto_${space_uuid}`, coverPhotoUrl);
    }
  }, [coverPhotoUrl, space_uuid, showCoverPhotoEditor]);

  // Cover photo drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPosition(coverPhotoPosition);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - dragStartY;
    const containerHeight = coverPhotoEditorRef.current?.offsetHeight || 400;
    const positionChange = (deltaY / containerHeight) * 100;
    const newPosition = Math.max(0, Math.min(100, dragStartPosition - positionChange));
    
    setCoverPhotoPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  // Cover photo handlers
  const handleCoverPhotoClick = () => {
    if (activeSpace?.creator?.account_id === user?.id) {
      coverPhotoInputRef.current?.click();
    }
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        addNotification({
          type: "error",
          title: "Invalid File",
          message: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
          duration: 3000,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File Too Large",
          message: "Please upload an image smaller than 5MB",
          duration: 3000,
        });
        return;
      }

      setCoverPhoto(file);

      // Create preview and open editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoUrl(e.target.result);
        setShowCoverPhotoEditor(true);
        setCoverPhotoPosition(50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoSave = () => {
    setShowCoverPhotoConfirm(true);
  };

  const handleConfirmCoverPhoto = () => {
    // Create canvas to apply transformations
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to cover photo dimensions
      canvas.width = 1200;
      canvas.height = 400;
      
      // Calculate scale to cover the entire canvas
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Calculate position based on user vertical positioning
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);
      
      // Draw the image with transformations
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert to data URL and update
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCoverPhotoUrl(dataUrl);
      
      // Save to localStorage
      localStorage.setItem(`coverPhoto_${space_uuid}`, dataUrl);
      
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);
      
      addNotification({
        type: "success",
        title: "Cover Photo Updated",
        message: "Your cover photo has been updated successfully!",
        duration: 3000,
      });
    };
    
    img.src = coverPhotoUrl;
  };

  const handleCancelCoverPhoto = () => {
    setShowCoverPhotoConfirm(false);
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setCoverPhoto(null);
    // Don't clear coverPhotoUrl on cancel, keep the existing cover photo
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  const resetCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoPosition(50);
    // Remove from localStorage
    localStorage.removeItem(`coverPhoto_${space_uuid}`);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = '';
    }
  };

  // Combine user and friend spaces
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || [])];
  const activeSpace = allSpaces.find((s) => s.space_uuid === space_uuid);

  // Handle not found
  if (!activeSpace) {
    return (
      <div
        className="flex items-center justify-center min-h-screen font-sans"
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
        }}
      >
        <p className="text-xl">Space not found.</p>
      </div>
    );
  }

  // Separate creator/admin and other members
  const creator = activeSpace.members.find((m) => m.role === "creator") || {
    account_id: user.id,
    full_name: "You",
    profile_pic: user.profile_pic,
    role: "creator",
  };
  const otherMembers = activeSpace.members.filter((m) => m.role !== "creator");

  // Check if current user is the creator/owner of the space
  const isOwner = creator.account_id === user.id;

  console.log(activeSpace);

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveWarning(true);
  };

  const confirmRemoveMember = async () => {
    try {
      await removeUserFromSpace(
        activeSpace?.space_id,
        memberToRemove.account_id,
      );
      setShowRemoveWarning(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveWarning(false);
    setMemberToRemove(null);
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE/TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        style={{
          backgroundColor: currentColors.surface,
        }}
      >
        <ProfSidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col w-full">
        {/* ================= HEADER ================= */}
        <div
          className={`lg:hidden p-4 border-b
          flex items-center gap-4 fixed top-0 left-0 right-0 z-30
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="bg-transparent border-none text-2xl p-0"
            style={{ color: currentColors.text }}
          >
            {mobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-bold">
            People – {activeSpace.space_name}
          </h1>
        </div>

        {/* HEADER SPACER */}
        <div className="lg:hidden h-16" />

        {/* ================= COVER ================= */}
        <div 
          className="relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          onClick={handleCoverPhotoClick}
        >
          {coverPhotoUrl ? (
            <>
              <img 
                src={coverPhotoUrl} 
                alt="Space Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
              {activeSpace?.creator?.account_id === user?.id && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Change Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className="absolute inset-0 bg-black/30" />
              {activeSpace?.creator?.account_id === user?.id && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Upload Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          )}
          {activeSpace?.creator?.account_id === user?.id && (
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          )}
        </div>

        {/* PAGE HEADER */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              People – {activeSpace.space_name}
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 transition"
              style={{ color: currentColors.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.color = currentColors.text;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = currentColors.textSecondary;
              }}
            >
              <FiChevronLeft />
              Back
            </button>
          </div>

          {/* CREATOR / ADMIN SECTION */}
          {creator && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Adviser</h2>
              <div
                className="border-t pt-4"
                style={{ borderColor: currentColors.border }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      creator.profile_pic || "/src/assets/default-avatar.jpg"
                    }
                    alt={creator.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{creator.full_name}</span>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Students</h2>
            <div
              className="border-t pt-4 space-y-4"
              style={{ borderColor: currentColors.border }}
            >
              {otherMembers.length > 0 ? (
                otherMembers.map((member) => (
                  <div
                    key={member.account_id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          member.profile_pic || "/src/assets/default-avatar.jpg"
                        }
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span>
                        {member.account_id !== user.id
                          ? member.full_name
                          : "You"}
                      </span>
                    </div>
                    {isOwner && member.account_id !== user.id && (
                      <DeleteButton
                        onClick={() => handleRemoveMember(member)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: currentColors.textSecondary }}>
                  No members yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}

      {/* REMOVE MEMBER WARNING MODAL */}
      {showRemoveWarning && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-lg p-6 max-w-md w-full"
            style={{ backgroundColor: currentColors.surface }}
          >
            <p className="mb-6" style={{ color: currentColors.textSecondary }}>
              Are you sure you want to remove{" "}
              <span
                className="font-medium"
                style={{ color: currentColors.text }}
              >
                {memberToRemove.full_name}
              </span>{" "}
              from this space? They will lose access to all content and
              resources in this space.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRemoveMember}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COVER PHOTO EDITOR MODAL */}
      {showCoverPhotoEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Position Cover Photo</h2>
              <button
                onClick={handleCoverPhotoCancel}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Preview Area */}
              <div className="mb-6">
                <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    ref={coverPhotoEditorRef}
                    className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                    style={{
                      backgroundImage: `url(${coverPhotoUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `center ${coverPhotoPosition}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                    onMouseDown={handleMouseDown}
                  />
                  <div className="absolute inset-0 border-2 border-white/30 pointer-events-none" />
                  {isDragging && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      Dragging...
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Click and drag the image up or down to position it
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCoverPhotoCancel}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCoverPhotoSave}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COVER PHOTO CONFIRMATION DIALOG */}
      {showCoverPhotoConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E222A] rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Change Cover Photo?</h2>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300">
                Do you want to change the cover photo for this space with the image you uploaded?
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCancelCoverPhoto}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCoverPhoto}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
              >
                Change Cover Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfPeoplePage;
