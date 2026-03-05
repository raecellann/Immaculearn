import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../component/sidebar";
import InputField from "../component/InputField";
import Button from "../component/Button";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { useSpace } from "../../contexts/space/useSpace";
import { toast } from "react-toastify";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const CreateSpaceAdmin = () => {
  const { createSpace } = useSpace();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [people, setPeople] = useState(Array(5).fill(""));
  const [charCount, setCharCount] = useState(0);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState(
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/lecture_gtow4u.jpg",
  );
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Error states for validation
  const [spaceNameError, setSpaceNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [coverPhotoError, setCoverPhotoError] = useState(false);

  // Cover photo positioning state (same as UserTaskPage)
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPhotoPosition, setCoverPhotoPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const coverPhotoInputRef = useRef(null);
  const coverPhotoEditorRef = useRef(null);

  /* STICKY HEADER LOGIC */
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        coverPhotoEditorRef.current &&
        !coverPhotoEditorRef.current.contains(e.target)
      ) {
        setShowCoverPhotoEditor(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const galleryImages = [
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/lecture_gtow4u.jpg",
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809913/uts_k4mlri.jpg",
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/thesis_jmvpxb.jpg",
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/pe_bf0fbt.jpg",
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/modtech_e8tski.jpg",
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809911/datastructure_ekrsn5.jpg",
  ];

  useEffect(() => {
    setPeople(Array(5).fill(""));
  }, []);

  // Word count handler
  const handleShortDescriptionChange = (e) => {
    const text = e.target.value;
    setPeople([text, ...people.slice(1)]);

    // Count characters
    const count = text.length;

    // Limit to 100 characters
    if (count <= 100) {
      setPeople([text, ...people.slice(1)]);
      setCharCount(count);
    }

    // Clear description error when user starts typing
    if (text.trim()) {
      setDescriptionError(false);
    }
  };

  const handleSpaceNameChange = (e) => {
    const value = e.target.value.slice(0, 50);
    setSpaceName(value);
    // Clear space name error when user starts typing
    if (value.trim()) {
      setSpaceNameError(false);
    }
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Clear cover photo error when user selects a file
      setCoverPhotoError(false);

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setUploadedImage(file);

      // Create preview and open editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target.result);
        setShowCoverPhotoEditor(true);
        setCoverPhotoPosition(50);
        setIsCoverModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSpace = async () => {
    // Reset error states
    setSpaceNameError(false);
    setDescriptionError(false);
    setCoverPhotoError(false);

    let hasErrors = false;

    // Validate space name
    if (!spaceName.trim()) {
      setSpaceNameError(true);
      hasErrors = true;
    }

    // Validate description
    if (!people[0].trim() || charCount === 0) {
      setDescriptionError(true);
      hasErrors = true;
    }

    if (charCount > 100) {
      setDescriptionError(true);
      hasErrors = true;
    }

    // Validate cover photo
    if (!coverImage || coverImage === "") {
      setCoverPhotoError(true);
      hasErrors = true;
    }

    // If there are validation errors, prevent creation
    if (hasErrors) {
      return;
    }

    try {
      setIsLoading(true);
      // Prepare data for API
      const spaceData = {
        space_name: spaceName,
        max_members: 5,
        short_description: people[0] || "",
        space_cover: coverImage,
      };

      // Call the API
      const result = await createSpace(spaceData);

      if (result.success) {
        const space_uuid = result.space_uuid;
        toast.success(`Space "${spaceName}" created successfully!`);
        // alert(`Space "${spaceName}" created successfully!`);

        localStorage.setItem(`coverPhoto_${space_uuid}`, coverImage);
        // Save cover photo to localStorage for immediate display
        window.dispatchEvent(
          new CustomEvent("coverPhotoUpdated", {
            detail: { space_uuid, coverPhoto: coverImage },
          }),
        );

        // Reset form
        setSpaceName("");
        setPeople(Array(5).fill(""));
        setCharCount(0);
        setCoverImage(
          "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/lecture_gtow4u.jpg",
        );
        // Reset error states
        setSpaceNameError(false);
        setDescriptionError(false);
        setCoverPhotoError(false);
        navigate(`/space/${space_uuid}/${spaceName}`);
      } else {
        alert(result.message || "Failed to create space. Please try again.");
      }
    } catch (error) {
      console.error("Create space error:", error);
      alert("An error occurred while creating the space.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartPosition(coverPhotoPosition);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartY;
      const containerHeight = coverPhotoEditorRef.current?.offsetHeight || 400;
      const positionChange = (deltaY / containerHeight) * 100;
      const newPosition = Math.max(
        0,
        Math.min(100, dragStartPosition - positionChange),
      );

      setCoverPhotoPosition(newPosition);
    },
    [isDragging, dragStartY, dragStartPosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCoverPhotoSave = () => {
    // Create canvas to apply transformations
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size to cover photo dimensions
      canvas.width = 1200;
      canvas.height = 400;

      // Calculate scale to fit
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
      setCoverImage(dataUrl);

      setShowCoverPhotoEditor(false);
    };

    img.src = coverImage;
  };

  const handleCoverPhotoCancel = () => {
    setShowCoverPhotoEditor(false);
    setUploadedImage(null);
    // Don't clear coverImage on cancel, keep the existing cover photo
    setCoverPhotoPosition(50);
    if (coverPhotoInputRef.current) {
      coverPhotoInputRef.current.value = "";
    }
  };

  return (
    <div
      className="flex min-h-screen font-inter"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ================= MOBILE + TABLET OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= MOBILE + TABLET SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: currentColors.surface,
          color: currentColors.text,
        }}
      >
        <Sidebar />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* MOBILE + TABLET STICKY HEADER */}
        <div
          className={`lg:hidden p-4 border-b flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">Create New Space</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <h1 className="text-xl lg:text-4xl font-bold text-center mb-4 lg:mb-10">
              Create New Space, Here!
            </h1>

            <div
              className="rounded-xl p-4 lg:p-6 w-full mx-auto"
              style={{ backgroundColor: currentColors.surface }}
            >
              {/* COVER PHOTO EDITOR MODAL */}
              {showCoverPhotoEditor && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#1E222A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                      <h2 className="text-sm lg:text-lg font-semibold text-white">
                        Position Cover Photo
                      </h2>
                      <button
                        onClick={handleCoverPhotoCancel}
                        className="text-gray-400 hover:text-white p-1 bg-transparent"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-6">
                        <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                          <div
                            ref={coverPhotoEditorRef}
                            className={`relative w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                            style={{
                              backgroundImage: `url(${coverImage})`,
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
                        <p className="text-xs lg:text-sm text-gray-400 mt-2">
                          Click and drag the image up or down to position it
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                      <button
                        onClick={handleCoverPhotoCancel}
                        className="px-2 lg:px-4 py-2 text-xs lg:text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCoverPhotoSave}
                        className="px-2 lg:px-4 py-2 text-xs lg:text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition text-white"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Image */}
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className={`w-full h-32 sm:h-44 object-cover rounded-lg ${coverPhotoError ? "border-2 border-red-500" : ""}`}
                  style={{
                    background: coverImage.includes("gradient")
                      ? coverImage
                      : "",
                  }}
                />
                {coverPhotoError && (
                  <p className="text-red-500 text-xs mt-1">
                    Please select a cover photo
                  </p>
                )}
                <div className="absolute top-2 right-3 flex flex-wrap gap-1 sm:gap-2">
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                    onClick={() => setIsCoverModalOpen(true)}
                  >
                    Change Cover
                  </button>
                  <button
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                    onClick={() => setCoverImage("")}
                  >
                    Delete Cover
                  </button>
                </div>
              </div>

              {/* Cover Modal */}
              {isCoverModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                  <div
                    className="rounded-lg p-4 sm:p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
                    style={{ backgroundColor: currentColors.surface }}
                  >
                    <button
                      className="absolute top-2 right-2"
                      onClick={() => setIsCoverModalOpen(false)}
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-sm lg:text-lg font-semibold mb-4">
                      Edit Cover Photo
                    </h3>
                    <p className="text-xs lg:text-sm mb-2">Color & Gradient</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {colorOptions.map((color, i) => (
                        <div
                          key={i}
                          className="h-12 rounded cursor-pointer"
                          style={{ background: color }}
                          onClick={() => {
                            setCoverImage(color);
                            setIsCoverModalOpen(false);
                            setCoverPhotoError(false); // Clear error when gradient is selected
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs lg:text-sm mb-2">Gallery</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {galleryImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="h-16 w-full object-cover rounded cursor-pointer"
                          onClick={() => {
                            setCoverImage(img);
                            setOriginalImage(img);
                            setIsCoverModalOpen(false);
                            setCoverPhotoError(false); // Clear error when gallery image is selected
                          }}
                        />
                      ))}
                    </div>
                    <label className="block text-xs lg:text-sm mb-1">
                      Upload from computer (max 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoChange}
                      className="w-full text-xs lg:text-sm p-2 rounded"
                      style={{
                        backgroundColor: isDarkMode ? "#1E1E1E" : "#f8fafc",
                        color: currentColors.text,
                        borderColor: currentColors.border,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────
                  ROW 1: Space Name 
                  Mobile: stacked
                  Tablet+: Space Name takes 3/4
              ───────────────────────────────────────────────── */}
              <div className="mt-6">
                {/* Space Name */}
                <div>
                  <label className="block text-xs lg:text-sm font-medium mb-2">
                    Space Name
                  </label>
                  <InputField
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={handleSpaceNameChange}
                    maxLength={50}
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      border: spaceNameError
                        ? "2px solid #ef4444"
                        : "1px solid #d1d5db",
                      fontSize: "0.875rem", // 14px on mobile, will be overridden by larger screens
                    }}
                    className="text-sm sm:text-base"
                  />
                  {spaceNameError && (
                    <p className="text-red-500 text-xs mt-1">
                      Space name is required
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className="text-xs lg:text-xs"
                      style={{ color: currentColors.textSecondary }}
                    >
                      Enter a name for your space
                    </span>
                    <span
                      className="text-xs lg:text-xs font-medium"
                      style={{
                        color:
                          spaceName.length >= 50
                            ? "#ef4444"
                            : spaceName.length >= 40
                              ? "#f59e0b"
                              : currentColors.textSecondary,
                      }}
                    >
                      {spaceName.length}/50 characters
                    </span>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────
                  ROW 2: Short Description — full width at bottom
              ───────────────────────────────────────────────── */}
              <div className="mt-5">
                <label className="block text-xs lg:text-sm font-medium mb-2">
                  Short Description
                </label>
                <InputField
                  placeholder="Brief description for this space"
                  value={people[0]}
                  onChange={handleShortDescriptionChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: descriptionError
                      ? "2px solid #ef4444"
                      : "1px solid #d1d5db",
                    fontSize: "0.875rem", // 14px on mobile, will be overridden by larger screens
                  }}
                  className="text-sm sm:text-base"
                />
                {descriptionError && (
                  <p className="text-red-500 text-xs mt-1">
                    {!people[0].trim() || wordCount === 0
                      ? "Short description is required"
                      : "Short description exceeds 100 characters"}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className="text-xs lg:text-xs"
                    style={{ color: currentColors.textSecondary }}
                  >
                    Describe what this space is about
                  </span>
                  <span
                    className="text-xs lg:text-xs font-medium"
                    style={{
                      color:
                        charCount >= 100
                          ? "#ef4444"
                          : charCount >= 90
                            ? "#f59e0b"
                            : currentColors.textSecondary,
                    }}
                  >
                    {charCount}/100 characters
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  className="px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-xs w-full sm:w-auto transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? "#3E3E3E" : "#e5e7eb",
                    color: currentColors.text,
                  }}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <Button
                  onClick={handleCreateSpace}
                  disabled={isLoading}
                  className="text-xs lg:text-xs w-full sm:w-auto"
                  style={{ backgroundColor: "#007AFF", color: "white" }}
                >
                  Create Space
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceAdmin;
