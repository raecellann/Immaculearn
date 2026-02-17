import React, { useState, useEffect } from "react";
import Sidebar from "../component/profsidebar";
import Button from "../component/Button";
import { useUser } from "../../contexts/user/useUser";
import { useNavigate } from "react-router";

const ProfProfilePage = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');

  const [department, setDepartment] = useState(user?.department || '');
  const [gender, setGender] = useState(user?.gender || '')
  const [bio, setBio] = useState(user?.bio || '');


  const getCurrentSchoolYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const schoolYear = getCurrentSchoolYear();

  const profileName = isEditing 
    ? `${firstName} ${lastName}`.trim()
    : user?.name || '';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  // Handle save profile
  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the user profile
    const updatedProfile = {
      name: `${firstName} ${lastName}`,
      department: department,
      bio: bio,
      gender : gender,
      profile_pic: profileImage
    };
    
    console.log('Updated profile:', updatedProfile);
    
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
    setLastName(user?.name?.split(' ')[1] || '');
    setDepartment(user?.department || '');
    setGender(user?.gender || '');
    setBio(user?.bio || '');
    setIsEditing(false);
  };

  useEffect(() => {
    if (user?.profile_pic) {
      setProfileImage(user.profile_pic);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return navigate('/login')
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white font-grotesque">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ MOBILE / TABLET HEADER */}
        <div
          className="
            lg:hidden
            sticky top-0 z-30
            bg-[#1E222A]
            px-4
            pt-[env(safe-area-inset-top)]
            border-b border-[#3B4457]
          "
        >
          <div className="flex items-center h-14">
            {/* Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="text-2xl bg-transparent p-0 border-none focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              ☰
            </button>

            {/* Title */}
            <h1 className="ml-4 text-lg font-bold truncate">
              Your Profile
            </h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block px-10 pt-10">
          <h1 className="text-4xl font-bold text-center mb-2">
            Your Profile
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            View and edit all your information here
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 pb-10">
          <div className="max-w-5xl mx-auto mt-6 lg:mt-10">
            <div className="flex flex-col lg:flex-row gap-8 justify-center">
              {/* Profile Card */}
              <div className="bg-[#1E222A] rounded-2xl p-6 w-full sm:w-80 text-center shadow-lg border border-white mx-auto lg:mx-0">
                <input
                  type="file"
                  id="upload-img"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <div
                  className="mt-4 cursor-pointer group"
                  onClick={() =>
                    document.getElementById("upload-img").click()
                  }
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-36 h-36 mx-auto rounded-xl object-cover border-4 border-[#3A7BFF] group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-36 h-36 mx-auto rounded-xl border-4 border-dashed border-[#3A7BFF] flex items-center justify-center text-gray-400 text-sm group-hover:text-white transition">
                      Upload Image
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold mt-4">{profileName}</h2>
                <p className="text-[#3A7BFF] mt-1 text-sm font-medium">
                  {user?.role || 'Professor'}
                </p>
              </div>

              {/* Personal Details */}
              <div className="bg-[#1E222A] rounded-2xl flex-1 p-6 sm:p-8 border border-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Personal Details</h3>
                  {!isEditing ? (
                    <Button 
                      onClick={handleEditProfile}
                      className="text-xs px-3 py-1"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveProfile}
                        className="text-xs bg-green-600 px-3 py-1 rounded-md font-semibold hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-xs bg-gray-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  
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
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={isEditing ? lastName : (user?.name?.split(' ')[1] || '')}
                      onChange={(e) => isEditing && setLastName(e.target.value)}
                      placeholder="Last Name"
                      readOnly={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-full"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                    <input
                      type="text"
                      value={isEditing ? department : (user?.department || '')}
                      onChange={(e) => isEditing && setDepartment(e.target.value)}
                      placeholder="Last Name"
                      readOnly={!isEditing}
                      className="bg-[#2A2E36] p-2 rounded-md border border-white outline-none text-white w-full"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                    
                  <input
                    type="text"
                    value={isEditing ? gender : (user?.gender || '')}
                    onChange={(e) => isEditing && setGender(e.target.value)}
                    placeholder="Last Name"
                    readOnly={!isEditing}
                    className="bg-[#2A2E36] p-2 rounded-md outline-none text-white border border-white"
                  />
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
                </div>



                <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                    
                <textarea
                  value={isEditing ? bio : (user?.bio || 'A good teacher can inspire hope, ignite the imagination, and instill a love of learning.')}
                  onChange={(e) => isEditing && setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  readOnly={!isEditing}
                  className="bg-[#2A2E36] p-3 rounded-md w-full h-24 outline-none text-white resize-none border border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfProfilePage;
