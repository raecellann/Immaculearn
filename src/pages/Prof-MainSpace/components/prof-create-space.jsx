import React, { useState, useEffect, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import Sidebar from "../../component/profsidebar";
import InputField from "../../component/InputField";
import Button from "../../component/Button";
import { X } from "lucide-react";
import Logout from "../../component/logout";
import { useNavigate } from "react-router";

const ProfCreateSpace = () => {
  const navigator = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState("/src/assets/HomePage/spaces-cover/cover1.jpg");
  const [uploadedImage, setUploadedImage] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  /* 🔹 STICKY HEADER LOGIC */
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
    "/src/assets/HomePage/spaces-cover/cover1.jpg",
    "/src/assets/HomePage/spaces-cover/cover2.jpg",
    "/src/assets/HomePage/spaces-cover/cover3.jpg",
    "/src/assets/HomePage/spaces-cover/grades.jpg",
    "/src/assets/HomePage/spaces-cover/lectures.jpg",
    "/src/assets/HomePage/spaces-cover/space-board.jpg",
  ];

  const handleCreateSpace = () => {
    if (spaceName.trim()) {
      alert(`Space "${spaceName}" created!`);
      setSpaceName("");
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
    setIsCropping(true);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async (imageSrc, croppedAreaPixels) => {
    const image = new Image();
    image.src = imageSrc;

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
    if (uploadedImage && croppedAreaPixels) {
      const croppedImageUrl = await createCroppedImage(uploadedImage, croppedAreaPixels);
      setCoverImage(croppedImageUrl);
      setIsCropping(false);
      setUploadedImage(null);
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

        {/* 🔹 MOBILE + TABLET STICKY HEADER */}
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
          <h1 className="text-xl font-bold">Create Space</h1>
        </div>

        {/* 🔹 Spacer for fixed header */}
        <div className="lg:hidden h-16" />

        {/* ================= PAGE CONTENT ================= */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <h1 className="hidden lg:block text-4xl font-bold text-center mb-6 lg:mb-10">Create New Space, Here!</h1>

          <div className="bg-[#2A2A2A] rounded-xl p-4 lg:p-6 w-full mx-auto max-w-4xl">

          {/* 🔵 TWITTER-STYLE CROP MODAL */}
          {isCropping && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1E1E1E] rounded-xl p-4 w-full max-w-4xl relative">

                {/* Close btn */}
                <button
                  className="absolute top-3 right-3 bg-black/60 p-1 rounded-full"
                  onClick={() => {
                    setIsCropping(false);
                    setUploadedImage(null);
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
                      setUploadedImage(null);
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
              style={{ background: coverImage.includes("gradient") ? coverImage : "" }}
            />

            <div className="absolute top-2 right-3 flex flex-wrap gap-1 sm:gap-2">
              <button
                className="text-white bg-black/50 px-2 py-1 rounded text-xs"
                onClick={() => setIsCoverModalOpen(true)}
              >
                Change Cover
              </button>

              {!coverImage.includes("gradient") && coverImage && (
                <button
                  className="text-white bg-black/50 px-2 py-1 rounded text-xs"
                  onClick={() => {
                    setUploadedImage(coverImage);
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
                <button className="absolute top-2 right-2" onClick={() => setIsCoverModalOpen(false)}>
                  <X size={20} />
                </button>

                <h3 className="text-lg font-semibold mb-4">Edit Cover Photo</h3>

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
                        setIsCoverModalOpen(false);
                      }}
                    />
                  ))}
                </div>

                {/* Upload */}
                <label className="block text-sm mb-1">Upload from computer (max 5MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="w-full bg-[#1E1E1E] text-sm p-2 rounded"
                />
              </div>
            </div>
          )}

          {/* Space Name */}
          <div className="mt-6">
            <label className="block text-sm mb-1">Space Name:</label>
            <InputField
              placeholder="Enter space name"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              style={{ width: "100%", backgroundColor: "#ffffff" }}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
            <button 
              className="bg-[#3E3E3E] px-6 py-2 rounded-lg hover:bg-[#4A4A4A] text-xs w-full sm:w-auto"
              onClick={() => navigator(-1)}
            >
              Cancel
            </button>

            <Button onClick={handleCreateSpace} className="bg-[#007AFF] hover:bg-[#2563eb] text-xs w-full sm:w-auto">
              Create Space
            </Button>
          </div>

        </div>
      </div>
    </div>

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfCreateSpace;