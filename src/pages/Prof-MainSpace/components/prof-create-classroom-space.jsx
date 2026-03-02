import React, { useState, useEffect, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import Sidebar from "../../component/profsidebar";
import InputField from "../../component/InputField";
import Button from "../../component/Button";
import { X } from "lucide-react";
import Logout from "../../component/logout";
import { useNavigate } from "react-router";
import { useUser } from "../../../contexts/user/useUser";
import { useSpace } from "../../../contexts/space/useSpace";
import { toast } from "react-toastify";
import { useSpaceTheme } from "../../../contexts/theme/useSpaceTheme";

const ProfCreateClassroomSpace = () => {
  const { createCourseSpace } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const spaceSettings = useRef({ space_cover: null, max_member: 50 });

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const navigator = useNavigate();

  // Cover image state
  const [coverImage, setCoverImage] = useState(
    "https://res.cloudinary.com/dpxfbom0j/image/upload/v1768809912/lecture_gtow4u.jpg",
  );
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // New state for year level, schedule, and time
  const [yearLevel, setYearLevel] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [timeSchedule, setTimeSchedule] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [sectionContent, setSectionContent] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState({
    hour: 8,
    minute: 0,
    period: "AM",
  });
  const [endTime, setEndTime] = useState({ hour: 10, minute: 0, period: "AM" });

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

  const daysOfWeek = [
    { label: "M", value: "Monday" },
    { label: "T", value: "Tuesday" },
    { label: "W", value: "Wednesday" },
    { label: "THU", value: "Thursday" },
    { label: "F", value: "Friday" },
    { label: "SAT", value: "Saturday" },
    { label: "SUN", value: "Sunday" },
  ];

  // Word count handler
  const handleShortDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const count = words.length;

    if (count <= 100) {
      setShortDescription(text);
      setWordCount(count);
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDay((prev) => (prev === day ? "" : day));
  };

  const handleSectionContentChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 2);
    setSectionContent(value);
  };

  const formatTime = (time) => {
    const { hour, minute, period } = time;
    const displayHour = hour === 12 ? 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let period of ["AM", "PM"]) {
      for (
        let hour = period === "AM" ? 1 : 12;
        hour <= (period === "AM" ? 12 : 11);
        hour++
      ) {
        for (let minute = 0; minute < 60; minute += 15) {
          options.push({ hour, minute, period });
        }
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleCreateCourseSpace = async () => {
    if (spaceName.trim()) {
      try {
        console.log(timeSchedule);
        // Parse time schedule to get start and end times
        const timeParts = timeSchedule.split(" - ");
        const timeStart = timeParts[0] || "";
        const timeEnd = timeParts[1] || "";

        // Convert 12-hour format to 24-hour format
        const convertTo24Hour = (timeStr) => {
          const [time, period] = timeStr.split(" ");
          const [hour, minute] = time.split(":");
          let hour24 = parseInt(hour);

          if (period === "PM" && hour24 !== 12) {
            hour24 += 12;
          } else if (period === "AM" && hour24 === 12) {
            hour24 = 0;
          }

          return `${hour24.toString().padStart(2, "0")}:${minute}`;
        };

        const timeStart24 = convertTo24Hour(timeStart);
        const timeEnd24 = convertTo24Hour(timeEnd);

        // Prepare data for API - align with required body structure
        const spaceData = {
          space_name: spaceName,
          space_description: shortDescription,
          section_content: sectionContent,
          space_day: selectedDay,
          space_time_start: timeStart24,
          space_time_end: timeEnd24,
          space_yr_lvl: parseInt(yearLevel) || 1,
          space_settings: spaceSettings.current,
        };

        // Call the API
        const result = await createCourseSpace(spaceData);

        if (result.success) {
          const space_uuid = result?.space_uuid;
          console.log(space_uuid);
          toast.success(`Course Space "${spaceName}" created successfully!`);

          // Reset form
          setSpaceName("");
          setShortDescription("");
          setWordCount(0);
          setSectionContent("");
          setCoverImage("/src/assets/HomePage/Spaces-Cover/cover1.jpg");
          setYearLevel("");
          setSelectedDay("");
          setTimeSchedule("");
          navigator(`/prof/space/${space_uuid}/${spaceName}`);
        } else {
          alert(result.message || "Failed to create space. Please try again.");
        }
      } catch (error) {
        console.error("Create space error:", error);
        alert("An error occurred while creating the space.");
      }
    } else {
      alert("Please enter a space name.");
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
    setOriginalImage(url);
    setIsCropping(true);
    setIsCoverModalOpen(false);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async (imageSrc, croppedAreaPixels) => {
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
          croppedAreaPixels.height,
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
      const croppedImageUrl = await createCroppedImage(
        uploadedImage,
        croppedAreaPixels,
      );
      setCoverImage(croppedImageUrl);
      setIsCropping(false);
      setIsCoverModalOpen(false);
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
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
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
          <h1 className="text-xl font-bold">Create Classroom Space</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <h1 className="hidden lg:block text-4xl font-bold text-center mb-6 lg:mb-10">
              Create New Classroom Space, Here!
            </h1>

            <div
              className="rounded-xl p-4 lg:p-6 w-full mx-auto"
              style={{
                backgroundColor: currentColors.surface,
              }}
            >
              {/* 🔵 CROP MODAL */}
              {isCropping && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div
                    className="rounded-xl p-4 w-full max-w-4xl relative"
                    style={{
                      backgroundColor: currentColors.surface,
                    }}
                  >
                    <button
                      className="absolute top-3 right-3 p-1 rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      onClick={() => setIsCropping(false)}
                    >
                      <X size={20} style={{ color: "white" }} />
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
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value)}
                        className="w-1/2 sm:w-2/3"
                      />
                    </div>

                    <div className="flex justify-end mt-5 gap-2">
                      <button
                        className="px-4 py-2 text-sm rounded-lg transition-colors"
                        style={{
                          backgroundColor: isDarkMode ? "#444" : "#6b7280",
                          color: "white",
                        }}
                        onClick={() => setIsCropping(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 text-sm rounded-lg transition-colors"
                        style={{ backgroundColor: "#007AFF", color: "white" }}
                        onClick={handleCropSave}
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
                  className="w-full h-32 sm:h-44 object-cover rounded-lg"
                  style={{
                    background: coverImage.includes("gradient")
                      ? coverImage
                      : "",
                  }}
                />
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
                  {!coverImage.includes("gradient") && originalImage && (
                    <button
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                      }}
                      onClick={() => {
                        setUploadedImage(originalImage);
                        setIsCropping(true);
                      }}
                    >
                      Crop
                    </button>
                  )}
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
                    style={{
                      backgroundColor: currentColors.surface,
                    }}
                  >
                    <button
                      className="absolute top-2 right-2"
                      onClick={() => setIsCoverModalOpen(false)}
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-lg font-semibold mb-4">
                      Edit Cover Photo
                    </h3>
                    <p className="text-sm mb-2">Color & Gradient</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {colorOptions.map((color, i) => (
                        <div
                          key={i}
                          className="h-12 rounded cursor-pointer"
                          style={{ background: color }}
                          onClick={() => {
                            setCoverImage(color);
                            setIsCoverModalOpen(false);
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm mb-2">Gallery</p>
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
                          }}
                        />
                      ))}
                    </div>
                    <label className="block text-sm mb-1">
                      Upload from computer (max 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="w-full text-sm p-2 rounded"
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
                  ROW 1: Space Name | Year Level | Section
                  Mobile: stacked full-width
                  Tablet (sm): Space Name full-row, then Year + Section side-by-side
                  Desktop (lg): all three in one row
              ───────────────────────────────────────────────── */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_100px] gap-4">
                {/* Space Name — takes full width on mobile, full row on sm, flex-1 on lg */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium mb-2">
                    Space Name
                  </label>
                  <InputField
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#ffffff" }}
                  />
                </div>

                {/* Year Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year Level
                  </label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                      borderColor: currentColors.border,
                      color: currentColors.text,
                    }}
                  >
                    <option value="">Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Section
                  </label>
                  <InputField
                    placeholder="e.g. A"
                    value={sectionContent}
                    onChange={handleSectionContentChange}
                    maxLength={2}
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              </div>

              {/* ─────────────────────────────────────────────────
                  ROW 2: Schedule Days | Time Schedule
                  Mobile: stacked
                  Tablet+: side by side
              ───────────────────────────────────────────────── */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Schedule Days */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Schedule Day
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleDayToggle(day.value)}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor:
                            selectedDay === day.value
                              ? "#007AFF"
                              : isDarkMode
                                ? "#3E3E3E"
                                : "#e5e7eb",
                          color:
                            selectedDay === day.value
                              ? "white"
                              : isDarkMode
                                ? "#d1d5db"
                                : "#374151",
                          boxShadow:
                            selectedDay === day.value
                              ? "0 4px 12px rgba(0, 122, 255, 0.3)"
                              : "none",
                        }}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {selectedDay && (
                    <p
                      className="text-xs mt-2"
                      style={{ color: currentColors.textSecondary }}
                    >
                      Selected: {selectedDay}
                    </p>
                  )}
                </div>

                {/* Time Schedule */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time Schedule
                  </label>
                  <div
                    className="p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                      borderColor: currentColors.border,
                      color: currentColors.text,
                    }}
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: isDarkMode ? "#d1d5db" : "#4b5563" }}
                      >
                        {timeSchedule || "Click to set time"}
                      </span>
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────
                  ROW 3: Short Description — full width at bottom
              ───────────────────────────────────────────────── */}
              <div className="mt-5">
                <label className="block text-sm font-medium mb-2">
                  Short Description
                </label>
                <InputField
                  placeholder="Enter a brief description for this classroom space"
                  value={shortDescription}
                  onChange={handleShortDescriptionChange}
                  style={{ width: "100%", backgroundColor: "#ffffff" }}
                />
                <div
                  className="text-xs mt-1.5 flex justify-between items-center"
                  style={{ color: currentColors.textSecondary }}
                >
                  <span>Describe what this space is about</span>
                  <span
                    style={{
                      color:
                        wordCount >= 90
                          ? "#f59e0b"
                          : wordCount >= 100
                            ? "#ef4444"
                            : currentColors.textSecondary,
                    }}
                  >
                    {wordCount}/100 words
                  </span>
                </div>
              </div>

              {/* Time Picker Modal */}
              {showTimePicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div
                    className="rounded-xl p-6 w-full max-w-sm"
                    style={{ backgroundColor: currentColors.surface }}
                  >
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: currentColors.text }}
                    >
                      Set Time Schedule
                    </h3>
                    <div className="space-y-4">
                      {/* Start Time */}
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: currentColors.textSecondary }}
                        >
                          Start Time
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          <select
                            value={startTime.hour}
                            onChange={(e) =>
                              setStartTime({
                                ...startTime,
                                hour: parseInt(e.target.value),
                              })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (h) => (
                                <option key={h} value={h}>
                                  {h === 12 ? 12 : h}
                                </option>
                              ),
                            )}
                          </select>
                          <select
                            value={startTime.minute}
                            onChange={(e) =>
                              setStartTime({
                                ...startTime,
                                minute: parseInt(e.target.value),
                              })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            <option value={0}>00</option>
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                          </select>
                          <select
                            value={startTime.period}
                            onChange={(e) =>
                              setStartTime({
                                ...startTime,
                                period: e.target.value,
                              })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      {/* End Time */}
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: currentColors.textSecondary }}
                        >
                          End Time
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          <select
                            value={endTime.hour}
                            onChange={(e) =>
                              setEndTime({
                                ...endTime,
                                hour: parseInt(e.target.value),
                              })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (h) => (
                                <option key={h} value={h}>
                                  {h === 12 ? 12 : h}
                                </option>
                              ),
                            )}
                          </select>
                          <select
                            value={endTime.minute}
                            onChange={(e) =>
                              setEndTime({
                                ...endTime,
                                minute: parseInt(e.target.value),
                              })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            <option value={0}>00</option>
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                          </select>
                          <select
                            value={endTime.period}
                            onChange={(e) =>
                              setEndTime({ ...endTime, period: e.target.value })
                            }
                            className="rounded-lg px-3 py-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#f3f4f6",
                              borderColor: currentColors.border,
                              color: currentColors.text,
                            }}
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowTimePicker(false)}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: isDarkMode ? "#6b7280" : "#e5e7eb",
                          color: currentColors.text,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const formattedTime = `${formatTime(startTime)} - ${formatTime(endTime)}`;
                          setTimeSchedule(formattedTime);
                          setShowTimePicker(false);
                        }}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: "#007AFF", color: "white" }}
                      >
                        Set Time
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  className="px-6 py-2 rounded-lg text-xs w-full sm:w-auto transition-colors"
                  style={{
                    backgroundColor: isDarkMode ? "#3E3E3E" : "#e5e7eb",
                    color: currentColors.text,
                  }}
                  onClick={() => navigator(-1)}
                >
                  Cancel
                </button>
                <Button
                  onClick={handleCreateCourseSpace}
                  className="text-xs w-full sm:w-auto"
                  style={{ backgroundColor: "#007AFF", color: "white" }}
                >
                  Create Space
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfCreateClassroomSpace;
