import React, { useState, useEffect, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import Sidebar from "../component/sidebar";
import InputField from "../component/InputField";
import Button from "../component/Button";
import { ChevronDown, X } from "lucide-react";
// import { useSpace } from "../../contexts/space/spaceContext";
import { useNavigate } from "react-router";
import { useSpace } from "../../contexts/space/useSpace";
import { toast } from "react-toastify";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";

const CreateSpaceAdmin = () => {
  const { createSpace } = useSpace();
  const navigate = useNavigate();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [numMembers, setNumMembers] = useState(5);
  const [people, setPeople] = useState(Array(5).fill(""));
  const [wordCount, setWordCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState("https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/lecture_gtow4u.jpg");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const memberOptions = [2, 3, 4, 5, 6, 7, 8, 9];

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
    setPeople(Array(numMembers).fill(""));
  }, [numMembers]);

  // Word count handler
  const handleShortDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    
    if (count <= 100) {
      setPeople([text, ...people.slice(1)]);
      setWordCount(count);
    }
  };

  const handleCreateSpace = async () => {
    if (spaceName.trim()) {
      try {
        // Prepare data for API
        const spaceData = {
          space_name: spaceName,
          max_members: numMembers,
          short_description: people[0] || "",
          cover_image: coverImage
        };

        // Call the API
        const result = await createSpace(spaceData);

        if (result.success) {
          const space_uuid = result.space_uuid;
          toast.success(`Space "${spaceName}" created successfully!`)
          // alert(`Space "${spaceName}" created successfully!`);
          
          // Reset form
          setSpaceName("");
          setPeople(Array(5).fill(""));
          setWordCount(0);
          setNumMembers(5);
          setCoverImage("/src/assets/HomePage/Spaces-Cover/cover1.jpg");
          navigate(`/space/${space_uuid}/${spaceName}`)
        } else {
          alert(result.message || "Failed to create space. Please try again.");
        }
      } catch (error) {
        console.error("Create space error:", error);
        alert("An error occurred while creating the space.");
      }
    } else {
      if (!spaceName.trim()) {
        alert("Please enter a space name.");
      } else if (wordCount > 100) {
        alert("Short description exceeds 100 words.");
      }
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setOriginalImage(url); // Store original image
    setIsCropping(true);
    setIsCoverModalOpen(false); // Close the modal after file selection
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async (imageSrc, croppedAreaPixels) => {
    // Always use the original image for cropping
    const image = new Image();
    image.src = originalImage || imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, "image/jpeg");
      };
    });
  };

  const handleCropSave = async () => {
    if ((originalImage || uploadedImage) && croppedAreaPixels) {
      const croppedImageUrl = await createCroppedImage(uploadedImage, croppedAreaPixels);
      setCoverImage(croppedImageUrl);
      setIsCropping(false);
      // Don't clear uploadedImage or originalImage to allow re-cropping
      setIsCoverModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen font-inter" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>

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
          color: currentColors.text
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
            color: isDarkMode ? "white" : currentColors.text
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-2xl p-0 focus:outline-none"
            style={{ color: isDarkMode ? "white" : currentColors.text }}
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Create New Space</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <h1 className="hidden lg:block text-4xl font-bold text-center mb-6 lg:mb-10">Create New Space, Here!</h1>

            <div className="rounded-xl p-4 lg:p-6 w-full mx-auto" style={{ backgroundColor: currentColors.surface }}>

              {/* CROP MODAL */}
              {isCropping && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="rounded-xl p-4 w-full max-w-4xl relative" style={{ backgroundColor: currentColors.surface }}>
                    <button
                      className="absolute top-3 right-3 p-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                      onClick={() => setIsCropping(false)}
                    >
                      <X size={20} style={{ color: 'white' }} />
                    </button>
                    <div className="relative w-full h-[300px] sm:h-[350px] md:h-[420px] rounded-lg overflow-hidden bg-black">
                      <Cropper
                        image={uploadedImage}
                        crop={crop}
                        zoom={zoom}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        zoomWithScroll={true}
                        showGrid={false}
                      />
                    </div>
                    <div className="flex items-center justify-center mt-4">
                      <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-1/2 sm:w-2/3" />
                    </div>
                    <div className="flex justify-end mt-5 gap-2">
                      <button className="px-4 py-2 text-sm rounded-lg" style={{ backgroundColor: isDarkMode ? '#444' : '#6b7280', color: 'white' }} onClick={() => setIsCropping(false)}>Cancel</button>
                      <button className="px-4 py-2 text-sm rounded-lg" style={{ backgroundColor: '#007AFF', color: 'white' }} onClick={handleCropSave}>Apply</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Image */}
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-32 sm:h-44 object-cover rounded-lg"
                  style={{ background: coverImage.includes("gradient") ? coverImage : "" }}
                />
                <div className="absolute top-2 right-3 flex flex-wrap gap-1 sm:gap-2">
                  <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={() => setIsCoverModalOpen(true)}>Change Cover</button>
                  {!coverImage.includes("gradient") && originalImage && (
                    <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={() => { setUploadedImage(originalImage); setIsCropping(true); }}>Crop</button>
                  )}
                  <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={() => setCoverImage("")}>Delete Cover</button>
                </div>
              </div>

              {/* Cover Modal */}
              {isCoverModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                  <div className="rounded-lg p-4 sm:p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" style={{ backgroundColor: currentColors.surface }}>
                    <button className="absolute top-2 right-2" onClick={() => setIsCoverModalOpen(false)}><X size={20} /></button>
                    <h3 className="text-lg font-semibold mb-4">Edit Cover Photo</h3>
                    <p className="text-sm mb-2">Color & Gradient</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {colorOptions.map((color, i) => (
                        <div key={i} className="h-12 rounded cursor-pointer" style={{ background: color }} onClick={() => { setCoverImage(color); setIsCoverModalOpen(false); }} />
                      ))}
                    </div>
                    <p className="text-sm mb-2">Gallery</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {galleryImages.map((img, i) => (
                        <img key={i} src={img} className="h-16 w-full object-cover rounded cursor-pointer" onClick={() => { setCoverImage(img); setOriginalImage(img); setIsCoverModalOpen(false); }} />
                      ))}
                    </div>
                    <label className="block text-sm mb-1">Upload from computer (max 5MB)</label>
                    <input type="file" accept="image/*" onChange={handleUpload} className="w-full text-sm p-2 rounded" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#f8fafc', color: currentColors.text, borderColor: currentColors.border }} />
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────
                  ROW 1: Space Name | Max Members
                  Mobile: stacked
                  Tablet+: Space Name takes 3/4, Members 1/4
              ───────────────────────────────────────────────── */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4 items-end">
                {/* Space Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Space Name</label>
                  <InputField
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#ffffff" }}
                  />
                </div>

                {/* Max Members — custom dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-medium mb-2">Max Members</label>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      borderColor: isDropdownOpen ? '#007AFF' : currentColors.border,
                      color: currentColors.text,
                      outline: 'none',
                    }}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    <span className="flex items-center gap-2">
                      {/* people icon */}
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">{numMembers} members</span>
                    </span>
                    <ChevronDown
                      size={16}
                      className="transition-transform duration-200"
                      style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                  </button>

                  {/* Dropdown list */}
                  {isDropdownOpen && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-20 shadow-lg"
                      style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', border: `1px solid ${currentColors.border}` }}
                    >
                      {memberOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left"
                          style={{
                            backgroundColor: numMembers === option
                              ? (isDarkMode ? '#1d4ed8' : '#eff6ff')
                              : 'transparent',
                            color: numMembers === option
                              ? (isDarkMode ? '#bfdbfe' : '#1d4ed8')
                              : currentColors.text,
                          }}
                          onMouseEnter={(e) => {
                            if (numMembers !== option) e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                          }}
                          onMouseLeave={(e) => {
                            if (numMembers !== option) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => { setNumMembers(option); setIsDropdownOpen(false); }}
                        >
                          <span>{option} members</span>
                          {numMembers === option && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────
                  ROW 2: Short Description — full width at bottom
              ───────────────────────────────────────────────── */}
              <div className="mt-5">
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <InputField
                  placeholder="Enter a brief description for this space"
                  value={people[0]}
                  onChange={handleShortDescriptionChange}
                  style={{ width: "100%", backgroundColor: "#ffffff" }}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs" style={{ color: currentColors.textSecondary }}>Describe what this space is about</span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: wordCount >= 100 ? '#ef4444' : wordCount >= 90 ? '#f59e0b' : currentColors.textSecondary
                    }}
                  >
                    {wordCount}/100 words
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  className="px-6 py-2 rounded-lg text-xs w-full sm:w-auto transition-colors"
                  style={{ backgroundColor: isDarkMode ? '#3E3E3E' : '#e5e7eb', color: currentColors.text }}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <Button onClick={handleCreateSpace} className="text-xs w-full sm:w-auto" style={{ backgroundColor: '#007AFF', color: 'white' }}>
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