import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiMenu, FiX, FiChevronLeft, FiUpload, FiMessageSquare } from "react-icons/fi";
import Logout from "../component/logout";
import DeleteButton from "../component/DeleteButton";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { toast } from "react-toastify";

const ProfPeoplePage = () => {
  const { user } = useUser();
  const { addNotification } = useNotification();
  const { userSpaces, courseSpaces, removeUserFromSpace, userSpacesLoading, courseSpacesLoading, isLoading } = useSpace();
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
  const [previousCoverPhotoUrl, setPreviousCoverPhotoUrl] = useState(null);
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPhotoPosition, setCoverPhotoPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const [showCoverPhotoConfirm, setShowCoverPhotoConfirm] = useState(false);
  const coverPhotoInputRef = useRef(null);
  const coverPhotoEditorRef = useRef(null);

  // Gradient color options for cover photo
  const colorOptions = [
    "linear-gradient(45deg, #FFC107, #FF5722)",
    "linear-gradient(45deg, #3F51B5, #2196F3)",
    "linear-gradient(45deg, #9C27B0, #673AB7)",
    "linear-gradient(45deg, #E91E63, #F44336)",
    "linear-gradient(45deg, #4CAF50, #8BC34A)",
    "linear-gradient(45deg, #FF9800, #FFC107)",
    "linear-gradient(45deg, #00BCD4, #009688)",
    "linear-gradient(45deg, #795548, #607D8B)",
  ];

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
    const newPosition = Math.max(
      0,
      Math.min(100, dragStartPosition - positionChange),
    );

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

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStartY, dragStartPosition]);

  const handleCoverPhotoClick = () => {
    if (isOwner) {
      coverPhotoInputRef.current?.click();
    }
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please upload an image smaller than 5MB");
        return;
      }

      setCoverPhoto(file);

      // Create preview and open editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
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
    // Check if it's a gradient or an image
    if (coverPhotoUrl && coverPhotoUrl.includes('gradient')) {
      // For gradients, save directly without canvas transformations
      // Backend will handle saving the space_cover
      setShowCoverPhotoEditor(false);
      setShowCoverPhotoConfirm(false);

      addNotification({
        type: "success",
        title: "Cover Photo Updated",
        message: "Your cover photo has been updated successfully!",
        duration: 3000,
      });
    } else {
      // For images, create canvas to apply transformations
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas size to cover photo dimensions
        canvas.width = 1200;
        canvas.height = 400;

        // Calculate scale to cover the entire canvas
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate position based on user vertical positioning
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) * (coverPhotoPosition / 100);

        // Draw the image with transformations
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to data URL and update
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCoverPhotoUrl(dataUrl);

        // Backend will handle saving the space_cover
        setShowCoverPhotoEditor(false);
        setShowCoverPhotoConfirm(false);

        addNotification({
          type: "success",
          title: "Cover Photo Updated",
          message: "Your cover photo has been updated successfully!",
          duration: 3000,
        });
      };

      img.onerror = () => {
        addNotification({
          type: "error",
          title: "Image Load Failed",
          message: "Failed to load image. Please try again.",
          duration: 3000,
        });
        setShowCoverPhotoConfirm(false);
      };

      img.src = coverPhotoUrl;
    }
  };

  const handleCancelCoverPhoto = () => {
    setShowCoverPhotoConfirm(false);
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setCoverPhoto(null);
    // Restore previous cover photo URL
    setCoverPhotoUrl(previousCoverPhotoUrl);
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  // Handle gradient selection for cover photo
  const handleGradientSelection = (gradient) => {
    setPreviousCoverPhotoUrl(coverPhotoUrl); // Save previous URL
    setCoverPhotoUrl(gradient);
    setShowCoverPhotoConfirm(true); // Show confirmation dialog for gradients
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  const resetCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoPosition(50);
    // Backend will handle removing the space_cover
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  // Combine user and friend spaces
  const allSpaces = [...(userSpaces || []), ...(courseSpaces || [])];
  const activeSpace = allSpaces.find((s) => s.space_uuid === space_uuid);

  // Load saved cover photo from backend on component mount
  useEffect(() => {
    const savedCoverPhoto = activeSpace?.space_cover;
    if (savedCoverPhoto) {
      setCoverPhotoUrl(savedCoverPhoto);
    }
  }, [activeSpace]);

  // Show loading state while data is being fetched
  if (userSpacesLoading || courseSpacesLoading || isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen font-sans"
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-lg">Loading space...</p>
        </div>
      </div>
    );
  }

  // Handle not found (only after loading is complete)
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

  // Determine if this is a classroom space and who should be displayed as adviser/admin
  const isClassroomSpace = activeSpace.space_type === "course";
  const adviserInfo = isClassroomSpace ? activeSpace?.professor : creator;

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
              {coverPhotoUrl.includes('gradient') ? (
                <div
                  className="w-full h-full"
                  style={{ background: coverPhotoUrl }}
                />
              ) : (
                <img
                  src={coverPhotoUrl}
                  alt="Space Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40" />
              {isOwner && (
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
              {isOwner && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiUpload size={16} />
                    <span className="text-sm">Upload Cover Photo</span>
                  </div>
                </div>
              )}
            </>
          )}
          {isOwner && (
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleCoverPhotoChange}
              className="hidden"
            />
          )}
        </div>

        {/* MOBILE/TABLET SPACE INFO — sits below cover photo, fully readable */}
        {(activeSpace?.space_type === "course" || activeSpace?.space_day || activeSpace?.space_section || activeSpace?.space_schedule) && (
        <div
          className="lg:hidden px-4 py-3 border-b"
          style={{
            backgroundColor: currentColors.surface + "CC", // Add 80% opacity
            borderColor: currentColors.border + "CC", // Add 80% opacity to border
            backdropFilter: "blur(8px)"
          }}
        >
          <div className="flex flex-col gap-2">
            {/* Schedule */}
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold w-20 shrink-0 pt-0.5" style={{ color: currentColors.text }}>
                Schedule
              </span>
              <span className="text-xs flex-1 break-words" style={{ color: currentColors.textSecondary }}>
                {activeSpace?.space_schedule ||
                  activeSpace?.schedule ||
                  activeSpace?.class_schedule ||
                  (activeSpace?.space_day && activeSpace?.space_time
                    ? `${activeSpace.space_day} ${activeSpace.space_time}`
                    : activeSpace?.space_day
                      ? `${activeSpace.space_day} — No time set`
                      : "No schedule set"
                  )
                }
              </span>
            </div>

            {/* Section */}
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold w-20 shrink-0 pt-0.5" style={{ color: currentColors.text }}>
                Section
              </span>
              <span className="text-xs flex-1 break-words" style={{ color: currentColors.textSecondary }}>
                {activeSpace?.space_section ||
                  activeSpace?.section ||
                  activeSpace?.class_section ||
                  activeSpace?.section_name ||
                  activeSpace?.course_section ||
                  activeSpace?.subject_section ||
                  activeSpace?.space_block ||
                  activeSpace?.block ||
                  "N/A"
                }
              </span>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold w-20 shrink-0 pt-0.5" style={{ color: currentColors.text }}>
                Description
              </span>
              <span className="text-xs flex-1 break-words" style={{ color: currentColors.textSecondary }}>
                {activeSpace?.space_description || 
                  (activeSpace?.space_type === "course" 
                    ? "Course space for lectures, assignments, and discussions."
                    : "Collaborative space for sharing ideas and resources."
                  )
                }
              </span>
            </div>
          </div>
        </div>
        )}

        {/* DESKTOP SPACE INFO OVERLAY */}
        {(activeSpace?.space_type === "course" || activeSpace?.space_day || activeSpace?.space_section || activeSpace?.space_schedule) && (
        <div className="hidden lg:block">
          <div 
            className="absolute top-4 right-4 p-4 rounded-lg border z-10"
            style={{
              backgroundColor: currentColors.surface + "CC", // Add 80% opacity (CC in hex)
              borderColor: currentColors.border + "CC", // Add 80% opacity to border
              maxWidth: "1000px",
              backdropFilter: "blur(8px)" // Add subtle blur for better readability
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {/* Schedule */}
              <div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: currentColors.text }}>
                  Schedule
                </h3>
                <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                  {activeSpace?.space_schedule ||
                    activeSpace?.schedule ||
                    activeSpace?.class_schedule ||
                    (activeSpace?.space_day && activeSpace?.space_time
                      ? `${activeSpace.space_day} ${activeSpace.space_time}`
                      : activeSpace?.space_day
                        ? `${activeSpace.space_day} — No time set`
                        : "No schedule set"
                    )
                  }
                </p>
              </div>

              {/* Section */}
              <div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: currentColors.text }}>
                  Section
                </h3>
                <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                  {activeSpace?.space_section ||
                    activeSpace?.section ||
                    activeSpace?.class_section ||
                    activeSpace?.section_name ||
                    activeSpace?.course_section ||
                    activeSpace?.subject_section ||
                    activeSpace?.space_block ||
                    activeSpace?.block ||
                    "N/A"
                  }
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: currentColors.text }}>
                  Description
                </h3>
                <p className="text-sm line-clamp-3" style={{ color: currentColors.textSecondary }}>
                  {activeSpace?.space_description || 
                    (activeSpace?.space_type === "course" 
                      ? "Course space for lectures, assignments, and discussions."
                      : "Collaborative space for sharing ideas and resources."
                    )
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

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

          {/* CREATOR / ADVISER SECTION */}
          {adviserInfo && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {isClassroomSpace ? "Owner" : "Professor"}
              </h2>
              <div
                className="border-t pt-4"
                style={{ borderColor: currentColors.border }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      adviserInfo.profile_pic ||
                      adviserInfo?.avatar ||
                      "/src/assets/default-avatar.jpg"
                    }
                    alt={adviserInfo.name || adviserInfo.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">
                    {adviserInfo.account_id === user.id
                      ? `${user?.name?.split(' ')[0] || 'You'} ${user?.name?.split(' ')[1]?.[0] ? user.name.split(' ')[1][0] + '.' : ''}`
                      : (adviserInfo.name || adviserInfo.full_name)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {!activeSpace?.professor ? "Members" : "Students"}
            </h2>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('/prof/chats')}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            border: '1px solid #3B82F6'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#2563EB';
                            e.target.style.borderColor = '#2563EB';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#3B82F6';
                            e.target.style.borderColor = '#3B82F6';
                          }}
                          title="Message"
                        >
                          <FiMessageSquare size={16} />
                        </button>
                        <DeleteButton
                          onClick={() => handleRemoveMember(member)}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: currentColors.textSecondary }}>
                  No students yet.
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
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                  color: isDarkMode ? '#FFFFFF' : '#111827',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#6B7280' : '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isDarkMode ? '#4B5563' : '#D1D5DB';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white"
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
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo
              </h2>
              <button
                onClick={handleCoverPhotoCancel}
                className="text-gray-400 hover:text-white p-1 bg-transparent"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Gradient Options */}
              <div className="mb-6">
                <p className="text-sm font-medium text-white mb-3">Color & Gradient</p>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className="h-12 rounded cursor-pointer border-2 border-gray-600 hover:border-blue-500 transition-colors"
                      style={{ background: color }}
                      onClick={() => handleGradientSelection(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Separator Line */}
              <div className="relative flex items-center my-4">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-3 text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Upload Option (only show when gradient is selected) */}
              {coverPhotoUrl && coverPhotoUrl.includes('gradient') && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => coverPhotoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <FiUpload size={14} />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}

              {/* Image Positioning (only show if it's an image, not gradient) */}
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-white mb-3">Position Image</p>
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      ref={coverPhotoEditorRef}
                      className={`relative w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                      style={{
                        backgroundImage: `url(${coverPhotoUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: `center ${coverPhotoPosition}%`,
                        backgroundRepeat: "no-repeat",
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
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCoverPhotoCancel}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
              >
                Cancel
              </button>
              {coverPhotoUrl && !coverPhotoUrl.includes('gradient') && (
                <button
                  onClick={handleCoverPhotoSave}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                >
                  Apply
                </button>
              )}
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
              <h2 className="text-lg font-semibold text-white">
                Change Cover Photo?
              </h2>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300">
                Do you want to change the cover photo for this space with the
                image you uploaded?
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
