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

const ProfCreateClassroomSpace = () => {
  const { createCourseSpace } = useSpace();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const spaceSettings = useRef({ space_cover: null, max_member: 50 });

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const navigator = useNavigate();

  // Cover image state
  const [coverImage, setCoverImage] = useState(
    "/src/assets/HomePage/Spaces-Cover/cover1.jpg",
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
  const [selectedDays, setSelectedDays] = useState("");
  const [timeSchedule, setTimeSchedule] = useState("");
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
    "/src/assets/HomePage/Spaces-Cover/cover1.jpg",
    "/src/assets/HomePage/Spaces-Cover/cover2.jpg",
    "/src/assets/HomePage/Spaces-Cover/cover3.jpg",
    "/src/assets/HomePage/Spaces-Cover/grades.jpg",
    "/src/assets/HomePage/Spaces-Cover/lectures.jpg",
    "/src/assets/HomePage/Spaces-Cover/space-board.jpg",
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

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
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
          space_day: selectedDays.join(", "), // Convert array to string
          space_time_start: timeStart24,
          space_time_end: timeEnd24,
          space_yr_lvl: parseInt(yearLevel) || 1, // Convert to number, default to 1
          space_settings: spaceSettings.current, // This contains space_cover and max_member
        };

        // Call the API
        const result = await createCourseSpace(spaceData);

        if (result.success) {
          const space_uuid = result?.space_uuid;
          console.log(space_uuid);
          toast.success(`Course Space "${spaceName}" created successfully!`);
          // alert(`Space "${spaceName}" created successfully!`);

          // Reset form
          setSpaceName("");
          setCoverImage("/src/assets/HomePage/Spaces-Cover/cover1.jpg");
          setYearLevel("");
          setSelectedDays([]);
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
      // Don't clear uploadedImage or originalImage to allow re-cropping
      setIsCoverModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-inter">
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* 📹 MOBILE + TABLET STICKY HEADER */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Create Classroom Space</h1>
        </div>

        {/* 📹 Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <h1 className="hidden lg:block text-4xl font-bold text-center mb-6 lg:mb-10">
              Create New Classroom Space, Here!
            </h1>

            <div className="bg-[#2A2A2A] rounded-xl p-4 lg:p-6 w-full mx-auto">
              {/* 🔵 TWITTER-STYLE CROP MODAL */}
              {isCropping && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#1E1E1E] rounded-xl p-4 w-full max-w-4xl relative">
                    {/* Close btn */}
                    <button
                      className="absolute top-3 right-3 bg-black/60 p-1 rounded-full"
                      onClick={() => {
                        setIsCropping(false);
                        // Don't clear the original image when closing cropper
                      }}
                    >
                      <X size={20} className="text-white" />
                    </button>

                    {/* Cropper area */}
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

                    {/* Zoom slider */}
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

                    {/* Buttons */}
                    <div className="flex justify-end mt-5 gap-2">
                      <button
                        className="px-4 py-2 text-sm bg-[#444] rounded-lg hover:bg-[#555]"
                        onClick={() => {
                          setIsCropping(false);
                          // Don't clear the original image when canceling
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="px-4 py-2 text-sm bg-[#007AFF] rounded-lg hover:bg-[#1A73E8]"
                        onClick={handleCropSave}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Normal Cover Image */}
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  style={{
                    background: coverImage.includes("gradient")
                      ? coverImage
                      : "",
                  }}
                />

                <div className="absolute top-2 right-3 flex flex-wrap gap-1 sm:gap-2">
                  <button
                    className="text-white bg-black/50 px-2 py-1 rounded text-xs"
                    onClick={() => setIsCoverModalOpen(true)}
                  >
                    Change Cover
                  </button>

                  {!coverImage.includes("gradient") && originalImage && (
                    <button
                      className="text-white bg-black/50 px-2 py-1 rounded text-xs"
                      onClick={() => {
                        setUploadedImage(originalImage); // Use original image for cropping
                        setIsCropping(true);
                      }}
                    >
                      Crop
                    </button>
                  )}

                  <button
                    className="text-white bg-black/50 px-2 py-1 rounded text-xs"
                    onClick={() => setCoverImage("")}
                  >
                    Delete Cover
                  </button>
                </div>
              </div>

              {/* Cover Modal */}
              {isCoverModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                  <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                    <button
                      className="absolute top-2 right-2"
                      onClick={() => setIsCoverModalOpen(false)}
                    >
                      <X size={20} />
                    </button>

                    <h3 className="text-lg font-semibold mb-4">
                      Edit Cover Photo
                    </h3>

                    {/* Color Gradient */}
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
                        ></div>
                      ))}
                    </div>

                    {/* Gallery */}
                    <p className="text-sm mb-2">Gallery</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {galleryImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="h-16 w-full object-cover rounded cursor-pointer"
                          onClick={() => {
                            setCoverImage(img);
                            setOriginalImage(img); // Set original image for gallery images
                            setIsCoverModalOpen(false);
                          }}
                        />
                      ))}
                    </div>

                    {/* Upload */}
                    <label className="block text-sm mb-1">
                      Upload from computer (max 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="w-full bg-[#1E1E1E] text-sm p-2 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Space Name and Year Level Row */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-3">Space Name:</label>
                  <InputField
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#ffffff" }}
                  />
                </div>
                <div className="sm:w-1/3">
                  <label className="block text-sm mb-3">Year Level:</label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full bg-white text-black p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="">Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Schedule Days and Time Schedule Row */}
              <div className="mt-8 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-3">Schedule Days:</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDays.includes(day.value)
                            ? "bg-[#007AFF] text-white"
                            : "bg-[#3E3E3E] text-gray-300 hover:bg-[#4A4A4A]"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Selected: {selectedDays.join(", ")}
                    </p>
                  )}
                </div>
                <div className="lg:w-1/2">
                  <label className="block text-sm mb-3">Time Schedule:</label>
                  <div
                    className="bg-white text-black p-3 rounded-lg border border-gray-300 cursor-pointer hover:border-[#007AFF] transition-colors"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        {timeSchedule || "Click to set time"}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-500"
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

              {/* Time Picker Modal */}
              {showTimePicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4 text-black">
                      Set Time Schedule
                    </h3>

                    <div className="space-y-4">
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
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
                            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-black"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowTimePicker(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const formattedTime = `${formatTime(startTime)} - ${formatTime(endTime)}`;
                          setTimeSchedule(formattedTime);
                          setShowTimePicker(false);
                        }}
                        className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                      >
                        Set Time
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                <button
                  className="bg-[#3E3E3E] px-6 py-2 rounded-lg hover:bg-[#4A4A4A] text-xs w-full sm:w-auto"
                  onClick={() => navigator(-1)}
                >
                  Cancel
                </button>

                <Button
                  onClick={handleCreateCourseSpace}
                  className="bg-[#007AFF] hover:bg-[#2563eb] text-xs w-full sm:w-auto"
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
