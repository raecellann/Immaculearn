import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../component/sidebar";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";
import Logout from "../component/logout";
import Cropper from 'react-easy-crop';

const ProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  
  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [middleInitial, setMiddleInitial] = useState(user?.middleInitial || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [year, setYear] = useState(user?.year || '');
  const [course, setCourse] = useState(user?.course || '');

  // Calculate School Year (SY) based on current date
  const getCurrentSchoolYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // School year typically starts in June (month 5)
    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const schoolYear = getCurrentSchoolYear();

  const profileName = isEditing 
    ? `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`.trim()
    : user?.name || '';

  // Upload profile picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cropper functions
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    const image = new Image();
    image.src = selectedImage;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    setProfileImage(croppedImageUrl);
    setShowCropper(false);
    setSelectedImage(null);
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  // Handle save profile
  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the user profile
    const updatedProfile = {
      name: `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`,
      middleInitial: middleInitial,
      bio: bio,
      year: year,
      course: course,
      profile_pic: profileImage
    };
    
    console.log('Updated profile:', updatedProfile);
    
    // Simulate updating the user context (in real app, this would be an API call)
    // For now, we'll update the local state to show the changes
    if (typeof window !== 'undefined') {
      // Store in localStorage to persist changes
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
    
    // Show success message
    alert('Profile updated successfully!');
    setIsEditing(false);
    
    // Force a re-render to show the updated data
    window.location.reload();
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset to original values
    setFirstName(user?.name?.split(' ')[0] || '');
    setMiddleInitial(user?.middleInitial || '');
    setLastName(user?.name?.split(' ')[1] || '');
    setBio(user?.bio || '');
    setYear(user?.year || '');
    setCourse(user?.course || '');
    setIsEditing(false);
  };

  useEffect(() => {
    if (user?.profile_pic) {
      setProfileImage(user.profile_pic);
    }
  }, [user]);

  // 🔹 ADDED: hide-on-scroll header
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

  useEffect(() => {
    if (!isAuthenticated) return navigate('/login')
  }, [isAuthenticated]);

  return (
    <div className="flex font-grotesque min-h-screen bg-[#161A20] text-white leading-[1.2] font-semibold">

      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Mobile + Tablet Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onLogoutClick={() => setShowLogout(true)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">

        {/* Mobile + Tablet Header with hide-on-scroll */}
        <div
          className={`lg:hidden bg-[#1E222A] p-4 border-b border-gray-700 flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Your Profile</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="lg:hidden h-16"></div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-10 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">

            {/* Title (Laptop & Desktop only) */}
            <div className="hidden lg:block mb-8 text-center">
              <h1 className="hidden lg:block text-4xl font-bold mb-6 lg:mb-10 font-grotesque text-center">
                Your Profile
              </h1>
              <p className="text-gray-300">
                View and edit all your information here
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">

              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-4 lg:p-6 w-full xl:w-80 2xl:w-96 mx-auto xl:mx-0 text-center shadow-lg border border-white h-fit">
                <input
                  type="file"
                  id="upload-img"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div
                  className="mt-2 lg:mt-4 cursor-pointer group relative"
                  onClick={() =>
                    document.getElementById("upload-img").click()
                  }
                >
                  {profileImage ? (
                    <div className="relative inline-block">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition w-32 h-32 lg:w-40 lg:h-40">
                        <div className="text-center">
                          <svg className="w-6 h-6 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-white text-xs font-medium">Change Avatar</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xs">Upload Image</p>
                      </div>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-3 lg:mt-4">
                  {profileName}
                </h2>
                <p className="text-[#3A7BFF] mt-1 text-sm font-medium">
                  {user && user.role}
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-4 lg:p-6 xl:p-8 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  {!isEditing ? (
                    <button 
                      onClick={handleEditProfile}
                      className="text-xs bg-[#3A7BFF] px-3 py-2 rounded-md font-semibold hover:bg-[#5592ff] transition"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveProfile}
                        className="text-xs bg-green-600 px-3 py-2 rounded-md font-semibold hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-xs bg-gray-600 px-3 py-2 rounded-md font-semibold hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={isEditing ? firstName : (user?.name?.split(' ')[0] || '')}
                      onChange={(e) => isEditing && setFirstName(e.target.value)}
                      placeholder="First Name"
                      readOnly={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Middle Initial</label>
                    <input
                      type="text"
                      value={isEditing ? middleInitial : (user?.middleInitial || '')}
                      onChange={(e) => isEditing && setMiddleInitial(e.target.value)}
                      placeholder="MI"
                      maxLength="1"
                      readOnly={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-full"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={isEditing ? lastName : (user?.name?.split(' ')[1] || '')}
                    onChange={(e) => isEditing && setLastName(e.target.value)}
                    placeholder="Last Name"
                    readOnly={!isEditing}
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-1/2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Course</label>
                    <input
                      type="text"
                      value={isEditing ? course : (user?.course || '')}
                      onChange={(e) => isEditing && setCourse(e.target.value)}
                      placeholder="e.g., Computer Science, Business, Engineering"
                      readOnly={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Year Level</label>
                    <select
                      value={year || ''}
                      onChange={(e) => isEditing && setYear(e.target.value)}
                      disabled={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-32 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-1">School Year (SY)</label>
                  <input
                    type="text"
                    value={schoolYear}
                    readOnly
                    className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-32 opacity-60"
                  />
                  <p className="text-xs text-gray-400 mt-1">Automatically calculated based on current date</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={isEditing ? bio : (user?.bio || '')}
                    onChange={(e) => isEditing && setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    readOnly={!isEditing}
                    className="bg-[#2A2E36] p-3 rounded-md w-full h-24 border border-white outline-none resize-none text-white"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* IMAGE CROPPER MODAL */}
      {showCropper && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E222A] rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Crop Profile Picture</h2>
              <button
                onClick={cancelCrop}
                className="text-gray-400 text-2xl bg-transparent border-none outline-none hover:bg-transparent hover:text-gray-400 focus:outline-none focus:ring-0"
              >
                ×
              </button>
            </div>

            <div className="relative w-full h-80 bg-black rounded-lg mb-4">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelCrop}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogout && <Logout onClose={() => setShowLogout(false)} />}
    </div>
  );
};

export default ProfilePage;
