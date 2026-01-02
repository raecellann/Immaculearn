import React, { useState } from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiChevronLeft } from "react-icons/fi";

const ProfPeoplePage = () => {
  const navigate = useNavigate();

  // Admin info
  const admin = {
    name: "Joseph Bernard Reyes",
    src: "/src/assets/HomePage/jober.jpg",
  };

  // Members with individual profile pictures
  const initialMembers = [
    { name: "Zeldrick Jesus Delos Santos", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1760087780/zj_lswba7.jpg" },
    { name: "Raecell Ann Galvez", src: "https://res.cloudinary.com/diws5bcu6/image/upload/v1766419203/raecell_v0f5d1.jpg" },
    { name: "Nathaniel Faborada", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990148/nath_wml06m.jpg" },
    { name: "Wilson Esmobe", src: "https://res.cloudinary.com/dpxfbom0j/image/upload/v1766990149/wilson_gjdkdm.jpg" },
  ];

  const [members] = useState(initialMembers);

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <ProfSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER / BANNER */}
        <div className="relative mb-6">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Space Banner"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl rounded-t-none"
          />

          {/* TITLE */}
          <div className="absolute top-0 z-10">
            <div className="bg-black text-white px-10 py-3 rounded-b-[1rem] rounded-t-none shadow-lg text-2xl font-extrabold text-left">
              CS Thesis 2 Space
            </div>
          </div>
        </div>

        {/* TITLE ROW */}
        <div className="relative flex justify-between items-center mb-6">
          <div className="w-20"></div> {/* Spacer */}
          <h1 className="text-2xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            People – CS Thesis 2 Space
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-300 hover:text-white"
          >
            <FiChevronLeft className="mr-1" />
            Back
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-10 mt-8">
          {/* ADMIN */}
          <h2 className="text-lg font-semibold mb-2">Admin</h2>
          <hr className="border-white/10 mb-4" />

          <div className="flex items-center space-x-4 mb-8">
            <img
              src={admin.src}
              alt={admin.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="text-sm">{admin.name}</span>
          </div>

          {/* MEMBERS */}
          <h2 className="text-lg font-semibold mb-2">Members</h2>
          <hr className="border-white/10 mb-4" />

          <div className="space-y-5">
            {members.map((member, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
                  src={member.src}
                  alt={member.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfPeoplePage;
